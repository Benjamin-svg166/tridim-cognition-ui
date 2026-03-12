// Advanced Chess AI for 9D Chess with Minimax and Alpha-Beta Pruning
import { isValidMove, isPathClear, wouldBeInCheckAfterMove, isInCheck } from './nineDChessUtils';

// Evaluation weights for 9D chess
export const evaluationWeights = {
  material: {
    pawn: 100,
    knight: 320,
    bishop: 330,
    rook: 500,
    queen: 900,
    king: 20000
  },
  centerControl: 30,
  pieceActivity: 10,
  development: 15,
  zoneControl: 25, // Bonus for controlling neutral zone (z=3,4,5)
  checkBonus: 100
};

/**
 * Get piece position value bonus for 9D chess
 */
function getPiecePositionValue(piece, pos, color) {
  const { x, y, z } = pos;
  let bonus = 0;
  
  // Center control (x=3,4 y=3,4)
  const centerDistance = Math.max(Math.abs(x - 3.5), Math.abs(y - 3.5));
  if (centerDistance <= 1) {
    bonus += evaluationWeights.centerControl;
  } else if (centerDistance <= 2) {
    bonus += evaluationWeights.centerControl / 2;
  }
  
  // 9D zone control - neutral zones (z=3, 4, 5) are key
  if (z >= 3 && z <= 5) {
    bonus += evaluationWeights.zoneControl;
  }
  
  // Bonus for advancing toward enemy territory
  if (color === 'white') {
    // White advances toward black's levels (z=0,1,2)
    if (z <= 2) bonus+= evaluationWeights.zoneControl * 2;
    if (z <= 5 && z >= 3) bonus += evaluationWeights.zoneControl;
  } else {
    // Black advances toward white's levels (z=6,7,8)
    if (z >= 6) bonus += evaluationWeights.zoneControl * 2;
    if (z >= 3 && z <= 5) bonus += evaluationWeights.zoneControl;
  }
  
  // Piece-specific bonuses
  if (piece === 'pawn') {
    const advancement = color === 'white' ? (7 - y) : y;
    bonus += advancement * 5;
  } else if (piece === 'knight') {
    bonus += (4 - centerDistance) * 10;
  }
  
  return bonus;
}

/**
 * Calculate piece mobility (simplified for performance)
 */
function calculateMobility(piecesMap, piece, pos, color) {
  let legalMoves = 0;
  
  // Sample movement potential instead of checking all squares
  // This is much faster for 9D space (576 total squares)
  const directions = [
    [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0],
    [0, 0, 1], [0, 0, -1], [1, 1, 0], [1, -1, 0]
  ];
  
  for (const [dx, dy, dz] of directions) {
    let x = pos.x + dx;
    let y = pos.y + dy;
    let z = pos.z + dz;
    
    while (x >= 0 && x < 8 && y >= 0 && y < 8 && z >= 0 && z < 9) {
      const toKey = `${x},${y},${z}`;
      const targetPiece = piecesMap.get(toKey);
      
      if (!targetPiece || targetPiece.color !== color) {
        legalMoves++;
      }
      
      if (targetPiece || piece === 'knight' || piece === 'king') break;
      
      x += dx;
      y += dy;
      z += dz;
    }
  }
  
  return legalMoves;
}

/**
 * Advanced position evaluation for 9D chess
 */
export function evaluatePositionAdvanced(piecesMap, color, depth = 0) {
  let score = 0;
  let whiteMaterial = 0;
  let blackMaterial = 0;
  let whiteMobility = 0;
  let blackMobility = 0;
  let whiteDevelopment = 0;
  let blackDevelopment = 0;
  
  piecesMap.forEach((piece) => {
    const materialValue = evaluationWeights.material[piece.type] || 0;
    const positionValue = getPiecePositionValue(piece.type, piece.pos, piece.color);
    const mobility = calculateMobility(piecesMap, piece.type, piece.pos, piece.color);
    
    // Check if piece is developed (not on starting ranks)
    const isDeveloped = piece.type !== 'pawn' && piece.type !== 'king' && 
                       ((piece.color === 'white' && (piece.pos.y !== 0 || piece.pos.z < 6)) ||
                        (piece.color === 'black' && (piece.pos.y !== 7 || piece.pos.z > 2)));
    
    if (piece.color === 'white') {
      whiteMaterial += materialValue + positionValue;
      whiteMobility += mobility;
      if (isDeveloped) whiteDevelopment++;
    } else {
      blackMaterial += materialValue + positionValue;
      blackMobility += mobility;
      if (isDeveloped) blackDevelopment++;
    }
  });
  
  // Calculate score from perspective of 'color'
  if (color === 'white') {
    score = whiteMaterial - blackMaterial;
    score += (whiteMobility - blackMobility) * evaluationWeights.pieceActivity;
    score += (whiteDevelopment - blackDevelopment) * evaluationWeights.development;
  } else {
    score = blackMaterial - whiteMaterial;
    score += (blackMobility - whiteMobility) * evaluationWeights.pieceActivity;
    score += (blackDevelopment - whiteDevelopment) * evaluationWeights.development;
  }
  
  // Check bonus
  if (isInCheck(piecesMap, color === 'white' ? 'black' : 'white')) {
    score += evaluationWeights.checkBonus;
  }
  
  return score - depth;
}

/**
 * Get all legal moves (optimized for 9D)
 */
export function getAllLegalMovesAdvanced(piecesMap, color, size = 8, levels = 9) {
  const moves = [];
  
  piecesMap.forEach((piece, key) => {
    if (piece.color !== color) return;
    
    const from = piece.pos;
    
    for (let z = 0; z < levels; z++) {
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          const to = { x, y, z };
          const toKey = `${x},${y},${z}`;
          
          if (from.x === x && from.y === y && from.z === z) continue;
          
          const targetPiece = piecesMap.get(toKey);
          if (targetPiece && targetPiece.color === color) continue;
          
          const isCapture = !!targetPiece;
          
          if (!isValidMove(piece.type, from, to, color, isCapture, piece.hasMoved)) continue;
          
          if (['rook', 'bishop', 'queen'].includes(piece.type)) {
            if (!isPathClear(piecesMap, from, to)) continue;
          }
          
          if (wouldBeInCheckAfterMove(piecesMap, from, to, color)) continue;
          
          moves.push({
            from,
            to,
            piece: piece.type,
            fromKey: key,
            toKey,
            isCapture,
            capturedPiece: targetPiece?.type,
            capturedValue: targetPiece ? evaluationWeights.material[targetPiece.type] : 0
          });
        }
      }
    }
  });
  
  return moves;
}

/**
 * Make a move on a board copy
 */
function makeMove(piecesMap, move) {
  const movingPiece = piecesMap.get(move.fromKey);
  
  if (!movingPiece) return null;
  
  const newPieces = new Map();
  piecesMap.forEach((piece, key) => {
    newPieces.set(key, { ...piece, pos: { ...piece.pos }, hasMoved: piece.hasMoved });
  });
  
  newPieces.delete(move.fromKey);
  if (newPieces.has(move.toKey)) {
    newPieces.delete(move.toKey);
  }
  
  const movedPiece = {
    ...movingPiece,
    pos: { ...move.to },
    hasMoved: true
  };
  newPieces.set(move.toKey, movedPiece);
  
  return newPieces;
}

/**
 * Minimax algorithm with alpha-beta pruning
 */
async function minimax(piecesMap, depth, alpha, beta, maximizingPlayer, color, initialDepth = depth, startTime = Date.now(), maxTimeMs = 30000) {
  // Time limit check
  if (Date.now() - startTime > maxTimeMs) {
    return { score: evaluatePositionAdvanced(piecesMap, color), timeoutReached: true };
  }
  
  // Base case
  if (depth === 0) {
    return { score: evaluatePositionAdvanced(piecesMap, color, depth), move: null };
  }
  
  const currentColor = maximizingPlayer ? color : (color === 'white' ? 'black' : 'white');
  const moves = getAllLegalMovesAdvanced(piecesMap, currentColor);
  
  // Game over check
  if (moves.length === 0) {
    const inCheck = isInCheck(piecesMap, currentColor);
    if (inCheck) {
      return { 
        score: maximizingPlayer ? -1000000 + depth : 1000000 - depth, 
        move: null 
      };
    } else {
      return { score: 0, move: null };
    }
  }
  
  // Sort moves (captures first)
  moves.sort((a, b) => (b.capturedValue || 0) - (a.capturedValue || 0));
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    let bestMove = moves[0];
    let moveCounter = 0;
    
    for (const move of moves) {
      const newBoard = makeMove(piecesMap, move);
      if (!newBoard) continue;
      
      const evaluation = await minimax(newBoard, depth - 1, alpha, beta, false, color, initialDepth, startTime, maxTimeMs);
      
      if (evaluation.timeoutReached) {
        return { score: maxEval, move: bestMove, timeoutReached: true };
      }
      
      if (evaluation.score > maxEval) {
        maxEval = evaluation.score;
        bestMove = move;
      }
      
      alpha = Math.max(alpha, evaluation.score);
      if (beta <= alpha) break;
      
      // Yield to browser periodically
      moveCounter++;
      if (depth === initialDepth && moveCounter % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    let bestMove = moves[0];
    let moveCounter = 0;
    
    for (const move of moves) {
      const newBoard = makeMove(piecesMap, move);
      if (!newBoard) continue;
      
      const evaluation = await minimax(newBoard, depth - 1, alpha, beta, true, color, initialDepth, startTime, maxTimeMs);
      
      if (evaluation.timeoutReached) {
        return { score: minEval, move: bestMove, timeoutReached: true };
      }
      
      if (evaluation.score < minEval) {
        minEval = evaluation.score;
        bestMove = move;
      }
      
      beta = Math.min(beta, evaluation.score);
      if (beta <= alpha) break;
      
      // Yield to browser periodically
      moveCounter++;
      if (depth === initialDepth && moveCounter % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    return { score: minEval, move: bestMove };
  }
}

/**
 * Select best move using advanced AI for 9D chess
 */
export async function selectBestMoveAdvanced(piecesMap, color, difficulty = 'hard', useNN = false, moveHistory = [], temperature = 0) {
  const legalMoves = getAllLegalMovesAdvanced(piecesMap, color);
  
  if (legalMoves.length === 0) return null;
  
  // Cap moves in early game for performance (9D has even more moves than 3D!)
  const isEarlyGame = moveHistory.length < 15;
  if ((difficulty === 'hard' || difficulty === 'master') && isEarlyGame && legalMoves.length > 40) {
    legalMoves.sort((a, b) => (b.capturedValue || 0) - (a.capturedValue || 0));
    legalMoves.splice(40);
    console.log(`🎯 9D AI: Limited to top 40 moves (early game optimization)`);
  }
  
  // Difficulty determines depth (reduced for 9D due to larger search space)
  let depth;
  switch (difficulty) {
    case 'easy':
      depth = 1;
      break;
    case 'medium':
      depth = 1;
      break;
    case 'hard':
      depth = 2; // Depth 2 in 9D is like depth 3 in 3D!
      break;
    case 'master':
      depth = 2;
      break;
    default:
      depth = 1;
  }
  
  console.log(`🤖 9D AI thinking (depth ${depth})...`);
  const startTime = Date.now();
  
  const result = await minimax(piecesMap, depth, -Infinity, Infinity, true, color, depth, startTime);
  
  const thinkingTime = ((Date.now() - startTime) /1000).toFixed(2);
  console.log(`✅ Evaluation complete in ${thinkingTime}s`);
  
  if (result.timeoutReached) {
    console.log(`⏰ Time limit reached - returning best move found so far`);
  }
  
  return result.move || legalMoves[0];
}
