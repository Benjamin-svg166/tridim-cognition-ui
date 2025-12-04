import { isCastling, canCastle } from './threeDChessUtils';

describe('isCastling', () => {
  test('detects white kingside castling', () => {
    const from = { x: 4, y: 0, z: 0 };
    const to = { x: 6, y: 0, z: 0 };
    const result = isCastling(from, to, 'white');
    
    expect(result.type).toBe('kingside');
    expect(result.rookFrom).toEqual({ x: 7, y: 0, z: 0 });
    expect(result.rookTo).toEqual({ x: 5, y: 0, z: 0 });
  });

  test('detects white queenside castling', () => {
    const from = { x: 4, y: 0, z: 0 };
    const to = { x: 2, y: 0, z: 0 };
    const result = isCastling(from, to, 'white');
    
    expect(result.type).toBe('queenside');
    expect(result.rookFrom).toEqual({ x: 0, y: 0, z: 0 });
    expect(result.rookTo).toEqual({ x: 3, y: 0, z: 0 });
  });

  test('detects black kingside castling', () => {
    const from = { x: 4, y: 7, z: 0 };
    const to = { x: 6, y: 7, z: 0 };
    const result = isCastling(from, to, 'black');
    
    expect(result.type).toBe('kingside');
    expect(result.rookFrom).toEqual({ x: 7, y: 7, z: 0 });
    expect(result.rookTo).toEqual({ x: 5, y: 7, z: 0 });
  });

  test('detects black queenside castling', () => {
    const from = { x: 4, y: 7, z: 0 };
    const to = { x: 2, y: 7, z: 0 };
    const result = isCastling(from, to, 'black');
    
    expect(result.type).toBe('queenside');
    expect(result.rookFrom).toEqual({ x: 0, y: 7, z: 0 });
    expect(result.rookTo).toEqual({ x: 3, y: 7, z: 0 });
  });

  test('returns null for single-square king move', () => {
    const from = { x: 4, y: 0, z: 0 };
    const to = { x: 5, y: 0, z: 0 };
    const result = isCastling(from, to, 'white');
    
    expect(result.type).toBeNull();
  });

  test('returns null for non-horizontal king move', () => {
    const from = { x: 4, y: 0, z: 0 };
    const to = { x: 6, y: 1, z: 0 };
    const result = isCastling(from, to, 'white');
    
    expect(result.type).toBeNull();
  });

  test('returns null for wrong starting x position', () => {
    const from = { x: 3, y: 0, z: 0 };
    const to = { x: 5, y: 0, z: 0 };
    const result = isCastling(from, to, 'white');
    
    expect(result.type).toBeNull();
  });

  test('returns null for wrong white rank', () => {
    const from = { x: 4, y: 1, z: 0 };
    const to = { x: 6, y: 1, z: 0 };
    const result = isCastling(from, to, 'white');
    
    expect(result.type).toBeNull();
  });

  test('returns null for wrong black rank', () => {
    const from = { x: 4, y: 6, z: 0 };
    const to = { x: 6, y: 6, z: 0 };
    const result = isCastling(from, to, 'black');
    
    expect(result.type).toBeNull();
  });
});

describe('canCastle', () => {
  function createPiecesMap(pieces) {
    const map = new Map();
    pieces.forEach(p => {
      map.set(`${p.pos.x},${p.pos.y},${p.pos.z}`, p);
    });
    return map;
  }

  test('allows white kingside castling when conditions met', () => {
    const piecesMap = createPiecesMap([
      { type: 'king', color: 'white', pos: { x: 4, y: 0, z: 0 }, hasMoved: false },
      { type: 'rook', color: 'white', pos: { x: 7, y: 0, z: 0 }, hasMoved: false }
    ]);
    const castlingInfo = {
      type: 'kingside',
      rookFrom: { x: 7, y: 0, z: 0 },
      rookTo: { x: 5, y: 0, z: 0 }
    };
    const kingPos = { x: 4, y: 0, z: 0 };

    const result = canCastle(piecesMap, kingPos, castlingInfo, 'white', false, false);
    expect(result).toBe(true);
  });

  test('allows white queenside castling when conditions met', () => {
    const piecesMap = createPiecesMap([
      { type: 'king', color: 'white', pos: { x: 4, y: 0, z: 0 }, hasMoved: false },
      { type: 'rook', color: 'white', pos: { x: 0, y: 0, z: 0 }, hasMoved: false }
    ]);
    const castlingInfo = {
      type: 'queenside',
      rookFrom: { x: 0, y: 0, z: 0 },
      rookTo: { x: 3, y: 0, z: 0 }
    };
    const kingPos = { x: 4, y: 0, z: 0 };

    const result = canCastle(piecesMap, kingPos, castlingInfo, 'white', false, false);
    expect(result).toBe(true);
  });

  test('prevents castling if king has moved', () => {
    const piecesMap = createPiecesMap([
      { type: 'king', color: 'white', pos: { x: 4, y: 0, z: 0 }, hasMoved: true },
      { type: 'rook', color: 'white', pos: { x: 7, y: 0, z: 0 }, hasMoved: false }
    ]);
    const castlingInfo = {
      type: 'kingside',
      rookFrom: { x: 7, y: 0, z: 0 },
      rookTo: { x: 5, y: 0, z: 0 }
    };
    const kingPos = { x: 4, y: 0, z: 0 };

    const result = canCastle(piecesMap, kingPos, castlingInfo, 'white', true, false);
    expect(result).toBe(false);
  });

  test('prevents castling if rook has moved', () => {
    const piecesMap = createPiecesMap([
      { type: 'king', color: 'white', pos: { x: 4, y: 0, z: 0 }, hasMoved: false },
      { type: 'rook', color: 'white', pos: { x: 7, y: 0, z: 0 }, hasMoved: true }
    ]);
    const castlingInfo = {
      type: 'kingside',
      rookFrom: { x: 7, y: 0, z: 0 },
      rookTo: { x: 5, y: 0, z: 0 }
    };
    const kingPos = { x: 4, y: 0, z: 0 };

    const result = canCastle(piecesMap, kingPos, castlingInfo, 'white', false, true);
    expect(result).toBe(false);
  });

  test('prevents castling if rook is missing', () => {
    const piecesMap = createPiecesMap([
      { type: 'king', color: 'white', pos: { x: 4, y: 0, z: 0 }, hasMoved: false }
    ]);
    const castlingInfo = {
      type: 'kingside',
      rookFrom: { x: 7, y: 0, z: 0 },
      rookTo: { x: 5, y: 0, z: 0 }
    };
    const kingPos = { x: 4, y: 0, z: 0 };

    const result = canCastle(piecesMap, kingPos, castlingInfo, 'white', false, false);
    expect(result).toBe(false);
  });

  test('prevents kingside castling if square f1 is blocked', () => {
    const piecesMap = createPiecesMap([
      { type: 'king', color: 'white', pos: { x: 4, y: 0, z: 0 }, hasMoved: false },
      { type: 'rook', color: 'white', pos: { x: 7, y: 0, z: 0 }, hasMoved: false },
      { type: 'knight', color: 'white', pos: { x: 5, y: 0, z: 0 } }
    ]);
    const castlingInfo = {
      type: 'kingside',
      rookFrom: { x: 7, y: 0, z: 0 },
      rookTo: { x: 5, y: 0, z: 0 }
    };
    const kingPos = { x: 4, y: 0, z: 0 };

    const result = canCastle(piecesMap, kingPos, castlingInfo, 'white', false, false);
    expect(result).toBe(false);
  });

  test('prevents kingside castling if square g1 is blocked', () => {
    const piecesMap = createPiecesMap([
      { type: 'king', color: 'white', pos: { x: 4, y: 0, z: 0 }, hasMoved: false },
      { type: 'rook', color: 'white', pos: { x: 7, y: 0, z: 0 }, hasMoved: false },
      { type: 'knight', color: 'white', pos: { x: 6, y: 0, z: 0 } }
    ]);
    const castlingInfo = {
      type: 'kingside',
      rookFrom: { x: 7, y: 0, z: 0 },
      rookTo: { x: 5, y: 0, z: 0 }
    };
    const kingPos = { x: 4, y: 0, z: 0 };

    const result = canCastle(piecesMap, kingPos, castlingInfo, 'white', false, false);
    expect(result).toBe(false);
  });

  test('prevents queenside castling if square d1 is blocked', () => {
    const piecesMap = createPiecesMap([
      { type: 'king', color: 'white', pos: { x: 4, y: 0, z: 0 }, hasMoved: false },
      { type: 'rook', color: 'white', pos: { x: 0, y: 0, z: 0 }, hasMoved: false },
      { type: 'bishop', color: 'white', pos: { x: 3, y: 0, z: 0 } }
    ]);
    const castlingInfo = {
      type: 'queenside',
      rookFrom: { x: 0, y: 0, z: 0 },
      rookTo: { x: 3, y: 0, z: 0 }
    };
    const kingPos = { x: 4, y: 0, z: 0 };

    const result = canCastle(piecesMap, kingPos, castlingInfo, 'white', false, false);
    expect(result).toBe(false);
  });

  test('prevents queenside castling if square c1 is blocked', () => {
    const piecesMap = createPiecesMap([
      { type: 'king', color: 'white', pos: { x: 4, y: 0, z: 0 }, hasMoved: false },
      { type: 'rook', color: 'white', pos: { x: 0, y: 0, z: 0 }, hasMoved: false },
      { type: 'knight', color: 'white', pos: { x: 2, y: 0, z: 0 } }
    ]);
    const castlingInfo = {
      type: 'queenside',
      rookFrom: { x: 0, y: 0, z: 0 },
      rookTo: { x: 3, y: 0, z: 0 }
    };
    const kingPos = { x: 4, y: 0, z: 0 };

    const result = canCastle(piecesMap, kingPos, castlingInfo, 'white', false, false);
    expect(result).toBe(false);
  });

  test('prevents queenside castling if b1 is blocked', () => {
    // For queenside castling, the path between king (e1) and rook (a1) must be clear
    // This includes b1, c1, d1 (all squares between x=0 and x=4)
    const piecesMap = createPiecesMap([
      { type: 'king', color: 'white', pos: { x: 4, y: 0, z: 0 }, hasMoved: false },
      { type: 'rook', color: 'white', pos: { x: 0, y: 0, z: 0 }, hasMoved: false },
      { type: 'knight', color: 'white', pos: { x: 1, y: 0, z: 0 } }
    ]);
    const castlingInfo = {
      type: 'queenside',
      rookFrom: { x: 0, y: 0, z: 0 },
      rookTo: { x: 3, y: 0, z: 0 }
    };
    const kingPos = { x: 4, y: 0, z: 0 };

    const result = canCastle(piecesMap, kingPos, castlingInfo, 'white', false, false);
    expect(result).toBe(false);
  });

  test('allows black castling when conditions met', () => {
    const piecesMap = createPiecesMap([
      { type: 'king', color: 'black', pos: { x: 4, y: 7, z: 0 }, hasMoved: false },
      { type: 'rook', color: 'black', pos: { x: 7, y: 7, z: 0 }, hasMoved: false }
    ]);
    const castlingInfo = {
      type: 'kingside',
      rookFrom: { x: 7, y: 7, z: 0 },
      rookTo: { x: 5, y: 7, z: 0 }
    };
    const kingPos = { x: 4, y: 7, z: 0 };

    const result = canCastle(piecesMap, kingPos, castlingInfo, 'black', false, false);
    expect(result).toBe(true);
  });
});
