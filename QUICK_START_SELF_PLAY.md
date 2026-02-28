# Quick Start Guide: Self-Play Training

## 🚀 Getting Started in 5 Minutes

### Step 1: Open the App
The app is running at: http://localhost:3000

### Step 2: Enable Advanced AI
Look for the **AI Type** dropdown in the control panel and select:
```
🧠 Advanced AI (Smart)
```

### Step 3: Find the Self-Play Panel
Scroll down to find the **🎮 Self-Play Training** section. You'll see three buttons:
- 🚀 Quick (10 games)
- 📚 Standard (100 games)  
- 🔥 Extensive (1000 games)

### Step 4: Test with Quick Preset
Click **"🚀 Quick (10 games)"** to test the system.

You'll see a confirmation dialog:
```
🎮 Generate 10 Self-Play Games?

This will take approximately 5-10 minutes.
The AI will play against itself to generate training data.

Current training data: XXX positions
After completion: ~XXX positions

Continue?
```

Click **OK** to start.

### Step 5: Watch Progress
During generation, you'll see:
```
Status: ⏳ Training...
🎮 Game 1/10 (10%)
🎮 Game 2/10 (20%)
...
```

The progress updates in real-time.

### Step 6: View Results
After completion (5-10 minutes), you'll see a summary:
```
✅ Self-Play Complete!

Games: 10
Results: 4W / 5B / 1D
Positions: 523 (avg 52 per game)
Time: 8.3 minutes

Total training data: XXX positions

Ready to train neural network!
```

### Step 7: Train the Neural Network
Now click **"🎓 Train Neural Network"** to teach the AI from the self-play data.

Training takes ~30 seconds and shows progress:
```
📊 Epoch 1/50: Loss = 0.3245
📊 Epoch 2/50: Loss = 0.2891
...
📊 Epoch 50/50: Loss = 0.1234
```

### Step 8: Test the Improved AI
Play a game against the AI to see if it's smarter!

The AI now uses:
- Opening book (classical openings)
- Neural network (position evaluation)
- Minimax search (tactical calculation)

---

## 📊 Scaling Up

### For Better Results:

**100 Games (~1-2 hours):**
- Click "📚 Standard (100 games)"
- Generates ~5,000 training positions
- Significantly improves AI quality

**1000 Games (~10-20 hours):**
- Click "🔥 Extensive (1000 games)"
- Generates ~50,000 training positions
- Produces expert-level AI
- **Recommended**: Run overnight

---

## 🎯 What to Expect

### Quick (10 games):
✅ Fast testing
✅ Verifies system works
✅ ~500 positions
⚠️ Limited AI improvement

### Standard (100 games):
✅ Noticeable AI improvement
✅ ~5,000 positions
✅ Good training dataset
✅ **Recommended for regular use**

### Extensive (1000 games):
✅ Major AI improvement
✅ ~50,000 positions
✅ Expert-level dataset
⚠️ Takes many hours

---

## 💡 Tips

### Speed Optimization:
- Use "Medium" difficulty in AI settings for faster games
- Don't interact with the board during generation
- Let it run in a background tab

### Quality Optimization:
- Run multiple batches (100 games × 5 times = 500 total)
- Train the network after each batch
- Mix with human games for diversity

### Monitoring:
- Check console (F12) for detailed progress
- Watch training data count increase
- Verify win/loss/draw balance (~equal)

---

## 🔍 Console Output

Open browser console (F12) to see detailed logs:

```
🎮 Generating 10 self-play games...
   Difficulty: medium, Neural Network: disabled
✓ Checkmate! BLACK wins in 47 moves
   Game 1: black (47 moves, checkmate)
✓ Checkmate! WHITE wins in 52 moves
   Game 2: white (52 moves, checkmate)
...
✅ Self-play generation complete!
   Time: 496.2s (1.2 games/min)
   Results: 4W / 5B / 1D
   Positions: 523 (avg 52 per game)
   Training data now: 1089 positions
```

---

## ❓ Troubleshooting

### "Not enough training data" error
**Solution**: Generate self-play games first, then train

### Games taking too long
**Solution**: Use "Medium" difficulty instead of "Hard" or "Master"

### Browser freezing
**Expected**: JavaScript is single-threaded, UI may be unresponsive during generation
**Solution**: Let it complete, or use smaller batches

### Training not improving AI
**Solution**: Need more data (generate 100+ games minimum)

---

## 📚 More Information

- **Full Documentation**: See `SELF_PLAY_TRAINING.md`
- **Implementation Details**: See `SELF_PLAY_IMPLEMENTATION_SUMMARY.md`
- **Test Results**: Run `node test_selfplay.js`

---

## 🎓 Learning Cycle

The recommended workflow:

```
1. Generate 100 self-play games (1-2 hours)
   ↓
2. Train neural network (30 seconds)
   ↓
3. Test AI strength (play a game)
   ↓
4. Generate 100 more games (now with smarter AI)
   ↓
5. Train again (learns from better games)
   ↓
6. Repeat → AI keeps improving!
```

This is **iterative self-improvement**, the same approach used by AlphaZero.

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Training data count increases after self-play
- ✅ Win/loss/draw results are balanced (~equal)
- ✅ Average moves per game is 40-60
- ✅ AI plays better openings after training
- ✅ AI makes fewer blunders

---

**Happy Training!** 🎮🧠🏆
