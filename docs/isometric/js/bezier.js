import { nearestPointX, nearestPointY } from "./script";


let path;
let state = "none"

const mouseDownHandler = () => {
  if (state == "none" || state == "line") state = "control"
  if (path) {

  }
  else {
    path = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    path.setAttribute("stroke", "black")
    path.setAttribute("fill", "transparent")
    path.setAttribute("d", `M ${nearestPointX, nearestPointY}`)
  }
}