import currentTool, { getCurrentTool } from "./toolbar.js"
import { shiftLength, shiftPoints, inverseShiftPoints } from "./isomaths.js";
import { lineMouseDownHandler, lineMouseMoveHandler, lineMouseUpHandler, startLine } from "./line.js";
import { osuLineMouseMoveHandler, osuMouseClickHandler, osuStartLine } from "./osuline.js";
import { colorAutosave } from "./colorpicker.js";
import "./undoRedoStack.js"
import "./cut.js"
import "./layers.js"
import "./colorpicker.js"

export const canvasContainer = document.getElementById("drawing-canvas");
export let canvasContainerRect = canvasContainer.getBoundingClientRect();
export const canvas = document.getElementById('isometricCanvas');
export const ctx = canvas.getContext('2d');
export const svg = document.getElementById('svgCanvas');
export const controls = document.getElementById("controls")
export const background = document.getElementById('background');
export const img1 = document.getElementById('img1');

export const objects = [background, controls];

export const initDotSpacing = 10;
export const zoomFactor = 0.3;

export let width, height;
export let dotSpacing = initDotSpacing;
export let relativeDotSpacing = dotSpacing * 2;
export let dpr = window.devicePixelRatio || 1;
export let offsetX = 0, offsetY = 0;
export let zoomLevel = 1;
export let mouseX = 0, mouseY = 0;
export let nearestPointX = 0, nearestPointY = 0;
export let mouseDown = false;

export let crossPointer = false;
export let selectedWindow = "canvas"

export const sqrt3 = Math.sqrt(3);
export const canvasHeight = 360;
export const canvasWidth = 270;
export const canvasRatio = canvasWidth / canvasHeight
export const splitTwo = 5;
export const mouseSnapRangePercentage = 1/4

// Getters and setters
export const getSVG = () => svg
export const getCanvas = () => canvas

export const getSelectedWindow = () => selectedWindow
export const setSelectedWindow = x => selectedWindow = x


// Main
// MARK: Loading
window.addEventListener("load", function() {
  const prevSVGHTML = localStorage.getItem("file")
  if (prevSVGHTML) svg.innerHTML = prevSVGHTML

  const prevBackgroundHTML = localStorage.getItem("background")
  if (prevBackgroundHTML) background.innerHTML = prevBackgroundHTML

  // img1.style.width = `${286/canvasWidth*100}%`;
  // img1.style.left = `${143/canvasWidth*100}%`;
  // img1.style.top = `${(-3+180)/canvasHeight*100}%`;

  // img1.setAttribute("width-data",286)
  // img1.setAttribute("height-data",360)
  // img1.setAttribute("left-data",143)
  // img1.setAttribute("top-data",-3+180)

  const halfWindowWidth = canvasContainerRect.width / 2;
  const halfWindowHeight = canvasContainerRect.height / 2;
  offsetX = halfWindowWidth - shiftLength(canvasWidth) / 2;
  offsetY = halfWindowHeight - shiftLength(canvasHeight) / 2;
  mouseX = halfWindowWidth;
  mouseY = halfWindowHeight;
  svg.setAttribute("viewBox", `0 0 ${canvasWidth} ${canvasHeight}`);
  renderCanvas();
});

// MARK: Mouse Handlers
const toolMouseDownEventListners = {
  "line": lineMouseDownHandler,
  "osuline": () => {},
  "scissor": () => {},
  "select": () => {}
}

const toolMouseUpEventListners = {
  "line": lineMouseUpHandler,
  "osuline": osuMouseClickHandler,
  "scissor": () => {},
  "select": () => {}
}

const mouseDownHandler = e => {
  mouseDown = true
  setSelectedWindow("canvas")
  toolMouseDownEventListners[getCurrentTool()](e, canvas, canvasContainerRect, svg)
}

const mouseUpHandler = e => {
  mouseDown = false
  toolMouseUpEventListners[getCurrentTool()](e, canvas, canvasContainerRect, svg)
}

canvasContainer.addEventListener("mousedown", mouseDownHandler);
document.addEventListener("mouseleave", mouseUpHandler);
document.addEventListener("mouseup", mouseUpHandler);


// MARK: Drawing Dots
function renderCanvas() {
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = '#000';

  const lightLines = 0.03;
  const darkLines = 0.1;
  
  // ~~ is floor weirdly
  for (let i = ~~(-width / sqrt3); i < (width * 2 / dotSpacing + 1) + (height / dotSpacing + 4); i++) {
    const x = i * dotSpacing * sqrt3;
    // Genuinly, I tried some combinations of maths for 2 hours until this 
    // thing worked. I have no idea why it works but it does.
    const isometricStartX = x + offsetX % (sqrt3 * dotSpacing);
    const isometricStartY = offsetY % (2 * dotSpacing) - dotSpacing * 2;

    const isometricEndY = isometricStartY + height + dotSpacing * 5;
    const isometricEnd1X = isometricStartX + (height + dotSpacing * 5) * sqrt3;
    const isometricEnd2X = isometricStartX - (height + dotSpacing * 5) * sqrt3;

    // Draw Lines
    ctx.lineWidth = 2;

    const relativeFiveX = ~~(offsetX / (sqrt3 * dotSpacing)); // ~~ means Math.floor ... kind of
    const relativeFiveY = ~~(offsetY / dotSpacing / 2);

    const HSDarkX = (relativeFiveX - i) % 5 == 0;
    const HSDarkOffsetX = (relativeFiveX + 2 - i) % 5 == 0;
    const HSDarkY1 = (relativeFiveX - i - (2 * relativeFiveY) % 5 + 3) % 5 == 0;
    const HSDarkY2 = (relativeFiveX - i + (2 * relativeFiveY) % 5 + 2) % 5 == 0;

    // 120 deg line
    ctx.strokeStyle = `rgba(0, 0, 0, ${(HSDarkY1 ? darkLines : lightLines)}`;
    ctx.beginPath();
    ctx.moveTo(isometricStartX, isometricStartY);
    ctx.lineTo(isometricEnd1X, isometricEndY);
    ctx.stroke();

    // 240 deg line
    ctx.strokeStyle = `rgba(0, 0, 0, ${(HSDarkY2 ? darkLines : lightLines)}`;
    ctx.beginPath();
    ctx.moveTo(isometricStartX, isometricStartY);
    ctx.lineTo(isometricEnd2X, isometricEndY);
    ctx.stroke();

    // Draw Vertical lines
    if (i > -2 && i < width / sqrt3 / dotSpacing + 1) {
      ctx.strokeStyle = `rgba(0, 0, 0, ${(HSDarkX ? darkLines : lightLines)}`;
      ctx.beginPath();
      ctx.moveTo(isometricStartX, isometricStartY);
      ctx.lineTo(isometricStartX, isometricEndY);
      ctx.stroke();

      ctx.strokeStyle = `rgba(0, 0, 0, ${(HSDarkOffsetX ? darkLines : lightLines)}`;
      ctx.beginPath();
      ctx.moveTo(isometricStartX + dotSpacing * sqrt3 / 2, isometricStartY);
      ctx.lineTo(isometricStartX + dotSpacing * sqrt3 / 2, isometricEndY);
      ctx.stroke();
    }
  }
  
  // Draw points
  for (let i = -2; i < width / sqrt3 / dotSpacing + 4; i++) {
    for (let j = -2; j < height / dotSpacing + 4; j++) {
      const x = i * dotSpacing * sqrt3;
      const y = j * dotSpacing;

      const isometricX = x + offsetX % (sqrt3 * dotSpacing);
      const isometricY = y + offsetY % (2 * dotSpacing);

      if (isometricX >= -dotSpacing && isometricX <= width + dotSpacing &&
        isometricY >= -dotSpacing && isometricY <= height + dotSpacing) {
        ctx.fillStyle = `rgba(0, 0, 0, ${dotSpacing / 150})`;
        ctx.beginPath();
        ctx.arc(isometricX, isometricY, 2, 0, Math.PI * 2);
        ctx.arc(isometricX + dotSpacing * sqrt3 / 2, isometricY + dotSpacing / 2, 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  
  // Shift Point Test 

  // ctx.fillStyle = "blue"
  // ctx.beginPath();
  // ctx.arc(offsetX, offsetY, 5, 0, Math.PI * 2);
  // ctx.closePath();
  // ctx.fill();

  // const positionX = 2*sqrt3
  // const positionY = 6

  // const [xPrime, yPrime] = shiftPoints(positionX, positionY)

  // ctx.fillStyle = "red"
  // ctx.beginPath();
  // ctx.arc(xPrime, yPrime, 5, 0, Math.PI * 2);
  // ctx.closePath();
  // ctx.fill();

  const actualCanvasWidth = shiftLength(canvasWidth);
  const actualCanvasHeight = shiftLength(canvasHeight);

  svg.style.left = `${offsetX}px`;
  svg.style.top = `${offsetY}px`;
  svg.setAttribute("width", actualCanvasWidth);
  svg.setAttribute("height", actualCanvasHeight);

  objects.forEach(object => {
    object.style.left = `${offsetX}px`;
    object.style.top = `${offsetY}px`;
    object.style.width = `${actualCanvasWidth}px`;
    object.style.height = `${actualCanvasHeight}px`;
  });

  // img1.style.width = `${shiftLength(286)}px`;
  // img1.style.left = `${shiftLength(0)}px`;
  // img1.style.top = `${shiftLength(-3)}px`;
}

canvasContainer.addEventListener('wheel', function (event) {
  event.preventDefault();
  if (event.deltaY % 1 != 0 && event.deltaX == 0 && relativeDotSpacing - event.deltaY > 0 && relativeDotSpacing - event.deltaY < 500) {
    const zoomAmount = (event.deltaY < 7 ? event.deltaY : 6) * zoomFactor;
    const displacementX = offsetX - mouseX;
    const displacementY = offsetY - mouseY;
    offsetX -= displacementX / dotSpacing * zoomAmount;
    offsetY -= displacementY / dotSpacing * zoomAmount;

    relativeDotSpacing -= zoomAmount;

    dotSpacing -= zoomAmount;
    if (dotSpacing < initDotSpacing) {
      dotSpacing *= splitTwo;
      zoomLevel--;
    }
    if (dotSpacing >= initDotSpacing * splitTwo) {
      dotSpacing /= splitTwo;
      zoomLevel++;
    }
  }
  else if (event.deltaY % 1 == 0) {
    // TODO: Change this for later.
    if (offsetX - event.deltaX < shiftLength(canvasWidth)*3 && offsetX - event.deltaX > -shiftLength(canvasWidth)) offsetX -= event.deltaX * window.innerWidth * 0.001;
    if (offsetY - event.deltaY < shiftLength(canvasHeight)*3 && offsetY - event.deltaY > -shiftLength(canvasHeight)) offsetY -= event.deltaY * window.innerWidth * 0.001;
  }
  renderCanvas();

});

// MARK: Mouse move
canvasContainer.addEventListener('mousemove', function (event) {
  mouseX = event.clientX - canvasContainerRect.left;
  mouseY = event.clientY - canvasContainerRect.top;
  crossPointer = false;
  // Check if mouse is close to any dot
  let minPoint = [9999999, 0, 0];
  for (let i = -2; i < width / sqrt3 / dotSpacing + 4; i++) {
    for (let j = -2; j < height / dotSpacing + 4; j++) {
      const x = i * dotSpacing * sqrt3;
      const y = j * dotSpacing;

      let isometricX1 = x + offsetX % (sqrt3 * dotSpacing);
      let isometricY1 = y + offsetY % (2 * dotSpacing);

      let isometricX2 = isometricX1 + dotSpacing * sqrt3 / 2;
      let isometricY2 = isometricY1 + dotSpacing / 2;

      // First point per loop
      let distance = Math.hypot(mouseX - isometricX1, mouseY - isometricY1);

      if (minPoint[0] > distance) {
        minPoint[0] = distance;
        minPoint[1] = isometricX1;
        minPoint[2] = isometricY1;
      }

      if (distance < dotSpacing * mouseSnapRangePercentage) {
        crossPointer = true;
        break;
      }

      // Second point per loop
      distance = Math.hypot(mouseX - isometricX2, mouseY - isometricY2);

      if (minPoint[0] > distance) {
        minPoint[0] = distance;
        minPoint[1] = isometricX2;
        minPoint[2] = isometricY2;
      }

      if (distance < dotSpacing * mouseSnapRangePercentage) {
        crossPointer = true;
        break;
      }
    }
    if (crossPointer) break;
  }

  [nearestPointX, nearestPointY] = inverseShiftPoints(minPoint[1], minPoint[2]);

  // Line tool
  if (getCurrentTool() == "line") {
    lineMouseMoveHandler(nearestPointX, nearestPointY, mouseX, mouseY)
    canvasContainer.style.cursor = (crossPointer || startLine) && getCurrentTool() === "line" ? 'crosshair' : 'default';
  }
  if (getCurrentTool() == "osuline") {
    osuLineMouseMoveHandler(nearestPointX, nearestPointY, mouseX, mouseY)
    canvasContainer.style.cursor = 'crosshair';
  }
});

// Save
function save() {
  const backgroundHTML = background.innerHTML
  localStorage.setItem("background", backgroundHTML)
  const svgHTML = svg.innerHTML
  localStorage.setItem("file", svgHTML);
  colorAutosave()
  console.log("Autosave Completed");
}

document.addEventListener("keydown", function (event) {
  if (event.key == "s" && (event.ctrlKey || event.metaKey)) { // Undo
    event.preventDefault()
    save()
  }
})

// Auto Save 
setInterval(save, 1000*20) // 1 min



// Device Pixel Ratio 

function resizeCanvas() {
  canvasContainerRect = canvasContainer.getBoundingClientRect();
  width = canvasContainerRect.width;
  height = canvasContainerRect.height;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);
  renderCanvas();
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();

