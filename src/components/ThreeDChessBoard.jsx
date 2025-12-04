import React, { useCallback, useEffect, useRef, useState } from 'react';
import { isValidMove, isPathClear, canPromote, isEnPassant, isCastling, canCastle, wouldBeInCheckAfterMove, isInCheck, isCheckmate, isStalemate } from './threeDChessUtils';
import PromotionModal from './PromotionModal';

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
  const [promotionPending, setPromotionPending] = useState(null); // { from, to, piece } waiting for promotion choice
  const [gameStatus, setGameStatus] = useState(null); // 'check', 'checkmate', 'stalemate', or null

  useEffect(() => {
    // Initialize sample pieces if empty
    if (piecesRef.current.size === 0) {
      const add = (type, x, y, z, color = 'white') => {
        const key = `${x},${y},${z}`;
        piecesRef.current.set(key, { id: key, type, color, pos: { x, y, z }, hasMoved: false });
      };
      
      // WHITE PIECES (rank 0 and 1)
      // Back rank (y=0)
      add('rook', 0, 0, 0, 'white');
      add('knight', 1, 0, 0, 'white');
      add('bishop', 2, 0, 0, 'white');
      add('queen', 3, 0, 0, 'white');
      add('king', 4, 0, 0, 'white');
      add('bishop', 5, 0, 0, 'white');
      add('knight', 6, 0, 0, 'white');
      add('rook', 7, 0, 0, 'white');
      
      // Pawns (y=1)
      for (let x = 0; x < size; x++) {
        add('pawn', x, 1, 0, 'white');
      }
      
      // BLACK PIECES (rank 6 and 7)
      // Pawns (y=6)
      for (let x = 0; x < size; x++) {
        add('pawn', x, 6, 0, 'black');
      }
      
      // Back rank (y=7)
      add('rook', 0, 7, 0, 'black');
      add('knight', 1, 7, 0, 'black');
      add('bishop', 2, 7, 0, 'black');
      add('queen', 3, 7, 0, 'black');
      add('king', 4, 7, 0, 'black');
      add('bishop', 5, 7, 0, 'black');
      add('knight', 6, 7, 0, 'black');
      add('rook', 7, 7, 0, 'black');
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

      // animated piece (during undo/redo replay or castling)
      if (animationRef.current) {
        const now = Date.now();
        const elapsed = now - animationRef.current.startTime;
        const progress = Math.min(elapsed / animationRef.current.duration, 1);
        
        // Handle multiple simultaneous moves (e.g., castling)
        const moves = animationRef.current.moves || [animationRef.current];
        
        moves.forEach((move) => {
          if (move.level === z) {
            const from = move.fromPos;
            const to = move.toPos;
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
            ctx.fillText(move.piece[0].toUpperCase(), (interpX + 0.45) * cellW, (interpY + 0.6) * cellH);
          }
        });
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

  // Check game status (check, checkmate, stalemate) after a move
  const checkGameStatus = useCallback((nextPlayer) => {
    if (isCheckmate(piecesRef.current, nextPlayer)) {
      setGameStatus('checkmate');
    } else if (isStalemate(piecesRef.current, nextPlayer)) {
      setGameStatus('stalemate');
    } else if (isInCheck(piecesRef.current, nextPlayer)) {
      setGameStatus('check');
    } else {
      setGameStatus(null);
    }
  }, []);

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
        const destKey = `${to.x},${to.y},${to.z}`;
        const isCapture = piecesRef.current.has(destKey);
        const ptype = (piece.type || '').toLowerCase();
        
        // Check for castling attempt
        if (ptype === 'king') {
          const castlingInfo = isCastling(from, to, piece.color);
          if (castlingInfo.type) {
            const rookKey = `${castlingInfo.rookFrom.x},${castlingInfo.rookFrom.y},${castlingInfo.rookFrom.z}`;
            const rook = piecesRef.current.get(rookKey);
            const rookHasMoved = rook ? rook.hasMoved : true;
            
            if (canCastle(piecesRef.current, from, castlingInfo, piece.color, piece.hasMoved, rookHasMoved)) {
              // Execute castling: move king and rook
              piecesRef.current.delete(sel.key);
              piecesRef.current.delete(rookKey);
              
              piece.pos = to;
              piece.hasMoved = true;
              rook.pos = castlingInfo.rookTo;
              rook.hasMoved = true;
              
              piecesRef.current.set(destKey, piece);
              const newRookKey = `${castlingInfo.rookTo.x},${castlingInfo.rookTo.y},${castlingInfo.rookTo.z}`;
              piecesRef.current.set(newRookKey, rook);
              
              captureState();
              setMoveHistory((h) => [...h, { from: sel.pos, to, piece: piece.type, castling: castlingInfo.type }]);
              const nextPlayer = toMove === 'white' ? 'black' : 'white';
              setToMove(nextPlayer);
              checkGameStatus(nextPlayer);
              
              // Trigger animation for both pieces
              animationRef.current = {
                startTime: Date.now(),
                duration: 400,
                moves: [
                  { fromPos: from, toPos: to, piece: piece.type, level: to.z },
                  { fromPos: castlingInfo.rookFrom, toPos: castlingInfo.rookTo, piece: 'rook', level: castlingInfo.rookTo.z },
                ],
              };
              
              selectedRef.current = null;
              setVersion((v) => v + 1);
              return;
            }
          }
        }
        
        if (isValidMove(piece.type, from, to, piece.color, isCapture, piece.hasMoved)) {
          
          // Check path clearance for sliding pieces
          if ((['rook', 'bishop', 'queen'].includes(ptype)) && !isPathClear(piecesRef.current, from, to)) {
            selectedRef.current = null;
            setVersion((v) => v + 1);
            return;
          }
          
          // Check pawn-specific rules
          if (ptype === 'pawn') {
            // Pawns can't move forward into occupied squares
            if (!isCapture && piecesRef.current.has(destKey)) {
              selectedRef.current = null;
              setVersion((v) => v + 1);
              return;
            }
            
            // Check for en passant
            const lastMove = moveHistory[moveHistory.length - 1];
            if (isEnPassant(lastMove, from, to, piece.color)) {
              // Remove captured pawn
              const capturedKey = `${lastMove.to.x},${lastMove.to.y},${lastMove.to.z}`;
              const captured = piecesRef.current.get(capturedKey);
              piecesRef.current.delete(capturedKey);
              
              // Move attacking pawn
              piecesRef.current.delete(sel.key);
              piece.pos = to;
              piece.hasMoved = true;
              piecesRef.current.set(destKey, piece);
              
              captureState();
              setMoveHistory((h) => [...h, { from: sel.pos, to, piece: piece.type, capColor: captured.color, enPassant: true }]);
              const nextPlayer = toMove === 'white' ? 'black' : 'white';
              setToMove(nextPlayer);
              checkGameStatus(nextPlayer);
              selectedRef.current = null;
              setVersion((v) => v + 1);
              return;
            }
          }
          
          let capturedColor = null;
          if (piecesRef.current.has(destKey)) {
            const dest = piecesRef.current.get(destKey);
            if (dest.color !== piece.color) {
              // capture opposite color piece
              capturedColor = dest.color;
              piecesRef.current.delete(destKey);
            } else {
              // can't capture own piece
              selectedRef.current = null;
              setVersion((v) => v + 1);
              return;
            }
          }
          
          // Validate move doesn't leave own king in check
          if (wouldBeInCheckAfterMove(piecesRef.current, from, to, piece.color)) {
            // Illegal move - would expose king to check
            selectedRef.current = null;
            setVersion((v) => v + 1);
            return;
          }
          
          // Move piece
          piecesRef.current.delete(sel.key);
          piece.pos = to;
          piece.hasMoved = true;
          
          // Check for pawn promotion
          if (ptype === 'pawn' && canPromote(to, piece.color)) {
            setPromotionPending({ from: sel.pos, to, piece, capturedColor });
            selectedRef.current = null;
            setVersion((v) => v + 1);
            return;
          }
          
          piecesRef.current.set(destKey, piece);
          captureState();
          setMoveHistory((h) => [...h, { from: sel.pos, to, piece: piece.type, capColor: capturedColor }]);
          const nextPlayer = toMove === 'white' ? 'black' : 'white';
          setToMove(nextPlayer);
          checkGameStatus(nextPlayer);
          
          // Trigger animation
          animationRef.current = {
            startTime: Date.now(),
            duration: 300,
            fromPos: from,
            toPos: to,
            piece: piece.type,
            level: to.z,
          };
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

  const captureState = useCallback(() => {
    // snapshot current game state for undo
    undoStackRef.current.push({
      pieces: new Map(piecesRef.current),
      moveHistory,
      toMove,
    });
    redoStackRef.current = []; // clear redo stack on new move
  }, [moveHistory, toMove]);

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

  // Handle promotion selection
  const handlePromotion = useCallback((newType) => {
    if (!promotionPending) return;
    
    const { from, to, piece, capturedColor } = promotionPending;
    const destKey = `${to.x},${to.y},${to.z}`;
    
    // Update piece type
    piece.type = newType;
    piecesRef.current.set(destKey, piece);
    
    captureState();
    setMoveHistory((h) => [...h, { from, to, piece: newType, capColor: capturedColor, promotion: true }]);
    const nextPlayer = toMove === 'white' ? 'black' : 'white';
    setToMove(nextPlayer);
    checkGameStatus(nextPlayer);
    setPromotionPending(null);
    setVersion((v) => v + 1);
  }, [promotionPending, toMove, captureState, checkGameStatus]);

  return (
    <div style={{ maxWidth: canvasSize + 40 }}>
      {promotionPending && (
        <PromotionModal
          color={promotionPending.piece.color}
          onSelect={handlePromotion}
        />
      )}
      
      <div style={{ marginBottom: 8, padding: 8, border: '1px solid #ccc', borderRadius: 4, backgroundColor: '#f5f5f5' }}>
        <div style={{ marginBottom: 8 }}>
          <strong>Turn: </strong>
          <span style={{ fontWeight: 'bold', color: toMove === 'white' ? '#333' : '#666' }}>
            {toMove.toUpperCase()}
          </span>
          {gameStatus && (
            <span style={{ 
              marginLeft: 16, 
              fontWeight: 'bold', 
              color: gameStatus === 'checkmate' ? '#d32f2f' : gameStatus === 'check' ? '#ff9800' : '#666',
              backgroundColor: gameStatus === 'checkmate' ? '#ffebee' : gameStatus === 'check' ? '#fff3e0' : '#f5f5f5',
              padding: '4px 8px',
              borderRadius: 4,
              border: '1px solid ' + (gameStatus === 'checkmate' ? '#d32f2f' : gameStatus === 'check' ? '#ff9800' : '#999')
            }}>
              {gameStatus === 'checkmate' ? '♔ CHECKMATE!' : gameStatus === 'check' ? '♔ CHECK!' : '⚔ STALEMATE'}
            </span>
          )}
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
