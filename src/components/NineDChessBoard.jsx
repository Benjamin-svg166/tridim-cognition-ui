import React, { useCallback, useEffect, useRef, useState } from 'react';
import { isValidMove, isPathClear } from './nineDChessUtils';

// Unicode chess piece symbols
const getChessPiece = (type, color) => {
  const pieces = {
    white: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙'
    },
    black: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟'
    }
  };
  return pieces[color][type] || '?';
};

// Nine-Dimensional Chess Board Component - 9 stacked boards (z=0 to z=8)
const NineDChessBoard = ({ size = 8, levels = 9, canvasSize = 240, showControlPanel = true, compactMode = false, showBoards = true }) => {
  const canvasesRef = useRef([]);
  const markersRef = useRef(Array.from({ length: levels }, () => []));
  const piecesRef = useRef(new Map()); // key: "x,y,z" -> piece
  const selectedRef = useRef(null);
  const [activeLevel, setActiveLevel] = useState(8); // Start with top board (white pieces) active
  const [version, setVersion] = useState(0); // bump to trigger redraw
  const [toMove, setToMove] = useState('white'); // 'white' or 'black'
  const [moveHistory, setMoveHistory] = useState([]); // array of { from, to, piece, capColor }
  const moveHistoryRef = useRef([]); // Ref to track current moveHistory without causing re-renders
  const [viewMode, setViewMode] = useState('all'); // 'single', 'three', 'all', 'split'

  const hasInitialized = useRef(false);
  const lastRenderedVersion = useRef(-1);

  // Sync moveHistoryRef with moveHistory state
  useEffect(() => {
    moveHistoryRef.current = moveHistory;
  }, [moveHistory]);

  // Initialize pieces for 9D chess
  const initializePieces = useCallback(() => {
    const startPieces = new Map();

    // WHITE PIECES (Top 3 levels: z=8, z=7, z=6)
    const whiteLevels = [8, 7, 6];
    whiteLevels.forEach(z => {
      // Back rank (y=0) - Full set on each level
      startPieces.set(`0,0,${z}`, { type: 'rook', color: 'white', hasMoved: false });
      startPieces.set(`1,0,${z}`, { type: 'knight', color: 'white', hasMoved: false });
      startPieces.set(`2,0,${z}`, { type: 'bishop', color: 'white', hasMoved: false });
      startPieces.set(`3,0,${z}`, { type: 'queen', color: 'white', hasMoved: false });
      startPieces.set(`4,0,${z}`, { type: 'king', color: 'white', hasMoved: false });
      startPieces.set(`5,0,${z}`, { type: 'bishop', color: 'white', hasMoved: false });
      startPieces.set(`6,0,${z}`, { type: 'knight', color: 'white', hasMoved: false });
      startPieces.set(`7,0,${z}`, { type: 'rook', color: 'white', hasMoved: false });
      
      // Pawns (y=1) - 8 pawns on each level
      for (let x = 0; x < 8; x++) {
        startPieces.set(`${x},1,${z}`, { type: 'pawn', color: 'white', hasMoved: false });
      }
    });

    // BLACK PIECES (Bottom 3 levels: z=2, z=1, z=0)
    const blackLevels = [2, 1, 0];
    blackLevels.forEach(z => {
      // Pawns (y=6) - 8 pawns on each level
      for (let x = 0; x < 8; x++) {
        startPieces.set(`${x},6,${z}`, { type: 'pawn', color: 'black', hasMoved: false });
      }
      
      // Back rank (y=7) - Full set on each level
      startPieces.set(`0,7,${z}`, { type: 'rook', color: 'black', hasMoved: false });
      startPieces.set(`1,7,${z}`, { type: 'knight', color: 'black', hasMoved: false });
      startPieces.set(`2,7,${z}`, { type: 'bishop', color: 'black', hasMoved: false });
      startPieces.set(`3,7,${z}`, { type: 'queen', color: 'black', hasMoved: false });
      startPieces.set(`4,7,${z}`, { type: 'king', color: 'black', hasMoved: false });
      startPieces.set(`5,7,${z}`, { type: 'bishop', color: 'black', hasMoved: false });
      startPieces.set(`6,7,${z}`, { type: 'knight', color: 'black', hasMoved: false });
      startPieces.set(`7,7,${z}`, { type: 'rook', color: 'black', hasMoved: false });
    });

    // Levels 3, 4, 5 remain empty (neutral zone)

    piecesRef.current = startPieces;
    setVersion(v => v + 1);
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      initializePieces();
      hasInitialized.current = true;
    }
  }, [initializePieces]);

  // Get board label for each level
  const getBoardLabel = (z) => {
    const labels = [
      "Foundation (Black Elite)",
      "Lower (Black Guard)",
      "Deep (Black Base)",
      "Mid-Low (Reserve)",
      "Center (Neutral)",
      "Mid-High (Reserve)",
      "High (White Base)",
      "Upper (White Guard)",
      "Celestial (White Elite)"
    ];
    return `Level ${z}: ${labels[z]}`;
  };

  // Get layer opacity based on distance from active level
  const getLayerOpacity = useCallback((z) => {
    if (viewMode === 'single' && z !== activeLevel) return 0;
    const distance = Math.abs(z - activeLevel);
    if (distance === 0) return 0.20;
    if (distance === 1) return 0.14;
    if (distance === 2) return 0.10;
    if (distance === 3) return 0.07;
    return 0.04;
  }, [viewMode, activeLevel]);

  // Get background tint based on level (territorial coloring)
  const getLevelTint = (z) => {
    if (z >= 6) return 'rgba(255, 245, 230, 1)';
    if (z <= 2) return 'rgba(230, 240, 255, 1)';
    return 'rgba(250, 250, 250, 1)';
  };

  const renderBoard = useCallback((canvas, z) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const squareSize = canvasSize / size;
    const isActive = z === activeLevel;
    const opacity = getLayerOpacity(z);

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // Background tint
    ctx.fillStyle = getLevelTint(z);
    ctx.globalAlpha = opacity;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.globalAlpha = 1.0;

    // Checkerboard pattern
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const isLight = (x + y) % 2 === 0;
        ctx.fillStyle = isLight ? 
          `rgba(240, 217, 181, ${opacity})` : 
          `rgba(181, 136, 99, ${opacity})`;
        ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
      }
    }

    // Draw grid lines
    const gridOpacity = isActive ? 0.6 : 0.3;
    ctx.strokeStyle = `rgba(102, 102, 102, ${gridOpacity})`;
    ctx.lineWidth = 1;
    for (let i = 0; i <= size; i++) {
      ctx.beginPath();
      ctx.moveTo(i * squareSize, 0);
      ctx.lineTo(i * squareSize, canvasSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * squareSize);
      ctx.lineTo(canvasSize, i * squareSize);
      ctx.stroke();
    }

    // Highlight selected square
    if (selectedRef.current && selectedRef.current.z === z && isActive) {
      const { x, y } = selectedRef.current;
      ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
      ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    }

    // Draw markers (valid moves)
    markersRef.current[z].forEach(marker => {
      const { x, y, color: markerColor } = marker;
      ctx.fillStyle = markerColor || 'rgba(0, 255, 0, 0.3)';
      ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    });

    // Draw pieces on this level
    piecesRef.current.forEach((piece, key) => {
      const [px, py, pz] = key.split(',').map(Number);
      if (pz !== z) return;

      const pieceSymbol = getChessPiece(piece.type, piece.color);
      ctx.font = 'bold 13px Arial';
      ctx.fillStyle = piece.color === 'white' ? '#ffffff' : '#1a1a1a';
      ctx.strokeStyle = piece.color === 'white' ? '#000000' : '#ffffff';
      ctx.lineWidth = 2.5;

      const centerX = px * squareSize + squareSize / 2;
      const centerY = py * squareSize + squareSize / 2 + 5;

      ctx.shadowBlur = 3;
      ctx.shadowColor = piece.color === 'white' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
      ctx.strokeText(pieceSymbol, centerX - 6, centerY);
      ctx.fillText(pieceSymbol, centerX - 6, centerY);
      ctx.shadowBlur = 0;
    });

  }, [size, canvasSize, activeLevel, getLayerOpacity]);

  // Redraw all boards when version changes
  useEffect(() => {
    if (lastRenderedVersion.current !== version) {
      canvasesRef.current.forEach((canvas, z) => {
        if (canvas) renderBoard(canvas, z);
      });
      lastRenderedVersion.current = version;
    }
  }, [version, renderBoard]);

  // Handle canvas click - piece selection and movement
  const handleCanvasClick = useCallback((e, z) => {
    if (z !== activeLevel) return; // Only allow clicks on active level

    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (canvasSize / size));
    const y = Math.floor((e.clientY - rect.top) / (canvasSize / size));

    const key = `${x},${y},${z}`;
    const piece = piecesRef.current.get(key);

    if (selectedRef.current) {
      // Attempting to move
      const from = selectedRef.current;
      const fromKey = `${from.x},${from.y},${from.z}`;
      const movingPiece = piecesRef.current.get(fromKey);

      if (movingPiece && movingPiece.color === toMove) {
        const to = { x, y, z };
        const targetPiece = piecesRef.current.get(key);
        const isCapture = targetPiece && targetPiece.color !== movingPiece.color;

        // Check if move is valid
        if (isValidMove(movingPiece.type, from, to, movingPiece.color, isCapture, movingPiece.hasMoved)) {
          if (isPathClear(piecesRef.current, from, to)) {
            // Execute move
            piecesRef.current.delete(fromKey);
            piecesRef.current.set(key, { ...movingPiece, hasMoved: true });

            // Update move history
            setMoveHistory(prev => [...prev, { from, to, piece: movingPiece, capColor: targetPiece?.color }]);

            // Switch turns
            setToMove(toMove === 'white' ? 'black' : 'white');
            
            // Clear selection and markers
            selectedRef.current = null;
            markersRef.current = Array.from({ length: levels }, () => []);
            setVersion(v => v + 1);

            // Change active level to destination level for visual feedback
            setActiveLevel(z);
            return;
          }
        }
      }

      // Clear selection if invalid move
      selectedRef.current = null;
      markersRef.current = Array.from({ length: levels }, () => []);
      setVersion(v => v + 1);
    } else if (piece && piece.color === toMove) {
      // Select piece
      selectedRef.current = { x, y, z };

      // Show valid moves across all levels
      markersRef.current = Array.from({ length: levels }, () => []);
      
      for (let tz = 0; tz < levels; tz++) {
        for (let ty = 0; ty < size; ty++) {
          for (let tx = 0; tx < size; tx++) {
            const targetKey = `${tx},${ty},${tz}`;
            const targetPiece = piecesRef.current.get(targetKey);
            const isCapture = targetPiece && targetPiece.color !== piece.color;

            if (isValidMove(piece.type, { x, y, z }, { x: tx, y: ty, z: tz }, piece.color, isCapture, piece.hasMoved)) {
              if (isPathClear(piecesRef.current, { x, y, z }, { x: tx, y: ty, z: tz })) {
                // Color code by z-distance
                const zDist = Math.abs(tz - z);
                let markerColor = 'rgba(0, 255, 0, 0.3)'; // Same level - green
                if (zDist === 1) markerColor = 'rgba(255, 255, 0, 0.3)'; // ±1 level - yellow
                else if (zDist === 2) markerColor = 'rgba(255, 165, 0, 0.3)'; // ±2 levels - orange
                else if (zDist >= 3) markerColor = 'rgba(255, 0, 0, 0.3)'; // ±3+ levels - red

                markersRef.current[tz].push({ x: tx, y: ty, color: markerColor });
              }
            }
          }
        }
      }

      setVersion(v => v + 1);
    }
  }, [activeLevel, canvasSize, size, toMove, levels]);

  // Level navigation with keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
          // Shift+Tab: go down a level
          setActiveLevel(prev => (prev === 0 ? levels - 1 : prev - 1));
        } else {
          // Tab: go up a level
          setActiveLevel(prev => (prev === levels - 1 ? 0 : prev + 1));
        }
      } else if (e.key >= '1' && e.key <= '9') {
        // Number keys 1-9 jump to levels 0-8
        const targetLevel = parseInt(e.key) - 1;
        if (targetLevel < levels) {
          setActiveLevel(targetLevel);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [levels]);

  // Reset game
  const handleReset = useCallback(() => {
    initializePieces();
    setToMove('white');
    setMoveHistory([]);
    selectedRef.current = null;
    markersRef.current = Array.from({ length: levels }, () => []);
    setActiveLevel(8); // Start at top
  }, [initializePieces, levels]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Nine-Dimensional Layered Chess</h1>
      
      {/* Control Panel */}
      {showControlPanel && (
        <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>Active Level:</strong> {activeLevel} - {getBoardLabel(activeLevel)}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>To Move:</strong> {toMove === 'white' ? '⚪ White' : '⚫ Black'}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>View Mode:</strong>
            <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} style={{ marginLeft: '10px' }}>
              <option value="single">Single Level</option>
              <option value="three">Three Levels</option>
              <option value="all">All Levels</option>
            </select>
          </div>
          <div>
            <button onClick={handleReset} style={{ padding: '8px 16px', marginRight: '10px' }}>
              Reset Game
            </button>
            <button onClick={() => setActiveLevel(prev => (prev + 1) % levels)} style={{ padding: '8px 16px', marginRight: '10px' }}>
              Next Level ↑
            </button>
            <button onClick={() => setActiveLevel(prev => (prev === 0 ? levels - 1 : prev - 1))} style={{ padding: '8px 16px' }}>
              Previous Level ↓
            </button>
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            <strong>Controls:</strong> Tab/Shift+Tab to cycle levels | Keys 1-9 to jump to level | Click pieces to move
          </div>
        </div>
      )}

      {/* Board Container */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {Array.from({ length: levels }, (_, z) => {
          const isActive = z === activeLevel;
          const offsetY = (levels - 1 - z) * 6; // 6px per level
          const offsetX = (levels - 1 - z) * 6;
          const opacity = getLayerOpacity(z);

          // Skip rendering if opacity is 0 (single mode, non-active level)
          if (opacity === 0 && !showBoards) return null;

          return (
            <div
              key={z}
              style={{
                position: 'absolute',
                top: `${offsetY}px`,
                left: `${offsetX}px`,
                zIndex: z,
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              <div style={{
                border: isActive ? '3px solid #00796b' : '1px solid rgba(204, 204, 204, 0.5)',
                boxShadow: isActive ? '0 4px 12px rgba(0, 121, 107, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <canvas
                  ref={el => canvasesRef.current[z] = el}
                  width={canvasSize}
                  height={canvasSize}
                  onClick={(e) => handleCanvasClick(e, z)}
                  style={{ display: 'block', cursor: isActive ? 'pointer' : 'default' }}
                />
              </div>
              <div style={{
                textAlign: 'center',
                marginTop: '5px',
                fontSize: '11px',
                fontWeight: isActive ? 'bold' : 'normal',
                color: isActive ? '#00796b' : '#666',
              }}>
                {getBoardLabel(z)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Move History */}
      <div style={{ marginTop: `${(levels - 1) * 6 + canvasSize + 60}px`, padding: '10px', background: '#fafafa', borderRadius: '5px' }}>
        <h3>Move History ({moveHistory.length} moves)</h3>
        <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '12px' }}>
          {moveHistory.length === 0 ? (
            <p style={{ color: '#999' }}>No moves yet</p>
          ) : (
            moveHistory.map((move, idx) => (
              <div key={idx} style={{ marginBottom: '3px' }}>
                {idx + 1}. {move.piece.color === 'white' ? '⚪' : '⚫'} {move.piece.type} {' '}
                ({move.from.x},{move.from.y},z{move.from.z}) → ({move.to.x},{move.to.y},z{move.to.z})
                {move.capColor && ` [Captured ${move.capColor}]`}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NineDChessBoard;
