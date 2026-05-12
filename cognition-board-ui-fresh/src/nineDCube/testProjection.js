// Test projection functions
import { project9Dto2D, project9Dto3D, getAnimatedRotation } from './projection.js';
import { NINE_D_VERTICES } from './vertices.js';

console.log('\n🎯 Testing 9D → 3D → 2D Projection\n');

// Test origin projection
const origin = NINE_D_VERTICES[0]; // [0,0,0,0,0,0,0,0,0]
const opposite = NINE_D_VERTICES[511]; // [1,1,1,1,1,1,1,1,1]

console.log('Origin vertex (000000000):');
const origin3D = project9Dto3D(origin);
console.log(`  3D: (${origin3D.x.toFixed(3)}, ${origin3D.y.toFixed(3)}, ${origin3D.z.toFixed(3)})`);

const origin2D = project9Dto2D(origin);
console.log(`  2D: (${origin2D.x.toFixed(3)}, ${origin2D.y.toFixed(3)}), depth: ${origin2D.depth.toFixed(3)}`);

console.log('\nOpposite vertex (111111111):');
const opposite3D = project9Dto3D(opposite);
console.log(`  3D: (${opposite3D.x.toFixed(3)}, ${opposite3D.y.toFixed(3)}, ${opposite3D.z.toFixed(3)})`);

const opposite2D = project9Dto2D(opposite);
console.log(`  2D: (${opposite2D.x.toFixed(3)}, ${opposite2D.y.toFixed(3)}), depth: ${opposite2D.depth.toFixed(3)}`);

// Test rotation
console.log('\n🔄 Testing rotation:');
const rotation = getAnimatedRotation(1000);
console.log(`  At t=1000ms: x=${rotation.x.toFixed(4)}, y=${rotation.y.toFixed(4)}, z=${rotation.z.toFixed(4)}`);

const rotated2D = project9Dto2D(origin, { rotation });
console.log(`  Rotated origin 2D: (${rotated2D.x.toFixed(3)}, ${rotated2D.y.toFixed(3)})`);

// Test projection bounds
console.log('\n📏 Testing projection bounds (should be ~0-1):');
let minX = 1, maxX = 0, minY = 1, maxY = 0;

NINE_D_VERTICES.forEach(vertex => {
  const projected = project9Dto2D(vertex);
  minX = Math.min(minX, projected.x);
  maxX = Math.max(maxX, projected.x);
  minY = Math.min(minY, projected.y);
  maxY = Math.max(maxY, projected.y);
});

console.log(`  X range: ${minX.toFixed(3)} to ${maxX.toFixed(3)}`);
console.log(`  Y range: ${minY.toFixed(3)} to ${maxY.toFixed(3)}`);
console.log(`  ${minX >= 0 && maxX <= 1 && minY >= 0 && maxY <= 1 ? '✅ PASS' : '⚠️ WARNING: Some vertices outside 0-1 range'}`);

// Test a few sample vertices
console.log('\n🎲 Sample vertex projections:');
const samples = [0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 511];
samples.forEach(i => {
  const vertex = NINE_D_VERTICES[i];
  const binary = vertex.join('');
  const projected = project9Dto2D(vertex);
  console.log(`  ${i.toString().padStart(3)}: ${binary} → (${projected.x.toFixed(3)}, ${projected.y.toFixed(3)})`);
});

console.log('\n✨ Projection tests complete!\n');
