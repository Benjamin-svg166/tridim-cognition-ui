import { isRookMove, isBishopMove, isKnightMove, isQueenMove, isKingMove, isPawnMove, isPathClear } from './threeDChessUtils';

describe('3D Chess Movement - Vertical Travel', () => {
  describe('Rook 3D Movement', () => {
    test('rook vertical movement (z-axis only)', () => {
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 0, y: 0, z: 2 };
      expect(isRookMove(from, to)).toBe(true);
    });

    test('rook horizontal on different levels (x-axis, z changes)', () => {
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 7, y: 0, z: 0 };
      expect(isRookMove(from, to)).toBe(true);
    });

    test('rook vertical on different levels (y-axis, z changes)', () => {
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 0, y: 7, z: 0 };
      expect(isRookMove(from, to)).toBe(true);
    });

    test('rook cannot move diagonally across levels', () => {
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 1, y: 1, z: 1 };
      expect(isRookMove(from, to)).toBe(false);
    });
  });

  describe('Bishop 3D Movement', () => {
    test('bishop 2D diagonal on same level', () => {
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 4, y: 4, z: 0 };
      expect(isBishopMove(from, to)).toBe(true);
    });

    test('bishop 2D diagonal in xz plane (horizontal-vertical)', () => {
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 2, y: 0, z: 2 };
      expect(isBishopMove(from, to)).toBe(true);
    });

    test('bishop 2D diagonal in yz plane (vertical-vertical)', () => {
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 0, y: 2, z: 2 };
      expect(isBishopMove(from, to)).toBe(true);
    });

    test('bishop 3D diagonal (all axes equal)', () => {
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 2, y: 2, z: 2 };
      expect(isBishopMove(from, to)).toBe(true);
    });

    test('bishop 2D diagonal with level change (xy plane)', () => {
      const from = { x: 1, y: 1, z: 0 };
      const to = { x: 4, y: 4, z: 0 }; // Same level, valid 2D diagonal
      expect(isBishopMove(from, to)).toBe(true);
    });

    test('bishop cannot move like rook (single axis)', () => {
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 0, y: 0, z: 2 };
      expect(isBishopMove(from, to)).toBe(false);
    });
  });

  describe('Knight 3D Movement', () => {
    test('knight classic L-shape on same level (2,1,0)', () => {
      const from = { x: 1, y: 0, z: 0 };
      const to = { x: 2, y: 2, z: 0 };
      expect(isKnightMove(from, to)).toBe(true);
    });

    test('knight 3D L-shape with vertical component (2,1,0) -> (2,0,1)', () => {
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 2, y: 0, z: 1 };
      expect(isKnightMove(from, to)).toBe(true);
    });

    test('knight 3D L-shape (1,2,0) -> (0,2,1)', () => {
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 0, y: 2, z: 1 };
      expect(isKnightMove(from, to)).toBe(true);
    });

    test('knight 3D L-shape pure vertical (0,2,1)', () => {
      const from = { x: 3, y: 3, z: 0 };
      const to = { x: 3, y: 5, z: 1 };
      expect(isKnightMove(from, to)).toBe(true);
    });

    test('knight cannot move (1,1,1)', () => {
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 1, y: 1, z: 1 };
      expect(isKnightMove(from, to)).toBe(false);
    });
  });

  describe('Queen 3D Movement', () => {
    test('queen moves like rook vertically', () => {
      const from = { x: 3, y: 3, z: 0 };
      const to = { x: 3, y: 3, z: 2 };
      expect(isQueenMove(from, to)).toBe(true);
    });

    test('queen moves like bishop in 3D diagonal', () => {
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 2, y: 2, z: 2 };
      expect(isQueenMove(from, to)).toBe(true);
    });

    test('queen moves like rook on different level', () => {
      const from = { x: 0, y: 0, z: 1 };
      const to = { x: 7, y: 0, z: 1 };
      expect(isQueenMove(from, to)).toBe(true);
    });

    test('queen moves like bishop in xz plane', () => {
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 2, y: 0, z: 2 };
      expect(isQueenMove(from, to)).toBe(true);
    });
  });

  describe('King 3D Movement', () => {
    test('king moves one square vertically', () => {
      const from = { x: 4, y: 0, z: 0 };
      const to = { x: 4, y: 0, z: 1 };
      expect(isKingMove(from, to)).toBe(true);
    });

    test('king moves one square in 3D diagonal', () => {
      const from = { x: 4, y: 4, z: 1 };
      const to = { x: 5, y: 5, z: 2 };
      expect(isKingMove(from, to)).toBe(true);
    });

    test('king cannot move two squares vertically', () => {
      const from = { x: 4, y: 0, z: 0 };
      const to = { x: 4, y: 0, z: 2 };
      expect(isKingMove(from, to)).toBe(false);
    });
  });

  describe('Pawn Diagonal Capture', () => {
    test('white pawn captures diagonally', () => {
      const from = { x: 1, y: 1, z: 2 };
      const to = { x: 2, y: 2, z: 2 };
      expect(isPawnMove(from, to, 'white', true, false)).toBe(true);
    });

    test('black pawn captures diagonally', () => {
      const from = { x: 1, y: 6, z: 0 };
      const to = { x: 2, y: 5, z: 0 };
      expect(isPawnMove(from, to, 'black', true, false)).toBe(true);
    });

    test('white pawn cannot capture backwards', () => {
      const from = { x: 1, y: 3, z: 2 };
      const to = { x: 2, y: 2, z: 2 };
      expect(isPawnMove(from, to, 'white', true, false)).toBe(false);
    });

    test('pawn cannot capture two squares diagonally', () => {
      const from = { x: 1, y: 1, z: 2 };
      const to = { x: 3, y: 3, z: 2 };
      expect(isPawnMove(from, to, 'white', true, false)).toBe(false);
    });

    test('pawn cannot capture forward (non-diagonal)', () => {
      const from = { x: 1, y: 1, z: 2 };
      const to = { x: 1, y: 2, z: 2 };
      expect(isPawnMove(from, to, 'white', true, false)).toBe(false);
    });

    test('pawn cannot move diagonally without capture', () => {
      const from = { x: 1, y: 1, z: 2 };
      const to = { x: 2, y: 2, z: 2 };
      expect(isPawnMove(from, to, 'white', false, false)).toBe(false);
    });
  });

  describe('Path Clearance 3D', () => {
    test('rook vertical path clear between levels', () => {
      const piecesMap = new Map();
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 0, y: 0, z: 2 };
      expect(isPathClear(piecesMap, from, to)).toBe(true);
    });

    test('rook vertical path blocked by piece on middle level', () => {
      const piecesMap = new Map();
      piecesMap.set('0,0,1', { type: 'pawn', color: 'white', pos: { x: 0, y: 0, z: 1 } });
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 0, y: 0, z: 2 };
      expect(isPathClear(piecesMap, from, to)).toBe(false);
    });

    test('bishop 3D diagonal path clear', () => {
      const piecesMap = new Map();
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 2, y: 2, z: 2 };
      expect(isPathClear(piecesMap, from, to)).toBe(true);
    });

    test('bishop 3D diagonal path blocked', () => {
      const piecesMap = new Map();
      piecesMap.set('1,1,1', { type: 'pawn', color: 'black', pos: { x: 1, y: 1, z: 1 } });
      const from = { x: 0, y: 0, z: 0 };
      const to = { x: 2, y: 2, z: 2 };
      expect(isPathClear(piecesMap, from, to)).toBe(false);
    });

    test('queen horizontal path on middle level', () => {
      const piecesMap = new Map();
      const from = { x: 0, y: 0, z: 1 };
      const to = { x: 5, y: 0, z: 1 };
      expect(isPathClear(piecesMap, from, to)).toBe(true);
    });

    test('bishop xz plane diagonal path clear', () => {
      const piecesMap = new Map();
      const from = { x: 0, y: 3, z: 0 };
      const to = { x: 2, y: 3, z: 2 };
      expect(isPathClear(piecesMap, from, to)).toBe(true);
    });

    test('bishop yz plane diagonal path blocked', () => {
      const piecesMap = new Map();
      piecesMap.set('3,1,1', { type: 'knight', color: 'white', pos: { x: 3, y: 1, z: 1 } });
      const from = { x: 3, y: 0, z: 0 };
      const to = { x: 3, y: 2, z: 2 };
      expect(isPathClear(piecesMap, from, to)).toBe(false);
    });
  });

  describe('Complex 3D Scenarios', () => {
    test('rook can move from bottom to top level', () => {
      const from = { x: 0, y: 7, z: 0 };
      const to = { x: 0, y: 7, z: 2 };
      expect(isRookMove(from, to)).toBe(true);
    });

    test('bishop can move diagonally across all three levels', () => {
      const from = { x: 5, y: 5, z: 0 };
      const to = { x: 7, y: 7, z: 2 };
      expect(isBishopMove(from, to)).toBe(true);
    });

    test('queen combines rook and bishop in 3D space', () => {
      const from = { x: 3, y: 3, z: 1 };
      // Rook-like vertical
      expect(isQueenMove(from, { x: 3, y: 3, z: 0 })).toBe(true);
      // Bishop-like 3D diagonal
      expect(isQueenMove(from, { x: 4, y: 4, z: 2 })).toBe(true);
      // Rook-like horizontal on same level
      expect(isQueenMove(from, { x: 7, y: 3, z: 1 })).toBe(true);
    });

    test('knight 3D L-shape from top level', () => {
      const from = { x: 1, y: 0, z: 2 };
      const to = { x: 3, y: 1, z: 2 }; // (2,1,0) valid L-shape on same level
      expect(isKnightMove(from, to)).toBe(true);
    });
  });
});
