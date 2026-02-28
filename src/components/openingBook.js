// Opening Book Database for 3D Chess
// Stores common opening sequences and provides move suggestions

/**
 * Opening Book Entry Structure:
 * {
 *   name: "King's Pawn Opening",
 *   moves: [
 *     { from: {x,y,z}, to: {x,y,z}, piece: 'pawn' },
 *     ...
 *   ],
 *   evaluation: 0.3  // Position evaluation after sequence
 * }
 */

// ==================== OPENING SEQUENCES ====================

export const openingBook = {
  // WHITE OPENINGS (Starting from z=2)
  white: [
    {
      name: "King's Pawn Opening - Classical",
      moves: [
        { from: { x: 4, y: 1, z: 2 }, to: { x: 4, y: 3, z: 2 }, piece: 'pawn' }, // e4
      ],
      evaluation: 0.25,
      description: "Control center, open lines for bishops and queen"
    },
    {
      name: "Queen's Pawn Opening - Solid",
      moves: [
        { from: { x: 3, y: 1, z: 2 }, to: { x: 3, y: 3, z: 2 }, piece: 'pawn' }, // d4
      ],
      evaluation: 0.20,
      description: "Solid center control, supports c4 or Nf3"
    },
    {
      name: "English Opening",
      moves: [
        { from: { x: 2, y: 1, z: 2 }, to: { x: 2, y: 3, z: 2 }, piece: 'pawn' }, // c4
      ],
      evaluation: 0.15,
      description: "Flexible, controls center from flank"
    },
    {
      name: "King's Pawn + Knight Development",
      moves: [
        { from: { x: 4, y: 1, z: 2 }, to: { x: 4, y: 3, z: 2 }, piece: 'pawn' }, // e4
        { from: { x: 6, y: 0, z: 2 }, to: { x: 5, y: 2, z: 2 }, piece: 'knight' }, // Nf3
      ],
      evaluation: 0.30,
      description: "Classical development - piece before queen"
    },
    {
      name: "Italian Game Setup",
      moves: [
        { from: { x: 4, y: 1, z: 2 }, to: { x: 4, y: 3, z: 2 }, piece: 'pawn' }, // e4
        { from: { x: 6, y: 0, z: 2 }, to: { x: 5, y: 2, z: 2 }, piece: 'knight' }, // Nf3
        { from: { x: 5, y: 0, z: 2 }, to: { x: 2, y: 3, z: 2 }, piece: 'bishop' }, // Bc4
      ],
      evaluation: 0.35,
      description: "Aggressive bishop placement, quick development"
    },
    {
      name: "Queen's Gambit",
      moves: [
        { from: { x: 3, y: 1, z: 2 }, to: { x: 3, y: 3, z: 2 }, piece: 'pawn' }, // d4
        { from: { x: 2, y: 1, z: 2 }, to: { x: 2, y: 3, z: 2 }, piece: 'pawn' }, // c4
      ],
      evaluation: 0.25,
      description: "Classic queenside pawn structure"
    },
  ],

  // BLACK RESPONSES (Starting from z=0)
  black: [
    {
      name: "Symmetrical Defense - e5",
      condition: { lastMove: { to: { x: 4, y: 3, z: 2 } } }, // After e4
      moves: [
        { from: { x: 4, y: 6, z: 0 }, to: { x: 4, y: 4, z: 0 }, piece: 'pawn' }, // e5
      ],
      evaluation: 0.0,
      description: "Match center control symmetrically"
    },
    {
      name: "Sicilian Defense",
      condition: { lastMove: { to: { x: 4, y: 3, z: 2 } } }, // After e4
      moves: [
        { from: { x: 2, y: 6, z: 0 }, to: { x: 2, y: 4, z: 0 }, piece: 'pawn' }, // c5
      ],
      evaluation: 0.0,
      description: "Asymmetric counterplay"
    },
    {
      name: "French Defense",
      condition: { lastMove: { to: { x: 4, y: 3, z: 2 } } }, // After e4
      moves: [
        { from: { x: 4, y: 6, z: 0 }, to: { x: 4, y: 5, z: 0 }, piece: 'pawn' }, // e6
      ],
      evaluation: -0.05,
      description: "Solid but slightly passive"
    },
    {
      name: "Queen's Pawn Defense",
      condition: { lastMove: { to: { x: 3, y: 3, z: 2 } } }, // After d4
      moves: [
        { from: { x: 3, y: 6, z: 0 }, to: { x: 3, y: 4, z: 0 }, piece: 'pawn' }, // d5
      ],
      evaluation: 0.0,
      description: "Solid central pawn"
    },
    {
      name: "Knight Development",
      condition: { moveCount: 1 },
      moves: [
        { from: { x: 6, y: 7, z: 0 }, to: { x: 5, y: 5, z: 0 }, piece: 'knight' }, // Nf6
      ],
      evaluation: 0.0,
      description: "Universal development move"
    },
  ]
};

// ==================== ANTI-PATTERNS (Moves to Avoid) ====================

export const antiPatterns = [
  {
    name: "Early Queen Development",
    pattern: { piece: 'queen', moveNumber: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
    penalty: -10000,  // EXTREME penalty - makes early queen worse than losing the game
    reason: "Queen exposed to attacks before pieces developed"
  },
  {
    name: "Early King Movement",
    pattern: { piece: 'king', moveNumber: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
    penalty: -15000,  // CRITICAL penalty - king must stay safe in opening
    reason: "King movement prevents castling and exposes king to danger"
  },
  {
    name: "Premature Rook Lift",
    pattern: { piece: 'rook', moveNumber: [1, 2, 3] },
    penalty: -0.6,
    reason: "Rook should move after castling and development"
  },
  {
    name: "Moving Same Piece Twice",
    pattern: { samePiece: true, moveNumber: [1, 2, 3, 4, 5] },
    penalty: -0.3,
    reason: "Develop different pieces in opening"
  },
  {
    name: "Neglecting Center",
    pattern: { noCenterPawns: true, moveNumber: [1, 2] },
    penalty: -0.5,
    reason: "Must control center with pawns early"
  }
];

// ==================== OPENING PRINCIPLES ====================

export const openingPrinciples = {
  // Piece values for opening phase (different from endgame)
  developmentBonus: {
    pawn: 10,      // Center pawns
    knight: 30,    // Knights before bishops
    bishop: 25,    // Bishops developed
    rook: -20,     // Rooks should stay back
    queen: -50,    // Queen should wait
    king: 0        // King safety through castling
  },

  // Square values for piece placement in opening
  idealSquares: {
    knight: [
      { x: 5, y: 2, z: 2 }, { x: 2, y: 2, z: 2 }, // White knights
      { x: 5, y: 5, z: 0 }, { x: 2, y: 5, z: 0 }, // Black knights
    ],
    bishop: [
      { x: 2, y: 3, z: 2 }, { x: 5, y: 3, z: 2 }, // White bishops
      { x: 2, y: 4, z: 0 }, { x: 5, y: 4, z: 0 }, // Black bishops
    ]
  },

  // Opening phase definition
  openingMoveCount: 20, // First 20 moves considered "opening" (extends to avoid early queen/king)
};

// ==================== MOVE HISTORY TRACKING ====================

/**
 * Check if current position matches an opening sequence
 */
export function findOpeningMove(moveHistory, color) {
  const moveCount = moveHistory.length;
  
  // Only use opening book in first 10 moves
  if (moveCount >= openingPrinciples.openingMoveCount) {
    return null;
  }

  const openings = color === 'white' ? openingBook.white : openingBook.black;
  
  // Find matching opening sequences
  const candidates = [];

  for (const opening of openings) {
    // Check if we've followed this opening so far
    const openingMoveCount = Math.floor(moveCount / 2) + (color === 'white' && moveCount % 2 === 0 ? 1 : 0);
    
    if (opening.condition) {
      // Check condition (e.g., response to specific move)
      if (moveHistory.length > 0) {
        const lastMove = moveHistory[moveHistory.length - 1];
        if (opening.condition.lastMove) {
          const condMove = opening.condition.lastMove.to;
          if (lastMove.to.x !== condMove.x || lastMove.to.y !== condMove.y || lastMove.to.z !== condMove.z) {
            continue;
          }
        }
      }
    }

    // Check if this opening sequence matches our move history
    let matches = true;
    const colorOffset = color === 'white' ? 0 : 1;
    
    for (let i = 0; i < openingMoveCount && i < opening.moves.length; i++) {
      const historyIndex = i * 2 + colorOffset;
      if (historyIndex >= moveHistory.length) break;
      
      const histMove = moveHistory[historyIndex];
      const bookMove = opening.moves[i];
      
      if (
        histMove.from.x !== bookMove.from.x ||
        histMove.from.y !== bookMove.from.y ||
        histMove.from.z !== bookMove.from.z ||
        histMove.to.x !== bookMove.to.x ||
        histMove.to.y !== bookMove.to.y ||
        histMove.to.z !== bookMove.to.z
      ) {
        matches = false;
        break;
      }
    }

    if (matches && opening.moves.length > openingMoveCount) {
      // We're in this opening, get next move
      const nextMove = opening.moves[openingMoveCount];
      candidates.push({
        move: nextMove,
        opening: opening.name,
        evaluation: opening.evaluation,
        description: opening.description
      });
    }
  }

  // Return best candidate (highest evaluation)
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.evaluation - a.evaluation);
    return candidates[0];
  }

  return null;
}

/**
 * Check if a move violates opening principles
 */
export function checkAntiPattern(move, moveHistory, piecesMap) {
  const moveNumber = moveHistory.length + 1;
  let penalty = 0;
  const violations = [];

  for (const antiPattern of antiPatterns) {
    if (antiPattern.pattern.piece && move.piece !== antiPattern.pattern.piece) {
      continue;
    }

    if (antiPattern.pattern.moveNumber && !antiPattern.pattern.moveNumber.includes(moveNumber)) {
      continue;
    }

    // Check specific patterns
    if (antiPattern.pattern.samePiece) {
      // Check if same piece moved recently
      const recentMoves = moveHistory.slice(-3);
      const fromKey = `${move.from.x},${move.from.y},${move.from.z}`;
      const movedRecently = recentMoves.some(m => 
        `${m.from.x},${m.from.y},${m.from.z}` === fromKey
      );
      if (movedRecently) {
        penalty += antiPattern.penalty;
        violations.push(antiPattern.reason);
      }
    }

    if (antiPattern.pattern.noCenterPawns) {
      // Check if center pawns have been moved
      const centerPawnsMoved = moveHistory.some(m => 
        m.piece === 'pawn' && 
        (m.to.x === 3 || m.to.x === 4) && 
        (m.to.y === 3 || m.to.y === 4 || m.to.y === 2)
      );
      if (!centerPawnsMoved && move.piece !== 'pawn') {
        penalty += antiPattern.penalty;
        violations.push(antiPattern.reason);
      }
    }

    // Simple piece type checks
    if (antiPattern.pattern.piece === move.piece && antiPattern.pattern.moveNumber.includes(moveNumber)) {
      penalty += antiPattern.penalty;
      violations.push(antiPattern.reason);
    }
  }

  return { penalty, violations };
}

/**
 * Get opening book suggestion with explanation
 */
export function getOpeningBookMove(moveHistory, color, piecesMap) {
  const suggestion = findOpeningMove(moveHistory, color);
  
  if (suggestion) {
    console.log(`📖 Opening Book: ${suggestion.opening} - ${suggestion.description}`);
    return suggestion;
  }

  // Out of book - provide general opening advice
  const moveCount = moveHistory.length;
  if (moveCount < openingPrinciples.openingMoveCount) {
    console.log('📖 Opening Book: Out of book, following general principles');
  }

  return null;
}

/**
 * Evaluate if a position is still in opening phase
 */
export function isInOpeningPhase(moveHistory) {
  return moveHistory.length < openingPrinciples.openingMoveCount;
}

/**
 * Get opening statistics for display
 */
export function getOpeningStats() {
  return {
    totalOpenings: openingBook.white.length + openingBook.black.length,
    whiteOpenings: openingBook.white.length,
    blackOpenings: openingBook.black.length,
    antiPatterns: antiPatterns.length
  };
}

/**
 * Add new opening to the book (for future expansion)
 */
export function addOpening(color, opening) {
  if (color === 'white') {
    openingBook.white.push(opening);
  } else {
    openingBook.black.push(opening);
  }
  console.log(`📖 Added new opening: ${opening.name}`);
}
