# Self-Play Training System

## Overview

The **Self-Play Training System** enables the 3D Chess AI to learn by playing thousands of games against itself. This is a powerful reinforcement learning technique used by modern chess engines like AlphaZero.

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────┐
│              Self-Play Game Generator                │
│                                                       │
│  1. Create Initial Position                          │
│  2. AI (White) calculates move                       │
│  3. Execute move, record position                    │
│  4. AI (Black) calculates move                       │
│  5. Execute move, record position                    │
│  6. Repeat until checkmate/stalemate/draw            │
│  7. Label all positions with outcome (+1/-1/0)       │
│  8. Store in training database                       │
└─────────────────────────────────────────────────────┘
```

### Components

1. **selfPlay.js**: Core self-play engine
   - `playSelfPlayGame()`: Simulates single AI vs AI game
   - `generateSelfPlayGames()`: Generates batch of games
   - `generateSelfPlayGamesBatch()`: Parallel batch processing
   - `trainingPresets`: Quick/Standard/Extensive/Master presets

2. **neuralNetwork.js**: Integration point
   - `generateSelfPlayData()`: Entry point for self-play
   - Automatically stores generated positions in training database

3. **ThreeDChessBoard.jsx**: User interface
   - "Quick (10 games)" button - Testing/debugging
   - "Standard (100 games)" button - Regular training
   - "Extensive (1000 games)" button - Deep learning

## Usage

### Quick Start

1. **Enable Advanced AI** in the UI
2. Click one of the self-play buttons:
   - 🚀 **Quick (10 games)**: ~5-10 minutes, generates ~500 positions
   - 📚 **Standard (100 games)**: ~1-2 hours, generates ~5,000 positions
   - 🔥 **Extensive (1000 games)**: ~10-20 hours, generates ~50,000 positions

3. Wait for completion (progress shown in UI)
4. Click **"🎓 Train Neural Network"** to learn from the data

### Programmatic API

```javascript
import { generateSelfPlayGames, playSelfPlayGame } from './components/selfPlay';

// Generate 100 games
const results = await generateSelfPlayGames(100, {
  difficulty: 'medium',
  useNN: false,
  onProgress: (data) => {
    console.log(`${data.gamesCompleted}/${data.totalGames} complete`);
  },
  onGameComplete: (gameNum, total, result) => {
    console.log(`Game ${gameNum}: ${result.winner} (${result.moveCount} moves)`);
  }
});

console.log('Results:', results);
// {
//   whiteWins: 45,
//   blackWins: 42,
//   draws: 13,
//   totalPositions: 5234,
//   avgMovesPerGame: 52.34
// }
```

### Single Game Simulation

```javascript
import { playSelfPlayGame } from './components/selfPlay';

const game = await playSelfPlayGame({
  maxMoves: 200,
  difficulty: 'hard',
  useNN: false,
  verbose: true
});

console.log(`Winner: ${game.winner}`);
console.log(`Moves: ${game.moveCount}`);
console.log(`Positions: ${game.positions.length}`);
console.log(`Reason: ${game.reason}`);
```

## Training Presets

The system includes 4 built-in training presets:

### Quick (10 games, Easy difficulty)
- **Time**: ~5-10 minutes
- **Positions**: ~500
- **Use case**: Testing, debugging, quick experiments

### Standard (100 games, Medium difficulty)
- **Time**: ~1-2 hours
- **Positions**: ~5,000
- **Use case**: Regular training sessions, building initial database

### Extensive (500 games, Hard difficulty)
- **Time**: ~6-10 hours
- **Positions**: ~25,000
- **Use case**: Deep learning, high-quality training data

### Master (1000 games, Master difficulty)
- **Time**: ~15-20 hours
- **Positions**: ~50,000
- **Use case**: Expert-level AI training, tournament preparation

## Performance Characteristics

### Game Duration
- **Easy**: 2-4 seconds/game (~15 moves avg)
- **Medium**: 5-8 seconds/game (~50 moves avg)
- **Hard**: 30-60 seconds/game (~60 moves avg)
- **Master**: 60-90 seconds/game (~80 moves avg)

### Position Quality
- **Easy**: Fast but lower quality (random moves common)
- **Medium**: Good balance of speed and quality (recommended)
- **Hard**: High quality tactical play
- **Master**: Best quality but very slow

### Storage Limits
- Training data stored in localStorage (10,000 position limit)
- Each position is ~5KB (encoded board state + evaluation)
- 10,000 positions ≈ 50MB storage
- System automatically manages limit (FIFO when full)

## Reinforcement Learning

### Outcome Labeling

Each position is labeled based on the game outcome:

```javascript
if (winner === 'white') {
  // White's positions: +1 (good)
  // Black's positions: -1 (bad)
} else if (winner === 'black') {
  // Black's positions: +1 (good)
  // White's positions: -1 (bad)
} else {
  // Both sides: 0 (neutral)
}
```

### Training Process

1. **Generate Data**: Self-play creates thousands of positions
2. **Label Outcomes**: Positions tagged with win/loss/draw
3. **Train Network**: Neural network learns position evaluation
4. **Improve AI**: Next generation uses trained network
5. **Iterate**: Repeat cycle for continuous improvement

## AlphaZero-Style Learning

This system implements key concepts from AlphaZero:

1. **Self-Play**: AI learns without human games
2. **Reinforcement Learning**: Outcome-based position evaluation
3. **Neural Network**: Pattern recognition for position assessment
4. **Iterative Improvement**: Each generation stronger than last

### Differences from AlphaZero

| Feature | AlphaZero | Our Implementation |
|---------|-----------|-------------------|
| Search | MCTS | Minimax + Alpha-Beta |
| Network | Deep CNN | Dense NN (512→256→128) |
| Training | GPU TPU clusters | Browser TensorFlow.js |
| Scale | Millions of games | Thousands of games |
| Speed | ~1000 games/hour | ~5-100 games/hour |

## Optimization Tips

### Speed Optimization

1. **Lower Difficulty**: Use "Medium" for bulk generation
   - 10x faster than "Master"
   - Still produces quality training data

2. **Batch Processing**: Generate in batches of 100
   - Prevents UI blocking
   - Better memory management

3. **Disable Neural Network**: `useNN: false` during generation
   - NN evaluation is slow
   - Use pure minimax for faster games

### Quality Optimization

1. **Mix Difficulties**: Combine different difficulty levels
   - Easy: Fast opening variety
   - Medium: Solid middlegame play
   - Hard: Accurate endgames

2. **Filter Bad Games**: Remove very short games (< 10 moves)
   - Usually indicate blunders
   - Lower quality training data

3. **Balance Outcomes**: Ensure mix of wins/losses/draws
   - Prevents overfitting
   - More robust AI

## Monitoring & Progress

### Console Output

```
🎮 Generating 100 self-play games...
   Difficulty: medium, Neural Network: disabled
   10/100 games (8.5 games/min, ~636s remaining)
   20/100 games (9.2 games/min, ~522s remaining)
   ...
   100/100 games (8.8 games/min, 0s remaining)
✅ Self-play generation complete!
   Time: 681.3s (8.8 games/min)
   Results: 42W / 45B / 13D
   Positions: 5234 (avg 52 per game)
   Training data now: 5700 positions
```

### UI Progress Display

- **Status Bar**: Shows current game number
- **Percentage**: Overall completion (0-100%)
- **Time Estimate**: Remaining time calculation
- **Live Updates**: Real-time progress every 10 games

## Troubleshooting

### Games Too Slow
- **Problem**: 1000 games taking 30+ hours
- **Solution**: Use "Medium" difficulty instead of "Master"
- **Alternative**: Generate in smaller batches (100 at a time)

### Not Enough Storage
- **Problem**: "Storage quota exceeded" error
- **Solution**: Train and clear data more frequently
- **Alternative**: Reduce position limit in neuralNetwork.js

### AI Not Improving
- **Problem**: Neural network not learning
- **Solution**: Need more diverse positions (1000+ minimum)
- **Alternative**: Mix human games with self-play data

### UI Freezing
- **Problem**: Browser unresponsive during generation
- **Solution**: This is normal - JavaScript is single-threaded
- **Alternative**: Use smaller batches or run in background tab

## Future Enhancements

### Planned Features
- [ ] Web Worker implementation for background processing
- [ ] IndexedDB storage for unlimited positions
- [ ] Monte Carlo Tree Search (MCTS) integration
- [ ] Opening book learning from self-play
- [ ] Automated training cycles
- [ ] Multi-device distributed training

### Advanced Options
- [ ] Temperature-based move selection
- [ ] Position diversity filtering
- [ ] Adaptive difficulty adjustment
- [ ] Custom evaluation function training

## Best Practices

1. **Start Small**: Begin with 10-100 games to test
2. **Verify Quality**: Check game outcomes (should be balanced)
3. **Regular Training**: Train NN every 1000 positions
4. **Monitor Performance**: Track win rates over time
5. **Backup Data**: Export training data periodically

## References

- **AlphaZero Paper**: Silver et al., "Mastering Chess and Shogi by Self-Play with a General Reinforcement Learning Algorithm" (2017)
- **AlphaGo Zero**: Silver et al., "Mastering the game of Go without human knowledge" (2017)
- **Reinforcement Learning**: Sutton & Barto, "Reinforcement Learning: An Introduction" (2018)

## Implementation Details

### File: selfPlay.js (351 lines)

**Key Functions**:
- `createInitialPosition()`: Sets up standard chess starting position
- `playSelfPlayGame()`: Complete game simulation loop
- `generateSelfPlayGames()`: Batch generation with progress tracking
- `trainingPresets`: Pre-configured training sessions

**Dependencies**:
- `chessAI_advanced.js`: For move generation
- `threeDChessUtils.js`: For game rules (checkmate, stalemate)
- `neuralNetwork.js`: For training data storage

### Integration Points

**neuralNetwork.js**:
```javascript
async generateSelfPlayData(games = 10, onProgress = null) {
  const { generateSelfPlayGames } = await import('./selfPlay');
  return await generateSelfPlayGames(games, { onProgress });
}
```

**ThreeDChessBoard.jsx**:
```javascript
const handleGenerateSelfPlay = async (numGames, description) => {
  const results = await trainingCollector.generateSelfPlayData(
    numGames,
    (progress, message) => setTrainingProgress({ ... })
  );
  // Show results dialog
};
```

## Conclusion

The Self-Play Training System provides a powerful way to generate unlimited training data without human games. By combining self-play with neural network training, the AI can continuously improve through iterative learning cycles, similar to modern chess engines like AlphaZero.

Start with small batches (10-100 games) to understand the system, then scale up to thousands of games for serious AI training.
