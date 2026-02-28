# Reinforcement Learning System

## Overview
The 3D Chess game now implements **reinforcement learning from game outcomes**, allowing the AI to continuously improve by learning from completed games.

## How It Works

### 1. Data Collection
- **Every move** in every game is automatically recorded as a board position
- Positions are stored in `gamePositionsRef.current` during gameplay
- Each position includes the complete board state (all piece positions)

### 2. Game Outcome Recording
When a game ends, the outcome is recorded:
- **Checkmate**: Automatically records winner (white or black)
- **Stalemate**: Automatically records as draw
- **Manual Recording**: Use the outcome buttons to manually record:
  - **♔ White Wins**: Record current game as white victory
  - **♚ Black Wins**: Record current game as black victory
  - **⚖ Draw**: Record current game as draw

### 3. Training Data Storage
- All positions from the game are labeled with the final outcome
- Win for white: score = +1.0
- Win for black: score = -1.0
- Draw: score = 0.0
- Data is stored in browser's localStorage (up to 10,000 positions)

### 4. Neural Network Training
Once you have enough data (minimum 100 positions):
1. Click **"🎓 Train Neural Network"** button
2. Training process:
   - 50 epochs with batch size 32
   - 20% validation split
   - Progress shown in real-time
3. Trained model is saved to IndexedDB
4. AI uses hybrid evaluation: 70% neural network + 30% traditional evaluation

## Usage Guide

### Playing to Generate Training Data
1. Set game mode to **"Player vs Computer"** or **"Player vs Player"**
2. Play complete games until checkmate or stalemate
3. Outcomes are automatically recorded
4. Current game positions shown: `(X positions in current game)`

### Manual Outcome Recording
If you need to end a game early (resignation, timeout, etc.):
1. Play at least a few moves
2. Click the appropriate outcome button:
   - **♔ White Wins** if white should win
   - **♚ Black Wins** if black should win
   - **⚖ Draw** for agreed draws

### Training the Neural Network
1. **Check training data count**: Shows in control panel
2. **Minimum requirement**: 100 positions needed
3. **Recommended**: 500+ positions for better results
4. Click **"🎓 Train Neural Network"**
5. Wait for training to complete (~30-60 seconds)
6. Model automatically saves and is used in future games

### Monitoring Progress
The control panel shows:
- **Status**: Untrained / Training / Trained
- **Training Data**: Number of positions collected
- **Current Game**: Positions in active game
- **Training Progress**: Epoch, loss, and validation loss during training

## Benefits of Reinforcement Learning

### Traditional AI (Minimax + Alpha-Beta)
- Fixed evaluation function
- Same strategy every game
- Cannot adapt to opponent style
- Limited by hand-coded rules

### Reinforcement Learning AI
- **Learns from experience**: Improves with every game played
- **Adapts strategies**: Discovers patterns that lead to wins
- **Self-improving**: Gets better the more it plays
- **Handles complexity**: Learns 3D chess tactics automatically

## Technical Details

### Architecture
- **Input**: 2,306 features (192 squares × 12 piece types + 2 material counts)
- **Hidden layers**: 512 → 256 → 128 neurons with dropout
- **Output**: Single value (-1 to +1) representing position evaluation
- **Framework**: TensorFlow.js
- **Storage**: IndexedDB for model, localStorage for training data

### Training Algorithm
- **Supervised learning** from game outcomes
- **Mean Squared Error** loss function
- **Adam optimizer** with learning rate 0.001
- **Dropout regularization** to prevent overfitting
- **Validation split** to monitor generalization

### Hybrid Evaluation
After training, the AI uses:
```
Final Score = 0.7 × Neural Network Score + 0.3 × Traditional Score
```

This combines learned patterns with chess fundamentals for stable, strong play.

## Best Practices

### Data Quality
- Play **complete games** (don't reset mid-game)
- **Vary strategies** to give diverse training examples
- Record **accurate outcomes** when using manual buttons
- Let games play out naturally

### Training Strategy
1. **Initial training**: Collect 200-500 positions, train once
2. **Incremental learning**: Play 10-20 more games, retrain
3. **Regular updates**: Retrain every 50-100 new games
4. **Monitor performance**: Check if AI improves after training

### Storage Management
- Training data limited to 10,000 positions (most recent kept)
- Clear browser data to reset learning
- Model persists across browser sessions
- Backup: Export game database if needed

## Future Enhancements
- [ ] Self-play game generation (AI vs AI for training)
- [ ] Opening book integration
- [ ] Tactical pattern recognition training
- [ ] Transfer learning from classical chess databases
- [ ] Multi-model ensemble for stronger play

## Troubleshooting

### "Not enough training data"
Play more games or use manual outcome buttons to record partial games.

### Training fails
- Check browser console for errors
- Clear training data: `trainingCollector.clear()` in console
- Ensure enough browser storage space

### AI not getting stronger
- Need more diverse game positions
- Try different opening strategies
- Play against different difficulty levels
- Retrain with more data

### Model not loading
- Check IndexedDB in browser dev tools
- Clear and retrain if corrupted
- Check TensorFlow.js compatibility

---

**🎓 Remember**: The more you play, the smarter the AI becomes! Every game contributes to its learning.
