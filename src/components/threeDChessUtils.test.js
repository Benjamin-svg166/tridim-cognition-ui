import { isRookMove, isBishopMove, isKnightMove, isValidMove } from './threeDChessUtils';

test('rook moves: valid and invalid', () => {
  expect(isRookMove({ x: 0, y: 0, z: 0 }, { x: 5, y: 0, z: 0 })).toBe(true);
  expect(isRookMove({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 7 })).toBe(true);
  expect(isRookMove({ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 0 })).toBe(false);
});

test('bishop moves: plane diagonal and 3D diagonal', () => {
  expect(isBishopMove({ x: 0, y: 0, z: 0 }, { x: 3, y: 3, z: 0 })).toBe(true); // xy plane
  expect(isBishopMove({ x: 1, y: 2, z: 0 }, { x: 4, y: 5, z: 3 })).toBe(true); // 3d diagonal
  expect(isBishopMove({ x: 0, y: 0, z: 0 }, { x: 2, y: 3, z: 0 })).toBe(false);
});

test('knight moves: 3D permutations of 2,1,0', () => {
  expect(isKnightMove({ x: 0, y: 0, z: 0 }, { x: 2, y: 1, z: 0 })).toBe(true);
  expect(isKnightMove({ x: 1, y: 1, z: 1 }, { x: 3, y: 2, z: 1 })).toBe(true);
  expect(isKnightMove({ x: 0, y: 0, z: 0 }, { x: 2, y: 2, z: 0 })).toBe(false);
});

test('isValidMove dispatches correctly', () => {
  expect(isValidMove('rook', { x: 0, y: 0, z: 0 }, { x: 0, y: 5, z: 0 })).toBe(true);
  expect(isValidMove('bishop', { x: 0, y: 0, z: 0 }, { x: 2, y: 2, z: 0 })).toBe(true);
  expect(isValidMove('knight', { x: 0, y: 0, z: 0 }, { x: 0, y: 2, z: 1 })).toBe(true);
  expect(isValidMove('queen', { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 0 })).toBe(true);
});
