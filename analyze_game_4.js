// Game Analysis Script 4
// Simulates the game move by move to verify captures and board state

const moves = `rook (0,0,2)→(0,0,0)
pawn (0,6,0)→(0,5,0)
rook (0,0,0)→(0,5,0) xblack
pawn (1,6,0)→(0,5,0) xwhite
knight (1,0,2)→(0,0,0)
pawn (4,6,0)→(4,4,0)
bishop (2,0,2)→(0,2,0)
bishop (5,7,0)→(0,2,0) xwhite
queen (3,0,2)→(1,0,0)
knight (6,7,0)→(5,5,0)
queen (1,0,0)→(1,7,0) xblack
rook (0,7,0)→(1,7,0) xwhite
king (4,0,2)→(3,0,1)
king (4,7,0)→(6,7,0)
bishop (5,0,2)→(3,0,0)
pawn (3,6,0)→(3,5,0)
knight (6,0,2)→(5,0,0)
rook (1,7,0)→(1,0,0)
rook (7,0,2)→(7,0,0)
rook (1,0,0)→(0,0,0) xwhite
rook (7,0,0)→(7,6,0) xblack
king (6,7,0)→(7,6,0) xwhite
pawn (0,1,2)→(0,2,2)
bishop (2,7,0)→(7,2,0)
pawn (1,1,2)→(1,2,2)
bishop (7,2,0)→(5,0,0) xwhite
pawn (2,1,2)→(2,2,2)
bishop (0,2,0)→(1,2,1)
king (3,0,1)→(3,1,0)
bishop (1,2,1)→(0,2,2) xwhite
pawn (3,1,2)→(3,2,2)
knight (5,5,0)→(4,3,0)
king (3,1,0)→(2,1,0)
knight (4,3,0)→(5,1,0)
pawn (4,1,2)→(4,2,2)
knight (5,1,0)→(3,0,0) xwhite
pawn (5,1,2)→(5,2,2)
queen (3,7,0)→(5,5,0)
pawn (6,1,2)→(6,2,2)
queen (5,5,0)→(5,1,0)
king (2,1,0)→(1,2,0)
queen (5,1,0)→(1,1,0)
king (1,2,0)→(2,3,1)
rook (0,0,0)→(2,0,0)
pawn (7,1,2)→(7,2,2)
queen (1,1,0)→(1,1,2)
pawn (1,2,2)→(1,3,2)
queen (1,1,2)→(1,3,2) xwhite
king (2,3,1)→(1,2,0)
rook (2,0,0)→(2,2,0)
king (1,2,0)→(0,1,0)
queen (1,3,2)→(1,1,0)`;

// Initialize board with starting position
const board = new Map();

function add(type, x, y, z, color) {
  board.set(`${x},${y},${z}`, { type, color, pos: { x, y, z } });
}

// White pieces (z=2)
for (let i = 0; i < 8; i++) add('pawn', i, 1, 2, 'white');
add('rook', 0, 0, 2, 'white');
add('knight', 1, 0, 2, 'white');
add('bishop', 2, 0, 2, 'white');
add('queen', 3, 0, 2, 'white');
add('king', 4, 0, 2, 'white');
add('bishop', 5, 0, 2, 'white');
add('knight', 6, 0, 2, 'white');
add('rook', 7, 0, 2, 'white');

// Black pieces (z=0)
for (let i = 0; i < 8; i++) add('pawn', i, 6, 0, 'black');
add('rook', 0, 7, 0, 'black');
add('knight', 1, 7, 0, 'black');
add('bishop', 2, 7, 0, 'black');
add('queen', 3, 7, 0, 'black');
add('king', 4, 7, 0, 'black');
add('bishop', 5, 7, 0, 'black');
add('knight', 6, 7, 0, 'black');
add('rook', 7, 7, 0, 'black');

console.log('\n=== GAME ANALYSIS 4 ===\n');
console.log('Starting pieces:', board.size);

const moveLines = moves.trim().split('\n');
let errors = 0;
let captures = 0;
let captureErrors = 0;

moveLines.forEach((line, index) => {
  const moveNum = index + 1;
  const match = line.match(/(\w+) \((\d+),(\d+),(\d+)\)→\((\d+),(\d+),(\d+)\)(?: x(\w+))?/);
  
  if (!match) {
    console.log(`Move ${moveNum}: Parse error - ${line}`);
    errors++;
    return;
  }
  
  const [, piece, fx, fy, fz, tx, ty, tz, capColor] = match;
  const from = { x: +fx, y: +fy, z: +fz };
  const to = { x: +tx, y: +ty, z: +tz };
  const fromKey = `${from.x},${from.y},${from.z}`;
  const toKey = `${to.x},${to.y},${to.z}`;
  
  // Check if piece exists at source
  const movingPiece = board.get(fromKey);
  if (!movingPiece) {
    console.log(`❌ Move ${moveNum}: No piece at ${fromKey}`);
    console.log(`   ${line}`);
    errors++;
    return;
  }
  
  // Check if piece type matches
  if (movingPiece.type !== piece) {
    console.log(`❌ Move ${moveNum}: Expected ${piece} at ${fromKey}, found ${movingPiece.type}`);
    console.log(`   ${line}`);
    errors++;
    return;
  }
  
  // Check destination
  const targetPiece = board.get(toKey);
  
  if (capColor) {
    captures++;
    // Capture expected
    if (!targetPiece) {
      console.log(`❌ Move ${moveNum}: Capture expected but no piece at ${toKey}`);
      console.log(`   ${line}`);
      captureErrors++;
    } else if (targetPiece.color !== capColor) {
      console.log(`❌ Move ${moveNum}: Capture color mismatch`);
      console.log(`   Expected: x${capColor}`);
      console.log(`   Actual: x${targetPiece.color} (${targetPiece.type})`);
      console.log(`   ${line}`);
      captureErrors++;
    } else if (targetPiece.type === 'king') {
      console.log(`🚨 Move ${moveNum}: KING CAPTURED! ${movingPiece.color} ${piece} captured ${targetPiece.color} king`);
      console.log(`   ${line}`);
      errors++;
    } else {
      // Correct capture
      console.log(`✅ Move ${moveNum}: ${movingPiece.color} ${piece} captured ${targetPiece.color} ${targetPiece.type}`);
    }
  } else {
    // No capture expected
    if (targetPiece) {
      console.log(`❌ Move ${moveNum}: No capture declared but ${targetPiece.color} ${targetPiece.type} at ${toKey}`);
      console.log(`   ${line}`);
      captureErrors++;
    }
  }
  
  // Execute move
  board.delete(fromKey);
  if (targetPiece) board.delete(toKey);
  movingPiece.pos = to;
  board.set(toKey, movingPiece);
});

console.log('\n=== SUMMARY ===');
console.log(`Total moves: ${moveLines.length}`);
console.log(`Captures: ${captures}`);
console.log(`Capture errors: ${captureErrors}`);
console.log(`Other errors: ${errors}`);
console.log(`Final pieces on board: ${board.size}`);

// Check if kings are still present
const whiteKing = Array.from(board.values()).find(p => p.type === 'king' && p.color === 'white');
const blackKing = Array.from(board.values()).find(p => p.type === 'king' && p.color === 'black');

console.log('\n=== KING STATUS ===');
if (whiteKing) {
  console.log(`✅ White king at (${whiteKing.pos.x},${whiteKing.pos.y},${whiteKing.pos.z})`);
} else {
  console.log('🚨 WHITE KING MISSING!');
}

if (blackKing) {
  console.log(`✅ Black king at (${blackKing.pos.x},${blackKing.pos.y},${blackKing.pos.z})`);
} else {
  console.log('🚨 BLACK KING MISSING!');
}

if (captureErrors === 0 && errors === 0) {
  console.log('\n✅ ALL MOVES VALID - NO ERRORS DETECTED');
} else {
  console.log(`\n❌ FOUND ${captureErrors + errors} ERRORS`);
}
