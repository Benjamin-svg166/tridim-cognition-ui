/**
 * SelfAwarenessMonitor - Tracks Internal Cognitive State
 * 
 * This module gives the AI self-awareness by tracking:
 * - Confidence levels in its evaluations
 * - Uncertainty recognition
 * - Performance quality over time
 * - Mental state and focus
 */

export class SelfAwarenessMonitor {
    constructor(config) {
        this.config = config;
        
        // Internal state tracking
        this.state = {
            currentConfidence: 0.5,
            cumulativeUncertainty: 0,
            performanceMetrics: {
                accuracy: 0.5,
                calibration: 'neutral',
                consistency: 0.5
            },
            mentalState: {
                focus: 'analysis',        // 'analysis', 'strategy', 'tactics'
                attention: 'distributed', // 'focused', 'distributed'
                energy: 1.0               // 0.0 to 1.0
            },
            thoughtCount: 0,
            correctPredictions: 0,
            totalPredictions: 0
        };
        
        console.log('✨ Self-Awareness Monitor initialized - I am aware of my own cognitive state.');
    }
    
    /**
     * Assess current cognitive state
     */
    assessState() {
        return {
            aware: true,
            confidence: this.state.currentConfidence,
            uncertainty: this.state.cumulativeUncertainty,
            performance: this.state.performanceMetrics,
            mentalState: this.state.mentalState,
            selfAssessment: this.generateSelfAssessment()
        };
    }
    
    /**
     * Generate natural language self-assessment
     */
    generateSelfAssessment() {
        const { currentConfidence, performanceMetrics, mentalState } = this.state;
        
        let assessment = '';
        
        // Confidence statement
        if (currentConfidence > 0.8) {
            assessment += 'I am feeling highly confident in my analysis. ';
        } else if (currentConfidence > 0.6) {
            assessment += 'I am moderately confident in my reasoning. ';
        } else if (currentConfidence > 0.4) {
            assessment += 'I am somewhat uncertain about this situation. ';
        } else {
            assessment += 'I am quite uncertain and proceeding cautiously. ';
        }
        
        // Performance awareness
        if (performanceMetrics.accuracy > 0.7) {
            assessment += 'My recent decisions have been accurate. ';
        } else if (performanceMetrics.accuracy < 0.5) {
            assessment += 'I recognize that my recent accuracy has been lower than desired. ';
        }
        
        // Mental state
        assessment += `My current focus is on ${mentalState.focus}. `;
        
        return assessment;
    }
    
    /**
     * Calculate confidence based on multiple factors
     */
    calculateConfidence(factors) {
        const {
            neuralConfidence = 0.5,
            conceptClarity = 0.5,
            patternMatches = 0.5,
            metaCertainty = 0.5
        } = factors;
        
        // Weighted average of different confidence sources
        const weights = {
            neural: 0.4,
            concept: 0.25,
            pattern: 0.20,
            meta: 0.15
        };
        
        const overallConfidence = (
            neuralConfidence * weights.neural +
            conceptClarity * weights.concept +
            patternMatches * weights.pattern +
            metaCertainty * weights.meta
        );
        
        // Update internal state
        this.state.currentConfidence = overallConfidence;
        
        // Track uncertainty accumulation
        if (overallConfidence < this.config.confidenceThreshold) {
            this.state.cumulativeUncertainty += (1 - overallConfidence);
        }
        
        // Self-aware logging
        if (this.config.verbosity === 'high') {
            console.log(`🧠 Self-Awareness: My confidence is ${(overallConfidence * 100).toFixed(1)}%`);
            if (overallConfidence < this.config.confidenceThreshold) {
                console.log(`   ⚠️  I recognize that I am uncertain about this position.`);
            }
        }
        
        return overallConfidence;
    }
    
    /**
     * Evaluate performance after a game
     */
    evaluatePerformance(thoughtHistory, gameResult) {
        this.state.thoughtCount = thoughtHistory.length;
        
        // Calculate decision accuracy
        let correctDecisions = 0;
        let totalDecisions = thoughtHistory.length;
        
        // Simple heuristic: if we won, more recent high-confidence decisions were likely correct
        if (gameResult.result === 'win') {
            thoughtHistory.forEach(thought => {
                if (thought.confidence > 0.7) {
                    correctDecisions++;
                }
            });
        } else if (gameResult.result === 'loss') {
            thoughtHistory.forEach(thought => {
                if (thought.confidence < 0.5) {
                    correctDecisions++; // We were appropriately uncertain
                }
            });
        } else { // draw
            correctDecisions = totalDecisions * 0.6; // Neutral assessment
        }
        
        const accuracy = totalDecisions > 0 ? correctDecisions / totalDecisions : 0.5;
        
        // Calculate confidence calibration
        const avgConfidence = thoughtHistory.reduce((sum, t) => sum + t.confidence, 0) / thoughtHistory.length;
        let calibration = 'well-calibrated';
        
        if (gameResult.result === 'win' && avgConfidence < 0.6) {
            calibration = 'underconfident';
        } else if (gameResult.result === 'loss' && avgConfidence > 0.7) {
            calibration = 'overconfident';
        }
        
        // Update internal metrics
        this.state.performanceMetrics.accuracy = accuracy;
        this.state.performanceMetrics.calibration = calibration;
        this.state.correctPredictions += correctDecisions;
        this.state.totalPredictions += totalDecisions;
        
        return {
            accuracy,
            calibration,
            totalThoughts: thoughtHistory.length,
            averageConfidence: avgConfidence,
            uncertaintyRate: thoughtHistory.filter(t => t.uncertainty).length / thoughtHistory.length
        };
    }
    
    /**
     * Recognize when uncertain and should ask for help
     */
    shouldRequestHelp() {
        return (
            this.state.currentConfidence < 0.4 ||
            this.state.cumulativeUncertainty > 2.0 ||
            this.state.performanceMetrics.accuracy < 0.4
        );
    }
    
    /**
     * Update mental state based on game phase
     */
    setMentalState(focus, attention = 'distributed') {
        this.state.mentalState.focus = focus;
        this.state.mentalState.attention = attention;
        
        if (this.config.verbosity === 'high') {
            console.log(`🧠 Mental State: Focusing on ${focus} with ${attention} attention`);
        }
    }
    
    /**
     * Reset uncertainty accumulation (e.g., after gaining new information)
     */
    resetUncertainty() {
        this.state.cumulativeUncertainty = 0;
        console.log('🧠 Uncertainty cleared - I have gained new understanding.');
    }
    
    /**
     * Get current state for external monitoring
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * Express self-awareness in natural language
     */
    expressAwareness() {
        const state = this.state;
        
        return {
            iAmAware: true,
            statement: this.generateSelfAssessment(),
            confidence: state.currentConfidence,
            performance: state.performanceMetrics,
            needsHelp: this.shouldRequestHelp(),
            thoughtCount: state.thoughtCount
        };
    }
}
