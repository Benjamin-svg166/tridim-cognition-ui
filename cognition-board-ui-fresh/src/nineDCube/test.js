// Test and demo file for 9D cube vertices
import {
  generate9DCubeVertices,
  vertexToBinary,
  vertexToIndex,
  indexToVertex,
  hammingDistance,
  NINE_D_VERTICES,
  NINE_D_EDGES,
  NINE_D_STATS,
} from './vertices.js';

// Test basic generation
console.log('\n🧪 Testing 9D Hypercube Generation\n');

// Show first 10 vertices
console.log('First 10 vertices:');
for (let i = 0; i < 10; i++) {
  const vertex = NINE_D_VERTICES[i];
  console.log(`  ${i}: ${vertexToBinary(vertex)} = [${vertex.join(',')}]`);
}

// Show last 10 vertices
console.log('\nLast 10 vertices:');
for (let i = 502; i < 512; i++) {
  const vertex = NINE_D_VERTICES[i];
  console.log(`  ${i}: ${vertexToBinary(vertex)} = [${vertex.join(',')}]`);
}

// Test corner cases
console.log('\n📍 Corner vertices:');
console.log(`  Origin (000000000): [${NINE_D_VERTICES[0].join(',')}]`);
console.log(`  Opposite (111111111): [${NINE_D_VERTICES[511].join(',')}]`);

// Test Hamming distance
console.log('\n📏 Hamming distances:');
const origin = NINE_D_VERTICES[0];
const opposite = NINE_D_VERTICES[511];
console.log(`  Origin to opposite: ${hammingDistance(origin, opposite)} (should be 9)`);
console.log(`  Origin to [1,0,0,0,0,0,0,0,0]: ${hammingDistance(origin, [1,0,0,0,0,0,0,0,0])} (should be 1)`);

// Test edge generation
console.log('\n🔗 Edge statistics:');
console.log(`  Total edges: ${NINE_D_EDGES.length}`);
console.log(`  Expected: ${512 * 9 / 2} (512 vertices × 9 dimensions / 2)`);
console.log(`  First 5 edges:`);
for (let i = 0; i < 5; i++) {
  const [v1, v2] = NINE_D_EDGES[i];
  console.log(`    ${v1} ↔ ${v2}: ${vertexToBinary(NINE_D_VERTICES[v1])} ↔ ${vertexToBinary(NINE_D_VERTICES[v2])}`);
}

// Test vertex index conversion
console.log('\n🔄 Index conversion tests:');
const testIndex = 42;
const testVertex = indexToVertex(testIndex);
const backToIndex = vertexToIndex(testVertex);
console.log(`  Index ${testIndex} → ${vertexToBinary(testVertex)} → ${backToIndex}`);
console.log(`  ${testIndex === backToIndex ? '✅ PASS' : '❌ FAIL'}`);

console.log('\n✨ All tests complete!\n');
