/**
 * Sapience System - Main Entry Point
 * Exports core sapience components for 9D Chess integration
 */

export { SapienceEngine } from './core/SapienceEngine.js';
export { SelfAwarenessMonitor } from './core/SelfAwarenessMonitor.js';
export { AbstractReasoner } from './core/AbstractReasoner.js';
export { MetaCognitiveController } from './core/MetaCognitiveController.js';
export { ChessNeuralInterface } from './integration/ChessNeuralInterface.js';
export { BoardStateAnalyzer } from './integration/BoardStateAnalyzer.js';

// Configuration
export { SAPIENCE_CONFIG } from './config.js';
