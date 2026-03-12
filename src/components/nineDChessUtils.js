// 9D Chess move validators - Extended for 9 vertical levels (z=0 to z=8)
// Coordinates are objects: { x, y, z }

function delta(a, b) {
  return { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
}

function absDelta(a, b) {
  const d = delta(a, b);
  return { x: Math.abs(d.x), y: Math.abs(d.y), z: Math.abs(d.z) };
}

// Rook: moves along exactly one axis any distance (works for 9 levels)
export function isRookMove(from, to) {
  const d = absDelta(from, to);
  const axesMoved = [d.x > 0, d.y > 0, d.z > 0].filter(Boolean).length;
  return axesMoved === 1;
}

// Bishop: moves along diagonals in any plane or full 3D diagonal (works for 9 levels)
// - 2D plane diagonal: two axes change by same positive amount, third 0
// - 3D diagonal: all three axes change by same positive amount
export function isBishopMove(from, to) {
  const d = absDelta(from, to);
  const vals = [d.x, d.y, d.z].sort((a, b) => a - b); // ascending
  // plane diagonal: 0, n, n
  if (vals[0] === 0 && vals[1] === vals[2] && vals[1] > 0) return true;
  // full 3D diagonal: n, n, n
  if (vals[0] === vals[1] && vals[1] === vals[2] && vals[0] > 0) return true;
  return false;
}

// Knight: any permutation of (2,1,0) across axes (works for 9 levels)
export function isKnightMove(from, to) {
  const d = absDelta(from, to);
  const vals = [d.x, d.y, d.z].sort((a, b) => b - a); // descending
  return vals[0] === 2 && vals[1] === 1 && vals[2] === 0;
}

// Queen: combination of rook and bishop in 9D space
export function isQueenMove(from, to) {
  return isRookMove(from, to) || isBishopMove(from, to);
}

// Pawn: forward movement (1 or 2 from start), diagonal capture
// color: 'white' or 'black'
// isCapture: whether this is a capturing move
// hasMoved: whether this pawn has moved before (for 2-square initial move)
// 
// 9D Chess Pawn Rules (Conservative - Pawns stay on birth level):
// - Pawns cannot change z-level
// - White pawns move +y direction (toward y=7)
// - Black pawns move -y direction (toward y=0)
export function isPawnMove(from, to, color, isCapture, hasMoved = false) {
  const d = delta(from, to);
  const direction = color === 'white' ? 1 : -1; // white moves +y, black moves -y
  
  // CONSERVATIVE 9D RULE: Pawns cannot change levels (z must remain the same)
  if (d.z !== 0) return false;
  
  // Non-capturing: move forward 1 or 2 (if not moved), no sideways
  if (!isCapture) {
    if (d.x !== 0) return false; // No sideways on non-capture
    if (d.y === direction * 1) return true;
    if (!hasMoved && d.y === direction * 2) return true;
    return false;
  }
  
  // Capturing: diagonal one square forward (standard chess diagonal capture)
  if (isCapture) {
    if (d.y === direction * 1 && Math.abs(d.x) === 1) return true;
    return false;
  }
  
  return false;
}

// King: one square in any direction (including diagonals and vertical in 9D space)
export function isKingMove(from, to) {
  const d = absDelta(from, to);
  const maxDelta = Math.max(d.x, d.y, d.z);
  return maxDelta === 1;
}

// General validator for allowed piece types in 9D chess
export function isValidMove(pieceType, from, to, color, isCapture, hasMoved) {
  if (from.x === to.x && from.y === to.y && from.z === to.z) return false;
  switch ((pieceType || '').toLowerCase()) {
    case 'rook':
      return isRookMove(from, to);
    case 'bishop':
      return isBishopMove(from, to);
    case 'queen':
      return isQueenMove(from, to);
    case 'knight':
      return isKnightMove(from, to);
    case 'pawn':
      return isPawnMove(from, to, color, isCapture, hasMoved);
    case 'king':
      return isKingMove(from, to);
    default:
      return false;
  }
}

const chessUtils = { isRookMove, isBishopMove, isKnightMove, isQueenMove, isPawnMove, isKingMove, isValidMove };
export default chessUtils;

// Find a king position for a given color (9D chess has 3 kings per color)
// piecesMap: Map with keys like 'x,y,z'
// color: 'white' or 'black'
// Returns: { x, y, z } of first king found, or null if no king found
export function findKing(piecesMap, color) {
  for (const [key, piece] of piecesMap.entries()) {
    if (piece.type === 'king' && piece.color === color) {
      const [x, y, z] = key.split(',').map(Number);
      return { x, y, z };
    }
  }
  return null;
}

// Find all kings for a given color (9D chess specific - returns array of positions)
// piecesMap: Map with keys like 'x,y,z'
// color: 'white' or 'black'
// Returns: array of { x, y, z } positions
export function findAllKings(piecesMap, color) {
  const kings = [];
  for (const [key, piece] of piecesMap.entries()) {
    if (piece.type === 'king' && piece.color === color) {
      const [x, y, z] = key.split(',').map(Number);
      kings.push({ x, y, z });
    }
  }
  return kings;
}

// Check if a specific square is under attack by opponent
// piecesMap: current board state
// targetPos: position to check if under attack
// attackingColor: color of pieces that might be attacking
// Returns: boolean
export function isSquareUnderAttack(piecesMap, targetPos, attackingColor) {
  for (const [key, piece] of piecesMap.entries()) {
    if (piece.color !== attackingColor) continue;
    
    const [x, y, z] = key.split(',').map(Number);
    const pos = { x, y, z };
    const { type } = piece;
    
    // Skip if same square
    if (pos.x === targetPos.x && pos.y === targetPos.y && pos.z === targetPos.z) continue;
    
    // Check if this piece can move to target position
    let canAttack = false;
    
    if (type === 'pawn') {
      // Pawns attack diagonally (different from forward movement)
      const d = delta(pos, targetPos);
      const direction = attackingColor === 'white' ? 1 : -1;
      // Pawn attacks one square diagonally forward on same level
      if (d.y === direction && Math.abs(d.x) === 1 && d.z === 0) {
        canAttack = true;
      }
    } else if (type === 'king') {
      // King attacks one square in any direction
      canAttack = isKingMove(pos, targetPos);
    } else {
      // For other pieces, use standard move validation
      canAttack = isValidMove(type, pos, targetPos, attackingColor, false, false);
    }
    
    if (!canAttack) continue;
    
    // For sliding pieces (rook, bishop, queen), check path is clear
    if (['rook', 'bishop', 'queen'].includes(type)) {
      if (!isPathClear(piecesMap, pos, targetPos)) continue;
    }
    
    return true; // Found an attacking piece
  }
  
  return false;
}

// Check if ANY king of a color is currently in check (9D specific)
// piecesMap: current board state
// kingColor: color of the kings to check
// Returns: boolean - true if at least one king is in check
export function isInCheck(piecesMap, kingColor) {
  const kings = findAllKings(piecesMap, kingColor);
  if (kings.length === 0) return false; // No kings found
  
  const opponentColor = kingColor === 'white' ? 'black' : 'white';
  
  // Check if ANY king is under attack
  for (const kingPos of kings) {
    if (isSquareUnderAttack(piecesMap, kingPos, opponentColor)) {
      return true; // At least one king is in check
    }
  }
  
  return false;
}

// Check if a move would leave own king(s) in check
// piecesMap: current board state
// from: source position
// to: destination position
// color: color of the moving piece
// Returns: boolean - true if move would result in check (illegal)
export function wouldBeInCheckAfterMove(piecesMap, from, to, color) {
  // Create a temporary board state with the move applied
  const tempMap = new Map();
  
  // Deep copy all pieces
  piecesMap.forEach((piece, key) => {
    tempMap.set(key, { ...piece });
  });
  
  const fromKey = `${from.x},${from.y},${from.z}`;
  const toKey = `${to.x},${to.y},${to.z}`;
  
  const movingPiece = tempMap.get(fromKey);
  if (!movingPiece) return true; // Invalid move
  
  // Apply the move
  tempMap.delete(fromKey);
  if (tempMap.has(toKey)) {
    tempMap.delete(toKey); // Remove captured piece
  }
  tempMap.set(toKey, movingPiece);
  
  // Check if any king is in check after this move
  return isInCheck(tempMap, color);
}

// Check if a player is in checkmate (9D: all kings must be safe to avoid checkmate)
// piecesMap: current board state
// color: color to check for checkmate
// Returns: boolean
export function isCheckmate(piecesMap, color) {
  // Must be in check first
  if (!isInCheck(piecesMap, color)) return false;
  
  // Try all possible moves to see if any can escape check
  for (const [key, piece] of piecesMap.entries()) {
    if (piece.color !== color) continue;
    
    const [px, py, pz] = key.split(',').map(Number);
    const pos = { x: px, y: py, z: pz };
    const { type } = piece;
    
    // Try all possible destination squares in 9D space
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        for (let z = 0; z < 9; z++) { // 9 levels in 9D chess
          const to = { x, y, z };
          const toKey = `${x},${y},${z}`;
          
          // Skip if same position
          if (pos.x === x && pos.y === y && pos.z === z) continue;
          
          // Skip if occupied by own piece
          const targetPiece = piecesMap.get(toKey);
          if (targetPiece && targetPiece.color === color) continue;
          
          const isCapture = !!targetPiece;
          
          // Check if move is valid for this piece type
          if (!isValidMove(type, pos, to, color, isCapture, piece.hasMoved)) continue;
          
          // For sliding pieces, check path
          if (['rook', 'bishop', 'queen'].includes(type)) {
            if (!isPathClear(piecesMap, pos, to)) continue;
          }
          
          // Check if this move would leave king in check
          if (!wouldBeInCheckAfterMove(piecesMap, pos, to, color)) {
            return false; // Found a legal move that escapes check
          }
        }
      }
    }
  }
  
  return true; // No legal moves found - checkmate
}

// Check if a player is in stalemate (not in check, but no legal moves)
// piecesMap: current board state
// color: color to check for stalemate
// Returns: boolean
export function isStalemate(piecesMap, color) {
  // Must NOT be in check
  if (isInCheck(piecesMap, color)) return false;
  
  // Check if there are any legal moves
  for (const [key, piece] of piecesMap.entries()) {
    if (piece.color !== color) continue;
    
    const [px, py, pz] = key.split(',').map(Number);
    const pos = { x: px, y: py, z: pz };
    const { type } = piece;
    
    // Try all possible destination squares in 9D space
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        for (let z = 0; z < 9; z++) { // 9 levels
          const to = { x, y, z };
          const toKey = `${x},${y},${z}`;
          
          // Skip if same position
          if (pos.x === x && pos.y === y && pos.z === z) continue;
          
          // Skip if occupied by own piece
          const targetPiece = piecesMap.get(toKey);
          if (targetPiece && targetPiece.color === color) continue;
          
          const isCapture = !!targetPiece;
          
          // Check if move is valid for this piece type
          if (!isValidMove(type, pos, to, color, isCapture, piece.hasMoved)) continue;
          
          // For sliding pieces, check path
          if (['rook', 'bishop', 'queen'].includes(type)) {
            if (!isPathClear(piecesMap, pos, to)) continue;
          }
          
          // Check if this move would leave king in check
          if (!wouldBeInCheckAfterMove(piecesMap, pos, to, color)) {
            return false; // Found a legal move
          }
        }
      }
    }
  }
  
  return true; // No legal moves found - stalemate
}

// Check that all intermediate squares between `from` and `to` are empty.
// `piecesMap` is a Map with keys like 'x,y,z'. Excludes `from` and `to` positions.
// Works for paths through 9 levels
export function isPathClear(piecesMap, from, to, pieceType = null) {
  // Knights can jump over pieces, no path checking needed
  if (pieceType && pieceType.toLowerCase() === 'knight') return true;
  
  const d = delta(from, to);
  const step = { x: Math.sign(d.x), y: Math.sign(d.y), z: Math.sign(d.z) };

  // Determine number of steps: maximum absolute delta among axes
  const steps = Math.max(Math.abs(d.x), Math.abs(d.y), Math.abs(d.z));
  if (steps <= 1) return true; // adjacent or same square, nothing between

  let cx = from.x + step.x;
  let cy = from.y + step.y;
  let cz = from.z + step.z;
  for (let i = 1; i < steps; i++) {
    const key = `${cx},${cy},${cz}`;
    if (piecesMap.has(key)) return false;
    cx += step.x;
    cy += step.y;
    cz += step.z;
  }
  return true;
}

// Check if a pawn can promote (reached opposite end on any level)
// white pawns promote at y=7, black pawns at y=0
export function canPromote(pos, color) {
  if (color === 'white' && pos.y === 7) return true;
  if (color === 'black' && pos.y === 0) return true;
  return false;
}

// Detect en passant opportunity (same level only in 9D)
// lastMove: { from, to, piece } - the opponent's last pawn move
// currentPos: position of the pawn attempting en passant
// targetPos: where the pawn wants to move
export function isEnPassant(lastMove, currentPos, targetPos, color) {
  if (!lastMove || lastMove.piece.type !== 'pawn') return false;
  
  const d = delta(lastMove.from, lastMove.to);
  const direction = color === 'white' ? 1 : -1;
  
  // Last move must be a 2-square pawn advance
  if (Math.abs(d.y) !== 2) return false;
  
  // Current pawn must be adjacent to opponent's pawn (same row and level)
  if (currentPos.y !== lastMove.to.y) return false;
  if (currentPos.z !== lastMove.to.z) return false;
  if (Math.abs(currentPos.x - lastMove.to.x) !== 1) return false;
  
  // Target must be diagonal forward from current position
  const td = delta(currentPos, targetPos);
  if (td.y !== direction * 1) return false;
  if (td.x !== (lastMove.to.x - currentPos.x)) return false;
  if (td.z !== 0) return false;
  
  return true;
}

// Detect if a move is a castling attempt (can happen on any level in 9D chess)
// Returns: { type: 'kingside' | 'queenside' | null, rookFrom, rookTo }
export function isCastling(from, to, color) {
  const d = delta(from, to);
  
  // King must start from x=4
  if (from.x !== 4) return { type: null };
  
  // Must be on correct rank for color
  const baseY = color === 'white' ? 0 : 7;
  if (from.y !== baseY || to.y !== baseY) return { type: null };
  
  // Must be on same level
  if (d.z !== 0) return { type: null };
  
  // King moves exactly 2 squares horizontally
  if (Math.abs(d.x) !== 2) return { type: null };
  
  // Use king's current z-level for castling
  const baseZ = from.z;
  
  if (d.x === 2) {
    // Kingside castling (king moves right)
    return {
      type: 'kingside',
      rookFrom: { x: 7, y: baseY, z: baseZ },
      rookTo: { x: 5, y: baseY, z: baseZ },
    };
  } else if (d.x === -2) {
    // Queenside castling (king moves left)
    return {
      type: 'queenside',
      rookFrom: { x: 0, y: baseY, z: baseZ },
      rookTo: { x: 3, y: baseY, z: baseZ },
    };
  }
  
  return { type: null };
}

// Check if castling is allowed (king and rook haven't moved, path is clear, not in check)
// piecesMap: current board state
// from: king's current position
// to: king's target position
// color: 'white' or 'black'
// Returns: boolean
export function canCastle(piecesMap, from, to, color) {
  const castlingInfo = isCastling(from, to, color);
  if (!castlingInfo.type) return false;
  
  const fromKey = `${from.x},${from.y},${from.z}`;
  const king = piecesMap.get(fromKey);
  if (!king || king.hasMoved) return false;
  
  // Check rook exists and hasn't moved
  const rookKey = `${castlingInfo.rookFrom.x},${castlingInfo.rookFrom.y},${castlingInfo.rookFrom.z}`;
  const rook = piecesMap.get(rookKey);
  if (!rook || rook.type !== 'rook' || rook.hasMoved) return false;
  
  // Check path between king and rook is clear
  if (!isPathClear(piecesMap, from, castlingInfo.rookFrom)) return false;
  
  // Check king is not in check
  if (isInCheck(piecesMap, color)) return false;
  
  // Check king doesn't pass through check
  const step = Math.sign(to.x - from.x);
  for (let x = from.x; x !== to.x + step; x += step) {
    const checkPos = { x, y: from.y, z: from.z };
    if (isSquareUnderAttack(piecesMap, checkPos, color === 'white' ? 'black' : 'white')) {
      return false;
    }
  }
  
  return true;
}
