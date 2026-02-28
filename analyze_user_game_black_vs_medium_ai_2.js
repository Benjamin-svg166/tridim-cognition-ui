/**
 * STRATEGIC GAME ANALYSIS: Black vs Medium AI (3D Chess)
 * Date: January 19, 2026
 * Result: BLACK WINS
 * Difficulty: Medium
 * Total Moves: 158 moves (79 full turns)
 * Game Type: Complex Tactical Battle
 */

const gameAnalysis = {
  metadata: {
    player: 'Black (Human)',
    opponent: 'White (Medium AI)',
    result: 'Black Victory',
    totalMoves: 158,
    difficultyLevel: 'Medium',
    gameLength: 'Long (79 turns)',
    gameType: 'Tactical Exchange Battle',
    keyFeature: 'Complex piece exchanges leading to queen endgame dominance'
  },

  openingPhase: {
    moves: '1-20',
    analysis: {
      blackStrategy: 'Aggressive knight and bishop development with layer jumping',
      whiteResponse: 'Mirror development but weaker positioning',
      
      keyMoments: [
        {
          move: 1,
          notation: 'knight (6,0,2)→(5,2,2)',
          significance: 'Solid knight development on layer 2',
          evaluation: 'Standard opening'
        },
        {
          move: 3,
          notation: 'bishop (2,0,2)→(4,2,0)',
          significance: 'Aggressive bishop jump from layer 2 to layer 0',
          evaluation: 'Excellent 3D exploitation'
        },
        {
          move: 6,
          notation: 'bishop (2,5,2)→(4,3,2) xwhite pawn',
          significance: 'First blood - Black bishop captures White pawn',
          evaluation: 'Material advantage +1'
        },
        {
          move: 9,
          notation: 'knight (3,4,0)→(2,2,0)',
          significance: 'Black knight infiltrates layer 0',
          evaluation: 'Deep penetration into White territory'
        },
        {
          move: 19,
          notation: 'knight (2,2,0)→(3,4,0) xblack knight',
          significance: 'Knight trade on layer 0',
          evaluation: 'Equal exchange but Black controls center'
        },
        {
          move: 20,
          notation: 'pawn (4,5,0)→(3,4,0) xwhite knight',
          significance: 'Black pawn recaptures knight',
          evaluation: 'Pawn advances into enemy territory'
        }
      ],
      
      materialCount: {
        blackAdvantage: '+1 pawn',
        captured: 'Black captured: 1 pawn, White captured: 0'
      },
      
      evaluation: 'Strong opening by Black with aggressive 3D bishop tactics and knight infiltration. White played defensively. Black gained material and central control.',
      grade: 'A- (Aggressive and effective, slight material edge)'
    }
  },

  earlyMiddlegame: {
    moves: '21-40',
    analysis: {
      queenTrade: {
        moves: [21, 22, 23],
        sequence: [
          'queen (3,0,2)→(5,2,0)',
          'queen (3,7,0)→(5,5,0)',
          'queen (5,2,0)→(5,5,0) xblack queen'
        ],
        continuation: 'pawn (6,6,0)→(5,5,0) xwhite queen',
        result: 'Both queens off the board by move 23',
        timing: 'Very early queen trade',
        evaluation: 'Equal trade, game transitions to complex middlegame'
      },

      bishopExchanges: {
        moves: [24, 25, 26],
        sequence: [
          'bishop (6,5,2)→(4,3,0)',
          'bishop (3,2,0)→(4,3,0) xblack bishop',
          'pawn (3,4,0)→(4,3,0) xwhite bishop'
        ],
        result: 'Bishops traded, Black pawn advances',
        evaluation: 'Black pawn becomes strong in center'
      },

      knightBattle: {
        moves: [29, 30, 31, 32],
        sequence: [
          'bishop (5,5,2)→(4,4,2)',
          'knight (2,4,1)→(4,4,2) xblack bishop',
          'pawn (0,6,0)→(0,4,0)',
          'knight (4,4,2)→(4,3,0) xblack pawn'
        ],
        result: 'White knight takes bishop then pawn',
        impact: 'White gains material (+2 points)',
        evaluation: 'Tactical blow - White gets bishop for pawn'
      },

      recovery: {
        moves: [35, 36, 37],
        sequence: [
          'knight (2,5,0)→(1,3,0)',
          'knight (3,4,0)→(1,3,0) xblack knight',
          'king (3,5,0)→(2,4,0)'
        ],
        result: 'Black recaptures knight',
        evaluation: 'Material equalizes, but position remains complex'
      }
    },
    
    evaluation: 'Intense tactical battle with multiple piece exchanges. Both sides traded queens early, then fought over material advantage. Position roughly equal after exchanges.',
    grade: 'B+ (Good tactical defense, recovered from material deficit)'
  },

  lateMiddlegame: {
    moves: '41-70',
    analysis: {
      materialStatus: {
        move41: 'Roughly equal material - knights, bishops, rooks, pawns',
        strategy: 'Both sides maneuvering for advantage'
      },

      pawnAdvance: {
        moves: [43, 44, 45],
        sequence: [
          'bishop (4,3,1)→(5,4,0) xblack pawn',
          'king (3,5,0)→(4,4,0)',
          'bishop (5,4,0)→(6,4,1)'
        ],
        result: 'White bishop captures Black pawn',
        evaluation: 'White gains pawn advantage'
      },

      knightRaid: {
        moves: [47, 48],
        sequence: [
          'knight (5,5,0)→(3,6,0) xblack pawn',
          'king (4,4,0)→(3,5,0)'
        ],
        result: 'White knight captures another Black pawn',
        evaluation: 'White now +2 pawns'
      },

      rookActivation: {
        moves: [53, 54],
        sequence: [
          'rook (2,0,0)→(2,5,0) xblack pawn',
          'rook (7,7,0)→(2,7,0)'
        ],
        result: 'White rook captures pawn, Black rook activates',
        evaluation: 'Rooks enter the game, White continues pawn collection'
      },

      knightAggression: {
        moves: [59, 60, 61],
        sequence: [
          'knight (5,5,0)→(7,6,0) xblack pawn',
          'queen (0,1,0)→(0,0,0) (Black promotes pawn!)',
          'knight (7,6,0)→(6,4,0)'
        ],
        significance: 'BLACK PAWN PROMOTES TO QUEEN!',
        timing: 'Move 60 - Black gets queen back',
        whiteResponse: 'Knight continues attacking',
        evaluation: 'Game-changing - Black has queen, White does not'
      },

      moreCaptures: {
        moves: [63, 64],
        sequence: [
          'knight (6,4,0)→(5,6,0) xblack pawn',
          'pawn (1,3,0)→(1,2,0)'
        ],
        result: 'White knight takes another pawn',
        evaluation: 'White knight very active, but Black has queen'
      }
    },
    
    evaluation: 'White dominated pawn collection with knight and bishop, capturing 5+ Black pawns. However, Black\'s pawn promotion to queen on move 60 shifted the balance. Queen vs minor pieces advantage.',
    grade: 'B (Allowed too many pawn captures, but critical promotion saved position)'
  },

  criticalTurningPoint: {
    moves: [67, 68, 69, 70],
    sequence: [
      'bishop (3,3,1)→(3,4,0)',
      'king (2,2,0)→(1,2,0)',
      'bishop (3,4,0)→(0,7,0) xblack rook',
      'rook (2,7,0)→(0,7,0) xwhite bishop'
    ],
    significance: 'CRITICAL EXCHANGE - White bishop takes Black rook, Black rook recaptures bishop',
    netEffect: 'White trades bishop (3 points) for rook (5 points) = +2 material to White',
    evaluation: 'Good trade for White, but Black still has queen advantage',
    
    followUp: {
      moves: [71, 72, 73, 74],
      sequence: [
        'rook (3,5,0)→(2,5,0)',
        'king (1,2,0)→(2,2,0)',
        'rook (2,5,0)→(1,5,0)',
        'king (2,2,0)→(0,1,0)'
      ],
      result: 'Black rook becomes very active',
      evaluation: 'Black uses rook + queen combination'
    },

    queenRevival: {
      moves: [77, 78],
      sequence: [
        'queen (1,1,0)→(1,0,0) (White promotes pawn to queen!)',
        'rook (1,5,0)→(1,0,0) xblack queen'
      ],
      significance: 'WHITE PROMOTES PAWN TO QUEEN but Black rook immediately captures it!',
      timing: 'Move 77-78',
      result: 'White loses newly promoted queen instantly',
      evaluation: 'Tactical blunder by White - queen promoted into capture'
    },

    blackQueenBack: {
      move: 79,
      notation: 'queen (0,0,0)→(1,0,0) xwhite rook',
      result: 'Black queen recaptures rook',
      evaluation: 'Black now has queen vs White\'s minor pieces and rooks'
    }
  },

  endgame: {
    moves: '80-158',
    analysis: {
      structure: 'Black queen + king vs White rook + knight + king',
      
      blackStrategy: {
        primaryPlan: 'Use queen to hunt down White king and remaining pieces',
        secondaryPlan: 'Advance remaining pawns for promotion',
        technique: 'Queen checks and material hunting',
        execution: 'Systematic king hunt across all layers'
      },

      whiteDefense: {
        strategy: 'Try to coordinate rook and knight for counterplay',
        challenges: [
          'Queen is too powerful',
          'King constantly under pressure',
          'Cannot defend all threats'
        ],
        outcome: 'Gradual material loss'
      },

      materialHunting: {
        moves: [118, 119, 120],
        sequence: [
          'rook (1,4,0)→(5,4,0)',
          'king (5,3,1)→(5,4,0) xblack rook',
          'queen (0,3,0)→(2,5,0)'
        ],
        result: 'White king captures Black rook',
        evaluation: 'Black sacrifices rook to expose White king'
      },

      knightLoss: {
        move: 128,
        notation: 'queen (3,5,0)→(4,4,0) xwhite knight',
        significance: 'Black queen captures White knight',
        evaluation: 'White loses major defender'
      },

      rookLoss: {
        move: 130,
        notation: 'king (3,4,0)→(2,3,0) xwhite rook',
        significance: 'Black king captures White rook',
        evaluation: 'White down to just king and pawns'
      },

      pawnAdvances: {
        moves: '131-145',
        description: 'Black advances pawns while White king flees',
        blackPawns: 'Multiple pawns march forward',
        whitePawns: 'Few pawns, no coordination',
        result: 'Black pawns dominate board'
      },

      pawnCaptures: {
        moves: [147, 148, 149],
        sequence: [
          'king (2,5,2)→(3,6,2) xwhite pawn',
          'king (5,4,1)→(4,4,1)',
          'queen (3,7,2)→(4,6,1)'
        ],
        result: 'Black captures White pawns systematically',
        evaluation: 'Eliminating counterplay'
      },

      finalPhase: {
        moves: '150-158',
        pattern: 'Queen delivers continuous checks',
        whiteKing: 'Forced into corner positions',
        blackKing: 'Supports queen attack',
        
        finalMoves: {
          move: 158,
          notation: 'queen (2,2,1)→(1,1,1)',
          significance: 'Checkmate position (presumed)',
          evaluation: 'Queen + King trap White king'
        }
      }
    },

    evaluation: 'Dominant queen endgame. Black\'s queen proved unstoppable against White\'s rook and knight. Systematic elimination of White\'s pieces followed by pawn captures. Perfect endgame technique.',
    grade: 'A (Excellent queen endgame mastery, converted advantage to victory)'
  },

  tacticalHighlights: [
    {
      move: 6,
      tactic: 'Bishop Captures Pawn',
      description: 'bishop (2,5,2)→(4,3,2) xwhite pawn - first capture',
      impact: 'Early material gain'
    },
    {
      move: 23,
      tactic: 'Queen Trade',
      description: 'Both queens traded early',
      impact: 'Simplified to complex middlegame'
    },
    {
      move: 60,
      tactic: 'Pawn Promotion to Queen',
      description: 'Black pawn reaches promotion square',
      impact: 'Game-changing - gained queen advantage'
    },
    {
      move: 78,
      tactic: 'Queen Capture Trap',
      description: 'Black rook captures White\'s newly promoted queen',
      impact: 'Huge tactical win - White lost queen immediately'
    },
    {
      move: 128,
      tactic: 'Queen Takes Knight',
      description: 'Black queen eliminates White\'s knight',
      impact: 'Removed key defender'
    },
    {
      move: 130,
      tactic: 'King Takes Rook',
      description: 'Black king captures White rook',
      impact: 'White reduced to king + pawns only'
    }
  ],

  mistakesAndMissedOpportunities: {
    black: [
      {
        phase: 'Middlegame',
        issue: 'Lost bishop to White knight (move 30)',
        impact: 'Gave White material advantage temporarily',
        correction: 'Could retreat bishop instead of allowing capture'
      },
      {
        phase: 'Middlegame',
        issue: 'Lost 5+ pawns to White knight raids',
        impact: 'White collected significant material',
        correction: 'Better pawn defense and structure'
      },
      {
        phase: 'Middlegame',
        issue: 'Lost rook to White bishop (move 69)',
        impact: 'Gave up rook for bishop (-2 material)',
        correction: 'Could move rook to safety'
      },
      {
        phase: 'Endgame',
        issue: 'Sacrificed rook (move 119)',
        impact: 'Gave up rook to expose king',
        correction: 'Intentional sacrifice, acceptable given queen advantage'
      }
    ],
    
    white: [
      {
        phase: 'Opening',
        issue: 'Lost pawn early (move 6)',
        impact: 'Material deficit from start',
        correction: 'Defend pawns better against bishop attacks'
      },
      {
        phase: 'Middlegame',
        issue: 'Allowed Black pawn promotion (move 60)',
        impact: 'Black gained queen - huge advantage',
        correction: 'Must blockade advancing pawns'
      },
      {
        phase: 'Middlegame',
        issue: 'CRITICAL - Promoted queen into capture (move 77-78)',
        impact: 'New queen immediately captured by rook',
        correction: 'Must verify promotion square is safe - elementary blunder'
      },
      {
        phase: 'Endgame',
        issue: 'Lost knight and rook quickly',
        impact: 'No defensive resources left',
        correction: 'Better piece coordination needed'
      }
    ]
  },

  statisticalBreakdown: {
    totalMoves: 158,
    gamePhases: {
      opening: { moves: '1-20', percentage: '13%' },
      earlyMiddlegame: { moves: '21-40', percentage: '13%' },
      lateMiddlegame: { moves: '41-70', percentage: '19%' },
      endgame: { moves: '71-158', percentage: '55%' }
    },
    
    material: {
      captures: {
        blackCaptures: '2 bishops, 1 knight, 2 rooks, 1 queen (via rook), 4+ pawns',
        whiteCaptures: '1 bishop, 1 knight, 2 rooks, 1 queen (via pawn), 6+ pawns'
      },
      promotions: {
        black: '1 queen (promoted move 60, kept it)',
        white: '1 queen (promoted move 77, lost immediately)'
      },
      finalAdvantage: 'Black had queen + pawns vs White king (Black won)'
    },
    
    blunders: {
      white: '2 major blunders (allowed pawn promotion, promoted queen into capture)',
      black: '1 minor mistake (lost bishop early)'
    },
    
    layerUsage: {
      layer0: 'Heavy piece activity, pawn battles',
      layer1: 'Endgame king maneuvering',
      layer2: 'Opening development, pawn promotion'
    },
    
    queenActivity: {
      blackQueenMoves: '50+ moves after promotion',
      blackQueenCaptures: 'Knight, multiple pawns',
      checks: '20+ checks delivered by Black queen'
    }
  },

  strategicThemes: [
    '3D Bishop Aggression - Early layer jumping',
    'Early Queen Trade - Simplified to complex middlegame',
    'Pawn Promotion Race - Both sides promoted',
    'Material Exchange Battle - Constant piece trading',
    'Queen Dominance - Black queen vs White minor pieces',
    'King Hunt - Queen chased White king across layers',
    'Pawn Structure - White collected pawns but lost position',
    'Tactical Alertness - Black capitalized on promotion blunder'
  ],

  overallAssessment: {
    gameQuality: 'Complex and Hard-Fought',
    difficulty: 'Medium AI (depth 2 search)',
    playerStrength: 'Advanced (Strong endgame technique)',
    
    strengths: [
      'Aggressive opening with 3D bishop tactics',
      'Critical pawn promotion on move 60',
      'Excellent tactical vision (captured promoted queen move 78)',
      'Dominant queen endgame play',
      'Systematic piece elimination',
      'Perfect conversion of queen advantage',
      'Strong king activity in endgame',
      'Patient king hunt technique'
    ],
    
    weaknesses: [
      'Lost too many pawns in middlegame (6+ pawns)',
      'Bishop captured by knight (move 30)',
      'Rook lost to bishop (move 69)',
      'Could defend pawn structure better',
      'Allowed White knight to raid freely'
    ],
    
    keyLessons: [
      'Pawn promotion is game-changing in 3D chess',
      'Queen advantage usually wins endgame',
      'Always check if promotion square is safe',
      'Defend your pawns against knight raids',
      'Queen + King can dominate rook + knight',
      'Medium AI can play tactically but makes strategic errors',
      'Converting material advantage takes patience',
      'Endgame technique matters - systematic piece elimination wins'
    ]
  },

  finalGrade: {
    opening: 'A-',
    earlyMiddlegame: 'B+',
    lateMiddlegame: 'B',
    endgame: 'A',
    tactics: 'A',
    strategy: 'B+',
    overall: 'B+',
    
    summary: 'Solid victory against Medium AI in a complex 158-move battle. Black played aggressively in the opening, survived a difficult middlegame where White captured 6 pawns, but the critical pawn promotion on move 60 turned the game. Excellent tactical awareness (capturing White\'s promoted queen on move 78) and dominant queen endgame technique sealed the victory. Some weaknesses in pawn defense, but strong overall performance.',
    
    comparison: {
      vsEasyAI: 'Much harder - Easy was 98 moves, this was 158 with more complex tactics',
      vsMediumAI: 'Previous Medium game was 170 moves, this was 158 - slight improvement',
      vsHardAI: 'Easier than Hard - fewer moves, less pressure',
      vsMasterAI: 'Much easier than Master - that was 258 moves of perfection',
      improvement: 'Player shows consistent B+ to A grade performance across difficulties'
    }
  },

  memorableQuote: '"A 158-move tactical battle demonstrating that in 3D chess, a single pawn promotion can turn a difficult position into a winning endgame. Black\'s tactical awareness (capturing White\'s promoted queen) and queen endgame mastery proved decisive against Medium AI\'s aggressive pawn hunting."'
};

module.exports = gameAnalysis;

console.log('='.repeat(80));
console.log('GAME ANALYSIS: Black vs Medium AI - Complex Tactical Battle');
console.log('='.repeat(80));
console.log(`Result: ${gameAnalysis.metadata.result}`);
console.log(`Moves: ${gameAnalysis.metadata.totalMoves} (79 full turns)`);
console.log(`Grade: ${gameAnalysis.finalGrade.overall}`);
console.log(`Key Feature: ${gameAnalysis.metadata.keyFeature}`);
console.log('');
console.log('PHASE GRADES:');
console.log(`  Opening:         ${gameAnalysis.finalGrade.opening} - ${gameAnalysis.openingPhase.analysis.evaluation}`);
console.log(`  Early Middlegame: ${gameAnalysis.finalGrade.earlyMiddlegame} - ${gameAnalysis.earlyMiddlegame.analysis.evaluation}`);
console.log(`  Late Middlegame:  ${gameAnalysis.finalGrade.lateMiddlegame} - ${gameAnalysis.lateMiddlegame.analysis.evaluation}`);
console.log(`  Endgame:         ${gameAnalysis.finalGrade.endgame} - ${gameAnalysis.endgame.analysis.evaluation}`);
console.log('');
console.log('CRITICAL MOMENTS:');
console.log('  Move 23: Both queens traded early');
console.log('  Move 60: Black pawn promotes to queen - GAME CHANGER');
console.log('  Move 77-78: White promotes queen, Black rook captures it immediately - TACTICAL WIN');
console.log('  Move 128: Black queen captures White knight');
console.log('  Move 130: Black king captures White rook');
console.log('');
console.log('MATERIAL BATTLE:');
console.log('  White captured: 1 bishop, 1 knight, 2 rooks, 1 queen, 6+ pawns');
console.log('  Black captured: 2 bishops, 1 knight, 2 rooks, 1 queen, 4+ pawns');
console.log('  Key: Black kept promoted queen, White lost promoted queen instantly');
console.log('');
console.log('SUMMARY:');
console.log(gameAnalysis.finalGrade.summary);
console.log('');
console.log(gameAnalysis.memorableQuote);
console.log('='.repeat(80));
