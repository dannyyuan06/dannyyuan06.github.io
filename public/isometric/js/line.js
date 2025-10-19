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
} from "./script.js";
import { addToUndoStack, redoStack, resetRedoStack, undoStack } from "./undoRedoStack.js";

let currentLine;
let startLine = false;

// TODO: add buffer before dragging
// TODO: shift to stop snapping

const mouseDownHandler = (event, canvas, canvasContainerRect, svg) => {
  const curLayer = getCurrentLayer()
  if (crossPointer && curLayer) {
    startLine = true;
    currentLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    currentLine.setAttribute("x1", nearestPointX);
    currentLine.setAttribute("y1", nearestPointY);
    const [x, y] = inverseShiftPoints(
      event.clientX - canvasContainerRect.left,
      event.clientY - canvasContainerRect.top
    );
    currentLine.setAttribute("x2", x);
    currentLine.setAttribute("y2", y);
    currentLine.setAttribute("stroke", "black");
    currentLine.setAttribute("stroke-linecap", "round");
    svg.getElementById(curLayer).appendChild(currentLine);
  }
};

const mouseUpHandler = () => {
  startLine = false;
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
      
      const undoFunction = e => e.remove()
      const redoFunction = e => svg.appendChild(e)
      addToUndoStack([undoFunction, redoFunction, currentLine]);
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

export {
  mouseDownHandler as lineMouseDownHandler,
  mouseUpHandler as lineMouseUpHandler,
  mouseMoveHandler as lineMouseMoveHandler,
  startLine,
};
