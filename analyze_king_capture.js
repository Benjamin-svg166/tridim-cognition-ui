const moves = `rook (0,0,2)→(0,0,0)
pawn (3,6,0)→(3,4,0)
rook (0,0,0)→(0,6,0) xopponent
rook (0,7,0)→(0,6,0) xwhite
knight (1,0,2)→(0,0,0)
pawn (4,6,0)→(4,5,0)
bishop (2,0,2)→(0,2,0)
bishop (5,7,0)→(0,2,0) xwhite
queen (3,0,2)→(1,0,0)
knight (6,7,0)→(4,6,0)
queen (1,0,0)→(1,6,0) xopponent
rook (0,6,0)→(1,6,0) xwhite
king (4,0,2)→(3,0,1)
king (4,7,0)→(6,7,0)
bishop (5,0,2)→(3,0,0)
rook (1,6,0)→(0,6,0)
knight (6,0,2)→(5,0,0)
bishop (0,2,0)→(1,1,1)
rook (7,0,2)→(7,0,0)
king (6,7,0)→(7,7,1)
rook (7,0,0)→(7,6,0) xopponent
king (7,7,1)→(7,6,0) xwhite
pawn (0,1,2)→(0,2,2)
rook (0,6,0)→(0,0,0) xwhite
pawn (1,1,2)→(1,2,2)
pawn (2,6,0)→(2,4,0)
pawn (2,1,2)→(2,2,2)
pawn (2,4,0)→(2,3,0)
pawn (3,1,2)→(3,2,2)
pawn (2,3,0)→(2,2,0)
pawn (4,1,2)→(4,2,2)
king (7,6,0)→(6,7,1)
pawn (5,1,2)→(5,2,2)
king (6,7,1)→(6,7,2)
pawn (6,1,2)→(6,2,2)
king (6,7,2)→(7,7,2)
pawn (7,1,2)→(7,2,2)
king (7,7,2)→(7,7,1)
king (3,0,1)→(4,0,0)
king (7,7,1)→(7,7,2)
knight (5,0,0)→(3,1,0)
king (7,7,2)→(7,7,1)
knight (3,1,0)→(1,1,1) xopponent
king (7,7,1)→(7,6,2)
pawn (0,2,2)→(0,3,2)
pawn (3,4,0)→(3,3,0)
pawn (1,2,2)→(1,3,2)
pawn (3,3,0)→(3,2,0)
pawn (2,2,2)→(2,3,2)
pawn (2,2,0)→(2,1,0)
pawn (3,2,2)→(3,3,2)
queen (2,1,0)→(3,0,0) xwhite
king (4,0,0)→(5,1,0)
rook (0,0,0)→(2,0,0)
pawn (4,2,2)→(4,3,2)
queen (3,0,0)→(5,2,2) xwhite
pawn (6,2,2)→(6,3,2)
queen (5,2,2)→(7,2,2) xwhite
knight (1,1,1)→(1,3,0)
king (7,6,2)→(7,5,2)
knight (1,3,0)→(3,2,0) xopponent
rook (2,0,0)→(2,3,0)
pawn (0,3,2)→(0,4,2)
queen (7,2,2)→(6,3,2) xwhite
pawn (1,3,2)→(1,4,2)
queen (6,3,2)→(4,3,2) xwhite
pawn (2,3,2)→(2,4,2)
queen (4,3,2)→(3,3,2) xwhite
knight (3,2,0)→(3,3,2) xopponent
king (7,5,2)→(7,4,2)
knight (3,3,2)→(2,3,0) xopponent
king (7,4,2)→(6,4,2)
king (5,1,0)→(4,0,0)
bishop (2,7,0)→(0,5,2)
pawn (1,4,2)→(0,5,2) xopponent
queen (3,7,0)→(3,3,0)
pawn (2,4,2)→(2,5,2)
queen (3,3,0)→(2,3,1)
knight (2,3,0)→(0,2,0)
king (6,4,2)→(5,4,2)
king (4,0,0)→(3,0,0)
king (5,4,2)→(4,4,2)
pawn (0,5,2)→(0,6,2)
queen (2,3,1)→(2,4,2)
pawn (0,4,2)→(0,5,2)
queen (2,4,2)→(2,5,2) xwhite
knight (0,2,0)→(1,0,0)
queen (2,5,2)→(1,5,2)
king (3,0,0)→(2,0,0)
queen (1,5,2)→(0,5,2) xwhite
pawn (0,6,2)→(0,7,2)
king (4,4,2)→(5,5,2)
knight (1,0,0)→(0,2,0)
queen (0,5,2)→(0,7,2) xwhite
king (2,0,0)→(1,0,0)
knight (1,7,0)→(0,5,0)
knight (0,2,0)→(1,4,0)
king (5,5,2)→(5,4,2)
king (1,0,0)→(0,0,0)
knight (0,5,0)→(2,4,0)
knight (1,4,0)→(0,2,0)
queen (0,7,2)→(3,7,2)
king (0,0,0)→(0,1,0)
rook (5,7,0)→(2,7,0)
knight (0,2,0)→(1,0,0)`.split('\n');

let whiteKing = {x:4, y:7, z:0};
let blackKing = {x:4, y:0, z:2};

console.log('Analyzing move history for king captures...\n');

for(let i = 0; i < moves.length; i++) {
  const m = moves[i];
  const isWhite = i % 2 === 1;
  const match = m.match(/(\w+) \((\d+),(\d+),(\d+)\)→\((\d+),(\d+),(\d+)\)( x\w+)?/);
  
  if(!match) continue;
  
  const [_, piece, fx, fy, fz, tx, ty, tz, cap] = match;
  const to = {x: parseInt(tx), y: parseInt(ty), z: parseInt(tz)};
  
  // Track king positions
  if(piece === 'king') {
    if(isWhite) {
      whiteKing = to;
    } else {
      blackKing = to;
    }
  }
  
  // Check for king captures
  if(cap && cap.includes('xwhite')) {
    if(to.x === whiteKing.x && to.y === whiteKing.y && to.z === whiteKing.z) {
      console.log('🚨 WHITE KING CAPTURED!');
      console.log('Move', i+1, ':', m);
      console.log('White king was at:', whiteKing);
      console.log('');
    }
  }
  
  if(cap && cap.includes('xblack')) {
    if(to.x === blackKing.x && to.y === blackKing.y && to.z === blackKing.z) {
      console.log('🚨 BLACK KING CAPTURED!');
      console.log('Move', i+1, ':', m);
      console.log('Black king was at:', blackKing);
      console.log('');
    }
  }
}

console.log('Final positions:');
console.log('White king:', whiteKing);
console.log('Black king:', blackKing);
