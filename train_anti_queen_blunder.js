/**
 * Targeted Training: Generate games where early queen development gets punished
 * 
 * This script creates training data by:
 * 1. Forcing black to play early queen (move 2-4)
 * 2. Running white AI to punish it
 * 3. Recording the resulting positions with negative scores for black
 * 
 * Goal: Teach neural network that early queen = bad position
 */

const { trainingCollector } = require('./src/components/neuralNetwork');
const { selectBestMoveAdvanced } = require('./src/components/chessAI_advanced');

// Initial board setup - same as game start
function getInitialPieces() {
  const pieces = new Map();
  const add = (type, x, y, z, color) => {
    const key = `${x},${y},${z}`;
    pieces.set(key, { id: key, type, color, pos: { x, y, z }, hasMoved: false });
  };

  // WHITE PIECES on TOP BOARD (z=2)
  add('rook', 0, 0, 2, 'white');
  add('knight', 1, 0, 2, 'white');
  add('bishop', 2, 0, 2, 'white');
  add('queen', 3, 0, 2, 'white');
  add('king', 4, 0, 2, 'white');
  add('bishop', 5, 0, 2, 'white');
  add('knight', 6, 0, 2, 'white');
  add('rook', 7, 0, 2, 'white');
  for (let x = 0; x < 8; x++) add('pawn', x, 1, 2, 'white');

  // BLACK PIECES on BOTTOM BOARD (z=0)
  for (let x = 0; x < 8; x++) add('pawn', x, 6, 0, 'black');
  add('rook', 0, 7, 0, 'black');
  add('knight', 1, 7, 0, 'black');
  add('bishop', 2, 7, 0, 'black');
  add('queen', 3, 7, 0, 'black');
  add('king', 4, 7, 0, 'black');
  add('bishop', 5, 7, 0, 'black');
  add('knight', 6, 7, 0, 'black');
  add('rook', 7, 7, 0, 'black');

  return pieces;
}

// Make a move on the board
function makeMove(pieces, from, to) {
  const newPieces = new Map();
  for (const [key, piece] of pieces.entries()) {
    newPieces.set(key, { ...piece, pos: { ...piece.pos } });
  }

  const fromKey = `${from.x},${from.y},${from.z}`;
  const toKey = `${to.x},${to.y},${to.z}`;
  const piece = newPieces.get(fromKey);

  if (!piece) return null;

  newPieces.delete(fromKey);
  newPieces.delete(toKey); // Remove captured piece if any
  piece.pos = to;
  piece.hasMoved = true;
  newPieces.set(toKey, piece);

  return newPieces;
}

// Record board state as training position
function recordPosition(pieces, moveHistory) {
  // Clone pieces map to simple object
  const boardState = {};
  for (const [key, piece] of pieces.entries()) {
    boardState[key] = { ...piece };
  }
  return boardState;
}

async function runTargetedTraining() {
  console.log('🎯 Starting targeted anti-queen-blunder training...\n');
  
  const scenarios = [
    {
      name: 'Early Queen to e4 (classical blunder)',
      blackMoves: [
        { from: { x: 4, y: 6, z: 0 }, to: { x: 4, y: 5, z: 0 } }, // e7-e6 pawn
        { from: { x: 3, y: 7, z: 0 }, to: { x: 7, y: 3, z: 2 } }, // queen to e4 (top board!)
      ]
    },
    {
      name: 'Early Queen to h5 (scholar\'s mate attempt)',
      blackMoves: [
        { from: { x: 4, y: 6, z: 0 }, to: { x: 4, y: 4, z: 0 } }, // e7-e5 pawn (2 squares)
        { from: { x: 3, y: 7, z: 0 }, to: { x: 7, y: 3, z: 0 } }, // queen to h5
      ]
    },
    {
      name: 'Early Queen to f6 (center attack)',
      blackMoves: [
        { from: { x: 3, y: 6, z: 0 }, to: { x: 3, y: 5, z: 0 } }, // d7-d6 pawn
        { from: { x: 3, y: 7, z: 0 }, to: { x: 5, y: 5, z: 2 } }, // queen to f6
      ]
    }
  ];

  let totalGames = 0;
  let totalPositions = 0;

  for (const scenario of scenarios) {
    console.log(`\n📖 Scenario: ${scenario.name}`);
    console.log('━'.repeat(60));

    // Play 5 games per scenario
    for (let gameNum = 1; gameNum <= 5; gameNum++) {
      let pieces = getInitialPieces();
      const moveHistory = [];
      const gamePositions = [];

      console.log(`\n  Game ${gameNum}/5:`);

      // White's first move (AI)
      let whiteMove = await selectBestMoveAdvanced(pieces, 'white', 'hard', false, moveHistory, 0.0);
      if (!whiteMove) {
        console.log('    ❌ White has no moves (impossible)');
        continue;
      }
      pieces = makeMove(pieces, whiteMove.from, whiteMove.to);
      moveHistory.push({ from: whiteMove.from, to: whiteMove.to, piece: 'unknown' });
      gamePositions.push(recordPosition(pieces, moveHistory));
      console.log(`    1. White: ${JSON.stringify(whiteMove.from)} → ${JSON.stringify(whiteMove.to)}`);

      // Black's scripted blunder moves
      for (let i = 0; i < scenario.blackMoves.length; i++) {
        const blackMove = scenario.blackMoves[i];
        pieces = makeMove(pieces, blackMove.from, blackMove.to);
        moveHistory.push(blackMove);
        gamePositions.push(recordPosition(pieces, moveHistory));
        console.log(`    ${i + 2}. Black (scripted): ${JSON.stringify(blackMove.from)} → ${JSON.stringify(blackMove.to)}`);

        // White responds with AI
        if (i < scenario.blackMoves.length - 1 || true) {
          whiteMove = await selectBestMoveAdvanced(pieces, 'white', 'hard', false, moveHistory, 0.0);
          if (!whiteMove) {
            console.log('    ❌ White has no moves');
            break;
          }
          pieces = makeMove(pieces, whiteMove.from, whiteMove.to);
          moveHistory.push({ from: whiteMove.from, to: whiteMove.to });
          gamePositions.push(recordPosition(pieces, moveHistory));
          console.log(`    ${i + 3}. White: ${JSON.stringify(whiteMove.from)} → ${JSON.stringify(whiteMove.to)}`);
        }
      }

      // Play out 10 more moves to show the punishment
      let toMove = 'black';
      for (let moveNum = 0; moveNum < 20; moveNum++) {
        const move = await selectBestMoveAdvanced(pieces, toMove, 'hard', false, moveHistory, 0.0);
        if (!move) {
          console.log(`    ⚠️ ${toMove} has no legal moves`);
          break;
        }

        pieces = makeMove(pieces, move.from, move.to);
        moveHistory.push(move);
        gamePositions.push(recordPosition(pieces, moveHistory));

        // Check if queen was captured
        let blackQueenExists = false;
        for (const [key, piece] of pieces.entries()) {
          if (piece.type === 'queen' && piece.color === 'black') {
            blackQueenExists = true;
            break;
          }
        }

        if (!blackQueenExists) {
          console.log(`    ✅ Black queen captured on move ${Math.floor(moveHistory.length / 2)}!`);
          break;
        }

        toMove = toMove === 'white' ? 'black' : 'white';

        // Progress indicator
        if (moveNum % 5 === 0 && moveNum > 0) {
          console.log(`    ... ${moveNum} moves played ...`);
        }
      }

      // Record this game as a WHITE WIN (black lost due to early queen)
      console.log(`    📊 Recording ${gamePositions.length} positions as white win (black's early queen punished)`);
      trainingCollector.addGame(gamePositions, 'white');
      
      totalGames++;
      totalPositions += gamePositions.length;
    }
  }

  console.log('\n\n🎉 TRAINING DATA GENERATION COMPLETE!');
  console.log('═'.repeat(60));
  console.log(`Total games: ${totalGames}`);
  console.log(`Total positions: ${totalPositions}`);
  console.log(`Average positions per game: ${Math.round(totalPositions / totalGames)}`);
  console.log('\n💡 Next step: Click "Train Neural Network" in the UI');
  console.log('   The network will now learn that early queen development leads to losses.');
}

// Run the training
runTargetedTraining().catch(console.error);
