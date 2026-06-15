import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';

/**
 * 9D Chess 3D Visualization Platform
 * 
 * Features:
 * - Nine stacked chess boards floating in 3D space
 * - Full 360° rotation (orbit controls)
 * - Interactive piece placement
 * - Visual highlighting of all possible moves
 * - Coordinate display for better understanding
 */

// Chess piece symbols (Unicode)
const PIECE_SYMBOLS = {
  pawn: { white: '♙', black: '♟' },
  rook: { white: '♖', black: '♜' },
  knight: { white: '♘', black: '♞' },
  bishop: { white: '♗', black: '♝' },
  queen: { white: '♕', black: '♛' },
  king: { white: '♔', black: '♚' }
};

// Board component - represents one 8x8 layer
function ChessBoard({ z, selectedSquare, onSquareClick, highlightedMoves, pieces, showNotation }) {
  const boardSize = 8;
  const squareSize = 1;
  const yOffset = z * 2.5; // Vertical spacing between layers (reduced from 3 to fit 9 boards)

  const squares = [];
  const coordinateLabels = [];
  
  for (let x = 0; x < boardSize; x++) {
    for (let y = 0; y < boardSize; y++) {
      const isBlackSquare = (x + y) % 2 === 1;
      const squareKey = `${x},${y},${z}`;
      const isSelected = selectedSquare === squareKey;
      const isHighlighted = highlightedMoves?.some(m => m.x === x && m.y === y && m.z === z);

      // Color coding based on layer (similar to NineDChessBoard)
      let baseColor = isBlackSquare ? '#555555' : '#cccccc';
      if (isSelected) baseColor = '#4a90e2'; // Blue for selected
      if (isHighlighted) baseColor = '#50c878'; // Green for possible moves

      // Tint based on level
      const levelTints = [
        '#1a1a2e', // z=0 - Dark blue
        '#16213e', // z=1
        '#0f3460', // z=2
        '#533483', // z=3 - Purple
        '#7b2869', // z=4
        '#a91d3a', // z=5 - Red
        '#c73e1d', // z=6
        '#e8751a', // z=7
        '#ffa41b'  // z=8 - Orange
      ];

      squares.push(
        <mesh
          key={squareKey}
          position={[x * squareSize, yOffset, y * squareSize]}
          onClick={() => onSquareClick(x, y, z)}
        >
          <boxGeometry args={[squareSize * 0.95, 0.15, squareSize * 0.95]} />
          <meshStandardMaterial 
            color={baseColor}
            transparent={true}
            opacity={0.85}
            emissive={levelTints[z]}
            emissiveIntensity={0.15}
          />
        </mesh>
      );

      // Add coordinate labels on each square (if enabled)
      if (showNotation) {
        const file = String.fromCharCode(97 + x); // a-h
        const rank = 8 - y; // 8-1
        coordinateLabels.push(
          <Text
            key={`coord-${squareKey}`}
            position={[x * squareSize, yOffset + 0.09, y * squareSize]}
            fontSize={0.12}
            color={isBlackSquare ? '#ffffff' : '#000000'}
            anchorX="center"
            anchorY="middle"
            rotation={[-Math.PI / 2, 0, 0]} // Rotate to lay flat on square
          >
            {`${file}${rank}z${z}`}
          </Text>
        );
      }
    }
  }

  return <group>{squares}{coordinateLabels}</group>;
}

// Chess piece component
function ChessPiece({ x, y, z, type, color }) {
  const yOffset = z * 2.5 + 0.35; // Above the board
  const symbol = PIECE_SYMBOLS[type]?.[color] || '?';

  return (
    <Text
      position={[x, yOffset, y]}
      fontSize={0.6}
      color={color === 'white' ? '#ffffff' : '#1a1a1a'}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.03}
      outlineColor={color === 'white' ? '#000000' : '#ffffff'}
    >
      {symbol}
    </Text>
  );
}

// Coordinate labels
function CoordinateLabels() {
  const labels = [];
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  
  // X-axis labels (files)
  for (let i = 0; i < 8; i++) {
    labels.push(
      <Text
        key={`x-${i}`}
        position={[i, -1, -0.5]}
        fontSize={0.4}
        color="#ffffff"
      >
        {files[i]}
      </Text>
    );
  }

  // Y-axis labels (ranks)
  for (let i = 0; i < 8; i++) {
    labels.push(
      <Text
        key={`y-${i}`}
        position={[-0.5, -1, i]}
        fontSize={0.4}
        color="#ffffff"
      >
        {i + 1}
      </Text>
    );
  }

  // Z-axis labels (layers) - 9 levels
  const layerLabels = ['Bottom', 'Low-1', 'Low-2', 'Mid-1', 'Middle', 'Mid-2', 'High-1', 'High-2', 'Top'];
  for (let i = 0; i < 9; i++) {
    labels.push(
      <Text
        key={`z-${i}`}
        position={[8.5, i * 2.5, 4]}
        fontSize={0.35}
        color="#ffff00"
      >
        {`z${i} (${layerLabels[i]})`}
      </Text>
    );
  }

  return <group>{labels}</group>;
}

// Calculate all possible moves for a piece in 9D space
function calculatePossibleMoves(x, y, z, pieceType, pieces) {
  const moves = [];
  const boardSize = 8;
  const levels = 9;

  const isValidMove = (nx, ny, nz) => {
    if (nx < 0 || nx >= boardSize || ny < 0 || ny >= boardSize || nz < 0 || nz >= levels) {
      return false;
    }
    return true;
  };

  switch (pieceType) {
    case 'knight':
      const knightDeltas = [
        // Traditional 2D moves on same layer
        [2, 1, 0], [2, -1, 0], [-2, 1, 0], [-2, -1, 0],
        [1, 2, 0], [1, -2, 0], [-1, 2, 0], [-1, -2, 0],
        // Layer-jumping moves
        [2, 0, 1], [2, 0, -1], [-2, 0, 1], [-2, 0, -1],
        [0, 2, 1], [0, 2, -1], [0, -2, 1], [0, -2, -1],
        [1, 0, 2], [1, 0, -2], [-1, 0, 2], [-1, 0, -2],
        [0, 1, 2], [0, 1, -2], [0, -1, 2], [0, -1, -2],
      ];

      knightDeltas.forEach(([dx, dy, dz]) => {
        const nx = x + dx;
        const ny = y + dy;
        const nz = z + dz;
        
        const absDeltas = [Math.abs(dx), Math.abs(dy), Math.abs(dz)].sort((a, b) => b - a);
        if (absDeltas[0] === 2 && absDeltas[1] === 1 && absDeltas[2] === 0) {
          if (isValidMove(nx, ny, nz)) {
            moves.push({ x: nx, y: ny, z: nz });
          }
        }
      });
      break;

    case 'rook':
      for (let i = 1; i < boardSize; i++) {
        if (isValidMove(x + i, y, z)) moves.push({ x: x + i, y, z });
        if (isValidMove(x - i, y, z)) moves.push({ x: x - i, y, z });
        if (isValidMove(x, y + i, z)) moves.push({ x, y: y + i, z });
        if (isValidMove(x, y - i, z)) moves.push({ x, y: y - i, z });
      }
      // Along z-axis (all layers)
      for (let nz = 0; nz < levels; nz++) {
        if (nz !== z && isValidMove(x, y, nz)) {
          moves.push({ x, y, z: nz });
        }
      }
      break;

    case 'bishop':
      for (let i = 1; i < boardSize; i++) {
        // Same layer diagonals
        if (isValidMove(x + i, y + i, z)) moves.push({ x: x + i, y: y + i, z });
        if (isValidMove(x + i, y - i, z)) moves.push({ x: x + i, y: y - i, z });
        if (isValidMove(x - i, y + i, z)) moves.push({ x: x - i, y: y + i, z });
        if (isValidMove(x - i, y - i, z)) moves.push({ x: x - i, y: y - i, z });
        
        // 3D diagonals
        if (isValidMove(x + i, y, z + i)) moves.push({ x: x + i, y, z: z + i });
        if (isValidMove(x + i, y, z - i)) moves.push({ x: x + i, y, z: z - i });
        if (isValidMove(x - i, y, z + i)) moves.push({ x: x - i, y, z: z + i });
        if (isValidMove(x - i, y, z - i)) moves.push({ x: x - i, y, z: z - i });
        
        if (isValidMove(x, y + i, z + i)) moves.push({ x, y: y + i, z: z + i });
        if (isValidMove(x, y + i, z - i)) moves.push({ x, y: y + i, z: z - i });
        if (isValidMove(x, y - i, z + i)) moves.push({ x, y: y - i, z: z + i });
        if (isValidMove(x, y - i, z - i)) moves.push({ x, y: y - i, z: z - i });
      }
      break;

    case 'queen':
      const rookMoves = calculatePossibleMoves(x, y, z, 'rook', pieces);
      const bishopMoves = calculatePossibleMoves(x, y, z, 'bishop', pieces);
      moves.push(...rookMoves, ...bishopMoves);
      break;

    case 'king':
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dz = -1; dz <= 1; dz++) {
            if (dx === 0 && dy === 0 && dz === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            const nz = z + dz;
            if (isValidMove(nx, ny, nz)) {
              moves.push({ x: nx, y: ny, z: nz });
            }
          }
        }
      }
      break;

    case 'pawn':
      // Pawns cannot change z in 9D chess
      if (isValidMove(x, y + 1, z)) moves.push({ x, y: y + 1, z });
      if (isValidMove(x, y - 1, z)) moves.push({ x, y: y - 1, z });
      if (isValidMove(x + 1, y + 1, z)) moves.push({ x: x + 1, y: y + 1, z });
      if (isValidMove(x - 1, y + 1, z)) moves.push({ x: x - 1, y: y + 1, z });
      if (isValidMove(x + 1, y - 1, z)) moves.push({ x: x + 1, y: y - 1, z });
      if (isValidMove(x - 1, y - 1, z)) moves.push({ x: x - 1, y: y - 1, z });
      break;

    default:
      break;
  }

  return moves;
}

// Main 9D Visualizer Component
export default function NineDVisualizer() {
  const [pieces, setPieces] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [highlightedMoves, setHighlightedMoves] = useState([]);
  const [selectedPieceType, setSelectedPieceType] = useState('knight');
  const [selectedColor, setSelectedColor] = useState('white');
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [showNotation, setShowNotation] = useState(false);
  const [isPrecisionMode, setIsPrecisionMode] = useState(true);

  // Keyboard shortcut: Hold Spacebar to unlock free rotation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Hold Spacebar to unlock Free Spin mode
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault(); // Prevent page scroll
        setIsPrecisionMode(false);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPrecisionMode(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleSquareClick = (x, y, z) => {
    const squareKey = `${x},${y},${z}`;

    const existingPieceIndex = pieces.findIndex(
      p => p.x === x && p.y === y && p.z === z
    );

    if (existingPieceIndex >= 0) {
      const piece = pieces[existingPieceIndex];
      setSelectedSquare(squareKey);
      const moves = calculatePossibleMoves(x, y, z, piece.type, pieces);
      setHighlightedMoves(moves);
    } else {
      const newPiece = {
        x,
        y,
        z,
        type: selectedPieceType,
        color: selectedColor
      };
      setPieces([...pieces, newPiece]);
      setSelectedSquare(squareKey);
      
      const moves = calculatePossibleMoves(x, y, z, selectedPieceType, pieces);
      setHighlightedMoves(moves);
    }
  };

  const clearBoard = () => {
    setPieces([]);
    setSelectedSquare(null);
    setHighlightedMoves([]);
  };

  const loadInitialPosition = () => {
    const initialPieces = [];
    
    // White pieces on levels 6, 7, 8
    const whiteLevels = [6, 7, 8];
    whiteLevels.forEach(z => {
      // Pawns on rank 1
      for (let x = 0; x < 8; x++) {
        initialPieces.push({ x, y: 1, z, type: 'pawn', color: 'white' });
      }
      // Back rank on rank 0
      const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
      backRank.forEach((type, x) => {
        initialPieces.push({ x, y: 0, z, type, color: 'white' });
      });
    });

    // Black pieces on levels 0, 1, 2
    const blackLevels = [0, 1, 2];
    blackLevels.forEach(z => {
      // Pawns on rank 6
      for (let x = 0; x < 8; x++) {
        initialPieces.push({ x, y: 6, z, type: 'pawn', color: 'black' });
      }
      // Back rank on rank 7
      const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
      backRank.forEach((type, x) => {
        initialPieces.push({ x, y: 7, z, type, color: 'black' });
      });
    });

    setPieces(initialPieces);
    setSelectedSquare(null);
    setHighlightedMoves([]);
  };

  const removePiece = () => {
    if (selectedSquare) {
      const [x, y, z] = selectedSquare.split(',').map(Number);
      setPieces(pieces.filter(p => !(p.x === x && p.y === y && p.z === z)));
      setSelectedSquare(null);
      setHighlightedMoves([]);
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', background: '#0a0a0a', position: 'relative' }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        color: '#ffffff',
        fontSize: '32px',
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(255, 164, 27, 0.8)'
      }}>
        9D Chess - 3D Visualizer
      </div>

      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.95)',
        padding: controlsCollapsed ? '10px' : '20px',
        borderRadius: '10px',
        color: 'white',
        pointerEvents: 'auto',
        maxWidth: controlsCollapsed ? '60px' : '320px',
        transition: 'all 0.3s ease',
        border: '2px solid rgba(255, 164, 27, 0.5)'
      }}>
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setControlsCollapsed(!controlsCollapsed)}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(255, 164, 27, 0.8)',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer',
            padding: '5px 10px',
            fontSize: '16px'
          }}
        >
          {controlsCollapsed ? '►' : '◄'}
        </button>

        {!controlsCollapsed && (
          <>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#ffa41b' }}>🎮 Controls</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Piece Type:</label>
              <select
                value={selectedPieceType}
                onChange={(e) => setSelectedPieceType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '5px',
                  border: '1px solid #444',
                  background: '#222',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="pawn">♙ Pawn</option>
                <option value="knight">♘ Knight</option>
                <option value="bishop">♗ Bishop</option>
                <option value="rook">♖ Rook</option>
                <option value="queen">♕ Queen</option>
                <option value="king">♔ King</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Color:</label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '5px',
                  border: '1px solid #444',
                  background: '#222',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="white">⚪ White</option>
                <option value="black">⚫ Black</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showNotation}
                  onChange={(e) => setShowNotation(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <span>Show Square Notation</span>
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={loadInitialPosition}
                style={{
                  padding: '10px',
                  borderRadius: '5px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🎯 Load 9D Starting Position
              </button>
              
              <button
                onClick={removePiece}
                disabled={!selectedSquare}
                style={{
                  padding: '10px',
                  borderRadius: '5px',
                  border: 'none',
                  background: selectedSquare ? 'rgba(231, 76, 60, 0.8)' : 'rgba(100, 100, 100, 0.5)',
                  color: 'white',
                  cursor: selectedSquare ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
              >
                🗑️ Remove Selected Piece
              </button>
              
              <button
                onClick={clearBoard}
                style={{
                  padding: '10px',
                  borderRadius: '5px',
                  border: 'none',
                  background: 'rgba(231, 76, 60, 0.6)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🔄 Clear Board
              </button>
            </div>

            <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255, 164, 27, 0.1)', borderRadius: '5px', fontSize: '12px' }}>
              <strong>💡 Tips:</strong>
              <div style={{ marginTop: '5px' }}>• Click any square to place a piece</div>
              <div>• Click a piece to see its possible moves (green)</div>
              <div style={{ marginTop: '5px', color: '#ffa41b', fontWeight: 'bold' }}>⌨️ Hold SPACEBAR to rotate the board freely!</div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '11px', color: '#888' }}>
              <div>Pieces: {pieces.length}</div>
              <div>Selected: {selectedSquare || 'None'}</div>
            </div>
          </>
        )}
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [10, 15, 15], fov: 50 }}
        style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 20, 10]} intensity={0.8} />
        <pointLight position={[-10, 15, -10]} intensity={0.5} color="#ffa41b" />

        {/* Render all 9 boards */}
        {Array.from({ length: 9 }, (_, z) => (
          <ChessBoard
            key={z}
            z={z}
            selectedSquare={selectedSquare}
            onSquareClick={handleSquareClick}
            highlightedMoves={highlightedMoves}
            pieces={pieces}
            showNotation={showNotation}
          />
        ))}

        {/* Render all pieces */}
        {pieces.map((piece, idx) => (
          <ChessPiece key={idx} {...piece} />
        ))}

        {/* Coordinate labels */}
        <CoordinateLabels />

        {/* Controls - Hold Spacebar for Free Rotation */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={!isPrecisionMode}
          enableDamping={!isPrecisionMode}
          dampingFactor={0.05}
          minDistance={8}
          maxDistance={40}
          rotateSpeed={isPrecisionMode ? 0 : 0.8}
        />
      </Canvas>

      {/* Precision Mode Indicator */}
      <div style={{
        position: 'absolute',
        top: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: isPrecisionMode 
          ? 'rgba(76, 175, 80, 0.9)' 
          : 'rgba(255, 164, 27, 0.9)',
        padding: '10px 20px',
        borderRadius: '20px',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
        transition: 'all 0.2s ease',
        border: '2px solid rgba(255, 255, 255, 0.3)'
      }}>
        {isPrecisionMode ? '🔒 Precision Mode (Hold SPACE to rotate)' : '🌀 Free Spin Mode (Release to lock)'}
      </div>
    </div>
  );
}
