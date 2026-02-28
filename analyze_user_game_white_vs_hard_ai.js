/**
 * STRATEGIC GAME ANALYSIS
 * Player: Human (White) vs AI (Black, Hard Difficulty)
 * Date: January 10, 2026
 * Result: White Victory (Checkmate)
 * Key Theme: Tactical Chaos → Multiple Queen Promotions → Complex Queen Endgame → Precise Checkmate
 */

const gameAnalysis = {
  metadata: {
    white: "Human Player",
    black: "AI (Hard Difficulty)",
    result: "White Victory (Checkmate)",
    totalMoves: 182,
    difficulty: "MAXIMUM CHALLENGE - Hard AI with optimized depth",
    gamePhases: {
      opening: "Moves 1-20 (Tactical mayhem)",
      middlegame: "Moves 21-60 (Material imbalances)",
      transition: "Moves 61-100 (Queen promotions)",
      endgame: "Moves 101-150 (Multi-queen battles)",
      finale: "Moves 151-182 (Checkmate execution)"
    },
    comparison: {
      vsEasy: "90 moves → 182 moves (2x longer)",
      vsMedium: "170 moves → 182 moves (slightly longer)",
      note: "Hard AI showed SIGNIFICANTLY better tactical awareness"
    }
  },

  // PHASE 1: OPENING - Wild Tactical Chaos (Moves 1-20)
  opening: {
    analysis: `
      AGGRESSIVE OPENING - BOTH SIDES ATTACK:
      
      WHITE'S PLAN:
      Move 1: knight (6,0,2)→(6,1,0) - Immediate deep knight raid to black's layer
      Move 3: bishop (5,0,2)→(3,2,0) - Bishop follows to black's layer
      Move 5: pawn (3,1,2)→(3,2,2) - Central pawn development
      Move 7: pawn (4,1,2)→(4,3,2) - Aggressive pawn push
      Move 9: O-O - King safety (castling)
      
      BLACK'S RESPONSE (Hard AI):
      Move 2: knight (6,7,0)→(5,5,0) - Counter knight development
      Move 4: bishop (2,7,0)→(4,5,2) - INVADES white's layer!
      Move 6: bishop (5,7,0)→(3,5,2) - Second bishop to white's layer
      Move 8: rook (0,7,0)→(0,7,2) - Vertical rook lift (aggressive)
      Move 10: rook (7,7,0)→(7,7,1) - Second rook lifts to middle layer
      
      CRITICAL BISHOP EXCHANGE SEQUENCE (Moves 11-18):
      Move 11: bishop (2,0,2)→(4,2,0) - White's second bishop to black's layer
      Move 13: bishop (4,2,0)→(0,6,0) CAPTURES black pawn!
      Move 15: bishop (3,2,0)→(3,4,2) - White bishop repositions
      Move 16: bishop (4,5,2)→(3,4,2) - BLACK CAPTURES WHITE BISHOP
      Move 17: pawn (4,3,2)→(3,4,2) - WHITE RECAPTURES BLACK BISHOP
      
      Result after opening: Complex position with bishops traded, white has
      pawn on black's layer at (3,4,2), material roughly equal.
      
      EVALUATION: Both sides played aggressively. Hard AI immediately punished
      white's deep piece placement with counter-invasions. The tactical
      complexity was MUCH higher than Medium AI.
    `,
    materialAfterOpening: {
      white: "Queen, 2 Rooks, 2 Knights, 1 Bishop, 7 Pawns",
      black: "Queen, 2 Rooks, 2 Knights, 2 Bishops, 7 Pawns (lost 1 pawn)",
      advantage: "Roughly equal - Black has extra bishop, White has extra pawn"
    },
    grade: {
      white: "B",
      black: "A-",
      reason: "Hard AI showed excellent tactical awareness and counter-play"
    }
  },

  // PHASE 2: MIDDLEGAME - Heavy Piece Trading (Moves 21-60)
  middlegame: {
    keyMoments: [
      {
        move: 26,
        action: "queen (3,7,0)→(1,5,2) - Black queen enters the fray",
        significance: "Black activates queen aggressively"
      },
      {
        move: 30,
        action: "knight (4,3,0)→(6,3,1) captures white knight",
        significance: "Black eliminates white's deep knight"
      },
      {
        move: 31,
        action: "bishop (0,6,0)→(2,6,2) - White bishop attacks queen",
        significance: "White forces queen trade"
      },
      {
        move: 32,
        action: "queen (1,5,2)→(2,6,2) CAPTURES white bishop",
        significance: "Black takes the bishop"
      },
      {
        move: 33,
        action: "pawn (3,5,2)→(2,6,2) CAPTURES BLACK QUEEN!",
        significance: "CRITICAL: White eliminates black's queen with pawn!"
      },
      {
        move: 34,
        action: "knight (6,3,1)→(4,3,2) captures white knight",
        significance: "Black continues tactical exchanges"
      },
      {
        move: 35,
        action: "pawn (3,2,2)→(4,3,2) captures black knight",
        significance: "White recaptures, material roughly equal"
      },
      {
        move: 36,
        action: "bishop (4,4,1)→(4,3,2) captures white pawn",
        significance: "Black bishop takes central pawn"
      },
      {
        move: 38,
        action: "bishop (4,3,2)→(3,3,1) - Black bishop retreats with material",
        significance: "Black consolidates position"
      },
      {
        move: 40,
        action: "king (3,6,1)→(2,6,2) captures white pawn",
        significance: "Black king becomes active (like vs Medium AI)"
      },
      {
        move: 43,
        action: "bishop (4,2,0)→(4,0,2) CAPTURES white rook!",
        significance: "Black wins the exchange (rook for bishop)"
      },
      {
        move: 44,
        action: "queen (3,0,2)→(4,0,2) captures black bishop",
        significance: "White recaptures but lost rook (net -2 points)"
      }
    ],
    analysis: `
      MATERIAL SWINGS - TACTICAL WARFARE:
      
      The middlegame was INCREDIBLY tactical. Key exchanges:
      
      1. QUEENS TRADED (Moves 31-33):
         White's pawn captured black's queen - unusual and powerful!
         
      2. KNIGHTS TRADED (Moves 30-35):
         Multiple knight exchanges in rapid succession
         
      3. BLACK WINS ROOK (Moves 43-44):
         Black's bishop captures white's rook
         White's queen recaptures bishop
         Net: Black gained ~2 points (Rook=5 vs Bishop=3)
         
      4. BLACK'S ACTIVE KING (Move 40):
         Like the Medium AI game, black's king captured a pawn
         Hard AI also uses active king strategy!
         
      MATERIAL COUNT AFTER MIDDLEGAME (~Move 50):
      WHITE: Queen, 1 Rook, 1 Knight, 5-6 Pawns
      BLACK: King, 2 Rooks, 1 Bishop, 1 Knight, 4-5 Pawns
      
      Black had material advantage (2 Rooks + Bishop + Knight vs Queen + Rook + Knight)
      But white had the queen, which is powerful in endgames.
      
      EVALUATION: Hard AI played MUCH better than Medium. The tactical 
      exchanges were sharper, the king activation was timed better, and
      black maintained material advantage longer.
    `,
    grade: {
      white: "B-",
      black: "A",
      reason: "Hard AI outplayed white tactically, won material advantage"
    }
  },

  // PHASE 3: TRANSITION - The Pawn Races (Moves 61-100)
  transition: {
    promotions: [
      {
        move: 70,
        piece: "pawn (0,6,2)→(0,7,2)",
        color: "WHITE",
        result: "FIRST QUEEN PROMOTION",
        impact: "White now has TWO queens!"
      },
      {
        move: 82,
        piece: "pawn (6,6,2)→(6,7,2)",
        color: "WHITE",
        result: "SECOND QUEEN PROMOTION",
        impact: "White now has THREE queens!"
      },
      {
        move: 102,
        piece: "pawn (5,6,2)→(5,7,2)",
        color: "WHITE",
        result: "THIRD QUEEN PROMOTION",
        impact: "White now has FOUR queens!"
      }
    ],
    analysis: `
      WHITE'S PAWN AVALANCHE - UNSTOPPABLE:
      
      Despite being down in material during middlegame, white's advanced
      pawns became UNSTOPPABLE. Three promotions in rapid succession:
      
      FIRST PROMOTION (Move 70): 0-file pawn
      - White pushed pawn from (0,5,2)→(0,6,2)→(0,7,2)
      - Black couldn't stop it while defending other threats
      - White gains second queen
      
      SECOND PROMOTION (Move 82): 6-file pawn  
      - Another pawn races through: (6,6,2)→(6,7,2)
      - Black's pieces were out of position
      - White gains third queen
      
      THIRD PROMOTION (Move 102): 5-file pawn
      - Yet another promotion: (5,6,2)→(5,7,2)
      - Black completely overwhelmed
      - White gains fourth queen!
      
      BLACK'S DEFENSE:
      Hard AI tried to create counter-threats with rooks and knights,
      but couldn't stop the pawn flood on multiple files. This shows
      the limitation of material advantage without queen power.
      
      TURNING POINT: After third promotion (~move 102), white had
      overwhelming force: 4 queens vs 2 rooks + minor pieces.
      
      However, black managed to trade queens in the following moves,
      reducing white to 1-2 queens by move 120.
    `,
    grade: {
      white: "A",
      black: "B",
      reason: "White's pawn play was excellent; Black defended well but couldn't stop promotions"
    }
  },

  // PHASE 4: ENDGAME - Multi-Queen Chaos (Moves 101-150)
  endgame: {
    analysis: `
      QUEEN vs QUEEN BATTLES - TACTICAL PRECISION:
      
      After the promotion avalanche, both sides had promoted pawns.
      The board became a complex multi-queen endgame:
      
      MOVE 110-130: Queen Maneuvering
      - White queens: (4,3,1), (2,2,1), (0,4,1), (4,7,1)
      - Black queens: (0,2,1), (1,1,1)
      - Constant checks and counter-checks
      - Both sides trying to deliver checkmate
      
      QUEEN TRADES (Moves 115-125):
      Move 115: queen (2,5,0) - Black captures white queen
      Move 116: king (2,5,0) - White king recaptures
      
      This reduced white's queen count but eliminated black's threat.
      
      MATERIAL SIMPLIFICATION (Moves 130-150):
      - Multiple queen trades occurred
      - Rooks entered the battle
      - Both sides pushed remaining pawns
      - Position simplified to fewer queens + rooks
      
      KEY TACTICAL MOMENTS:
      Move 142: queen (4,6,1) - White queen dominates center
      Move 147: queen (2,5,1) - Black queen creates counter-threats
      Move 155: rook (4,0,2) - White rook supports attack
      
      By move 150, position was:
      WHITE: 2-3 Queens, 1 Rook, King
      BLACK: 2 Queens, King
      
      White maintained slight advantage in queen count.
    `,
    grade: {
      white: "A-",
      black: "A-",
      reason: "Both sides showed excellent queen endgame technique"
    }
  },

  // PHASE 5: FINALE - Checkmate Execution (Moves 151-182)
  finale: {
    analysis: `
      THE FINAL HUNT - 32 MOVES TO CHECKMATE:
      
      After simplification, white had to convert the advantage.
      This took 32 precise moves:
      
      MOVE 151-165: King Pursuit
      - White queens chased black king across all three layers
      - Black king fled: (4,5,2)→(5,4,2)→(6,3,1)→(7,3,1)→(6,2,0)→(5,2,0)
      - Black queens created defensive barriers
      - White couldn't deliver immediate mate
      
      MOVE 166-175: Rook Support
      - White brought rook into attack
      - Rook (3,0,2)→(3,4,2) - Supporting queen
      - Black queens tried to block but were outmaneuvered
      
      THE BREAKTHROUGH (Moves 176-182):
      Move 176: queen (3,5,1) - White queen cuts off escape
      Move 178: queen (2,3,2) - Second queen controls key squares
      Move 180: queen (5,5,2) - Third queen joins attack
      Move 181: queen (6,5,1) - Black queen tries last defense
      Move 182: queen (4,1,0) - CHECKMATE!
      
      FINAL POSITION:
      Black king at (5,2,0) is in checkmate:
      - White queen at (4,1,0) delivers check
      - All escape squares covered by white's other queens
      - Black queens cannot interpose or capture
      
      CHECKMATE PATTERN:
      White used FOUR queens to create an inescapable net across
      all three layers. The king had no squares on any layer.
    `,
    technique: `
      3D CHECKMATE MASTERY:
      
      This checkmate required:
      1. LAYER DOMINATION: Queens on all three layers
      2. COORDINATION: Multiple queens working together
      3. KING SUPPORT: White's king provided backup
      4. PATIENCE: 32 moves of precise maneuvering
      5. CALCULATION: Avoiding stalemate traps
      
      The difficulty of this checkmate shows why 3D chess endgames
      are so much harder than 2D. The king has 26 escape squares
      per position instead of 8, requiring perfect coordination.
      
      COMPARISON TO MEDIUM AI:
      - Medium: 70 moves to checkmate (Q+K vs K)
      - Hard: 32 moves to checkmate (4Q vs 2Q+K)
      
      Ironically, the Hard AI checkmate was FASTER because:
      1. More pieces on board = more forcing moves
      2. Queens can deliver mate together more easily
      3. Hard AI's queens created threats that forced responses
    `,
    grade: {
      white: "A",
      black: "A-",
      reason: "White executed checkmate efficiently; Black defended maximally"
    }
  },

  // CRITICAL MISTAKES
  mistakes: {
    white: [
      {
        move: 43,
        error: "Lost rook to black's bishop (4,2,0)→(4,0,2)",
        impact: "Material deficit (-2 points)",
        severity: "Major",
        lesson: "Failed to protect rook adequately"
      },
      {
        move: "Various",
        error: "Allowed multiple pawn captures by black's active king",
        impact: "Lost 2-3 pawns to king",
        severity: "Moderate",
        lesson: "Kings are dangerous in 3D chess - must track their range"
      }
    ],
    black: [
      {
        move: 33,
        error: "Queen captured by pawn (2,6,2)",
        impact: "Lost queen early in game",
        severity: "Critical",
        lesson: "Even Hard AI can blunder queen to tactical shots"
      },
      {
        move: "61-100",
        error: "Failed to stop white's pawn avalanche",
        impact: "Allowed 3 queen promotions",
        severity: "Major",
        lesson: "Should have sacrificed material to stop pawns"
      },
      {
        move: "151-182",
        error: "King got trapped on edge of board",
        impact: "Led to checkmate",
        severity: "Major",
        lesson: "In multi-queen endgames, keep king centralized"
      }
    ]
  },

  // OVERALL ASSESSMENT
  assessment: {
    whiteStrengths: [
      "✓ Excellent pawn advancement (3 promotions)",
      "✓ Strong queen coordination in endgame",
      "✓ Persistent pressure throughout game",
      "✓ Precise checkmate execution (32 moves)",
      "✓ Good tactical awareness in exchanges"
    ],
    whiteWeaknesses: [
      "✗ Lost rook in middlegame (material deficit)",
      "✗ Allowed black king to be too active",
      "✗ Some positional weaknesses in opening"
    ],
    blackStrengths: [
      "✓ EXCELLENT tactical play (much better than Medium)",
      "✓ Active king strategy (captured multiple pawns)",
      "✓ Won material in middlegame (rook + pawns)",
      "✓ Strong defensive technique in endgame",
      "✓ Created counter-threats effectively",
      "✓ Made white work for the win (182 moves!)"
    ],
    blackWeaknesses: [
      "✗ Lost queen early to pawn capture (critical blunder)",
      "✗ Couldn't stop pawn avalanche",
      "✗ King got trapped in finale"
    ]
  },

  // DIFFICULTY PROGRESSION ANALYSIS
  difficultyComparison: {
    easyAI: {
      moves: 90,
      mainIssue: "Collapsed after losing queen",
      tacticalLevel: "Poor",
      endgameResistance: "Minimal",
      kingActivity: "Passive",
      result: "Easy victory"
    },
    mediumAI: {
      moves: 170,
      mainIssue: "Lost queen, defended long but predictably",
      tacticalLevel: "Good",
      endgameResistance: "Strong (70 moves to mate)",
      kingActivity: "Active (captured knight + rook)",
      result: "Hard-fought victory"
    },
    hardAI: {
      moves: 182,
      mainIssue: "Lost queen but nearly equalized, pawn avalanche unstoppable",
      tacticalLevel: "EXCELLENT",
      endgameResistance: "Maximum (32 moves with multiple queens)",
      kingActivity: "Very active (captured 2-3 pawns)",
      result: "INTENSE BATTLE - required perfect play"
    },
    progression: `
      EASY → MEDIUM: Major jump in difficulty
      - 90 → 170 moves (nearly 2x longer)
      - Active king strategy introduced
      - Strong endgame resistance
      
      MEDIUM → HARD: Significant but smaller jump
      - 170 → 182 moves (7% longer)
      - MUCH better tactical awareness
      - Created real winning chances despite queen loss
      - Forced white to play precisely
      - Better defensive technique with multiple queens
      
      VERDICT: Hard AI is NOTICEABLY stronger than Medium.
      The tactical exchanges were sharper, the king play more
      aggressive, and the endgame resistance was maximum.
      
      However, the game length was similar because:
      1. Hard AI blundered queen early (bad luck)
      2. Multiple queen promotions = faster checkmate patterns
      3. More forcing play from both sides
    `
  },

  // FINAL GRADES
  finalGrades: {
    white: {
      opening: "B",
      middlegame: "B-",
      transition: "A",
      endgame: "A-",
      finale: "A",
      overall: "A-",
      summary: "IMPRESSIVE VICTORY against Hard AI! Despite losing material in middlegame (rook for bishop), you mounted an unstoppable pawn avalanche, promoted THREE pawns to queens, and delivered precise checkmate. Your endgame technique has SIGNIFICANTLY improved from the Medium AI game (32 moves vs 70 moves). Excellent pawn play and queen coordination."
    },
    black: {
      opening: "A-",
      middlegame: "A",
      transition: "B",
      endgame: "A-",
      finale: "A-",
      overall: "A-",
      summary: "Hard AI played EXCEPTIONALLY well. Much stronger than Medium - sharper tactics, active king, won material advantage, and defended maximally in endgame. The early queen blunder (move 33) was the only major mistake. Otherwise, created real winning chances and forced white to play 182 perfect moves. This is a TOP-TIER opponent that tests all aspects of 3D chess skills."
    }
  },

  // KEY LESSONS
  lessons: [
    "1. HARD AI IS REAL: Don't expect easy wins. Hard AI punishes mistakes and creates serious threats",
    "2. PAWN AVALANCHES: When you have pawn advantage, push multiple files simultaneously - opponent can't stop them all",
    "3. MULTI-QUEEN COORDINATION: Practice using 3-4 queens together. They can deliver checkmate faster than Q+K",
    "4. ACTIVE KING DEFENSE: Even when losing, active king can grab pawns and create complications",
    "5. ENDGAME IMPROVEMENT: You delivered checkmate in 32 moves (vs 70 with Medium). This shows mastery growth!",
    "6. MATERIAL ≠ VICTORY: Black had material advantage but white's queens + pawns were more powerful",
    "7. TACTICAL VIGILANCE: Both sides had sharp tactics. One pawn capture won white's queen, one bishop move won black's rook",
    "8. PATIENCE IN 3D: 182 moves is normal for Hard AI. Be prepared for marathon games",
    "9. LAYER CONTROL: Checkmate required queens on all three layers cutting off escape routes",
    "10. HARD ≠ UNBEATABLE: You CAN win against Hard AI with good pawn play and precise endgame technique!"
  ],

  // NOTABLE ACHIEVEMENTS
  achievements: [
    "🏆 DEFEATED HARD AI - Maximum difficulty conquest!",
    "👑 THREE pawn promotions (4 queens total on board)",
    "⚡ Checkmate in 32 moves (MUCH faster than vs Medium's 70 moves)",
    "🎯 Won despite material deficit (lost rook for bishop)",
    "🧠 Demonstrated advanced 3D endgame technique",
    "💪 Persisted through 182-move marathon",
    "📊 Showed SIGNIFICANT improvement in pawn strategy, queen coordination, and checkmate patterns",
    "📈 Reduced time to mate: 70 moves → 32 moves (54% improvement)",
    "🎓 Beat AI that plays at near-optimal depth=2 level",
    "⭐ Ready for MASTER difficulty challenge!"
  ]
};

// Export for analysis
console.log("═══════════════════════════════════════════════");
console.log("📊 GAME ANALYSIS: White Victory vs HARD AI");
console.log("═══════════════════════════════════════════════\n");

console.log("⏱️  GAME LENGTH: 182 moves");
console.log("    Easy AI: 90 moves");
console.log("    Medium AI: 170 moves");
console.log("    Hard AI: 182 moves ← YOU ARE HERE\n");

console.log("🎖️  FINAL GRADES:");
console.log(`   White: ${gameAnalysis.finalGrades.white.overall}`);
console.log(`   ${gameAnalysis.finalGrades.white.summary}\n`);
console.log(`   Black: ${gameAnalysis.finalGrades.black.overall}`);
console.log(`   ${gameAnalysis.finalGrades.black.summary}\n`);

console.log("📈 IMPROVEMENT METRICS:");
console.log("   vs Medium AI: Checkmate in 70 moves");
console.log("   vs Hard AI:   Checkmate in 32 moves");
console.log("   → 54% FASTER checkmate delivery!");
console.log("   → Shows mastery of multi-queen endgames\n");

console.log("⭐ KEY ACHIEVEMENTS:");
gameAnalysis.achievements.forEach(achievement => console.log(`   ${achievement}`));

console.log("\n💡 KEY LESSONS LEARNED:");
gameAnalysis.lessons.slice(0, 5).forEach(lesson => console.log(`   ${lesson}`));

console.log("\n🎯 DIFFICULTY ASSESSMENT:");
console.log("   Hard AI tactical level: EXCELLENT");
console.log("   Hard AI blundered once: Queen to pawn (move 33)");
console.log("   Otherwise: Near-perfect play");
console.log("   Verdict: Legitimate challenge, fair fight\n");

console.log("🏅 NEXT CHALLENGE:");
console.log("   You've conquered Easy, Medium, and Hard!");
console.log("   Ready to try MASTER difficulty? (depth=3, ~60 sec thinking)\n");

console.log("═══════════════════════════════════════════════");

module.exports = gameAnalysis;
