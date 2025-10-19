import { getSVG } from "./script.js";

export let undoStack = [];
export let redoStack = [];

export function resetRedoStack(){
  redoStack = []
}

export function addToUndoStack(x) {
  undoStack.push(x)
  const undoStackLength = undoStack.length
  if (undoStackLength >= 100) {
    undoStack.shift()
  }
  resetRedoStack()
}


document.addEventListener("keydown", function (event) {
  const svg = getSVG()
  const evtobj = window.event ? event : e;
  if (evtobj.key == "z" && (evtobj.ctrlKey || evtobj.metaKey) && evtobj.shiftKey) { // Redo
    if (redoStack.length == 0) return;
    const funcs = redoStack.pop();
    funcs[1](funcs[2])
    undoStack.push(funcs)
  } else if (evtobj.key == "z" && (evtobj.ctrlKey || evtobj.metaKey)) { // Undo
    if (undoStack.length == 0) return;
    const funcs = undoStack.pop()
    funcs[0](funcs[2])
    redoStack.push(funcs)
  }
})