const moves = `rook (0,0,2)→(0,0,0)
pawn (4,6,0)→(4,4,0)
rook (0,0,0)→(0,6,0) xblack
rook (0,7,0)→(0,6,0) xwhite
knight (1,0,2)→(0,0,0)
bishop (5,7,0)→(3,5,2)
bishop (2,0,2)→(0,2,0)
knight (6,7,0)→(4,6,0)
bishop (0,2,0)→(4,6,0) xblack
queen (3,7,0)→(4,6,1)
queen (3,0,2)→(1,0,0)
queen (4,6,1)→(1,6,1)
queen (1,0,0)→(1,6,0) xblack
rook (0,6,0)→(1,6,0) xwhite
king (4,0,2)→(3,0,1)
bishop (3,5,2)→(6,2,2)
pawn (5,1,2)→(6,2,2) xblack
queen (1,6,1)→(1,4,1)
bishop (5,0,2)→(3,0,0)
queen (1,4,1)→(3,4,1)
king (3,0,1)→(2,0,0)
pawn (3,6,0)→(3,5,0)
bishop (4,6,0)→(3,5,0) xblack
pawn (2,6,0)→(3,5,0) xwhite
knight (6,0,2)→(5,0,0)
king (4,7,0)→(6,7,0)
rook (7,0,2)→(7,0,0)
bishop (2,7,0)→(2,6,1)
rook (7,0,0)→(7,6,0) xblack
king (6,7,0)→(7,6,0) xwhite
pawn (0,1,2)→(0,2,2)
knight (1,7,0)→(3,6,0)
pawn (1,1,2)→(1,2,2)
knight (3,6,0)→(2,4,0)
pawn (2,1,2)→(2,2,2)
knight (2,4,0)→(4,3,0)
pawn (3,1,2)→(3,2,2)
bishop (2,6,1)→(2,5,2)
pawn (4,1,2)→(4,2,2)
queen (3,4,1)→(5,4,1)
pawn (6,1,2)→(6,3,2)
queen (5,4,1)→(6,3,2) xwhite
pawn (7,1,2)→(7,2,2)
queen (6,3,2)→(7,2,2) xwhite
knight (0,0,0)→(1,2,0)
bishop (2,5,2)→(3,5,1)
pawn (6,2,2)→(6,3,2)
bishop (3,5,1)→(3,4,2)
bishop (3,0,0)→(2,1,0)
pawn (3,5,0)→(3,4,0)
bishop (2,1,0)→(4,3,0) xblack
pawn (6,6,0)→(6,5,0)
bishop (4,3,0)→(3,4,0) xblack
queen (7,2,2)→(4,2,2) xwhite
king (2,0,0)→(1,0,0)
rook (5,7,0)→(3,7,0)
bishop (3,4,0)→(1,6,0) xblack
queen (4,2,2)→(3,2,2) xwhite
king (1,0,0)→(0,0,0)
bishop (3,4,2)→(1,2,2) xwhite
knight (5,0,0)→(3,1,0)
rook (3,7,0)→(3,2,0)
knight (3,1,0)→(3,2,2) xblack
bishop (1,2,2)→(4,5,2)
pawn (0,2,2)→(0,3,2)
bishop (4,5,2)→(6,3,2) xwhite
pawn (2,2,2)→(2,3,2)
bishop (6,3,2)→(6,2,1)
knight (1,2,0)→(0,4,0)
pawn (4,4,0)→(4,3,0)
bishop (1,6,0)→(4,3,0) xblack
bishop (6,2,1)→(5,2,2)
bishop (4,3,0)→(3,2,0) xblack
bishop (5,2,2)→(3,2,0) xwhite
king (0,0,0)→(0,1,0)
pawn (6,5,0)→(6,4,0)
knight (3,2,2)→(2,2,0)
pawn (6,4,0)→(6,3,0)
pawn (0,3,2)→(0,4,2)
pawn (6,3,0)→(6,2,0)
pawn (2,3,2)→(2,4,2)
pawn (5,6,0)→(5,5,0)
knight (0,4,0)→(1,2,0)
king (7,6,0)→(6,6,1)
king (0,1,0)→(0,0,0)
pawn (5,5,0)→(5,4,0)
knight (2,2,0)→(0,1,0)
pawn (5,4,0)→(5,3,0)
pawn (0,4,2)→(0,5,2)
pawn (5,3,0)→(5,2,0)
pawn (2,4,2)→(2,5,2)
pawn (5,2,0)→(5,1,0)
knight (1,2,0)→(0,4,0)
pawn (6,2,0)→(6,1,0)
king (0,0,0)→(1,1,0)
queen (5,1,0)→(5,0,0)
knight (0,1,0)→(1,3,0)
queen (6,1,0)→(6,0,0)
knight (1,3,0)→(3,2,0) xblack
queen (5,0,0)→(3,2,2)
pawn (0,5,2)→(0,6,2)
queen (3,2,2)→(0,5,2)
knight (0,4,0)→(0,5,2) xblack
king (6,6,1)→(5,7,2)
pawn (2,5,2)→(2,6,2)
king (5,7,2)→(4,7,2)
king (1,1,0)→(0,1,0)
queen (6,0,0)→(4,2,2)
knight (3,2,0)→(4,2,2) xblack
king (4,7,2)→(3,6,2)
pawn (0,6,2)→(0,7,2)
king (3,6,2)→(2,6,1)
knight (0,5,2)→(0,4,0)`.split('\n');

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
let captureCount = {white: 0, black: 0};

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
      issue: `❌ No piece at source position (${fx},${fy},${fz})!`
    });
  } else if(actualPiece.type !== piece) {
    issues.push({
      move: i+1,
      text: m,
      issue: `❌ Expected ${piece} at (${fx},${fy},${fz}) but found ${actualPiece.type}!`
    });
  }
  
  // Check capture logic
  if(cap) {
    const destPiece = board.get(toKey);
    const capturedColorStr = cap.trim().substring(2); // Remove " x"
    
    if(!destPiece) {
      issues.push({
        move: i+1,
        text: m,
        issue: `❌ Capture indicated but no piece at destination (${tx},${ty},${tz})!`
      });
    } else {
      // Check if captured color matches
      if(capturedColorStr !== destPiece.color) {
        issues.push({
          move: i+1,
          text: m,
          issue: `🐛 Says "x${capturedColorStr}" but captured piece is ${destPiece.color} ${destPiece.type}!`
        });
      } else {
        // Correct capture
        if(destPiece.color === 'white') captureCount.white++;
        else captureCount.black++;
      }
      
      // Check if capturing own piece
      if(actualPiece && destPiece.color === actualPiece.color) {
        issues.push({
          move: i+1,
          text: m,
          issue: `🚫 ILLEGAL: ${actualPiece.color} ${piece} capturing own ${destPiece.color} ${destPiece.type}!`
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
console.log(`\nCapture statistics:`);
console.log(`  White pieces captured: ${captureCount.white}`);
console.log(`  Black pieces captured: ${captureCount.black}`);
console.log(`\nIssues found: ${issues.length}\n`);

if(issues.length > 0) {
  console.log('ISSUES DETECTED:\n');
  
  // Group issues by type
  const colorMismatches = issues.filter(i => i.issue.includes('Says "x'));
  const kingCaptures = issues.filter(i => i.issue.includes('KING CAPTURED'));
  const otherIssues = issues.filter(i => !i.issue.includes('Says "x') && !i.issue.includes('KING CAPTURED'));
  
  if(colorMismatches.length > 0) {
    console.log(`⚠️  CAPTURE COLOR MISMATCHES (${colorMismatches.length}):\n`);
    colorMismatches.forEach(issue => {
      console.log(`  Move ${issue.move}: ${issue.text}`);
      console.log(`    ${issue.issue}`);
    });
    console.log('');
  }
  
  if(kingCaptures.length > 0) {
    console.log(`🚨 KING CAPTURES (${kingCaptures.length}):\n`);
    kingCaptures.forEach(issue => {
      console.log(`  Move ${issue.move}: ${issue.text}`);
      console.log(`    ${issue.issue}`);
    });
    console.log('');
  }
  
  if(otherIssues.length > 0) {
    console.log(`❌ OTHER ISSUES (${otherIssues.length}):\n`);
    otherIssues.forEach(issue => {
      console.log(`  Move ${issue.move}: ${issue.text}`);
      console.log(`    ${issue.issue}`);
    });
    console.log('');
  }
} else {
  console.log('✅ No issues detected - all moves appear valid!');
}

console.log('Final king positions:');
console.log(`  White king: (${whiteKing.x},${whiteKing.y},${whiteKing.z})`);
console.log(`  Black king: (${blackKing.x},${blackKing.y},${blackKing.z})`);

// Check if kings still exist on board
const whiteKingExists = board.get(`${whiteKing.x},${whiteKing.y},${whiteKing.z}`)?.type === 'king';
const blackKingExists = board.get(`${blackKing.x},${blackKing.y},${blackKing.z}`)?.type === 'king';

console.log(`\nKing status:`);
console.log(`  White king present: ${whiteKingExists ? '✅ YES' : '❌ MISSING!'}`);
console.log(`  Black king present: ${blackKingExists ? '✅ YES' : '❌ MISSING!'}`);

if(whiteKingExists && blackKingExists) {
  console.log('\n✅ GAME STATE VALID: Both kings present, no illegal captures detected');
} else {
  console.log('\n❌ GAME STATE INVALID: King(s) missing from board!');
}
