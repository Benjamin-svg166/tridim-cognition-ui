// Chess AI for 9D Chess computer opponent
import { isValidMove, isPathClear, wouldBeInCheckAfterMove } from './nineDChessUtils';

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
 * Get all legal moves for a given color in 9D space
 */
export function getAllLegalMoves(piecesMap, color, size = 8, levels = 9) {
  const moves = [];
  
  piecesMap.forEach((piece, key) => {
    if (piece.color !== color) return;
    
    const from = piece.pos;
    
    // Check all possible destination squares across all 9 boards
    for (let z = 0; z < levels; z++) {
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
  
  // Convert pieces map to arrays for analysis
  const pieces = Array.from(piecesMap.values());
  const board9D = convertPiecesMapToBoard9D(piecesMap);
  
  // Find kings
  const myKing = pieces.find(p => p.type === 'king' && p.color === color);
  const opponentKing = pieces.find(p => p.type === 'king' && p.color !== color);
  
  // Traditional material evaluation
  piecesMap.forEach((piece) => {
    const value = PIECE_VALUES[piece.type] || 0;
    if (piece.color === color) {
      score += value;
      
      // Bonus for piece activity (higher z-levels for white, lower for black)
      if (color === 'white' && piece.pos.z >= 3 && piece.pos.z <= 5) {
        score += 0.1; // Bonus for controlling middle neutral zone
      } else if (color === 'black' && piece.pos.z >= 3 && piece.pos.z <= 5) {
        score += 0.1;
      }
    } else {
      score -= value;
    }
  });
  
  // NEW: Geometric Heuristics (addresses double checkmate vulnerability)
  if (myKing) {
    const myKingSafety = evaluateKingSafety9D(myKing.pos, pieces, board9D, color);
    score += myKingSafety * 0.1; // Scale to match material values
  }
  
  if (opponentKing) {
    const opponentKingSafety = evaluateKingSafety9D(opponentKing.pos, pieces, board9D, color === 'white' ? 'black' : 'white');
    score -= opponentKingSafety * 0.1; // Opponent safety is bad for us
  }
  
  // NEW: Dimensional connectivity
  const myConnectivity = evaluateDimensionalConnectivity(pieces, color);
  const opponentConnectivity = evaluateDimensionalConnectivity(pieces, color === 'white' ? 'black' : 'white');
  score += (myConnectivity - opponentConnectivity) * 0.05;
  
  // NEW: Rook control (critical for preventing double checkmates)
  const myRooks = pieces.filter(p => p.type === 'rook' && p.color === color);
  const opponentRooks = pieces.filter(p => p.type === 'rook' && p.color !== color);
  
  myRooks.forEach(rook => {
    score += evaluateRookControl9D(rook.pos, board9D, opponentKing?.pos) * 0.05;
  });
  
  opponentRooks.forEach(rook => {
    score -= evaluateRookControl9D(rook.pos, board9D, myKing?.pos) * 0.05;
  });
  
  return score;
}

/**
 * Select best move using FULL evaluation with deep thinking
 * Returns the move object or null if no moves available
 * WARNING: For 9D chess with 96 pieces, this may take 30-60 seconds per move!
 */
export function selectBestMove(piecesMap, color, difficulty = 'easy') {
  const legalMoves = getAllLegalMoves(piecesMap, color);
  
  if (legalMoves.length === 0) return null;
  
  console.log(`🤖 AI thinking... Evaluating ${legalMoves.length} legal moves for ${color} (difficulty: ${difficulty})`);
  
  if (difficulty === 'easy') {
    // Random move for easy difficulty
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }
  
  if (difficulty === 'medium' || difficulty === 'hard') {
    // Evaluate each move
    let bestMove = null;
    let bestScore = -Infinity;
    
    // Count pieces to detect opening phase (first ~15 moves when 90+ pieces remain)
    const pieceCount = piecesMap.size;
    const isOpening = pieceCount >= 90; // 9D has 96 pieces total
    
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
      
      // Bonus for moving toward center neutral zone (z=3,4,5)
      if (move.to.z >= 3 && move.to.z <= 5) {
        score += 0.2;
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

// ============================================================================
// GEOMETRIC HEURISTICS - Prevents multi-dimensional king traps
// ============================================================================

/**
 * Convert pieces map to 9D board array for geometric analysis
 */
export function convertPiecesMapToBoard9D(piecesMap) {
  const board9D = Array(9).fill(null).map(() => 
    Array(8).fill(null).map(() => Array(8).fill(null))
  );
  
  piecesMap.forEach((piece, key) => {
    const { x, y, z } = piece.pos;
    board9D[z][y][x] = piece;
  });
  
  return board9D;
}

/**
 * Check if a square is attacked by opponent pieces
 */
export function isSquareAttacked(x, y, z, pieces, board9D, myColor) {
  const opponentColor = myColor === 'white' ? 'black' : 'white';
  
  for (const piece of pieces) {
    if (piece.color !== opponentColor) continue;
    
    const from = piece.pos;
    const to = { x, y, z };
    
    // Check if this piece can attack the square
    if (from.x === x && from.y === y && from.z === z) continue; // Same square
    
    let canAttack = false;
    switch (piece.type) {
      case 'pawn':
        // Pawn attacks diagonally
        const direction = piece.color === 'white' ? 1 : -1;
        const dy = to.y - from.y;
        const dx = Math.abs(to.x - from.x);
        const dz = Math.abs(to.z - from.z);
        canAttack = dy === direction && dx === 1 && dz === 0;
        break;
      
      case 'knight':
        const d = { 
          x: Math.abs(to.x - from.x), 
          y: Math.abs(to.y - from.y), 
          z: Math.abs(to.z - from.z) 
        };
        const vals = [d.x, d.y, d.z].sort((a, b) => b - a);
        canAttack = vals[0] === 2 && vals[1] === 1 && vals[2] === 0;
        break;
      
      case 'rook':
      case 'queen':
        // Check straight lines
        const straightPath = (from.x === to.x && from.y === to.y) ||
                            (from.x === to.x && from.z === to.z) ||
                            (from.y === to.y && from.z === to.z);
        if (straightPath) {
          canAttack = isPathClearGeometric(board9D, from, to);
        }
        if (piece.type === 'queen') {
          // Also check diagonals
          const dx2 = Math.abs(to.x - from.x);
          const dy2 = Math.abs(to.y - from.y);
          const dz2 = Math.abs(to.z - from.z);
          const isDiagonal = (dx2 === dy2 && dz2 === 0) ||
                            (dx2 === dz2 && dy2 === 0) ||
                            (dy2 === dz2 && dx2 === 0) ||
                            (dx2 === dy2 && dy2 === dz2 && dx2 > 0);
          if (isDiagonal) {
            canAttack = isPathClearGeometric(board9D, from, to);
          }
        }
        break;
      
      case 'bishop':
        const dx3 = Math.abs(to.x - from.x);
        const dy3 = Math.abs(to.y - from.y);
        const dz3 = Math.abs(to.z - from.z);
        const isDiag = (dx3 === dy3 && dz3 === 0) ||
                      (dx3 === dz3 && dy3 === 0) ||
                      (dy3 === dz3 && dx3 === 0) ||
                      (dx3 === dy3 && dy3 === dz3 && dx3 > 0);
        if (isDiag) {
          canAttack = isPathClearGeometric(board9D, from, to);
        }
        break;
      
      case 'king':
        const kdx = Math.abs(to.x - from.x);
        const kdy = Math.abs(to.y - from.y);
        const kdz = Math.abs(to.z - from.z);
        canAttack = kdx <= 1 && kdy <= 1 && kdz <= 1;
        break;
    }
    
    if (canAttack) return true;
  }
  
  return false;
}

/**
 * Check if path is clear for geometric analysis
 */
function isPathClearGeometric(board9D, from, to) {
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  const dz = Math.sign(to.z - from.z);
  
  let x = from.x + dx;
  let y = from.y + dy;
  let z = from.z + dz;
  
  while (x !== to.x || y !== to.y || z !== to.z) {
    if (x < 0 || x >= 8 || y < 0 || y >= 8 || z < 0 || z >= 9) break;
    if (board9D[z][y][x]) return false;
    x += dx;
    y += dy;
    z += dz;
  }
  
  return true;
}

/**
 * Evaluates king safety across all 9 dimensional layers
 * Returns: positive score = safe, negative score = danger
 */
export function evaluateKingSafety9D(kingPos, pieces, board9D, color) {
  let safety = 0;
  const { x, y, z } = kingPos;
  
  // === PROXIMITY DEFENDERS ===
  const adjacentLayers = [z - 1, z, z + 1].filter(layer => layer >= 0 && layer <= 8);
  let localDefenders = 0;
  
  for (const layer of adjacentLayers) {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const checkX = x + dx;
        const checkY = y + dy;
        if (checkX >= 0 && checkX < 8 && checkY >= 0 && checkY < 8) {
          const piece = board9D[layer][checkY][checkX];
          if (piece && piece.color === color && piece.type !== 'king') {
            localDefenders++;
          }
        }
      }
    }
  }
  safety += localDefenders * 15;
  
  // === VERTICAL THREATS ===
  let verticalThreats = 0;
  
  for (let checkZ = z + 1; checkZ <= 8; checkZ++) {
    const piece = board9D[checkZ][y][x];
    if (piece) {
      if (piece.color !== color && (piece.type === 'rook' || piece.type === 'queen')) {
        verticalThreats++;
      }
      break;
    }
  }
  
  for (let checkZ = z - 1; checkZ >= 0; checkZ--) {
    const piece = board9D[checkZ][y][x];
    if (piece) {
      if (piece.color !== color && (piece.type === 'rook' || piece.type === 'queen')) {
        verticalThreats++;
      }
      break;
    }
  }
  
  safety -= verticalThreats * 50;
  
  // === ESCAPE ROUTE ANALYSIS ===
  let escapeRoutes = 0;
  
  for (const layer of adjacentLayers) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0 && layer === z) continue;
        
        const escapeX = x + dx;
        const escapeY = y + dy;
        
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
  
  if (escapeRoutes === 0) {
    safety -= 500;
  } else if (escapeRoutes <= 2) {
    safety -= 150;
  } else if (escapeRoutes <= 5) {
    safety -= 50;
  }
  
  return safety;
}

/**
 * Evaluates how well pieces are connected across z-layers
 */
export function evaluateDimensionalConnectivity(pieces, color) {
  let connectivity = 0;
  
  const layerGroups = {};
  for (let z = 0; z <= 8; z++) {
    layerGroups[z] = pieces.filter(p => p.pos.z === z && p.color === color);
  }
  
  for (let z = 0; z <= 8; z++) {
    const piecesOnLayer = layerGroups[z];
    const count = piecesOnLayer.length;
    
    if (count === 0) continue;
    
    if (count === 1) {
      connectivity -= 50;
    } else if (count === 2) {
      connectivity -= 30;
    } else if (count >= 3 && count <= 6) {
      connectivity += 20;
    } else if (count >= 7) {
      connectivity += 10;
    }
  }
  
  // Vertical spread bonus
  const occupiedLayers = Object.values(layerGroups).filter(g => g.length > 0).length;
  
  if (occupiedLayers >= 6) {
    connectivity += 50;
  } else if (occupiedLayers >= 4) {
    connectivity += 25;
  } else if (occupiedLayers <= 2) {
    connectivity -= 40;
  }
  
  return connectivity;
}

/**
 * Evaluates rook control across 9D space
 */
export function evaluateRookControl9D(rookPos, board9D, opponentKingPos) {
  let control = 0;
  const { x, y, z } = rookPos;
  
  // Horizontal control
  let horizontalSquares = 0;
  
  for (let checkX = x + 1; checkX < 8; checkX++) {
    horizontalSquares++;
    if (board9D[z][y][checkX]) break;
  }
  
  for (let checkX = x - 1; checkX >= 0; checkX--) {
    horizontalSquares++;
    if (board9D[z][y][checkX]) break;
  }
  
  for (let checkY = y + 1; checkY < 8; checkY++) {
    horizontalSquares++;
    if (board9D[z][checkY][x]) break;
  }
  
  for (let checkY = y - 1; checkY >= 0; checkY--) {
    horizontalSquares++;
    if (board9D[z][checkY][x]) break;
  }
  
  control += horizontalSquares * 2;
  
  // Vertical control
  let verticalLayers = 0;
  
  for (let checkZ = z + 1; checkZ <= 8; checkZ++) {
    verticalLayers++;
    if (board9D[checkZ][y][x]) break;
  }
  
  for (let checkZ = z - 1; checkZ >= 0; checkZ--) {
    verticalLayers++;
    if (board9D[checkZ][y][x]) break;
  }
  
  control += verticalLayers * 15;
  
  // Geometric king trap detection
  if (opponentKingPos) {
    const kx = opponentKingPos.x;
    const ky = opponentKingPos.y;
    const kz = opponentKingPos.z;
    
    if (x === kx && y === ky && z !== kz) {
      control += 100;
    }
    
    if (z === kz && (x === kx || y === ky)) {
      control += 50;
    }
  }
  
  return control;
}
