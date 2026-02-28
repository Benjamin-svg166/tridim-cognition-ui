// Strategic Game Analysis Script
// Analyzes game for strategic patterns, material balance, and key moments

const moves = `bishop (5,0,2)→(5,2,0)
pawn (4,6,0)→(4,4,0)
bishop (5,2,0)→(1,6,0) xblack
bishop (2,7,0)→(1,6,0) xwhite
bishop (2,0,2)→(0,2,0)
bishop (5,7,0)→(0,2,0) xwhite
rook (0,0,2)→(0,0,0)
bishop (0,2,0)→(1,1,0)
knight (1,0,2)→(1,1,0) xblack
knight (6,7,0)→(4,6,0)
rook (0,0,0)→(0,6,0) xblack
rook (0,7,0)→(0,6,0) xwhite
queen (3,0,2)→(1,0,0)
king (4,7,0)→(6,7,0)
queen (1,0,0)→(7,6,0) xblack
king (6,7,0)→(7,6,0) xwhite
king (4,0,2)→(3,0,1)
rook (0,6,0)→(0,1,0)
knight (6,0,2)→(5,0,0)
rook (0,1,0)→(1,1,0) xwhite
rook (7,0,2)→(7,0,0)
king (7,6,0)→(6,7,0)
pawn (0,1,2)→(0,2,2)
bishop (1,6,0)→(7,0,0) xwhite
pawn (1,1,2)→(1,2,2)
pawn (4,4,0)→(4,3,0)
pawn (2,1,2)→(2,2,2)
pawn (3,6,0)→(3,4,0)
pawn (3,1,2)→(3,2,2)
pawn (3,4,0)→(3,3,0)
pawn (4,1,2)→(4,2,2)
pawn (4,3,0)→(4,2,0)
knight (5,0,0)→(4,2,0) xblack
pawn (3,3,0)→(4,2,0) xwhite
pawn (5,1,2)→(5,2,2)
pawn (4,2,0)→(4,1,0)
pawn (6,1,2)→(6,2,2)
queen (4,1,0)→(4,0,0)
king (3,0,1)→(4,0,0) xblack
queen (3,7,0)→(3,1,0)
king (4,0,0)→(5,0,0)
rook (1,1,0)→(1,0,0)
king (5,0,0)→(5,0,1)
rook (5,7,0)→(3,7,0)
pawn (7,1,2)→(7,2,2)
rook (3,7,0)→(3,5,0)
pawn (0,2,2)→(0,3,2)
rook (3,5,0)→(5,5,0)
pawn (1,2,2)→(1,3,2)
queen (3,1,0)→(5,1,0)
king (5,0,1)→(4,0,2)
bishop (7,0,0)→(7,2,2) xwhite
pawn (2,2,2)→(2,3,2)
queen (5,1,0)→(5,2,1)
pawn (3,2,2)→(3,3,2)
queen (5,2,1)→(4,2,2) xwhite
king (4,0,2)→(3,0,1)
queen (4,2,2)→(3,3,2) xwhite
pawn (5,2,2)→(5,3,2)
queen (3,3,2)→(2,3,2) xwhite
pawn (6,2,2)→(6,3,2)
bishop (7,2,2)→(6,3,2) xwhite
pawn (0,3,2)→(0,4,2)
queen (2,3,2)→(1,3,2) xwhite
king (3,0,1)→(2,1,0)
rook (5,5,0)→(5,0,0)
pawn (5,3,2)→(5,4,2)
queen (1,3,2)→(0,4,2) xwhite
king (2,1,0)→(3,1,0)
queen (0,4,2)→(5,4,2) xwhite
king (3,1,0)→(2,1,0)
queen (5,4,2)→(5,2,0)
king (2,1,0)→(3,1,0)
queen (5,2,0)→(5,1,0)
king (3,1,0)→(2,2,0)
bishop (6,3,2)→(4,5,0)
king (2,2,0)→(3,2,0)
rook (1,0,0)→(3,0,0)
king (3,2,0)→(2,2,0)
queen (5,1,0)→(5,2,0)
king (2,2,0)→(1,1,0)
rook (5,0,0)→(5,1,0)
king (1,1,0)→(0,0,1)
rook (3,0,0)→(3,0,1)
king (0,0,1)→(0,0,0)
rook (5,1,0)→(5,0,0)
king (0,0,0)→(1,1,0)
queen (5,2,0)→(5,1,0)
king (1,1,0)→(0,2,0)
knight (1,7,0)→(2,5,0)
king (0,2,0)→(0,3,0)
queen (5,1,0)→(5,3,0)
king (0,3,0)→(0,2,0)
rook (5,0,0)→(5,2,0)
king (0,2,0)→(1,1,0)
queen (5,3,0)→(3,1,0)
king (1,1,0)→(0,0,0)
rook (5,2,0)→(5,0,0)
king (0,0,0)→(0,1,1)
bishop (4,5,0)→(4,4,1)
king (0,1,1)→(0,2,0)
rook (3,0,1)→(3,0,0)
king (0,2,0)→(0,3,0)
rook (3,0,0)→(0,0,0)
king (0,3,0)→(1,2,0)
knight (2,5,0)→(3,3,0)
king (1,2,0)→(2,3,0)
bishop (4,4,1)→(7,7,1)
king (2,3,0)→(2,4,0)
bishop (7,7,1)→(7,6,0)
king (2,4,0)→(2,3,0)
king (6,7,0)→(5,7,0)
king (2,3,0)→(2,4,0)
king (5,7,0)→(4,7,0)
king (2,4,0)→(2,3,0)
king (4,7,0)→(3,6,0)
king (2,3,0)→(2,4,0)
bishop (7,6,0)→(7,5,1)
king (2,4,0)→(2,3,0)
rook (0,0,0)→(2,0,0)
king (2,3,0)→(1,2,1)
rook (2,0,0)→(1,0,0)
king (1,2,1)→(0,2,0)
bishop (7,5,1)→(3,1,1)
king (0,2,0)→(0,3,0)
rook (5,0,0)→(5,0,1)
king (0,3,0)→(0,2,0)
queen (3,1,0)→(1,1,0)
king (0,2,0)→(0,3,0)
bishop (3,1,1)→(2,1,0)
king (0,3,0)→(0,4,0)
queen (1,1,0)→(1,4,0)`;

// Initialize board
const board = new Map();
const pieceValues = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 };

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

console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║         STRATEGIC GAME ANALYSIS - GAME 5         ║');
console.log('╔══════════════════════════════════════════════════════╗\n');

const moveLines = moves.trim().split('\n');
let whiteCaptures = { pawn: 0, knight: 0, bishop: 0, rook: 0, queen: 0 };
let blackCaptures = { pawn: 0, knight: 0, bishop: 0, rook: 0, queen: 0 };
let whiteMaterial = 39;
let blackMaterial = 39;
let currentPlayer = 'white';
let keyMoments = [];
let materialSwings = [];
let aggressiveMoves = { white: 0, black: 0 };

moveLines.forEach((line, index) => {
  const moveNum = index + 1;
  const match = line.match(/(\w+) \((\d+),(\d+),(\d+)\)→\((\d+),(\d+),(\d+)\)(?: x(\w+))?/);
  
  if (!match) return;
  
  const [, piece, fx, fy, fz, tx, ty, tz, capColor] = match;
  const from = { x: +fx, y: +fy, z: +fz };
  const to = { x: +tx, y: +ty, z: +tz };
  const fromKey = `${from.x},${from.y},${from.z}`;
  const toKey = `${to.x},${to.y},${to.z}`;
  
  const movingPiece = board.get(fromKey);
  if (!movingPiece) return;
  
  const targetPiece = board.get(toKey);
  
  // Track captures
  if (capColor && targetPiece) {
    const capturedValue = pieceValues[targetPiece.type] || 0;
    
    if (movingPiece.color === 'white') {
      whiteCaptures[targetPiece.type]++;
      blackMaterial -= capturedValue;
      aggressiveMoves.white++;
      
      if (capturedValue >= 5) {
        keyMoments.push(`Move ${moveNum}: ⚔️  White captured black ${targetPiece.type} (value ${capturedValue})`);
      }
    } else {
      blackCaptures[targetPiece.type]++;
      whiteMaterial -= capturedValue;
      aggressiveMoves.black++;
      
      if (capturedValue >= 5) {
        keyMoments.push(`Move ${moveNum}: ⚔️  Black captured white ${targetPiece.type} (value ${capturedValue})`);
      }
    }
    
    // Track material swings
    const advantage = whiteMaterial - blackMaterial;
    if (Math.abs(advantage) >= 3) {
      materialSwings.push({ move: moveNum, advantage });
    }
  }
  
  // Track aggressive queen moves
  if (piece === 'queen' && capColor) {
    if (movingPiece.color === 'white') {
      keyMoments.push(`Move ${moveNum}: 👑 White queen attacks! Captured ${targetPiece.type}`);
    } else {
      keyMoments.push(`Move ${moveNum}: 👑 Black queen attacks! Captured ${targetPiece.type}`);
    }
  }
  
  // Execute move
  board.delete(fromKey);
  if (targetPiece) board.delete(toKey);
  movingPiece.pos = to;
  board.set(toKey, movingPiece);
  
  currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
});

// Calculate final statistics
const totalCaptures = Object.values(whiteCaptures).reduce((a, b) => a + b, 0) + 
                     Object.values(blackCaptures).reduce((a, b) => a + b, 0);
const materialAdvantage = whiteMaterial - blackMaterial;

console.log('═══════════════════════════════════════════════════════\n');
console.log('📊 MATERIAL BALANCE\n');
console.log(`White Material: ${whiteMaterial} points`);
console.log(`Black Material: ${blackMaterial} points`);
console.log(`Advantage: ${materialAdvantage > 0 ? 'White +' + materialAdvantage : materialAdvantage < 0 ? 'Black +' + Math.abs(materialAdvantage) : 'Equal'}`);

console.log('\n═══════════════════════════════════════════════════════\n');
console.log('⚔️  CAPTURES SUMMARY\n');
console.log('White captured:');
for (const [type, count] of Object.entries(whiteCaptures)) {
  if (count > 0) console.log(`  ${count}x ${type}${count > 1 ? 's' : ''}`);
}
console.log(`\nBlack captured:`);
for (const [type, count] of Object.entries(blackCaptures)) {
  if (count > 0) console.log(`  ${count}x ${type}${count > 1 ? 's' : ''}`);
}

console.log('\n═══════════════════════════════════════════════════════\n');
console.log('🎯 PLAYING STYLE\n');
console.log(`Total moves: ${moveLines.length}`);
console.log(`Total captures: ${totalCaptures}`);
console.log(`Capture rate: ${((totalCaptures / moveLines.length) * 100).toFixed(1)}%`);
console.log(`\nAggressive moves:`);
console.log(`  White: ${aggressiveMoves.white} captures`);
console.log(`  Black: ${aggressiveMoves.black} captures`);

console.log('\n═══════════════════════════════════════════════════════\n');
console.log('🔑 KEY MOMENTS\n');
keyMoments.slice(0, 10).forEach(moment => console.log(moment));

console.log('\n═══════════════════════════════════════════════════════\n');
console.log('🏁 GAME OUTCOME\n');

const whiteKing = Array.from(board.values()).find(p => p.type === 'king' && p.color === 'white');
const blackKing = Array.from(board.values()).find(p => p.type === 'king' && p.color === 'black');

if (!whiteKing) {
  console.log('🏆 BLACK WINS - White king captured!');
} else if (!blackKing) {
  console.log('🏆 WHITE WINS - Black king captured!');
} else {
  console.log(`Kings still in play:`);
  console.log(`  White king at (${whiteKing.pos.x},${whiteKing.pos.y},${whiteKing.pos.z})`);
  console.log(`  Black king at (${blackKing.pos.x},${blackKing.pos.y},${blackKing.pos.z})`);
  
  if (Math.abs(materialAdvantage) >= 5) {
    console.log(`\n${materialAdvantage > 0 ? 'White' : 'Black'} has significant material advantage!`);
  } else if (Math.abs(materialAdvantage) >= 3) {
    console.log(`\n${materialAdvantage > 0 ? 'White' : 'Black'} has slight material advantage`);
  } else {
    console.log('\nGame is relatively balanced in material');
  }
}

console.log('\n═══════════════════════════════════════════════════════\n');
console.log(`📈 STRATEGIC ASSESSMENT\n`);

const whiteActivity = aggressiveMoves.white / (moveLines.length / 2);
const blackActivity = aggressiveMoves.black / (moveLines.length / 2);

console.log(`White aggression: ${(whiteActivity * 100).toFixed(1)}% of moves were captures`);
console.log(`Black aggression: ${(blackActivity * 100).toFixed(1)}% of moves were captures`);

if (whiteActivity > blackActivity * 1.5) {
  console.log('\n💥 White played very aggressively!');
} else if (blackActivity > whiteActivity * 1.5) {
  console.log('\n💥 Black played very aggressively!');
} else {
  console.log('\n⚖️  Both sides played with balanced aggression');
}

console.log('\n╚══════════════════════════════════════════════════════╝\n');
