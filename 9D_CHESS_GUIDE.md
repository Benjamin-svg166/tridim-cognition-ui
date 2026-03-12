# Nine-Dimensional Chess - Quick Start Guide

## What is 9D Chess?

Nine-Dimensional Chess extends traditional chess and 3D chess into **9 stacked vertical boards** (z=0 through z=8), creating an unprecedented strategic challenge with 576 total squares and up to 96 pieces on the board!

## Board Structure

```
Level 8 (Celestial) ─────── White Elite Forces ♔♕♖♗♘♙
Level 7 (Upper) ─────────── White Guard ♔♕♖♗♘♙
Level 6 (High) ──────────── White Base ♔♕♖♗♘♙
Level 5 (Mid-High) ─────── Empty
Level 4 (Center) ───────── Empty (No Man's Land)
Level 3 (Mid-Low) ─────── Empty
Level 2 (Deep) ──────────── Black Base ♟♜♝♞♛♚
Level 1 (Lower) ─────────── Black Guard ♟♜♝♞♛♚
Level 0 (Foundation) ────── Black Elite Forces ♟♜♝♞♛♚
```

## Starting Position

### White Pieces (Levels 6, 7, 8)
- **3 Kings** (one per level)
- **3 Queens** (one per level)
- **6 Rooks** (two per level)
- **6 Bishops** (two per level)
- **6 Knights** (two per level)
- **24 Pawns** (8 per level)

### Black Pieces (Levels 0, 1, 2)
- Same distribution as white
- **Total**: 48 pieces per side = 96 pieces total

## Controls & Navigation

### Level Navigation
- **Tab Key**: Move up one level (Level 0 → 1 → 2 → ... → 8 → 0)
- **Shift + Tab**: Move down one level (Level 8 → 7 → 6 → ... → 0 → 8)
- **Number Keys 1-9**: Jump directly to levels 0-8
  - Press `1` for Level 0
  - Press `2` for Level 1
  - ...
  - Press `9` for Level 8
- **Next/Previous Level Buttons**: Click to navigate up/down

### Making Moves
1. **Click** on a piece of your color (white moves first)
2. **Valid moves** will be highlighted across ALL 9 levels:
   - 🟢 **Green**: Same level moves
   - 🟡 **Yellow**: ±1 level moves
   - 🟠 **Orange**: ±2 level moves
   - 🔴 **Red**: ±3+ level moves (long vertical jumps)
3. **Click** destination square to move
4. Turn switches to opponent

### View Modes
- **Single Level**: Shows only the active level (clearest view)
- **Three Levels**: Shows active level ± 1 adjacent level
- **All Levels**: Shows all 9 levels with transparency (most complex)

## Movement Rules

### Pieces That Move Vertically (Between Levels)

#### ♖ Rook (9D)
- Moves any distance along ONE axis (x, y, or z)
- Examples:
  - Horizontal: (0,0,0) → (7,0,0) ✓
  - Vertical: (3,3,0) → (3,3,8) ✓ (bottom to top!)
  - Forward: (2,1,4) → (2,7,4) ✓

#### ♗ Bishop (9D)
- Moves diagonally in 2D or 3D space
- Examples:
  - Same level diagonal: (0,0,5) → (4,4,5) ✓
  - XZ diagonal: (0,3,0) → (4,3,4) ✓ (vertical diagonal!)
  - YZ diagonal: (2,0,0) → (2,5,5) ✓
  - Full 3D diagonal: (0,0,0) → (5,5,5) ✓

#### ♕ Queen (9D)
- Combination of Rook + Bishop
- Can move straight OR diagonally in any direction
- Can traverse all 9 levels vertically or diagonally
- Most powerful piece!

#### ♘ Knight (9D)
- Moves in "L" shape: 2 squares + 1 square perpendicular
- Can jump between levels!
- Examples:
  - Same level: (1,0,3) → (2,2,3) ✓
  - Vertical leap: (3,3,5) → (4,5,6) ✓
  - Multi-level: (0,0,0) → (2,1,1) ✓

#### ♔ King (9D)
- Moves ONE square in any direction
- Can move vertically between adjacent levels
- Examples:
  - Same level: (4,0,6) → (5,1,6) ✓
  - Up one level: (4,0,6) → (4,0,7) ✓
  - 3D diagonal: (4,4,4) → (5,5,5) ✓

### ♙ Pawns (Special Rules)

**⚠️ Pawns CANNOT change levels!**

Pawns follow traditional chess rules but are **locked to their birth level**:
- Forward movement: 1 square (2 from starting position)
- Diagonal capture: One square diagonally forward
- No vertical (z-axis) movement allowed
- Promote at y=7 (white) or y=0 (black)

## Strategy Tips

### 1. **Control the Center Levels (4-5)**
- Like controlling the center in regular chess
- Levels 3, 4, 5 are neutral territory
- Pieces here can attack both directions

### 2. **Vertical Dominance**
- Rooks on center files can dominate entire vertical columns
- Queens can create 3D diagonals spanning 9 levels
- Knights can leap multiple levels for surprise attacks

### 3. **King Safety is Critical**
- You have **3 kings** per color
- Keep at least one king safe on a protected level
- Spread kings across levels (don't cluster on one level)

### 4. **Pawn Structure**
- Pawns create "walls" on their respective levels
- 24 pawns can block entire boards
- Use pawn sacrifices to open files

### 5. **Long-Range Vertical Attacks**
- Bishops and Queens can attack from 8 levels away!
- Watch for vertical forks and pins
- Knights can fork multiple pieces across levels

### 6. **Level-Based Positioning**
- White traditionally prefers upper levels (6-8)
- Black traditionally prefers lower levels (0-2)
- Middle levels (3-5) are battlegrounds

## Win Conditions

**Checkmate or Capture**:
- Traditional checkmate rules apply
- Protect all kings from check
- If any king is in checkmate and no legal moves exist, you lose

## Advanced Tactics

### Vertical Fork
- Use knights or queens to attack pieces on different levels simultaneously
- Example: Knight at (3,3,4) attacks (5,4,5) and (5,4,3)

### 3D Pin
- Pin a piece along a 3D diagonal that crosses multiple levels
- Example: Bishop at (0,0,0) pins piece at (3,3,3) to king at (7,7,7)

### Level Dominance
- Control an entire level with your pieces
- Forces opponent to avoid that altitude band

### Vertical Pawn Chains
- Create diagonal pawn formations across adjacent levels
- Not direct vertical connections, but layered defenses

## Performance Notes

- **96 Pieces**: Game starts with 96 total pieces
- **576 Squares**: 8×8×9 = 576 total positions
- **Transparency**: Boards use transparency to show all levels
- **Visual Indicators**: Color-coded move highlights by z-distance

## Tips for New Players

1. **Start Simple**: Use "Single Level" view mode initially
2. **Practice Navigation**: Get comfortable with Tab/Shift+Tab
3. **Visualize Vertically**: Think in 3D - pieces can attack from above/below
4. **Protect Kings**: Your 3 kings are your most important assets
5. **Use the Highlights**: Pay attention to color-coded valid moves
6. **Plan Ahead**: Consider vertical threats as well as horizontal

## Example Opening Moves

### White's First Moves (Options)
1. Center pawn advance on Level 8: (3,1,8) → (3,3,8)
2. Knight development with vertical: (1,0,8) → (2,2,7)
3. Vertical rook activation: (0,0,8) → (0,0,4) (center control!)

### Black's Responses
1. Mirror white: (3,6,0) → (3,4,0)
2. Counter-attack from Level 2: (4,6,2) → (4,4,2)
3. Defensive setup on Foundation: (5,7,0) → (5,5,0)

## Frequently Asked Questions

**Q: Can pawns move vertically?**
A: No! Pawns are locked to their birth level and cannot change z-coordinates.

**Q: How do I win with 3 kings?**
A: Checkmate rules apply - if any king is in check and you have no legal moves, you lose.

**Q: Can I castle across levels?**
A: Castling works on the same level only - king and rook must be on the same z-level.

**Q: Which pieces can move between levels?**
A: All except pawns! Rooks, bishops, queens, knights, and kings can all change z-coordinates.

**Q: Is en passant possible?**
A: Yes, but only on the same level (same z-coordinate).

## Game Modes

- **Player vs Player**: Take turns against a friend
- **Player vs Computer**: (Coming soon - AI needs 9D training!)

---

**Ready to Play?**

Click the 🚀 **9D Chess (EPIC!)** button in the top right corner to start your nine-dimensional chess adventure!

**Controls Summary:**
- Tab/Shift+Tab: Cycle levels
- 1-9 keys: Jump to level
- Click piece → Click destination: Make move
- Reset button: Start new game

Good luck, and may your vertical tactics prevail! ♔♕♖
