/**
 * BoardStateAnalyzer - Analyzes 9D Chess Board States
 * 
 * This module provides detailed analysis of 9D chess positions:
 * - Material balance across levels
 * - Piece activity and mobility
 * - Control of key levels
 * - Tactical and strategic features
 */

export class BoardStateAnalyzer {
    constructor(config) {
        this.config = config;
        
        console.log('📊 Board State Analyzer initialized - Ready to analyze 9D positions.');
    }
    
    /**
     * Comprehensive analysis of a 9D chess position
     * @param {Object} board9D - 9D board state (9 levels, each 8x8)
     * @returns {Object} Detailed board analysis
     */
    analyze(board9D) {
        // Material analysis across all levels
        const material = this.analyzeMaterial(board9D);
        
        // Level-by-level control
        const levelControl = this.analyzeLevelControl(board9D);
        
        // Piece mobility and activity
        const mobility = this.analyzeMobility(board9D);
        
        // Vertical control (critical in 9D chess)
        const verticalControl = this.analyzeVerticalControl(board9D);
        
        // King safety across levels
        const kingSafety = this.analyzeKingSafety(board9D);
        
        // Critical level (most active)
        const criticalLevel = this.findCriticalLevel(board9D);
        
        // Extract features for sapient reasoning
        const features = this.extractFeatures(board9D, {
            material,
            levelControl,
            mobility,
            verticalControl,
            kingSafety
        });
        
        return {
            material,
            levelControl,
            mobility,
            verticalControl,
            kingSafety,
            criticalLevel,
            features,
            complexity: this.calculateComplexity(board9D)
        };
    }
    
    /**
     * Analyze material balance
     */
    analyzeMaterial(board9D) {
        const materialByLevel = [];
        let totalWhite = 0;
        let totalBlack = 0;
        
        const pieceValues = {
            'P': 1, 'p': 1,
            'N': 3, 'n': 3,
            'B': 3, 'b': 3,
            'R': 5, 'r': 5,
            'Q': 9, 'q': 9,
            'K': 0, 'k': 0
        };
        
        for (let z = 0; z < 9; z++) {
            let levelWhite = 0;
            let levelBlack = 0;
            
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const piece = board9D[z]?.[y]?.[x];
                    if (piece) {
                        const value = pieceValues[piece] || 0;
                        if (piece === piece.toUpperCase()) {
                            levelWhite += value;
                            totalWhite += value;
                        } else {
                            levelBlack += value;
                            totalBlack += value;
                        }
                    }
                }
            }
            
            materialByLevel.push({
                level: z,
                white: levelWhite,
                black: levelBlack,
                balance: levelWhite - levelBlack
            });
        }
        
        return {
            totalWhite,
            totalBlack,
            balance: totalWhite - totalBlack,
            byLevel: materialByLevel
        };
    }
    
    /**
     * Analyze control of each level
     */
    analyzeLevelControl(board9D) {
        const control = [];
        
        for (let z = 0; z < 9; z++) {
            let whitePresence = 0;
            let blackPresence = 0;
            
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const piece = board9D[z]?.[y]?.[x];
                    if (piece) {
                        if (piece === piece.toUpperCase()) {
                            whitePresence++;
                        } else {
                            blackPresence++;
                        }
                    }
                }
            }
            
            control.push({
                level: z,
                whitePresence,
                blackPresence,
                dominance: whitePresence > blackPresence ? 'white' : 
                          blackPresence > whitePresence ? 'black' : 'neutral'
            });
        }
        
        return control;
    }
    
    /**
     * Analyze piece mobility
     */
    analyzeMobility(board9D) {
        // Simplified mobility estimate based on piece types and positions
        let whiteMobility = 0;
        let blackMobility = 0;
        
        for (let z = 0; z < 9; z++) {
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const piece = board9D[z]?.[y]?.[x];
                    if (piece) {
                        // Estimate mobility based on piece type and position
                        const baseMobility = this.getBaseMobility(piece.toUpperCase());
                        const positionMultiplier = this.getPositionMultiplier(x, y, z);
                        const mobility = baseMobility * positionMultiplier;
                        
                        if (piece === piece.toUpperCase()) {
                            whiteMobility += mobility;
                        } else {
                            blackMobility += mobility;
                        }
                    }
                }
            }
        }
        
        return {
            white: whiteMobility,
            black: blackMobility,
            advantage: whiteMobility - blackMobility
        };
    }
    
    /**
     * Get base mobility for piece type
     */
    getBaseMobility(pieceType) {
        const mobility = {
            'P': 1,   // Pawn
            'N': 8,   // Knight (can go many places)
            'B': 13,  // Bishop (diagonal)
            'R': 14,  // Rook (straight lines + vertical)
            'Q': 27,  // Queen (most mobile)
            'K': 8    // King (limited range)
        };
        return mobility[pieceType] || 0;
    }
    
    /**
     * Position multiplier for mobility (center = more mobile)
     */
    getPositionMultiplier(x, y, z) {
        // Center levels (3,4,5) are more valuable
        const levelBonus = (z >= 3 && z <= 5) ? 1.2 : 1.0;
        
        // Center squares are more mobile
        const centerDist = Math.abs(x - 3.5) + Math.abs(y - 3.5);
        const centerBonus = 1.0 + (7 - centerDist) * 0.05;
        
        return levelBonus * centerBonus;
    }
    
    /**
     * Analyze vertical control (crucial in 9D chess)
     */
    analyzeVerticalControl(board9D) {
        let whiteVertical = 0;
        let blackVertical = 0;
        
        // Check for vertical alignments and rooks/queens on key files
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                // Check vertical line (x,y) across all levels
                const verticalPieces = [];
                for (let z = 0; z < 9; z++) {
                    const piece = board9D[z]?.[y]?.[x];
                    if (piece && (piece.toUpperCase() === 'R' || piece.toUpperCase() === 'Q')) {
                        verticalPieces.push({ piece, z });
                    }
                }
                
                // Count vertical control
                for (const { piece } of verticalPieces) {
                    if (piece === piece.toUpperCase()) {
                        whiteVertical += 2; // Rook/Queen on vertical line
                    } else {
                        blackVertical += 2;
                    }
                }
            }
        }
        
        return {
            white: whiteVertical,
            black: blackVertical,
            advantage: whiteVertical - blackVertical
        };
    }
    
    /**
     * Analyze king safety
     */
    analyzeKingSafety(board9D) {
        const whiteKings = this.findKings(board9D, true);
        const blackKings = this.findKings(board9D, false);
        
        return {
            whiteKingSafety: this.calculateKingSafety(board9D, whiteKings, true),
            blackKingSafety: this.calculateKingSafety(board9D, blackKings, false)
        };
    }
    
    /**
     * Find all kings
     */
    findKings(board9D, isWhite) {
        const kings = [];
        const kingSymbol = isWhite ? 'K' : 'k';
        
        for (let z = 0; z < 9; z++) {
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    if (board9D[z]?.[y]?.[x] === kingSymbol) {
                        kings.push({ x, y, z });
                    }
                }
            }
        }
        
        return kings;
    }
    
    /**
     * Calculate king safety score
     */
    calculateKingSafety(board9D, kings, isWhite) {
        // Simplified: kings are safer when:
        // - On their back levels (z=6,7,8 for white, z=0,1,2 for black)
        // - Surrounded by friendly pieces
        let safetyScore = 0;
        
        for (const king of kings) {
            // Level safety
            if (isWhite && king.z >= 6) {
                safetyScore += 10;
            } else if (!isWhite && king.z <= 2) {
                safetyScore += 10;
            }
            
            // Count friendly pieces nearby
            let friendlyNeighbors = 0;
            for (let dz = -1; dz <= 1; dz++) {
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0 && dz === 0) continue;
                        const piece = board9D[king.z + dz]?.[king.y + dy]?.[king.x + dx];
                        if (piece && (piece === piece.toUpperCase()) === isWhite) {
                            friendlyNeighbors++;
                        }
                    }
                }
            }
            safetyScore += friendlyNeighbors;
        }
        
        return safetyScore;
    }
    
    /**
     * Find the most active/critical level
     */
    findCriticalLevel(board9D) {
        let maxActivity = 0;
        let criticalLevel = 4; // default to center
        
        for (let z = 0; z < 9; z++) {
            let activity = 0;
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    if (board9D[z]?.[y]?.[x]) {
                        activity++;
                    }
                }
            }
            if (activity > maxActivity) {
                maxActivity = activity;
                criticalLevel = z;
            }
        }
        
        return criticalLevel;
    }
    
    /**
     * Extract features for abstract reasoning
     */
    extractFeatures(board9D, analysis) {
        return {
            material_balance: analysis.material.balance,
            vertical_alignment: analysis.verticalControl.advantage > 5 ? 1 : 0,
            diagonal_3d_alignment: 0, // Placeholder
            piece_penetration: this.calculatePenetration(board9D),
            center_control: this.calculateCenterControl(board9D),
            rook_on_vertical: analysis.verticalControl.white > 0 || analysis.verticalControl.black > 0 ? 1 : 0
        };
    }
    
    /**
     * Calculate piece penetration into opponent territory
     */
    calculatePenetration(board9D) {
        let whitePenetration = 0;
        let blackPenetration = 0;
        
        // White pieces on black levels (0,1,2)
        for (let z = 0; z <= 2; z++) {
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const piece = board9D[z]?.[y]?.[x];
                    if (piece && piece === piece.toUpperCase()) {
                        whitePenetration++;
                    }
                }
            }
        }
        
        // Black pieces on white levels (6,7,8)
        for (let z = 6; z <= 8; z++) {
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const piece = board9D[z]?.[y]?.[x];
                    if (piece && piece === piece.toLowerCase()) {
                        blackPenetration++;
                    }
                }
            }
        }
        
        return (whitePenetration - blackPenetration) / 10; // Normalize
    }
    
    /**
     * Calculate center control
     */
    calculateCenterControl(board9D) {
        let control = 0;
        
        // Center is level 4, squares (3,3), (3,4), (4,3), (4,4)
        const centerSquares = [[3, 3], [3, 4], [4, 3], [4, 4]];
        
        for (const [x, y] of centerSquares) {
            const piece = board9D[4]?.[y]?.[x];
            if (piece) {
                control += piece === piece.toUpperCase() ? 1 : -1;
            }
        }
        
        return control / 4; // Normalize to -1 to 1
    }
    
    /**
     * Calculate position complexity
     */
    calculateComplexity(board9D) {
        let pieceCount = 0;
        let levelsOccupied = 0;
        
        for (let z = 0; z < 9; z++) {
            let levelHasPieces = false;
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    if (board9D[z]?.[y]?.[x]) {
                        pieceCount++;
                        levelHasPieces = true;
                    }
                }
            }
            if (levelHasPieces) levelsOccupied++;
        }
        
        // More pieces and more occupied levels = more complex
        return (pieceCount / 96 + levelsOccupied / 9) / 2;
    }
    
    /**
     * Simulate a move (for lookahead)
     */
    simulateMove(board9D, move) {
        // Deep copy board
        const newBoard = board9D.map(level => 
            level.map(row => [...row])
        );
        
        // Apply move
        const { from, to } = move;
        const piece = newBoard[from.z][from.y][from.x];
        newBoard[to.z][to.y][to.x] = piece;
        newBoard[from.z][from.y][from.x] = null;
        
        return newBoard;
    }
}
