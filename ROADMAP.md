# 3D Chess Project Roadmap

## Current State (v0.1.0)
- ✅ Multi-level canvas rendering (3 boards)
- ✅ Basic piece movement (rook, bishop, knight, queen)
- ✅ Path obstruction detection
- ✅ Capture handling
- ✅ Turn enforcement (white/black alternation)
- ✅ Move history tracking
- ✅ Undo/redo (Ctrl+Z/Y)
- ✅ Basic move animations (linear interpolation)
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Test suite (4 suites, 8 tests passing)

---

## Phase 1: Complete Chess Rules (v0.2.0)

### 1.1 Pawn Movement & Promotion
**Priority**: High  
**Effort**: Medium (2-3 days)

- [ ] Implement pawn forward movement (1 square, 2 from start)
- [ ] Add pawn diagonal capture logic
- [ ] Implement en passant detection and execution
- [ ] Create promotion UI modal (choose queen/rook/bishop/knight)
- [ ] Add promotion state management
- [ ] Write tests for pawn edge cases

**Files to modify**:
- `src/components/threeDChessUtils.js` - Add `isPawnMove()`, `canPromote()`
- `src/components/ThreeDChessBoard.jsx` - Add promotion modal, en passant state
- `src/components/threeDChessUtils.test.js` - Pawn move tests

---

### 1.2 King Movement & Castling
**Priority**: High  
**Effort**: Medium (2-3 days)

- [ ] Implement king single-square movement
- [ ] Track king/rook "has moved" state for castling eligibility
- [ ] Validate castling path (no pieces, no check)
- [ ] Implement kingside/queenside castling
- [ ] Add castling animation (king + rook move together)
- [ ] Write castling tests

**Files to modify**:
- `src/components/threeDChessUtils.js` - Add `isKingMove()`, `canCastle()`
- `src/components/ThreeDChessBoard.jsx` - Track piece movement history
- Add castling tests

---

### 1.3 Check, Checkmate, Stalemate Detection
**Priority**: High  
**Effort**: High (3-5 days)

- [ ] Implement `isKingInCheck(position, pieces)` function
- [ ] Validate moves don't leave own king in check
- [ ] Detect checkmate (no legal moves, king in check)
- [ ] Detect stalemate (no legal moves, king NOT in check)
- [ ] Add UI indicators for check state (red highlight on king)
- [ ] Display game-over modal (checkmate/stalemate/draw)
- [ ] Write comprehensive check/mate tests

**Files to create/modify**:
- `src/components/threeDChessUtils.js` - Add check detection functions
- `src/components/ThreeDChessBoard.jsx` - Integrate check validation
- `src/components/GameOverModal.jsx` - New game-over UI component

---

## Phase 2: User Experience Enhancements (v0.3.0)

### 2.1 Visual Improvements
**Priority**: Medium  
**Effort**: Medium (2-4 days)

- [ ] Hover highlights on valid destination squares
- [ ] Show legal moves when piece is selected (green dots/highlights)
- [ ] Add piece sprites/icons instead of text labels
- [ ] Improve board aesthetics (gradients, shadows, depth)
- [ ] Animate captures (fade-out captured piece)
- [ ] Add sound effects (move, capture, check, checkmate)
- [ ] Level transition animations (smooth camera-like pan)

**Assets needed**:
- Chess piece SVG/PNG sprites (white/black sets)
- Sound files (.mp3/.ogg) for game events

---

### 2.2 Move Hints & Validation Feedback
**Priority**: Medium  
**Effort**: Low (1-2 days)

- [ ] Display error messages for illegal moves (red flash/tooltip)
- [ ] Show last move highlight (from/to square borders)
- [ ] Add move notation display (e.g., "e4", "Nf3", "O-O")
- [ ] Implement move preview (ghost piece on hover)
- [ ] Add toggle for showing legal move hints

**Files to modify**:
- `src/components/ThreeDChessBoard.jsx` - Add hint rendering
- `src/components/MoveNotation.jsx` - New component for move list

---

### 2.3 Responsive Design & Accessibility
**Priority**: Medium  
**Effort**: Low (1-2 days)

- [ ] Make canvas responsive to window size
- [ ] Add keyboard navigation (arrow keys, Enter to select)
- [ ] ARIA labels for screen readers
- [ ] Touch device support (tap to select/move)
- [ ] Settings panel (toggle animations, sound, hints)

---

## Phase 3: Persistence & History (v0.4.0)

### 3.1 Game State Management
**Priority**: Medium  
**Effort**: Medium (2-3 days)

- [ ] Save/load game to localStorage
- [ ] Export game as JSON
- [ ] Import saved game from JSON
- [ ] Auto-save on each move
- [ ] Restore game on page reload
- [ ] Multiple save slots

**Files to create**:
- `src/utils/gameStorage.js` - LocalStorage helpers
- `src/components/SaveLoadPanel.jsx` - UI for save/load

---

### 3.2 Move History & Replay
**Priority**: Low  
**Effort**: Medium (2-3 days)

- [ ] Display full move history list (scrollable sidebar)
- [ ] Click to navigate to any point in history
- [ ] Replay mode (auto-advance through moves)
- [ ] Export to PGN (Portable Game Notation) format
- [ ] Import PGN games for replay
- [ ] Add timestamps to moves

**Files to create**:
- `src/components/MoveHistoryPanel.jsx` - Move list sidebar
- `src/utils/pgnParser.js` - PGN import/export logic

---

## Phase 4: AI Opponent (v0.5.0)

### 4.1 Simple AI (Random/Greedy)
**Priority**: Low  
**Effort**: Medium (3-4 days)

- [ ] Random move AI (baseline)
- [ ] Greedy AI (captures highest value piece)
- [ ] Material evaluation function
- [ ] AI difficulty selector (random/easy/medium)
- [ ] AI "thinking" indicator with delay

**Files to create**:
- `src/ai/simpleAI.js` - Random and greedy strategies
- `src/ai/evaluation.js` - Piece value calculator

---

### 4.2 Minimax AI
**Priority**: Low  
**Effort**: High (5-7 days)

- [ ] Minimax algorithm with alpha-beta pruning
- [ ] Position evaluation (material + positional bonuses)
- [ ] Configurable search depth (1-4 ply)
- [ ] Opening book integration (common openings)
- [ ] Endgame tablebase hints
- [ ] Performance optimization (web worker for AI calculation)

**Files to create**:
- `src/ai/minimax.js` - Minimax implementation
- `src/ai/aiWorker.js` - Web Worker for background AI
- `src/ai/openingBook.json` - Common opening sequences

---

## Phase 5: Advanced Features (v0.6.0+)

### 5.1 Multiplayer
**Priority**: Low  
**Effort**: High (1-2 weeks)

- [ ] WebSocket server setup (Node.js + Socket.io)
- [ ] Room/lobby system
- [ ] Real-time move synchronization
- [ ] Player chat
- [ ] Spectator mode
- [ ] Matchmaking system

---

### 5.2 Analysis & Hints
**Priority**: Low  
**Effort**: Medium (3-5 days)

- [ ] Best move suggestion (powered by AI)
- [ ] Blunder detection (move quality indicator)
- [ ] Position evaluation bar (advantage meter)
- [ ] Threat indicators (attacked pieces highlighted)
- [ ] Opening name display
- [ ] Integration with Stockfish.js (optional)

---

### 5.3 3D-Specific Rules (Extended Variant)
**Priority**: Low  
**Effort**: High (1-2 weeks)

- [ ] Vertical movement rules (rook/queen move between levels)
- [ ] 3D bishop paths (diagonal across levels)
- [ ] 3D knight jumps (L-shape in 3D space)
- [ ] Level-specific piece placement rules
- [ ] Multi-level check detection
- [ ] Custom 3D chess variants (Dragon Chess, Star Trek 3D)

---

## Technical Debt & Refactoring

### Performance Optimization
- [ ] Debounce canvas redraws (avoid excessive re-renders)
- [ ] Offscreen canvas for pre-rendered board layers
- [ ] Memoize expensive computations (legal move generation)
- [ ] Lazy load AI engine (code splitting)
- [ ] Optimize animation loop (requestIdleCallback for non-critical updates)

### Code Quality
- [ ] Increase test coverage to 80%+ (especially edge cases)
- [ ] Add E2E tests (Playwright/Cypress)
- [ ] Refactor large components (split ThreeDChessBoard)
- [ ] TypeScript migration (gradual conversion)
- [ ] ESLint strict mode + Prettier formatting
- [ ] Document complex algorithms (JSDoc comments)

### Architecture
- [ ] State management library (Zustand/Redux for complex state)
- [ ] Component library extraction (reusable UI elements)
- [ ] Custom hooks for game logic (`useChessGame`, `useAnimation`)
- [ ] Design system documentation (Storybook)

---

## Documentation

### Developer Docs
- [ ] Architecture diagram (canvas layers, state flow)
- [ ] Animation system explanation
- [ ] Ref vs State usage guidelines
- [ ] Contributing guide (PR process, code style)
- [ ] API reference for utility functions

### User Docs
- [ ] How to play guide
- [ ] Rules reference (with 3D variants)
- [ ] Keyboard shortcuts cheatsheet
- [ ] FAQ section
- [ ] Tutorial mode (interactive onboarding)

---

## Release Schedule (Proposed)

| Version | Target Date | Focus |
|---------|-------------|-------|
| v0.2.0 | +2 weeks | Complete chess rules (pawn, king, check) |
| v0.3.0 | +4 weeks | UX improvements (visuals, hints, responsive) |
| v0.4.0 | +6 weeks | Persistence & history (save/load, PGN) |
| v0.5.0 | +10 weeks | AI opponent (minimax) |
| v0.6.0 | +14 weeks | Multiplayer & advanced features |
| v1.0.0 | +18 weeks | Production-ready release |

---

## Success Metrics

### Technical
- Test coverage > 80%
- Lighthouse score > 90 (performance, accessibility)
- Zero high-severity security vulnerabilities
- CI builds < 2 minutes

### User Experience
- Game loads in < 1 second
- Animations run at 60 FPS
- No illegal moves accepted
- Zero known checkmate detection bugs

### Adoption
- 10+ GitHub stars
- 5+ external contributors
- Featured on chess programming forums
- Deployed demo with 100+ visitors

---

## Contributing

Interested in contributing? Check the [Issues](https://github.com/Benjamin-svg166/tridim-cognition-ui/issues) page for:
- `good-first-issue` - Beginner-friendly tasks
- `help-wanted` - Community contributions welcome
- `enhancement` - Feature requests

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and PR guidelines.

---

## Questions or Suggestions?

Open an issue or discussion on [GitHub](https://github.com/Benjamin-svg166/tridim-cognition-ui)!
