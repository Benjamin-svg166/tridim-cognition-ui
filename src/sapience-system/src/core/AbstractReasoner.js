/**
 * AbstractReasoner - Forms High-Level Concepts and Patterns
 * 
 * This module enables abstract thinking by:
 * - Recognizing patterns beyond raw data
 * - Forming abstract strategic concepts
 * - Using analogical reasoning
 * - Extracting general principles from specific positions
 */

export class AbstractReasoner {
    constructor(config) {
        this.config = config;
        
        // Concept library - evolves over time
        this.concepts = new Map();
        this.patterns = new Map();
        this.principles = [];
        this.currentGoals = [];
        
        // Initialize with basic 9D chess concepts
        this.initializeBasicConcepts();
        
        console.log('🎯 Abstract Reasoner initialized - Ready to form high-level concepts.');
    }
    
    /**
     * Initialize fundamental 9D chess concepts
     */
    initializeBasicConcepts() {
        // Strategic concepts
        this.addConcept('vertical-control', {
            description: 'Controlling vertical movement across levels',
            indicators: ['rook_on_vertical', 'queen_on_vertical', 'bishop_diagonal_vertical'],
            importance: 0.8
        });
        
        this.addConcept('level-dominance', {
            description: 'Controlling an entire level with multiple pieces',
            indicators: ['pieces_on_same_level', 'control_center_level'],
            importance: 0.9
        });
        
        this.addConcept('vertical-penetration', {
            description: 'Pushing pieces deep into opponent\'s levels',
            indicators: ['piece_on_opponent_level', 'piece_level_distance'],
            importance: 0.85
        });
        
        this.addConcept('dimensional-fork', {
            description: 'Threatening multiple pieces across different levels',
            indicators: ['knight_multi_level_threats', 'queen_3d_fork'],
            importance: 0.95
        });
        
        this.addConcept('level-isolation', {
            description: 'Separating opponent pieces across levels',
            indicators: ['enemy_pieces_separated', 'vertical_blockade'],
            importance: 0.7
        });
        
        // Tactical patterns
        this.addPattern('vertical-pin', {
            description: 'Pinning a piece vertically through levels',
            recognition: (board) => this.detectVerticalPin(board),
            severity: 'high'
        });
        
        this.addPattern('3d-skewer', {
            description: 'Skewering through diagonal movement across levels',
            recognition: (board) => this.detect3DSkewer(board),
            severity: 'high'
        });
        
        this.addPattern('level-breakthrough', {
            description: 'Breaking through to a key level',
            recognition: (board) => this.detectLevelBreakthrough(board),
            severity: 'medium'
        });
    }
    
    /**
     * Add a new abstract concept
     */
    addConcept(name, definition) {
        this.concepts.set(name, {
            name,
            ...definition,
            learnedAt: Date.now(),
            timesObserved: 0
        });
    }
    
    /**
     * Add a new tactical pattern
     */
    addPattern(name, definition) {
        this.patterns.set(name, {
            name,
            ...definition,
            learnedAt: Date.now(),
            timesObserved: 0
        });
    }
    
    /**
     * Form high-level concepts from board analysis
     */
    formConcepts(boardAnalysis) {
        const observedConcepts = [];
        let primaryIntent = 'Analyzing position';
        let clarity = 0.5;
        
        // Check which concepts are present in the position
        for (const [name, concept] of this.concepts) {
            if (this.isConceptPresent(concept, boardAnalysis)) {
                observedConcepts.push({
                    name: concept.name,
                    description: concept.description,
                    strength: concept.importance
                });
                concept.timesObserved++;
            }
        }
        
        // Determine primary strategic intent
        if (observedConcepts.length > 0) {
            const strongest = observedConcepts.reduce((max, c) => 
                c.strength > max.strength ? c : max
            );
            primaryIntent = `Pursuing ${strongest.name}: ${strongest.description}`;
            clarity = observedConcepts.length > 0 ? 0.7 : 0.4;
        }
        
        // Abstract reasoning: combine concepts into higher-level understanding
        const combinedStrategy = this.combineConceptsIntoStrategy(observedConcepts);
        
        if (this.config.verbosity === 'high' && observedConcepts.length > 0) {
            console.log('🎯 Abstract Concepts Identified:');
            observedConcepts.forEach(c => console.log(`   - ${c.name}: ${c.description}`));
        }
        
        return {
            concepts: observedConcepts,
            primaryIntent,
            combinedStrategy,
            clarity
        };
    }
    
    /**
     * Recognize tactical patterns in the position
     */
    recognizePatterns(boardAnalysis) {
        const detectedPatterns = [];
        let overallStrength = 0;
        
        for (const [name, pattern] of this.patterns) {
            if (pattern.recognition(boardAnalysis)) {
                detectedPatterns.push({
                    type: name,
                    description: pattern.description,
                    severity: pattern.severity,
                    level: boardAnalysis.criticalLevel || 4
                });
                pattern.timesObserved++;
                
                // Increase strength based on severity
                if (pattern.severity === 'high') overallStrength += 0.8;
                else if (pattern.severity === 'medium') overallStrength += 0.5;
                else overallStrength += 0.3;
            }
        }
        
        if (this.config.verbosity === 'high' && detectedPatterns.length > 0) {
            console.log('🎯 Tactical Patterns Detected:');
            detectedPatterns.forEach(p => console.log(`   - ${p.type}: ${p.description}`));
        }
        
        return {
            patterns: detectedPatterns,
            strength: Math.min(overallStrength, 1.0)
        };
    }
    
    /**
     * Check if a concept is present in the current position
     */
    isConceptPresent(concept, boardAnalysis) {
        // Simple heuristic - in a real implementation, this would be more sophisticated
        const { indicators } = concept;
        let score = 0;
        
        for (const indicator of indicators) {
            if (boardAnalysis.features && boardAnalysis.features[indicator]) {
                score++;
            }
        }
        
        return score >= indicators.length * 0.5; // At least 50% of indicators present
    }
    
    /**
     * Combine multiple concepts into a coherent strategy
     */
    combineConceptsIntoStrategy(concepts) {
        if (concepts.length === 0) {
            return 'No clear strategic pattern identified';
        }
        
        if (concepts.length === 1) {
            return concepts[0].description;
        }
        
        // Abstract reasoning: synthesize multiple concepts
        const names = concepts.map(c => c.name).join(' + ');
        return `Multi-layered strategy combining ${names}`;
    }
    
    /**
     * Detect vertical pin pattern (simplified)
     */
    detectVerticalPin(boardAnalysis) {
        // Simplified detection - would check for aligned pieces vertically
        return boardAnalysis.features?.vertical_alignment > 0;
    }
    
    /**
     * Detect 3D skewer pattern (simplified)
     */
    detect3DSkewer(boardAnalysis) {
        // Simplified detection - would check for diagonal alignment across levels
        return boardAnalysis.features?.diagonal_3d_alignment > 0;
    }
    
    /**
     * Detect level breakthrough pattern (simplified)
     */
    detectLevelBreakthrough(boardAnalysis) {
        // Simplified detection - would check for pieces reaching key levels
        return boardAnalysis.features?.piece_penetration > 0.6;
    }
    
    /**
     * Extract lessons from a completed game
     */
    extractLessons(thoughtHistory, gameResult) {
        const lessons = [];
        
        // Analyze which concepts were associated with good vs bad outcomes
        const conceptPerformance = new Map();
        
        for (const thought of thoughtHistory) {
            if (thought.concepts && thought.concepts.concepts) {
                for (const concept of thought.concepts.concepts) {
                    if (!conceptPerformance.has(concept.name)) {
                        conceptPerformance.set(concept.name, { count: 0, outcomes: [] });
                    }
                    const perf = conceptPerformance.get(concept.name);
                    perf.count++;
                    perf.outcomes.push(thought.score);
                }
            }
        }
        
        // Learn from successful concepts
        if (gameResult.result === 'win') {
            const mostUsed = Array.from(conceptPerformance.entries())
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 3);
            
            for (const [conceptName, data] of mostUsed) {
                lessons.push(`Concept "${conceptName}" was used ${data.count} times and contributed to victory`);
            }
        }
        
        // Learn from failures
        if (gameResult.result === 'loss') {
            lessons.push('Need to develop better defensive concepts for 9D chess');
            lessons.push('Over-reliance on existing patterns - need to adapt more flexibly');
        }
        
        // General principle extraction
        lessons.push(`Vertical control is critical in 9D chess`);
        
        return lessons;
    }
    
    /**
     * Get current strategic goals
     */
    getCurrentGoals() {
        return this.currentGoals.length > 0 
            ? this.currentGoals 
            : ['Maintain material balance', 'Control center levels', 'Develop pieces'];
    }
    
    /**
     * Set strategic goals explicitly
     */
    setGoals(goals) {
        this.currentGoals = goals;
        if (this.config.verbosity === 'high') {
            console.log('🎯 Strategic Goals Updated:', goals);
        }
    }
}
