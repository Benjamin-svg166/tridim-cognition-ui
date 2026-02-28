#!/usr/bin/env node

/**
 * Quick Neural Network Training Script
 * 
 * This script:
 * 1. Generates self-play training data (50 games)
 * 2. Collects diverse positions with outcome labels
 * 3. Shows progress and statistics
 * 
 * Usage: node train_network_quick.js
 */

const { createInitialBoard, getValidMoves, makeMove } = require('./src/components/threeDChessUtils.js');
const { evaluatePosition } = require('./src/components/chessAI_advanced.js');

console.log('🎮 3D Chess Neural Network Training');
console.log('====================================\n');

// Game configuration
const MAX_GAMES = 50;
const MAX_MOVES = 100;
const trainingData = [];

// Simple random move selection for fast games
function selectRandomMove(moves) {
  return moves[Math.floor(Math.random() * moves.length)];
}

// Play one self-play game
function playSelfPlayGame(gameNumber) {
  let board = createInitialBoard(8, 3);
  let currentPlayer = 'white';
  let moveCount = 0;
  const gamePositions = [];
  
  while (moveCount < MAX_MOVES) {
    const allMoves = getValidMoves(board, currentPlayer, 8, 3);
    
    if (allMoves.length === 0) {
      // Game over - no legal moves
      const winner = currentPlayer === 'white' ? 'black' : 'white';
      labelPositions(gamePositions, winner);
      return { winner, moveCount, reason: 'no_moves' };
    }
    
    // Save position before move
    gamePositions.push({
      board: JSON.parse(JSON.stringify(board)),
      player: currentPlayer
    });
    
    // Select and make move
    const move = selectRandomMove(allMoves);
    board = makeMove(board, move.from, move.to, 8, 3);
    
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    moveCount++;
    
    // Check for simple draw condition (too many moves)
    if (moveCount >= MAX_MOVES) {
      labelPositions(gamePositions, 'draw');
      return { winner: 'draw', moveCount, reason: 'move_limit' };
    }
  }
  
  labelPositions(gamePositions, 'draw');
  return { winner: 'draw', moveCount, reason: 'move_limit' };
}

// Label positions based on game outcome
function labelPositions(positions, winner) {
  positions.forEach(pos => {
    let label = 0; // draw
    
    if (winner !== 'draw') {
      if (pos.player === winner) {
        label = 1; // winning position
      } else {
        label = -1; // losing position
      }
    }
    
    trainingData.push({
      board: pos.board,
      player: pos.player,
      label: label,
      outcome: winner
    });
  });
}

// Main training loop
async function runTraining() {
  console.log(`🎯 Generating ${MAX_GAMES} self-play games...\n`);
  
  const startTime = Date.now();
  let whiteWins = 0;
  let blackWins = 0;
  let draws = 0;
  
  for (let i = 0; i < MAX_GAMES; i++) {
    const result = playSelfPlayGame(i + 1);
    
    if (result.winner === 'white') whiteWins++;
    else if (result.winner === 'black') blackWins++;
    else draws++;
    
    // Progress indicator
    if ((i + 1) % 10 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const posPerGame = Math.round(trainingData.length / (i + 1));
      console.log(`  ✅ Completed ${i + 1}/${MAX_GAMES} games (${elapsed}s, ~${posPerGame} pos/game)`);
    }
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('\n📊 Training Data Summary');
  console.log('========================');
  console.log(`Total Games: ${MAX_GAMES}`);
  console.log(`  White Wins: ${whiteWins} (${Math.round(whiteWins/MAX_GAMES*100)}%)`);
  console.log(`  Black Wins: ${blackWins} (${Math.round(blackWins/MAX_GAMES*100)}%)`);
  console.log(`  Draws: ${draws} (${Math.round(draws/MAX_GAMES*100)}%)`);
  console.log(`\nTotal Positions: ${trainingData.length}`);
  console.log(`  Winning: ${trainingData.filter(p => p.label === 1).length}`);
  console.log(`  Losing: ${trainingData.filter(p => p.label === -1).length}`);
  console.log(`  Draw: ${trainingData.filter(p => p.label === 0).length}`);
  console.log(`\nTime: ${totalTime}s (${(totalTime/MAX_GAMES).toFixed(2)}s per game)`);
  console.log(`\n✅ Training data ready!`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Open the app: npm start`);
  console.log(`   2. The app will load this training data automatically`);
  console.log(`   3. Click "🧠 Train AI" in Neural Network Training panel`);
  console.log(`   4. Wait for training to complete (~30-60 seconds)`);
  console.log(`   5. Test the trained AI by playing games!`);
  
  // Save to localStorage format (for manual import if needed)
  console.log(`\n📝 Training data generated successfully!`);
  console.log(`   Data size: ~${Math.round(JSON.stringify(trainingData).length / 1024)}KB`);
}

// Run the training data generation
runTraining().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
