/**
 * GAME 9 ANALYSIS: The Great Escape - Draw by Repetition
 * Date: January 4, 2026
 * Player: White (Human) vs Black (AI - Medium)
 * Result: Draw by threefold repetition
 * Grade: C- (Survived disaster through persistence)
 * 
 * STRATEGIC SUMMARY:
 * A dramatic game where White fell into a devastating tactical trap early,
 * lost material catastrophically, but managed to force a draw through
 * perpetual checking threats. Black dominated materially but couldn't
 * convert the advantage into checkmate.
 * 
 * Key Theme: "Survival Mode" - When losing badly, create complications
 */

const moveList = [
  { move: 1, white: "pawn (3,1,2)→(3,3,2)", black: "pawn (3,6,0)→(3,4,0)", 
    commentary: "Classical central pawn confrontation. Both players stake claim to the center." },
  
  { move: 2, white: "pawn (4,1,2)→(4,2,2)", black: "bishop (5,7,0)→(3,5,2)", 
    commentary: "White plays cautiously with e3. Black develops bishop AGGRESSIVELY to layer 2 - already playing 3D!" },
  
  { move: 3, white: "knight (1,0,2)→(2,2,2)", black: "rook (7,7,0)→(7,7,1)", 
    commentary: "White develops normally. Black lifts rook to layer 1 - unusual but creative." },
  
  { move: 4, white: "bishop (2,0,2)→(3,1,2)", black: "bishop (2,7,0)→(4,5,2)", 
    commentary: "White develops bishop. Black's second bishop jumps to layer 2 - both bishops dominating 3D space!" },
  
  { move: 5, white: "queen (3,0,2)→(4,1,2)", black: "rook (0,7,0)→(0,7,2)", 
    commentary: "White brings queen out early (risky). Black lifts queenside rook to layer 2 - excellent vertical mobility." },
  
  { move: 6, white: "O-O-O", black: "knight (1,7,0)→(1,5,1)", 
    commentary: "White castles queenside (INTO danger zone!). Black develops knight to layer 1." },
  
  { move: 7, white: "pawn (3,3,2)→(3,4,2)", black: "bishop (4,5,2)→(4,4,1)", 
    commentary: "White pushes d5. Black repositions bishop to layer 1 - building attack web." },
  
  { move: 8, white: "knight (2,2,2)→(1,4,2)", black: "bishop (3,5,2)→(4,4,2)", 
    commentary: "White knight to b5. Black concentrates both bishops on e5 position (layers 1&2)." },
  
  { move: 9, white: "knight (6,0,2)→(5,2,2)", black: "bishop (4,4,2)→(2,2,0)", 
    commentary: "⚠️ CRITICAL MISTAKE! White develops passively. Black's bishop delivers CHECK from layer 0 via 3D diagonal! The king safety crisis begins." },
  
  { move: 10, white: "bishop (3,1,2)→(2,1,1)", black: "bishop (2,2,0)→(2,1,1)", 
    commentary: "White blocks with bishop. Black CAPTURES it! Material down, White's position collapses." },
  
  { move: 11, white: "king (2,0,2)→(2,1,1)", black: "queen (3,7,0)→(2,6,1)", 
    commentary: "White's king FORCED to c2 layer 1 (very exposed!). Black brings queen into the attack - mobilizing all pieces." },
  
  { move: 12, white: "king (2,1,1)→(2,0,2)", black: "knight (1,5,1)→(2,3,1)", 
    commentary: "King retreats to c1. Black's knight joins the hunt on layer 1 - White is surrounded." },
  
  { move: 13, white: "pawn (3,4,2)→(3,5,2)", black: "king (4,7,0)→(4,6,1)", 
    commentary: "White desperately pushes d6 (counter-threat). Black calmly walks king up to layer 1 - no fear!" },
  
  { move: 14, white: "knight (1,4,2)→(2,6,2)", black: "king (4,6,1)→(4,5,1)", 
    commentary: "White's knight attacks. Black's king continues forward - confidence!" },
  
  { move: 15, white: "knight (2,6,2)→(0,7,2)", black: "bishop (4,4,1)→(1,1,1)", 
    commentary: "✅ White captures Black's rook on a6! Finally some material back. Black's bishop attacks the b2 pawn." },
  
  { move: 16, white: "king (2,0,2)→(3,1,2)", black: "queen (2,6,1)→(3,5,2)", 
    commentary: "King moves to d2. Black's queen CAPTURES the d6 pawn - neutralizing White's threat." },
  
  { move: 17, white: "knight (5,2,2)→(3,3,2)", black: "queen (3,5,2)→(1,3,2)", 
    commentary: "White's knight centralizes. Black's queen attacks from b4 - relentless pressure." },
  
  { move: 18, white: "pawn (2,1,2)→(2,2,2)", black: "queen (1,3,2)→(1,1,2)", 
    commentary: "White tries c3 defense. Black's queen CAPTURES b2 pawn - eating everything!" },
  
  { move: 19, white: "knight (3,3,2)→(2,1,2)", black: "queen (1,1,2)→(2,1,2)", 
    commentary: "White sacrifices knight to c2 for defense. Black's queen EATS IT - material advantage massive!" },
  
  { move: 20, white: "king (3,1,2)→(4,0,2)", black: "queen (2,1,2)→(2,2,2)", 
    commentary: "King flees to e1. Black's queen CAPTURES c3 pawn - White has almost nothing left!" },
  
  { move: 21, white: "queen (4,1,2)→(3,1,2)", black: "bishop (1,1,1)→(2,2,0)", 
    commentary: "White's queen finally activates. Black's bishop repositions to layer 0 - controlling space." },
  
  { move: 22, white: "king (4,0,2)→(4,1,2)", black: "queen (2,2,2)→(2,3,2)", 
    commentary: "King to e2. Black's queen moves to c4 - maintaining dominance." },
  
  { move: 23, white: "king (4,1,2)→(5,2,2)", black: "queen (2,3,2)→(4,3,2)", 
    commentary: "King to f3. Black's queen CHECK from e4! The hunt continues." },
  
  { move: 24, white: "king (5,2,2)→(4,1,2)", black: "queen (4,3,2)→(2,3,2)", 
    commentary: "King back to e2. Queen returns to c4." },
  
  { move: 25, white: "king (4,1,2)→(5,2,2)", black: "queen (2,3,2)→(4,3,2)", 
    commentary: "🔁 THREEFOLD REPETITION! King to f3, queen to e4 - same position third time. DRAW!" }
];

const keyMoments = {
  criticalMistake: {
    move: 9,
    description: "Black's bishop check from layer 0 started the collapse",
    lesson: "In 3D chess, bishops control diagonal planes across ALL three dimensions. The (2,2,0)→(2,0,2) diagonal was lethal."
  },
  
  tacticalCrisis: {
    moves: [10, 11, 12],
    description: "White lost bishop, king exposed on layer 1, queen and knight joining attack",
    lesson: "Queenside castling was premature with Black's pieces already controlling layers 0-2."
  },
  
  desperateCounterplay: {
    move: 15,
    description: "Knight captures rook - finally winning material",
    lesson: "Even when losing badly, look for tactical shots. The rook on a6 was undefended."
  },
  
  grindingDefense: {
    moves: [20, 21, 22],
    description: "White down bishop, 2 knights, 3 pawns - utterly lost materially",
    materialBalance: "Black: +9 points (bishop + 2 knights + 3 pawns vs rook)",
    lesson: "When checkmate seems inevitable, create complications and repetitions."
  },
  
  perpetualCheck: {
    moves: [23, 24, 25],
    description: "Black's queen checking from e4, but can't break through for checkmate",
    lesson: "Material advantage means nothing if you can't deliver checkmate. White's king found a safe square pattern."
  }
};

const openingAnalysis = {
  whitesApproach: "Solid central pawn play (d4, e3) but too slow in development",
  blacksApproach: "Hypermodern 3D strategy - bishops and rooks to upper/lower layers immediately",
  criticalWeakness: "White castled queenside directly into Black's piece concentration",
  grade: "White: D-, Black: B+ (excellent 3D tactical vision)"
};

const middlegameAnalysis = {
  whitesPlay: "Reactive and defensive after move 9 - lost material and tempo constantly",
  blacksPlay: "Dominant tactical execution - bishop check, queen invasion, material harvest",
  turningPoint: "Move 15 - White's knight captures rook gave slight hope",
  evaluation: "Black should be winning easily with +9 material advantage"
};

const endgameAnalysis = {
  position: "Black has queen, 2 bishops, knight vs White's queen and knight",
  technique: "Black tried to deliver checkmate but couldn't find the killing blow",
  whitesDefense: "King oscillated between e2 and f3, creating repetition",
  blacksMissedWin: "With careful play, Black should convert this. Queen + bishops should coordinate for mate",
  result: "Draw by threefold repetition - frustrating for Black, fortunate for White"
};

const lessonsLearned = {
  forWhite: [
    "❌ DON'T castle into opponent's piece activity (queenside was dangerous)",
    "❌ In 3D chess, bishops on different layers can deliver unexpected checks",
    "❌ Passive development (move 9) allowed Black's tactical blow",
    "✅ Even when losing badly, look for counter-threats (knight takes rook)",
    "✅ In desperate positions, repetition draws are a lifeline",
    "⚠️ Your king made 9 moves in 25 total moves - this is a sign of disaster"
  ],
  
  forBlack: [
    "✅ Excellent 3D piece coordination - bishops and rooks on multiple layers",
    "✅ Tactical execution was superb (bishop check, material win)",
    "✅ Dominated the game from move 9 onward",
    "❌ Failed to convert massive material advantage (+9!) into checkmate",
    "❌ Allowed perpetual check pattern instead of finding forced mate",
    "⚠️ With queen + 2 bishops vs queen + knight, there IS a winning technique"
  ]
};

const overallAssessment = {
  gameQuality: "Tactically sharp early, technically poor endgame",
  whitePerformance: "C- (Survived a disaster through stubbornness, but played poorly)",
  blackPerformance: "B- (Brilliant tactics, weak technique - should have won)",
  
  keyQuote: "White didn't earn a draw - Black failed to win it. With +9 material, Black needed better endgame conversion.",
  
  improvementAreas: {
    forWhite: "King safety awareness, faster development, understanding 3D bishop diagonals",
    forBlack: "Endgame technique with material advantage - don't allow perpetual checks"
  },
  
  mostInstructiveMoment: "Move 9 - The 3D diagonal bishop check that changed everything. This is classic 3D chess tactics!"
};

console.log("=== GAME 9: THE GREAT ESCAPE ===");
console.log("Result: Draw by repetition");
console.log("White Grade: C- (Survived catastrophe)");
console.log("Black Grade: B- (Dominated but couldn't finish)");
console.log("\nMaterial at end: Black +9 points (should be winning!)");
console.log("\nKey lesson: Perpetual checking rights can save hopeless positions!");

module.exports = {
  moveList,
  keyMoments,
  openingAnalysis,
  middlegameAnalysis,
  endgameAnalysis,
  lessonsLearned,
  overallAssessment
};
