// 9D → 3D → 2D Projection System
// Projects 9D hypercube vertices to 2D screen coordinates

/**
 * Projection weights for 9D → 3D
 * Each dimension contributes to X, Y, Z with different weights
 */
const PROJECTION_WEIGHTS = {
  x: [1.0, 0.8, 0.6, 0.4, 0.3, 0.2, 0.15, 0.1, 0.05],
  y: [0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.6, 0.8, 1.0],
  z: [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8, 0.1, 0.9],
};

/**
 * Normalize a 3D point to lie on a unit sphere surface
 * Converts cube structure to spherical shell
 * @param {Object} point3D - {x, y, z} coordinates
 * @returns {Object} Normalized {x, y, z} on unit sphere
 */
export function projectToSphere(point3D) {
  const { x, y, z } = point3D;
  const len = Math.sqrt(x * x + y * y + z * z);
  
  if (len === 0) return { x: 0, y: 0, z: 0 };
  
  return {
    x: x / len,
    y: y / len,
    z: z / len,
  };
}

/**
 * Rotate a 3D point around the Y axis
 * @param {Object} v - {x, y, z} coordinates
 * @param {number} angle - Rotation angle in radians
 * @returns {Object} Rotated {x, y, z} coordinates
 */
export function rotateOnY(v, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: v.x * cos + v.z * sin,
    y: v.y,
    z: -v.x * sin + v.z * cos,
  };
}

/**
 * Project a 9D vertex to 3D space
 * @param {Array<number>} vertex - 9-element array of 0s and 1s
 * @param {Object} weights - Optional custom projection weights
 * @returns {Object} {x, y, z} coordinates in 3D space
 */
export function project9Dto3D(vertex, weights = PROJECTION_WEIGHTS) {
  let x = 0, y = 0, z = 0;
  
  for (let i = 0; i < 9; i++) {
    // Center coordinates around 0 (vertex[i] is 0 or 1, we want -0.5 to 0.5)
    const centered = vertex[i] - 0.5;
    x += centered * weights.x[i];
    y += centered * weights.y[i];
    z += centered * weights.z[i];
  }
  
  return { x, y, z };
}

/**
 * Project 3D coordinates to 2D screen space with perspective
 * @param {Object} point3D - {x, y, z} coordinates
 * @param {number} perspectiveFactor - Distance factor (higher = less perspective)
 * @param {number} scale - Scale factor for final coordinates
 * @returns {Object} {x, y} normalized coordinates (0-1 range)
 */
export function project3Dto2D(point3D, perspectiveFactor = 4, scale = 0.45) {
  const { x, y, z } = point3D;
  
  // Apply perspective division
  const depth = z + perspectiveFactor;
  const screenX = x / depth;
  const screenY = y / depth;
  
  // Scale and center in 0-1 range
  const normalizedX = 0.5 + screenX * scale;
  const normalizedY = 0.5 + screenY * scale;
  
  return {
    x: normalizedX,
    y: normalizedY,
    depth: depth, // Keep depth for Z-ordering
  };
}

/**
 * Project a 9D vertex directly to 2D screen coordinates
 * @param {Array<number>} vertex - 9-element array of 0s and 1s
 * @param {Object} options - Projection options
 * @returns {Object} {x, y, depth} normalized coordinates
 */
export function project9Dto2D(vertex, options = {}) {
  const {
    weights = PROJECTION_WEIGHTS,
    perspectiveFactor = 4,
    scale = 0.8,
    rotation = { x: 0, y: 0, z: 0 },
  } = options;
  
  // Step 1: 9D → 3D
  let point3D = project9Dto3D(vertex, weights);
  
  // Step 2: Apply rotation (optional)
  if (rotation.x || rotation.y || rotation.z) {
    point3D = rotatePoint3D(point3D, rotation);
  }
  
  // Step 3: 3D → 2D
  return project3Dto2D(point3D, perspectiveFactor, scale);
}

/**
 * Rotate a 3D point around X, Y, Z axes
 * @param {Object} point - {x, y, z} coordinates
 * @param {Object} rotation - {x, y, z} rotation angles in radians
 * @returns {Object} Rotated {x, y, z} coordinates
 */
export function rotatePoint3D(point, rotation) {
  let { x, y, z } = point;
  
  // Rotate around X axis
  if (rotation.x) {
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const y2 = y * cosX - z * sinX;
    const z2 = y * sinX + z * cosX;
    y = y2;
    z = z2;
  }
  
  // Rotate around Y axis
  if (rotation.y) {
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    const x2 = x * cosY + z * sinY;
    const z2 = -x * sinY + z * cosY;
    x = x2;
    z = z2;
  }
  
  // Rotate around Z axis
  if (rotation.z) {
    const cosZ = Math.cos(rotation.z);
    const sinZ = Math.sin(rotation.z);
    const x2 = x * cosZ - y * sinZ;
    const y2 = x * sinZ + y * cosZ;
    x = x2;
    y = y2;
  }
  
  return { x, y, z };
}

/**
 * Project all 512 vertices to 2D coordinates
 * @param {Array<Array<number>>} vertices - Array of 9D vertices
 * @param {Object} options - Projection options
 * @returns {Array<Object>} Array of {x, y, depth} coordinates
 */
export function projectAll9DVertices(vertices, options = {}) {
  return vertices.map(vertex => project9Dto2D(vertex, options));
}

/**
 * Create animated rotation values
 * @param {number} time - Time in milliseconds
 * @param {Object} speed - {x, y, z} rotation speeds
 * @returns {Object} {x, y, z} rotation angles
 */
export function getAnimatedRotation(time, speed = { x: 0.0003, y: 0.0005, z: 0.0002 }) {
  return {
    x: time * speed.x,
    y: time * speed.y,
    z: time * speed.z,
  };
}

/**
 * Sort vertices by depth (for proper rendering order)
 * @param {Array<Object>} projectedVertices - Array of {x, y, depth} coordinates
 * @param {Array<any>} data - Corresponding data to sort alongside
 * @returns {Array<Object>} Sorted array of {vertex, data, depth}
 */
export function sortByDepth(projectedVertices, data) {
  const combined = projectedVertices.map((vertex, i) => ({
    vertex,
    data: data[i],
    depth: vertex.depth,
  }));
  
  // Sort by depth (render far vertices first)
  combined.sort((a, b) => a.depth - b.depth);
  
  return combined;
}

// Export default projection settings
export const DEFAULT_PROJECTION = {
  weights: PROJECTION_WEIGHTS,
  perspectiveFactor: 4,
  scale: 0.45,
  rotation: { x: 0.3, y: 0.4, z: 0.1 },
};
