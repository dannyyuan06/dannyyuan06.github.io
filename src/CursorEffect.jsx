import { useEffect, useRef } from 'react';

const INTERACTIVE_SELECTOR = 'a, button, [role="button"]';
const INTERACTIVE_BRIDGE_DISTANCE = 24;
const ARTWORK_CONTRAST_THRESHOLD = 62;
const artworkCanvasCache = new WeakMap();

function parseRgb(color) {
  const channels = color.match(/[\d.]+/g)?.map(Number);
  return channels?.length >= 3 ? channels.slice(0, 3) : [255, 250, 211];
}

function getArtworkContext(image) {
  if (artworkCanvasCache.has(image)) return artworkCanvasCache.get(image);
  if (!image.complete || !image.naturalWidth || !image.naturalHeight) return null;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    artworkCanvasCache.set(image, context);
    return context;
  } catch {
    artworkCanvasCache.set(image, null);
    return null;
  }
}

function isOverContrastyArtwork(x, y) {
  const background = parseRgb(getComputedStyle(document.body).backgroundColor);

  for (const image of document.querySelectorAll('.floating-letter')) {
    const rect = image.getBoundingClientRect();
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) continue;

    const context = getArtworkContext(image);
    if (!context) continue;

    const pixelX = Math.min(
      context.canvas.width - 1,
      Math.max(0, Math.floor(((x - rect.left) / rect.width) * context.canvas.width)),
    );
    const pixelY = Math.min(
      context.canvas.height - 1,
      Math.max(0, Math.floor(((y - rect.top) / rect.height) * context.canvas.height)),
    );
    const [red, green, blue, alpha] = context.getImageData(pixelX, pixelY, 1, 1).data;
    const effectiveAlpha = (alpha / 255) * (parseFloat(getComputedStyle(image).opacity) || 1);
    if (effectiveAlpha < 0.1) continue;

    const displayed = [red, green, blue].map(
      (channel, index) => channel * effectiveAlpha + background[index] * (1 - effectiveAlpha),
    );
    const colorDistance = Math.hypot(
      displayed[0] - background[0],
      displayed[1] - background[1],
      displayed[2] - background[2],
    );

    if (colorDistance >= ARTWORK_CONTRAST_THRESHOLD) return true;
  }

  return false;
}

function distanceFromPointToRect(x, y, rect) {
  const horizontalDistance = Math.max(rect.left - x, 0, x - rect.right);
  const verticalDistance = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(horizontalDistance, verticalDistance);
}

function findNearbyInteractive(x, y, previousTarget) {
  let nearestTarget = null;
  let nearestDistance = INTERACTIVE_BRIDGE_DISTANCE;

  for (const target of document.querySelectorAll(INTERACTIVE_SELECTOR)) {
    if (target === previousTarget) continue;

    const rect = target.getBoundingClientRect();
    if (rect.width <= 5 || rect.height <= 5) continue;

    const distance = distanceFromPointToRect(x, y, rect);
    if (distance <= nearestDistance) {
      nearestTarget = target;
      nearestDistance = distance;
    }
  }

  return nearestTarget;
}

function getTextCursorHeight(x, y, eventTarget) {
  const editable = eventTarget.closest?.(
    'textarea, input:not([type]), input[type="text"], input[type="search"], input[type="email"], input[type="url"], input[type="tel"], input[type="password"], [contenteditable="true"]',
  );

  if (editable) {
    const style = getComputedStyle(editable);
    const lineHeight = parseFloat(style.lineHeight);
    const fontSize = parseFloat(style.fontSize) || 16;
    return Math.min(64, Math.max(16, lineHeight || fontSize * 1.25));
  }

  const caret = document.caretPositionFromPoint?.(x, y);
  const fallbackRange = !caret ? document.caretRangeFromPoint?.(x, y) : null;
  const textNode = caret?.offsetNode ?? fallbackRange?.startContainer;

  if (!textNode || textNode.nodeType !== Node.TEXT_NODE || !textNode.textContent.trim()) {
    return null;
  }

  const parent = textNode.parentElement;
  if (
    !parent ||
    parent.closest(INTERACTIVE_SELECTOR) ||
    getComputedStyle(parent).userSelect === 'none'
  ) {
    return null;
  }

  const range = document.createRange();
  range.selectNodeContents(textNode);

  for (const rect of range.getClientRects()) {
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return Math.min(64, Math.max(16, rect.height + 2));
    }
  }

  return null;
}

export default function CursorEffect() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const current = { x: -30, y: -30, width: 18, height: 18, radius: 15 };
    let destination = { ...current };
    let restingDestination = { ...current };
    let hoveredTarget = null;
    let hoveredRadius = 6;
    let animationFrame = null;
    let isInitialPosition = true;
    let isPressed = false;
    let isBridging = false;
    let isOverText = false;
    let pointerPosition = { x: -30, y: -30 };

    const draw = () => {
      cursor.style.width = `${current.width}px`;
      cursor.style.height = `${current.height}px`;
      cursor.style.borderRadius = `${current.radius}px`;
      cursor.style.transform = `translate3d(${current.x - current.width / 2}px, ${current.y - current.height / 2}px, 0)`;
    };

    const applyPressedState = () => {
      const scale = isPressed && !isOverText ? (hoveredTarget ? 0.96 : 16 / 18) : 1;
      destination = {
        ...restingDestination,
        width: restingDestination.width * scale,
        height: restingDestination.height * scale,
        radius: restingDestination.radius * scale,
      };
    };

    const readTargetBounds = () => {
      if (!hoveredTarget) return;
      if (!hoveredTarget.isConnected) {
        hoveredTarget = null;
        cursor.classList.remove('custom-cursor--interactive');
        restingDestination = {
          ...pointerPosition,
          width: 18,
          height: 18,
          radius: 9,
        };
        applyPressedState();
        return;
      }

      const rect = hoveredTarget.getBoundingClientRect();
      restingDestination = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width + 10,
        height: rect.height + 10,
        radius: hoveredRadius,
      };
      applyPressedState();
    };

    const animate = () => {
      animationFrame = null;
      readTargetBounds();

      const easing = reducedMotion.matches ? 1 : 0.28;
      let settled = true;

      for (const property of Object.keys(current)) {
        const difference = destination[property] - current[property];
        if (Math.abs(difference) > 0.05) {
          current[property] += difference * easing;
          settled = false;
        } else {
          current[property] = destination[property];
        }
      }

      draw();

      // Keep tracking an interactive element while its own hover animation moves it.
      if (!settled || hoveredTarget) animationFrame = requestAnimationFrame(animate);
    };

    const requestCursorFrame = () => {
      if (animationFrame === null) animationFrame = requestAnimationFrame(animate);
    };

    const resetCursor = (x, y) => {
      hoveredTarget = null;
      isBridging = false;
      isOverText = false;
      cursor.classList.remove('custom-cursor--interactive');
      cursor.classList.remove('custom-cursor--text');
      restingDestination = { x, y, width: 18, height: 18, radius: 9 };
      applyPressedState();

      if (isInitialPosition) {
        Object.assign(current, destination);
        isInitialPosition = false;
        draw();
      }

      requestCursorFrame();
    };

    const handlePointerMove = (event) => {
      if (event.pointerType === 'touch') return;

      pointerPosition = { x: event.clientX, y: event.clientY };
      cursor.classList.add('custom-cursor--visible');
      cursor.classList.toggle(
        'custom-cursor--over-artwork',
        isOverContrastyArtwork(event.clientX, event.clientY),
      );
      let target = event.target.closest?.(INTERACTIVE_SELECTOR);

      if (!target) {
        const textHeight = getTextCursorHeight(event.clientX, event.clientY, event.target);
        if (textHeight !== null) {
          hoveredTarget = null;
          isBridging = false;
          isOverText = true;
          cursor.classList.remove('custom-cursor--interactive');
          cursor.classList.add('custom-cursor--text');
          restingDestination = {
            x: event.clientX,
            y: event.clientY,
            width: 3,
            height: textHeight,
            radius: 1.5,
          };
          applyPressedState();

          if (isInitialPosition) {
            Object.assign(current, destination);
            isInitialPosition = false;
            draw();
          }

          requestCursorFrame();
          return;
        }
      }

      // Bridge a genuine gap between adjacent links without changing the
      // normal leave animation when there is no other link nearby.
      if (!target && hoveredTarget) {
        if (isBridging) {
          const hoveredRect = hoveredTarget.getBoundingClientRect();
          if (
            distanceFromPointToRect(event.clientX, event.clientY, hoveredRect) <=
            INTERACTIVE_BRIDGE_DISTANCE
          ) {
            target = hoveredTarget;
          }
        } else {
          target = findNearbyInteractive(event.clientX, event.clientY, hoveredTarget);
          isBridging = target !== null;
        }
      } else if (target) {
        isBridging = false;
      }

      if (!target) {
        resetCursor(event.clientX, event.clientY);
        return;
      }

      const rect = target.getBoundingClientRect();
      if (rect.width <= 5 || rect.height <= 5) {
        resetCursor(event.clientX, event.clientY);
        return;
      }

      hoveredTarget = target;
      isOverText = false;
      const targetRadius = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;
      hoveredRadius = Math.min(30, Math.max(15, targetRadius));
      cursor.classList.remove('custom-cursor--text');
      cursor.classList.add('custom-cursor--interactive');
      readTargetBounds();

      if (isInitialPosition) {
        Object.assign(current, destination);
        isInitialPosition = false;
        draw();
      }

      requestCursorFrame();
    };

    const handlePointerDown = (event) => {
      if (event.pointerType === 'touch') return;
      isPressed = true;
      applyPressedState();
      requestCursorFrame();
    };
    const handlePointerUp = () => {
      isPressed = false;
      applyPressedState();
      requestCursorFrame();
    };
    const hideCursor = () => cursor.classList.remove('custom-cursor--visible');

    document.body.classList.add('custom-cursor-enabled');
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    document.documentElement.addEventListener('mouseleave', hideCursor);
    window.addEventListener('blur', hideCursor);

    return () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      document.body.classList.remove('custom-cursor-enabled');
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      document.documentElement.removeEventListener('mouseleave', hideCursor);
      window.removeEventListener('blur', hideCursor);
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor" aria-hidden="true" />;
}
