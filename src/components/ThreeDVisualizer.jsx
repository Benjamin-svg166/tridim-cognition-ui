import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';

/**
 * 3D Chess Visualization Platform
 * 
 * Features:
 * - Three stacked chess boards floating in 3D space
 * - Full 360° rotation (orbit controls)
 * - View from top-down or bottom-up
 * - Click to place pieces
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
function ChessBoard({ z, selectedSquare, onSquareClick, highlightedMoves, pieces }) {
  const boardSize = 8;
  const squareSize = 1;
  const yOffset = z * 3; // Vertical spacing between layers

  const squares = [];
  const coordinateLabels = [];
  
  for (let x = 0; x < boardSize; x++) {
    for (let y = 0; y < boardSize; y++) {
      const isBlackSquare = (x + y) % 2 === 1;
      const squareKey = `${x},${y},${z}`;
      const isSelected = selectedSquare === squareKey;
      const isHighlighted = highlightedMoves?.some(m => m.x === x && m.y === y && m.z === z);

      let color = isBlackSquare ? '#555555' : '#cccccc';
      if (isSelected) color = '#4a90e2'; // Blue for selected
      if (isHighlighted) color = '#50c878'; // Green for possible moves

      squares.push(
        <mesh
          key={squareKey}
          position={[x * squareSize, yOffset, y * squareSize]}
          onClick={() => onSquareClick(x, y, z)}
        >
          <boxGeometry args={[squareSize * 0.95, 0.1, squareSize * 0.95]} />
          <meshStandardMaterial 
            color={color} 
            transparent={z !== 0}
            opacity={z === 0 ? 1 : 0.7}
          />
        </mesh>
      );

      // Add coordinate labels on each square
      coordinateLabels.push(
        <Text
          key={`coord-${squareKey}`}
          position={[x * squareSize, yOffset + 0.06, y * squareSize]}
          fontSize={0.15}
          color={isBlackSquare ? '#ffffff' : '#000000'}
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]} // Rotate to lay flat on square
        >
          {`${x},${y},${z}`}
        </Text>
      );
    }
  }

  return <group>{squares}{coordinateLabels}</group>;
}

// Chess piece component
function ChessPiece({ x, y, z, type, color }) {
  const yOffset = z * 3 + 0.3; // Above the board
  const symbol = PIECE_SYMBOLS[type]?.[color] || '?';

  return (
    <Text
      position={[x, yOffset, y]}
      fontSize={0.6}
      color={color === 'white' ? '#ffffff' : '#000000'}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.02}
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

  // Z-axis labels (layers)
  for (let i = 0; i < 3; i++) {
    labels.push(
      <Text
        key={`z-${i}`}
        position={[8.5, i * 3, 4]}
        fontSize={0.4}
        color="#ffff00"
      >
        Layer {i}
      </Text>
    );
  }

  return <group>{labels}</group>;
}

// Calculate all possible moves for a piece
function calculatePossibleMoves(x, y, z, pieceType, pieces) {
  const moves = [];
  const boardSize = 8;

  // Helper to check if position is valid and not occupied by same color piece
  const isValidMove = (nx, ny, nz) => {
    if (nx < 0 || nx >= boardSize || ny < 0 || ny >= boardSize || nz < 0 || nz >= 3) {
      return false;
    }
    // Could add piece collision detection here
    return true;
  };

  switch (pieceType) {
    case 'knight':
      // Knight moves in L-shape across all 3 dimensions
      const knightDeltas = [
        // Traditional 2D moves on same layer
        [2, 1, 0], [2, -1, 0], [-2, 1, 0], [-2, -1, 0],
        [1, 2, 0], [1, -2, 0], [-1, 2, 0], [-1, -2, 0],
        // Layer-jumping moves (2 in one dimension, 1 in another, includes z)
        [2, 0, 1], [2, 0, -1], [-2, 0, 1], [-2, 0, -1],
        [0, 2, 1], [0, 2, -1], [0, -2, 1], [0, -2, -1],
        [1, 0, 2], [1, 0, -2], [-1, 0, 2], [-1, 0, -2],
        [0, 1, 2], [0, 1, -2], [0, -1, 2], [0, -1, -2],
        // Diagonal layer jumps
        [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
        [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
        [2, 1, 1], [2, 1, -1], [2, -1, 1], [2, -1, -1],
        [-2, 1, 1], [-2, 1, -1], [-2, -1, 1], [-2, -1, -1],
        [1, 2, 1], [1, 2, -1], [-1, 2, 1], [-1, 2, -1],
        [1, -2, 1], [1, -2, -1], [-1, -2, 1], [-1, -2, -1]
      ];

      knightDeltas.forEach(([dx, dy, dz]) => {
        const nx = x + dx;
        const ny = y + dy;
        const nz = z + dz;
        
        // Check if it's a valid L-shape: exactly 3 squares total, distributed as 2+1
        const absDeltas = [Math.abs(dx), Math.abs(dy), Math.abs(dz)].sort((a, b) => b - a);
        if (absDeltas[0] === 2 && absDeltas[1] === 1 && absDeltas[2] === 0) {
          if (isValidMove(nx, ny, nz)) {
            moves.push({ x: nx, y: ny, z: nz });
          }
        }
      });
      break;

    case 'rook':
      // Rook moves in straight lines along x, y, or z axis
      for (let i = 1; i < boardSize; i++) {
        // Along x-axis (same y, z)
        if (isValidMove(x + i, y, z)) moves.push({ x: x + i, y, z });
        if (isValidMove(x - i, y, z)) moves.push({ x: x - i, y, z });
        // Along y-axis (same x, z)
        if (isValidMove(x, y + i, z)) moves.push({ x, y: y + i, z });
        if (isValidMove(x, y - i, z)) moves.push({ x, y: y - i, z });
      }
      // Along z-axis (all layers, same x and y position)
      for (let nz = 0; nz < 3; nz++) {
        if (nz !== z && isValidMove(x, y, nz)) {
          moves.push({ x, y, z: nz });
        }
      }
      break;

    case 'bishop':
      // Bishop moves diagonally in 3D space
      for (let i = 1; i < boardSize; i++) {
        // Same layer diagonals (z doesn't change)
        if (isValidMove(x + i, y + i, z)) moves.push({ x: x + i, y: y + i, z });
        if (isValidMove(x + i, y - i, z)) moves.push({ x: x + i, y: y - i, z });
        if (isValidMove(x - i, y + i, z)) moves.push({ x: x - i, y: y + i, z });
        if (isValidMove(x - i, y - i, z)) moves.push({ x: x - i, y: y - i, z });
        
        // 3D diagonals - two dimensions change, one stays same
        // X-Z diagonals (y constant)
        if (isValidMove(x + i, y, z + i)) moves.push({ x: x + i, y, z: z + i });
        if (isValidMove(x + i, y, z - i)) moves.push({ x: x + i, y, z: z - i });
        if (isValidMove(x - i, y, z + i)) moves.push({ x: x - i, y, z: z + i });
        if (isValidMove(x - i, y, z - i)) moves.push({ x: x - i, y, z: z - i });
        
        // Y-Z diagonals (x constant)
        if (isValidMove(x, y + i, z + i)) moves.push({ x, y: y + i, z: z + i });
        if (isValidMove(x, y + i, z - i)) moves.push({ x, y: y + i, z: z - i });
        if (isValidMove(x, y - i, z + i)) moves.push({ x, y: y - i, z: z + i });
        if (isValidMove(x, y - i, z - i)) moves.push({ x, y: y - i, z: z - i });
        
        // Full 3D diagonals (all three axes change by same amount)
        if (isValidMove(x + i, y + i, z + i)) moves.push({ x: x + i, y: y + i, z: z + i });
        if (isValidMove(x + i, y + i, z - i)) moves.push({ x: x + i, y: y + i, z: z - i });
        if (isValidMove(x + i, y - i, z + i)) moves.push({ x: x + i, y: y - i, z: z + i });
        if (isValidMove(x + i, y - i, z - i)) moves.push({ x: x + i, y: y - i, z: z - i });
        if (isValidMove(x - i, y + i, z + i)) moves.push({ x: x - i, y: y + i, z: z + i });
        if (isValidMove(x - i, y + i, z - i)) moves.push({ x: x - i, y: y + i, z: z - i });
        if (isValidMove(x - i, y - i, z + i)) moves.push({ x: x - i, y: y - i, z: z + i });
        if (isValidMove(x - i, y - i, z - i)) moves.push({ x: x - i, y: y - i, z: z - i });
      }
      break;

    case 'queen':
      // Queen combines rook and bishop moves
      const rookMoves = calculatePossibleMoves(x, y, z, 'rook', pieces);
      const bishopMoves = calculatePossibleMoves(x, y, z, 'bishop', pieces);
      moves.push(...rookMoves, ...bishopMoves);
      break;

    case 'king':
      // King moves one square in any direction (including diagonally through layers)
      // This generates all 26 surrounding positions (3x3x3 cube minus center)
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dz = -1; dz <= 1; dz++) {
            if (dx === 0 && dy === 0 && dz === 0) continue; // Skip current position
            const nx = x + dx;
            const ny = y + dy;
            const nz = z + dz;
            
            // Check bounds explicitly for clarity
            if (nx >= 0 && nx < boardSize && 
                ny >= 0 && ny < boardSize && 
                nz >= 0 && nz < 3) {
              moves.push({ x: nx, y: ny, z: nz });
            }
          }
        }
      }
      break;

    case 'pawn':
      // Pawn moves forward one square on SAME LAYER ONLY (cannot change z-axis)
      // White pawns move in +y direction, black in -y direction
      // Simplified: show both directions for visualization (actual game would check color)
      
      // Forward one square (same layer)
      if (isValidMove(x, y + 1, z)) moves.push({ x, y: y + 1, z });
      if (isValidMove(x, y - 1, z)) moves.push({ x, y: y - 1, z });
      
      // Diagonal captures (same layer only)
      if (isValidMove(x + 1, y + 1, z)) moves.push({ x: x + 1, y: y + 1, z });
      if (isValidMove(x - 1, y + 1, z)) moves.push({ x: x - 1, y: y + 1, z });
      if (isValidMove(x + 1, y - 1, z)) moves.push({ x: x + 1, y: y - 1, z });
      if (isValidMove(x - 1, y - 1, z)) moves.push({ x: x - 1, y: y - 1, z });
      
      // NOTE: Pawns CANNOT move to different layers (z-axis restricted)
      // This matches the 3D chess game rules
      break;

    default:
      break;
  }

  return moves;
}

// Main 3D Visualizer Component
export default function ThreeDVisualizer() {
  const [pieces, setPieces] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [highlightedMoves, setHighlightedMoves] = useState([]);
  const [selectedPieceType, setSelectedPieceType] = useState('knight');
  const [selectedColor, setSelectedColor] = useState('white');
  const [controlsCollapsed, setControlsCollapsed] = useState(false);

  const handleSquareClick = (x, y, z) => {
    const squareKey = `${x},${y},${z}`;

    // Check if there's already a piece here
    const existingPieceIndex = pieces.findIndex(
      p => p.x === x && p.y === y && p.z === z
    );

    if (existingPieceIndex >= 0) {
      // Clicking on existing piece - select it and show moves
      const piece = pieces[existingPieceIndex];
      setSelectedSquare(squareKey);
      const moves = calculatePossibleMoves(x, y, z, piece.type, pieces);
      setHighlightedMoves(moves);
    } else {
      // Clicking on empty square - place selected piece
      const newPiece = {
        x,
        y,
        z,
        type: selectedPieceType,
        color: selectedColor
      };
      setPieces([...pieces, newPiece]);
      setSelectedSquare(squareKey);
      
      // Show possible moves for the newly placed piece
      const moves = calculatePossibleMoves(x, y, z, selectedPieceType, pieces);
      setHighlightedMoves(moves);
    }
  };

  const clearBoard = () => {
    setPieces([]);
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
    <div style={{ width: '100%', height: '100vh', background: '#1a1a1a', position: 'relative' }}>
      {/* Control Panel - Collapsible */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.9)',
        padding: controlsCollapsed ? '10px' : '20px',
        borderRadius: '10px',
        color: 'white',
        pointerEvents: 'auto',
        maxWidth: controlsCollapsed ? '60px' : '280px',
        transition: 'all 0.3s ease'
      }}>
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setControlsCollapsed(!controlsCollapsed)}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(74, 144, 226, 0.8)',
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
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>3D Chess Visualizer</h3>
        
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Piece:</label>
              <select 
                value={selectedPieceType} 
                onChange={(e) => setSelectedPieceType(e.target.value)}
                style={{ padding: '5px', width: '100%', marginBottom: '10px', fontSize: '12px' }}
              >
                <option value="pawn">Pawn</option>
                <option value="knight">Knight</option>
                <option value="bishop">Bishop</option>
                <option value="rook">Rook</option>
                <option value="queen">Queen</option>
                <option value="king">King</option>
              </select>

              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Color:</label>
              <select 
                value={selectedColor} 
                onChange={(e) => setSelectedColor(e.target.value)}
                style={{ padding: '5px', width: '100%', fontSize: '12px' }}
              >
                <option value="white">White</option>
                <option value="black">Black</option>
              </select>
            </div>

            <button 
              onClick={clearBoard}
              style={{
                padding: '8px',
                width: '100%',
                marginBottom: '8px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear Board
            </button>

            <button 
              onClick={removePiece}
              style={{
                padding: '8px',
                width: '100%',
                cursor: 'pointer',
                opacity: selectedSquare ? 1 : 0.5,
                fontSize: '12px',
                marginBottom: '10px'
              }}
              disabled={!selectedSquare}
            >
              Remove Piece
            </button>

            <div style={{ fontSize: '11px', color: '#aaa', lineHeight: '1.4' }}>
              <p style={{ margin: '5px 0' }}><strong>Controls:</strong></p>
              <p style={{ margin: '3px 0' }}>• Drag: Rotate 360°</p>
              <p style={{ margin: '3px 0' }}>• Right-click: Pan</p>
              <p style={{ margin: '3px 0' }}>• Scroll: Zoom</p>
              <p style={{ margin: '3px 0' }}>• Click: Place/Select</p>
              <p style={{ margin: '3px 0' }}><span style={{ color: '#50c878' }}>■</span> Possible moves</p>
              <p style={{ margin: '3px 0' }}><span style={{ color: '#4a90e2' }}>■</span> Selected</p>
            </div>

            {selectedSquare && (
              <div style={{ 
                marginTop: '10px', 
                padding: '8px', 
                background: 'rgba(74, 144, 226, 0.3)',
                borderRadius: '5px',
                fontSize: '11px'
              }}>
                <strong>Selected:</strong> ({selectedSquare})
                <br />
                <strong>Moves:</strong> {highlightedMoves.length}
              </div>
            )}
          </>
        )}
      </div>

      {/* 3D Canvas */}
      <Canvas 
        camera={{ position: [12, 12, 12], fov: 50 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* Orbit Controls - allows 360° rotation */}
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={30}
        />

        {/* Three Chess Boards */}
        <ChessBoard 
          z={0} 
          selectedSquare={selectedSquare}
          onSquareClick={handleSquareClick}
          highlightedMoves={highlightedMoves}
          pieces={pieces}
        />
        <ChessBoard 
          z={1} 
          selectedSquare={selectedSquare}
          onSquareClick={handleSquareClick}
          highlightedMoves={highlightedMoves}
          pieces={pieces}
        />
        <ChessBoard 
          z={2} 
          selectedSquare={selectedSquare}
          onSquareClick={handleSquareClick}
          highlightedMoves={highlightedMoves}
          pieces={pieces}
        />

        {/* Render all pieces */}
        {pieces.map((piece, idx) => (
          <ChessPiece key={idx} {...piece} />
        ))}

        {/* Coordinate Labels */}
        <CoordinateLabels />

        {/* Reference Grid */}
        <Grid 
          args={[20, 20]} 
          position={[4, -2, 4]}
          cellColor="#444444"
          sectionColor="#666666"
        />
      </Canvas>
    </div>
  );
}
