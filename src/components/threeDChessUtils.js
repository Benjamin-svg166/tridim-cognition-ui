// Basic 3D chess move validators for rook, bishop, and knight.
// Coordinates are objects: { x, y, z }

function delta(a, b) {
  return { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
}

function absDelta(a, b) {
  const d = delta(a, b);
  return { x: Math.abs(d.x), y: Math.abs(d.y), z: Math.abs(d.z) };
}

// Rook: moves along exactly one axis any distance
export function isRookMove(from, to) {
  const d = absDelta(from, to);
  const axesMoved = [d.x > 0, d.y > 0, d.z > 0].filter(Boolean).length;
  return axesMoved === 1;
}

// Bishop: moves along diagonals in any plane or full 3D diagonal
// - 2D plane diagonal: two axes change by same positive amount, third 0
// - 3D diagonal: all three axes change by same positive amount
export function isBishopMove(from, to) {
  const d = absDelta(from, to);
  const vals = [d.x, d.y, d.z].sort((a, b) => a - b); // ascending
  // plane diagonal: 0, n, n
  if (vals[0] === 0 && vals[1] === vals[2] && vals[1] > 0) return true;
  // full 3D diagonal: n, n, n
  if (vals[0] === vals[1] && vals[1] === vals[2] && vals[0] > 0) return true;
  return false;
}

// Knight: any permutation of (2,1,0) across axes with positive values
export function isKnightMove(from, to) {
  const d = absDelta(from, to);
  const vals = [d.x, d.y, d.z].sort((a, b) => b - a); // descending
  return vals[0] === 2 && vals[1] === 1 && vals[2] === 0;
}

// Queen: combination of rook and bishop in 3D
export function isQueenMove(from, to) {
  return isRookMove(from, to) || isBishopMove(from, to);
}

// General validator for allowed piece types
export function isValidMove(pieceType, from, to) {
  if (from.x === to.x && from.y === to.y && from.z === to.z) return false;
  switch ((pieceType || '').toLowerCase()) {
    case 'rook':
      return isRookMove(from, to);
    case 'bishop':
      return isBishopMove(from, to);
    case 'queen':
      return isQueenMove(from, to);
    case 'knight':
      return isKnightMove(from, to);
    default:
      return false;
  }
}

export default { isRookMove, isBishopMove, isKnightMove, isValidMove };


// Check that all intermediate squares between `from` and `to` are empty.
// `piecesMap` is a Map with keys like 'x,y,z'. Excludes `from` and `to` positions.
export function isPathClear(piecesMap, from, to) {
  const d = delta(from, to);
  const step = { x: Math.sign(d.x), y: Math.sign(d.y), z: Math.sign(d.z) };

  // Determine number of steps: maximum absolute delta among axes
  const steps = Math.max(Math.abs(d.x), Math.abs(d.y), Math.abs(d.z));
  if (steps <= 1) return true; // adjacent or same square, nothing between

  let cx = from.x + step.x;
  let cy = from.y + step.y;
  let cz = from.z + step.z;
  for (let i = 1; i < steps; i++) {
    const key = `${cx},${cy},${cz}`;
    if (piecesMap.has(key)) return false;
    cx += step.x;
    cy += step.y;
    cz += step.z;
  }
  return true;
}
