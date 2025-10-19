const canvas = document.getElementById('colorCanvas');
const ctx = canvas.getContext('2d');
const colorSelector = document.getElementById('colorSelector');
const rgbOutput = document.getElementById('rgbOutput');
const hueContainer = document.getElementById("hueSliderContainer")
const hueSlider = document.getElementById('hueSlider');
const hueIndicator = document.getElementById('hueIndicator');
const colorCursor = document.getElementById('colorCursor')
let isDragging = false;
let prevX = 0, prevY =  0

// Resize canvas to match CSS styling
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

window.addEventListener("load", () => {
  const {h, s, v} = JSON.parse(localStorage.getItem("primaryColor")) ?? ({h: 0, s: 0, v: 0});
  prevX = s
  prevY = v
  hueSlider.value = h
  const displayBottom = Math.max(Math.min(h/360*100, 100), 0.3)
  hueIndicator.style.bottom = `${displayBottom}%`
  createGradient(h)
  updateSelectorPosition(s, v)
  updateColorOutput(s, v)
})

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
      s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }
  return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
  };
}

function createGradient(hue) {
    const width = canvas.width;
    const height = canvas.height;

    // Create a full-colour gradient
    ctx.clearRect(0, 0, width, height);

    // Colour gradient
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);

    // White gradient (vertical)
    const gradientWhite = ctx.createLinearGradient(0, 0, width, 0);
    gradientWhite.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradientWhite.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradientWhite;
    ctx.fillRect(0, 0, width, height);

    // Black gradient (horizontal)
    const gradientBlack = ctx.createLinearGradient(0, 0, 0, height);
    gradientBlack.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradientBlack.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = gradientBlack;
    ctx.fillRect(0, 0, width, height);
}

function getColorAtPosition(x, y, h) {
    const xRel = x/canvas.width
    const yRel = 1-y/canvas.height
    const hRel = parseInt(hueSlider.value)/360
    const hex = HSVtoRGB(hRel, xRel, yRel)
    return hex;
}

function updateSelectorPosition(x, y) {
    colorSelector.style.left = `${x}px`;
    colorSelector.style.top = `${y}px`;
}

function updateColorOutput(x, y) {
    const {r,g,b} = getColorAtPosition(x, y);
    rgbOutput.style.backgroundColor = `rgba(${r}, ${g}, ${b})`
}

canvas.addEventListener('mousedown', function (e) {
    isDragging = true;
    colorCursor.style.opacity = ""
    const x = e.offsetX;
    const y = e.offsetY;
    updateSelectorPosition(x, y);
    updateColorOutput(x, y);
});

document.addEventListener('mousemove', function (e) {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect()
        const width = canvas.width
        const height = canvas.height

        const x = e.clientX - Math.round(rect.x);
        const y = e.clientY - Math.round(rect.y);

        const normalisedX = x < 0 ? 0 : (x > width ? width : x)
        const normalisedY = y < 0 ? 0 : (y > height ? height : y)

        prevX = normalisedX
        prevY = normalisedY

        if (normalisedY < height / 2 && normalisedX < width / 2) colorSelector.style.borderColor = "black"
        else colorSelector.style.borderColor = "white"

        updateSelectorPosition(normalisedX, normalisedY);
        updateColorOutput(normalisedX, normalisedY);

    }
});

canvas.addEventListener("mouseenter", () => {
  colorCursor.style.opacity = 1
  
})

canvas.addEventListener("mousemove", e => {
  const x = e.offsetX;
  const y = e.offsetY;

  colorCursor.style.left = `${x}px`
  colorCursor.style.top = `${y}px`
})

canvas.addEventListener("mouseleave", () => {
  colorCursor.style.opacity = ""
})

canvas.addEventListener("mouseup", () => {
  colorCursor.style.opacity = 1
})

document.addEventListener('mouseup', function () {
    isDragging = false;
});

document.addEventListener('mouseleave', function () {
    isDragging = false;
});

hueSlider.addEventListener('input', function () {
  const displayBottom = Math.max(Math.min(this.value/360*100, 100), 0.3)
  hueIndicator.style.bottom = `${displayBottom}%`
  createGradient(this.value);
  updateColorOutput(prevX, prevY);
});

// Initial Gradient Setup
createGradient(hueSlider.value);


export const colorAutosave = () => {
  const h = hueSlider.value
  const s = prevX
  const v = prevY
  const obj = {h, s, v}
  localStorage.setItem("primaryColor", JSON.stringify(obj))
}
