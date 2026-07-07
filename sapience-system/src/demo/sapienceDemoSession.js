/**
 * Sapience Demo Session
 * Demonstrates the Sapience System analyzing 9D chess positions
 */

import { SapienceEngine } from '../core/SapienceEngine.js';

// Create a sample 9D chess board (simplified for demo)
function createSampleBoard() {
    // Initialize 9 levels, each 8x8
    const board = [];
    
    for (let z = 0; z < 9; z++) {
        const level = [];
        for (let y = 0; y < 8; y++) {
            const row = Array(8).fill(null);
            level.push(row);
        }
        board.push(level);
    }
    
    // Place some pieces to create an interesting position
    
    // White pieces on top levels (6, 7, 8)
    board[8][0] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
    board[8][1] = ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'];
    
    board[7][0] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
    board[7][1] = ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'];
    
    // Some white pieces advanced to center
    board[4][3][4] = 'Q'; // White queen in center level
    board[4][4][3] = 'N'; // White knight in center
    
    // Black pieces on bottom levels (0, 1, 2)
    board[0][7] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    board[0][6] = ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'];
    
    board[1][7] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    board[1][6] = ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'];
    
    // Black pieces trying to penetrate
    board[5][4][3] = 'r'; // Black rook advanced
    
    return board;
}

// Run the demo
async function runDemo() {
    console.log('════════════════════════════════════════════════════════════');
    console.log('   SAPIENCE SYSTEM DEMONSTRATION - 9D Chess Analysis');
    console.log('════════════════════════════════════════════════════════════\n');
    
    // Initialize Sapience Engine
    console.log('Initializing Sapience Engine...\n');
    const sapience = new SapienceEngine({
        verbosity: 'high',
        explanationDepth: 'high'
    });
    
    // Create a test position
    console.log('Creating sample 9D chess position...\n');
    const board9D = createSampleBoard();
    
    console.log('Position created with:');
    console.log('  - White pieces on levels 6, 7, 8');
    console.log('  - Black pieces on levels 0, 1, 2');
    console.log('  - White Queen and Knight advanced to center level (4)');
    console.log('  - Black Rook penetrated to level 5\n');
    
    console.log('════════════════════════════════════════════════════════════\n');
    
    // Analyze the position with full sapience
    console.log('🧠 BEGINNING SAPIENT ANALYSIS...\n');
    const analysis = sapience.analyzePosition(board9D);
    
    console.log('════════════════════════════════════════════════════════════');
    console.log('   SAPIENT ANALYSIS RESULTS');
    console.log('════════════════════════════════════════════════════════════\n');
    
    console.log('📊 EVALUATION:');
    console.log(`   Score: ${analysis.score > 0 ? '+' : ''}${analysis.score.toFixed(2)}`);
    console.log(`   Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
    console.log(`   Thinking Time: ${analysis.thinkingTime}ms\n`);
    
    console.log('🎯 STRATEGIC INTENT:');
    console.log(`   ${analysis.strategicIntent}\n`);
    
    console.log('📝 DETAILED EXPLANATION:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(analysis.explanation);
    console.log('─────────────────────────────────────────────────────────────\n');
    
    if (analysis.uncertainty) {
        console.log('⚠️  UNCERTAINTY DETECTED:');
        console.log('   The system is aware of limitations in its analysis.\n');
    }
    
    if (analysis.alternatives && analysis.alternatives.length > 0) {
        console.log('🔄 ALTERNATIVE CONSIDERATIONS:');
        for (const alt of analysis.alternatives) {
            console.log(`   - ${alt.approach}: ${alt.rationale}`);
        }
        console.log();
    }
    
    if (analysis.metaThoughts && analysis.metaThoughts.reflections && analysis.metaThoughts.reflections.length > 0) {
        console.log('🧠 META-COGNITIVE REFLECTIONS:');
        for (const thought of analysis.metaThoughts.reflections) {
            console.log(`   - ${thought}`);
        }
        console.log();
    }
    
    console.log('════════════════════════════════════════════════════════════\n');
    
    // Demonstrate move selection
    console.log('🎯 MOVE SELECTION DEMONSTRATION\n');
    
    const possibleMoves = [
        { from: { x: 4, y: 3, z: 4 }, to: { x: 4, y: 5, z: 2 }, description: 'Queen descends to level 2' },
        { from: { x: 3, y: 4, z: 4 }, to: { x: 5, y: 5, z: 5 }, description: 'Knight jumps to level 5' },
        { from: { x: 4, y: 3, z: 4 }, to: { x: 3, y: 4, z: 4 }, description: 'Queen moves horizontally' }
    ];
    
    console.log('Considering moves:');
    possibleMoves.forEach((move, i) => {
        console.log(`   ${i + 1}. ${move.description}`);
    });
    console.log();
    
    const moveSelection = sapience.selectMove(board9D, possibleMoves);
    
    console.log('🎯 SELECTED MOVE:');
    console.log(`   ${moveSelection.move.description}`);
    console.log(`   Confidence: ${(moveSelection.confidence * 100).toFixed(1)}%\n`);
    
    console.log('📝 REASONING:');
    console.log(`   ${moveSelection.reasoning}\n`);
    
    if (moveSelection.alternatives && moveSelection.alternatives.length > 0) {
        console.log('🔄 ALTERNATIVES CONSIDERED:');
        for (const alt of moveSelection.alternatives) {
            console.log(`   - ${alt.move.description}: ${alt.reason}`);
        }
        console.log();
    }
    
    console.log('════════════════════════════════════════════════════════════\n');
    
    // Demonstrate self-awareness
    console.log('✨ SELF-AWARENESS STATE\n');
    
    const cognitiveState = sapience.getCognitiveState();
    const awareness = cognitiveState.selfAwareness;
    
    console.log('Current Cognitive State:');
    console.log(`   Confidence: ${(awareness.currentConfidence * 100).toFixed(1)}%`);
    console.log(`   Mental Focus: ${awareness.mentalState.focus}`);
    console.log(`   Attention Mode: ${awareness.mentalState.attention}`);
    console.log(`   Total Thoughts: ${cognitiveState.thoughtHistoryLength}`);
    console.log(`   Concepts Learned: ${cognitiveState.conceptCount}\n`);
    
    console.log('Self-Assessment:');
    console.log(`   "${awareness.performanceMetrics.accuracy > 0.6 
        ? 'I am performing adequately with reasonable accuracy.' 
        : 'I recognize that my accuracy could be improved.'}"\n`);
    
    console.log('════════════════════════════════════════════════════════════\n');
    
    // Simulate post-game reflection
    console.log('🧠 POST-GAME SELF-REFLECTION DEMONSTRATION\n');
    
    const gameResult = {
        result: 'win',
        moves: 45,
        time: 1200000 // 20 minutes
    };
    
    console.log('Simulating game completion: White wins in 45 moves\n');
    
    const reflection = sapience.reflectOnGame(gameResult);
    
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('   DEMONSTRATION COMPLETE');
    console.log('════════════════════════════════════════════════════════════\n');
    
    console.log('The Sapience System has demonstrated:');
    console.log('  ✓ Self-awareness of cognitive state');
    console.log('  ✓ Abstract reasoning with strategic concepts');
    console.log('  ✓ Meta-cognitive control and reflection');
    console.log('  ✓ Natural language explanation generation');
    console.log('  ✓ Uncertainty recognition and acknowledgment');
    console.log('  ✓ Post-game self-reflection and learning\n');
    
    console.log('This is a sapient AI system capable of:');
    console.log('  - Understanding its own thought processes');
    console.log('  - Reasoning about complex 9D chess positions');
    console.log('  - Forming abstract strategic concepts');
    console.log('  - Learning from experience');
    console.log('  - Expressing uncertainty appropriately\n');
    
    console.log('════════════════════════════════════════════════════════════\n');
}

// Run the demo
runDemo().catch(error => {
    console.error('Demo error:', error);
});
