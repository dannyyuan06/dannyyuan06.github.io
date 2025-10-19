import cv2
import numpy as np
from skimage.morphology import skeletonize
from svgwrite import Drawing

def simplify_contour(contour, epsilon_factor=0.01):
    # Calculate the perimeter of the contour
    perimeter = cv2.arcLength(contour, True)
    # Apply the Douglas-Peucker algorithm to simplify the contour
    epsilon = epsilon_factor * perimeter
    return cv2.approxPolyDP(contour, epsilon, True)

def image_to_svg(image_path, svg_path, epsilon_factor=0.01):
    # Load the image in grayscale
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    # Threshold the image to binary (black and white)
    _, binary = cv2.threshold(image, 20, 255, cv2.THRESH_BINARY_INV)
    
    cv2.imwrite("src/vanilla/python/binary.png", binary)
    
    # Skeletonize the binary image
    skeleton = skeletonize(binary // 255)  # Convert to 0/1 before skeletonizing
    
    # Convert back to 8-bit for contour detection
    skeleton = (skeleton * 255).astype(np.uint8)
    
    # Find contours in the skeletonized image
    contours, _ = cv2.findContours(skeleton, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    
    # cv2.drawContours(image, contours, -1, (0, 255, 0), 3)
    
    # cv2.imshow('Contours', image) 
    # cv2.waitKey(0) 
    # cv2.destroyAllWindows() 
    
    # Create a new SVG drawing
    height, width = image.shape
    dwg = Drawing(svg_path, profile='tiny', size=(width, height))
    
    # Convert each contour into an SVG path
    for contour in contours:
        # Simplify the contour
        simplified_contour = simplify_contour(contour, epsilon_factor)
        
        # Create an SVG path string from the simplified contour points
        path_data = "M " + " L ".join(f"{point[0][0]},{point[0][1]}" for point in simplified_contour) + " Z"
        dwg.add(dwg.path(d=path_data, fill="none", stroke="black", stroke_width=1))
    
    # Save the SVG file
    dwg.save()
    print(f"SVG saved to {svg_path}")

# Example usage:
image_to_svg('src/vanilla/python/test.png', 'src/vanilla/python/output.svg')
