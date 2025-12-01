import { isPathClear } from './threeDChessUtils';

test('isPathClear for straight rook path', () => {
  const pieces = new Map();
  // place a blocking piece at (2,0,0)
  pieces.set('2,0,0', { id: 'block' });
  const from = { x: 0, y: 0, z: 0 };
  const to = { x: 4, y: 0, z: 0 };
  expect(isPathClear(pieces, from, to)).toBe(false);
  // remove blocker
  pieces.delete('2,0,0');
  expect(isPathClear(pieces, from, to)).toBe(true);
});

test('isPathClear for 3D diagonal', () => {
  const pieces = new Map();
  pieces.set('1,1,1', { id: 'block' });
  const from = { x: 0, y: 0, z: 0 };
  const to = { x: 3, y: 3, z: 3 };
  expect(isPathClear(pieces, from, to)).toBe(false);
  pieces.delete('1,1,1');
  expect(isPathClear(pieces, from, to)).toBe(true);
});
