// Advanced Chess AI with Minimax, Alpha-Beta Pruning, Neural Network, and Learning Capabilities
//
// PERFORMANCE NOTE: 3D chess has ~100+ legal moves per position (vs ~30 in 2D chess).
// This causes exponential blowup: depth 3 = 100^3 = 1M positions to evaluate!
// Hard difficulty uses depth 2 (not 3) to keep thinking time under 10 seconds.
// Medium difficulty also uses depth 2 with less aggressive evaluation.
//
import { isValidMove, isPathClear, wouldBeInCheckAfterMove, isInCheck } from './threeDChessUtils';
import { evaluatePositionHybrid, isModelTrained } from './neuralNetwork';
import { getOpeningBookMove, checkAntiPattern, isInOpeningPhase } from './openingBook';

// ==================== EVALUATION WEIGHTS ====================
// These can be adjusted by machine learning over time
export const evaluationWeights = {
  // Material values
  material: {
    pawn: 100,
    knight: 320,
    bishop: 330,
    rook: 500,
    queen: 900,
    king: 20000
  },
  
  // Positional bonuses
  centerControl: 30,        // Bonus for controlling center squares
  pieceActivity: 10,        // Bonus per legal move available
  kingSafety: 50,          // Penalty for exposed king
  pawnStructure: 20,       // Bonus for connected pawns
  development: 15,         // Bonus for developed pieces (not on starting squares)
  boardLevelControl: 25,   // Bonus for pieces on middle/enemy board
  
  // Tactical bonuses
  checkBonus: 100,         // Bonus for putting opponent in check
  captureThreat: 50,       // Bonus for threatening valuable pieces
};

// ==================== POSITION EVALUATION ====================

/**
 * Evaluate piece-square tables for 3D chess
 * Returns bonus points for pieces in good positions
 */
function getPiecePositionValue(piece, pos, color) {
  const { x, y, z } = pos;
  let bonus = 0;
  
  // Center control bonus (x=3,4 y=3,4)
  const centerDistance = Math.max(Math.abs(x - 3.5), Math.abs(y - 3.5));
  if (centerDistance <= 1) {
    bonus += evaluationWeights.centerControl;
  } else if (centerDistance <= 2) {
    bonus += evaluationWeights.centerControl / 2;
  }
  
  // Board level bonuses
  if (color === 'white') {
    // White advancing toward black's board (z=0)
    if (z === 1) bonus += evaluationWeights.boardLevelControl;
    if (z === 0) bonus += evaluationWeights.boardLevelControl * 2;
  } else {
    // Black advancing toward white's board (z=2)
    if (z === 1) bonus += evaluationWeights.boardLevelControl;
    if (z === 2) bonus += evaluationWeights.boardLevelControl * 2;
  }
  
  // Piece-specific bonuses
  if (piece === 'pawn') {
    // Pawns more valuable when advanced
    const advancement = color === 'white' ? (7 - y) : y;
    bonus += advancement * 5;
  } else if (piece === 'knight') {
    // Knights better in center
    bonus += (4 - centerDistance) * 10;
  } else if (piece === 'king') {
    // King safety - prefer corners/edges in opening/middlegame
    const edgeDistance = Math.min(x, 7 - x, y, 7 - y);
    bonus -= edgeDistance * 5; // Negative = prefer edges
  }
  
  return bonus;
}

/**
 * Calculate piece mobility (number of legal moves)
 */
function calculateMobility(piecesMap, piece, pos, color) {
  let legalMoves = 0;
  
  // Check all possible squares
  for (let z = 0; z < 3; z++) {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const to = { x, y, z };
        if (pos.x === x && pos.y === y && pos.z === z) continue;
        
        const toKey = `${x},${y},${z}`;
        const targetPiece = piecesMap.get(toKey);
        if (targetPiece && targetPiece.color === color) continue;
        
        const isCapture = !!targetPiece;
        if (!isValidMove(piece, pos, to, color, isCapture, false)) continue;
        
        if (['rook', 'bishop', 'queen'].includes(piece)) {
          if (!isPathClear(piecesMap, pos, to)) continue;
        }
        
        legalMoves++;
      }
    }
  }
  
  return legalMoves;
}

/**
 * Advanced position evaluation
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
    
    // Check if piece is developed (not on starting rank)
    const isDeveloped = piece.type !== 'pawn' && piece.type !== 'king' && 
                       ((piece.color === 'white' && (piece.pos.y !== 0 || piece.pos.z !== 2)) ||
                        (piece.color === 'black' && (piece.pos.y !== 7 || piece.pos.z !== 0)));
    
    if (piece.color === 'white') {
      whiteMaterial += materialValue;
      whiteMaterial += positionValue;
      whiteMobility += mobility;
      if (isDeveloped) whiteDevelopment++;
    } else {
      blackMaterial += materialValue;
      blackMaterial += positionValue;
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
  
  // Depth penalty (prefer shorter wins)
  score -= depth;
  
  return score;
}

// ==================== MOVE GENERATION ====================

/**
 * Get all legal moves for a given color (optimized version)
 */
export function getAllLegalMovesAdvanced(piecesMap, color, size = 8) {
  const moves = [];
  
  piecesMap.forEach((piece, key) => {
    if (piece.color !== color) return;
    
    const from = piece.pos;
    
    // Check all possible destination squares
    for (let z = 0; z < 3; z++) {
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

// ==================== MINIMAX WITH ALPHA-BETA PRUNING ====================

/**
 * Make a move on a board copy
 */
function makeMove(piecesMap, move) {
  const movingPiece = piecesMap.get(move.fromKey);
  
  // Safety check: if piece doesn't exist, return null to indicate invalid move
  if (!movingPiece) {
    // Don't spam console - piece was captured in a previous ply
    return null;
  }
  
  const newPieces = new Map();
  piecesMap.forEach((piece, key) => {
    newPieces.set(key, { ...piece, pos: { ...piece.pos }, hasMoved: piece.hasMoved });
  });
  
  newPieces.delete(move.fromKey);
  if (newPieces.has(move.toKey)) {
    newPieces.delete(move.toKey);
  }
  
  // Create a NEW piece object for the moved piece (don't mutate original)
  const movedPiece = {
    ...movingPiece,
    pos: { ...move.to },
    hasMoved: true
  };
  newPieces.set(move.toKey, movedPiece);
  
  return newPieces;
}

/**
 * Minimax algorithm with alpha-beta pruning and optional neural network evaluation
 * @param {Map} piecesMap - Current board state
 * @param {number} depth - How many moves to look ahead
 * @param {number} alpha - Best value maximizer can guarantee
 * @param {number} beta - Best value minimizer can guarantee
 * @param {boolean} maximizingPlayer - True if maximizing, false if minimizing
 * @param {string} color - Color of the AI player
 * @param {boolean} useNN - Whether to use neural network evaluation
 * @param {Array} moveHistory - Move history for anti-pattern checking
 * @param {number} initialDepth - Original depth (to identify root level)
 * @param {number} startTime - Time when search started (for time limit)
 * @param {number} maxTimeMs - Maximum thinking time in milliseconds
 */
async function minimax(piecesMap, depth, alpha, beta, maximizingPlayer, color, useNN = false, moveHistory = [], initialDepth = depth, startTime = Date.now(), maxTimeMs = 20000) {
  // CRITICAL: Check time limit to prevent UI freeze
  if (Date.now() - startTime > maxTimeMs) {
    // Time limit exceeded - return immediate evaluation and stop searching
    return { score: evaluatePositionAdvanced(piecesMap, color), timeoutReached: true };
  }
  
  // Base case: reached depth limit or game over
  if (depth === 0) {
    let score;
    if (useNN && isModelTrained()) {
      // Use hybrid evaluation (NN + traditional)
      score = await evaluatePositionHybrid(piecesMap, color, evaluatePositionAdvanced);
    } else {
      score = evaluatePositionAdvanced(piecesMap, color, depth);
    }
    return { score, move: null };
  }
  
  const currentColor = maximizingPlayer ? color : (color === 'white' ? 'black' : 'white');
  const moves = getAllLegalMovesAdvanced(piecesMap, currentColor);
  
  // Game over check
  if (moves.length === 0) {
    const inCheck = isInCheck(piecesMap, currentColor);
    if (inCheck) {
      // Checkmate
      return { 
        score: maximizingPlayer ? -1000000 + depth : 1000000 - depth, 
        move: null 
      };
    } else {
      // Stalemate
      return { score: 0, move: null };
    }
  }
  
  // Sort moves for better pruning (captures and checks first)
  moves.sort((a, b) => {
    if (a.isCapture && !b.isCapture) return -1;
    if (!a.isCapture && b.isCapture) return 1;
    return (b.capturedValue || 0) - (a.capturedValue || 0);
  });
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    let bestMove = moves[0];
    let moveCounter = 0;
    
    for (const move of moves) {
      const newBoard = makeMove(piecesMap, move);
      
      // Skip invalid moves (piece was captured)
      if (!newBoard) continue;
      
      const evaluation = await minimax(newBoard, depth - 1, alpha, beta, false, color, useNN, moveHistory, initialDepth, startTime, maxTimeMs);
      
      // If timeout reached in deeper search, propagate it up immediately
      if (evaluation.timeoutReached) {
        return { score: maxEval, move: bestMove, timeoutReached: true };
      }
      
      let score = evaluation.score;
      
      // Apply anti-pattern penalty ONLY at root level (depth === initialDepth)
      if (depth === initialDepth && isInOpeningPhase(moveHistory)) {
        const piece = piecesMap.get(move.fromKey);
        if (piece) {
          const antiPatternCheck = checkAntiPattern(
            { from: move.from, to: move.to, piece: piece.type },
            moveHistory,
            piecesMap
          );
          if (antiPatternCheck.penalty !== 0) {
            console.log(`🚫 Penalty for ${piece.type} ${move.from.x},${move.from.y},${move.from.z}→${move.to.x},${move.to.y},${move.to.z}: ${antiPatternCheck.penalty}, score before: ${score}`);
          }
          // Penalties are negative, so adding them makes score LOWER (worse)
          score += antiPatternCheck.penalty;
          if (antiPatternCheck.penalty !== 0) {
            console.log(`   Score after penalty: ${score}`);
          }
        }
      }
      
      if (score > maxEval) {
        maxEval = score;
        bestMove = move;
      }
      
      alpha = Math.max(alpha, score);
      if (beta <= alpha) {
        break; // Beta cutoff
      }
      
      // Yield to browser every 5 moves at root level for INP (more aggressive)
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
      
      // Skip invalid moves (piece was captured)
      if (!newBoard) continue;
      
      const evaluation = await minimax(newBoard, depth - 1, alpha, beta, true, color, useNN, moveHistory, initialDepth, startTime, maxTimeMs);
      
      // If timeout reached in deeper search, propagate it up immediately
      if (evaluation.timeoutReached) {
        return { score: minEval, move: bestMove, timeoutReached: true };
      }
      
      let score = evaluation.score;
      
      // Apply anti-pattern penalty ONLY at root level (depth === initialDepth)
      if (depth === initialDepth && isInOpeningPhase(moveHistory)) {
        const piece = piecesMap.get(move.fromKey);
        if (piece) {
          const antiPatternCheck = checkAntiPattern(
            { from: move.from, to: move.to, piece: piece.type },
            moveHistory,
            piecesMap
          );
          if (antiPatternCheck.penalty !== 0) {
            console.log(`🚫 Penalty for ${piece.type} ${move.from.x},${move.from.y},${move.from.z}→${move.to.x},${move.to.y},${move.to.z}: ${antiPatternCheck.penalty}, score before: ${score}`);
          }
          // Penalties are negative, so adding them makes score LOWER (worse)
          score += antiPatternCheck.penalty;
          if (antiPatternCheck.penalty !== 0) {
            console.log(`   Score after penalty: ${score}`);
          }
        }
      }
      
      if (score < minEval) {
        minEval = score;
        bestMove = move;
      }
      
      alpha = Math.min(alpha, score);
      if (beta <= alpha) {
        break; // Alpha cutoff
      }
      
      // Yield to browser every 5 moves at root level for INP (more aggressive)
      moveCounter++;
      if (depth === initialDepth && moveCounter % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    return { score: minEval, move: bestMove };
  }
}

// ==================== MAIN AI FUNCTION ====================

/**
 * Select best move using advanced AI
 * @param {Map} piecesMap - Current board state
 * @param {string} color - AI color
 * @param {string} difficulty - 'easy', 'medium', 'hard', 'master'
 * @param {boolean} useNN - Whether to use neural network
 * @param {Array} moveHistory - Game move history
 * @param {number} temperature - Randomization (0=deterministic, 0.5=some randomness, 1.0=high randomness)
 */
export async function selectBestMoveAdvanced(piecesMap, color, difficulty = 'hard', useNN = false, moveHistory = [], temperature = 0) {
  // Check opening book first (only in opening phase and no randomization)
  if (isInOpeningPhase(moveHistory) && temperature === 0) {
    const bookMove = getOpeningBookMove(moveHistory, color, piecesMap);
    
    if (bookMove) {
      console.log(`📖 Using opening book: ${bookMove.opening}`);
      console.log(`   Move: ${bookMove.move.piece} ${bookMove.move.from.x},${bookMove.move.from.y},${bookMove.move.from.z} → ${bookMove.move.to.x},${bookMove.move.to.y},${bookMove.move.to.z}`);
      console.log(`   Reason: ${bookMove.description}`);
      
      // Return book move in same format as AI moves
      return {
        from: bookMove.move.from,
        to: bookMove.move.to,
        fromKey: `${bookMove.move.from.x},${bookMove.move.from.y},${bookMove.move.from.z}`,
        toKey: `${bookMove.move.to.x},${bookMove.move.to.y},${bookMove.move.to.z}`
      };
    }
  }

  const legalMoves = getAllLegalMovesAdvanced(piecesMap, color);
  
  if (legalMoves.length === 0) return null;
  
  // CRITICAL: Cap legal moves in early game for Hard+ difficulty to prevent UI freeze
  // Early game in 3D chess can have 100-120 legal moves, at depth 2 = 120^2 = 14,400 positions!
  // We cap at 50 best moves for Hard+ to keep it under 2,500 positions
  const isEarlyGame = moveHistory.length < 10;
  const shouldCapMoves = (difficulty === 'hard' || difficulty === 'master') && isEarlyGame && legalMoves.length > 50;
  
  if (shouldCapMoves) {
    // Sort moves by capture value and only keep top 50
    legalMoves.sort((a, b) => (b.capturedValue || 0) - (a.capturedValue || 0));
    legalMoves.splice(50); // Keep only first 50 moves
    console.log(`🔪 Limited to top 50 moves (early game optimization)`);
  }
  
  // Anti-pattern penalties are applied during minimax evaluation (no need to log here)
  
  // Difficulty determines search depth
  // IMPORTANT: Reduced depths to prevent UI freeze
  // 3D chess has ~100-120 legal moves in early game
  // Even with move capping (50 moves), depth 3 = 50^3 = 125K positions!
  let depth;
  switch (difficulty) {
    case 'easy':
      depth = 1;
      break;
    case 'medium':
      depth = 2;
      break;
    case 'hard':
      depth = 2; // Challenging but responsive
      break;
    case 'master':
      depth = 2; // REDUCED from 3 to 2 for playability (still uses better evaluation)
      break;
    default:
      depth = 2;
  }
  
  const nnStatus = useNN ? (isModelTrained() ? 'trained' : 'untrained') : 'disabled';
  const phase = isInOpeningPhase(moveHistory) ? 'opening' : 'middlegame/endgame';
  console.log(`🤖 AI thinking... (${phase}, depth=${depth}, ${legalMoves.length} legal moves, NN: ${nnStatus}${temperature > 0 ? `, temp=${temperature}` : ''})`);
  const startTime = Date.now();
  
  // CRITICAL: Hard time limit to prevent UI freeze
  // If AI takes > 20 seconds, abort and return best move found so far
  const MAX_THINK_TIME_MS = 20000; // 20 seconds max
  
  // If temperature > 0, evaluate ALL moves and pick randomly weighted by score
  if (temperature > 0) {
    // Limit evaluation to top N moves for performance (reduce from all moves)
    const maxMovesToEvaluate = Math.min(legalMoves.length, 20); // Cap at 20 moves (reduced for INP)
    
    // Evaluate moves (limit to maxMovesToEvaluate for performance)
    const moveScores = [];
    for (let i = 0; i < maxMovesToEvaluate; i++) {
      const move = legalMoves[i];
      const newBoard = makeMove(piecesMap, move);
      
      // Skip invalid moves (piece was captured)
      if (!newBoard) continue;
      
      const evaluation = await minimax(newBoard, depth - 1, -Infinity, Infinity, false, color, useNN, moveHistory, depth, startTime, MAX_THINK_TIME_MS);
      let score = evaluation.score;
      
      // Apply anti-pattern penalty
      if (isInOpeningPhase(moveHistory)) {
        const piece = piecesMap.get(move.fromKey);
        if (piece) {
          const antiPatternCheck = checkAntiPattern(
            { from: move.from, to: move.to, piece: piece.type },
            moveHistory,
            piecesMap
          );
          // Penalty should make move WORSE (lower score since we sort by descending score)
          score += antiPatternCheck.penalty; // penalties are negative, so this lowers the score
        }
      }
      
      moveScores.push({ move, score });
      
      // Yield to browser every 5 moves to prevent UI freeze (more aggressive)
      if (i % 5 === 4) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    // Sort by score (best first)
    moveScores.sort((a, b) => b.score - a.score);
    
    // Apply softmax with temperature to convert scores to probabilities
    const maxScore = moveScores[0].score;
    const expScores = moveScores.map(ms => Math.exp((ms.score - maxScore) / temperature));
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    const probabilities = expScores.map(exp => exp / sumExp);
    
    // Pick move randomly weighted by probabilities
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i];
      if (rand <= cumulative) {
        const thinkTime = Date.now() - startTime;
        console.log(`🤖 AI decided in ${thinkTime}ms, score: ${moveScores[i].score} (picked #${i + 1}/${legalMoves.length} with temp=${temperature})`);
        return moveScores[i].move;
      }
    }
    // Fallback (shouldn't reach here)
    return moveScores[0].move;
  }
  
  // Deterministic move selection (temperature = 0)
  const result = await minimax(piecesMap, depth, -Infinity, Infinity, true, color, useNN, moveHistory, depth, startTime, MAX_THINK_TIME_MS);
  
  const thinkTime = Date.now() - startTime;
  if (result.timeoutReached) {
    console.warn(`⚠️ AI thinking timed out after ${thinkTime}ms (max: ${MAX_THINK_TIME_MS}ms)`);
  }
  console.log(`🤖 AI decided in ${thinkTime}ms, score: ${result.score}${result.timeoutReached ? ' (TIMEOUT)' : ''}`);
  
  return result.move || legalMoves[0];
}

// ==================== LEARNING SYSTEM ====================

/**
 * Game result storage for learning
 */
export class GameDatabase {
  constructor() {
    this.games = this.loadFromStorage();
  }
  
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('chessAI_games');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }
  
  saveToStorage() {
    try {
      localStorage.setItem('chessAI_games', JSON.stringify(this.games));
    } catch (e) {
      console.error('Failed to save game database:', e);
    }
  }
  
  addGame(result) {
    this.games.push({
      ...result,
      timestamp: Date.now()
    });
    
    // Keep only last 100 games to avoid storage limits
    if (this.games.length > 100) {
      this.games = this.games.slice(-100);
    }
    
    this.saveToStorage();
  }
  
  getStats() {
    const stats = {
      totalGames: this.games.length,
      whiteWins: 0,
      blackWins: 0,
      draws: 0
    };
    
    this.games.forEach(game => {
      if (game.winner === 'white') stats.whiteWins++;
      else if (game.winner === 'black') stats.blackWins++;
      else stats.draws++;
    });
    
    return stats;
  }
}

// Global game database instance
export const gameDB = new GameDatabase();
