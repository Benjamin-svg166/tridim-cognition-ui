// Advanced Chess AI for 9D Chess with Minimax and Alpha-Beta Pruning
import { isValidMove, isPathClear, wouldBeInCheckAfterMove, isInCheck } from './nineDChessUtils';

// PHASE 2: Transposition Table (memoization cache)
const transpositionTable = new Map();
const MAX_CACHE_SIZE = 100000; // Limit memory usage

// PHASE 2: Killer Moves Heuristic (moves that caused cutoffs)
const killerMoves = new Map(); // depth -> [move1, move2]

// Evaluation weights for 9D chess (OPTIMIZED FOR PHASE 1)
export const evaluationWeights = {
  material: {
    pawn: 100,
    knight: 320,
    bishop: 330,
    rook: 500,
    queen: 900,
    king: 20000
  },
  centerControl: 60,        // 2x boost - center squares critical in 9D
  pieceActivity: 10,
  development: 15,
  zoneControl: 80,          // 3x boost - controlling z3,z4,z5 is KEY to 9D dominance
  layerDominance: 50,       // NEW - bonus for multiple pieces on strategic layers
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
    
    // CENTER LAYER SQUARED BONUS - Prime real estate!
    // Controlling center squares on middle layers = MAXIMUM threat projection
    if (centerDistance <= 1) {
      bonus += 120; // Massive bonus for center of middle layers
    }
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
 * PHASE 2: Generate unique hash for board position (for transposition table)
 */
function getBoardHash(piecesMap, depth, alpha, beta) {
  const pieces = Array.from(piecesMap.entries())
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, piece]) => `${key}:${piece.color[0]}${piece.type[0]}${piece.hasMoved ? 1 : 0}`);
  return `${pieces.join('|')}|d${depth}|a${alpha}|b${beta}`;
}

/**
 * PHASE 2: Get move signature for killer moves heuristic
 */
function getMoveSignature(move) {
  return `${move.fromKey}->${move.toKey}`;
}

/**
 * PHASE 2: Order moves for better alpha-beta pruning efficiency
 */
function orderMoves(moves, depth) {
  const killerMovesAtDepth = killerMoves.get(depth) || [];
  
  return moves.sort((a, b) => {
    // 1. Captures first (highest value)
    const captureScore = (b.capturedValue || 0) - (a.capturedValue || 0);
    if (captureScore !== 0) return captureScore;
    
    // 2. Killer moves (moves that caused beta cutoffs)
    const aIsKiller = killerMovesAtDepth.includes(getMoveSignature(a)) ? 1 : 0;
    const bIsKiller = killerMovesAtDepth.includes(getMoveSignature(b)) ? 1 : 0;
    if (bIsKiller !== aIsKiller) return bIsKiller - aIsKiller;
    
    // 3. Center moves preferred
    const aCenterDist = Math.max(Math.abs(a.to.x - 3.5), Math.abs(a.to.y - 3.5));
    const bCenterDist = Math.max(Math.abs(b.to.x - 3.5), Math.abs(b.to.y - 3.5));
    return aCenterDist - bCenterDist;
  });
}

/**
 * Minimax algorithm with alpha-beta pruning (PHASE 2 OPTIMIZED)
 */
async function minimax(piecesMap, depth, alpha, beta, maximizingPlayer, color, initialDepth = depth, startTime = Date.now(), maxTimeMs = 30000) {
  // Time limit check
  if (Date.now() - startTime > maxTimeMs) {
    return { score: evaluatePositionAdvanced(piecesMap, color), timeoutReached: true };
  }
  
  // PHASE 2: Check transposition table (memoization)
  const boardHash = getBoardHash(piecesMap, depth, alpha, beta);
  if (transpositionTable.has(boardHash)) {
    return transpositionTable.get(boardHash);
  }
  
  // Base case
  if (depth === 0) {
    const result = { score: evaluatePositionAdvanced(piecesMap, color, depth), move: null };
    transpositionTable.set(boardHash, result);
    return result;
  }
  
  const currentColor = maximizingPlayer ? color : (color === 'white' ? 'black' : 'white');
  const moves = getAllLegalMovesAdvanced(piecesMap, currentColor);
  
  // Game over check
  if (moves.length === 0) {
    const inCheck = isInCheck(piecesMap, currentColor);
    const result = inCheck
      ? { score: maximizingPlayer ? -1000000 + depth : 1000000 - depth, move: null }
      : { score: 0, move: null };
    transpositionTable.set(boardHash, result);
    return result;
  }
  
  // PHASE 2: Enhanced move ordering
  const orderedMoves = orderMoves(moves, depth);
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    let bestMove = orderedMoves[0];
    let moveCounter = 0;
    
    for (const move of orderedMoves) {
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
      if (beta <= alpha) {
        // PHASE 2: Store killer move (caused beta cutoff)
        const killerMovesAtDepth = killerMoves.get(depth) || [];
        const moveSignature = getMoveSignature(move);
        if (!killerMovesAtDepth.includes(moveSignature)) {
          killerMovesAtDepth.unshift(moveSignature);
          if (killerMovesAtDepth.length > 2) killerMovesAtDepth.pop();
          killerMoves.set(depth, killerMovesAtDepth);
        }
        break;
      }
      
      // Yield to browser periodically
      moveCounter++;
      if (depth === initialDepth && moveCounter % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    const result = { score: maxEval, move: bestMove };
    transpositionTable.set(boardHash, result);
    return result;
  } else {
    let minEval = Infinity;
    let bestMove = orderedMoves[0];
    let moveCounter = 0;
    
    for (const move of orderedMoves) {
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
      if (beta <= alpha) {
        // PHASE 2: Store killer move
        const killerMovesAtDepth = killerMoves.get(depth) || [];
        const moveSignature = getMoveSignature(move);
        if (!killerMovesAtDepth.includes(moveSignature)) {
          killerMovesAtDepth.unshift(moveSignature);
          if (killerMovesAtDepth.length > 2) killerMovesAtDepth.pop();
          killerMoves.set(depth, killerMovesAtDepth);
        }
        break;
      }
      
      // Yield to browser periodically
      moveCounter++;
      if (depth === initialDepth && moveCounter % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    const result = { score: minEval, move: bestMove };
    transpositionTable.set(boardHash, result);
    return result;
  }
}

/**
 * PHASE 2: Iterative Deepening - searches depth 1, 2, 3... until time runs out
 */
async function iterativeDeepeningSearch(piecesMap, color, maxDepth, maxTimeMs = 30000) {
  const startTime = Date.now();
  let bestMove = null;
  let bestScore = -Infinity;
  let completedDepth = 0;
  
  // Clear killer moves for new search
  killerMoves.clear();
  
  for (let depth = 1; depth <= maxDepth; depth++) {
    const timeRemaining = maxTimeMs - (Date.now() - startTime);
    if (timeRemaining < 1000) break; // Need at least 1 second
    
    console.log(`🔍 Iterative deepening: depth ${depth}/${maxDepth}`);
    
    const result = await minimax(
      piecesMap, 
      depth, 
      -Infinity, 
      Infinity, 
      true, 
      color, 
      depth, 
      startTime, 
      maxTimeMs
    );
    
    if (result.timeoutReached) {
      console.log(`⏰ Timeout at depth ${depth} - using depth ${completedDepth} result`);
      break;
    }
    
    if (result.move) {
      bestMove = result.move;
      bestScore = result.score;
      completedDepth = depth;
      console.log(`✓ Depth ${depth} complete: score ${result.score.toFixed(1)}`);
    }
    
    // If we found checkmate, no need to search deeper
    if (Math.abs(result.score) > 900000) {
      console.log(`♔ Checkmate found at depth ${depth}!`);
      break;
    }
  }
  
  return { move: bestMove, score: bestScore, depth: completedDepth };
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
  
  // Difficulty determines depth (PHASE 1 OPTIMIZED - deeper search)
  let depth;
  switch (difficulty) {
    case 'easy':
      depth = 1;
      break;
    case 'medium':
      depth = 2;  // Upgraded from 1 to 2
      break;
    case 'hard':
      depth = 3;  // UPGRADED: 50% deeper search (~2,000-8,000 positions)
      break;
    case 'master':
      depth = 4;  // UPGRADED: 2x deeper - BRUTAL difficulty (~80,000-480,000 positions)
      break;
    default:
      depth = 1;
  }
  
  // PHASE 2: Clear transposition table if it's too large
  if (transpositionTable.size > MAX_CACHE_SIZE) {
    const keysToDelete = Array.from(transpositionTable.keys()).slice(0, MAX_CACHE_SIZE / 2);
    keysToDelete.forEach(key => transpositionTable.delete(key));
    console.log(`🧹 Cleared ${keysToDelete.length} cached positions`);
  }
  
  console.log(`🤖 9D AI thinking (max depth ${depth})...`);
  const startTime = Date.now();
  
  // PHASE 2: Use iterative deepening for guaranteed move return
  const result = await iterativeDeepeningSearch(piecesMap, color, depth, 30000);
  
  const thinkingTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Search complete in ${thinkingTime}s (depth ${result.depth}/${depth}, score ${result.score.toFixed(1)})`);
  console.log(`📊 Transposition table: ${transpositionTable.size} positions cached`);
  
  return result.move || legalMoves[0];
}
