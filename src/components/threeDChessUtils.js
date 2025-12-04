// Basic 3D chess move validators for rook, bishop, and knight.
// Coordinates are objects: { x, y, z }

function delta(a, b) {
  return { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
}

function absDelta(a, b) {
  const d = delta(a, b);
  return { x: Math.abs(d.x), y: Math.abs(d.y), z: Math.abs(d.z) };
}

// Rook: moves along exactly one axis any distance
export function isRookMove(from, to) {
  const d = absDelta(from, to);
  const axesMoved = [d.x > 0, d.y > 0, d.z > 0].filter(Boolean).length;
  return axesMoved === 1;
}

// Bishop: moves along diagonals in any plane or full 3D diagonal
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

// Knight: any permutation of (2,1,0) across axes with positive values
export function isKnightMove(from, to) {
  const d = absDelta(from, to);
  const vals = [d.x, d.y, d.z].sort((a, b) => b - a); // descending
  return vals[0] === 2 && vals[1] === 1 && vals[2] === 0;
}

// Queen: combination of rook and bishop in 3D
export function isQueenMove(from, to) {
  return isRookMove(from, to) || isBishopMove(from, to);
}

// Pawn: forward movement (1 or 2 from start), diagonal capture
// color: 'white' or 'black'
// isCapture: whether this is a capturing move
// hasMoved: whether this pawn has moved before (for 2-square initial move)
export function isPawnMove(from, to, color, isCapture, hasMoved = false) {
  const d = delta(from, to);
  const direction = color === 'white' ? 1 : -1; // white moves +y, black moves -y
  
  // Must stay on same level for standard pawn movement
  if (d.z !== 0) return false;
  
  // Must not move sideways on x
  if (d.x !== 0) return false;
  
  // Non-capturing: move forward 1 or 2 (if not moved)
  if (!isCapture) {
    if (d.y === direction * 1) return true;
    if (!hasMoved && d.y === direction * 2) return true;
    return false;
  }
  
  // Capturing: diagonal one square (not implemented yet - pawns don't capture diagonally in this simple version)
  // For now, pawns cannot capture
  return false;
}

// King: one square in any direction (including diagonals and vertical)
export function isKingMove(from, to) {
  const d = absDelta(from, to);
  const maxDelta = Math.max(d.x, d.y, d.z);
  return maxDelta === 1;
}

// General validator for allowed piece types
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

// Find the king position for a given color
// piecesMap: Map with keys like 'x,y,z'
// color: 'white' or 'black'
// Returns: { x, y, z } or null if not found
export function findKing(piecesMap, color) {
  for (const [, piece] of piecesMap.entries()) {
    if (piece.type === 'king' && piece.color === color) {
      return piece.pos;
    }
  }
  return null;
}

// Check if a specific square is under attack by opponent
// piecesMap: current board state
// targetPos: position to check if under attack
// attackingColor: color of pieces that might be attacking
// Returns: boolean
export function isSquareUnderAttack(piecesMap, targetPos, attackingColor) {
  for (const [, piece] of piecesMap.entries()) {
    if (piece.color !== attackingColor) continue;
    
    const { pos, type } = piece;
    
    // Skip if same square
    if (pos.x === targetPos.x && pos.y === targetPos.y && pos.z === targetPos.z) continue;
    
    // Check if this piece can move to target position
    let canAttack = false;
    
    if (type === 'pawn') {
      // Pawns attack diagonally (different from forward movement)
      const d = delta(pos, targetPos);
      const direction = attackingColor === 'white' ? 1 : -1;
      // Pawn attacks one square diagonally forward
      if (d.y === direction && Math.abs(d.x) === 1 && d.z === 0) {
        canAttack = true;
      }
    } else if (type === 'king') {
      // King attacks one square in any direction (but we don't check king attacks king)
      canAttack = isKingMove(pos, targetPos);
    } else {
      // For other pieces, use standard move validation (no capture flag needed for attack)
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

// Check if a king is currently in check
// piecesMap: current board state
// kingColor: color of the king to check
// Returns: boolean
export function isInCheck(piecesMap, kingColor) {
  const kingPos = findKing(piecesMap, kingColor);
  if (!kingPos) return false; // No king found
  
  const opponentColor = kingColor === 'white' ? 'black' : 'white';
  return isSquareUnderAttack(piecesMap, kingPos, opponentColor);
}

// Check if a move would leave own king in check
// piecesMap: current board state
// from: source position
// to: destination position
// color: color of the moving piece
// Returns: boolean - true if move is legal (doesn't leave king in check)
export function wouldBeInCheckAfterMove(piecesMap, from, to, color) {
  // Create a temporary board state with the move applied
  const tempMap = new Map(piecesMap);
  
  const fromKey = `${from.x},${from.y},${from.z}`;
  const toKey = `${to.x},${to.y},${to.z}`;
  
  const movingPiece = tempMap.get(fromKey);
  if (!movingPiece) return true; // Invalid move
  
  // Apply the move
  tempMap.delete(fromKey);
  tempMap.set(toKey, { ...movingPiece, pos: to });
  
  // Check if king is in check after this move
  return isInCheck(tempMap, color);
}

// Check if a player is in checkmate
// piecesMap: current board state
// color: color to check for checkmate
// Returns: boolean
export function isCheckmate(piecesMap, color) {
  // Must be in check first
  if (!isInCheck(piecesMap, color)) return false;
  
  // Try all possible moves to see if any can escape check
  for (const [, piece] of piecesMap.entries()) {
    if (piece.color !== color) continue;
    
    const { pos, type } = piece;
    
    // Try all possible destination squares (simplified - iterate board)
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        for (let z = 0; z < 3; z++) {
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
  for (const [, piece] of piecesMap.entries()) {
    if (piece.color !== color) continue;
    
    const { pos, type } = piece;
    
    // Try all possible destination squares
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        for (let z = 0; z < 3; z++) {
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
export function isPathClear(piecesMap, from, to) {
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

// Check if a pawn can promote (reached opposite end)
// white pawns promote at y=7, black pawns at y=0
export function canPromote(pos, color) {
  if (color === 'white' && pos.y === 7) return true;
  if (color === 'black' && pos.y === 0) return true;
  return false;
}

// Detect en passant opportunity
// lastMove: { from, to, piece } - the opponent's last pawn move
// currentPos: position of the pawn attempting en passant
// targetPos: where the pawn wants to move
export function isEnPassant(lastMove, currentPos, targetPos, color) {
  if (!lastMove || lastMove.piece.type !== 'pawn') return false;
  
  const d = delta(lastMove.from, lastMove.to);
  const direction = color === 'white' ? 1 : -1;
  
  // Last move must be a 2-square pawn advance
  if (Math.abs(d.y) !== 2) return false;
  
  // Current pawn must be adjacent to opponent's pawn (same row)
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

// Detect if a move is a castling attempt
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
  
  const baseZ = 0; // standard level
  
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

// Validate castling is legal
// piecesMap: current board state
// kingPos: king's current position
// castlingInfo: result from isCastling()
// color: 'white' or 'black'
// kingHasMoved: whether king has moved before
// rookHasMoved: whether the specific rook has moved before
export function canCastle(piecesMap, kingPos, castlingInfo, color, kingHasMoved, rookHasMoved) {
  if (!castlingInfo.type) return false;
  
  // King and rook must not have moved
  if (kingHasMoved || rookHasMoved) return false;
  
  const { rookFrom } = castlingInfo;
  const rookKey = `${rookFrom.x},${rookFrom.y},${rookFrom.z}`;
  
  // Rook must exist and be correct color
  const rook = piecesMap.get(rookKey);
  if (!rook || rook.type !== 'rook' || rook.color !== color) return false;
  
  // Path between king and rook must be clear
  const minX = Math.min(kingPos.x, rookFrom.x);
  const maxX = Math.max(kingPos.x, rookFrom.x);
  
  for (let x = minX + 1; x < maxX; x++) {
    const key = `${x},${kingPos.y},${kingPos.z}`;
    if (piecesMap.has(key)) return false;
  }
  
  // King must not be in check, and cannot castle through check or into check
  const opponentColor = color === 'white' ? 'black' : 'white';
  
  // King cannot be in check currently
  if (isInCheck(piecesMap, color)) return false;
  
  // Determine squares the king passes through (including destination)
  const direction = castlingInfo.type === 'kingside' ? 1 : -1;
  const squaresToCheck = [
    { x: kingPos.x + direction, y: kingPos.y, z: kingPos.z }, // Square king passes through
    { x: kingPos.x + (direction * 2), y: kingPos.y, z: kingPos.z } // King's destination
  ];
  
  // King cannot pass through or land on a square under attack
  for (const square of squaresToCheck) {
    if (isSquareUnderAttack(piecesMap, square, opponentColor)) {
      return false;
    }
  }
  
  return true;
}
