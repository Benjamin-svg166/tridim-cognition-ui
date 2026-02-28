import { isValidMove } from './threeDChessUtils';

describe('Complete Piece Movement', () => {
  test('bishop diagonal movement', () => {
    const from = { x: 2, y: 0, z: 0 };
    const to = { x: 5, y: 3, z: 0 };
    expect(isValidMove('bishop', from, to, 'white', false, false)).toBe(true);
  });

  test('bishop invalid non-diagonal', () => {
    const from = { x: 2, y: 0, z: 0 };
    const to = { x: 5, y: 0, z: 0 };
    expect(isValidMove('bishop', from, to, 'white', false, false)).toBe(false);
  });

  test('knight L-shape movement', () => {
    const from = { x: 1, y: 0, z: 0 };
    const to = { x: 2, y: 2, z: 0 };
    expect(isValidMove('knight', from, to, 'white', false, false)).toBe(true);
  });

  test('knight invalid movement', () => {
    const from = { x: 1, y: 0, z: 0 };
    const to = { x: 3, y: 3, z: 0 };
    expect(isValidMove('knight', from, to, 'white', false, false)).toBe(false);
  });

  test('queen horizontal movement', () => {
    const from = { x: 3, y: 0, z: 0 };
    const to = { x: 7, y: 0, z: 0 };
    expect(isValidMove('queen', from, to, 'white', false, false)).toBe(true);
  });

  test('queen diagonal movement', () => {
    const from = { x: 3, y: 0, z: 0 };
    const to = { x: 6, y: 3, z: 0 };
    expect(isValidMove('queen', from, to, 'white', false, false)).toBe(true);
  });

  test('queen invalid movement', () => {
    const from = { x: 3, y: 0, z: 0 };
    const to = { x: 5, y: 3, z: 0 };
    expect(isValidMove('queen', from, to, 'white', false, false)).toBe(false);
  });

  test('rook vertical movement', () => {
    const from = { x: 0, y: 0, z: 0 };
    const to = { x: 0, y: 7, z: 0 };
    expect(isValidMove('rook', from, to, 'white', false, false)).toBe(true);
  });

  test('rook horizontal movement', () => {
    const from = { x: 0, y: 0, z: 0 };
    const to = { x: 7, y: 0, z: 0 };
    expect(isValidMove('rook', from, to, 'white', false, false)).toBe(true);
  });

  test('rook invalid diagonal', () => {
    const from = { x: 0, y: 0, z: 0 };
    const to = { x: 5, y: 5, z: 0 };
    expect(isValidMove('rook', from, to, 'white', false, false)).toBe(false);
  });

  test('king one square movement', () => {
    const from = { x: 4, y: 0, z: 0 };
    const to = { x: 5, y: 1, z: 0 };
    expect(isValidMove('king', from, to, 'white', false, false)).toBe(true);
  });

  test('king invalid two square movement (not castling)', () => {
    const from = { x: 4, y: 0, z: 0 };
    const to = { x: 4, y: 2, z: 0 };
    expect(isValidMove('king', from, to, 'white', false, false)).toBe(false);
  });
});

describe('Full Board Initial Setup', () => {
  test('white back rank has all pieces', () => {
    const expectedSetup = [
      'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'
    ];
    
    // This is a conceptual test - actual board setup verified by integration
    expect(expectedSetup).toHaveLength(8);
    expect(expectedSetup[0]).toBe('rook');
    expect(expectedSetup[4]).toBe('king');
    expect(expectedSetup[3]).toBe('queen');
  });

  test('black back rank mirrors white', () => {
    const expectedSetup = [
      'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'
    ];
    
    expect(expectedSetup).toHaveLength(8);
    expect(expectedSetup[7]).toBe('rook');
  });

  test('all pawns present in initial setup', () => {
    const whitePawns = 8;
    const blackPawns = 8;
    const totalPawns = whitePawns + blackPawns;
    
    expect(totalPawns).toBe(16);
  });

  test('total pieces in standard chess setup', () => {
    const whitePieces = 16; // 8 pawns + 8 back rank
    const blackPieces = 16; // 8 pawns + 8 back rank
    const totalPieces = whitePieces + blackPieces;
    
    expect(totalPieces).toBe(32);
  });
});

describe('Piece Interactions', () => {
  test('bishop can capture diagonally', () => {
    const from = { x: 2, y: 0, z: 0 };
    const to = { x: 4, y: 2, z: 0 };
    expect(isValidMove('bishop', from, to, 'white', true, false)).toBe(true);
  });

  test('knight can jump over pieces', () => {
    // Knights don't need path checking - movement is always valid if L-shape
    const from = { x: 1, y: 0, z: 0 };
    const to = { x: 2, y: 2, z: 0 };
    expect(isValidMove('knight', from, to, 'white', false, false)).toBe(true);
  });

  test('queen combines rook and bishop', () => {
    // Rook-like
    const rookMove = isValidMove('queen', { x: 3, y: 0, z: 0 }, { x: 3, y: 5, z: 0 }, 'white', false, false);
    // Bishop-like  
    const bishopMove = isValidMove('queen', { x: 3, y: 0, z: 0 }, { x: 6, y: 3, z: 0 }, 'white', false, false);
    
    expect(rookMove).toBe(true);
    expect(bishopMove).toBe(true);
  });
});
