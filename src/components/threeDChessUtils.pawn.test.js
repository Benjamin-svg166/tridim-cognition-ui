import { isPawnMove, canPromote, isEnPassant } from './threeDChessUtils';

describe('Pawn Movement', () => {
  describe('isPawnMove', () => {
    test('white pawn moves forward 1 square', () => {
      const from = { x: 0, y: 1, z: 0 };
      const to = { x: 0, y: 2, z: 0 };
      expect(isPawnMove(from, to, 'white', false, false)).toBe(true);
    });

    test('white pawn moves forward 2 squares from start', () => {
      const from = { x: 0, y: 1, z: 0 };
      const to = { x: 0, y: 3, z: 0 };
      expect(isPawnMove(from, to, 'white', false, false)).toBe(true);
    });

    test('white pawn cannot move forward 2 squares after moving', () => {
      const from = { x: 0, y: 2, z: 0 };
      const to = { x: 0, y: 4, z: 0 };
      expect(isPawnMove(from, to, 'white', false, true)).toBe(false);
    });

    test('black pawn moves forward 1 square (negative direction)', () => {
      const from = { x: 0, y: 6, z: 0 };
      const to = { x: 0, y: 5, z: 0 };
      expect(isPawnMove(from, to, 'black', false, false)).toBe(true);
    });

    test('black pawn moves forward 2 squares from start', () => {
      const from = { x: 0, y: 6, z: 0 };
      const to = { x: 0, y: 4, z: 0 };
      expect(isPawnMove(from, to, 'black', false, false)).toBe(true);
    });

    test('pawn cannot move sideways', () => {
      const from = { x: 0, y: 1, z: 0 };
      const to = { x: 1, y: 1, z: 0 };
      expect(isPawnMove(from, to, 'white', false, false)).toBe(false);
    });

    test('pawn cannot move to different level', () => {
      const from = { x: 0, y: 1, z: 0 };
      const to = { x: 0, y: 2, z: 1 };
      expect(isPawnMove(from, to, 'white', false, false)).toBe(false);
    });

    test('pawn cannot move backward', () => {
      const from = { x: 0, y: 3, z: 0 };
      const to = { x: 0, y: 2, z: 0 };
      expect(isPawnMove(from, to, 'white', false, true)).toBe(false);
    });
  });

  describe('canPromote', () => {
    test('white pawn can promote at y=7', () => {
      expect(canPromote({ x: 0, y: 7, z: 0 }, 'white')).toBe(true);
    });

    test('white pawn cannot promote at y=6', () => {
      expect(canPromote({ x: 0, y: 6, z: 0 }, 'white')).toBe(false);
    });

    test('black pawn can promote at y=0', () => {
      expect(canPromote({ x: 0, y: 0, z: 0 }, 'black')).toBe(true);
    });

    test('black pawn cannot promote at y=1', () => {
      expect(canPromote({ x: 0, y: 1, z: 0 }, 'black')).toBe(false);
    });
  });

  describe('isEnPassant', () => {
    test('detects valid en passant for white', () => {
      const lastMove = {
        from: { x: 1, y: 6, z: 0 },
        to: { x: 1, y: 4, z: 0 },
        piece: { type: 'pawn', color: 'black' },
      };
      const currentPos = { x: 0, y: 4, z: 0 }; // white pawn adjacent
      const targetPos = { x: 1, y: 5, z: 0 }; // diagonal forward
      expect(isEnPassant(lastMove, currentPos, targetPos, 'white')).toBe(true);
    });

    test('rejects en passant if last move was not pawn', () => {
      const lastMove = {
        from: { x: 1, y: 6, z: 0 },
        to: { x: 1, y: 4, z: 0 },
        piece: { type: 'knight', color: 'black' },
      };
      const currentPos = { x: 0, y: 4, z: 0 };
      const targetPos = { x: 1, y: 5, z: 0 };
      expect(isEnPassant(lastMove, currentPos, targetPos, 'white')).toBe(false);
    });

    test('rejects en passant if last move was not 2 squares', () => {
      const lastMove = {
        from: { x: 1, y: 5, z: 0 },
        to: { x: 1, y: 4, z: 0 },
        piece: { type: 'pawn', color: 'black' },
      };
      const currentPos = { x: 0, y: 4, z: 0 };
      const targetPos = { x: 1, y: 5, z: 0 };
      expect(isEnPassant(lastMove, currentPos, targetPos, 'white')).toBe(false);
    });

    test('rejects en passant if pawns not adjacent', () => {
      const lastMove = {
        from: { x: 3, y: 6, z: 0 },
        to: { x: 3, y: 4, z: 0 },
        piece: { type: 'pawn', color: 'black' },
      };
      const currentPos = { x: 0, y: 4, z: 0 }; // too far away
      const targetPos = { x: 3, y: 5, z: 0 };
      expect(isEnPassant(lastMove, currentPos, targetPos, 'white')).toBe(false);
    });

    test('detects valid en passant for black', () => {
      const lastMove = {
        from: { x: 1, y: 1, z: 0 },
        to: { x: 1, y: 3, z: 0 },
        piece: { type: 'pawn', color: 'white' },
      };
      const currentPos = { x: 0, y: 3, z: 0 }; // black pawn adjacent
      const targetPos = { x: 1, y: 2, z: 0 }; // diagonal forward (for black)
      expect(isEnPassant(lastMove, currentPos, targetPos, 'black')).toBe(true);
    });
  });
});
