/**
 * Sapience System Configuration
 */

export const SAPIENCE_CONFIG = {
    // Self-Awareness Settings
    confidenceThreshold: 0.70,        // 70% minimum confidence to act decisively
    uncertaintyReporting: true,       // Report when uncertain
    performanceTracking: true,        // Track decision quality over time
    
    // Abstract Reasoning Settings
    conceptFormation: true,           // Build new abstract concepts
    analogicalThinking: true,         // Use analogies from past games
    principleExtraction: true,        // Learn general strategic rules
    patternRecognition: true,         // Identify tactical/strategic patterns
    
    // Meta-Cognition Settings
    strategyMonitoring: true,         // Track strategy effectiveness
    thoughtReflection: true,          // Analyze own thinking process
    selfCorrection: true,             // Fix reasoning errors autonomously
    metacognitiveDepth: 2,            // Levels of recursive self-analysis
    
    // 9D Chess Integration Settings
    verticalAwareness: 9,             // All 9 levels to consider
    levelPriority: [4, 5, 3, 6, 2, 7, 1, 8, 0], // Center-out analysis priority
    maxMoveDepth: 6,                  // Depth of move tree analysis
    
    // Natural Language Settings
    explanationDepth: 'high',         // 'low', 'medium', 'high'
    verbosity: 'high',                // How detailed the reasoning output is
    includeUncertainty: true,         // Include uncertainty estimates in explanations
    includeAlternatives: true,        // Mention alternative moves considered
    
    // Learning Settings
    memoryCapacity: 1000,             // Max number of positions to remember
    conceptEvolution: true,           // Allow concepts to evolve over time
    feedbackIntegration: true,        // Learn from game outcomes
    
    // Performance
    maxThinkingTime: 5000,            // Max time in ms for sapient analysis
    parallelAnalysis: true,           // Analyze multiple branches simultaneously
};
