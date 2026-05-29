// Self-Play Training System for 3D Chess AI
// Generates training data by having AI play against itself

import { selectBestMoveAdvanced } from './chessAI_advanced';
import { isCheckmate, isStalemate } from './threeDChessUtils';
import { trainingCollector } from './neuralNetwork';

// ==================== INITIAL POSITION SETUP ====================

/**
 * Create initial chess position
 */
function createInitialPosition() {
  const pieces = new Map();
  
  const add = (type, x, y, z, color) => {
    const key = `${x},${y},${z}`;
    pieces.set(key, { id: key, type, color, pos: { x, y, z }, hasMoved: false });
  };
  
  // WHITE PIECES on TOP BOARD (z=2)
  // Back rank
  add('rook', 0, 0, 2, 'white');
  add('knight', 1, 0, 2, 'white');
  add('bishop', 2, 0, 2, 'white');
  add('queen', 3, 0, 2, 'white');
  add('king', 4, 0, 2, 'white');
  add('bishop', 5, 0, 2, 'white');
  add('knight', 6, 0, 2, 'white');
  add('rook', 7, 0, 2, 'white');
  
  // Pawns
  for (let x = 0; x < 8; x++) {
    add('pawn', x, 1, 2, 'white');
  }
  
  // BLACK PIECES on BOTTOM BOARD (z=0)
  // Back rank
  add('rook', 0, 7, 0, 'black');
  add('knight', 1, 7, 0, 'black');
  add('bishop', 2, 7, 0, 'black');
  add('queen', 3, 7, 0, 'black');
  add('king', 4, 7, 0, 'black');
  add('bishop', 5, 7, 0, 'black');
  add('knight', 6, 7, 0, 'black');
  add('rook', 7, 7, 0, 'black');
  
  // Pawns
  for (let x = 0; x < 8; x++) {
    add('pawn', x, 6, 0, 'black');
  }
  
  return pieces;
}

// ==================== GAME SIMULATION ====================

/**
 * Play a single self-play game
 * Returns: { winner: 'white'|'black'|'draw', positions: [...], moveCount: number }
 */
export async function playSelfPlayGame(options = {}) {
  const {
    maxMoves = 100,  // Reduced from 200 to prevent memory issues
    difficulty = 'easy',  // Changed to 'easy' (depth 1) for 100x faster self-play
    useNN = false,
    verbose = false,
    onProgress = null
  } = options;
  
  let piecesMap = createInitialPosition();
  let toMove = 'white';
  let moveHistory = [];
  let positions = [];
  let moveCount = 0;
  
  if (verbose) {
    console.log('🎮 Starting self-play game...');
  }
  
  while (moveCount < maxMoves) {
    // Sample positions (every 4th move) for memory efficiency
    // Store positions throughout the game up to move 50
    if (moveCount % 4 === 0 && moveCount < 50) {
      const positionCopy = new Map();
      piecesMap.forEach((piece, key) => {
        positionCopy.set(key, { ...piece, pos: { ...piece.pos } });
      });
      positions.push(positionCopy);
      
      // Strict memory limit: max 15 positions per game to prevent crashes
      if (positions.length > 15) {
        positions.shift(); // Remove oldest position
      }
    }
    
    // Check for game end
    if (isCheckmate(piecesMap, toMove)) {
      const winner = toMove === 'white' ? 'black' : 'white';
      if (verbose) {
        console.log(`✓ Checkmate! ${winner.toUpperCase()} wins in ${moveCount} moves`);
      }
      return { winner, positions, moveCount, reason: 'checkmate' };
    }
    
    if (isStalemate(piecesMap, toMove)) {
      if (verbose) {
        console.log(`✓ Stalemate after ${moveCount} moves`);
      }
      return { winner: 'draw', positions, moveCount, reason: 'stalemate' };
    }
    
    // Get AI move with temperature for randomization
    // Temperature creates game variation - higher temp = more exploration
    // Opening: 0.5 (some randomness), Middlegame: 0.2 (less randomness, faster)
    const temperature = moveHistory.length < 16 ? 0.5 : 0.2;
    
    try {
      const move = await selectBestMoveAdvanced(piecesMap, toMove, difficulty, useNN, moveHistory, temperature);
      
      if (!move) {
        // No legal moves - shouldn't happen if checkmate/stalemate work correctly
        if (verbose) {
          console.log(`✓ No moves available - draw after ${moveCount} moves`);
        }
        return { winner: 'draw', positions, moveCount, reason: 'no-moves' };
      }
      
      // Execute move
      const piece = piecesMap.get(move.fromKey);
      if (!piece) {
        console.error('❌ Invalid move - piece not found:', move);
        return { winner: 'draw', positions, moveCount, reason: 'error' };
      }
      
      // Handle capture
      if (piecesMap.has(move.toKey)) {
        piecesMap.delete(move.toKey);
      }
      
      // Move piece
      piecesMap.delete(move.fromKey);
      piece.pos = move.to;
      piece.hasMoved = true;
      piecesMap.set(move.toKey, piece);
      
      // Record move
      moveHistory.push({
        from: move.from,
        to: move.to,
        piece: piece.type
      });
      
      // Switch turns
      toMove = toMove === 'white' ? 'black' : 'white';
      moveCount++;
      
      // Progress callback
      if (onProgress && moveCount % 10 === 0) {
        onProgress(moveCount, positions.length);
      }
      
      // Yield to browser EVERY move for maximum INP responsiveness
      await new Promise(resolve => setTimeout(resolve, 0));
      
    } catch (error) {
      console.error('❌ Error during self-play:', error);
      return { winner: 'draw', positions, moveCount, reason: 'error' };
    }
  }
  
  // Max moves reached - draw
  if (verbose) {
    console.log(`✓ Draw by move limit (${maxMoves} moves)`);
  }
  return { winner: 'draw', positions, moveCount, reason: 'move-limit' };
}

// ==================== BATCH GENERATION ====================

/**
 * Generate multiple self-play games
 */
export async function generateSelfPlayGames(numGames = 100, options = {}) {
  const {
    difficulty = 'easy',  // Changed to 'easy' (depth 1) for 100x faster self-play
    useNN = false,
    onGameComplete = null,
    onProgress = null
  } = options;
  
  console.log(`🎮 Generating ${numGames} self-play games...`);
  console.log(`   Difficulty: ${difficulty}, Neural Network: ${useNN ? 'enabled' : 'disabled'}`);
  
  const startTime = Date.now();
  let gamesCompleted = 0;
  let totalPositions = 0;
  
  const results = {
    whiteWins: 0,
    blackWins: 0,
    draws: 0,
    totalPositions: 0,
    avgMovesPerGame: 0,
    games: []
  };
  
  for (let i = 0; i < numGames; i++) {
    try {
      // Capture current values to avoid closure issues
      const currentGamesCompleted = gamesCompleted;
      const currentTotalPositions = totalPositions;
      
      // Use easy difficulty only - medium causes browser memory crashes
      // Easy generates varied positions without memory issues
      
      // eslint-disable-next-line no-loop-func
      const gameResult = await playSelfPlayGame({
        difficulty: 'easy',
        useNN,
        verbose: false,
        onProgress: (moves, positions) => {
          if (onProgress) {
            onProgress({
              gamesCompleted: currentGamesCompleted,
              totalGames: numGames,
              currentGameMoves: moves,
              totalPositions: currentTotalPositions + positions
            });
          }
        }
      });
      
      // Record result
      if (gameResult.winner === 'white') results.whiteWins++;
      else if (gameResult.winner === 'black') results.blackWins++;
      else results.draws++;
      
      results.games.push(gameResult);
      totalPositions += gameResult.positions.length;
      
      // Add to training data
      trainingCollector.addGame(gameResult.positions, gameResult.winner);
      
      // Aggressive memory cleanup to prevent browser crashes
      gameResult.positions = null;
      gameResult.moveHistory = null;
      
      gamesCompleted++;
      
      if (onGameComplete) {
        onGameComplete(i + 1, numGames, gameResult);
      }
      
      // Aggressive memory management: yield to browser more frequently
      // This allows garbage collection and prevents memory buildup
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Log progress every 10 games
      if ((i + 1) % 10 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const gamesPerSec = (i + 1) / elapsed;
        const remaining = (numGames - (i + 1)) / gamesPerSec;
        console.log(`   ${i + 1}/${numGames} games (${(gamesPerSec * 60).toFixed(1)} games/min, ~${Math.ceil(remaining)}s remaining)`);
      }
      
    } catch (error) {
      console.error(`❌ Error in game ${i + 1}:`, error);
    }
  }
  
  // Calculate statistics
  results.totalPositions = totalPositions;
  results.avgMovesPerGame = totalPositions / numGames;
  
  const elapsed = (Date.now() - startTime) / 1000;
  
  console.log(`✅ Self-play generation complete!`);
  console.log(`   Time: ${elapsed.toFixed(1)}s (${(numGames / elapsed * 60).toFixed(1)} games/min)`);
  console.log(`   Results: ${results.whiteWins}W / ${results.blackWins}B / ${results.draws}D`);
  console.log(`   Positions: ${totalPositions} (avg ${Math.round(results.avgMovesPerGame)} per game)`);
  console.log(`   Training data now: ${trainingCollector.getDataSize()} positions`);
  
  return results;
}

// ==================== QUICK TRAINING PRESETS ====================

/**
 * Quick training presets for different levels
 */
export const trainingPresets = {
  quick: {
    games: 10,
    difficulty: 'easy',
    description: '10 games at easy difficulty (~5 minutes)'
  },
  standard: {
    games: 100,
    difficulty: 'medium',
    description: '100 games at medium difficulty (~1 hour)'
  },
  extensive: {
    games: 500,
    difficulty: 'hard',
    description: '500 games at hard difficulty (~6 hours)'
  },
  master: {
    games: 1000,
    difficulty: 'master',
    description: '1000 games at master difficulty (~15 hours)'
  }
};

/**
 * Run a training preset
 */
export async function runTrainingPreset(presetName, onProgress = null) {
  const preset = trainingPresets[presetName];
  
  if (!preset) {
    console.error(`❌ Unknown preset: ${presetName}`);
    return null;
  }
  
  console.log(`🎓 Running training preset: ${presetName}`);
  console.log(`   ${preset.description}`);
  
  return await generateSelfPlayGames(preset.games, {
    difficulty: preset.difficulty,
    useNN: false, // Don't use NN for generation (too slow)
    onProgress
  });
}

// ==================== PARALLEL GENERATION ====================

/**
 * Generate games in batches for better performance
 */
export async function generateSelfPlayGamesBatch(totalGames = 100, batchSize = 10, options = {}) {
  console.log(`🎮 Generating ${totalGames} games in batches of ${batchSize}...`);
  
  const batches = Math.ceil(totalGames / batchSize);
  let totalResults = {
    whiteWins: 0,
    blackWins: 0,
    draws: 0,
    totalPositions: 0,
    avgMovesPerGame: 0,
    games: []
  };
  
  for (let batch = 0; batch < batches; batch++) {
    const gamesInBatch = Math.min(batchSize, totalGames - (batch * batchSize));
    console.log(`\n📦 Batch ${batch + 1}/${batches} (${gamesInBatch} games)...`);
    
    const batchResults = await generateSelfPlayGames(gamesInBatch, {
      ...options,
      onGameComplete: (gameNum, total, result) => {
        if (options.onGameComplete) {
          options.onGameComplete(
            batch * batchSize + gameNum,
            totalGames,
            result
          );
        }
      }
    });
    
    // Aggregate results
    totalResults.whiteWins += batchResults.whiteWins;
    totalResults.blackWins += batchResults.blackWins;
    totalResults.draws += batchResults.draws;
    totalResults.totalPositions += batchResults.totalPositions;
    totalResults.games.push(...batchResults.games);
  }
  
  totalResults.avgMovesPerGame = totalResults.totalPositions / totalGames;
  
  console.log(`\n✅ All batches complete!`);
  console.log(`   Total: ${totalResults.whiteWins}W / ${totalResults.blackWins}B / ${totalResults.draws}D`);
  console.log(`   Positions: ${totalResults.totalPositions}`);
  
  return totalResults;
}

// ==================== ANTI-QUEEN BLUNDER TRAINING ====================

/**
 * Generate training games where black plays early queen and gets punished
 * FAST VERSION: Uses pre-scripted complete games instead of AI computation
 * This creates negative examples to teach the NN that early queen = bad
 */
export async function generateAntiQueenTraining(numGames = 15, onProgress = null) {
  console.log('🎯 Starting Anti-Queen Blunder Training...');
  console.log('   Teaching neural network that early queen development leads to losses\n');
  
  // Pre-scripted complete games showing early queen getting punished
  // Each game is fully scripted - no AI computation needed (instant!)
  const scriptedGames = [
    {
      name: 'Queen to f6 → Captured by Knight',
      moves: [
        // 1. e4 d6
        { from: {x:4,y:1,z:2}, to: {x:4,y:3,z:2} }, // White: e2-e4
        { from: {x:3,y:6,z:0}, to: {x:3,y:5,z:0} }, // Black: d7-d6
        // 2. Nf3 Qf6?? (BLUNDER!)
        { from: {x:6,y:0,z:2}, to: {x:5,y:2,z:2} }, // White: Ng1-f3
        { from: {x:3,y:7,z:0}, to: {x:5,y:5,z:2} }, // Black: Qd8-f6 (early queen!)
        // 3. Nc3 (develop) e5
        { from: {x:1,y:0,z:2}, to: {x:2,y:2,z:2} }, // White: Nb1-c3
        { from: {x:4,y:6,z:0}, to: {x:4,y:4,z:0} }, // Black: e7-e5
        // 4. Nd5 (attacks queen!) Qd8
        { from: {x:2,y:2,z:2}, to: {x:3,y:4,z:2} }, // White: Nc3-d5
        { from: {x:5,y:5,z:2}, to: {x:3,y:7,z:0} }, // Black: Qf6-d8 (retreat)
        // 5. d4 exd4
        { from: {x:3,y:1,z:2}, to: {x:3,y:3,z:2} }, // White: d2-d4
        { from: {x:4,y:4,z:0}, to: {x:3,y:3,z:2} }, // Black: e5xd4
        // 6. Nxd4 (recapture) Nf6
        { from: {x:5,y:2,z:2}, to: {x:3,y:3,z:2} }, // White: Nf3xd4
        { from: {x:6,y:7,z:0}, to: {x:5,y:5,z:0} }, // Black: Ng8-f6
        // 7. Nc7+ (fork!) - White wins rook
        { from: {x:3,y:4,z:2}, to: {x:2,y:6,z:0} }, // White: Nd5-c7+ (check + rook)
      ]
    },
    {
      name: 'Queen to h5 → Trapped and Captured',
      moves: [
        // 1. e4 e5
        { from: {x:4,y:1,z:2}, to: {x:4,y:3,z:2} }, // White: e2-e4
        { from: {x:4,y:6,z:0}, to: {x:4,y:4,z:0} }, // Black: e7-e5
        // 2. Bc4 Qh5?? (BLUNDER!)
        { from: {x:5,y:0,z:2}, to: {x:2,y:3,z:2} }, // White: Bf1-c4
        { from: {x:3,y:7,z:0}, to: {x:7,y:3,z:0} }, // Black: Qd8-h5 (early queen!)
        // 3. Nf3 (attacks queen!) Qg6
        { from: {x:6,y:0,z:2}, to: {x:5,y:2,z:2} }, // White: Ng1-f3
        { from: {x:7,y:3,z:0}, to: {x:6,y:2,z:0} }, // Black: Qh5-g6 (retreat)
        // 4. d4 exd4
        { from: {x:3,y:1,z:2}, to: {x:3,y:3,z:2} }, // White: d2-d4
        { from: {x:4,y:4,z:0}, to: {x:3,y:3,z:2} }, // Black: e5xd4
        // 5. Nxd4 Bc5
        { from: {x:5,y:2,z:2}, to: {x:3,y:3,z:2} }, // White: Nf3xd4
        { from: {x:5,y:7,z:0}, to: {x:2,y:4,z:0} }, // Black: Bf8-c5
        // 6. Nf5 (attacks queen again!) Qf6
        { from: {x:3,y:3,z:2}, to: {x:4,y:5,z:2} }, // White: Nd4-f5
        { from: {x:6,y:2,z:0}, to: {x:5,y:5,z:2} }, // Black: Qg6-f6
        // 7. Nc3 Nf6
        { from: {x:1,y:0,z:2}, to: {x:2,y:2,z:2} }, // White: Nb1-c3
        { from: {x:6,y:7,z:0}, to: {x:5,y:5,z:0} }, // Black: Ng8-f6
        // 8. Nd5 (forks queen and knight!) Qd8
        { from: {x:2,y:2,z:2}, to: {x:3,y:4,z:2} }, // White: Nc3-d5
        { from: {x:5,y:5,z:2}, to: {x:3,y:7,z:0} }, // Black: Qf6-d8
        // 9. Nxf6+ (captures knight with check)
        { from: {x:3,y:4,z:2}, to: {x:5,y:5,z:0} }, // White: Nd5xf6+
      ]
    },
    {
      name: 'Queen to e4 → Pinned and Lost',
      moves: [
        // 1. d4 e6
        { from: {x:3,y:1,z:2}, to: {x:3,y:3,z:2} }, // White: d2-d4
        { from: {x:4,y:6,z:0}, to: {x:4,y:5,z:0} }, // Black: e7-e6
        // 2. Nc3 Qe4?? (BLUNDER!)
        { from: {x:1,y:0,z:2}, to: {x:2,y:2,z:2} }, // White: Nb1-c3
        { from: {x:3,y:7,z:0}, to: {x:4,y:3,z:2} }, // Black: Qd8-e4 (early queen!)
        // 3. Nf3 (attacks queen!) Qf5
        { from: {x:6,y:0,z:2}, to: {x:5,y:2,z:2} }, // White: Ng1-f3
        { from: {x:4,y:3,z:2}, to: {x:5,y:4,z:2} }, // Black: Qe4-f5
        // 4. e4 (attacks queen again!) Qg6
        { from: {x:4,y:1,z:2}, to: {x:4,y:3,z:2} }, // White: e2-e4
        { from: {x:5,y:4,z:2}, to: {x:6,y:5,z:2} }, // Black: Qf5-g6
        // 5. Bd3 (pins queen to king!) Qg4
        { from: {x:5,y:0,z:2}, to: {x:2,y:3,z:2} }, // White: Bf1-d3
        { from: {x:6,y:5,z:2}, to: {x:6,y:3,z:2} }, // Black: Qg6-g4
        // 6. e5 (advance) d6
        { from: {x:4,y:3,z:2}, to: {x:4,y:4,z:2} }, // White: e4-e5
        { from: {x:3,y:6,z:0}, to: {x:3,y:5,z:0} }, // Black: d7-d6
        // 7. h3 (traps queen!) Qg6
        { from: {x:7,y:1,z:2}, to: {x:7,y:3,z:2} }, // White: h2-h3
        { from: {x:6,y:3,z:2}, to: {x:6,y:5,z:2} }, // Black: Qg4-g6
        // 8. Bxg6 (captures queen!)
        { from: {x:2,y:3,z:2}, to: {x:6,y:5,z:2} }, // White: Bd3xg6 (wins queen!)
      ]
    }
  ];

  let totalGames = 0;
  let totalPositions = 0;
  const gamesPerScenario = Math.ceil(numGames / scriptedGames.length);

  for (const scenario of scriptedGames) {
    console.log(`\n📖 Scenario: ${scenario.name}`);
    
    for (let gameNum = 0; gameNum < gamesPerScenario; gameNum++) {
      let pieces = createInitialPosition();
      const moveHistory = [];
      const positions = [];

      console.log(`   🎮 Game ${gameNum + 1}/${gamesPerScenario} - ${scenario.name}`);

      // Execute all scripted moves
      for (let moveIdx = 0; moveIdx < scenario.moves.length; moveIdx++) {
        const move = scenario.moves[moveIdx];
        const fromKey = `${move.from.x},${move.from.y},${move.from.z}`;
        const toKey = `${move.to.x},${move.to.y},${move.to.z}`;
        
        const piece = pieces.get(fromKey);
        if (!piece) {
          console.error(`   ❌ Invalid move ${moveIdx + 1} - piece not found at`, move.from);
          break;
        }

        // Make the move
        const newPieces = new Map();
        for (const [key, p] of pieces.entries()) {
          newPieces.set(key, { ...p, pos: { ...p.pos } });
        }
        
        newPieces.delete(fromKey);
        newPieces.delete(toKey); // Capture if exists
        piece.pos = move.to;
        piece.hasMoved = true;
        newPieces.set(toKey, piece);
        
        pieces = newPieces;
        moveHistory.push({ from: move.from, to: move.to, piece: piece.type });
        
        // Record position as Map (encodeBoardState needs Map, not object)
        const boardState = new Map();
        for (const [key, p] of pieces.entries()) {
          boardState.set(key, { ...p, pos: { ...p.pos } });
        }
        positions.push(boardState);

        // Yield every 3 moves to keep UI responsive
        if (moveIdx % 3 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      console.log(`   ✅ Completed ${scenario.moves.length} moves - ${positions.length} positions recorded`);

      // Record this game as WHITE WIN (black's early queen was punished)
      trainingCollector.addGame(positions, 'white');
      totalGames++;
      totalPositions += positions.length;

      if (onProgress) {
        const progress = totalGames / numGames;
        onProgress(progress, `${totalGames}/${numGames} games - ${scenario.name}`);
      }

      // Yield between games
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  console.log(`\n✅ Anti-Queen Training Complete!`);
  console.log(`   Games: ${totalGames}`);
  console.log(`   Positions: ${totalPositions}`);
  console.log(`   Average: ${Math.round(totalPositions / totalGames)} positions per game`);
  console.log(`   Result: All games recorded as WHITE WINS (black punished for early queen)`);
  console.log('\n💡 Next: Click "Train Neural Network" to teach the AI this pattern!');

  return {
    whiteWins: totalGames,
    blackWins: 0,
    draws: 0,
    totalPositions,
    avgMovesPerGame: totalPositions / totalGames,
    games: []
  };
}
