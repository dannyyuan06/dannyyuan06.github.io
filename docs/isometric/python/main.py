import cv2
import numpy as np
from skimage.morphology import skeletonize
from svgwrite import Drawing
import math

def extract_paths(skeleton):
    # List to store all paths
    paths = []
    visited = np.zeros_like(skeleton, dtype=bool)
    
    # Directions for 8-connectivity
    unit_vectors = [(0, 1), (math.sqrt(3)/2, 1/2), (math.sqrt(3)/2, -1/2), (0, -1), (-math.sqrt(3)/2, -1/2), (math.sqrt(3)/2, 1/2)]
    fidelity = 7
    fid_range = 2
    directions = []
    for unit_vector in unit_vectors:
      for i in range(fidelity-fid_range, fidelity):
        for j in range(fidelity-fid_range, fidelity):
          sub_directions = []
          sub_directions.append((round(unit_vector[0])+i, round(unit_vector[1])+j))
          sub_directions.append((round(unit_vector[0])-i, round(unit_vector[1])+j))
          sub_directions.append((round(unit_vector[0])+i, round(unit_vector[1])-j))
          sub_directions.append((round(unit_vector[0])-i, round(unit_vector[1])-j))
          directions.append(sub_directions)
        
    def check_paths(point):
      
      pass
    
    def trace_path(start):
        path = [start]
        visited[start] = True
        
        current = start
        next_point = -1
        while True:
            neighbors = [(current[0] + d[0], current[1] + d[1]) for d in directions]
            neighbors = [(r, c) for r, c in neighbors if 0 <= r < skeleton.shape[0] and 0 <= c < skeleton.shape[1]]
            unvisited_neighbors = [p for p in neighbors if skeleton[p] and not visited[p]]
            
            if not unvisited_neighbors:
                if next_point != -1:
                    path.append(next_point)
                break
              
            next_point = unvisited_neighbors[0]
            
            visited[next_point] = True
        
        return path
    
    # Find all paths in the skeleton
    for r in range(skeleton.shape[0]):
        for c in range(skeleton.shape[1]):
            if skeleton[r, c] and not visited[r, c]:
                path = trace_path((r, c))
                paths.append(path)
    
    return paths

def image_to_svg(image_path, svg_path):
    # Load the image in grayscale
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    # Threshold the image to binary (black and white)
    _, binary = cv2.threshold(image, 127, 255, cv2.THRESH_BINARY_INV)
    
    # Skeletonize the binary image
    skeleton = skeletonize(binary // 255)  # Convert to 0/1 before skeletonizing
    
    # Extract paths from the skeleton
    paths = extract_paths(skeleton)
    
    # Create a new SVG drawing
    height, width = image.shape
    dwg = Drawing(svg_path, profile='tiny', size=(width, height))
    
    # Convert each path into an SVG polyline
    for path in paths:
        points = [(c, r) for r, c in path]
        dwg.add(dwg.polyline(points, stroke="black", fill="none", stroke_width=1))
    
    # Save the SVG file
    dwg.save()
    print(f"SVG saved to {svg_path}")

# Example usage:
image_to_svg('src/vanilla/python/test.png', 'src/vanilla/python/output.svg')
