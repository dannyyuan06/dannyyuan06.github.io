import { offsetX, offsetY, dotSpacing, splitTwo, zoomLevel, canvasWidth, canvasHeight } from "./script.js";

function shiftPoints(x, y) {
  const xPrime = offsetX + x * dotSpacing * Math.pow(splitTwo, zoomLevel - 2);
  const yPrime = offsetY + y * dotSpacing * Math.pow(splitTwo, zoomLevel - 2);
  return [xPrime, yPrime];
}

function shiftLength(x) {
  return x * dotSpacing * Math.pow(splitTwo, zoomLevel - 2);
}

function inverseShiftPoints(x, y) {
  const xPrime = (x - offsetX) / (dotSpacing * Math.pow(splitTwo, zoomLevel - 2));
  const yPrime = (y - offsetY) / (dotSpacing * Math.pow(splitTwo, zoomLevel - 2));
  return [xPrime, yPrime];
}

const relativePercentagesX = pixels => pixels/canvasWidth*100 
const relativePercentagesY = pixels => pixels/canvasHeight*100 

export {shiftPoints, shiftLength, inverseShiftPoints, relativePercentagesX, relativePercentagesY}