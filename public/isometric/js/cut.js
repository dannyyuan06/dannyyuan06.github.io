import { canvasContainer, svg } from "./script.js";
import { getCurrentTool } from "./toolbar.js";
import { addToUndoStack } from "./undoRedoStack.js";



export function cutMouseEnter(e) {
  if (getCurrentTool() == "scissor") {
    e.target.setAttribute("stroke", "blue");
    svg.style.cursor = "pointer"
  }
}

export function cutMouseLeave(e) {
  if (getCurrentTool() == "scissor") {
    svg.style.cursor = ""
  }
  e.target.setAttribute("stroke", "black");
}

export function cutMouseClick(e) {
  if (getCurrentTool() == "scissor") {
    e.target.setAttribute("stroke", "black");
    const undoFunction = e => svg.appendChild(e)
    const redoFunction = e => e.remove()
    addToUndoStack([undoFunction, redoFunction, e.target])
    e.target.remove()
    svg.style.cursor = ""
  }
}

window.addEventListener("load", function() {
  requestAnimationFrame(() => {
    const lines = document.getElementsByTagName("line")
    for (let i=0;i<lines.length;i++){
      const line = lines[i]
      line.addEventListener("mouseenter", cutMouseEnter)
      line.addEventListener("mouseleave", cutMouseLeave)
      line.addEventListener("click", cutMouseClick)
    }
  })
})

