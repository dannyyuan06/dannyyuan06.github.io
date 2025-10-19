import cv2
import numpy as np
from svgwrite import Drawing

def image_to_svg(image_path, svg_path, threshold1=50, threshold2=150):
    # Load the image in grayscale
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    # Apply the Canny edge detection algorithm
    edges = cv2.Canny(image, threshold1, threshold2)
    
    # Find contours in the edged image
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Create a new SVG drawing
    height, width = image.shape
    dwg = Drawing(svg_path, profile='tiny', size=(width, height))
    
    # Convert each contour into an SVG path
    for contour in contours:
        # Create an SVG path string from the contour points
        path_data = "M " + " L ".join(f"{point[0][0]},{point[0][1]}" for point in contour) + " Z"
        dwg.add(dwg.path(d=path_data, fill="none", stroke="black"))
    
    # Save the SVG file
    dwg.save()
    print(f"SVG saved to {svg_path}")

# Example usage:
image_to_svg('src/vanilla/python/test.png', 'src/vanilla/python/output.svg')
