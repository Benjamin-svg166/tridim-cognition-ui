// 9D Hypercube Vertex Generation
// Each vertex is a 9-bit coordinate: 000000000 to 111111111
// Total vertices: 2^9 = 512

/**
 * Generate all 512 vertices of a 9D hypercube
 * Each vertex is represented as a 9-element array of 0s and 1s
 * @returns {Array<Array<number>>} Array of 512 vertices
 */
export function generate9DCubeVertices() {
  const vertices = [];
  const dimensions = 9;
  const totalVertices = Math.pow(2, dimensions); // 2^9 = 512

  for (let i = 0; i < totalVertices; i++) {
    const vertex = [];
    
    // Convert number to 9-bit binary representation
    for (let bit = 0; bit < dimensions; bit++) {
      // Extract each bit from right to left
      vertex.push((i >> bit) & 1);
    }
    
    vertices.push(vertex);
  }

  return vertices;
}

/**
 * Convert vertex coordinates to binary string representation
 * @param {Array<number>} vertex - 9-element array of 0s and 1s
 * @returns {string} Binary string like "000000000"
 */
export function vertexToBinary(vertex) {
  return vertex.join('');
}

/**
 * Convert vertex coordinates to decimal index
 * @param {Array<number>} vertex - 9-element array of 0s and 1s
 * @returns {number} Decimal index (0-511)
 */
export function vertexToIndex(vertex) {
  let index = 0;
  for (let i = 0; i < vertex.length; i++) {
    index += vertex[i] * Math.pow(2, i);
  }
  return index;
}

/**
 * Convert decimal index to vertex coordinates
 * @param {number} index - Decimal index (0-511)
 * @returns {Array<number>} 9-element array of 0s and 1s
 */
export function indexToVertex(index) {
  const vertex = [];
  for (let bit = 0; bit < 9; bit++) {
    vertex.push((index >> bit) & 1);
  }
  return vertex;
}

/**
 * Calculate Hamming distance between two vertices
 * (number of dimensions that differ)
 * @param {Array<number>} v1 - First vertex
 * @param {Array<number>} v2 - Second vertex
 * @returns {number} Hamming distance (0-9)
 */
export function hammingDistance(v1, v2) {
  let distance = 0;
  for (let i = 0; i < v1.length; i++) {
    if (v1[i] !== v2[i]) distance++;
  }
  return distance;
}

/**
 * Get all edges for the 9D hypercube
 * Two vertices are connected if they differ in exactly 1 dimension
 * @returns {Array<[number, number]>} Array of edge pairs (vertex indices)
 */
export function generate9DCubeEdges() {
  const edges = [];
  const totalVertices = 512;

  for (let i = 0; i < totalVertices; i++) {
    // For each vertex, flip each bit to find adjacent vertices
    for (let bit = 0; bit < 9; bit++) {
      const neighbor = i ^ (1 << bit); // XOR to flip the bit
      // Only add edge once (i < neighbor to avoid duplicates)
      if (i < neighbor) {
        edges.push([i, neighbor]);
      }
    }
  }

  return edges;
}

// Generate vertices immediately
export const NINE_D_VERTICES = generate9DCubeVertices();
export const NINE_D_EDGES = generate9DCubeEdges();

// Export stats
export const NINE_D_STATS = {
  vertices: NINE_D_VERTICES.length,
  edges: NINE_D_EDGES.length,
  dimensions: 9,
  maxHammingDistance: 9,
};

console.log('🎲 9D Hypercube generated:');
console.log(`   Vertices: ${NINE_D_STATS.vertices}`);
console.log(`   Edges: ${NINE_D_STATS.edges}`);
console.log(`   Dimensions: ${NINE_D_STATS.dimensions}`);
