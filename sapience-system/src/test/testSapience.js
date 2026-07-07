/**
 * Sapience System Tests
 * Basic tests to verify core functionality
 */

import { SapienceEngine } from '../core/SapienceEngine.js';
import { SelfAwarenessMonitor } from '../core/SelfAwarenessMonitor.js';
import { AbstractReasoner } from '../core/AbstractReasoner.js';
import { MetaCognitiveController } from '../core/MetaCognitiveController.js';

// Simple test framework
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    test(name, fn) {
        this.tests.push({ name, fn });
    }
    
    async run() {
        console.log('\n════════════════════════════════════════════════════');
        console.log('   SAPIENCE SYSTEM TESTS');
        console.log('════════════════════════════════════════════════════\n');
        
        for (const { name, fn } of this.tests) {
            try {
                await fn();
                console.log(`✓ ${name}`);
                this.passed++;
            } catch (error) {
                console.log(`✗ ${name}`);
                console.log(`  Error: ${error.message}`);
                this.failed++;
            }
        }
        
        console.log('\n════════════════════════════════════════════════════');
        console.log(`Tests: ${this.passed} passed, ${this.failed} failed`);
        console.log('════════════════════════════════════════════════════\n');
        
        return this.failed === 0;
    }
}

// Helper to create empty board
function createEmptyBoard() {
    const board = [];
    for (let z = 0; z < 9; z++) {
        const level = [];
        for (let y = 0; y < 8; y++) {
            level.push(Array(8).fill(null));
        }
        board.push(level);
    }
    return board;
}

// Test cases
const runner = new TestRunner();

runner.test('SapienceEngine initializes correctly', () => {
    const engine = new SapienceEngine();
    if (!engine.selfAwareness) throw new Error('Missing self-awareness component');
    if (!engine.abstractReasoner) throw new Error('Missing abstract reasoner');
    if (!engine.metaCognition) throw new Error('Missing meta-cognition');
});

runner.test('SelfAwarenessMonitor tracks confidence', () => {
    const monitor = new SelfAwarenessMonitor({});
    const confidence = monitor.calculateConfidence({
        neuralConfidence: 0.8,
        conceptClarity: 0.7,
        patternMatches: 0.6,
        metaCertainty: 0.75
    });
    if (confidence < 0 || confidence > 1) {
        throw new Error(`Invalid confidence: ${confidence}`);
    }
});

runner.test('AbstractReasoner forms concepts', () => {
    const reasoner = new AbstractReasoner({});
    const concepts = reasoner.formConcepts({
        features: {
            vertical_alignment: 1,
            piece_penetration: 0.8
        }
    });
    if (!concepts.concepts) throw new Error('No concepts formed');
    if (!concepts.primaryIntent) throw new Error('No primary intent');
});

runner.test('MetaCognitiveController manages thinking sessions', () => {
    const controller = new MetaCognitiveController({});
    const session = controller.beginThinking('test_analysis');
    if (!session.strategy) throw new Error('No strategy selected');
    controller.endThinking('test_analysis', { confidence: 0.8 });
});

runner.test('SapienceEngine analyzes position', () => {
    const engine = new SapienceEngine({ verbosity: 'low' });
    const board = createEmptyBoard();
    
    // Add a few pieces
    board[4][3][4] = 'Q'; // White queen
    board[5][4][3] = 'r'; // Black rook
    
    const analysis = engine.analyzePosition(board);
    
    if (typeof analysis.score !== 'number') throw new Error('No score');
    if (typeof analysis.confidence !== 'number') throw new Error('No confidence');
    if (!analysis.explanation) throw new Error('No explanation');
});

runner.test('SapienceEngine generates natural language', () => {
    const engine = new SapienceEngine({ verbosity: 'low' });
    const board = createEmptyBoard();
    board[4][3][4] = 'Q';
    
    const analysis = engine.analyzePosition(board);
    
    if (typeof analysis.explanation !== 'string') {
        throw new Error('Explanation is not a string');
    }
    if (analysis.explanation.length === 0) {
        throw new Error('Empty explanation');
    }
});

runner.test('Self-awareness recognizes uncertainty', () => {
    const monitor = new SelfAwarenessMonitor({ confidenceThreshold: 0.7 });
    
    // Low confidence should trigger uncertainty
    monitor.calculateConfidence({
        neuralConfidence: 0.3,
        conceptClarity: 0.4,
        patternMatches: 0.3,
        metaCertainty: 0.4
    });
    
    const state = monitor.assessState();
    if (state.confidence > 0.7) {
        throw new Error('Should be uncertain with low inputs');
    }
});

runner.test('Meta-cognition reflects on thinking', () => {
    const controller = new MetaCognitiveController({});
    controller.beginThinking('test');
    const reflection = controller.endThinking('test', {
        confidence: 0.9,
        thinkingTime: 500
    });
    
    if (!reflection.quality) throw new Error('No quality assessment');
    if (!reflection.summary) throw new Error('No summary');
});

runner.test('SapienceEngine performs post-game reflection', () => {
    const engine = new SapienceEngine({ verbosity: 'low' });
    const board = createEmptyBoard();
    
    // Analyze a few positions
    engine.analyzePosition(board);
    engine.analyzePosition(board);
    
    const reflection = engine.reflectOnGame({
        result: 'win',
        moves: 50
    });
    
    if (!reflection.outcome) throw new Error('No outcome');
    if (!reflection.lessonsLearned) throw new Error('No lessons learned');
    if (!reflection.areasForImprovement) throw new Error('No improvement areas');
});

runner.test('Sapience maintains thought history', () => {
    const engine = new SapienceEngine({ verbosity: 'low' });
    const board = createEmptyBoard();
    
    engine.analyzePosition(board);
    engine.analyzePosition(board);
    engine.analyzePosition(board);
    
    const state = engine.getCognitiveState();
    if (state.thoughtHistoryLength !== 3) {
        throw new Error(`Expected 3 thoughts, got ${state.thoughtHistoryLength}`);
    }
});

// Run all tests
runner.run().then(success => {
    process.exit(success ? 0 : 1);
});
