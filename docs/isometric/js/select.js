import { getCurrentLayer, getIsSvg } from "./layers.js";
import { canvasHeight, canvasRatio, canvasWidth, getCanvas, offsetX, offsetY } from "./script.js"
import { relativePercentagesX, relativePercentagesY } from "./isomaths.js"
import { addToUndoStack, redoStack, resetRedoStack } from "./undoRedoStack.js";
import { getCurrentTool } from "./toolbar.js";

const controlContainer = document.getElementById("controls")
let controls = []
const controlBoxWidth = 8
let mouseDown = "false"
let ogOriginX = 0.5, ogOriginY = 0.5
let originX = 0.5, originY = 0.5
let originalRatio = 1
let originalImgL = -1
let originalImgT = -1
let originalImgW = -1
let originalImgH = -1

let img 
let prevPosX = 0, prevPosY = 0
let tl, tr, bl, br, tm, lm, rm, bm, boundingBox, centroid

// MARK:Selected
export const onSelectSelected = (el) => {
  if (boundingBox || getIsSvg()) {
    onSelectDeselected()
    return
  }
  const currentLayer = getCurrentLayer()

  const width = parseFloat(el.getAttribute("width-data"))
  const height = parseFloat(el.getAttribute("height-data"))
  const left = parseFloat(el.getAttribute("left-data"))
  const top = parseFloat(el.getAttribute("top-data"))
  originX = parseFloat(el.getAttribute("origin-x-data") ?? 0.5)
  originY = parseFloat(el.getAttribute("origin-y-data") ?? 0.5)
  ogOriginX = originX
  ogOriginY = originY

  const halfWidth = width/2
  const halfHeight = height/2

  const leftHalfX = originX*width
  const rightHalfX = (1-originX)*width
  const upHalfY = originY*height
  const downHalfY = (1-originY)*height

  originalRatio = width/height

  tl = document.createElement("div")
  tr = document.createElement("div")
  bl = document.createElement("div")
  br = document.createElement("div")
  tm = document.createElement("div")
  lm = document.createElement("div")
  rm = document.createElement("div")
  bm = document.createElement("div")
  const boxes = [tl, tr, bl, br, tm, lm, rm, bm]

  boundingBox = document.createElement("div")
  centroid = document.createElement("div")
  centroid.innerHTML = `
  <div id="dot">
  </div>
  `

  for (let i=0;i<boxes.length;i++) {
    const box = boxes[i]
    box.classList.add("select-boxes")
  }

  const setOgImg = () => {
    const width = parseFloat(el.getAttribute("width-data"))
    const height = parseFloat(el.getAttribute("height-data"))
    const left = parseFloat(el.getAttribute("left-data"))
    const top = parseFloat(el.getAttribute("top-data"))
    
    originalImgL = left
    originalImgT = top
    originalImgW = width
    originalImgH = height

    ogOriginX = originX
    ogOriginY = originY

    controlContainer.style.cursor = `${mouseDown}-resize`
    boundingBox.style.cursor = `${mouseDown}-resize`
    canvas.style.cursor = `${mouseDown}-resize`
    document.body.style.cursor = `${mouseDown}-resize`
  }

  // attributes for resizing about centroid/origin
  tl.classList.add("nwse")
  tl.setAttribute("uniform-moving-data", "nwse")
  tl.addEventListener("mousedown", () => {mouseDown = "nwse-tl"; setOgImg()})

  br.classList.add("nwse")
  br.setAttribute("uniform-moving-data", "nwse")
  br.addEventListener("mousedown", () => {mouseDown = "nwse-br"; setOgImg()})

  tr.classList.add("nesw")
  tr.setAttribute("uniform-moving-data", "nesw")
  tr.addEventListener("mousedown", () => {mouseDown = "nesw-tr"; setOgImg()})
  
  bl.classList.add("nesw")
  bl.setAttribute("uniform-moving-data", "nesw")
  bl.addEventListener("mousedown", () => {mouseDown = "nesw-bl"; setOgImg()})
  
  tm.classList.add("ns")
  tm.setAttribute("uniform-moving-data", "ns")
  tm.addEventListener("mousedown", () => {mouseDown = "ns-tm"; setOgImg()})
  
  bm.classList.add("ns")
  bm.setAttribute("uniform-moving-data", "ns")
  bm.addEventListener("mousedown", () => {mouseDown = "ns-bm"; setOgImg()})
  
  lm.classList.add("ew")
  lm.setAttribute("uniform-moving-data", "ew")
  lm.addEventListener("mousedown", () => {mouseDown = "ew-lm"; setOgImg()})
  
  rm.classList.add("ew")
  rm.setAttribute("uniform-moving-data", "ew")
  rm.addEventListener("mousedown", () => {mouseDown = "ew-rm"; setOgImg()})
  

  boundingBox.classList.add("bounding-box")
  boundingBox.addEventListener("mousedown", () => {mouseDown = "true"; setOgImg()})

  centroid.classList.add("centroid")
  centroid.addEventListener("mousedown", () => {mouseDown = "centroid"; setOgImg()})

  tl.style.left = `${relativePercentagesX(left - leftHalfX)}%`
  tl.style.top = `${relativePercentagesY(top - upHalfY)}%`
  
  tr.style.left = `${relativePercentagesX(left + rightHalfX)}%`
  tr.style.top = `${relativePercentagesY(top - upHalfY)}%`
  
  bl.style.left = `${relativePercentagesX(left - leftHalfX)}%`
  bl.style.top = `${relativePercentagesY(top + downHalfY)}%`

  br.style.left = `${relativePercentagesX(left + rightHalfX)}%`
  br.style.top = `${relativePercentagesY(top + downHalfY)}%`

  tm.style.left = `${relativePercentagesX(left + (halfWidth - leftHalfX))}%`
  tm.style.top = `${relativePercentagesY(top - upHalfY)}%`

  bm.style.left = `${relativePercentagesX(left + (halfWidth - leftHalfX))}%`
  bm.style.top = `${relativePercentagesY(top + downHalfY)}%`

  lm.style.left = `${relativePercentagesX(left - leftHalfX)}%`
  lm.style.top = `${relativePercentagesY(top + (halfHeight - upHalfY))}%`

  rm.style.left = `${relativePercentagesX(left + rightHalfX)}%`
  rm.style.top = `${relativePercentagesY(top + (halfHeight - upHalfY))}%`

  centroid.style.left = `${relativePercentagesX(left)}%`
  centroid.style.top = `${relativePercentagesY(top)}%`

  boundingBox.style.left = `${relativePercentagesX(left)}%`
  boundingBox.style.top = `${relativePercentagesY(top)}%`
  boundingBox.style.width = `${relativePercentagesX(width)}%`
  boundingBox.style.height = `${relativePercentagesY(height)}%`
  boundingBox.style.transform = `translate(${-originX*100}%, ${-originY*100}%)`
  
  controlContainer.appendChild(boundingBox)
  controlContainer.appendChild(centroid)
  for (let i=0;i<boxes.length;i++) controlContainer.appendChild(boxes[i])
  controls = boxes.concat([boundingBox, centroid])

  controlContainer.style.pointerEvents = "all"
}

// MARK:Deselected
export const onSelectDeselected = () => {
  if (controls.length !== 0) controls.forEach(control => control.remove())

  controlContainer.style.pointerEvents = ""

  controls = []
  mouseDown = "false"
  tl = undefined
  boundingBox = undefined
}
const container = document.getElementById("container")
const canvas = document.getElementById("drawing-canvas")


// MARK:Mouse Down
const downHandler = (e) => {
  img = document.getElementById(getCurrentLayer())
  prevPosX = e.clientX - canvas.getBoundingClientRect().left - offsetX
  prevPosY = e.clientY - canvas.getBoundingClientRect().top - offsetY
}

// MARK:Mouse Move
const onUpdate = (el) => {
  if (!tl) return
  const width = parseFloat(el.getAttribute("width-data"))
  const height = parseFloat(el.getAttribute("height-data"))
  const left = parseFloat(el.getAttribute("left-data"))
  const top = parseFloat(el.getAttribute("top-data"))
  const ox = parseFloat(el.getAttribute("origin-x-data"))
  const oy = parseFloat(el.getAttribute("origin-y-data"))

  const halfWidth = width/2
  const halfHeight = height/2

  const leftHalfX = ox*width
  const rightHalfX = (1-ox)*width
  const upHalfY = oy*height
  const downHalfY = (1-oy)*height

  tl.style.left = `${relativePercentagesX(left - leftHalfX)}%`
  tl.style.top = `${relativePercentagesY(top - upHalfY)}%`
  
  tr.style.left = `${relativePercentagesX(left + rightHalfX)}%`
  tr.style.top = `${relativePercentagesY(top - upHalfY)}%`
  
  bl.style.left = `${relativePercentagesX(left - leftHalfX)}%`
  bl.style.top = `${relativePercentagesY(top + downHalfY)}%`

  br.style.left = `${relativePercentagesX(left + rightHalfX)}%`
  br.style.top = `${relativePercentagesY(top + downHalfY)}%`

  tm.style.left = `${relativePercentagesX(left + (halfWidth - leftHalfX))}%`
  tm.style.top = `${relativePercentagesY(top - upHalfY)}%`

  bm.style.left = `${relativePercentagesX(left + (halfWidth - leftHalfX))}%`
  bm.style.top = `${relativePercentagesY(top + downHalfY)}%`

  lm.style.left = `${relativePercentagesX(left - leftHalfX)}%`
  lm.style.top = `${relativePercentagesY(top + (halfHeight - upHalfY))}%`

  rm.style.left = `${relativePercentagesX(left + rightHalfX)}%`
  rm.style.top = `${relativePercentagesY(top + (halfHeight - upHalfY))}%`

  centroid.style.left = `${relativePercentagesX(left)}%`
  centroid.style.top = `${relativePercentagesY(top)}%`

  boundingBox.style.left = `${relativePercentagesX(left)}%`
  boundingBox.style.top = `${relativePercentagesY(top)}%`
  boundingBox.style.width = `${relativePercentagesX(width)}%`
  boundingBox.style.height = `${relativePercentagesY(height)}%`
  boundingBox.style.transform = `translate(${-ox*100}%, ${-oy*100}%)`
}

const moveHandler = (e) => {
  if (mouseDown === "false") return
  if (!img) return
  const width = controlContainer.getBoundingClientRect().width
  const height = controlContainer.getBoundingClientRect().height
  const left = parseFloat(img.getAttribute("left-data"))
  const top = parseFloat(img.getAttribute("top-data"))

  const x = e.clientX - canvas.getBoundingClientRect().left - offsetX
  const y = e.clientY - canvas.getBoundingClientRect().top - offsetY

  // Dragging
  if (mouseDown === "true") {
    const deltaX = x - prevPosX
    const deltaY = y - prevPosY

    const actualDeltaX = deltaX/width*canvasWidth + left
    const actualDeltaY = deltaY/height*canvasHeight + top

    const relativeDeltaX = actualDeltaX/canvasWidth*100
    const relativeDeltaY = actualDeltaY/canvasHeight*100

    img.setAttribute("left-data", actualDeltaX)
    img.setAttribute("top-data", actualDeltaY)
    img.style.left = `${relativeDeltaX}%`
    img.style.top = `${relativeDeltaY}%`

    prevPosX = x
    prevPosY = y
  }
  // Change origin
  else if (mouseDown === "centroid") {
    const relativeX = x/width;
    const relativeY = y/height;

    const canvasX = relativeX*canvasWidth
    const canvasY = relativeY*canvasHeight

    const movedX = canvasX - originalImgL
    const movedY = canvasY - originalImgT

    const imgWidth = img.getAttribute("width-data")
    const imgHeight = img.getAttribute("height-data")
    const movedRelativeX = movedX/imgWidth
    const movedRelativeY = movedY/imgHeight

    const newTransformX = ogOriginX + movedRelativeX
    const newTransformY = ogOriginY + movedRelativeY

    if (Math.hypot(newTransformX - 0.5, newTransformY - 0.5) < 0.01)  {
      // Snap to centre
      const leftF = originalImgL + ((0.5-ogOriginX)*imgWidth)
      const topF = originalImgT + ((0.5-ogOriginY)*imgHeight)
      img.setAttribute("left-data", leftF)
      img.setAttribute("top-data", topF)
      img.style.left = `${relativePercentagesX(leftF)}%`
      img.style.top = `${relativePercentagesY(topF)}%`

      originX = 0.5
      originY = 0.5
      img.setAttribute("origin-y-data", 0.5)
      img.setAttribute("origin-x-data", 0.5)
      img.style.transform = `translate(-50%, -50%)`
      boundingBox.style.transform = `translate(-50%, -50%)`
    }  
    else {
      img.setAttribute("left-data", canvasX)
      img.setAttribute("top-data", canvasY)
      img.style.left = `${relativeX*100}%`
      img.style.top = `${relativeY*100}%`

      originX = newTransformX
      originY = newTransformY
      img.setAttribute("origin-y-data", originY)
      img.setAttribute("origin-x-data", originX)
      img.style.transform = `translate(${-originX*100}%, ${-originY*100}%)`
      boundingBox.style.transform = `translate(${-originX*100}%, ${-originY*100}%)`
    }

    
  }
  else {
    // Resizing
    const calculateMultipler = (mouseDown) => { // Should be called divider but multipler sounds cooler
      if (mouseDown === "nwse-tl") return [originX, originY]
      if (mouseDown === "nwse-br") return [1-originX, 1-originY]
      if (mouseDown === "nesw-tr") return [1-originX, originY]
      if (mouseDown === "nesw-bl") return [originX, 1-originY]
      if (mouseDown === "ns-tm") return [1, originY] // 1 doesn't matter bc not used in calc later
      if (mouseDown === "ns-bm") return [1, 1-originY]
      if (mouseDown === "ew-lm") return [originX, 1]
      if (mouseDown === "ew-rm") return [1-originX, 1]
      console.error("mouseDown variable is wrong");
      return [1, 1]
    }

    // Should be called divider but multipler sounds cooler
    const [multiplierX, multiplierY] =  calculateMultipler(mouseDown)

    const newWidth = Math.abs((x/width - relativePercentagesX(left)/100)/multiplierX) // relPX give percentage and *2 to get full width
    const newHeight = Math.abs((y/height - relativePercentagesY(top)/100)/multiplierY) // relPX give percentage and *2 to get full width
    
    const expectedWidth = newHeight * originalRatio / canvasRatio
    const expectedHeight = newWidth / originalRatio * canvasRatio

    const displayWidthRelative = mouseDown.length === 5 ? mouseDown.slice(0, 2) === "ew" ? newWidth : expectedWidth : Math.min(newWidth, expectedWidth)
    const displayHeightRelative = mouseDown.length === 5 ? mouseDown.slice(0, 2) === "ew" ? expectedHeight : newHeight : Math.min(newHeight, expectedHeight)

    const displayWidthPixels = displayWidthRelative * canvasWidth  
    const displayHeightPixels = displayHeightRelative * canvasHeight

    img.setAttribute("width-data", displayWidthPixels)
    img.setAttribute("height-data", displayHeightPixels)
    img.style.width = `${displayWidthRelative*100}%`
    img.style.height = `${displayHeightRelative*100}%`
  }
  onUpdate(img)
}

// MARK: Mouse Up
const upHandler = () => {
  const currentLayer = getCurrentLayer()

  if (!boundingBox) return
  mouseDown = "false"

  controlContainer.style.cursor = ""
  boundingBox.style.cursor = ""
  canvas.style.cursor = ""
  document.body.style.cursor = ""

  const left = parseFloat(img.getAttribute("left-data"))
  const top = parseFloat(img.getAttribute("top-data"))
  const width = parseFloat(img.getAttribute("width-data"))
  const height = parseFloat(img.getAttribute("height-data"))
  const locaOriginX = parseFloat(img.getAttribute("origin-x-data") ?? 0.5)
  const localOriginY = parseFloat(img.getAttribute("origin-y-data") ?? 0.5)

  const undoFunction = ([e, l, t, w, h, ox, oy]) => {
    const img = document.getElementById(e)
    img.setAttribute("left-data", l)
    img.setAttribute("top-data", t)
    img.setAttribute("width-data", w)
    img.setAttribute("height-data", h)
    img.setAttribute("origin-x-data", ox)
    img.setAttribute("origin-y-data", oy)
    img.style.left = `${relativePercentagesX(l)}%`
    img.style.top = `${relativePercentagesY(t)}%`
    img.style.width = `${relativePercentagesX(w)}%`
    img.style.height = `${relativePercentagesY(h)}%`
    img.style.transform = `translate(${-ox*100}%, ${-oy*100}%)`
    originX = ox
    originY = oy
    onUpdate(img)
  }
  const redoFunction = ([e]) => {
    const img = document.getElementById(e)
    img.setAttribute("left-data", left)
    img.setAttribute("top-data", top)
    img.setAttribute("width-data", width)
    img.setAttribute("height-data", height)
    img.setAttribute("origin-x-data", locaOriginX)
    img.setAttribute("origin-y-data", localOriginY)
    img.style.left = `${relativePercentagesX(left)}%`
    img.style.top = `${relativePercentagesY(top)}%`
    img.style.width = `${relativePercentagesX(width)}%`
    img.style.height = `${relativePercentagesY(height)}%`
    img.style.transform = `translate(${-locaOriginX*100}%, ${-localOriginY*100}%)`
    originX = locaOriginX
    originY = localOriginY
    onUpdate(img)
  }
  addToUndoStack([undoFunction, redoFunction, [currentLayer, originalImgL, originalImgT, originalImgW, originalImgH, ogOriginX, ogOriginY]])
  img = undefined
}

container.addEventListener("mousedown", downHandler)
container.addEventListener("mousemove", moveHandler)
container.addEventListener("mouseleave", upHandler)
container.addEventListener("mouseup", upHandler)