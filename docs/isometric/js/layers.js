import { relativePercentagesX, relativePercentagesY } from "./isomaths.js";
import { canvasHeight, canvasWidth, getSelectedWindow, setSelectedWindow } from "./script.js";
import { onSelectDeselected, onSelectSelected } from "./select.js";
import { getCurrentTool } from "./toolbar.js";
import { addToUndoStack } from "./undoRedoStack.js";

const svg = document.getElementById("svgCanvas");
const background = document.getElementById("background")
const layerContainer = document.getElementById("layers-container")

let currentLayer = svg.children.length != 0 ? svg.children[0].getAttribute("id") : "None"
let isSvg = true

// MARK:The Eye
export const getCurrentLayer = () => currentLayer
export const setCurrentLayer = (x) => {
  currentLayer = x
  const currentLayerEl = document.getElementById(x)
  
  isSvg = currentLayerEl ? currentLayerEl.tagName.toLowerCase() === "g" : false

  // Select tool
  onSelectDeselected()
  if (getCurrentTool() === "select") onSelectSelected(currentLayerEl)

  // Opacity of Layer
  opacitySetUp(currentLayerEl)

  
  // layer window
  updateLayers()
}

export const getIsSvg = () => isSvg


function hideEl(e, eyeHidden) {
  const el = document.getElementById(e)
  el.classList.toggle("hide")
  eyeHidden.setAttribute("class", el.classList.contains("hide") ? "eye-hidden": "eye-hidden hide")
}

function isometric() {
  const layerEl = document.createElement("div")
  layerEl.style.border = ""
  layerEl.classList.add("layer")
  layerEl.classList.add("isometric-layer")
  layerEl.setAttribute("data", "isometricCanvas")

  // Eye - Hidden
  const eyeEl = document.createElement("div")
  eyeEl.classList.add("layer-eye")
  eyeEl.innerHTML = `
    <img src="images/eye.png"/>
  `
  const eyeHidden = document.createElement("div")
  eyeHidden.classList.add("eye-hidden")
  eyeHidden.classList.add("hide")
  eyeEl.appendChild(eyeHidden)

  eyeEl.onclick = () => {
    hideEl("isometricCanvas", eyeHidden)
  }
  layerEl.appendChild(eyeEl)

  // Right
  const clickLayer = document.createElement("div")
  clickLayer.innerHTML = `
    <img class="isometric-thumbnail" src="images/iso.png"/>
    <div>Isometric</div>
  `
  clickLayer.classList.add("right-layer")
  clickLayer.onclick = () => setCurrentLayer("isometricCanvas")

  layerEl.appendChild(clickLayer)
  return layerEl
} 

function elementToLayer(el) {
  const layerEl = document.createElement("div")
  const img = el.tagName.toLowerCase() === "g" ? `
  <svg
    viewBox="0 0 ${canvasWidth} ${canvasHeight}"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    class="thumbnail"
  >
    <g>
      ${el.innerHTML}
    </g>
  </svg>` :
  `<img class="thumbnail" src="${el.getAttribute("src")}"/>`
  layerEl.style.border = ""
  layerEl.classList.add("layer")
  layerEl.setAttribute("data", el.getAttribute("id"))
  layerEl.setAttribute("layer-type", el.tagName.toLowerCase())
  layerEl.onmousedown = mouseDownHandler

  // Eye - Hidden
  const eyeEl = document.createElement("div")
  eyeEl.classList.add("layer-eye")
  eyeEl.innerHTML = `
    <img src="images/eye.png"/>
  `
  const eyeHidden = document.createElement("div")
  eyeHidden.setAttribute("class", el.classList.contains("hide") ? "eye-hidden": "eye-hidden hide")
  eyeEl.appendChild(eyeHidden)

  eyeEl.onclick = () => {
    hideEl(el.getAttribute("id"), eyeHidden)
  }
  layerEl.appendChild(eyeEl)

  // Right side
  const clickLayer = document.createElement("div")
  clickLayer.innerHTML = `
    ${img}
    <div>${el.getAttribute("id")}</div>
  `
  clickLayer.classList.add("right-layer")
  clickLayer.onclick = () => {
    setSelectedWindow("layers")
    setCurrentLayer(el.getAttribute("id"))
  }


  clickLayer.ondragover = e => {
    console.log(e.movementX);
  }

  layerEl.appendChild(clickLayer)
  return layerEl
}

function updateThumbnails() {
  layerContainer.innerHTML = ""
  currentLayer = currentLayer ?? (svg.children.length != 0 ? svg.children[0].getAttribute("id") : "None")
  let backgroundLayers = []
  let foregroundLayers = []

  const backgroundElements = background.children
  for (let i=0;i<backgroundElements.length;i++) {
    backgroundLayers.push(backgroundElements[i]);
  }

  const foregroundElements = svg.children
  for (let i=0;i<foregroundElements.length;i++) {
    foregroundLayers.push(foregroundElements[i]);
  }

  const backgroundLayerElements = backgroundLayers.map(elementToLayer)
  const foregroundLayerElements = foregroundLayers.map(elementToLayer)

  backgroundLayerElements.forEach(el => {
    layerContainer.appendChild(el)
  })

  layerContainer.appendChild(isometric())
  foregroundLayerElements.forEach(el => {
    layerContainer.appendChild(el)
  })
  updateLayers()
}

export function updateLayers() {
  const layers = layerContainer.children
  for (let i=0;i<layers.length;i++) {
    const layer = layers[i]
    if (layer.getAttribute("data") === currentLayer) layer.style.borderColor = "rgba(255, 255, 255, 0.7)"
    else layer.style.border = ""
  }
}

// MARK: Opacity

const opacityInput = document.getElementById("opacity-input")

const opacitySetUp = (newLayer) => {
  const computedOpacity = window.getComputedStyle(newLayer).getPropertyValue("opacity")
  opacityInput.value = computedOpacity * 100;
}

opacityInput.addEventListener("input", e => {
  const opacityValue = Math.max(Math.min(opacityInput.value, 100), 0)
  const currentLayer = document.getElementById(getCurrentLayer())
  currentLayer.style.opacity = opacityValue/100
})

opacityInput.addEventListener("focus", () => setSelectedWindow("opacity"))


// MARK: New Layers
const addLayerButton = document.getElementById("layer-add-button")
addLayerButton.onclick = () => {
  const svg = document.getElementById("svgCanvas");
  const svgChildren = [...svg.children];
  const layerNames = svgChildren.map(child => child.id.toLowerCase())
  const matches = layerNames.map(layerName => [layerName, layerName.match(/layer \d+/)[0] ?? ""])
  const correctMatches = matches.filter(([layerName, layerMatch]) => layerName == layerMatch)
  const singleDimension = correctMatches.map(correctMatch => correctMatch[0])
  const highestDimension = singleDimension.reduce((prev, curr) => parseInt(curr.match(/\d+/)[0]) > prev ? parseInt(curr.match(/\d+/)[0]) : prev, 0)
  const newHighestDimension = highestDimension+1
  const newLayer = document.createElementNS("http://www.w3.org/2000/svg","g")
  newLayer.id = `Layer ${newHighestDimension}`
  svg.appendChild(newLayer)
  setCurrentLayer(newLayer.id)
  updateThumbnails()
}

// MARK: Upload Layers
const uploadLayerButton = document.getElementById("layer-upload-button")
uploadLayerButton.onclick = () => {
  const input = document.getElementById("image-input")
  input.click()
}

const imageInput = document.getElementById("image-input")
imageInput.onchange = () => {
    if (imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        reader.fileName = file.name
        reader.onloadend = e => {
          const imageUrl = reader.result;
          const imgElement = document.createElement('img');
          imgElement.src = imageUrl;
          const background = document.getElementById("background");
          const backgroundChildren = [...background.children];
          const fileName = e.target.fileName.split(".")[0];
          const layerNumbers = backgroundChildren.map(child => parseInt(child.id.toLowerCase().replace("filename", "")));
          const highestLayer = layerNumbers.reduce((prev, layerNumber) => layerNumber > prev ? layerNumber : prev, -1 );
          const newHighest = highestLayer + 1;
          
          const image = new Image()
          image.src = imageUrl;

          image.onload = function () {
            const newLayer = document.createElement("img");
            newLayer.id = highestLayer === -1 ? fileName :`${fileName} ${newHighest}`;
            newLayer.src = imageUrl;
            const ratio =  this.width / this.height
            const height = Math.min(this.height, canvasHeight);
            const width = height*ratio;
            newLayer.setAttribute("width-data",width)
            newLayer.setAttribute("height-data",height)
            newLayer.setAttribute("left-data",canvasWidth*.5)
            newLayer.setAttribute("top-data",canvasHeight*.5)
            newLayer.setAttribute("origin-x-data",.5)
            newLayer.setAttribute("origin-y-data",.5)
            newLayer.style.height = `${relativePercentagesY(height)}%`
            newLayer.style.width = `${relativePercentagesX(width)}%`
            newLayer.style.transform = "translate(-50%, -50%)"
            newLayer.style.left = `50%`;
            newLayer.style.top = `50%`;
            background.appendChild(newLayer);
            updateThumbnails();
          }
          
        };
        reader.readAsDataURL(event.target.files[0]);
    }
}


// MARK: Delete
document.addEventListener("keydown", function (event) {
  const key = event.key;
  if (key === "Backspace" || key === "Delete") {
    if (getSelectedWindow() !== "layers") return
    const currentLayerName = getCurrentLayer()
    const currentLayer = document.getElementById(currentLayerName)
    const nextElement = currentLayer.nextElementSibling
    const nextElName = nextElement ? nextElement.id : ""
    const parentEl = currentLayer.parentElement.id
    currentLayer.remove()
    updateThumbnails()

    const undoFunction = ([layer, nextElement, parent]) => {
      const parentEl = document.getElementById(parent)
      const nextEl = nextElement ? document.getElementById(nextElement): null
      
      if (nextEl) {
        parentEl.insertBefore(layer, nextEl)
      }
      else {
        parentEl.appendChild(layer)
      }
      updateThumbnails()
    }

    const redoFunction = ([layer]) => {
      layer.remove()
      updateThumbnails()
    }
    addToUndoStack([undoFunction, redoFunction, [currentLayer, nextElName, parentEl]])
}
})

// MARK: Rearranging
let mouseDownLayer = null
let focusedLayer = null
let nextLayer = null
let prevY = NaN

const rearrangingIdentifier = document.createElement("div")
rearrangingIdentifier.id = "rearranging-identifier"

// This is added above in when the elements are added
const mouseDownHandler = e => {
  const layer = e.currentTarget
  nextLayer = layer.nextElementSibling
  focusedLayer = layer
  const layerBox = layer.getBoundingClientRect()
  mouseDownLayer = layer.cloneNode(true)
  mouseDownLayer.id = "rearranging-layer"
  mouseDownLayer.style.position = "absolute"
  mouseDownLayer.style.top = `${layer.offsetTop}px`
  mouseDownLayer.style.width = `${layer.clientWidth}px`
  mouseDownLayer.style.opacity = 0.7
  mouseDownLayer.style.pointerEvents = "none"
  
}

const mouseMoveHandler = e => {
  if (!mouseDownLayer) return
  if (!focusedLayer) return
  if (isNaN(prevY)) {
    focusedLayer.style.opacity = 0.5
    prevY = e.clientY
    layerContainer.appendChild(mouseDownLayer)
    layerContainer.appendChild(rearrangingIdentifier)
    rearrangingIdentifier.style.opacity = 0
    layerContainer.style.cursor = "grab"
    return
  }
  if (!mouseDownLayer) return

  const layerType = focusedLayer.getAttribute("layer-type")

  const range = 8
  
  // Get Parent which is layer
  const cascadeParents = (el) => {
    let cur = el
    // limit to 5 epochs bc i don't trust using a while loop and 5 should be enough
    for (let i=0;i<5;i++) {
      
      if (cur.classList.contains("layer")) {
        return cur
      }
      if (cur.id === "layers-wrapper") return null
      cur = el.parentNode
    }
    return null
  }

  // If close to the top or bottom of layer
  const closenessUp = Math.abs(e.offsetY) < range
  const closenessDown = Math.abs(e.target.clientHeight - e.offsetY) < range
  nextLayer = null
  rearrangingIdentifier.style.opacity = 0
  if (closenessUp) {
    const layerAfter = cascadeParents(e.target)
    if (layerAfter) {
      if (layerAfter.getAttribute("layer-type") === layerType) {
        rearrangingIdentifier.style.opacity = 1
        rearrangingIdentifier.style.top = `${layerAfter.offsetTop}px`
        nextLayer = layerAfter
      }
    }
  }
  else if (closenessDown) {
    const layerBefore = cascadeParents(e.target)
    if (layerBefore) {
      if (layerBefore.getAttribute("layer-type") === layerType) {
        const layerAfter = layerBefore.nextElementSibling
        rearrangingIdentifier.style.opacity = 1
        if (layerAfter && layerAfter.id !== "rearranging-layer") {
          rearrangingIdentifier.style.top = `${layerAfter.offsetTop}px`
          nextLayer = layerAfter
        }
        else {
          rearrangingIdentifier.style.top = `${layerBefore.offsetTop + layerBefore.clientHeight}px`
        }
      }
    }
  }
  else if (e.target.id === "layers-container" && focusedLayer.getAttribute("layer-type") === "g") {
    const layerEls = document.getElementsByClassName("layer")
    const lastLayer = layerEls[layerEls.length-2]
    rearrangingIdentifier.style.opacity = 1
    rearrangingIdentifier.style.top = `${lastLayer.offsetTop + lastLayer.clientHeight}px`
    nextLayer = "after"
  }

  const deltaY = e.clientY - prevY
  mouseDownLayer.style.top = `${mouseDownLayer.offsetTop + deltaY}px`
  prevY = e.clientY
}

const mouseUpHandler = () => {
  if (!mouseDownLayer || !focusedLayer) return

  if (!prevY) {
    focusedLayer = null
    prevY = NaN
    mouseDownLayer = null
    return
  }
  focusedLayer.style.opacity = 1
  rearrangingIdentifier.remove()
  

  // Change layer on canvas then update layers
  const currLayer = document.getElementById(focusedLayer.getAttribute("data"))
  const parent = currLayer.parentElement
  
  if (nextLayer) {
    if (nextLayer === "after") {
      currLayer.remove()
      parent.appendChild(currLayer)
    }
    else {
      const afterLayer = document.getElementById(nextLayer.getAttribute("data"))
      if (afterLayer){
        if (afterLayer.id === "isometricCanvas") {
          currLayer.remove()
          parent.appendChild(currLayer)
        }
        else {
          if (afterLayer.id !== currLayer.id) {
            currLayer.remove()
            parent.insertBefore(currLayer, afterLayer)
          }
        }
      }
    }
  }
  
  updateThumbnails()
  
  // Reset
  focusedLayer = null
  prevY = NaN
  mouseDownLayer.remove()
  rearrangingIdentifier.remove()
  mouseDownLayer = null
}

document.addEventListener("mousemove", mouseMoveHandler)
document.addEventListener("mouseup", mouseUpHandler)
document.addEventListener("mouseleave", mouseUpHandler)

window.addEventListener("load", () => {
  updateThumbnails()
  opacitySetUp(document.getElementById(getCurrentLayer()))
})

setTimeout(updateThumbnails, 500);
setInterval(updateThumbnails, 1000*30)