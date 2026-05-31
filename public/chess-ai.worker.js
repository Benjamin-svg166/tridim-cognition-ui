// Chess AI Web Worker
// This runs AI calculations off the main thread to prevent UI blocking
// Note: This worker will receive the AI module code via importScripts or dynamic import

let chessAI = null;

self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case 'INIT':
        // Worker initialized
        self.postMessage({ type: 'READY' });
        break;
        
      case 'CALCULATE_MOVE':
        const { pieces, color, difficulty, useNN, moveHistory, aiCode } = payload;
        
        // Reconstruct pieces Map from serialized array
        const piecesMap = new Map(pieces);
        
        // If AI code provided, evaluate it (for dynamic loading)
        if (aiCode && !chessAI) {
          // Execute the AI code in worker context
          eval(aiCode);
        }
        
        // Calculate best move using the existing AI function
        // For now, use a simple implementation
        const bestMove = await calculateBestMoveInWorker(piecesMap, color, difficulty, moveHistory);
        
        // Send result back to main thread
        self.postMessage({
          type: 'MOVE_CALCULATED',
          payload: { bestMove }
        });
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: { error: error.message, stack: error.stack }
    });
  }
});

// Basic AI implementation in worker
// This is a simplified version - ideally we'd use the full chessAI_advanced.js logic
async function calculateBestMoveInWorker(piecesMap, color, difficulty, moveHistory) {
  const depth = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 2;
  
  // Get all legal moves
  const legalMoves = getAllLegalMovesInWorker(piecesMap, color);
  
  if (legalMoves.length === 0) return null;
  
  // For simple implementation: evaluate each move and pick the best
  let bestMove = null;
  let bestScore = -Infinity;
  
  for (const move of legalMoves) {
    // Make move
    const newPiecesMap = makeMove(piecesMap, move);
    
    // Evaluate position
    const score = evaluatePosition(newPiecesMap, color);
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
}

function makeMove(piecesMap, move) {
  const newMap = new Map(piecesMap);
  const piece = newMap.get(move.fromKey);
  
  if (!piece) return newMap;
  
  // Remove from old position
  newMap.delete(move.fromKey);
  
  // Remove captured piece if any
  newMap.delete(move.toKey);
  
  // Add to new position
  const movedPiece = { ...piece, pos: move.to };
  newMap.set(move.toKey, movedPiece);
  
  return newMap;
}

function evaluatePosition(piecesMap, color) {
  const materialValues = {
    'pawn': 100,
    'knight': 320,
    'bishop': 330,
    'rook': 500,
    'queen': 900,
    'king': 20000
  };
  
  let score = 0;
  
  for (const [key, piece] of piecesMap) {
    const value = materialValues[piece.type] || 0;
    if (piece.color === color) {
      score += value;
    } else {
      score -= value;
    }
  }
  
  return score;
}

function getAllLegalMovesInWorker(piecesMap, color) {
  const moves = [];
  
  for (const [key, piece] of piecesMap) {
    if (piece.color !== color) continue;
    
    const pieceMoves = generateMovesForPieceInWorker(piece, piecesMap);
    moves.push(...pieceMoves);
  }
  
  return moves;
}

function generateMovesForPieceInWorker(piece, piecesMap) {
  const moves = [];
  const { type, pos, color } = piece;
  const fromKey = `${pos.x},${pos.y},${pos.z}`;
  
  // Get possible move directions based on piece type
  const directions = getPieceDirections(type, color);
  const isSliding = ['bishop', 'rook', 'queen'].includes(type);
  
  for (const dir of directions) {
    let steps = isSliding ? 8 : 1; // Sliding pieces can move multiple squares
    
    for (let i = 1; i <= steps; i++) {
      const newPos = {
        x: pos.x + dir.dx * i,
        y: pos.y + dir.dy * i,
        z: pos.z + (dir.dz || 0) * i
      };
      
      // Check bounds
      if (newPos.x < 0 || newPos.x > 7 || newPos.y < 0 || newPos.y > 7 || newPos.z < 0 || newPos.z > 2) {
        break; // Out of bounds, stop this direction
      }
      
      const toKey = `${newPos.x},${newPos.y},${newPos.z}`;
      const targetPiece = piecesMap.get(toKey);
      
      // Can't move through pieces (except captures)
      if (targetPiece) {
        if (targetPiece.color === color) {
          break; // Can't capture own pieces
        } else {
          // Can capture enemy piece
          moves.push({ from: pos, to: newPos, fromKey, toKey });
          break; // Stop after capture
        }
      } else {
        // Empty square
        moves.push({ from: pos, to: newPos, fromKey, toKey });
      }
    }
  }
  
  return moves;
}

function getPieceDirections(type, color) {
  const forward = color === 'white' ? -1 : 1; // White moves up (-y), black moves down (+y)
  
  switch (type) {
    case 'pawn':
      return [
        { dx: 0, dy: forward, dz: 0 },
        { dx: 1, dy: forward, dz: 0 }, // Capture diagonals
        { dx: -1, dy: forward, dz: 0 }
      ];
    case 'knight':
      return [
        { dx: 2, dy: 1, dz: 0 }, { dx: 2, dy: -1, dz: 0 },
        { dx: -2, dy: 1, dz: 0 }, { dx: -2, dy: -1, dz: 0 },
        { dx: 1, dy: 2, dz: 0 }, { dx: 1, dy: -2, dz: 0 },
        { dx: -1, dy: 2, dz: 0 }, { dx: -1, dy: -2, dz: 0 }
      ];
    case 'bishop':
      return [
        { dx: 1, dy: 1, dz: 0 }, { dx: 1, dy: -1, dz: 0 },
        { dx: -1, dy: 1, dz: 0 }, { dx: -1, dy: -1, dz: 0 }
      ];
    case 'rook':
      return [
        { dx: 1, dy: 0, dz: 0 }, { dx: -1, dy: 0, dz: 0 },
        { dx: 0, dy: 1, dz: 0 }, { dx: 0, dy: -1, dz: 0 },
        { dx: 0, dy: 0, dz: 1 }, { dx: 0, dy: 0, dz: -1 }
      ];
    case 'queen':
      return [
        // Diagonal
        { dx: 1, dy: 1, dz: 0 }, { dx: 1, dy: -1, dz: 0 },
        { dx: -1, dy: 1, dz: 0 }, { dx: -1, dy: -1, dz: 0 },
        // Straight
        { dx: 1, dy: 0, dz: 0 }, { dx: -1, dy: 0, dz: 0 },
        { dx: 0, dy: 1, dz: 0 }, { dx: 0, dy: -1, dz: 0 },
        // Vertical (3D)
        { dx: 0, dy: 0, dz: 1 }, { dx: 0, dy: 0, dz: -1 }
      ];
    case 'king':
      return [
        { dx: 1, dy: 0, dz: 0 }, { dx: -1, dy: 0, dz: 0 },
        { dx: 0, dy: 1, dz: 0 }, { dx: 0, dy: -1, dz: 0 },
        { dx: 1, dy: 1, dz: 0 }, { dx: 1, dy: -1, dz: 0 },
        { dx: -1, dy: 1, dz: 0 }, { dx: -1, dy: -1, dz: 0 },
        { dx: 0, dy: 0, dz: 1 }, { dx: 0, dy: 0, dz: -1 }
      ];
    default:
      return [];
  }
}

console.log('♟️ Chess AI Worker initialized and ready');
