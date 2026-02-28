const moves = `rook (0,0,2)→(0,0,0)
pawn (4,6,0)→(4,5,0)
rook (0,0,0)→(0,6,0) xopponent
rook (0,7,0)→(0,6,0) xwhite
knight (1,0,2)→(0,0,0)
knight (6,7,0)→(7,5,0)
bishop (2,0,2)→(0,2,0)
bishop (5,7,0)→(4,6,1)
queen (3,0,2)→(1,0,0)
rook (0,6,0)→(0,2,0) xwhite
queen (1,0,0)→(1,6,0) xopponent
bishop (2,7,0)→(1,6,1)
queen (1,6,0)→(1,7,0) xopponent
queen (3,7,0)→(1,7,0) xwhite
king (4,0,2)→(3,0,1)
king (4,7,0)→(6,7,0)
bishop (5,0,2)→(3,0,0)
queen (1,7,0)→(1,0,0)
knight (6,0,2)→(5,0,0)
queen (1,0,0)→(0,0,1)
knight (0,0,0)→(2,0,1)
queen (0,0,1)→(0,1,2) xwhite
rook (7,0,2)→(7,0,0)
queen (0,1,2)→(1,1,2) xwhite
rook (7,0,0)→(7,5,0) xopponent
pawn (6,6,0)→(7,5,0) xwhite
pawn (2,1,2)→(2,2,2)
rook (0,2,0)→(7,2,0)
pawn (3,1,2)→(3,2,2)
rook (7,2,0)→(7,0,0)
pawn (4,1,2)→(4,2,2)
rook (7,0,0)→(5,0,0) xwhite
pawn (5,1,2)→(5,2,2)
queen (1,1,2)→(6,1,2) xwhite
pawn (7,1,2)→(7,2,2)
queen (6,1,2)→(7,2,2) xwhite
king (3,0,1)→(2,0,0)
queen (7,2,2)→(5,2,2) xwhite
knight (2,0,1)→(0,0,0)
queen (5,2,2)→(4,2,2) xwhite
king (2,0,0)→(1,0,0)
queen (4,2,2)→(3,2,2) xwhite
king (1,0,0)→(0,1,0)
rook (5,0,0)→(3,0,0) xwhite
pawn (2,2,2)→(2,3,2)
queen (3,2,2)→(2,3,2) xwhite
king (0,1,0)→(0,2,0)
rook (3,0,0)→(0,0,0) xwhite
king (0,2,0)→(1,1,0)
rook (5,7,0)→(0,7,0)
king (1,1,0)→(1,2,0)
queen (2,3,2)→(0,3,2)
king (1,2,0)→(1,1,0)
rook (0,0,0)→(0,1,0)
king (1,1,0)→(1,0,0)
pawn (7,5,0)→(7,4,0)
king (1,0,0)→(2,0,0)
pawn (7,4,0)→(7,3,0)
king (2,0,0)→(1,0,0)
pawn (7,3,0)→(7,2,0)
king (1,0,0)→(2,0,0)
pawn (7,2,0)→(7,1,0)
king (2,0,0)→(1,0,0)
queen (7,1,0)→(7,0,0)
king (1,0,0)→(0,0,1)
queen (7,0,0)→(6,0,1)
king (0,0,1)→(1,0,0)
queen (6,0,1)→(1,5,1)
king (1,0,0)→(2,0,0)
bishop (1,6,1)→(5,2,1)
king (2,0,0)→(1,0,0)
queen (1,5,1)→(1,4,2)
king (1,0,0)→(2,0,0)
rook (0,7,0)→(0,4,0)
king (2,0,0)→(1,0,0)
queen (1,4,2)→(1,5,2)
king (1,0,0)→(2,0,0)
queen (1,5,2)→(1,6,2)
king (2,0,0)→(1,0,0)
pawn (4,5,0)→(4,4,0)
king (1,0,0)→(2,0,0)
pawn (4,4,0)→(4,3,0)
king (2,0,0)→(1,0,0)
pawn (4,3,0)→(4,2,0)
king (1,0,0)→(2,0,0)
pawn (4,2,0)→(4,1,0)
king (2,0,0)→(1,0,0)
queen (4,1,0)→(4,0,0)
king (1,0,0)→(0,0,1)
bishop (4,6,1)→(5,5,2)
king (0,0,1)→(1,0,1)
rook (0,4,0)→(1,4,0)
king (1,0,1)→(0,0,1)
queen (4,0,0)→(4,1,1)
king (0,0,1)→(1,0,1)
rook (1,4,0)→(1,4,2)
king (1,0,1)→(1,0,0)
rook (1,4,2)→(1,4,1)
king (1,0,0)→(2,0,0)
queen (4,1,1)→(4,0,2)
king (2,0,0)→(1,0,0)
pawn (5,6,0)→(5,4,0)
king (1,0,0)→(0,0,1)
pawn (5,4,0)→(5,3,0)
king (0,0,1)→(1,0,0)
pawn (5,3,0)→(5,2,0)
king (0,0,1)→(1,0,0)
bishop (5,2,1)→(5,1,2)
king (0,0,1)→(1,0,0)
pawn (5,2,0)→(5,1,0)
king (1,0,0)→(0,0,1)
queen (1,6,2)→(2,5,2)
king (0,0,1)→(1,0,0)
rook (1,4,1)→(1,4,2)
king (1,0,0)→(0,0,1)
rook (1,4,2)→(1,4,1)
king (0,0,1)→(1,0,0)
queen (2,5,2)→(2,3,2)
king (1,0,0)→(0,0,1)
queen (2,3,2)→(2,2,2)
king (0,0,1)→(1,0,0)
queen (4,0,2)→(4,0,1)`.split('\n');

let whiteKing = {x: 4, y: 7, z: 0};
let blackKing = {x: 4, y: 0, z: 2};
let board = new Map();

// Initialize starting positions
function initBoard() {
  // Black pieces (top board z=2)
  board.set('0,0,2', {type: 'rook', color: 'black'});
  board.set('1,0,2', {type: 'knight', color: 'black'});
  board.set('2,0,2', {type: 'bishop', color: 'black'});
  board.set('3,0,2', {type: 'queen', color: 'black'});
  board.set('4,0,2', {type: 'king', color: 'black'});
  board.set('5,0,2', {type: 'bishop', color: 'black'});
  board.set('6,0,2', {type: 'knight', color: 'black'});
  board.set('7,0,2', {type: 'rook', color: 'black'});
  for(let i=0; i<8; i++) board.set(`${i},1,2`, {type: 'pawn', color: 'black'});
  
  // White pieces (bottom board z=0)
  board.set('0,7,0', {type: 'rook', color: 'white'});
  board.set('1,7,0', {type: 'knight', color: 'white'});
  board.set('2,7,0', {type: 'bishop', color: 'white'});
  board.set('3,7,0', {type: 'queen', color: 'white'});
  board.set('4,7,0', {type: 'king', color: 'white'});
  board.set('5,7,0', {type: 'rook', color: 'white'});
  board.set('6,7,0', {type: 'knight', color: 'white'});
  board.set('7,7,0', {type: 'rook', color: 'white'});
  for(let i=0; i<8; i++) board.set(`${i},6,0`, {type: 'pawn', color: 'white'});
}

initBoard();

console.log('=== GAME ANALYSIS ===\n');

let issues = [];

for(let i = 0; i < moves.length; i++) {
  const m = moves[i];
  const isWhite = i % 2 === 1;
  const match = m.match(/(\w+) \((\d+),(\d+),(\d+)\)→\((\d+),(\d+),(\d+)\)( x\w+)?/);
  
  if(!match) continue;
  
  const [_, piece, fx, fy, fz, tx, ty, tz, cap] = match;
  const fromKey = `${fx},${fy},${fz}`;
  const toKey = `${tx},${ty},${tz}`;
  const to = {x: parseInt(tx), y: parseInt(ty), z: parseInt(tz)};
  
  // Track king positions
  if(piece === 'king') {
    if(isWhite) {
      whiteKing = to;
    } else {
      blackKing = to;
    }
  }
  
  // Check what piece is actually at the source
  const actualPiece = board.get(fromKey);
  if(!actualPiece) {
    issues.push({
      move: i+1,
      text: m,
      issue: `No piece at source position (${fx},${fy},${fz})!`
    });
  } else if(actualPiece.type !== piece) {
    issues.push({
      move: i+1,
      text: m,
      issue: `Expected ${piece} at (${fx},${fy},${fz}) but found ${actualPiece.type}!`
    });
  }
  
  // Check capture logic
  if(cap) {
    const destPiece = board.get(toKey);
    const capturedColor = cap.includes('xwhite') ? 'white' : cap.includes('xblack') ? 'black' : 'opponent';
    
    if(!destPiece) {
      issues.push({
        move: i+1,
        text: m,
        issue: `Capture indicated but no piece at destination (${tx},${ty},${tz})!`
      });
    } else {
      // Check if captured color matches
      if(capturedColor === 'white' && destPiece.color !== 'white') {
        issues.push({
          move: i+1,
          text: m,
          issue: `Says "xwhite" but captured piece is ${destPiece.color} ${destPiece.type}!`
        });
      } else if(capturedColor === 'black' && destPiece.color !== 'black') {
        issues.push({
          move: i+1,
          text: m,
          issue: `Says "xblack" but captured piece is ${destPiece.color} ${destPiece.type}!`
        });
      }
      
      // Check if capturing own piece
      if(actualPiece && destPiece.color === actualPiece.color) {
        issues.push({
          move: i+1,
          text: m,
          issue: `ILLEGAL: ${actualPiece.color} ${piece} capturing own ${destPiece.color} ${destPiece.type}!`
        });
      }
      
      // Check for king capture
      if(destPiece.type === 'king') {
        issues.push({
          move: i+1,
          text: m,
          issue: `🚨 CRITICAL: ${destPiece.color.toUpperCase()} KING CAPTURED! Game should have ended.`
        });
      }
    }
  }
  
  // Execute move on our simulated board
  if(actualPiece) {
    board.delete(fromKey);
    board.set(toKey, actualPiece);
  }
}

console.log(`Total moves: ${moves.length}`);
console.log(`Issues found: ${issues.length}\n`);

if(issues.length > 0) {
  console.log('ISSUES DETECTED:\n');
  issues.forEach(issue => {
    console.log(`Move ${issue.move}: ${issue.text}`);
    console.log(`  ⚠️  ${issue.issue}`);
    console.log('');
  });
} else {
  console.log('✅ No issues detected - all moves appear valid!');
}

console.log('\nFinal king positions:');
console.log(`White king: (${whiteKing.x},${whiteKing.y},${whiteKing.z})`);
console.log(`Black king: (${blackKing.x},${blackKing.y},${blackKing.z})`);

// Check if kings still exist on board
const whiteKingExists = board.get(`${whiteKing.x},${whiteKing.y},${whiteKing.z}`)?.type === 'king';
const blackKingExists = board.get(`${blackKing.x},${blackKing.y},${blackKing.z}`)?.type === 'king';

console.log(`\nKing status:`);
console.log(`White king present: ${whiteKingExists ? '✅' : '❌ MISSING!'}`);
console.log(`Black king present: ${blackKingExists ? '✅' : '❌ MISSING!'}`);
