# Phase 3.0: Nine-Dimensional Layered Chess Architecture

**Date**: March 12, 2026  
**Status**: 🚧 In Progress  
**Branch**: clean-start

## Overview

Extending the 3D tri-dimensional chess system into a **9-dimensional layered chess game** with nine stacked boards (z=0 through z=8). This creates an unprecedented chess experience with vertical gameplay spanning 9 levels of strategic depth.

## Architecture Vision

### 1. Board Layout - Nine Stacked Levels

```
    [Level 8 - Celestial]     ← White Elite Forces
       ↓ (transparent)
    [Level 7 - Upper]         ← White Advanced Guard
       ↓ (transparent)
    [Level 6 - High]          ← White Forward Base
       ↓ (transparent)
    [Level 5 - Mid-High]      ← Strategic Reserve (Empty)
       ↓ (transparent)
    [Level 4 - Center]        ← No Man's Land (Empty)
       ↓ (transparent)
    [Level 3 - Mid-Low]       ← Strategic Reserve (Empty)
       ↓ (transparent)
    [Level 2 - Deep]          ← Black Forward Base
       ↓ (transparent)
    [Level 1 - Lower]         ← Black Advanced Guard
       ↓ (transparent)
    [Level 0 - Foundation]    ← Black Elite Forces
```

## Initial Piece Distribution

### Configuration A: Symmetric Extreme Distribution

#### White Pieces (Top 3 Levels)

**Level 8 (z=8) - Celestial White**
- Back rank (y=0): ♖ ♘ ♗ ♕ ♔ ♗ ♘ ♖
- Pawns (y=1): ♙ ♙ ♙ ♙ ♙ ♙ ♙ ♙

**Level 7 (z=7) - Upper White**
- Back rank (y=0): ♖ ♘ ♗ ♕ ♔ ♗ ♘ ♖
- Pawns (y=1): ♙ ♙ ♙ ♙ ♙ ♙ ♙ ♙

**Level 6 (z=6) - High White**
- Back rank (y=0): ♖ ♘ ♗ ♕ ♔ ♗ ♘ ♖
- Pawns (y=1): ♙ ♙ ♙ ♙ ♙ ♙ ♙ ♙

**Levels 5, 4, 3 - Strategic Middle Zone**
- Empty - Reserved for piece movement and tactical positioning

#### Black Pieces (Bottom 3 Levels)

**Level 2 (z=2) - Deep Black**
- Pawns (y=6): ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟
- Back rank (y=7): ♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜

**Level 1 (z=1) - Lower Black**
- Pawns (y=6): ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟
- Back rank (y=7): ♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜

**Level 0 (z=0) - Foundation Black**
- Pawns (y=6): ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟
- Back rank (y=7): ♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜

### Total Piece Count Per Side
- **24 Pawns** (3 levels × 8 pawns)
- **6 Rooks** (3 levels × 2 rooks)
- **6 Knights** (3 levels × 2 knights)
- **6 Bishops** (3 levels × 2 bishops)
- **3 Queens** (3 levels × 1 queen)
- **3 Kings** (3 levels × 1 king)

**Grand Total**: 48 pieces per side, 96 pieces on board

## 9D Movement Rules

### Extended Z-Axis Movement

All pieces that could move vertically in 3D chess can now traverse **9 levels**:

#### Rook 9D Movement
- Vertical range: z=0 to z=8 (9 levels)
- Examples:
  - Full vertical: (0,0,0) → (0,0,8) ✓
  - Mid-level to top: (3,3,4) → (3,3,8) ✓
  - Any horizontal on any level

#### Bishop 9D Diagonal
- Can move diagonally across all 9 levels
- XZ diagonal: (0,0,0) → (8,0,8) ✓ (if unobstructed)
- YZ diagonal: (0,0,0) → (0,8,8) ✓ (if allowed)
- Full 3D diagonal: (0,0,0) → (7,7,8) ✓

#### Queen 9D Dominance
- Rook + Bishop = Full 9-level vertical and diagonal control
- Most powerful piece with 9-dimensional reach

#### Knight 9D Leaps
- L-shape across 9 levels
- Examples:
  - (0,0,0) → (2,1,1) ✓
  - (3,3,5) → (4,5,6) ✓
  - Can leap to any valid L-shaped position in 9D space

#### King 9D Movement
- One square in any direction, including vertically
- Can move from z=0 to z=1, z=4 to z=5, etc.
- 3D diagonal: (4,4,4) → (5,5,5) ✓

### Pawn 9D Rules

**Option A: Pawns Stay on Birth Level (Conservative)**
- Pawns cannot change z-level
- Simpler to implement and understand
- Maintains traditional pawn constraints

**Option B: Pawns Can Ascend/Descend (Advanced)**
- White pawns can move up one z-level when moving forward
- Black pawns can move down one z-level when moving forward
- Example: White pawn at (3,3,6) can move to (3,4,7)
- Adds strategic vertical pawn advancement

## Visual Design for 9 Levels

### Transparency Gradient System
```javascript
// More transparent = further from active level
const getLayerOpacity = (z, activeZ) => {
  const distance = Math.abs(z - activeZ);
  if (distance === 0) return 0.20;  // Active layer - most visible
  if (distance === 1) return 0.14;  // Adjacent layers
  if (distance === 2) return 0.10;  // 2 layers away
  if (distance === 3) return 0.07;  // 3 layers away
  if (distance >= 4) return 0.04;   // Far layers - very faint
};
```

### Perspective Depth Effect
```javascript
// Vertical offset to create 3D stacking illusion
const offsetY = (8 - z) * 6;  // 6px per level (48px max offset)
const offsetX = (8 - z) * 6;  // Horizontal offset for depth
```

### Color Coding by Level
- **Levels 8-6 (White Territory)**: Warm tinted backgrounds (very light amber)
- **Levels 5-3 (Neutral Zone)**: Pure white/gray backgrounds
- **Levels 2-0 (Black Territory)**: Cool tinted backgrounds (very light blue)

### Board Labels
```
Level 8: "Celestial (White Elite)"
Level 7: "Upper (White Guard)"
Level 6: "High (White Base)"
Level 5: "Mid-High (Reserve)"
Level 4: "Center (Neutral)"
Level 3: "Mid-Low (Reserve)"
Level 2: "Deep (Black Base)"
Level 1: "Lower (Black Guard)"
Level 0: "Foundation (Black Elite)"
```

## Enhanced Interaction Model

### Level Navigation
- **Tab Key**: Cycle through levels (0→1→2...→8→0)
- **Shift+Tab**: Reverse cycle (8→7→6...→0→8)
- **Number Keys 1-9**: Jump directly to level 0-8
- **Mouse Wheel**: Scroll through levels

### Multi-Level View Modes
1. **Single Level**: Show only active level (traditional)
2. **Three Level**: Show active + 1 above + 1 below
3. **All Levels**: Show all 9 with transparency
4. **Split View**: Show 3 levels clustered (0-2, 3-5, 6-8)

### Visual Move Indicators Across 9 Levels
- Highlight valid moves on **all 9 boards simultaneously**
- Color code by reachability:
  - Same level: Green
  - ±1 level: Yellow
  - ±2-4 levels: Orange
  - ±5+ levels: Red (long vertical jumps)

## AI Adaptations for 9D

### Evaluation Function Updates
```javascript
// Position value varies by level
const getLevelBonus = (z, color) => {
  if (color === 'white') {
    // White prefers upper levels
    return (z - 4) * 0.1;  // +0.4 at z=8, -0.4 at z=0
  } else {
    // Black prefers lower levels
    return (4 - z) * 0.1;  // +0.4 at z=0, -0.4 at z=8
  }
};
```

### Search Depth Considerations
- 9D board = 8×8×9 = 576 squares (vs 192 in 3D)
- Search space is **3× larger**
- May need to reduce search depth or use alpha-beta pruning more aggressively

### Strategic Elements
- **Vertical Control**: Controlling central levels (4-5) is critical
- **King Safety**: Kings harder to protect across 9 levels
- **Vertical Pawn Chains**: If pawns can move vertically, creates new structures
- **Level Dominance**: Controlling multiple levels with pieces

## Implementation Checklist

- [ ] Create 9-level board initialization
- [ ] Update `isValidMove` for 9D space
- [ ] Update `isPathClear` for paths across 9 levels
- [ ] Modify rendering to handle 9 canvases
- [ ] Implement level navigation controls
- [ ] Add multi-level view modes
- [ ] Update AI evaluation for 9D positioning
- [ ] Create visual indicators for 9-level moves
- [ ] Add level-based color coding
- [ ] Test performance with 96 pieces
- [ ] Implement win conditions (all 3 kings must be captured?)
- [ ] Add game mode selection (standard 3D vs 9D)

## Strategic Questions to Resolve

1. **Win Condition**: 
   - Capture any one king? (traditional)
   - Capture majority of kings (2 of 3)?
   - Capture all kings?

2. **Castling**: 
   - Can kings castle with rooks on the same level?
   - Across different levels?

3. **Check/Checkmate**:
   - Must all kings be protected from check?
   - Or just one king per color needs to survive?

4. **En Passant**: 
   - Works on same level only?
   - Or can work across levels?

5. **Promotion**:
   - Pawns promote at y=7 (white) or y=0 (black) regardless of z-level?
   - Or different promotion squares per level?

## Performance Optimizations

### Canvas Rendering
- Use `requestAnimationFrame` efficiently
- Only redraw changed levels
- Implement dirty region tracking
- Consider WebGL for 9 canvases if needed

### Piece Management
- Optimize piecesMap lookups for 9D coordinates
- Use spatial indexing for 576 squares
- Cache valid move calculations

### Memory
- Monitor memory usage with 96 pieces
- Optimize undo/redo stack for large games
- Lazy-load neural network data

## Future Enhancements

- **Variable Dimension Mode**: Allow 3D, 5D, 7D, or 9D gameplay
- **Custom Starting Positions**: Different piece distributions
- **Level-Specific Rules**: Different rules per altitude band
- **Gravity Mode**: Pieces "fall" to lower levels over time
- **Wormholes**: Portals between non-adjacent levels
- **Time Dimension**: 4th dimension with temporal chess mechanics

## Notes

This represents a massive expansion of chess complexity:
- 3D chess: 192 squares, ~32 pieces
- 9D chess: 576 squares, ~96 pieces
- **3× board size, 3× pieces**

The strategic depth increases exponentially, creating a game that's:
- More complex than traditional chess
- Requires multi-level thinking
- Emphasizes vertical control and positioning
- Introduces new tactical patterns (vertical forks, skewers across levels)

---

**Next Steps**: Begin implementation with board initialization and basic rendering of 9 levels.
