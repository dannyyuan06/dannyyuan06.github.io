import { shape } from '/svg-intersections';

const svgElement = document.getElementById('svgCanvas');
// You can also fetch the SVG from an external file if needed.

const intersections = [];
const lines = [...svgElement.querySelectorAll('line, path')];

for (let i = 0; i < lines.length; i++) {
  for (let j = i + 1; j < lines.length; j++) {
    const inter = shape(lines[i]).intersect(shape(lines[j]));
    if (inter.points.length > 0) {
      intersections.push(inter.points);
    }
  }
}

const svgNS = 'http://www.w3.org/2000/svg';
const testSVG = svgElement.cloneNode(true)
testSVG.innerHTML = ""

intersections.forEach((points) => {
  const newPath = document.createElementNS(svgNS, 'path');
  let d = `M ${points[0].x} ${points[0].y}`;
  points.forEach(point => {
    d += ` L ${point.x} ${point.y}`;
  });
  d += ' Z'; // Close the path
  newPath.setAttribute('d', d);
  newPath.setAttribute('fill', 'none');
  newPath.setAttribute('stroke', 'black');
  svgElement.appendChild(newPath);
});

