# 3D Chess Legal Moves Reference

## Overview
3D Chess is played on 3 stacked 8×8 boards (levels z=0, z=1, z=2). Each piece can move on the same board (2D movement) and between boards (3D vertical movement).

---

## ♙ PAWN (♙ White / ♟ Black)

### Forward Movement (Non-Capture)
- **1 square forward** on same board: (x, y, z) → (x, y±1, z)
  - White moves +y direction (toward y=7)
  - Black moves -y direction (toward y=0)
- **2 squares forward** from starting position (same board only)
  - White from y=1: (x, 1, z) → (x, 3, z)
  - Black from y=6: (x, 6, z) → (x, 4, z)

### Diagonal Capture (2D - Same Board)
- **1 square diagonally** on same board: (x, y, z) → (x±1, y±1, z)
  - White: (x±1, y+1, z)
  - Black: (x±1, y-1, z)
  - Only when capturing an enemy piece

### Special Moves
- **En Passant**: Capture pawn that just moved 2 squares (same board only)
- **Promotion**: When reaching opposite end (y=7 for White, y=0 for Black) → becomes Queen, Rook, Bishop, or Knight

### 3D Vertical Movement
- **NO vertical movement** - Pawns cannot change z-levels
- Pawns are restricted to their starting board

---

## ♘ KNIGHT (♘ White / ♞ Black)

### L-Shaped Movement Pattern
Knights move in an "L" shape: 2 squares in one direction, 1 square perpendicular.

### 2D Movement (Same Board)
- (x±2, y±1, z) - 2 horizontal, 1 vertical
- (x±1, y±2, z) - 1 horizontal, 2 vertical

### 3D Movement (Between Boards)
- (x±2, y, z±1) - 2 on x-axis, 1 vertical level
- (x, y±2, z±1) - 2 on y-axis, 1 vertical level
- (x±1, y, z±2) - 1 on x-axis, 2 vertical levels (if 3+ boards)
- (x, y±1, z±2) - 1 on y-axis, 2 vertical levels (if 3+ boards)

### Rules
- **Jumps over pieces** - Only piece that can jump
- Total displacement must satisfy: two coordinates change, with values 1 and 2
- Can capture enemy pieces on landing square

---

## ♗ BISHOP (♗ White / ♝ Black)

### Diagonal Movement
Bishops move diagonally any number of squares until blocked.

### 2D Diagonal (Same Board)
- (x±n, y±n, z) - Equal steps on x and y axes
- Examples: (2,2,0)→(5,5,0), (3,6,2)→(0,3,2)

### 3D Diagonal (Between Boards)
- **(x±n, y, z±n)** - Diagonal in x-z plane
  - Example: (0,3,0)→(2,3,2)
- **(x, y±n, z±n)** - Diagonal in y-z plane
  - Example: (3,0,0)→(3,2,2)
- **(x±n, y±n, z±n)** - True 3D diagonal (all axes equal)
  - Example: (0,0,0)→(2,2,2)

### Rules
- **Cannot jump** - Path must be clear
- Two or three coordinates must change by equal amounts
- Can capture enemy piece on destination square

---

## ♖ ROOK (♖ White / ♜ Black)

### Straight-Line Movement
Rooks move in straight lines any number of squares.

### 2D Movement (Same Board)
- **(x±n, y, z)** - Horizontal along x-axis
  - Example: (0,0,0)→(7,0,0)
- **(x, y±n, z)** - Horizontal along y-axis
  - Example: (0,0,2)→(0,7,2)

### 3D Movement (Between Boards)
- **(x, y, z±n)** - Vertical between boards
  - Example: (3,3,0)→(3,3,2)

### Rules
- **Cannot jump** - Path must be clear
- Exactly one coordinate changes
- Can capture enemy piece on destination square
- Used in castling (see King)

---

## ♕ QUEEN (♕ White / ♛ Black)

### Combined Movement
Queens combine Rook and Bishop movements.

### All Rook Moves
- (x±n, y, z) - Horizontal x-axis
- (x, y±n, z) - Horizontal y-axis
- (x, y, z±n) - Vertical z-axis

### All Bishop Moves
- (x±n, y±n, z) - 2D diagonal
- (x±n, y, z±n) - 3D diagonal xz-plane
- (x, y±n, z±n) - 3D diagonal yz-plane
- (x±n, y±n, z±n) - True 3D diagonal

### Rules
- **Cannot jump** - Path must be clear
- Most powerful piece
- Can capture enemy piece on destination square

---

## ♔ KING (♔ White / ♚ Black)

### One-Square Movement
Kings move exactly 1 square in any direction.

### 2D Movement (Same Board)
- (x±1, y, z) - Horizontal
- (x, y±1, z) - Vertical
- (x±1, y±1, z) - Diagonal

### 3D Movement (Between Boards)
- (x, y, z±1) - Up/down one level
- (x±1, y, z±1) - Diagonal with level change
- (x, y±1, z±1) - Diagonal with level change
- (x±1, y±1, z±1) - True 3D diagonal

### Special Move: Castling
- **Kingside**: King moves 2 squares toward h-file rook
  - King: (4,0,z)→(6,0,z), Rook: (7,0,z)→(5,0,z)
- **Queenside**: King moves 2 squares toward a-file rook
  - King: (4,0,z)→(2,0,z), Rook: (0,0,z)→(3,0,z)

### Castling Requirements
✓ King has not moved  
✓ Rook has not moved  
✓ No pieces between king and rook  
✓ King not in check  
✓ King doesn't pass through check  
✓ King doesn't end in check  
✓ Must be on same board (same z-level)

### Rules
- **Cannot move into check**
- Most important piece - losing it = checkmate
- Maximum 1 square in any direction (except castling)

---

## Movement Validation Summary

### Path Clearance (Sliding Pieces)
- **Rook, Bishop, Queen**: Must have clear path (no pieces blocking)
- **Knight**: Jumps over pieces (path doesn't matter)
- **King, Pawn**: Move only 1-2 squares (rarely blocked)

### 3D Movement Capabilities
| Piece | 2D (Same Board) | Vertical (z-axis) | 3D Diagonal |
|-------|----------------|-------------------|-------------|
| Pawn | ✓ (limited) | ✗ | ✗ |
| Knight | ✓ | ✓ | ✓ |
| Bishop | ✓ | ✗ (except diagonal) | ✓ |
| Rook | ✓ | ✓ | ✗ |
| Queen | ✓ | ✓ | ✓ |
| King | ✓ | ✓ | ✓ |

### Capture Rules
- All pieces capture the same way they move
- **Exception**: Pawns capture diagonally (different from forward movement)
- Cannot capture own pieces
- Capturing is optional (except when it's the only legal move)

---

## Board Coordinate System

- **x-axis**: Files (0-7, corresponds to a-h in standard chess)
- **y-axis**: Ranks (0-7, corresponds to 1-8 in standard chess)
- **z-axis**: Levels (0=Bottom/Black, 1=Middle/Empty, 2=Top/White)

### Starting Positions
- **White**: z=2, ranks y=0 (back) and y=1 (pawns)
- **Black**: z=0, ranks y=7 (back) and y=6 (pawns)
- **Middle Board**: z=1 (empty at start, used for piece travel)

---

## Special Game Rules

### Check and Checkmate
- **Check**: King is under attack
- **Checkmate**: King in check with no legal moves to escape
- Must resolve check by: moving king, blocking attack, or capturing attacker

### Stalemate
- Player has no legal moves but is NOT in check
- Game is a draw

### Promotion
- Pawns reaching opposite end (y=7 for White, y=0 for Black)
- Must promote to Queen, Rook, Bishop, or Knight
- Cannot remain a pawn or promote to King

---

## Implementation Notes

Based on your `threeDChessUtils.js`:

- `isValidMove(type, from, to, color, isCapture, hasMoved)` - Validates piece movement patterns
- `isPathClear(piecesMap, from, to)` - Checks for blocking pieces
- `wouldBeInCheckAfterMove(piecesMap, from, to, color)` - Prevents illegal moves leaving king in check
- `isCastling(from, to, color)` - Detects castling attempts
- `canCastle(piecesMap, from, castlingInfo, color, kingMoved, rookMoved)` - Validates castling legality

---

**Last Updated**: December 9, 2025  
**Game Version**: 3-Level 3D Chess (phase-1.1-pawn-movement branch)
