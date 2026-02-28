// Chess AI for computer opponent
import { isValidMove, isPathClear, wouldBeInCheckAfterMove } from './threeDChessUtils';

// Piece values for evaluation
const PIECE_VALUES = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 100
};

/**
 * Get all legal moves for a given color
 */
export function getAllLegalMoves(piecesMap, color, size = 8) {
  const moves = [];
  
  piecesMap.forEach((piece, key) => {
    if (piece.color !== color) return;
    
    const from = piece.pos;
    
    // Check all possible destination squares across all 3 boards
    for (let z = 0; z < 3; z++) {
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          const to = { x, y, z };
          const toKey = `${x},${y},${z}`;
          
          // Skip same position
          if (from.x === x && from.y === y && from.z === z) continue;
          
          // Skip if occupied by own piece
          const targetPiece = piecesMap.get(toKey);
          if (targetPiece && targetPiece.color === color) continue;
          
          const isCapture = !!targetPiece;
          
          // Check if move is valid
          if (!isValidMove(piece.type, from, to, color, isCapture, piece.hasMoved)) continue;
          
          // Check path clearance for sliding pieces
          if (['rook', 'bishop', 'queen'].includes(piece.type)) {
            if (!isPathClear(piecesMap, from, to)) continue;
          }
          
          // Check if move would leave king in check
          if (wouldBeInCheckAfterMove(piecesMap, from, to, color)) continue;
          
          moves.push({
            from,
            to,
            piece: piece.type,
            fromKey: key,
            toKey,
            isCapture,
            capturedPiece: targetPiece?.type
          });
        }
      }
    }
  });
  
  return moves;
}

/**
 * Evaluate board position for a given color
 * Positive score = good for color, Negative = bad for color
 */
export function evaluatePosition(piecesMap, color) {
  let score = 0;
  
  piecesMap.forEach((piece) => {
    const value = PIECE_VALUES[piece.type] || 0;
    if (piece.color === color) {
      score += value;
    } else {
      score -= value;
    }
  });
  
  return score;
}

/**
 * Select best move using simple evaluation
 * Returns the move object or null if no moves available
 */
export function selectBestMove(piecesMap, color, difficulty = 'easy') {
  const legalMoves = getAllLegalMoves(piecesMap, color);
  
  if (legalMoves.length === 0) return null;
  
  if (difficulty === 'easy') {
    // Random move
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }
  
  if (difficulty === 'medium' || difficulty === 'hard') {
    // Evaluate each move
    let bestMove = null;
    let bestScore = -Infinity;
    
    // Count pieces to detect opening phase (first ~10 moves when 30+ pieces remain)
    const pieceCount = piecesMap.size;
    const isOpening = pieceCount >= 30;
    
    legalMoves.forEach(move => {
      // Create a copy of the board and make the move
      const newPieces = new Map();
      piecesMap.forEach((piece, key) => {
        newPieces.set(key, { ...piece, pos: { ...piece.pos } });
      });
      
      // Execute move on copy
      const movingPiece = newPieces.get(move.fromKey);
      newPieces.delete(move.fromKey);
      if (newPieces.has(move.toKey)) {
        newPieces.delete(move.toKey); // Capture
      }
      movingPiece.pos = { ...move.to };
      newPieces.set(move.toKey, movingPiece);
      
      // Evaluate resulting position
      let score = evaluatePosition(newPieces, color);
      
      // Bonus for captures
      if (move.isCapture) {
        score += (PIECE_VALUES[move.capturedPiece] || 0) * 0.5;
      }
      
      // Add randomness: medium always has some, hard only in opening phase
      let randomFactor = 0;
      if (difficulty === 'medium') {
        randomFactor = (Math.random() - 0.5) * 2;
      } else if (difficulty === 'hard' && isOpening) {
        // Small randomness in opening for variety, but still strategic
        randomFactor = (Math.random() - 0.5) * 0.5;
      }
      
      const finalScore = score + randomFactor;
      
      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestMove = move;
      }
    });
    
    return bestMove;
  }
  
  return legalMoves[0];
}
