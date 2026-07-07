/**
 * SapienceEngine - Main Orchestrator for Self-Aware AI
 * 
 * This is the core engine that coordinates all sapient capabilities:
 * - Self-awareness and confidence tracking
 * - Abstract reasoning and concept formation
 * - Meta-cognitive monitoring and control
 * - Integration with 9D Chess neural network
 */

import { SelfAwarenessMonitor } from './SelfAwarenessMonitor.js';
import { AbstractReasoner } from './AbstractReasoner.js';
import { MetaCognitiveController } from './MetaCognitiveController.js';
import { ChessNeuralInterface } from '../integration/ChessNeuralInterface.js';
import { BoardStateAnalyzer } from '../integration/BoardStateAnalyzer.js';
import { SAPIENCE_CONFIG } from '../config.js';

export class SapienceEngine {
    constructor(config = {}) {
        this.config = { ...SAPIENCE_CONFIG, ...config };
        
        // Initialize core cognitive components
        this.selfAwareness = new SelfAwarenessMonitor(this.config);
        this.abstractReasoner = new AbstractReasoner(this.config);
        this.metaCognition = new MetaCognitiveController(this.config);
        
        // Initialize 9D Chess integration
        this.neuralInterface = new ChessNeuralInterface(this.config);
        this.boardAnalyzer = new BoardStateAnalyzer(this.config);
        
        // Internal state
        this.currentThought = null;
        this.thoughtHistory = [];
        this.conceptLibrary = new Map();
        this.performanceHistory = [];
        
        console.log('🧠 Sapience Engine initialized with self-awareness, abstract reasoning, and meta-cognition.');
    }
    
    /**
     * Main analysis method - analyzes a 9D chess position with full sapient reasoning
     * @param {Object} board9D - The 9D chess board state
     * @param {Number} rawScore - Optional raw neural network score
     * @returns {Object} Comprehensive sapient analysis
     */
    analyzePosition(board9D, rawScore = null) {
        const startTime = Date.now();
        
        // Begin sapient thought process
        this.metaCognition.beginThinking('position_analysis');
        
        // 1. Self-Awareness: Assess our current cognitive state
        const cognitiveState = this.selfAwareness.assessState();
        
        // 2. Board Analysis: Understand the position across all 9 levels
        const boardAnalysis = this.boardAnalyzer.analyze(board9D);
        
        // 3. Neural Network Integration: Get or validate raw evaluation
        if (rawScore === null) {
            rawScore = this.neuralInterface.evaluatePosition(board9D);
        }
        const neuralConfidence = this.neuralInterface.getConfidence(board9D, rawScore);
        
        // 4. Abstract Reasoning: Form high-level concepts about the position
        const strategicConcepts = this.abstractReasoner.formConcepts(boardAnalysis);
        const tacticalPatterns = this.abstractReasoner.recognizePatterns(boardAnalysis);
        
        // 5. Meta-Cognitive Analysis: Reason about the reasoning itself
        const metaAnalysis = this.metaCognition.analyzeThinking({
            boardAnalysis,
            rawScore,
            strategicConcepts,
            tacticalPatterns,
            neuralConfidence
        });
        
        // 6. Uncertainty Quantification: How confident are we?
        const overallConfidence = this.selfAwareness.calculateConfidence({
            neuralConfidence,
            conceptClarity: strategicConcepts.clarity,
            patternMatches: tacticalPatterns.strength,
            metaCertainty: metaAnalysis.certainty
        });
        
        // 7. Generate Natural Language Explanation
        const explanation = this.generateExplanation({
            board9D,
            rawScore,
            boardAnalysis,
            strategicConcepts,
            tacticalPatterns,
            metaAnalysis,
            overallConfidence
        });
        
        // 8. Self-Awareness: Record this thought for future reflection
        const thought = {
            timestamp: Date.now(),
            board: board9D,
            analysis: boardAnalysis,
            score: rawScore,
            confidence: overallConfidence,
            concepts: strategicConcepts,
            patterns: tacticalPatterns,
            metaReasoning: metaAnalysis,
            explanation,
            thinkingTime: Date.now() - startTime
        };
        
        this.currentThought = thought;
        this.thoughtHistory.push(thought);
        this.metaCognition.endThinking('position_analysis', thought);
        
        return {
            score: rawScore,
            confidence: overallConfidence,
            explanation: explanation.full,
            summary: explanation.summary,
            strategicIntent: strategicConcepts.primaryIntent,
            uncertainty: overallConfidence < this.config.confidenceThreshold,
            alternatives: metaAnalysis.alternatives,
            metaThoughts: metaAnalysis.reflections,
            thinkingTime: thought.thinkingTime
        };
    }
    
    /**
     * Select the best move from available options with sapient reasoning
     * @param {Object} board9D - Current board state
     * @param {Array} possibleMoves - Array of legal moves
     * @returns {Object} Selected move with reasoning
     */
    selectMove(board9D, possibleMoves) {
        this.metaCognition.beginThinking('move_selection');
        
        const moveEvaluations = [];
        
        // Evaluate each move with full sapient analysis
        for (const move of possibleMoves) {
            const boardAfterMove = this.boardAnalyzer.simulateMove(board9D, move);
            const analysis = this.analyzePosition(boardAfterMove);
            
            moveEvaluations.push({
                move,
                analysis,
                sapienceScore: this.calculateSapienceScore(analysis)
            });
        }
        
        // Sort by sapience score (not just raw neural network score)
        moveEvaluations.sort((a, b) => b.sapienceScore - a.sapienceScore);
        
        const bestMove = moveEvaluations[0];
        const alternatives = moveEvaluations.slice(1, 4); // Top 3 alternatives
        
        // Meta-cognitive reflection on the choice
        const moveReasoning = this.metaCognition.explainMoveChoice({
            chosen: bestMove,
            alternatives,
            strategicGoals: this.abstractReasoner.getCurrentGoals()
        });
        
        this.metaCognition.endThinking('move_selection', { bestMove, moveReasoning });
        
        return {
            move: bestMove.move,
            confidence: bestMove.analysis.confidence,
            reasoning: moveReasoning,
            explanation: bestMove.analysis.explanation,
            alternatives: alternatives.map(alt => ({
                move: alt.move,
                reason: `Alternative: ${alt.analysis.summary}`
            }))
        };
    }
    
    /**
     * Calculate a sapience-adjusted score that considers confidence and uncertainty
     */
    calculateSapienceScore(analysis) {
        // Weight raw score by confidence
        const confidenceWeight = analysis.confidence;
        
        // Penalize uncertain positions (risk-aware)
        const uncertaintyPenalty = analysis.uncertainty ? 0.9 : 1.0;
        
        // Bonus for strong strategic concepts
        const conceptBonus = analysis.strategicIntent ? 1.1 : 1.0;
        
        return analysis.score * confidenceWeight * uncertaintyPenalty * conceptBonus;
    }
    
    /**
     * Generate natural language explanation of the position and reasoning
     */
    generateExplanation(data) {
        const {
            board9D,
            rawScore,
            boardAnalysis,
            strategicConcepts,
            tacticalPatterns,
            metaAnalysis,
            overallConfidence
        } = data;
        
        let explanation = '';
        
        // Opening statement with confidence
        explanation += `I am ${(overallConfidence * 100).toFixed(0)}% confident that this position `;
        explanation += rawScore > 0 ? 'favors White ' : rawScore < 0 ? 'favors Black ' : 'is balanced ';
        explanation += `(evaluation: ${rawScore > 0 ? '+' : ''}${rawScore.toFixed(2)}).\n\n`;
        
        // Strategic concepts identified
        if (strategicConcepts.concepts.length > 0) {
            explanation += `**Strategic Understanding:**\n`;
            for (const concept of strategicConcepts.concepts) {
                explanation += `- ${concept.name}: ${concept.description}\n`;
            }
            explanation += `\n`;
        }
        
        // Tactical patterns
        if (tacticalPatterns.patterns.length > 0) {
            explanation += `**Tactical Patterns Detected:**\n`;
            for (const pattern of tacticalPatterns.patterns) {
                explanation += `- ${pattern.type} on level ${pattern.level}: ${pattern.description}\n`;
            }
            explanation += `\n`;
        }
        
        // Meta-cognitive reflections
        if (metaAnalysis.reflections.length > 0) {
            explanation += `**My Thinking Process:**\n`;
            for (const reflection of metaAnalysis.reflections) {
                explanation += `- ${reflection}\n`;
            }
            explanation += `\n`;
        }
        
        // Uncertainty acknowledgment
        if (overallConfidence < this.config.confidenceThreshold) {
            explanation += `**Uncertainty Note:** I am uncertain about some aspects of this position. `;
            explanation += `Specifically: ${metaAnalysis.uncertainAspects.join(', ')}.\n\n`;
        }
        
        // Primary strategic intent
        explanation += `**Strategic Intent:** ${strategicConcepts.primaryIntent}\n`;
        
        // Summary
        const summary = `${rawScore > 0 ? 'Advantage White' : rawScore < 0 ? 'Advantage Black' : 'Equal'} - ${strategicConcepts.primaryIntent}`;
        
        return {
            full: explanation,
            summary
        };
    }
    
    /**
     * Self-reflection after a game completes
     * @param {Object} gameResult - Final game outcome
     */
    reflectOnGame(gameResult) {
        console.log('\n🧠 Beginning post-game self-reflection...\n');
        
        // Analyze performance
        const performance = this.selfAwareness.evaluatePerformance(
            this.thoughtHistory,
            gameResult
        );
        
        // Extract lessons learned
        const lessons = this.abstractReasoner.extractLessons(
            this.thoughtHistory,
            gameResult
        );
        
        // Meta-cognitive analysis of thinking patterns
        const thinkingPatterns = this.metaCognition.analyzeThinkingPatterns(
            this.thoughtHistory
        );
        
        // Store for future improvement
        this.performanceHistory.push({
            gameResult,
            performance,
            lessons,
            thinkingPatterns,
            timestamp: Date.now()
        });
        
        // Generate self-reflection report
        const reflection = {
            outcome: gameResult.result,
            accuracy: performance.accuracy,
            confidenceCalibration: performance.calibration,
            lessonsLearned: lessons,
            thinkingInsights: thinkingPatterns,
            areasForImprovement: this.identifyImprovements(performance, thinkingPatterns)
        };
        
        console.log('**Self-Reflection Summary:**');
        console.log(`Outcome: ${reflection.outcome}`);
        console.log(`Decision Accuracy: ${(reflection.accuracy * 100).toFixed(1)}%`);
        console.log(`Confidence Calibration: ${reflection.confidenceCalibration}`);
        console.log(`\nLessons Learned:`);
        reflection.lessonsLearned.forEach(lesson => console.log(`  - ${lesson}`));
        console.log(`\nAreas for Improvement:`);
        reflection.areasForImprovement.forEach(area => console.log(`  - ${area}`));
        
        return reflection;
    }
    
    /**
     * Identify areas where the sapience system can improve
     */
    identifyImprovements(performance, thinkingPatterns) {
        const improvements = [];
        
        if (performance.accuracy < 0.7) {
            improvements.push('Position evaluation accuracy needs improvement');
        }
        
        if (performance.calibration === 'overconfident') {
            improvements.push('I tend to be overconfident - need better uncertainty estimation');
        } else if (performance.calibration === 'underconfident') {
            improvements.push('I tend to be underconfident - could trust my analysis more');
        }
        
        if (thinkingPatterns.rigidity > 0.7) {
            improvements.push('Thinking is too rigid - need more flexible strategy adaptation');
        }
        
        if (thinkingPatterns.depthVariability < 0.3) {
            improvements.push('Not varying analysis depth appropriately - spend more time on critical positions');
        }
        
        return improvements;
    }
    
    /**
     * Get current cognitive state for monitoring/debugging
     */
    getCognitiveState() {
        return {
            currentThought: this.currentThought,
            selfAwareness: this.selfAwareness.getState(),
            metaCognition: this.metaCognition.getState(),
            conceptCount: this.conceptLibrary.size,
            thoughtHistoryLength: this.thoughtHistory.length,
            performanceHistoryLength: this.performanceHistory.length
        };
    }
}
