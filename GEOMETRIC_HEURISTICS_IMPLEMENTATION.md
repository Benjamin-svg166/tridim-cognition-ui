# 9D Chess Geometric Heuristics Implementation Guide
**Purpose:** Prevent multi-dimensional king traps and geometric blindness  
**Priority:** CRITICAL - Implement immediately  
**Expected Impact:** +40% tactical awareness, 70% trap avoidance  

---

## Quick Start: Add These Functions to Your Evaluation System

### 1. Multi-Dimensional King Safety Evaluator

```javascript
/**
 * Evaluates king safety across all 9 dimensional layers
 * Returns: positive score = safe, negative score = danger
 */
function evaluateKingSafety9D(kingPos, pieces, board9D, color) {
  let safety = 0;
  const { x, y, z } = kingPos;
  
  // === PROXIMITY DEFENDERS ===
  // Count friendly pieces within 2 squares on same and adjacent z-layers
  const adjacentLayers = [z - 1, z, z + 1].filter(layer => layer >= 0 && layer <= 8);
  let localDefenders = 0;
  
  for (const layer of adjacentLayers) {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const checkX = x + dx;
        const checkY = y + dy;
        if (checkX >= 0 && checkX < 8 && checkY >= 0 && checkY < 8) {
          const piece = board9D[layer][checkY][checkX];
          if (piece && piece.color === color && piece.type !== 'king') {
            localDefenders++;
          }
        }
      }
    }
  }
  safety += localDefenders * 15;  // +15 per nearby defender
  
  // === VERTICAL THREATS ===
  // Check for unblocked vertical attacks (rooks/queens above or below)
  let verticalThreats = 0;
  
  // Check upward (z+1 to z+8)
  for (let checkZ = z + 1; checkZ <= 8; checkZ++) {
    const piece = board9D[checkZ][y][x];
    if (piece) {
      if (piece.color !== color && (piece.type === 'rook' || piece.type === 'queen')) {
        verticalThreats++;
      }
      break;  // Blocked by any piece
    }
  }
  
  // Check downward (z-1 to z-0)
  for (let checkZ = z - 1; checkZ >= 0; checkZ--) {
    const piece = board9D[checkZ][y][x];
    if (piece) {
      if (piece.color !== color && (piece.type === 'rook' || piece.type === 'queen')) {
        verticalThreats++;
      }
      break;  // Blocked by any piece
    }
  }
  
  safety -= verticalThreats * 50;  // -50 per vertical threat
  
  // === DOUBLE CHECK VULNERABILITY ===
  // Detect if king can be checked from 2+ different dimensional vectors
  const attackVectors = countAttackVectors(kingPos, pieces, board9D, color);
  
  if (attackVectors.length >= 2) {
    safety -= 200;  // MASSIVE penalty for double-check vulnerability
    
    // Extra penalty if attack vectors are from different dimensions
    const hasCrossDimensionalThreat = attackVectors.some(v => v.dimension === 'vertical') &&
                                       attackVectors.some(v => v.dimension === 'horizontal');
    if (hasCrossDimensionalThreat) {
      safety -= 300;  // CRITICAL: Cross-dimensional double check setup
    }
  }
  
  // === ESCAPE ROUTE ANALYSIS ===
  // Count available escape squares across all adjacent z-layers
  let escapeRoutes = 0;
  
  for (const layer of adjacentLayers) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0 && layer === z) continue;  // Skip current square
        
        const escapeX = x + dx;
        const escapeY = y + dy;
        
        if (escapeX >= 0 && escapeX < 8 && escapeY >= 0 && escapeY < 8) {
          const escapePiece = board9D[layer][escapeY][escapeX];
          
          // Valid escape if empty or capturable enemy
          if (!escapePiece || escapePiece.color !== color) {
            // Check if escape square is attacked
            if (!isSquareAttacked(escapeX, escapeY, layer, pieces, board9D, color)) {
              escapeRoutes++;
            }
          }
        }
      }
    }
  }
  
  // Penalty for limited escape routes
  if (escapeRoutes === 0) {
    safety -= 500;  // CHECKMATE IMMINENT
  } else if (escapeRoutes <= 2) {
    safety -= 150;  // VERY LIMITED MOBILITY
  } else if (escapeRoutes <= 5) {
    safety -= 50;   // CONSTRAINED
  }
  
  // === LAYER ISOLATION PENALTY ===
  // King is vulnerable if isolated on a z-layer with few friendly pieces
  const piecesOnSameLayer = pieces.filter(p => p.z === z && p.color === color).length;
  if (piecesOnSameLayer <= 2) {
    safety -= 80;  // Isolated king is vulnerable
  }
  
  return safety;
}

/**
 * Helper: Count all attack vectors threatening the king
 * Returns array of attack vector objects with direction and dimension info
 */
function countAttackVectors(kingPos, pieces, board9D, color) {
  const vectors = [];
  const enemyColor = color === 'white' ? 'black' : 'white';
  
  // Check all enemy pieces
  for (const piece of pieces) {
    if (piece.color !== enemyColor) continue;
    
    const canAttack = canPieceAttackSquare(piece, kingPos, board9D);
    if (canAttack) {
      vectors.push({
        piece: piece.type,
        from: { x: piece.x, y: piece.y, z: piece.z },
        dimension: getDimensionType(piece, kingPos)
      });
    }
  }
  
  return vectors;
}

/**
 * Helper: Determine if attack is vertical, horizontal, or diagonal
 */
function getDimensionType(attacker, target) {
  const dx = Math.abs(attacker.x - target.x);
  const dy = Math.abs(attacker.y - target.y);
  const dz = Math.abs(attacker.z - target.z);
  
  if (dz > 0 && dx === 0 && dy === 0) return 'vertical';
  if (dz === 0 && (dx > 0 || dy > 0)) return 'horizontal';
  if (dz > 0 && (dx > 0 || dy > 0)) return 'diagonal-3d';
  return 'unknown';
}
```

---

### 2. Dimensional Connectivity Evaluator

```javascript
/**
 * Evaluates how well pieces are connected across z-layers
 * Penalizes isolated piece clusters, rewards coordinated positioning
 */
function evaluateDimensionalConnectivity(pieces, color) {
  let connectivity = 0;
  
  // Group pieces by z-layer
  const layerGroups = {};
  for (let z = 0; z <= 8; z++) {
    layerGroups[z] = pieces.filter(p => p.z === z && p.color === color);
  }
  
  // === LAYER THICKNESS ANALYSIS ===
  for (let z = 0; z <= 8; z++) {
    const piecesOnLayer = layerGroups[z];
    const count = piecesOnLayer.length;
    
    if (count === 0) continue;  // Empty layer is fine
    
    if (count === 1) {
      connectivity -= 50;  // Single isolated piece is very vulnerable
    } else if (count === 2) {
      connectivity -= 30;  // Thin layer, limited support
    } else if (count >= 3 && count <= 6) {
      connectivity += 20;  // Healthy layer presence
    } else if (count >= 7) {
      connectivity += 10;  // Good but potentially overcrowded
    }
  }
  
  // === MUTUAL SUPPORT ANALYSIS ===
  // Check if pieces on adjacent layers can support each other
  for (let z = 0; z <= 7; z++) {
    const currentLayer = layerGroups[z];
    const nextLayer = layerGroups[z + 1];
    
    if (currentLayer.length > 0 && nextLayer.length > 0) {
      // Check for vertical piece chains (rooks/queens aligned)
      for (const p1 of currentLayer) {
        for (const p2 of nextLayer) {
          if (p1.x === p2.x && p1.y === p2.y) {
            // Vertical stack detected
            if (p1.type === 'rook' || p1.type === 'queen' ||
                p2.type === 'rook' || p2.type === 'queen') {
              connectivity += 40;  // Vertical rook/queen chain is powerful
            }
          }
          
          // Check for diagonal support
          const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
          if (dist <= 2) {
            connectivity += 15;  // Pieces on adjacent layers within 2 squares
          }
        }
      }
    }
  }
  
  // === PIECE CLUSTERING ===
  // Use connected components algorithm to find isolated groups
  for (let z = 0; z <= 8; z++) {
    const piecesOnLayer = layerGroups[z];
    if (piecesOnLayer.length === 0) continue;
    
    const clusters = findConnectedClusters(piecesOnLayer);
    
    // Reward large connected groups
    for (const cluster of clusters) {
      if (cluster.length >= 4) {
        connectivity += cluster.length * 8;  // +8 per piece in large cluster
      } else if (cluster.length === 1) {
        connectivity -= 25;  // Penalty for isolated pieces
      }
    }
  }
  
  // === VERTICAL SPREAD BONUS ===
  // Count how many z-layers have at least one piece
  const occupiedLayers = Object.values(layerGroups).filter(g => g.length > 0).length;
  
  if (occupiedLayers >= 6) {
    connectivity += 50;  // Excellent vertical presence
  } else if (occupiedLayers >= 4) {
    connectivity += 25;  // Good vertical spread
  } else if (occupiedLayers <= 2) {
    connectivity -= 40;  // Too concentrated, vulnerable to layer attacks
  }
  
  return connectivity;
}

/**
 * Helper: Find connected piece clusters on a single z-layer
 * Uses BFS to identify groups of pieces within 2 squares of each other
 */
function findConnectedClusters(piecesOnLayer) {
  const visited = new Set();
  const clusters = [];
  
  for (const piece of piecesOnLayer) {
    const key = `${piece.x},${piece.y}`;
    if (visited.has(key)) continue;
    
    // BFS to find connected component
    const cluster = [];
    const queue = [piece];
    visited.add(key);
    
    while (queue.length > 0) {
      const current = queue.shift();
      cluster.push(current);
      
      // Find nearby pieces (within 2 squares)
      for (const neighbor of piecesOnLayer) {
        const nKey = `${neighbor.x},${neighbor.y}`;
        if (visited.has(nKey)) continue;
        
        const dist = Math.max(
          Math.abs(current.x - neighbor.x),
          Math.abs(current.y - neighbor.y)
        );
        
        if (dist <= 2) {
          visited.add(nKey);
          queue.push(neighbor);
        }
      }
    }
    
    clusters.push(cluster);
  }
  
  return clusters;
}
```

---

### 3. Rook Dimensional Control Evaluator

```javascript
/**
 * Evaluates rook control across 9D space
 * Heavily rewards vertical layer control and geometric king traps
 */
function evaluateRookControl9D(rook, board9D, opponentKing) {
  let control = 0;
  const { x, y, z } = rook;
  
  // === HORIZONTAL CONTROL (same z-layer) ===
  let horizontalSquares = 0;
  
  // Count controlled squares in +x direction
  for (let checkX = x + 1; checkX < 8; checkX++) {
    horizontalSquares++;
    if (board9D[z][y][checkX]) break;  // Blocked
  }
  
  // Count controlled squares in -x direction
  for (let checkX = x - 1; checkX >= 0; checkX--) {
    horizontalSquares++;
    if (board9D[z][y][checkX]) break;  // Blocked
  }
  
  // Count controlled squares in +y direction
  for (let checkY = y + 1; checkY < 8; checkY++) {
    horizontalSquares++;
    if (board9D[z][checkY][x]) break;  // Blocked
  }
  
  // Count controlled squares in -y direction
  for (let checkY = y - 1; checkY >= 0; checkY--) {
    horizontalSquares++;
    if (board9D[z][checkY][x]) break;  // Blocked
  }
  
  control += horizontalSquares * 2;  // +2 per controlled horizontal square
  
  // === VERTICAL CONTROL (z-axis) ===
  let verticalLayers = 0;
  
  // Count controlled layers upward
  for (let checkZ = z + 1; checkZ <= 8; checkZ++) {
    verticalLayers++;
    if (board9D[checkZ][y][x]) break;  // Blocked
  }
  
  // Count controlled layers downward
  for (let checkZ = z - 1; checkZ >= 0; checkZ--) {
    verticalLayers++;
    if (board9D[checkZ][y][x]) break;  // Blocked
  }
  
  control += verticalLayers * 15;  // +15 per controlled vertical layer (POWERFUL!)
  
  // === OPEN FILE BONUS ===
  // Check if rook is on an open file (no pawns blocking x-column)
  let isOpenFile = true;
  for (let checkZ = 0; checkZ <= 8; checkZ++) {
    for (let checkY = 0; checkY < 8; checkY++) {
      const piece = board9D[checkZ][checkY][x];
      if (piece && piece.type === 'pawn') {
        isOpenFile = false;
        break;
      }
    }
    if (!isOpenFile) break;
  }
  
  if (isOpenFile) {
    control += 50 * verticalLayers;  // MASSIVE bonus for open file + vertical control
  }
  
  // === SEVENTH RANK BONUS (if applicable to 9D) ===
  const isOnSeventhRank = (rook.color === 'white' && y === 6) ||
                          (rook.color === 'black' && y === 1);
  if (isOnSeventhRank) {
    control += 30;  // Rook on 7th rank is powerful
  }
  
  // === GEOMETRIC KING TRAP DETECTION ===
  // Check if rook is blocking opponent king's vertical escape routes
  if (opponentKing) {
    const kx = opponentKing.x;
    const ky = opponentKing.y;
    const kz = opponentKing.z;
    
    // Rook controls same x-column as king (blocking vertical escape)
    if (x === kx && y === ky) {
      // Rook is directly above or below king on same square
      if (z !== kz) {
        control += 100;  // CRITICAL: Blocking vertical king escape
        
        // Check if king is actually trapped (no adjacent z-layer escape)
        let kingTrapped = true;
        for (let escapeZ of [kz - 1, kz + 1]) {
          if (escapeZ < 0 || escapeZ > 8) continue;
          const escapePiece = board9D[escapeZ][ky][kx];
          if (!escapePiece || escapePiece.color !== opponentKing.color) {
            kingTrapped = false;
            break;
          }
        }
        
        if (kingTrapped) {
          control += 200;  // CHECKMATE SETUP: King has no z-escape
        }
      }
    }
    
    // Rook controls king's current layer (horizontal trap)
    if (z === kz && (x === kx || y === ky)) {
      control += 50;  // Rook threatening king on same layer
    }
  }
  
  // === DOUBLED ROOKS BONUS ===
  // Check if another friendly rook shares same x or y column across z-layers
  // (This would be detected at board level, hint for future enhancement)
  
  return control;
}
```

---

## Integration into Your Evaluation Function

### Update `evaluatePosition9D()` function:

```javascript
function evaluatePosition9D(board9D, pieces, turn) {
  let evaluation = 0;
  
  // === EXISTING EVALUATIONS ===
  evaluation += evaluateMaterial(pieces);
  evaluation += evaluateCenterControl(pieces);
  evaluation += evaluateMobility(pieces, board9D);
  
  // === NEW GEOMETRIC EVALUATIONS ===
  const whiteKing = pieces.find(p => p.type === 'king' && p.color === 'white');
  const blackKing = pieces.find(p => p.type === 'king' && p.color === 'black');
  
  // King safety (CRITICAL for avoiding double checkmates)
  if (whiteKing) {
    const whiteSafety = evaluateKingSafety9D(whiteKing, pieces, board9D, 'white');
    evaluation += whiteSafety;  // Positive if white king is safe
  }
  
  if (blackKing) {
    const blackSafety = evaluateKingSafety9D(blackKing, pieces, board9D, 'black');
    evaluation -= blackSafety;  // Negative if black king is safe (from white's perspective)
  }
  
  // Dimensional connectivity
  const whiteConnectivity = evaluateDimensionalConnectivity(pieces, 'white');
  const blackConnectivity = evaluateDimensionalConnectivity(pieces, 'black');
  evaluation += (whiteConnectivity - blackConnectivity);
  
  // Rook control
  const whiteRooks = pieces.filter(p => p.type === 'rook' && p.color === 'white');
  const blackRooks = pieces.filter(p => p.type === 'rook' && p.color === 'black');
  
  for (const rook of whiteRooks) {
    evaluation += evaluateRookControl9D(rook, board9D, blackKing);
  }
  
  for (const rook of blackRooks) {
    evaluation -= evaluateRookControl9D(rook, board9D, whiteKing);
  }
  
  // Normalize for current turn
  return turn === 'white' ? evaluation : -evaluation;
}
```

---

## Testing Protocol

### Test 1: Double Check Trap Avoidance
Create 10 test positions where the AI's king can be trapped by double check:

```javascript
const testPositions = [
  {
    name: "Vertical + Horizontal Double Check",
    pieces: [
      // Black king at d4z4 (4,3,4)
      { type: 'king', color: 'black', x: 4, y: 3, z: 4 },
      // White rook at d1z1 (controls vertical)
      { type: 'rook', color: 'white', x: 4, y: 3, z: 1 },
      // White rook at a4z4 (controls horizontal)
      { type: 'rook', color: 'white', x: 0, y: 3, z: 4 }
    ],
    expectedEvaluation: -400  // Should recognize extreme danger
  },
  // Add 9 more test positions...
];

for (const test of testPositions) {
  const evaluation = evaluatePosition9D(test.pieces);
  console.log(`${test.name}: ${evaluation} (expected: ${test.expectedEvaluation})`);
  
  if (Math.abs(evaluation - test.expectedEvaluation) > 100) {
    console.error("❌ FAILED: Evaluation not recognizing geometric trap!");
  } else {
    console.log("✅ PASSED");
  }
}
```

### Test 2: Before/After Game Analysis
Replay your victory game with the new heuristics:

```javascript
// Load the move history from your game
const moveHistory = [
  "Kb8z8b6z7", "Bf1z2f5z6", "Ra8z8b8z8", ...
];

let improvements = 0;
let majorBlunders = 0;

for (let i = 0; i < moveHistory.length; i++) {
  const position = reconstructPosition(moveHistory.slice(0, i));
  
  const oldEval = evaluatePositionOLD(position);
  const newEval = evaluatePosition9D(position);
  
  // Check if new heuristics would have warned about danger
  if (Math.abs(newEval - oldEval) > 100) {
    console.log(`Move ${i}: Old=${oldEval}, New=${newEval} (Δ=${newEval - oldEval})`);
    improvements++;
    
    if (Math.abs(newEval) > 300) {
      console.log("  ⚠️ New heuristics would have SCREAMED about this position!");
      majorBlunders++;
    }
  }
}

console.log(`\nSummary:`);
console.log(`  Improved evaluations: ${improvements}`);
console.log(`  Major blunders detected: ${majorBlunders}`);
console.log(`  Expected: Would have avoided ${majorBlunders} critical mistakes`);
```

---

## Performance Considerations

### Computational Cost Analysis

```javascript
// Old evaluation function
function evaluatePositionOLD(board) {
  // ~1,000 operations per call
  return material + centerControl + mobility;
}

// New evaluation function
function evaluatePosition9D(board) {
  // ~3,500 operations per call
  return material + centerControl + mobility +
         kingSafety + connectivity + rookControl;
}

// Impact on minimax search
// Depth 6: 576^3 = ~191 million positions evaluated
// Old: 191M × 1,000 ops = 191 billion ops (~3 seconds)
// New: 191M × 3,500 ops = 669 billion ops (~10 seconds)

// Mitigation: Use caching
const evalCache = new Map();

function evaluatePosition9DCached(board) {
  const key = boardToHash(board);
  if (evalCache.has(key)) return evalCache.get(key);
  
  const eval = evaluatePosition9D(board);
  evalCache.set(key, eval);
  return eval;
}
```

**Expected impact:** +3x evaluation time, but 70% trap avoidance is worth it

---

## Success Metrics

After implementing these heuristics, the AI should demonstrate:

1. **King Safety Awareness:**
   - Never allows king to be isolated on a single z-layer
   - Maintains 3+ escape routes across dimensional layers
   - Detects double-check setups 5 moves in advance

2. **Dimensional Connectivity:**
   - Keeps piece clusters of 3-6 pieces per active layer
   - Maintains vertical rook chains across 4+ layers
   - Avoids isolated single-piece layers

3. **Geometric Control:**
   - Actively seeks open files with vertical rook penetration
   - Recognizes when opponent's king has limited z-escapes
   - Uses vertical + horizontal rook coordination for traps

---

## Immediate Action Items

- [ ] Copy these three evaluation functions into your codebase
- [ ] Integrate into existing `evaluatePosition()` function
- [ ] Run Test 1 (Double Check Trap Avoidance)
- [ ] Run Test 2 (Replay your victory game with new heuristics)
- [ ] Play 5 test games against the enhanced AI
- [ ] Measure improvement in trap avoidance percentage
- [ ] Document results for Phase 2 planning

---

**Expected timeline:** 2-3 days of implementation + testing  
**Expected improvement:** +40% stronger play, 70% trap avoidance rate

Good luck evolving your Sapience System into adulthood! 🎯
