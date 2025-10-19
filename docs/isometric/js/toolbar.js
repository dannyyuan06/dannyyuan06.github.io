import { getCurrentLayer } from "./layers.js";
import { getCanvas } from "./script.js";
import { onSelectDeselected, onSelectSelected } from "./select.js";

let currentTool = "line"

// Getters and Setters

export const setCurrentTool = tool => {
  currentTool = tool
  if (currentTool === "select") onSelectSelected(document.getElementById(getCurrentLayer()))
  else onSelectDeselected()
}
export const getCurrentTool = () => currentTool

// Keyboard Shortcuts

const letterDict = {
  "l": () => setCurrentTool("line"),
  "c": () => setCurrentTool("scissor"),
  "v": () => setCurrentTool("select"),
  "o": () => setCurrentTool("osuline"),
  "p": () => setCurrentTool("bezier")
}

document.addEventListener("keypress", function (event) {
  if (letterDict[event.key]) {
    letterDict[event.key]()
    updateButtons()
  }
})

// Toobar
const buttons = document.getElementsByClassName("toolbar-button")

function updateButtons() {
  for (let i=0;i<buttons.length;i++) {
    const button = buttons[i]
    if (button.getAttribute("data") == currentTool) {
      button.classList.add("toolbar-active")
    }
    else {
      button.classList.remove("toolbar-active")
    }
  }
}

updateButtons()

for (let i=0;i<buttons.length;i++) {
  const button = buttons[i]
  button.onclick = () => {
    setCurrentTool(button.getAttribute("data"))
    updateButtons()
  }
}

export default currentTool