/**
 * ChessNeuralInterface - Connects to 9D Chess Neural Network
 * 
 * This module interfaces with the existing chess neural network
 * to provide position evaluations and confidence estimates.
 */

export class ChessNeuralInterface {
    constructor(config) {
        this.config = config;
        this.networkAvailable = false;
        this.evaluationHistory = [];
        
        console.log('🔌 Chess Neural Interface initialized - Ready to connect to neural network.');
    }
    
    /**
     * Connect to external neural network
     * @param {Object} neuralNetwork - Reference to the trained neural network
     */
    connectToNetwork(neuralNetwork) {
        this.network = neuralNetwork;
        this.networkAvailable = true;
        console.log('🔌 Connected to neural network successfully.');
    }
    
    /**
     * Evaluate a 9D chess position
     * @param {Object} board9D - 9D chess board state
     * @returns {Number} Position evaluation score
     */
    evaluatePosition(board9D) {
        if (this.networkAvailable && this.network) {
            // Use actual neural network
            return this.network.evaluate(board9D);
        } else {
            // Fallback: simple heuristic evaluation
            return this.heuristicEvaluation(board9D);
        }
    }
    
    /**
     * Heuristic evaluation when neural network is not available
     */
    heuristicEvaluation(board9D) {
        // Simplified material counting across all 9 levels
        let score = 0;
        
        const pieceValues = {
            'P': 1, 'p': -1,   // Pawns
            'N': 3, 'n': -3,   // Knights
            'B': 3, 'b': -3,   // Bishops
            'R': 5, 'r': -5,   // Rooks
            'Q': 9, 'q': -9,   // Queens
            'K': 0, 'k': 0     // Kings (not counted in material)
        };
        
        // Count material across all 9 levels
        for (let z = 0; z < 9; z++) {
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const piece = board9D[z]?.[y]?.[x];
                    if (piece && pieceValues[piece] !== undefined) {
                        score += pieceValues[piece];
                    }
                }
            }
        }
        
        // Add small bonuses for positional factors
        
        // Bonus for piece activity on center levels (z=3,4,5)
        for (let z = 3; z <= 5; z++) {
            for (let y = 3; y <= 4; y++) {
                for (let x = 3; x <= 4; x++) {
                    const piece = board9D[z]?.[y]?.[x];
                    if (piece) {
                        score += piece === piece.toUpperCase() ? 0.1 : -0.1;
                    }
                }
            }
        }
        
        // Bonus for vertical control (pieces that can move vertically)
        for (let z = 0; z < 9; z++) {
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const piece = board9D[z]?.[y]?.[x];
                    if (piece && (piece.toUpperCase() === 'R' || piece.toUpperCase() === 'Q')) {
                        score += piece === piece.toUpperCase() ? 0.2 : -0.2;
                    }
                }
            }
        }
        
        return score;
    }
    
    /**
     * Get confidence in the evaluation
     * @param {Object} board9D - Board state
     * @param {Number} score - Evaluation score
     * @returns {Number} Confidence level (0-1)
     */
    getConfidence(board9D, score) {
        // Confidence factors:
        // 1. Magnitude of score (larger = more confident)
        const scoreMagnitude = Math.abs(score);
        const scoreConfidence = Math.min(1.0, scoreMagnitude / 10);
        
        // 2. Position clarity (fewer pieces = less complex = more confident)
        const pieceCount = this.countPieces(board9D);
        const clarityConfidence = pieceCount < 32 ? 0.8 : pieceCount > 64 ? 0.5 : 0.65;
        
        // 3. Historical consistency (if available)
        let consistencyConfidence = 0.7;
        if (this.evaluationHistory.length > 0) {
            const lastScore = this.evaluationHistory[this.evaluationHistory.length - 1];
            const scoreDelta = Math.abs(score - lastScore);
            consistencyConfidence = scoreDelta < 2 ? 0.9 : scoreDelta < 5 ? 0.7 : 0.5;
        }
        
        // Record this evaluation
        this.evaluationHistory.push(score);
        if (this.evaluationHistory.length > 100) {
            this.evaluationHistory.shift(); // Keep only last 100
        }
        
        // Weighted average
        const overallConfidence = (
            scoreConfidence * 0.4 +
            clarityConfidence * 0.3 +
            consistencyConfidence * 0.3
        );
        
        return overallConfidence;
    }
    
    /**
     * Count total pieces on the board
     */
    countPieces(board9D) {
        let count = 0;
        for (let z = 0; z < 9; z++) {
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    if (board9D[z]?.[y]?.[x]) {
                        count++;
                    }
                }
            }
        }
        return count;
    }
    
    /**
     * Batch evaluate multiple positions (for move selection)
     */
    batchEvaluate(positions) {
        return positions.map(pos => this.evaluatePosition(pos));
    }
    
    /**
     * Get neural network statistics
     */
    getNetworkStats() {
        return {
            available: this.networkAvailable,
            evaluationCount: this.evaluationHistory.length,
            avgScore: this.evaluationHistory.length > 0 
                ? this.evaluationHistory.reduce((a, b) => a + b, 0) / this.evaluationHistory.length 
                : 0
        };
    }
}
