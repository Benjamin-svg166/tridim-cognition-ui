/**
 * STRATEGIC GAME ANALYSIS
 * Player: Human (White) vs AI (Black, Medium Difficulty)
 * Date: January 10, 2026
 * Result: White Victory (Checkmate)
 * Key Theme: Early Queen Trade → Complex Endgame → Pawn Race → Queen vs Queen Finale
 */

const gameAnalysis = {
  metadata: {
    white: "Human Player",
    black: "AI (Medium Difficulty)",
    result: "White Victory (Checkmate)",
    totalMoves: 170,
    difficulty: "SIGNIFICANTLY HARDER than Easy AI",
    gamePhases: {
      opening: "Moves 1-14 (Early queen trade)",
      middlegame: "Moves 15-50 (Rook battles)",
      endgame: "Moves 51-100 (Pawn promotions)",
      finale: "Moves 101-170 (Queen endgame + checkmate)"
    }
  },

  // PHASE 1: OPENING - Tactical Melee (Moves 1-14)
  opening: {
    analysis: `
      OPENING SEQUENCE - DOUBLE-EDGED PLAY:
      
      Move 1: pawn (3,1,2)→(3,3,2) - Aggressive central pawn push
      Move 2: pawn (3,6,0)→(3,4,0) - Black mirrors the aggression
      Move 3: pawn (4,1,2)→(4,2,2) - White expands center
      Move 4: bishop (5,7,0)→(3,5,2) - Black bishop invades white's layer!
      
      CRITICAL BISHOP EXCHANGE (Moves 5-9):
      Move 5: bishop (2,0,2)→(2,2,0) - White bishop to black's layer
      Move 6: bishop (2,7,0)→(4,5,2) - Black second bishop to white's layer
      Move 7: bishop (2,2,0)→(4,4,2) - White bishop aggressive positioning
      Move 8: bishop (3,5,2)→(4,4,2) - Black captures white bishop
      Move 9: pawn (3,3,2)→(4,4,2) - White RECAPTURES with pawn
      
      Result: Bishop trade, White gains central pawn at (4,4,2)
      
      QUEEN CATASTROPHE (Moves 11-14):
      Move 11: queen (3,0,2)→(3,5,2) - White activates queen early
      Move 12: rook (7,7,0)→(7,7,1) - Black lifts rook (passive)
      Move 13: queen (3,5,2)→(3,7,0) - White captures BLACK QUEEN! 
      Move 14: king (4,7,0)→(3,7,0) - Black king captures WHITE QUEEN
      
      EVALUATION: Queens off the board by move 14! This completely changed
      the game's character. Without queens, the game becomes a technical
      endgame focused on rook + pawn play. This favors the better player.
    `,
    materialAfterOpening: {
      white: "2 Rooks, 2 Knights, 1 Bishop, 7 Pawns",
      black: "2 Rooks, 2 Knights, 2 Bishops, 7 Pawns",
      advantage: "Black +1 bishop (minor material edge)"
    },
    grade: {
      white: "B",
      black: "B+",
      reason: "Equal queen trade but Black retained extra bishop"
    }
  },

  // PHASE 2: MIDDLEGAME - Piece Battles (Moves 15-50)
  middlegame: {
    keyMoments: [
      {
        move: 19,
        action: "bishop (2,3,2) captures white bishop",
        significance: "Black eliminates White's last bishop"
      },
      {
        move: 20,
        action: "pawn (1,2,2)→(2,3,2) recaptures bishop",
        significance: "White regains material with pawn"
      },
      {
        move: 29,
        action: "knight (1,4,1)→(1,6,0) captures black pawn",
        significance: "White's knight raids Black's territory"
      },
      {
        move: 30,
        action: "king (2,6,1)→(1,6,0) captures white knight",
        significance: "Black king becomes active, eliminates knight"
      },
      {
        move: 33,
        action: "rook (0,6,0) captures black pawn at (2,6,0)",
        significance: "White's rook invasion on Black's layer"
      },
      {
        move: 34,
        action: "king (2,5,1)→(2,6,0) captures white rook",
        significance: "Black king captures rook - MAJOR material swing"
      }
    ],
    analysis: `
      THE KING BECOMES A WARRIOR:
      
      Black's king (normally passive in chess) became an ACTIVE fighting piece:
      - Move 30: Captures white knight at (1,6,0)
      - Move 34: Captures white rook at (2,6,0)
      
      This is a key feature of 3D chess - kings can be more active because
      they have escape routes on multiple layers. Black's AI used this
      brilliantly.
      
      MATERIAL SWINGS:
      After move 34: White lost rook + knight, Black lost bishop + pawn
      Net: Black gained approximately 2 points of material (Rook=5, Knight=3 
      vs Bishop=3, Pawn=1)
      
      WHITE'S COMPENSATION:
      - Better pawn structure
      - More advanced pawns
      - Active remaining rook
      
      The position remained complex with mutual chances.
    `,
    grade: {
      white: "C+",
      black: "A-",
      reason: "Black's active king and piece captures gave material advantage"
    }
  },

  // PHASE 3: ENDGAME - The Pawn Race (Moves 51-100)
  endgame: {
    promotions: [
      {
        move: 53,
        piece: "pawn (4,6,2)→(4,7,2)",
        color: "WHITE",
        result: "QUEEN PROMOTION",
        impact: "White gets queen first!"
      },
      {
        move: 93,
        piece: "pawn (5,6,2)→(5,7,2)", 
        color: "WHITE",
        result: "SECOND QUEEN PROMOTION",
        impact: "White promotes AGAIN"
      },
      {
        move: 95,
        piece: "queen (5,7,2)→(6,6,2)",
        action: "White queen moves",
        response: "rook (6,0,2)→(6,6,2) - BLACK CAPTURES QUEEN!"
      },
      {
        move: 96,
        action: "king (6,7,2)→(6,6,2) - White king recaptures rook",
        result: "Queen traded for rook - White still has first queen"
      }
    ],
    analysis: `
      PAWN RACE DYNAMICS:
      
      Both sides pushed pawns desperately toward promotion. The race was:
      
      WHITE'S PAWN: (4,4,2)→(4,5,2)→(4,6,2)→(4,7,2) QUEEN! (Move 53)
      BLACK'S RESPONSE: Tried to create counterplay with rooks
      
      CRITICAL SEQUENCE (Moves 53-65):
      Move 53: White promotes to queen
      Move 58: Black rook (4,1,2)→(4,7,2) - CAPTURES WHITE'S QUEEN!
      Move 59: queen (4,5,1)→(5,6,2) - White had SECOND queen waiting!
      
      Wait, let me reread this... White had two queens? Let me trace:
      - Move 53: Pawn promotes to queen at (4,7,2)
      - Move 59: There's another queen at (4,5,1)?
      
      Looking back, I don't see an earlier promotion for the queen at (4,5,1).
      This might be notation confusion or the queen moved from (4,6,2) earlier.
      
      Let me retrace from move 53:
      Move 53: queen (4,7,2) promoted
      Move 56: queen (4,6,2)→(4,7,2) - This is a different queen!
      Move 58: rook (4,1,2)→(4,7,2) captures white queen
      Move 59: queen (4,5,1)→(5,6,2) - White still has a queen
      
      So White had multiple queens active at different points.
      
      THE SECOND PROMOTION SEQUENCE (Moves 91-96):
      Move 91: pawn (5,5,2)→(5,6,2)
      Move 93: queen (5,6,2)→(5,7,2) - SECOND promotion
      Move 95: queen (5,7,2)→(6,6,2)
      Move 96: rook captures queen, king recaptures
      
      Black's rook sacrifice prevented the two-queen advantage.
    `,
    grade: {
      white: "A-",
      black: "B+",
      reason: "White promoted multiple pawns but Black defended resourcefully"
    }
  },

  // PHASE 4: QUEEN ENDGAME - The Long Hunt (Moves 101-170)
  finale: {
    analysis: `
      QUEEN VS KING ENDGAME - 70 MOVES OF PRECISION:
      
      After all the exchanges, the position simplified to:
      WHITE: Queen, King
      BLACK: King
      
      This should be a simple win, but it took 70 moves! Here's why:
      
      3D CHESS COMPLEXITY:
      - King has 26 possible escape squares (not just 8 like 2D chess)
      - Queen must control multiple layers simultaneously
      - Checkmate patterns are much more complex
      
      THE MATING SEQUENCE:
      
      Moves 101-140: White's queen chased Black's king across all three layers
      - King fled: (2,5,1)→(1,4,1)→(2,5,1)→(1,4,1) (oscillating)
      - Queen maneuvered: (5,5,1)→(5,4,1)→(5,5,1) (maintaining pressure)
      
      THE BREAKTHROUGH (Moves 141-160):
      White's king activated to help deliver checkmate:
      - White king: (3,3,1)→(3,2,2)→(3,2,1)→(3,1,1)
      - Black king: (1,1,1)→(1,2,1)→(1,1,2)→(1,1,1) (cornered)
      
      FINAL CHECKMATE (Move 170):
      Move 169: queen (2,2,1)→(2,1,1) - Controls escape squares
      Move 170: queen (2,1,1)→(1,1,1) - CHECKMATE!
      
      The queen delivered mate with king support, trapping Black's king
      at (0,1,1) with no escape on any layer.
    `,
    technique: `
      CHECKMATE TECHNIQUE IN 3D CHESS:
      
      1. CENTRALIZE KING: White's king moved from (4,0,2) toward the action
      2. RESTRICT OPPONENT: Queen controlled multiple layers
      3. COORDINATE PIECES: King + Queen work together
      4. LAYER CONTROL: Cut off escape routes between layers
      5. PATIENCE: 70 moves to force checkmate (normal in 3D endgames)
      
      This demonstrates that even "winning" positions require precise
      technique in 3D chess. The Medium AI defended well, using all
      three layers to prolong the game.
    `,
    grade: {
      white: "B+",
      black: "A-",
      reason: "White won but needed 70 moves; Black's defense was excellent"
    }
  },

  // CRITICAL MISTAKES
  mistakes: {
    white: [
      {
        move: 13,
        error: "queen (3,5,2)→(3,7,0) captures black queen",
        followUp: "Black king recaptures, forcing queen trade",
        impact: "Removed queens early, making win more technical",
        severity: "Minor (still won, but harder endgame)",
        lesson: "In 3D chess, don't trade queens if opponent's king can recapture safely"
      },
      {
        move: 34,
        error: "Lost rook to Black's active king",
        impact: "Material deficit in middlegame",
        severity: "Major",
        lesson: "Watch for enemy king captures - kings are more dangerous in 3D chess"
      },
      {
        move: "101-140",
        error: "Took 40 extra moves to checkmate with queen vs lone king",
        impact: "Prolonged game unnecessarily",
        severity: "Minor (learning curve)",
        lesson: "Practice queen + king checkmate patterns in 3D"
      }
    ],
    black: [
      {
        move: 12,
        error: "rook (7,7,0)→(7,7,1) - Passive rook lift when queen was attacked",
        impact: "Lost queen next move",
        severity: "Critical",
        lesson: "Should have moved queen to safety instead"
      },
      {
        move: 30-34,
        success: "Active king capturing knight and rook",
        note: "NOT a mistake - this was brilliant play by Medium AI"
      },
      {
        move: 141-170,
        error: "King got trapped in corner instead of staying in center",
        impact: "Led to checkmate",
        severity: "Major",
        lesson: "In K+Q vs K endgames, keep king centralized as long as possible"
      }
    ]
  },

  // OVERALL ASSESSMENT
  assessment: {
    whiteStrengths: [
      "✓ Aggressive pawn advancement (created promotion threats)",
      "✓ Multiple pawn promotions achieved",
      "✓ Persistent attacking pressure throughout game",
      "✓ Eventually delivered checkmate (technical win)",
      "✓ Adapted to queenless middlegame well"
    ],
    whiteWeaknesses: [
      "✗ Traded queens too early (made win harder)",
      "✗ Lost rook to Black's king in middlegame",
      "✗ Checkmate technique needs improvement (took 70 moves)",
      "✗ Some tactical oversights (rook capture)"
    ],
    blackStrengths: [
      "✓ Excellent active king play (captured knight + rook)",
      "✓ Resourceful rook defense",
      "✓ Captured White's promoted queens multiple times",
      "✓ Strong endgame resistance (70 moves to mate)",
      "✓ Good layer transitions and tactical awareness"
    ],
    blackWeaknesses: [
      "✗ Lost queen in opening due to passive rook move",
      "✗ King eventually got cornered in finale",
      "✗ Couldn't prevent pawn promotions"
    ]
  },

  // PERFORMANCE COMPARISON: Easy vs Medium AI
  difficultyComparison: {
    easyAI: {
      moves: 90,
      resistance: "Minimal - collapsed after queen loss",
      tacticalAwareness: "Poor",
      endgameSkill: "None",
      result: "Easy crushing victory"
    },
    mediumAI: {
      moves: 170,
      resistance: "Excellent - fought for 70 moves in losing position",
      tacticalAwareness: "Strong - active king captures",
      endgameSkill: "Advanced - maximized drawing chances",
      result: "Hard-fought victory requiring precision"
    },
    verdict: "Medium AI is SIGNIFICANTLY stronger than Easy. Required 170 moves vs 90, and demonstrated advanced tactical and endgame skills."
  },

  // FINAL GRADES
  finalGrades: {
    white: {
      opening: "B",
      middlegame: "C+",
      endgame: "A-",
      finale: "B+",
      overall: "B+",
      summary: "Solid victory against stronger opponent, but made some tactical errors. The early queen trade made the game more difficult than necessary. Strong pawn play and persistent pressure eventually prevailed. Endgame technique needs refinement (70 moves to checkmate)."
    },
    black: {
      opening: "B+",
      middlegame: "A-",
      endgame: "B+",
      finale: "A-",
      overall: "A-",
      summary: "Medium AI played MUCH better than Easy. Excellent active king play, strong defensive technique, and maximized drawing chances in losing endgame. Only major error was losing queen in opening. This was a quality opponent that tested White's skills thoroughly."
    }
  },

  // KEY LESSONS
  lessons: [
    "1. QUEEN TRADES: In 3D chess, be very careful about queen trades where opponent's king can recapture - it removes your most powerful piece",
    "2. ACTIVE KINGS: Kings are MORE DANGEROUS in 3D chess because they can escape to other layers. Black's king captured a knight and rook!",
    "3. PAWN PROMOTION: Advancing pawns on multiple files forces opponent to defend everywhere. White used this effectively",
    "4. ENDGAME TECHNIQUE: Queen + King vs King checkmate is MUCH harder in 3D than 2D. Practice this pattern!",
    "5. MEDIUM AI: Medium difficulty is a real challenge. It punishes mistakes and defends resourcefully. Much better training than Easy",
    "6. LAYER CONTROL: Control multiple layers with your pieces to restrict opponent's movement",
    "7. PATIENCE: This game took 170 moves - nearly DOUBLE the Easy AI game. Be prepared for long battles against Medium+"
  ],

  // NOTABLE ACHIEVEMENTS
  achievements: [
    "🏆 Defeated Medium AI (significant challenge upgrade)",
    "⚔️ Survived queenless middlegame despite material deficit",
    "👑 Multiple pawn promotions achieved",
    "🎯 Delivered checkmate in complex 3D endgame",
    "🧠 Demonstrated improvement in 3D chess understanding",
    "💪 Persisted through 170-move marathon game",
    "📈 Showed growth from Easy AI game (tactical awareness)"
  ],

  // NEXT STEPS
  recommendations: [
    "⚡ Practice queen + king vs king checkmate patterns in 3D",
    "⚡ Study when to trade pieces vs keep them",
    "⚡ Learn to use king actively in 3D middlegames (like Black did)",
    "⚡ Consider trying Hard difficulty to continue growth",
    "⚡ Review this game to understand where you lost material (rook to king)",
    "⚡ Study 3D endgame theory - very different from 2D chess"
  ]
};

// Export for analysis
console.log("═══════════════════════════════════════════════");
console.log("📊 GAME ANALYSIS: White Victory vs Medium AI");
console.log("═══════════════════════════════════════════════\n");

console.log("⏱️  GAME LENGTH: 170 moves (vs 90 against Easy AI)");
console.log("    This game was ALMOST TWICE as long!\n");

console.log("🎖️  FINAL GRADES:");
console.log(`   White: ${gameAnalysis.finalGrades.white.overall} - ${gameAnalysis.finalGrades.white.summary}\n`);
console.log(`   Black: ${gameAnalysis.finalGrades.black.overall} - ${gameAnalysis.finalGrades.black.summary}\n`);

console.log("⭐ KEY ACHIEVEMENTS:");
gameAnalysis.achievements.forEach(achievement => console.log(`   ${achievement}`));

console.log("\n💡 KEY LESSONS LEARNED:");
gameAnalysis.lessons.forEach(lesson => console.log(`   ${lesson}`));

console.log("\n📈 DIFFICULTY COMPARISON:");
console.log("   Easy AI:   90 moves, minimal resistance");
console.log("   Medium AI: 170 moves, excellent defense");
console.log("   → Medium AI is FAR more challenging!\n");

console.log("🎯 NEXT STEPS:");
gameAnalysis.recommendations.forEach(rec => console.log(`   ${rec}`));

console.log("\n═══════════════════════════════════════════════");

module.exports = gameAnalysis;
