import { cutMouseClick, cutMouseEnter, cutMouseLeave } from "./cut.js";
import { inverseShiftPoints } from "./isomaths.js";
import { getCurrentLayer } from "./layers.js";
import {
  mouseDown,
  crossPointer,
  nearestPointX,
  nearestPointY,
  mouseY,
  svg,
  mouseX,
  getSVG,
} from "./script.js";
import { addToUndoStack, redoStack, resetRedoStack, undoStack } from "./undoRedoStack.js";

let currentLine;
let osuStartLine = false;
let prevPoints = []
let prevLines = []

const mouseClickHandler = (event, canvas, canvasContainerRect, svg) => {
  osuStartLine = !osuStartLine
  if (osuStartLine) startLine(event, canvas, canvasContainerRect, svg)
  else {
    prevPoints = []
    const undoFunction = e => {
      for (let i=0;i<e.length;i++) {
        e[i].remove()
      }
    }
    const redoFunction = e => {
      for (let i=0;i<e.length;i++) {
        svg.appendChild(e[i])
      }
    }
    addToUndoStack([undoFunction, redoFunction, prevLines]);
    finishLine()
  }
}

const startLine = (_, __, ___, svg) => {
  if (crossPointer) {
    currentLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    prevPoints.push([nearestPointX, nearestPointY]);
    currentLine.setAttribute("x1", nearestPointX);
    currentLine.setAttribute("y1", nearestPointY);
    const [x, y] = inverseShiftPoints(mouseX, mouseY
    );
    currentLine.setAttribute("x2", x);
    currentLine.setAttribute("y2", y);
    currentLine.setAttribute("stroke", "black");
    currentLine.setAttribute("stroke-linecap", "round");
    svg.getElementById(getCurrentLayer()).appendChild(currentLine);
  }
};

const finishLine = () => {
  if (currentLine) {
    if (
      parseFloat(currentLine.getAttribute("x1")) == nearestPointX &&
      parseFloat(currentLine.getAttribute("y1")) == nearestPointY
    ) {
      currentLine.remove();
    } else {
      currentLine.setAttribute("x2", nearestPointX);
      currentLine.setAttribute("y2", nearestPointY);
      currentLine.addEventListener("mouseenter", cutMouseEnter)
      currentLine.addEventListener("mouseleave", cutMouseLeave)
      currentLine.addEventListener("click", cutMouseClick)
      
      
      prevLines.push(currentLine)
    }
    currentLine = null;
  }
};

const mouseMoveHandler = (nearestPointX, nearestPointY, mouseX, mouseY) => {
  if (currentLine) {
    if (crossPointer) {
      currentLine.setAttribute("x2", nearestPointX);
      currentLine.setAttribute("y2", nearestPointY);
    } else {
      const [x, y] = inverseShiftPoints(mouseX, mouseY);
      currentLine.setAttribute("x2", x);
      currentLine.setAttribute("y2", y);
    }
  }
};

document.addEventListener("keydown", e => {
  const key = e.key
  if (key === " " && crossPointer) {
    finishLine()
    startLine(null, null, null, getSVG())
  }
  if ((key === "Backspace" || key === "Delete") && prevPoints.length >= 2) {
    const lastLine = prevLines.pop()
    prevPoints.pop()
    const [prevX, prevY] = prevPoints[prevPoints.length - 1]
    lastLine.remove()
    currentLine.setAttribute("x1", prevX);
    currentLine.setAttribute("y1", prevY);
  }
})

export {
  mouseClickHandler as osuMouseClickHandler,
  mouseMoveHandler as osuLineMouseMoveHandler,
  osuStartLine,
};
