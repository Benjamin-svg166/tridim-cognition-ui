// Advanced Chess AI for 9D Chess with Minimax and Alpha-Beta Pruning
import { isValidMove, isPathClear, wouldBeInCheckAfterMove, isInCheck } from './nineDChessUtils';
import { 
  evaluateKingSafety9D, 
  evaluateDimensionalConnectivity, 
  evaluateRookControl9D,
  convertPiecesMapToBoard9D,
  isSquareAttacked 
} from './nineDChessAI';

// Re-export these for use in this file if they're not available
// (We'll add a fallback implementation if the import fails)

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
  
  // Convert for geometric analysis
  const pieces = Array.from(piecesMap.values());
  const board9D = convertPiecesMapToBoard9D(piecesMap);
  
  // Find kings
  const whiteKing = pieces.find(p => p.type === 'king' && p.color === 'white');
  const blackKing = pieces.find(p => p.type === 'king' && p.color === 'black');
  
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
  
  // === NEW: GEOMETRIC HEURISTICS (Critical for avoiding double checkmates) ===
  
  // King safety evaluation
  if (color === 'white' && whiteKing) {
    const whiteSafety = evaluateKingSafety9D(whiteKing.pos, pieces, board9D, 'white');
    score += whiteSafety * 0.5; // Higher weight in advanced AI
  } else if (color === 'black' && blackKing) {
    const blackSafety = evaluateKingSafety9D(blackKing.pos, pieces, board9D, 'black');
    score += blackSafety * 0.5;
  }
  
  // Opponent king safety (inverse)
  if (color === 'white' && blackKing) {
    const blackSafety = evaluateKingSafety9D(blackKing.pos, pieces, board9D, 'black');
    score -= blackSafety * 0.5;
  } else if (color === 'black' && whiteKing) {
    const whiteSafety = evaluateKingSafety9D(whiteKing.pos, pieces, board9D, 'white');
    score -= whiteSafety * 0.5;
  }
  
  // Dimensional connectivity
  const myConnectivity = evaluateDimensionalConnectivity(pieces, color);
  const opponentConnectivity = evaluateDimensionalConnectivity(pieces, color === 'white' ? 'black' : 'white');
  score += (myConnectivity - opponentConnectivity) * 0.3;
  
  // Rook control (geometric trap detection)
  const myRooks = pieces.filter(p => p.type === 'rook' && p.color === color);
  const opponentRooks = pieces.filter(p => p.type === 'rook' && p.color !== color);
  const opponentKing = color === 'white' ? blackKing : whiteKing;
  const myKing = color === 'white' ? whiteKing : blackKing;
  
  myRooks.forEach(rook => {
    score += evaluateRookControl9D(rook.pos, board9D, opponentKing?.pos) * 0.3;
  });
  
  opponentRooks.forEach(rook => {
    score -= evaluateRookControl9D(rook.pos, board9D, myKing?.pos) * 0.3;
  });
  
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

// ============================================================================
// DYNAMIC THREAT PRIORITIZATION (DTP) MODULE - Phase 2
// ============================================================================

/**
 * Detect geometric threats in current position
 * Returns threat level object with detailed analysis
 */
function detectGeometricThreats(piecesMap, color) {
  const pieces = Array.from(piecesMap.values());
  const board9D = convertPiecesMapToBoard9D(piecesMap);
  const myKing = pieces.find(p => p.type === 'king' && p.color === color);
  
  if (!myKing) return { level: 0, kingSafety: 0, escapeRoutes: 10, verticalThreats: 0 };
  
  // Calculate king safety score
  const kingSafety = evaluateKingSafety9D(myKing.pos, pieces, board9D, color);
  
  // Count escape routes
  const adjacentLayers = [myKing.pos.z - 1, myKing.pos.z, myKing.pos.z + 1].filter(z => z >= 0 && z <= 8);
  let escapeRoutes = 0;
  
  for (const layer of adjacentLayers) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0 && layer === myKing.pos.z) continue;
        
        const escapeX = myKing.pos.x + dx;
        const escapeY = myKing.pos.y + dy;
        
        if (escapeX >= 0 && escapeX < 8 && escapeY >= 0 && escapeY < 8) {
          const escapePiece = board9D[layer][escapeY][escapeX];
          if (!escapePiece || escapePiece.color !== color) {
            if (!isSquareAttacked(escapeX, escapeY, layer, pieces, board9D, color)) {
              escapeRoutes++;
            }
          }
        }
      }
    }
  }
  
  // Count vertical threats
  let verticalThreats = 0;
  const kz = myKing.pos.z;
  const kx = myKing.pos.x;
  const ky = myKing.pos.y;
  
  for (let checkZ = 0; checkZ <= 8; checkZ++) {
    if (checkZ === kz) continue;
    const piece = board9D[checkZ][ky][kx];
    if (piece && piece.color !== color && (piece.type === 'rook' || piece.type === 'queen')) {
      verticalThreats++;
    }
  }
  
  // Calculate overall threat level
  let threatLevel = 0;
  
  if (kingSafety < -400) threatLevel = 3; // CRITICAL: Checkmate imminent
  else if (kingSafety < -100) threatLevel = 2; // HIGH: Severe danger
  else if (kingSafety < 0) threatLevel = 1; // MODERATE: Some danger
  
  if (escapeRoutes === 0) threatLevel = Math.max(threatLevel, 3);
  else if (escapeRoutes <= 2) threatLevel = Math.max(threatLevel, 2);
  else if (escapeRoutes <= 4) threatLevel = Math.max(threatLevel, 1);
  
  if (verticalThreats >= 2) threatLevel = Math.max(threatLevel, 2);
  else if (verticalThreats >= 1) threatLevel = Math.max(threatLevel, 1);
  
  return {
    level: threatLevel,
    kingSafety,
    escapeRoutes,
    verticalThreats,
    description: threatLevel === 3 ? 'CRITICAL' : 
                 threatLevel === 2 ? 'HIGH' : 
                 threatLevel === 1 ? 'MODERATE' : 'LOW'
  };
}

/**
 * Calculate adaptive search depth based on threat level
 */
function getAdaptiveDepth(baseDepth, threats) {
  let depth = baseDepth;
  
  // Critical threats: +2 ply
  if (threats.level === 3) {
    depth += 2;
  }
  // High threats: +1 ply
  else if (threats.level === 2) {
    depth += 1;
  }
  // Moderate threats: +1 ply (50% chance to avoid performance hit)
  else if (threats.level === 1 && Math.random() > 0.5) {
    depth += 1;
  }
  
  return depth;
}

/**
 * Improved move ordering with threat-aware prioritization
 */
function orderMoves(moves, piecesMap, color, threatLevel) {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    
    // Priority 1: Captures (always valuable)
    scoreA += (a.capturedValue || 0) * 10;
    scoreB += (b.capturedValue || 0) * 10;
    
    // Priority 2: King moves when under threat
    if (threatLevel >= 2) {
      if (a.piece === 'king') scoreA += 5000;
      if (b.piece === 'king') scoreB += 5000;
    }
    
    // Priority 3: Defensive moves (pieces moving toward king)
    const myKing = Array.from(piecesMap.values()).find(p => p.type === 'king' && p.color === color);
    if (myKing && threatLevel >= 1) {
      const distToKingA = Math.abs(a.to.x - myKing.pos.x) + Math.abs(a.to.y - myKing.pos.y) + Math.abs(a.to.z - myKing.pos.z);
      const distToKingB = Math.abs(b.to.x - myKing.pos.x) + Math.abs(b.to.y - myKing.pos.y) + Math.abs(b.to.z - myKing.pos.z);
      
      // Closer to king = higher priority when threatened
      scoreA += (15 - distToKingA) * 100;
      scoreB += (15 - distToKingB) * 100;
    }
    
    // Priority 4: Central control (lower priority when threatened)
    if (threatLevel === 0) {
      const centralityA = 7 - (Math.abs(a.to.x - 3.5) + Math.abs(a.to.y - 3.5));
      const centralityB = 7 - (Math.abs(b.to.x - 3.5) + Math.abs(b.to.y - 3.5));
      scoreA += centralityA * 10;
      scoreB += centralityB * 10;
    }
    
    return scoreB - scoreA;
  });
}

/**
 * Evaluate move safety - returns penalty if move worsens king safety
 */
function evaluateMoveSafety(piecesMap, move, color) {
  const newBoard = makeMove(piecesMap, move);
  if (!newBoard) return -10000; // Invalid move
  
  const threats = detectGeometricThreats(newBoard, color);
  
  // Heavy penalty for moves that increase danger
  if (threats.level === 3) return -5000; // Don't walk into checkmate
  if (threats.level === 2) return -2000; // Avoid severe danger
  if (threats.level === 1) return -500;  // Slight penalty for risky moves
  
  // Bonus for improving safety
  const currentThreats = detectGeometricThreats(piecesMap, color);
  if (threats.level < currentThreats.level) {
    return 1000 * (currentThreats.level - threats.level); // Reward for improving safety
  }
  
  return 0;
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
 * Minimax algorithm with alpha-beta pruning and Dynamic Threat Prioritization
 */
async function minimax(piecesMap, depth, alpha, beta, maximizingPlayer, color, initialDepth = depth, startTime = Date.now(), maxTimeMs = 30000, useDTP = true) {
  // Time limit check
  if (Date.now() - startTime > maxTimeMs) {
    return { score: evaluatePositionAdvanced(piecesMap, color), timeoutReached: true };
  }
  
  // DTP: Detect threats and adjust depth if needed
  const currentColor = maximizingPlayer ? color : (color === 'white' ? 'black' : 'white');
  let threats = { level: 0, escapeRoutes: 10 };
  let adaptiveDepth = depth;
  
  if (useDTP) {
    threats = detectGeometricThreats(piecesMap, currentColor);
    
    // Extend search depth when under threat (only at non-leaf nodes)
    if (depth > 0 && threats.level >= 2) {
      adaptiveDepth = getAdaptiveDepth(depth, threats);
      
      if (adaptiveDepth > depth && depth === initialDepth) {
        console.log(`🛡️ DTP: Threat level ${threats.description} detected, extending depth ${depth}→${adaptiveDepth}`);
      }
    }
  }
  
  // Base case (use adaptive depth)
  if (adaptiveDepth === 0) {
    return { score: evaluatePositionAdvanced(piecesMap, color, depth), move: null };
  }
  
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
  
  // DTP: Improved move ordering based on threat level
  const orderedMoves = useDTP ? orderMoves(moves, piecesMap, currentColor, threats.level) : 
                       moves.sort((a, b) => (b.capturedValue || 0) - (a.capturedValue || 0));
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    let bestMove = orderedMoves[0];
    let moveCounter = 0;
    
    for (const move of orderedMoves) {
      const newBoard = makeMove(piecesMap, move);
      if (!newBoard) continue;
      
      // DTP: Evaluate move safety and apply penalty/bonus
      let safetyAdjustment = 0;
      if (useDTP && depth === initialDepth) {
        safetyAdjustment = evaluateMoveSafety(piecesMap, move, currentColor);
      }
      
      const evaluation = await minimax(newBoard, adaptiveDepth - 1, alpha, beta, false, color, initialDepth, startTime, maxTimeMs, useDTP);
      
      if (evaluation.timeoutReached) {
        return { score: maxEval, move: bestMove, timeoutReached: true };
      }
      
      // Apply safety adjustment to score
      const adjustedScore = evaluation.score + safetyAdjustment;
      
      if (adjustedScore > maxEval) {
        maxEval = adjustedScore;
        bestMove = move;
      }
      
      alpha = Math.max(alpha, adjustedScore);
      if (beta <= alpha) break; // Alpha-beta pruning
      
      // Yield to browser periodically
      moveCounter++;
      if (depth === initialDepth && moveCounter % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    let bestMove = orderedMoves[0];
    let moveCounter = 0;
    
    for (const move of orderedMoves) {
      const newBoard = makeMove(piecesMap, move);
      if (!newBoard) continue;
      
      // DTP: Evaluate move safety and apply penalty/bonus
      let safetyAdjustment = 0;
      if (useDTP && depth === initialDepth) {
        safetyAdjustment = evaluateMoveSafety(piecesMap, move, currentColor);
      }
      
      const evaluation = await minimax(newBoard, adaptiveDepth - 1, alpha, beta, true, color, initialDepth, startTime, maxTimeMs, useDTP);
      
      if (evaluation.timeoutReached) {
        return { score: minEval, move: bestMove, timeoutReached: true };
      }
      
      // Apply safety adjustment to score (inverted for minimizing player)
      const adjustedScore = evaluation.score - safetyAdjustment;
      
      if (adjustedScore < minEval) {
        minEval = adjustedScore;
        bestMove = move;
      }
      
      beta = Math.min(beta, adjustedScore);
      if (beta <= alpha) break; // Alpha-beta pruning
      
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
 * Select best move using advanced AI for 9D chess with Dynamic Threat Prioritization
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
  
  // Enable DTP for Master difficulty
  const useDTP = (difficulty === 'master');
  
  // Difficulty determines base depth (can be extended by DTP)
  let depth;
  switch (difficulty) {
    case 'easy':
      depth = 1;
      break;
    case 'medium':
      depth = 1;
      break;
    case 'hard':
      depth = 2;
      break;
    case 'master':
      depth = 3; // Base depth 3, DTP can extend to 4-5 when threatened
      break;
    default:
      depth = 1;
  }
  
  console.log(`🤖 9D AI thinking (depth ${depth}, DTP: ${useDTP ? 'ENABLED' : 'DISABLED'})...`);
  
  // Check initial threat level
  if (useDTP) {
    const initialThreats = detectGeometricThreats(piecesMap, color);
    if (initialThreats.level > 0) {
      console.log(`⚠️ DTP: Initial threat level: ${initialThreats.description} (safety: ${initialThreats.kingSafety}, escapes: ${initialThreats.escapeRoutes})`);
    }
  }
  
  const startTime = Date.now();
  
  const result = await minimax(piecesMap, depth, -Infinity, Infinity, true, color, depth, startTime, 30000, useDTP);
  
  const thinkingTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Evaluation complete in ${thinkingTime}s`);
  
  if (result.timeoutReached) {
    console.log(`⏰ Time limit reached - returning best move found so far`);
  }
  
  return result.move || legalMoves[0];
}
