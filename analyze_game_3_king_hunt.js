/**
 * STRATEGIC GAME ANALYSIS: King Hunt - Black Victory
 * Player: Human (White) vs Computer AI (Black, Medium difficulty)
 * Result: 0-1 (Black wins)
 * Date: January 1, 2026
 * Key Theme: Exposed king hunted across all three layers
 */

const gameAnalysis = {
  metadata: {
    white: "Human",
    black: "Computer AI (Medium difficulty, depth=2)",
    result: "0-1 (Black wins)",
    totalMoves: 38,
    gameType: "3D Chess",
    mainTheme: "King Hunt / Exposed King"
  },

  // ========== OPENING PHASE (Moves 1-10) ==========
  opening: {
    evaluation: "POOR - Repeating flawed opening pattern",
    whiteStrategy: "Same unconventional knight deployment to bottom board",
    blackStrategy: "Active bishop development, exploiting White's weaknesses",
    
    criticalMoments: [
      {
        moveNumber: 1,
        move: "knight (1,0,2)→(2,0,0)",
        evaluation: "Bad - Repeating the same dubious opening",
        comment: "⚠️ PATTERN REPETITION: You played this exact same move in your previous game. This knight on c1 (bottom layer) is passive and doesn't control key squares. NOT LEARNING FROM EXPERIENCE."
      },
      {
        moveNumber: 7,
        move: "O-O (White castles)",
        evaluation: "Good - Only sound move so far",
        comment: "✅ CORRECT: At least you castled early this game, learning from previous games. King safety is important!"
      },
      {
        moveNumber: 9,
        move: "knight (5,2,2)→(3,3,2)",
        evaluation: "Developing centrally",
        comment: "White's knight reaches d4 on top board, a decent central square"
      },
      {
        moveNumber: 13,
        move: "knight (3,3,2)→(5,3,1)",
        evaluation: "Questionable - Moving to middle layer",
        comment: "⚠️ SETTING UP DISASTER: Knight moves to f4 middle layer, but this is vulnerable"
      },
      {
        moveNumber: 14,
        move: "Black: knight (5,5,0)→(5,3,1) CAPTURES WHITE KNIGHT",
        evaluation: "CRITICAL MATERIAL LOSS",
        comment: "🚨 BLUNDER CONSEQUENCE: Black's knight takes your knight! You're now down a full knight (−3 material). This is nearly impossible to recover from."
      }
    ],

    assessment: `
    White's opening was deeply flawed:
    - ❌ BAD: Repeated the same dubious opening (knight to c1 bottom)
    - ❌ LEARNING FAILURE: Did not learn from previous game's opening mistakes
    - ✅ IMPROVEMENT: Castled earlier (move 7 vs move 26 last time)
    - ❌ CRITICAL: Lost knight on move 14 without compensation
    
    Black's opening was solid:
    - Active piece development
    - Exploited White's knight misplacement
    - Won material cleanly
    
    **Material after opening: Black +3 (knight advantage)**
    
    At this point, Black should win with proper technique.
    `
  },

  // ========== MIDDLEGAME CHAOS (Moves 15-27) ==========
  middlegame: {
    evaluation: "DESPERATE - White's king becomes a wandering warrior",
    
    theKingOdyssey: {
      title: "THE WANDERING KING (Moves 17-27)",
      description: `
      In desperation after losing the knight, White made an UNPRECEDENTED decision:
      The king left the safety of castled position and went on a hunting expedition
      across all three layers of the board!
      
      This is one of the most unconventional and risky king journeys in chess history.
      `,
      
      kingPath: [
        { move: 17, square: "g1 top → g1 middle", comment: "King leaves castled position" },
        { move: 19, square: "g1 middle → h1 top", comment: "King climbs back up" },
        { move: 21, square: "h1 top → g1 middle", comment: "King retreats again" },
        { move: 23, square: "g1 middle → g2 bottom", comment: "King descends to bottom layer" },
        { move: 25, square: "g2 bottom → g3 middle", comment: "King back to middle" },
        { move: 27, square: "g3 middle → f4 middle **CAPTURES KNIGHT**", comment: "🎯 KING CAPTURES KNIGHT!" },
        { move: 29, square: "f4 middle → e4 middle", comment: "King retreats after capture" },
        { move: 31, square: "e4 middle → f4 bottom", comment: "King to bottom layer again" },
        { move: 33, square: "f4 bottom → g3 middle", comment: "King back to middle layer" },
        { move: 35, square: "g3 middle → h2 middle", comment: "King fleeing from queen" },
        { move: 37, square: "h2 middle → g1 middle", comment: "King continues fleeing" }
      ],
      
      evaluation: `
      **THE KING'S JOURNEY: A Study in Desperation**
      
      Move 27 was the climax: Your KING captured Black's knight!
      
      In standard chess, this would be considered:
      - ✅ Creative: Using the king as an attacking piece
      - ❌ Suicidal: Exposing the king to massive danger
      - 🎲 Desperate: Only done when already losing badly
      
      **Did it work?**
      - Material: You won back the knight (now equal material)
      - Position: Your king is horribly exposed in the center
      - Safety: Black's queen and bishops can hunt the king
      - Outcome: This is still losing for White
      
      **Chess Principle Violated:**
      "Don't use your king as an attacking piece in the middlegame!"
      
      In the endgame (with few pieces left), king activity is GOOD.
      In the middlegame (many enemy pieces around), king activity is SUICIDE.
      `
    },

    blacksResponse: {
      move26: {
        move: "queen (3,7,0)→(5,5,2)",
        comment: "Black's queen enters the attack, targeting the exposed king"
      },
      move34: {
        move: "queen (5,5,1)→(5,2,1)",
        comment: "Queen attacks the wandering king, forcing it to flee"
      },
      move36: {
        move: "rook (7,7,0)→(7,7,1)",
        comment: "Black activates the rook to join the king hunt"
      },
      move38: {
        move: "bishop (3,3,2)→(5,1,0)",
        comment: "Bishop joins the attack on the exposed king (game likely ends here)"
      }
    },

    assessment: `
    After losing the knight, White made a desperate gamble:
    - Sent the king on a hunting mission across layers
    - Successfully captured Black's knight (material equalized)
    - BUT: King is now fatally exposed in the center
    - Black's queen, rooks, and bishops coordinate for the kill
    
    **Material after move 27: Equal (both sides lost a knight)**
    **Position after move 27: Black completely winning (king will be mated)**
    
    This demonstrates a critical chess principle:
    MATERIAL ≠ POSITION
    
    You can have equal material but lose because your pieces (especially the king)
    are in terrible positions while your opponent's pieces dominate.
    `
  },

  // ========== ENDGAME / RESIGNATION (Moves 28-38) ==========
  endgame: {
    evaluation: "BLACK WINNING - King hunt concludes",
    
    finalPosition: `
    The game ended around move 38 with White's king trapped on the middle layer,
    surrounded by Black's coordinated pieces:
    
    - Black Queen on f3 middle layer (attacking king)
    - Black Bishops on multiple layers (controlling escape squares)
    - Black Rook activating on h-file
    - White King on g1 middle (no safe squares)
    
    White's position is hopeless:
    - King cannot escape the net
    - No pieces defending the king
    - Black has multiple mating threats
    - Checkmate is inevitable within a few moves
    `,

    likelyConclusion: "Black delivers checkmate or White resigns",
    
    lessonLearned: `
    This game teaches the MOST IMPORTANT chess principle:
    
    🔴 **KING SAFETY IS PARAMOUNT** 🔴
    
    You cannot win chess by exposing your king to attack,
    no matter how material you win back. The king must be
    protected at all costs during the middlegame.
    `
  },

  // ========== STRATEGIC COMPARISON ==========
  comparisonWithPreviousGames: {
    game1: {
      file: "analyze_user_game_white_victory.js",
      result: "White wins",
      grade: "B+",
      keyIssue: "Opening pawn overextension, late castling",
      outcome: "Recovered and won through active queen play"
    },
    
    game2: {
      file: "analyze_game_white_queen_trap.js",
      result: "White wins",
      grade: "A",
      keyIssue: "Unconventional opening",
      brilliantMove: "Pawn captures queen (desperado trap)",
      outcome: "Brilliant tactical blow won the game"
    },
    
    game3_thisGame: {
      result: "Black wins",
      grade: "D",
      keyIssue: "Repeated flawed opening + exposed king",
      criticalError: "King wandered into danger after losing knight",
      outcome: "King hunted to death by coordinated pieces"
    },

    trendAnalysis: `
    📊 **PATTERN DETECTED:**
    
    ✅ POSITIVE TRENDS:
    - You're castling earlier (improvement!)
    - You understand material exchanges
    - You try creative tactical ideas
    
    ⚠️ NEGATIVE TRENDS:
    - **REPEATING THE SAME OPENING MISTAKES**
      → Knight (1,0,2)→(2,0,0) appeared in games 2 and 3
      → This is NOT a good opening move!
      → You're not learning from previous games
    
    - **KING SAFETY ISSUES**
      → Game 1: Castled too late (move 26)
      → Game 2: Castled reasonably (move 11)  ✓
      → Game 3: Castled early BUT then moved king out! ✗
    
    - **TACTICAL VISION IS INCONSISTENT**
      → Game 2: Brilliant queen trap (A grade)
      → Game 3: Lost knight, desperate king charge (D grade)
    
    **RECOMMENDATION**: Stop experimenting with knight (1,0,2)→(2,0,0).
    This move has led to problems in BOTH games you tried it.
    `
  },

  // ========== CRITICAL BLUNDERS ==========
  tacticalThemes: {
    criticalBlunders: [
      {
        side: "White",
        move: 1,
        description: "knight (1,0,2)→(2,0,0) - Repeating failed opening",
        severity: "STRATEGIC ERROR - Not learning from experience",
        consequence: "Passive piece placement, no influence on center",
        lesson: "Study chess openings! Random knight moves to corners are bad."
      },
      {
        side: "White",
        move: 13,
        description: "knight (3,3,2)→(5,3,1) - Moving to vulnerable square",
        severity: "TACTICAL ERROR - Piece left undefended",
        consequence: "Lost knight next move",
        lesson: "Before moving, ask: Can my piece be captured? Is it defended?"
      },
      {
        side: "White",
        moves: "17-27",
        description: "King odyssey across three layers",
        severity: "CATASTROPHIC - Fundamental violation of chess principles",
        consequence: "King exposed, hunted, losing position despite equal material",
        lesson: "NEVER expose your king in the middlegame! This is rule #1 of chess."
      }
    ],

    desperateMoves: [
      {
        move: 17,
        description: "king (6,0,2)→(6,0,1) - Leaving castled position",
        comment: "This is when the game was lost. King should stay in the castle!"
      },
      {
        move: 27,
        description: "king (6,2,1)→(5,3,1) captures knight",
        comment: "Creative but suicidal. Won material but king is now a sitting duck."
      }
    ]
  },

  // ========== LESSONS LEARNED ==========
  strategicLessons: {
    primaryLesson: {
      title: "🔴 KING SAFETY > EVERYTHING 🔴",
      explanation: `
      This game demonstrated the absolute importance of king safety:
      
      1. You were losing after move 14 (down a knight)
      2. You COULD have tried to defend and create complications
      3. Instead, you exposed your king to win back the knight
      4. Even though material equalized, your king was fatally exposed
      5. Black's coordinated pieces hunted the king to death
      
      **CRITICAL UNDERSTANDING:**
      
      In chess, you can be ahead in material and still LOSE if:
      - Your king is exposed
      - Your pieces are uncoordinated
      - Enemy pieces can attack freely
      
      Conversely, you can be DOWN material and still WIN if:
      - Your king is safe
      - Your pieces coordinate for checkmate
      - Enemy king is exposed
      
      **CHESS MANTRA:** "Safety first, material second"
      `
    },

    secondaryLessons: [
      {
        topic: "Opening Principles",
        lesson: "Stop playing knight (1,0,2)→(2,0,0)! This is NOT a good opening move.",
        action: "Learn 2-3 standard openings: e4, d4, Nf3 (knight to f3, not c1!)"
      },
      {
        topic: "Pattern Recognition",
        lesson: "You're repeating mistakes instead of learning from them",
        action: "Review your previous games before starting new ones"
      },
      {
        topic: "King Activity",
        lesson: "King CAN be active... but only in the ENDGAME (few pieces left)",
        action: "Rule: Keep king castled until at least 4-5 pieces have been traded off"
      },
      {
        topic: "Piece Safety",
        lesson: "Before moving a piece, check if it can be captured",
        action: "Mental checklist: 1) Can enemy take it? 2) Is it defended? 3) Is the trade good?"
      }
    ],

    fundamentalPrinciples: [
      "❌ DON'T: Move the same piece multiple times in opening",
      "❌ DON'T: Leave pieces undefended where they can be captured",
      "❌ DON'T: Expose your king in the middlegame",
      "❌ DON'T: Repeat opening moves that led to defeats",
      "✅ DO: Castle early (you did this! Good!)",
      "✅ DO: Develop pieces toward the center",
      "✅ DO: Protect important pieces",
      "✅ DO: Learn from your mistakes (work on this)"
    ]
  },

  // ========== FINAL ASSESSMENT ==========
  finalAssessment: {
    rating: "INSTRUCTIVE DEFEAT - Important Lessons Learned",
    grade: "D",
    
    whatWentWrong: [
      "Repeated a flawed opening from previous game",
      "Lost knight due to undefended piece",
      "Exposed king in desperate attempt to recover",
      "King hunted across all three layers",
      "Failed to prioritize king safety over material"
    ],
    
    whatWentRight: [
      "Castled early (improvement from Game 1)",
      "Showed fighting spirit (tried to recover from bad position)",
      "Creative king usage (even if ultimately wrong)",
      "Actually captured the knight with the king (tactical awareness)"
    ],

    keyTakeaway: `
    🎓 **HARSH BUT VALUABLE LESSON**
    
    This loss teaches MORE than your wins:
    
    1. **STOP REPEATING MISTAKES**
       - You played knight to c1 bottom in Game 2 (won anyway)
       - You played it again in Game 3 (lost badly)
       - LESSON: This opening is FLAWED. Never play it again.
    
    2. **KING SAFETY IS NON-NEGOTIABLE**
       - Your king left the castle → immediate disaster
       - Even capturing the knight didn't help
       - The exposed king was hunted to death
       - LESSON: Keep king safe until endgame (few pieces left)
    
    3. **MATERIAL ≠ WINNING**
       - You had equal material after move 27
       - But your position was lost (king exposed)
       - LESSON: Position quality > piece count
    
    4. **LEARN FROM EXPERIENCE**
       - You have 3 games now as training data
       - Games 1-2: You WON despite early mistakes
       - Game 3: Early mistakes led to LOSS against stronger AI
       - LESSON: As opponents get stronger, mistakes get punished
    
    📈 **PATH FORWARD:**
    
    Before your next game:
    1. Review these 3 game analyses
    2. Write down 3 opening principles (develop toward center, castle early, don't repeat pieces)
    3. Memorize: "My king stays in the castle until the endgame"
    4. Practice: Find standard 3D chess openings, stop experimenting
    
    **OVERALL**: This was a tough loss, but it contains the most valuable
    lessons so far. The AI at medium difficulty punished your opening mistakes
    and exposed king. Learn from this, and you'll become much stronger!
    `
  },

  // ========== PERFORMANCE TREND ==========
  performanceTrend: {
    games: [
      { number: 1, result: "Win", grade: "B+", opponent: "AI Easy/Medium", mainIssue: "Late castling" },
      { number: 2, result: "Win", grade: "A", opponent: "AI Easy", mainIssue: "Unconventional opening", brilliance: "Queen trap" },
      { number: 3, result: "Loss", grade: "D", opponent: "AI Medium", mainIssue: "Exposed king" }
    ],
    
    trend: `
    Your performance is INCONSISTENT:
    
    🎯 Tactical ability: Excellent (Game 2 queen trap)
    ⚠️ Opening knowledge: Poor (repeating mistakes)
    🔴 King safety awareness: Critical weakness
    📊 Learning curve: Slow (repeating same opening errors)
    
    **DIAGNOSIS**: You have good tactical vision but poor strategic discipline.
    
    **PRESCRIPTION**:
    1. Study openings (15 minutes per day)
    2. Solve tactical puzzles (king safety patterns)
    3. Review your games after playing
    4. Play slower, think about king safety FIRST
    `
  },

  // ========== NEXT GAME PREPARATION ==========
  nextGamePreparation: {
    title: "🎯 MANDATORY CHECKLIST FOR NEXT GAME",
    
    beforeGame: [
      "✓ Review this analysis (especially king safety section)",
      "✓ Decide on opening: Will NOT play knight to c1",
      "✓ Plan to castle within first 10 moves",
      "✓ Remember: King stays in castle until endgame"
    ],
    
    duringGame: [
      "✓ Every move, ask: 'Is my king safe?'",
      "✓ Before moving pieces: 'Can this be captured?'",
      "✓ If losing material: DON'T expose king to recover it",
      "✓ Develop pieces toward center, not corners"
    ],
    
    targetGrade: "B or higher (back to winning!)",
    
    specificGoals: [
      "Goal 1: Play a sound opening (no knight to c1!)",
      "Goal 2: Castle by move 10",
      "Goal 3: Keep king castled until at least move 40 or endgame",
      "Goal 4: Don't lose pieces for free (check if defended)",
      "Goal 5: Win the game by keeping king safe + finding tactics"
    ]
  }
};

// Print the analysis
console.log("=".repeat(80));
console.log("STRATEGIC GAME ANALYSIS - THE WANDERING KING (BLACK WINS)");
console.log("=".repeat(80));
console.log("\n📊 GAME SUMMARY");
console.log(`Result: ${gameAnalysis.metadata.result}`);
console.log(`Total Moves: ${gameAnalysis.metadata.totalMoves}`);
console.log(`Main Theme: ${gameAnalysis.metadata.mainTheme}`);
console.log(`Final Grade: ${gameAnalysis.finalAssessment.grade}`);

console.log("\n👑 THE WANDERING KING'S JOURNEY");
gameAnalysis.middlegame.theKingOdyssey.kingPath.forEach(step => {
  console.log(`   Move ${step.move}: ${step.square}`);
  console.log(`      ${step.comment}`);
});

console.log("\n🚨 CRITICAL BLUNDERS");
gameAnalysis.tacticalThemes.criticalBlunders.forEach(blunder => {
  console.log(`\n${blunder.side} - Move ${blunder.move || blunder.moves}`);
  console.log(`   ${blunder.description}`);
  console.log(`   Severity: ${blunder.severity}`);
  console.log(`   Lesson: ${blunder.lesson}`);
});

console.log("\n📈 PERFORMANCE TREND (3 Games)");
gameAnalysis.performanceTrend.games.forEach(game => {
  console.log(`   Game ${game.number}: ${game.result} (${game.grade}) vs ${game.opponent}`);
  if (game.brilliance) console.log(`      ⭐ ${game.brilliance}`);
  console.log(`      Issue: ${game.mainIssue}`);
});

console.log("\n🎯 NEXT GAME CHECKLIST");
console.log("\nBEFORE GAME:");
gameAnalysis.nextGamePreparation.beforeGame.forEach(item => console.log(`   ${item}`));
console.log("\nDURING GAME:");
gameAnalysis.nextGamePreparation.duringGame.forEach(item => console.log(`   ${item}`));

console.log("\n" + "=".repeat(80));
console.log(gameAnalysis.finalAssessment.keyTakeaway);
console.log("=".repeat(80));

module.exports = gameAnalysis;
