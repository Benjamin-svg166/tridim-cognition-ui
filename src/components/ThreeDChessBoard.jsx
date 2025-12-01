import React, { useCallback, useEffect, useRef, useState } from 'react';
import { isValidMove, isPathClear } from './threeDChessUtils';

// Simple 3D chess prototype component with piece rendering and basic moves.
const ThreeDChessBoard = ({ size = 8, levels = 3, canvasSize = 360 }) => {
  const canvasesRef = useRef([]);
  const markersRef = useRef(Array.from({ length: levels }, () => []));
  const piecesRef = useRef(new Map()); // key: "x,y,z" -> piece
  const selectedRef = useRef(null);
  const [activeLevel, setActiveLevel] = useState(0);
  const [version, setVersion] = useState(0); // bump to trigger redraw
  const [toMove, setToMove] = useState('white'); // 'white' or 'black'
  const [moveHistory, setMoveHistory] = useState([]); // array of { from, to, piece, capColor }
  const undoStackRef = useRef([]); // stack of game states for undo
  const redoStackRef = useRef([]); // stack of game states for redo
  const animationRef = useRef(null); // current animation state: { startTime, duration, fromPos, toPos, piece, level }

  useEffect(() => {
    // Initialize sample pieces if empty
    if (piecesRef.current.size === 0) {
      const add = (type, x, y, z, color = 'white') => {
        const key = `${x},${y},${z}`;
        piecesRef.current.set(key, { id: key, type, color, pos: { x, y, z } });
      };
      add('rook', 0, 0, 0, 'white');
      add('bishop', 2, 2, 0, 'white');
      add('knight', 1, 0, 0, 'white');
      add('queen', 4, 4, 1, 'black');
      add('rook', 7, 7, 2, 'black');
    }

    // draw all levels (grid + markers + pieces + selection highlight)
    for (let z = 0; z < levels; z++) {
      const canvas = canvasesRef.current[z];
      if (!canvas) continue;
      const ctx = canvas.getContext('2d');
      const cellW = canvasSize / size;
      const cellH = canvasSize / size;

      ctx.clearRect(0, 0, canvasSize, canvasSize);
      ctx.fillStyle = z === activeLevel ? '#ffffff' : '#fafafa';
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // grid
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      for (let i = 0; i <= size; i++) {
        const pos = i * cellW;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, canvasSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(canvasSize, pos);
        ctx.stroke();
      }

      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.fillText(`Level ${z}`, 6, 14);

      // markers
      markersRef.current[z].forEach((m) => {
        ctx.beginPath();
        ctx.arc((m.x + 0.5) * cellW, (m.y + 0.5) * cellH, Math.min(cellW, cellH) * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,150,136,0.9)';
        ctx.fill();
        ctx.strokeStyle = '#004d40';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // pieces
      piecesRef.current.forEach((p) => {
        const { x, y, z: pz } = p.pos;
        if (pz !== z) return;
        ctx.beginPath();
        ctx.arc((x + 0.5) * cellW, (y + 0.5) * cellH, Math.min(cellW, cellH) * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = p.color === 'white' ? 'rgba(255,255,255,0.95)' : 'rgba(33,33,33,0.95)';
        ctx.fill();
        ctx.strokeStyle = p.color === 'white' ? '#000' : '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = p.color === 'white' ? '#000' : '#fff';
        ctx.font = '12px Arial';
        ctx.fillText(p.type[0].toUpperCase(), (x + 0.45) * cellW, (y + 0.6) * cellH);
      });

      // animated piece (during undo/redo replay)
      if (animationRef.current && animationRef.current.level === z) {
        const now = Date.now();
        const elapsed = now - animationRef.current.startTime;
        const progress = Math.min(elapsed / animationRef.current.duration, 1);
        const from = animationRef.current.fromPos;
        const to = animationRef.current.toPos;
        const interpX = from.x + (to.x - from.x) * progress;
        const interpY = from.y + (to.y - from.y) * progress;
        ctx.beginPath();
        ctx.arc((interpX + 0.5) * cellW, (interpY + 0.5) * cellH, Math.min(cellW, cellH) * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(76,175,80,0.7)'; // highlight animating piece in green
        ctx.fill();
        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(animationRef.current.piece[0].toUpperCase(), (interpX + 0.45) * cellW, (interpY + 0.6) * cellH);
      }

      // selection highlight
      if (selectedRef.current) {
        const s = selectedRef.current;
        if (s.pos.z === z) {
          ctx.strokeStyle = '#ff9800';
          ctx.lineWidth = 3;
          ctx.strokeRect(s.pos.x * cellW + 2, s.pos.y * cellH + 2, cellW - 4, cellH - 4);
        }
      }
    }
  }, [size, levels, canvasSize, activeLevel, version]);

  const handleClick = (e, z) => {
    const canvas = canvasesRef.current[z];
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellW = canvasSize / size;
    const cx = Math.floor(x / cellW);
    const cy = Math.floor(y / cellW);
    const key = `${cx},${cy},${z}`;

    // If a piece is selected, attempt to move it here (only if it's this player's turn)
    if (selectedRef.current) {
      const sel = selectedRef.current;
      const piece = piecesRef.current.get(sel.key);
      if (piece && piece.color === toMove) {
        const from = sel.pos;
        const to = { x: cx, y: cy, z };
        if (isValidMove(piece.type, from, to)) {
          const ptype = (piece.type || '').toLowerCase();
          if ((['rook', 'bishop', 'queen'].includes(ptype)) && !isPathClear(piecesRef.current, from, to)) {
            // blocked, move invalid
          } else {
            const destKey = `${to.x},${to.y},${to.z}`;
            if (piecesRef.current.has(destKey)) {
              const dest = piecesRef.current.get(destKey);
              if (dest.color !== piece.color) {
                // capture opposite color piece
                piecesRef.current.delete(destKey);
                piecesRef.current.delete(sel.key);
                piece.pos = to;
                piecesRef.current.set(destKey, piece);
                captureState();
                setMoveHistory((h) => [...h, { from: sel.pos, to, piece: piece.type, capColor: dest.color }]);
                setToMove(toMove === 'white' ? 'black' : 'white');
              }
            } else {
              // empty destination
              piecesRef.current.delete(sel.key);
              const newKey = `${to.x},${to.y},${to.z}`;
              piece.pos = to;
              piecesRef.current.set(newKey, piece);
              captureState();
              setMoveHistory((h) => [...h, { from: sel.pos, to, piece: piece.type }]);
              setToMove(toMove === 'white' ? 'black' : 'white');
            }
          }
        }
      }
      selectedRef.current = null;
      setVersion((v) => v + 1);
      return;
    }

    // No selection: if clicking on a piece owned by active player, select it
    if (piecesRef.current.has(key)) {
      const piece = piecesRef.current.get(key);
      if (piece.color === toMove) {
        selectedRef.current = { key, pos: { x: cx, y: cy, z } };
        setVersion((v) => v + 1);
        return;
      }
    }

    const arr = markersRef.current[z];
    const idx = arr.findIndex((m) => m.x === cx && m.y === cy);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push({ x: cx, y: cy });
    setVersion((v) => v + 1);
  };

  const resetGame = () => {
    piecesRef.current.clear();
    markersRef.current = Array.from({ length: levels }, () => []);
    selectedRef.current = null;
    setMoveHistory([]);
    setToMove('white');
    undoStackRef.current = [];
    redoStackRef.current = [];
    setVersion((v) => v + 1);
  };

  const captureState = () => {
    // snapshot current game state for undo
    undoStackRef.current.push({
      pieces: new Map(piecesRef.current),
      moveHistory,
      toMove,
    });
    redoStackRef.current = []; // clear redo stack on new move
  };

  const undo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const state = undoStackRef.current.pop();
    if (state) {
      redoStackRef.current.push({
        pieces: new Map(piecesRef.current),
        moveHistory,
        toMove,
      });
      // animate the last move in reverse
      if (moveHistory.length > 0) {
        const lastMove = moveHistory[moveHistory.length - 1];
        animationRef.current = {
          startTime: Date.now(),
          duration: 300,
          fromPos: lastMove.to,
          toPos: lastMove.from,
          piece: lastMove.piece,
          level: lastMove.to.z,
        };
      }
      piecesRef.current = state.pieces;
      setMoveHistory(state.moveHistory);
      setToMove(state.toMove);
      setVersion((v) => v + 1);
    }
  }, [moveHistory, toMove]);

  const redo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const state = redoStackRef.current.pop();
    if (state) {
      undoStackRef.current.push({
        pieces: new Map(piecesRef.current),
        moveHistory,
        toMove,
      });
      // animate the next move forward
      if (state.moveHistory.length > moveHistory.length) {
        const nextMove = state.moveHistory[state.moveHistory.length - 1];
        animationRef.current = {
          startTime: Date.now(),
          duration: 300,
          fromPos: nextMove.from,
          toPos: nextMove.to,
          piece: nextMove.piece,
          level: nextMove.to.z,
        };
      }
      piecesRef.current = state.pieces;
      setMoveHistory(state.moveHistory);
      setToMove(state.toMove);
      setVersion((v) => v + 1);
    }
  }, [moveHistory, toMove]);

  // animation loop for move replays
  useEffect(() => {
    if (!animationRef.current) return;
    const animate = () => {
      const now = Date.now();
      const elapsed = now - animationRef.current.startTime;
      const progress = Math.min(elapsed / animationRef.current.duration, 1);
      if (progress < 1) {
        setVersion((v) => v + 1);
        requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
        setVersion((v) => v + 1);
      }
    };
    requestAnimationFrame(animate);
  }, [animationRef.current?.startTime]);

  // keyboard shortcuts: Ctrl+Z for undo, Ctrl+Y for redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveHistory, toMove, undo, redo]);

  return (
    <div style={{ maxWidth: canvasSize + 40 }}>
      <div style={{ marginBottom: 8, padding: 8, border: '1px solid #ccc', borderRadius: 4, backgroundColor: '#f5f5f5' }}>
        <div style={{ marginBottom: 8 }}>
          <strong>Turn: </strong>
          <span style={{ fontWeight: 'bold', color: toMove === 'white' ? '#333' : '#666' }}>
            {toMove.toUpperCase()}
          </span>
          <button onClick={resetGame} style={{ marginLeft: 16, padding: '4px 8px', cursor: 'pointer' }}>
            Reset Game
          </button>
          <button onClick={undo} disabled={undoStackRef.current.length === 0} style={{ marginLeft: 8, padding: '4px 8px', cursor: 'pointer' }}>
            ↶ Undo (Ctrl+Z)
          </button>
          <button onClick={redo} disabled={redoStackRef.current.length === 0} style={{ marginLeft: 8, padding: '4px 8px', cursor: 'pointer' }}>
            ↷ Redo (Ctrl+Y)
          </button>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ marginRight: 8 }}>Active level:</label>
          <select value={activeLevel} onChange={(e) => setActiveLevel(Number(e.target.value))} data-testid="level-select">
            {Array.from({ length: levels }, (_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 0, fontSize: '12px', maxHeight: 100, overflow: 'auto', backgroundColor: '#fff', padding: 4, border: '1px solid #ddd' }}>
          <strong>Moves:</strong>
          {moveHistory.length === 0 ? (
            <div>No moves yet.</div>
          ) : (
            <ol style={{ margin: 4, paddingLeft: 20 }}>
              {moveHistory.map((m, i) => (
                <li key={i}>
                  {m.piece} ({m.from.x},{m.from.y},{m.from.z})→({m.to.x},{m.to.y},{m.to.z}){m.capColor ? ` x${m.capColor}` : ''}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {Array.from({ length: levels }, (_, z) => (
          <canvas
            key={z}
            ref={(el) => (canvasesRef.current[z] = el)}
            width={canvasSize}
            height={canvasSize}
            onClick={(e) => handleClick(e, z)}
            style={{ border: z === activeLevel ? '3px solid #00796b' : '1px solid #ccc', cursor: 'pointer' }}
            data-testid={`level-canvas-${z}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ThreeDChessBoard;
