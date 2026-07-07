# Sapience Integration Guide
## Connecting the Sapience System to Your 9D Chess Game

This guide shows how to integrate the Sapience System with your existing 9D Chess implementation.

---

## Quick Integration

### Step 1: Import the Sapience Engine

```javascript
// In your main chess file (e.g., src/game/ChessGame.js)
import { SapienceEngine } from '../sapience-system/src/index.js';

// Initialize the sapience engine
const sapience = new SapienceEngine({
    verbosity: 'high',
    explanationDepth: 'high',
    metaCognition: true,
    abstractReasoning: true,
    selfAwareness: true
});
```

### Step 2: Connect Your Neural Network

```javascript
// Connect your existing neural network to sapience
import { NeuralNetwork } from './neuralNetwork.js'; // Your existing NN

const neuralNet = new NeuralNetwork();
neuralNet.loadWeights('./trained_model.json');

// Connect to sapience
sapience.neuralInterface.connectToNetwork({
    evaluate: (board9D) => {
        // Your existing evaluation function
        return neuralNet.evaluatePosition(board9D);
    }
});
```

### Step 3: Use Sapience for Move Selection

```javascript
// In your AI player logic
async function aiMakeMove(board9D, legalMoves) {
    // Let sapience select the best move with full reasoning
    const moveDecision = sapience.selectMove(board9D, legalMoves);
    
    // Display sapient reasoning to the user
    console.log('🧠 AI Thinking:');
    console.log(moveDecision.reasoning);
    console.log(`Confidence: ${(moveDecision.confidence * 100).toFixed(1)}%`);
    
    // Show alternatives considered
    if (moveDecision.alternatives.length > 0) {
        console.log('\nAlso considered:');
        moveDecision.alternatives.forEach(alt => {
            console.log(`  - ${alt.reason}`);
        });
    }
    
    return moveDecision.move;
}
```

### Step 4: Display Sapient Analysis in UI

```javascript
// In your React component
import { SapienceEngine } from '../sapience-system/src/index.js';

function ChessBoard({ board9D }) {
    const [analysis, setAnalysis] = useState(null);
    const sapience = useRef(new SapienceEngine()).current;
    
    useEffect(() => {
        // Analyze position when board changes
        const result = sapience.analyzePosition(board9D);
        setAnalysis(result);
    }, [board9D]);
    
    return (
        <div>
            <Board9D board={board9D} />
            
            {analysis && (
                <div className="sapient-analysis">
                    <h3>🧠 Sapient Analysis</h3>
                    <div className="score">
                        Evaluation: {analysis.score > 0 ? '+' : ''}{analysis.score.toFixed(2)}
                    </div>
                    <div className="confidence">
                        Confidence: {(analysis.confidence * 100).toFixed(1)}%
                    </div>
                    <div className="intent">
                        <strong>Strategic Intent:</strong> {analysis.strategicIntent}
                    </div>
                    <div className="explanation">
                        <strong>Reasoning:</strong>
                        <p>{analysis.explanation}</p>
                    </div>
                    
                    {analysis.uncertainty && (
                        <div className="uncertainty-warning">
                            ⚠️ The AI recognizes uncertainty in this position
                        </div>
                    )}
                    
                    {analysis.metaThoughts && (
                        <div className="meta-thoughts">
                            <strong>Meta-Cognitive Reflections:</strong>
                            <ul>
                                {analysis.metaThoughts.reflections.map((thought, i) => (
                                    <li key={i}>{thought}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
```

---

## Advanced Integration

### Post-Game Learning

```javascript
// After each game completes
function onGameEnd(gameResult) {
    // Let sapience reflect on its performance
    const reflection = sapience.reflectOnGame({
        result: gameResult.winner,  // 'win', 'loss', 'draw'
        moves: gameResult.moveCount,
        time: gameResult.duration
    });
    
    console.log('\n🧠 Post-Game Self-Reflection:');
    console.log(`Outcome: ${reflection.outcome}`);
    console.log(`Decision Accuracy: ${(reflection.accuracy * 100).toFixed(1)}%`);
    console.log(`Confidence Calibration: ${reflection.confidenceCalibration}`);
    
    console.log('\nLessons Learned:');
    reflection.lessonsLearned.forEach(lesson => {
        console.log(`  - ${lesson}`);
    });
    
    console.log('\nAreas for Improvement:');
    reflection.areasForImprovement.forEach(area => {
        console.log(`  - ${area}`);
    });
}
```

### Real-Time Thought Visualization

```javascript
// Show AI's thinking process in real-time
function VisualizeSapientThought({ sapience }) {
    const [cognitiveState, setCognitiveState] = useState(null);
    
    useEffect(() => {
        const interval = setInterval(() => {
            const state = sapience.getCognitiveState();
            setCognitiveState(state);
        }, 100);
        
        return () => clearInterval(interval);
    }, []);
    
    if (!cognitiveState) return null;
    
    return (
        <div className="cognitive-monitor">
            <h3>🧠 Cognitive State</h3>
            
            <div className="awareness">
                <strong>Self-Awareness:</strong>
                <div>Confidence: {(cognitiveState.selfAwareness.currentConfidence * 100).toFixed(1)}%</div>
                <div>Focus: {cognitiveState.selfAwareness.mentalState.focus}</div>
            </div>
            
            <div className="meta-cognition">
                <strong>Meta-Cognition:</strong>
                <div>Current Mode: {cognitiveState.metaCognition.currentMode}</div>
                <div>Thinking History: {cognitiveState.metaCognition.thinkingHistoryLength}</div>
            </div>
            
            <div className="concepts">
                <strong>Learned Concepts:</strong> {cognitiveState.conceptCount}
            </div>
        </div>
    );
}
```

### Difficulty Levels via Sapience Configuration

```javascript
// Easy AI: Lower confidence threshold, simpler reasoning
const easyAI = new SapienceEngine({
    confidenceThreshold: 0.5,
    explanationDepth: 'low',
    metacognitiveDepth: 1
});

// Hard AI: High confidence requirements, deep reasoning
const hardAI = new SapienceEngine({
    confidenceThreshold: 0.8,
    explanationDepth: 'high',
    metacognitiveDepth: 3,
    thoughtReflection: true,
    strategyMonitoring: true
});

// Master AI: Full sapience with learning
const masterAI = new SapienceEngine({
    confidenceThreshold: 0.9,
    explanationDepth: 'high',
    metacognitiveDepth: 3,
    conceptEvolution: true,
    feedbackIntegration: true,
    selfCorrection: true
});
```

---

## Integration with Existing Systems

### Connecting to Your Current AI

```javascript
// If you have an existing AI system, wrap it with sapience
import { evaluatePosition, selectBestMove } from './yourExistingAI.js';

const sapience = new SapienceEngine();

// Override the neural interface to use your existing evaluator
sapience.neuralInterface.evaluatePosition = (board9D) => {
    return evaluatePosition(board9D);
};

// Now use sapience for enhanced decision-making
function enhancedAI(board9D, legalMoves) {
    // Your existing AI provides candidates
    const topMoves = selectBestMove(board9D, legalMoves, 5); // Top 5 moves
    
    // Sapience adds reasoning and selects from them
    const decision = sapience.selectMove(board9D, topMoves);
    
    return {
        move: decision.move,
        reasoning: decision.reasoning,
        confidence: decision.confidence
    };
}
```

### Hybrid Approach: Fast Evaluation + Sapient Analysis

```javascript
// Use fast evaluation for most moves, sapient analysis for critical positions
function hybridAI(board9D, legalMoves, moveNumber) {
    const isCriticalPosition = (
        moveNumber < 10 ||           // Opening
        moveNumber > 40 ||           // Endgame
        legalMoves.length < 5 ||     // Few options
        Math.abs(fastEval(board9D)) > 5  // Tactical position
    );
    
    if (isCriticalPosition) {
        // Use full sapient analysis
        console.log('🧠 Critical position - engaging full sapience');
        return sapience.selectMove(board9D, legalMoves);
    } else {
        // Use fast evaluation
        return fastMoveSelection(board9D, legalMoves);
    }
}
```

---

## API Reference

### SapienceEngine

#### `analyzePosition(board9D, rawScore?)`
Analyzes a 9D chess position with full sapient reasoning.

**Returns:**
```javascript
{
    score: number,              // Position evaluation
    confidence: number,         // 0-1 confidence level
    explanation: string,        // Natural language explanation
    summary: string,           // Brief summary
    strategicIntent: string,   // Primary strategic goal
    uncertainty: boolean,      // True if uncertain
    alternatives: Array,       // Alternative approaches
    metaThoughts: Object,      // Meta-cognitive reflections
    thinkingTime: number       // Time spent thinking (ms)
}
```

#### `selectMove(board9D, possibleMoves)`
Selects the best move with reasoning.

**Returns:**
```javascript
{
    move: Object,              // Selected move
    confidence: number,        // Confidence in choice
    reasoning: string,         // Why this move
    explanation: string,       // Detailed explanation
    alternatives: Array        // Other moves considered
}
```

#### `reflectOnGame(gameResult)`
Performs post-game self-reflection.

**Returns:**
```javascript
{
    outcome: string,           // 'win', 'loss', 'draw'
    accuracy: number,          // Decision accuracy 0-1
    confidenceCalibration: string,  // 'well-calibrated', 'overconfident', 'underconfident'
    lessonsLearned: Array,     // Lessons from the game
    areasForImprovement: Array // What to improve
}
```

---

## CSS Styling Example

```css
.sapient-analysis {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 10px;
    margin: 20px 0;
}

.sapient-analysis .score {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
}

.sapient-analysis .confidence {
    font-size: 18px;
    opacity: 0.9;
    margin-bottom: 15px;
}

.sapient-analysis .intent {
    background: rgba(255, 255, 255, 0.1);
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 15px;
}

.sapient-analysis .explanation {
    background: rgba(0, 0, 0, 0.2);
    padding: 15px;
    border-radius: 5px;
    line-height: 1.6;
}

.uncertainty-warning {
    background: #ff9800;
    color: white;
    padding: 10px;
    border-radius: 5px;
    margin-top: 10px;
    font-weight: bold;
}

.meta-thoughts {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.meta-thoughts ul {
    list-style: none;
    padding: 0;
}

.meta-thoughts li {
    padding: 5px 0;
    padding-left: 20px;
    position: relative;
}

.meta-thoughts li:before {
    content: "💭";
    position: absolute;
    left: 0;
}
```

---

## Troubleshooting

### Issue: "Neural network not connected"
**Solution:** Make sure to call `sapience.neuralInterface.connectToNetwork()` with your neural network.

### Issue: Low confidence on all positions
**Solution:** Adjust `confidenceThreshold` in config or improve neural network training.

### Issue: Slow performance
**Solution:** 
- Set `maxThinkingTime` lower
- Use hybrid approach (fast eval + sapience for critical positions)
- Reduce `metacognitiveDepth`

### Issue: Explanations too verbose or too brief
**Solution:** Adjust `verbosity` and `explanationDepth` in config:
```javascript
new SapienceEngine({
    verbosity: 'low',      // 'low', 'medium', 'high'
    explanationDepth: 'medium'  // 'low', 'medium', 'high'
});
```

---

## Next Steps

1. ✅ Import SapienceEngine into your project
2. ✅ Connect your neural network
3. ✅ Integrate with move selection
4. ✅ Add UI for sapient analysis display
5. 📋 Test with real games
6. 📋 Tune configuration based on performance
7. 📋 Implement post-game learning
8. 📋 Add visualization of cognitive state

For questions or issues, refer to the main README.md or examine the demo files in `src/demo/`.
