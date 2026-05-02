import React, { useCallback, useEffect, useRef, useState } from 'react';
import { isValidMove, isPathClear, canPromote, isEnPassant, isCastling, canCastle, wouldBeInCheckAfterMove, isInCheck, isCheckmate, isStalemate } from './threeDChessUtils';
import { selectBestMove } from './chessAI';
import { selectBestMoveAdvanced } from './chessAI_advanced';
import PromotionModal from './PromotionModal';

// Lazy-load neural network to improve initial page load (LCP optimization)
const neuralNetworkModule = {
  trainingCollector: null,
  isModelTrained: () => false,
  getNNStatus: () => ({ modelLoaded: false, trainingDataSize: 0, isReady: false })
};
let nnLoadPromise = null;
const loadNeuralNetwork = async () => {
  if (neuralNetworkModule.trainingCollector) return neuralNetworkModule;
  if (!nnLoadPromise) {
    try {
      // eslint-disable-next-line import/first
      nnLoadPromise = import('./neuralNetwork').then(module => {
        neuralNetworkModule.trainingCollector = module.trainingCollector;
        neuralNetworkModule.isModelTrained = module.isModelTrained;
        neuralNetworkModule.getNNStatus = module.getNNStatus;
        return neuralNetworkModule;
      }).catch(error => {
        console.warn('Failed to load neural network module:', error);
        nnLoadPromise = null; // Reset on error so it can be retried
        return neuralNetworkModule; // Return stub
      });
    } catch (error) {
      console.warn('Error initializing neural network import:', error);
      nnLoadPromise = null;
      return neuralNetworkModule;
    }
  }
  return nnLoadPromise;
};

// Reset module on HMR to avoid conflicts
if (module.hot) {
  module.hot.dispose(() => {
    nnLoadPromise = null;
    neuralNetworkModule.trainingCollector = null;
  });
}
// eslint-disable-next-line import/first
import { generateAntiQueenTraining } from './selfPlay';

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

// Simple 3D chess prototype component with piece rendering and basic moves.
const ThreeDChessBoard = ({ size = 8, levels = 3, canvasSize = 240, showControlPanel = true, compactMode = false, showBoards = true }) => {
  const canvasesRef = useRef([]);
  const markersRef = useRef(Array.from({ length: levels }, () => []));
  const piecesRef = useRef(new Map()); // key: "x,y,z" -> piece
  const selectedRef = useRef(null);
  const [activeLevel, setActiveLevel] = useState(2); // Start with top board (white pieces) active
  const [version, setVersion] = useState(0); // bump to trigger redraw
  const [toMove, setToMove] = useState('white'); // 'white' or 'black'
  const [moveHistory, setMoveHistory] = useState([]); // array of { from, to, piece, capColor }
  const moveHistoryRef = useRef([]); // Ref to track current moveHistory without causing re-renders
  const undoStackRef = useRef([]); // stack of game states for undo
  const redoStackRef = useRef([]); // stack of game states for redo
  const animationRef = useRef(null); // current animation state: { startTime, duration, fromPos, toPos, piece, level }
  const [promotionPending, setPromotionPending] = useState(null); // { from, to, piece } waiting for promotion choice
  const [gameStatus, setGameStatus] = useState(null); // 'check', 'checkmate', 'stalemate', or null
  const [boardSpacing, setBoardSpacing] = useState(120); // spacing between boards in pixels (8 = contracted, 80+ = expanded)
  const [gameMode, setGameMode] = useState('pvc'); // 'pvp' or 'pvc' (player vs computer) - DEFAULT TO PvC
  const [difficulty, setDifficulty] = useState('easy'); // 'easy', 'medium', 'hard', 'master' - DEFAULT TO EASY
  const [useAdvancedAI, setUseAdvancedAI] = useState(true); // Use new advanced AI vs old simple AI
  const [computerColor, setComputerColor] = useState('black'); // which color the computer plays
  const [trainingProgress, setTrainingProgress] = useState(null); // { epoch, loss } or null
  const [nnStatus, setNNStatus] = useState('untrained'); // 'untrained', 'training', 'trained'
  const [trainingDataSize, setTrainingDataSize] = useState(0); // Track training data size for UI display
  const gamePositionsRef = useRef([]); // Track all positions in current game for reinforcement learning
  const [lastRecordedOutcome, setLastRecordedOutcome] = useState(null); // Track what outcome was recorded

  // Check NN status on mount (lazy-load to avoid blocking initial render)
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const nn = await loadNeuralNetwork();
        const trained = await nn.isModelTrained();
        setNNStatus(trained ? 'trained' : 'untrained');
        setTrainingDataSize(nn.trainingCollector ? nn.trainingCollector.getDataSize() : 0);
      } catch (error) {
        console.warn('Failed to check neural network status:', error);
        // Keep default untrained status
      }
    };
    // Defer NN check significantly to prioritize LCP (after first paint + layout)
    // Use requestIdleCallback if available, otherwise long timeout
    if (typeof requestIdleCallback !== 'undefined') {
      const idleId = requestIdleCallback(checkStatus, { timeout: 2000 });
      return () => cancelIdleCallback(idleId);
    } else {
      const timer = setTimeout(checkStatus, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const hasInitialized = useRef(false);
  const isLoadingFromStorage = useRef(false); // Flag to prevent saving during load
  const lastRenderedVersion = useRef(-1);
  
  // Static flag to track if we've already restored from localStorage this session
  // This prevents HMR/re-mounts from overwriting active game settings
  const hasRestoredFromStorage = useRef(false);

  // Sync moveHistoryRef with moveHistory state
  useEffect(() => {
    moveHistoryRef.current = moveHistory;
  }, [moveHistory]);

  // Load saved game state on mount
  useEffect(() => {
    // Only restore once per session to prevent HMR/remounts from overwriting active games
    if (hasRestoredFromStorage.current) {
      console.log('⏭️ Skipping localStorage restore (already restored this session)');
      return;
    }
    
    try {
      const saved = localStorage.getItem('chess3d_game');
      if (saved) {
        const data = JSON.parse(saved);
        
        // Only restore if there's meaningful game data (pieces AND moves)
        // Ignore empty/new games that just have initial board setup
        const hasMeaningfulData = data.pieces && Array.isArray(data.pieces) && data.pieces.length > 0 
                                  && data.moveHistory && data.moveHistory.length > 0;
        
        if (!hasMeaningfulData) {
          console.log('🗑️ Clearing localStorage - no meaningful game data to restore');
          localStorage.removeItem('chess3d_game');
          hasRestoredFromStorage.current = true;
          return;
        }
        
        console.log('📥 Restoring game from localStorage:', {
          gameMode: data.gameMode,
          computerColor: data.computerColor,
          difficulty: data.difficulty,
          moveCount: data.moveHistory?.length || 0
        });
        
        // Set loading flag to prevent save effect from running during load
        isLoadingFromStorage.current = true;
        hasRestoredFromStorage.current = true; // Mark as restored
        
        piecesRef.current.clear();
        data.pieces.forEach(p => {
          // Use current position as key, not the old id
          const key = `${p.pos.x},${p.pos.y},${p.pos.z}`;
          piecesRef.current.set(key, { ...p, id: key });
        });
        setMoveHistory(data.moveHistory || []);
        setToMove(data.toMove || 'white');
        
        // DON'T restore game settings from localStorage - let user choose mode freely
        // The board position is restored, but game mode/difficulty should be user's current choice
        // if (data.gameMode) {
        //   setGameMode(data.gameMode);
        // }
        // NOTE: Also don't restore computerColor - let user select via UI
        // if (data.computerColor) setComputerColor(data.computerColor);
        console.log('ℹ️ Game position restored, but keeping current game mode settings (not restoring from localStorage)');
        if (data.difficulty) setDifficulty(data.difficulty);
        if (data.activeLevel !== undefined) setActiveLevel(data.activeLevel);
        if (data.boardSpacing !== undefined) setBoardSpacing(data.boardSpacing);
        
        hasInitialized.current = true;
        
        // Clear loading flag after a short delay to allow all state updates to complete
        setTimeout(() => {
          isLoadingFromStorage.current = false;
        }, 100);
        
        setVersion(v => v + 1);
      }
    } catch (err) {
      console.warn('Failed to load game:', err);
      localStorage.removeItem('chess3d_game');
    }
  }, []);

  // Save game state to localStorage after moves
  useEffect(() => {
    // Skip if loading from storage
    if (isLoadingFromStorage.current) return;
    
    // Only save if we've initialized (prevents saving empty state)
    if (!hasInitialized.current) return;
    
    try {
      const gameState = {
        pieces: Array.from(piecesRef.current.values()),
        moveHistory,
        toMove,
        activeLevel,
        gameMode,
        difficulty,
        computerColor,
        boardSpacing
      };
      localStorage.setItem('chess3d_game', JSON.stringify(gameState));
    } catch (err) {
      console.warn('Failed to save game:', err);
    }
  }, [moveHistory, toMove, activeLevel, gameMode, difficulty, computerColor, boardSpacing]);

  useEffect(() => {
    // Skip if version hasn't changed (prevent infinite loops)
    if (lastRenderedVersion.current === version) return;
    lastRenderedVersion.current = version;
    
    // Initialize sample pieces if empty (only once)
    if (!hasInitialized.current && piecesRef.current.size === 0) {
      hasInitialized.current = true;
      const add = (type, x, y, z, color = 'white') => {
        const key = `${x},${y},${z}`;
        piecesRef.current.set(key, { id: key, type, color, pos: { x, y, z }, hasMoved: false });
      };
      
      // WHITE PIECES on TOP BOARD (z=2, rank 0 and 1)
      // Back rank (y=0, z=2)
      add('rook', 0, 0, 2, 'white');
      add('knight', 1, 0, 2, 'white');
      add('bishop', 2, 0, 2, 'white');
      add('queen', 3, 0, 2, 'white');
      add('king', 4, 0, 2, 'white');
      add('bishop', 5, 0, 2, 'white');
      add('knight', 6, 0, 2, 'white');
      add('rook', 7, 0, 2, 'white');
      
      // White Pawns (y=1, z=2)
      for (let x = 0; x < size; x++) {
        add('pawn', x, 1, 2, 'white');
      }
      
      // MIDDLE BOARD (z=1) - EMPTY (for piece travel)
      
      // BLACK PIECES on BOTTOM BOARD (z=0, rank 6 and 7)
      // Black Pawns (y=6, z=0)
      for (let x = 0; x < size; x++) {
        add('pawn', x, 6, 0, 'black');
      }
      
      // Back rank (y=7, z=0)
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
      // Semi-transparent backgrounds for overlay visibility
      const opacity = z === activeLevel ? 0.15 : 0.08;
      ctx.fillStyle = `rgba(250, 250, 250, ${opacity})`;
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // Checkered pattern for better board readability
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          // Alternate pattern: light gray on every other square
          if ((x + y) % 2 === 1) {
            const grayOpacity = z === activeLevel ? 0.35 : 0.22;
            ctx.fillStyle = `rgba(130, 130, 130, ${grayOpacity})`;
            ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
          }
        }
      }

      // grid with transparency
      ctx.strokeStyle = z === activeLevel ? 'rgba(102, 102, 102, 0.6)' : 'rgba(102, 102, 102, 0.3)';
      ctx.lineWidth = z === activeLevel ? 1.5 : 1;
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

      // Level labels with board names
      const boardNames = ['Bottom (Black)', 'Middle (Empty)', 'Top (White)'];
      ctx.fillStyle = z === activeLevel ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.5)';
      ctx.font = z === activeLevel ? 'bold 13px Arial' : '12px Arial';
      ctx.fillText(`${boardNames[z]}`, 6, 14);

      // Coordinate labels on each square
      ctx.fillStyle = z === activeLevel ? '#000000' : 'rgba(0, 0, 0, 0.85)';
      ctx.font = `bold ${Math.floor(cellW * 0.3)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          const coordText = `${x},${y},${z}`;
          ctx.fillText(coordText, (x + 0.5) * cellW, (y + 0.85) * cellH);
        }
      }
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';

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

      // pieces with enhanced visibility on transparent boards
      piecesRef.current.forEach((p) => {
        const { x, y, z: pz } = p.pos;
        if (pz !== z) return;
        
        // Don't draw pieces that are currently being animated
        if (animationRef.current) {
          const moves = animationRef.current.moves || [animationRef.current];
          const isBeingAnimated = moves.some(move => 
            move.level === pz && 
            ((move.toPos.x === x && move.toPos.y === y) || 
             (move.fromPos.x === x && move.fromPos.y === y))
          );
          if (isBeingAnimated) return;
        }
        
        // Draw chess piece symbol directly (no circle background)
        ctx.font = `bold ${Math.floor(cellW * 0.6)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const pieceSymbol = getChessPiece(p.type, p.color);
        
        // Add dark outline for white pieces for better visibility
        if (p.color === 'white') {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.strokeText(pieceSymbol, (x + 0.5) * cellW, (y + 0.5) * cellH);
        }
        
        // Fill the piece
        ctx.fillStyle = p.color === 'white' ? '#ffffff' : '#000000';
        
        // Add text shadow for better visibility
        ctx.shadowColor = p.color === 'white' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(pieceSymbol, (x + 0.5) * cellW, (y + 0.5) * cellH);
        
        // Reset shadow and alignment
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
      });

      // animated piece (during undo/redo replay or castling)
      if (animationRef.current && animationRef.current.startTime) {
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
            ctx.font = `bold ${Math.floor(cellW * 0.6)}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const animPieceSymbol = getChessPiece(move.piece, move.color);
            ctx.fillText(animPieceSymbol, (interpX + 0.5) * cellW, (interpY + 0.5) * cellH);
            ctx.textAlign = 'start';
            ctx.textBaseline = 'alphabetic';
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

      // Valid move indicators (show on all levels for 3D movement)
      if (selectedRef.current) {
        const sel = selectedRef.current;
        const piece = piecesRef.current.get(sel.key);
        if (piece && piece.color === toMove) {
          // Calculate valid moves for this piece on the current canvas level (z)
          for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
              // Check if this square on current canvas level is a valid move
              const to = { x, y, z };
              const toKey = `${x},${y},${z}`;
              
              // Skip current position
              if (sel.pos.x === x && sel.pos.y === y && sel.pos.z === z) continue;
              
              // Skip if occupied by own piece (except for castling check)
              const targetPiece = piecesRef.current.get(toKey);
              if (targetPiece && targetPiece.color === piece.color) continue;
              
              const isCapture = !!targetPiece;
              let isValidCastling = false;
              
              // Special check for king castling moves
              if (piece.type === 'king') {
                const castlingInfo = isCastling(sel.pos, to, piece.color);
                if (castlingInfo.type) {
                  const rookKey = `${castlingInfo.rookFrom.x},${castlingInfo.rookFrom.y},${castlingInfo.rookFrom.z}`;
                  const rook = piecesRef.current.get(rookKey);
                  const rookHasMoved = rook ? rook.hasMoved : true;
                  isValidCastling = canCastle(piecesRef.current, sel.pos, castlingInfo, piece.color, piece.hasMoved, rookHasMoved);
                }
              }
              
              // Check if move is valid (either normal move or castling)
              if (!isValidCastling && !isValidMove(piece.type, sel.pos, to, piece.color, isCapture, piece.hasMoved)) continue;
              
              // For sliding pieces, check path
              if (['rook', 'bishop', 'queen'].includes(piece.type)) {
                if (!isPathClear(piecesRef.current, sel.pos, to)) continue;
              }
              
              // Check if move would leave king in check (skip for valid castling since canCastle already checks this)
              if (!isValidCastling && wouldBeInCheckAfterMove(piecesRef.current, sel.pos, to, piece.color)) continue;
              
              // Draw valid move indicator with color based on board level
              ctx.beginPath();
              ctx.arc((x + 0.5) * cellW, (y + 0.5) * cellH, Math.min(cellW, cellH) * 0.15, 0, Math.PI * 2);
              if (isCapture) {
                // Red ring for capture moves
                ctx.strokeStyle = 'rgba(244, 67, 54, 0.8)';
                ctx.lineWidth = 3;
                ctx.stroke();
              } else {
                // Color-coded dots based on destination board
                if (to.z === sel.pos.z) {
                  // Same board - green
                  ctx.fillStyle = 'rgba(76, 175, 80, 0.6)';
                } else if (to.z === 1) {
                  // Middle board - blue
                  ctx.fillStyle = 'rgba(33, 150, 243, 0.7)';
                } else {
                  // Different board (top/bottom) - purple/magenta
                  ctx.fillStyle = 'rgba(156, 39, 176, 0.7)';
                }
                ctx.fill();
              }
            }
          }
        }
      }
    }
  }, [size, levels, canvasSize, activeLevel, version, toMove]);

  // Check game status (check, checkmate, stalemate) after a move
  const checkGameStatus = useCallback((nextPlayer) => {
    console.log(`🔍 Checking game status for ${nextPlayer}...`);
    if (isCheckmate(piecesRef.current, nextPlayer)) {
      console.log(`♔ CHECKMATE detected! ${nextPlayer} is checkmated`);
      setGameStatus('checkmate');
      const winner = nextPlayer === 'white' ? 'black' : 'white';
      alert(`CHECKMATE! ${winner.toUpperCase()} wins!`);
      
      // Record game outcome for reinforcement learning
      recordGameOutcome(winner);
    } else if (isStalemate(piecesRef.current, nextPlayer)) {
      console.log(`⚖️ STALEMATE detected!`);
      setGameStatus('stalemate');
      alert('STALEMATE! Game is a draw.');
      
      // Record game outcome for reinforcement learning
      recordGameOutcome('draw');
    } else if (isInCheck(piecesRef.current, nextPlayer)) {
      console.log(`⚠️ CHECK detected! ${nextPlayer} king is in check`);
      setGameStatus('check');
    } else {
      console.log(`✓ No check, checkmate, or stalemate for ${nextPlayer}`);
      setGameStatus(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Record game outcome for reinforcement learning
  const recordGameOutcome = useCallback(async (winner) => {
    if (gamePositionsRef.current.length > 0) {
      console.log(`🎓 Recording game outcome for reinforcement learning: ${winner}`);
      const nn = await loadNeuralNetwork();
      await nn.trainingCollector.addGame(gamePositionsRef.current, winner);
      
      // Mark as recorded but don't clear yet (allow manual override)
      setLastRecordedOutcome(winner);
      
      // Check if we have enough data to suggest training
      const nnStatusInfo = nn.getNNStatus();
      const dataSize = nn.trainingCollector.getDataSize();
      setTrainingDataSize(dataSize);
      console.log(`📊 Total training positions: ${nnStatusInfo.trainingDataSize}`);
      
      if (nnStatusInfo.trainingDataSize >= 100 && !nnStatusInfo.modelLoaded) {
        console.log('💡 Tip: You now have enough data to train the neural network! Use the "Train AI" button.');
      }
    } else {
      alert('⚠️ No game positions to record. Play some moves first!');
    }
  }, []);

  const captureState = useCallback(() => {
    // snapshot current game state for undo - deep copy the pieces Map
    const piecesCopy = new Map();
    piecesRef.current.forEach((piece, key) => {
      piecesCopy.set(key, {
        ...piece,
        pos: { ...piece.pos }
      });
    });
    
    // Also save position for reinforcement learning
    const positionSnapshot = new Map();
    piecesRef.current.forEach((piece, key) => {
      positionSnapshot.set(key, { ...piece, pos: { ...piece.pos } });
    });
    gamePositionsRef.current.push(positionSnapshot);
    
    // Clear last recorded outcome when new game starts with a move
    if (lastRecordedOutcome) {
      setLastRecordedOutcome(null);
    }
    
    undoStackRef.current.push({
      pieces: piecesCopy,
      moveHistory,
      toMove,
    });
    redoStackRef.current = []; // clear redo stack on new move
  }, [moveHistory, toMove, lastRecordedOutcome]);

  // Train the neural network
  const handleTrainNN = useCallback(async () => {
    const nn = await loadNeuralNetwork();
    const dataSize = nn.trainingCollector.getDataSize();
    
    if (dataSize < 100) {
      alert(`⚠️ Not enough training data. Need at least 100 positions, currently have ${dataSize}.\n\nPlay more games to generate training data!`);
      return;
    }
    
    setNNStatus('training');
    setTrainingProgress({ epoch: 0, loss: 0 });
    
    console.log(`🧠 Starting reinforcement learning training with ${dataSize} positions...`);
    
    try {
      const nn = await loadNeuralNetwork();
      await nn.trainingCollector.trainModel(50, 32, (epoch, totalEpochs, logs) => {
        setTrainingProgress({ 
          epoch, 
          totalEpochs,
          loss: logs.loss,
          valLoss: logs.val_loss 
        });
      });
      
      setNNStatus('trained');
      setTrainingProgress(null);
      setTrainingDataSize(dataSize);
      alert(`✅ Neural network training complete!\n\nThe AI has learned from ${dataSize} game positions and is now smarter.`);
    } catch (error) {
      console.error('Training failed:', error);
      setNNStatus('untrained');
      setTrainingProgress(null);
      alert('❌ Training failed: ' + error.message);
    }
  }, []);

  // Self-play training handlers
  const handleGenerateSelfPlay = useCallback(async (numGames, description) => {
    const nn = await loadNeuralNetwork();
    const currentSize = nn.trainingCollector.getDataSize();
    const confirmed = window.confirm(
      `🎮 Generate ${numGames} Self-Play Games?\n\n` +
      `This will take approximately ${description}.\n` +
      `The AI will play against itself to generate training data.\n\n` +
      `Current training data: ${currentSize} positions\n` +
      `After completion: ~${currentSize + (numGames * 50)} positions\n\n` +
      `Continue?`
    );
    
    if (!confirmed) return;
    
    setNNStatus('training');
    const startTime = Date.now();
    
    try {
      console.log(`🎮 Starting self-play generation: ${numGames} games...`);
      
      const results = await nn.trainingCollector.generateSelfPlayData(numGames, (progress, message) => {
        setTrainingProgress({
          epoch: Math.round(progress * 100),
          totalEpochs: 100,
          loss: 0,
          message
        });
      });
      
      const elapsedMin = ((Date.now() - startTime) / 60000).toFixed(1);
      
      setNNStatus('untrained');
      setTrainingProgress(null);
      const finalDataSize = nn.trainingCollector.getDataSize();
      setTrainingDataSize(finalDataSize);
      
      alert(
        `✅ Self-Play Complete!\n\n` +
        `Games: ${numGames}\n` +
        `Results: ${results.whiteWins}W / ${results.blackWins}B / ${results.draws}D\n` +
        `Positions: ${results.totalPositions} (avg ${Math.round(results.avgMovesPerGame)} per game)\n` +
        `Time: ${elapsedMin} minutes\n\n` +
        `Total training data: ${finalDataSize} positions\n\n` +
        `Ready to train neural network!`
      );
      
    } catch (error) {
      console.error('Self-play generation failed:', error);
      setNNStatus('untrained');
      setTrainingProgress(null);
      alert('❌ Self-play failed: ' + error.message);
    }
  }, []);

  const handleGenerateSelfPlay10 = useCallback(() => {
    handleGenerateSelfPlay(5, '2-3 minutes');
  }, [handleGenerateSelfPlay]);

  const handleGenerateSelfPlay100 = useCallback(() => {
    handleGenerateSelfPlay(25, '10-15 minutes');
  }, [handleGenerateSelfPlay]);

  const handleGenerateSelfPlay1000 = useCallback(() => {
    handleGenerateSelfPlay(1000, '10-20 hours');
  }, [handleGenerateSelfPlay]);

  // Anti-Queen Training
  const handleAntiQueenTraining = useCallback(async () => {
    const nn = await loadNeuralNetwork();
    const currentSize = nn.trainingCollector.getDataSize();
    const confirmed = window.confirm(
      `🎯 Generate Anti-Queen Blunder Training?\n\n` +
      `This will create 15 specialized games where:\n` +
      `• Black plays early queen (moves 2-4)\n` +
      `• White AI punishes and captures it\n` +
      `• Neural network learns: early queen = loss\n\n` +
      `Current training data: ${currentSize} positions\n` +
      `After completion: ~${currentSize + 300} positions\n\n` +
      `Time: ~2-3 minutes\n\n` +
      `Continue?`
    );
    
    if (!confirmed) return;
    
    setNNStatus('training');
    const startTime = Date.now();
    
    try {
      console.log(`🎯 Starting anti-queen blunder training...`);
      
      const results = await generateAntiQueenTraining(15, (progress, message) => {
        setTrainingProgress({
          epoch: Math.round(progress * 100),
          totalEpochs: 100,
          loss: 0,
          message
        });
      });
      
      const elapsedMin = ((Date.now() - startTime) / 60000).toFixed(1);
      
      const nn = await loadNeuralNetwork();
      const finalDataSize = nn.trainingCollector.getDataSize();
      setNNStatus('untrained');
      setTrainingProgress(null);
      setTrainingDataSize(finalDataSize);
      
      alert(
        `✅ Anti-Queen Training Complete!\n\n` +
        `Specialized training games generated!\n` +
        `All games show early queen getting punished.\n\n` +
        `Positions: ${results.totalPositions}\n` +
        `Time: ${elapsedMin} minutes\n\n` +
        `Total training data: ${finalDataSize} positions\n\n` +
        `🧠 Next step: Click "Train Neural Network" to teach the AI!\n` +
        `The network will now learn to avoid early queen development.`
      );
      
    } catch (error) {
      console.error('Anti-queen training failed:', error);
      setNNStatus('untrained');
      setTrainingProgress(null);
      alert('❌ Anti-queen training failed: ' + error.message);
    }
  }, []);



  // Execute computer move
  const makeComputerMove = useCallback(async () => {
    console.log('🎯 makeComputerMove called with state:', { 
      gameMode, 
      gameModeType: typeof gameMode,
      gameModeIsPVC: gameMode === 'pvc',
      toMove, 
      computerColor, 
      gameStatus 
    });
    
    if (gameMode !== 'pvc' || toMove !== computerColor || gameStatus === 'checkmate' || gameStatus === 'stalemate') {
      console.log('⏸️ Computer move blocked:', {
        gameMode,
        toMove,
        computerColor,
        gameStatus,
        shouldMove: gameMode === 'pvc' && toMove === computerColor && gameStatus !== 'checkmate' && gameStatus !== 'stalemate'
      });
      return;
    }

    console.log('✅ Computer is calculating move...');

    // INP optimization: Delay so player can see the board state before computer moves
    // Use setTimeout to avoid blocking the main thread
    setTimeout(async () => {
      // Yield to browser before heavy AI calculation
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Choose AI engine based on setting
      const bestMove = useAdvancedAI 
        ? await selectBestMoveAdvanced(piecesRef.current, computerColor, difficulty, true, moveHistoryRef.current) // Enable NN + Opening Book
        : selectBestMove(piecesRef.current, computerColor, difficulty);
      
      if (!bestMove) {
        console.log('❌ Computer has no legal moves - should be checkmate or stalemate');
        return;
      }

      console.log('🎲 Computer chose move:', { from: bestMove.from, to: bestMove.to, piece: bestMove.fromKey });

      const { from, to, fromKey, toKey } = bestMove;
      const piece = piecesRef.current.get(fromKey);
      
      if (!piece) {
        console.error('❌ Piece not found at', fromKey, 'Available pieces:', Array.from(piecesRef.current.keys()));
        return;
      }

      console.log('✅ Executing computer move:', { piece: piece.type, from, to });

      // Capture state before move
      captureState();

      // Handle capture and get actual captured piece color and type
      let capturedColor = null;
      let capturedType = null;
      if (piecesRef.current.has(toKey)) {
        const capturedPiece = piecesRef.current.get(toKey);
        
        // CRITICAL: Cannot capture the king
        if (capturedPiece.type === 'king') {
          console.error('🚨 AI ILLEGAL MOVE: Cannot capture king directly! This indicates checkmate was not detected.');
          return;
        }
        
        capturedColor = capturedPiece.color;
        capturedType = capturedPiece.type;
        piecesRef.current.delete(toKey);
      }

      // Move piece - create new piece object to avoid mutating saved states
      piecesRef.current.delete(fromKey);
      const movedPiece = {
        ...piece,
        id: toKey, // Update ID to match new position
        pos: { ...to },
        hasMoved: true
      };
      piecesRef.current.set(toKey, movedPiece);

      // Update game state
      setMoveHistory((h) => [...h, { from, to, piece: piece.type, pieceColor: piece.color, capColor: capturedColor, capType: capturedType }]);
      const nextPlayer = toMove === 'white' ? 'black' : 'white';
      setToMove(nextPlayer);
      checkGameStatus(nextPlayer);

      console.log('🎉 Computer move completed. Next player:', nextPlayer, 'Game status:', gameStatus);

      // Trigger animation
      animationRef.current = {
        startTime: Date.now(),
        duration: 300,
        fromPos: from,
        toPos: to,
        piece: piece.type,
        color: piece.color,
        level: to.z,
      };

      setVersion((v) => v + 1);
    }, 500);
  }, [gameMode, toMove, computerColor, difficulty, gameStatus, useAdvancedAI, checkGameStatus, captureState]);

  const handleClick = (e, clickedZ) => {
    // INP optimization: Defer heavy work to prevent blocking
    const canvas = canvasesRef.current[clickedZ];
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellW = canvasSize / size;
    const cx = Math.floor(x / cellW);
    const cy = Math.floor(y / cellW);
    
    // Capture element reference before async (event object is recycled)
    const target = e.currentTarget;
    
    // Immediate visual feedback
    target.style.cursor = 'wait';
    
    // Defer heavy move calculation to next frame
    requestAnimationFrame(() => {
      target.style.cursor = 'pointer';
      handleClickDeferred(cx, cy, clickedZ);
    });
  };

  const handleClickDeferred = (cx, cy, clickedZ) => {
    
    // If a piece is already selected, we're trying to move it - skip piece detection
    // and use the raw click coordinates to allow clicking through overlapping pieces
    if (selectedRef.current) {
      // Process the move attempt (code below handles this)
      // Don't do piece detection - just use cx, cy, clickedZ
    } else {
      // No piece selected - do piece detection for selecting a piece
      // Prioritize the clicked board level, then check other levels
      // This allows precise selection when pieces overlap vertically
      let z = null;
      let key = null;
      
      // Try clicked level first
      const clickedKey = `${cx},${cy},${clickedZ}`;
      if (piecesRef.current.has(clickedKey)) {
        const piece = piecesRef.current.get(clickedKey);
        // In PvC mode, only allow selecting player's pieces (not computer's)
        // In PvP mode, allow selecting pieces of the color whose turn it is
        const canSelect = gameMode === 'pvc' 
          ? (piece.color !== computerColor && piece.color === toMove)
          : (piece.color === toMove);
        
        if (canSelect) {
          z = clickedZ;
          key = clickedKey;
        }
      }
      
      // If clicked level didn't have a selectable piece, search other levels
      if (z === null) {
        for (let level = levels - 1; level >= 0; level--) {
          if (level === clickedZ) continue; // Already checked
          const testKey = `${cx},${cy},${level}`;
          if (piecesRef.current.has(testKey)) {
            const piece = piecesRef.current.get(testKey);
            // In PvC mode, only allow selecting player's pieces (not computer's)
            // In PvP mode, allow selecting pieces of the color whose turn it is
            const canSelect = gameMode === 'pvc' 
              ? (piece.color !== computerColor && piece.color === toMove)
              : (piece.color === toMove);
            
            if (canSelect) {
              // Found a piece of the current player's color
              z = level;
              key = testKey;
              break;
            }
          }
        }
      }
      
      // If found a selectable piece, select it
      if (z !== null && key !== null) {
        selectedRef.current = { key, pos: { x: cx, y: cy, z } };
        setVersion((v) => v + 1);
        return;
      }
      
      // No selectable piece found - allow marker toggle on the clicked level
      z = clickedZ;
      key = `${cx},${cy},${z}`;
      
      // Marker toggle for empty squares
      const arr = markersRef.current[z];
      const idx = arr.findIndex((m) => m.x === cx && m.y === cy);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push({ x: cx, y: cy });
      setVersion((v) => v + 1);
      return;
    }

    // If a piece is selected, attempt to move it here (only if it's this player's turn)
    if (selectedRef.current) {
      const sel = selectedRef.current;
      const piece = piecesRef.current.get(sel.key);
      if (piece && piece.color === toMove) {
        const ptype = (piece.type || '').toLowerCase();
        
        // DESELECT: If clicking on the same piece, deselect it instead of moving
        if (sel.pos.x === cx && sel.pos.y === cy && sel.pos.z === clickedZ) {
          selectedRef.current = null;
          setVersion((v) => v + 1);
          return;
        }
        
        // Special handling for king castling - check first before normal move validation
        if (ptype === 'king') {
          for (let testZ = levels - 1; testZ >= 0; testZ--) {
            const testTo = { x: cx, y: cy, z: testZ };
            const castlingInfo = isCastling(sel.pos, testTo, piece.color);
            
            if (castlingInfo.type) {
              const rookKey = `${castlingInfo.rookFrom.x},${castlingInfo.rookFrom.y},${castlingInfo.rookFrom.z}`;
              const rook = piecesRef.current.get(rookKey);
              const rookHasMoved = rook ? rook.hasMoved : true;
              
              if (canCastle(piecesRef.current, sel.pos, castlingInfo, piece.color, piece.hasMoved, rookHasMoved)) {
                // Found valid castling move!
                captureState();
                
                // Execute castling - create new objects to avoid mutation
                piecesRef.current.delete(sel.key);
                piecesRef.current.delete(rookKey);
                
                const newKingKey = `${testTo.x},${testTo.y},${testTo.z}`;
                const newRookKey = `${castlingInfo.rookTo.x},${castlingInfo.rookTo.y},${castlingInfo.rookTo.z}`;
                
                const movedKing = {
                  ...piece,
                  id: newKingKey,
                  pos: { ...testTo },
                  hasMoved: true
                };
                const movedRook = {
                  ...rook,
                  id: newRookKey,
                  pos: { ...castlingInfo.rookTo },
                  hasMoved: true
                };
                
                piecesRef.current.set(newKingKey, movedKing);
                piecesRef.current.set(newRookKey, movedRook);
                
                setMoveHistory((h) => [...h, { from: sel.pos, to: testTo, piece: 'king', pieceColor: piece.color, castling: castlingInfo.type }]);
                const nextPlayer = toMove === 'white' ? 'black' : 'white';
                setToMove(nextPlayer);
                checkGameStatus(nextPlayer);
                
                // Trigger animation for both pieces
                animationRef.current = {
                  startTime: Date.now(),
                  duration: 400,
                  moves: [
                    { fromPos: sel.pos, toPos: testTo, piece: 'king', color: piece.color, level: testTo.z },
                    { fromPos: castlingInfo.rookFrom, toPos: castlingInfo.rookTo, piece: 'rook', color: piece.color, level: castlingInfo.rookTo.z },
                  ],
                };
                
                selectedRef.current = null;
                setVersion((v) => v + 1);
                return;
              }
            }
          }
        }
        
        // Try the clicked board level first, then search other levels if needed
        // This ensures clicking on a specific level moves to that level when valid
        let validMove = null;
        const levelsToCheck = [clickedZ, ...Array.from({ length: levels }, (_, i) => i).filter(z => z !== clickedZ)];
        
        for (const testZ of levelsToCheck) {
          const testTo = { x: cx, y: cy, z: testZ };
          const testDestKey = `${testTo.x},${testTo.y},${testTo.z}`;
          const testTargetPiece = piecesRef.current.get(testDestKey);
          const testIsCapture = testTargetPiece && testTargetPiece.color !== piece.color;
          
          // Check if this is a valid move
          if (isValidMove(piece.type, sel.pos, testTo, piece.color, testIsCapture, piece.hasMoved)) {
            // For sliding pieces, check path
            if (['rook', 'bishop', 'queen'].includes(ptype) && !isPathClear(piecesRef.current, sel.pos, testTo)) {
              continue; // Try next z-level
            }
            
            // Check if move would leave king in check
            if (wouldBeInCheckAfterMove(piecesRef.current, sel.pos, testTo, piece.color)) {
              continue; // Try next z-level
            }
            
            // Found a valid move!
            validMove = { to: testTo, isCapture: testIsCapture, destKey: testDestKey };
            break;
          }
        }
        
        if (!validMove) {
          // No valid move found at this position
          selectedRef.current = null;
          setVersion((v) => v + 1);
          return;
        }
        
        // Use the found valid move
        const from = sel.pos;
        const to = validMove.to;
        const destKey = validMove.destKey;
        const isCapture = validMove.isCapture;
        
        // Castling is already handled above in the special king check
        // This section is for normal moves only
        
        if (isValidMove(piece.type, from, to, piece.color, isCapture, piece.hasMoved)) {
          const ptype = (piece.type || '').toLowerCase();
          
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
              // Capture state BEFORE making the move for undo functionality
              captureState();
              
              // Remove captured pawn
              const capturedKey = `${lastMove.to.x},${lastMove.to.y},${lastMove.to.z}`;
              const captured = piecesRef.current.get(capturedKey);
              piecesRef.current.delete(capturedKey);
              
              // Move attacking pawn
              piecesRef.current.delete(sel.key);
              const movedPawn = {
                ...piece,
                id: destKey,
                pos: { ...to },
                hasMoved: true
              };
              piecesRef.current.set(destKey, movedPawn);
              setMoveHistory((h) => [...h, { from: sel.pos, to, piece: movedPawn.type, pieceColor: movedPawn.color, capColor: captured.color, capType: 'pawn', enPassant: true }]);
              const nextPlayer = toMove === 'white' ? 'black' : 'white';
              setToMove(nextPlayer);
              checkGameStatus(nextPlayer);
              selectedRef.current = null;
              setVersion((v) => v + 1);
              return;
            }
          }
          
          let capturedColor = null;
          let capturedType = null;
          if (piecesRef.current.has(destKey)) {
            const dest = piecesRef.current.get(destKey);
            
            // CRITICAL: Cannot capture the king - this should never be allowed
            // Checkmate should be detected BEFORE a king can be captured
            if (dest.type === 'king') {
              console.error('🚨 ILLEGAL MOVE: Cannot capture king directly! This indicates checkmate was not detected.');
              selectedRef.current = null;
              setVersion((v) => v + 1);
              return;
            }
            
            if (dest.color !== piece.color) {
              capturedColor = dest.color;
              capturedType = dest.type;
              // Don't delete yet - wait until after validation
            } else {
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
          
          // Capture state BEFORE making the move for undo functionality
          captureState();
          
          // Now delete captured piece after validation passes
          if (capturedColor && capturedType) {
            piecesRef.current.delete(destKey);
          }
          
          // Move piece
          piecesRef.current.delete(sel.key);
          const movedPiece = {
            ...piece,
            id: destKey,
            pos: { ...to },
            hasMoved: true
          };
          
          // Check for pawn promotion
          if (ptype === 'pawn' && canPromote(to, movedPiece.color)) {
            setPromotionPending({ from: sel.pos, to, piece: movedPiece, capturedColor, capturedType });
            selectedRef.current = null;
            setVersion((v) => v + 1);
            return;
          }
          
          piecesRef.current.set(destKey, movedPiece);
          setMoveHistory((h) => [...h, { from: sel.pos, to, piece: movedPiece.type, pieceColor: movedPiece.color, capColor: capturedColor, capType: capturedType }]);
          const nextPlayer = toMove === 'white' ? 'black' : 'white';
          console.log(`🎯 Player move complete: ${toMove} → ${nextPlayer}, checking game status...`);
          setToMove(nextPlayer);
          checkGameStatus(nextPlayer);
          console.log(`✅ Turn changed to ${nextPlayer}, gameStatus will be checked`);
          
          // Trigger animation
          animationRef.current = {
            startTime: Date.now(),
            duration: 300,
            fromPos: from,
            toPos: to,
            piece: piece.type,
            color: piece.color,
            level: to.z,
          };
        }
      }
      selectedRef.current = null;
      setVersion((v) => v + 1);
      return;
    }
  };

  const resetGame = () => {
    // Clear game positions when starting new game
    if (gamePositionsRef.current.length > 0 && !lastRecordedOutcome) {
      console.log('⚠️ Game reset without recording outcome');
    }
    
    // Clear localStorage to prevent old game from being restored
    localStorage.removeItem('chess3d_game');
    
    // Reset the restoration flag so new game settings can be saved and restored
    hasRestoredFromStorage.current = false;
    
    gamePositionsRef.current = [];
    // Keep lastRecordedOutcome to show what was recorded from previous game
    // It will be cleared on first move of new game
    piecesRef.current.clear();
    markersRef.current = Array.from({ length: levels }, () => []);
    selectedRef.current = null;
    setMoveHistory([]);
    setToMove('white');
    undoStackRef.current = [];
    redoStackRef.current = [];
    setGameStatus(null);
    setPromotionPending(null);
    hasInitialized.current = false; // Reset initialization flag
    console.log('🔄 Game reset - current mode:', gameMode);
    setVersion((v) => v + 1);
  };

  const undo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    
    // In PvC mode, undo TWO moves (player's move + computer's response)
    const movesToUndo = (gameMode === 'pvc') ? 2 : 1;
    
    for (let i = 0; i < movesToUndo; i++) {
      if (undoStackRef.current.length === 0) break;
      
      const state = undoStackRef.current.pop();
      if (state) {
        // Deep copy current state for redo stack
        const piecesCopy = new Map();
        piecesRef.current.forEach((piece, key) => {
          piecesCopy.set(key, { ...piece, pos: { ...piece.pos } });
        });
        redoStackRef.current.push({
          pieces: piecesCopy,
          moveHistory,
          toMove,
        });
        // animate the last move in reverse (only for the last undo in the loop)
        if (i === movesToUndo - 1 && moveHistory.length > 0) {
          const lastMove = moveHistory[moveHistory.length - 1];
          const pieceColor = toMove === 'white' ? 'black' : 'white'; // The color of the piece being moved back
          animationRef.current = {
            startTime: Date.now(),
            duration: 300,
            fromPos: lastMove.to,
            toPos: lastMove.from,
            piece: lastMove.piece,
            color: pieceColor,
            level: lastMove.to.z,
          };
        }
        // Deep copy the pieces to avoid reference corruption
        const restoredPieces = new Map();
        state.pieces.forEach((piece, key) => {
          restoredPieces.set(key, { ...piece, pos: { ...piece.pos } });
        });
        piecesRef.current = restoredPieces;
        setMoveHistory(state.moveHistory);
        setToMove(state.toMove);
      }
    }
    setVersion((v) => v + 1);
  }, [moveHistory, toMove, gameMode]);

  const redo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const state = redoStackRef.current.pop();
    if (state) {
      // Deep copy current state for undo stack
      const piecesCopy = new Map();
      piecesRef.current.forEach((piece, key) => {
        piecesCopy.set(key, { ...piece, pos: { ...piece.pos } });
      });
      undoStackRef.current.push({
        pieces: piecesCopy,
        moveHistory,
        toMove,
      });
      // animate the next move forward
      if (state.moveHistory.length > moveHistory.length) {
        const nextMove = state.moveHistory[state.moveHistory.length - 1];
        const pieceColor = state.toMove === 'white' ? 'black' : 'white'; // The color that just moved
        animationRef.current = {
          startTime: Date.now(),
          duration: 300,
          fromPos: nextMove.from,
          toPos: nextMove.to,
          piece: nextMove.piece,
          color: pieceColor,
          level: nextMove.to.z,
        };
      }
      // Deep copy the pieces to avoid reference corruption
      const restoredPieces = new Map();
      state.pieces.forEach((piece, key) => {
        restoredPieces.set(key, { ...piece, pos: { ...piece.pos } });
      });
      piecesRef.current = restoredPieces;
      setMoveHistory(state.moveHistory);
      setToMove(state.toMove);
      setVersion((v) => v + 1);
    }
  }, [moveHistory, toMove]);

  // animation loop for move replays
  useEffect(() => {
    if (!animationRef.current) return;
    const animate = () => {
      if (!animationRef.current || !animationRef.current.startTime) {
        animationRef.current = null;
        setVersion((v) => v + 1);
        return;
      }
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

  // Cleanup WebGL contexts on unmount to prevent context limit issues
  useEffect(() => {
    const canvases = canvasesRef.current;
    return () => {
      canvases.forEach(canvas => {
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      });
    };
  }, []);

  // Trigger computer move when it's computer's turn
  useEffect(() => {
    const check1 = gameMode === 'pvc';
    const check2 = toMove === computerColor;
    const check3 = !promotionPending;
    const check4 = gameStatus !== 'checkmate';
    const check5 = gameStatus !== 'stalemate';
    const shouldMove = check1 && check2 && check3 && check4 && check5;
    
    console.log(`🔔 Computer move check: gameMode="${gameMode}" toMove="${toMove}" computerColor="${computerColor}" promotion=${promotionPending} status="${gameStatus}"`);
    
    // DEBUG: Show alert when check detected
    if (gameMode === 'pvc' && toMove === computerColor && gameStatus === 'check') {
      console.log('🚨 DEBUG: Computer is in CHECK and should respond!');
    }
    
    if (shouldMove) {
      console.log('✅ ALL CONDITIONS MET - Calling makeComputerMove');
      makeComputerMove();
    } else {
      console.log(`❌ BLOCKED - ${check1?'✓':'✗'}mode ${check2?'✓':'✗'}turn(${toMove}vs${computerColor}) ${check3?'✓':'✗'}noProm ${check4?'✓':'✗'}notMate ${check5?'✓':'✗'}notStale`);
    }
  }, [gameMode, toMove, computerColor, promotionPending, gameStatus, makeComputerMove]);

  // Handle promotion selection
  const handlePromotion = useCallback((newType) => {
    if (!promotionPending) return;
    
    const { from, to, piece, capturedColor, capturedType } = promotionPending;
    const destKey = `${to.x},${to.y},${to.z}`;
    
    // Create promoted piece (new object to avoid mutation)
    // Note: captureState() was already called before the pawn moved
    const promotedPiece = {
      ...piece,
      id: destKey,
      type: newType
    };
    piecesRef.current.set(destKey, promotedPiece);
    setMoveHistory((h) => [...h, { from, to, piece: newType, pieceColor: piece.color, capColor: capturedColor, capType: capturedType, promotion: true }]);
    const nextPlayer = toMove === 'white' ? 'black' : 'white';
    setToMove(nextPlayer);
    checkGameStatus(nextPlayer);
    setPromotionPending(null);
    setVersion((v) => v + 1);
  }, [promotionPending, toMove, checkGameStatus]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: compactMode ? 'column' : 'row', 
      maxWidth: showControlPanel ? 900 : canvasSize + 40, 
      margin: compactMode ? 0 : '0 auto', 
      gap: compactMode ? 8 : 20, 
      alignItems: 'flex-start', 
      justifyContent: 'center',
      overflow: 'visible',
      minHeight: (boardSpacing * 2) + canvasSize,
      marginTop: compactMode ? 0 : 10
    }}>
      {promotionPending && (
        <PromotionModal
          color={promotionPending.piece.color}
          onSelect={handlePromotion}
        />
      )}
      
      {showControlPanel && (
      <div style={{ 
        flex: '0 0 auto', 
        padding: compactMode ? 4 : 8, 
        border: '1px solid #ccc', 
        borderRadius: 4, 
        backgroundColor: '#f5f5f5', 
        fontSize: compactMode ? '11px' : '14px', 
        order: compactMode ? 2 : 1,
        minWidth: compactMode ? 'auto' : 280,
        alignSelf: 'flex-start',
        contain: 'layout style'
      }}>
        <div style={{ marginBottom: compactMode ? 4 : 8 }}>
          <strong>Turn: </strong>
          <span style={{ fontWeight: 'bold', color: toMove === 'white' ? '#333' : '#666' }}>
            {toMove.toUpperCase()}
          </span>
          {gameStatus && (
            <span style={{ 
              marginLeft: compactMode ? 8 : 16, 
              fontWeight: 'bold', 
              color: gameStatus === 'checkmate' ? '#d32f2f' : gameStatus === 'check' ? '#ff9800' : '#666',
              backgroundColor: gameStatus === 'checkmate' ? '#ffebee' : gameStatus === 'check' ? '#fff3e0' : '#f5f5f5',
              padding: compactMode ? '2px 4px' : '4px 8px',
              borderRadius: 4,
              border: '1px solid ' + (gameStatus === 'checkmate' ? '#d32f2f' : gameStatus === 'check' ? '#ff9800' : '#999')
            }}>
              {gameStatus === 'checkmate' ? '♔ CHECKMATE!' : gameStatus === 'check' ? '♔ CHECK!' : '⚔ STALEMATE'}
            </span>
          )}
          <button onClick={resetGame} style={{ marginLeft: compactMode ? 8 : 16, padding: compactMode ? '2px 6px' : '4px 8px', cursor: 'pointer', fontSize: compactMode ? '10px' : '12px' }}>
            Reset
          </button>
          <button onClick={undo} disabled={undoStackRef.current.length === 0} style={{ marginLeft: compactMode ? 4 : 8, padding: compactMode ? '2px 6px' : '4px 8px', cursor: 'pointer', fontSize: compactMode ? '10px' : '12px' }}>
            ↶ Undo
          </button>
          <button onClick={redo} disabled={redoStackRef.current.length === 0} style={{ marginLeft: compactMode ? 4 : 8, padding: compactMode ? '2px 6px' : '4px 8px', cursor: 'pointer', fontSize: compactMode ? '10px' : '12px' }}>
            ↷ Redo
          </button>
        </div>
        
        {/* DEBUG PANEL - Remove this after fixing the issue */}
        <div style={{ 
          marginBottom: 8, 
          padding: 8, 
          backgroundColor: '#fff3cd', 
          border: '2px solid #ffc107',
          borderRadius: 4,
          fontSize: 11,
          fontFamily: 'monospace'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#856404' }}>🐛 DEBUG STATE</div>
          <div>gameMode: <strong>{gameMode}</strong></div>
          <div>toMove: <strong>{toMove}</strong></div>
          <div>computerColor: <strong>{computerColor}</strong></div>
          <div>gameStatus: <strong>{gameStatus || 'null'}</strong></div>
          <div>promotionPending: <strong>{promotionPending ? 'YES' : 'NO'}</strong></div>
          <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px solid #ffc107' }}>
            Should computer move? <strong style={{ color: (gameMode === 'pvc' && toMove === computerColor && !promotionPending && gameStatus !== 'checkmate' && gameStatus !== 'stalemate') ? 'green' : 'red' }}>
              {(gameMode === 'pvc' && toMove === computerColor && !promotionPending && gameStatus !== 'checkmate' && gameStatus !== 'stalemate') ? 'YES ✓' : 'NO ✗'}
            </strong>
          </div>
          <div style={{ fontSize: 9, marginTop: 4, color: '#856404' }}>
            Checks: Mode={gameMode === 'pvc' ? '✓' : '✗'} Turn={toMove === computerColor ? '✓' : '✗'} NoProm={!promotionPending ? '✓' : '✗'} NoMate={gameStatus !== 'checkmate' ? '✓' : '✗'} NoStale={gameStatus !== 'stalemate' ? '✓' : '✗'}
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('threeDChessBoard');
              alert('localStorage cleared! Click OK, then click Reset Game to start fresh.');
            }}
            style={{ 
              marginTop: 8, 
              padding: '4px 8px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              cursor: 'pointer',
              fontSize: 10
            }}
          >
            🗑️ Clear Saved Game Data
          </button>
        </div>
        
        <div style={{ marginBottom: 8 }}>
          <label style={{ marginRight: 8 }}>Game Mode:</label>
          <select value={gameMode} onChange={(e) => setGameMode(e.target.value)} style={{ marginRight: 16 }}>
            <option value="pvp">Player vs Player</option>
            <option value="pvc">Player vs Computer</option>
          </select>
          {gameMode === 'pvc' && (
            <>
              <label style={{ marginRight: 8 }}>AI Engine:</label>
              <select value={useAdvancedAI ? 'advanced' : 'basic'} onChange={(e) => setUseAdvancedAI(e.target.value === 'advanced')} style={{ marginRight: 16 }}>
                <option value="basic">Basic AI (Fast)</option>
                <option value="advanced">🧠 Advanced AI (Smart)</option>
              </select>
              <label style={{ marginRight: 8 }}>Difficulty:</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ marginRight: 16 }}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                {useAdvancedAI && <option value="master">🎯 Master</option>}
              </select>
              <label style={{ marginRight: 8 }}>Computer plays:</label>
              <select value={computerColor} onChange={(e) => setComputerColor(e.target.value)}>
                <option value="black">Black</option>
                <option value="white">White</option>
              </select>
            </>
          )}
        </div>
        {/* Neural Network Training Controls */}
        {useAdvancedAI && (
          <div style={{ marginBottom: 8, padding: 8, backgroundColor: '#f0f8ff', border: '1px solid #4a90e2', borderRadius: 4, minHeight: 180, contain: 'layout style' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4, fontSize: 12 }}>🧠 Neural Network Learning</div>
            <div style={{ fontSize: 11, marginBottom: 4 }}>
              Status: <span style={{ fontWeight: 'bold', color: nnStatus === 'trained' ? 'green' : nnStatus === 'training' ? 'orange' : 'gray' }}>
                {nnStatus === 'trained' ? '✅ Trained' : nnStatus === 'training' ? '⏳ Training...' : '⚪ Untrained'}
              </span>
              {' | '}
              Training Data: <span style={{ fontWeight: 'bold' }}>{trainingDataSize}</span> positions
              {' | '}
              <span style={{ fontSize: 10, color: '#666' }}>
                (Learns from {gamePositionsRef.current.length > 0 ? `${gamePositionsRef.current.length} positions in ` : ''}game outcomes)
              </span>
            </div>
            <div style={{ 
              fontSize: 11, 
              marginBottom: 4, 
              color: '#4a90e2',
              minHeight: trainingProgress ? 'auto' : 0,
              visibility: trainingProgress ? 'visible' : 'hidden',
              height: trainingProgress ? 'auto' : 0,
              overflow: trainingProgress ? 'visible' : 'hidden'
            }}>
              {trainingProgress && (
                trainingProgress.message ? (
                  // Self-play progress
                  <span>🎮 {trainingProgress.message} ({trainingProgress.epoch}%)</span>
                ) : (
                  // Training progress
                  <>
                    📊 Epoch {trainingProgress.epoch}/{trainingProgress.totalEpochs}: 
                    Loss = {trainingProgress.loss.toFixed(4)}
                    {trainingProgress.valLoss && ` | Val Loss = ${trainingProgress.valLoss.toFixed(4)}`}
                  </>
                )
              )}
            </div>
            <button 
              onClick={handleTrainNN} 
              disabled={nnStatus === 'training' || trainingDataSize < 100}
              style={{ 
                padding: '4px 12px', 
                cursor: nnStatus === 'training' || trainingDataSize < 100 ? 'not-allowed' : 'pointer',
                backgroundColor: nnStatus === 'training' ? '#ccc' : '#4a90e2',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 'bold'
              }}
            >
              {nnStatus === 'training' ? '⏳ Training...' : '🎓 Train Neural Network'}
            </button>
            <button 
              onClick={() => recordGameOutcome('white')} 
              disabled={gamePositionsRef.current.length === 0}
              style={{ 
                padding: '4px 8px', 
                marginLeft: 8,
                cursor: gamePositionsRef.current.length === 0 ? 'not-allowed' : 'pointer',
                backgroundColor: gamePositionsRef.current.length === 0 ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: 10
              }}
              title="Record current game as White win"
            >
              ♔ White Wins
            </button>
            <button 
              onClick={() => recordGameOutcome('black')} 
              disabled={gamePositionsRef.current.length === 0}
              style={{ 
                padding: '4px 8px', 
                marginLeft: 4,
                cursor: gamePositionsRef.current.length === 0 ? 'not-allowed' : 'pointer',
                backgroundColor: gamePositionsRef.current.length === 0 ? '#ccc' : '#343a40',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: 10
              }}
              title="Record current game as Black win"
            >
              ♚ Black Wins
            </button>
            <button 
              onClick={() => recordGameOutcome('draw')} 
              disabled={gamePositionsRef.current.length === 0}
              style={{ 
                padding: '4px 8px', 
                marginLeft: 4,
                cursor: gamePositionsRef.current.length === 0 ? 'not-allowed' : 'pointer',
                backgroundColor: gamePositionsRef.current.length === 0 ? '#ccc' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: 10
              }}
              title="Record current game as Draw"
            >
              ⚖ Draw
            </button>
            <div style={{ fontSize: 10, marginTop: 4, color: '#666' }}>
              {trainingDataSize < 100 
                ? `Need ${100 - trainingDataSize} more positions to start training`
                : 'Ready to train! Play more games to improve results.'}
              {gamePositionsRef.current.length > 0 && (
                <span style={{ color: '#28a745', fontWeight: 'bold', marginLeft: 8 }}>
                  ({gamePositionsRef.current.length} positions in current game)
                </span>
              )}
              <div style={{ 
                marginTop: 4, 
                padding: lastRecordedOutcome ? 4 : 0, 
                backgroundColor: '#d4edda', 
                border: lastRecordedOutcome ? '1px solid #28a745' : 'none', 
                borderRadius: 3, 
                color: '#155724',
                minHeight: lastRecordedOutcome ? 'auto' : 0,
                visibility: lastRecordedOutcome ? 'visible' : 'hidden',
                height: lastRecordedOutcome ? 'auto' : 0,
                overflow: lastRecordedOutcome ? 'visible' : 'hidden'
              }}>
                {lastRecordedOutcome && (
                  <>
                    ✅ Recorded as: <strong>{lastRecordedOutcome === 'white' ? '♔ White Wins' : lastRecordedOutcome === 'black' ? '♚ Black Wins' : '⚖ Draw'}</strong>
                    <span style={{ marginLeft: 4, fontSize: 9 }}>(Click outcome button to change)</span>
                  </>
                )}
              </div>
            </div>
            {/* Self-Play Training Controls */}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #d0e0f0', minHeight: 120 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4, fontSize: 11 }}>🎮 Self-Play Training</div>
              <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>
                AI plays against itself to generate training data
              </div>
              <button 
                onClick={handleGenerateSelfPlay10} 
                disabled={nnStatus === 'training'}
                style={{ 
                  padding: '4px 12px', 
                  cursor: nnStatus === 'training' ? 'not-allowed' : 'pointer',
                  backgroundColor: nnStatus === 'training' ? '#ccc' : '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 10,
                  marginRight: 4
                }}
                title="Quick test: 5 games (~2 minutes)"
              >
                🚀 Quick (5 games)
              </button>
              <button 
                onClick={handleGenerateSelfPlay100} 
                disabled={nnStatus === 'training'}
                style={{ 
                  padding: '4px 12px', 
                  cursor: nnStatus === 'training' ? 'not-allowed' : 'pointer',
                  backgroundColor: nnStatus === 'training' ? '#ccc' : '#6f42c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 10,
                  marginRight: 4
                }}
                title="Standard: 25 games (~10 minutes)"
              >
                📚 Standard (25 games)
              </button>
              <button 
                onClick={handleGenerateSelfPlay1000} 
                disabled={nnStatus === 'training'}
                style={{ 
                  padding: '4px 12px', 
                  cursor: nnStatus === 'training' ? 'not-allowed' : 'pointer',
                  backgroundColor: nnStatus === 'training' ? '#ccc' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 10
                }}
                title="Extensive: 1000 games (~15 hours)"
              >
                🔥 Extensive (1000 games)
              </button>
            </div>
            {/* Anti-Queen Training */}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #d0e0f0' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4, fontSize: 11 }}>🎯 Targeted Training</div>
              <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>
                Teach AI to avoid specific blunders
              </div>
              <button 
                onClick={handleAntiQueenTraining} 
                disabled={nnStatus === 'training'}
                style={{ 
                  padding: '4px 12px', 
                  cursor: nnStatus === 'training' ? 'not-allowed' : 'pointer',
                  backgroundColor: nnStatus === 'training' ? '#ccc' : '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 'bold'
                }}
                title="Generate 15 games where early queen gets punished"
              >
                🚫♕ Anti-Queen (15 games)
              </button>
            </div>
            {/* Data Management */}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #d0e0f0' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4, fontSize: 11 }}>💾 Data Management</div>
              <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>
                Current: {trainingDataSize} positions
              </div>
              <button 
                onClick={async () => {
                  const confirmed = window.confirm('⚠️ Clear all training data?\n\nThis will delete all collected game positions and you\'ll need to regenerate training data.');
                  if (confirmed) {
                    const nn = await loadNeuralNetwork();
                    nn.trainingCollector.trainingData = [];
                    nn.trainingCollector.saveToStorage();
                    setTrainingDataSize(0);
                    alert('✅ Training data cleared!');
                  }
                }}
                style={{ 
                  padding: '4px 12px', 
                  cursor: 'pointer',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 10
                }}
                title="Clear all training data to free up storage"
              >
                🗑️ Clear Data
              </button>
            </div>
          </div>
        )}
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
        <div style={{ marginBottom: 8 }}>
          <label style={{ marginRight: 8, fontWeight: 'bold' }}>Board Separation:</label>
          <input
            type="range"
            min="8"
            max="300"
            value={boardSpacing}
            onChange={(e) => setBoardSpacing(Number(e.target.value))}
            style={{ width: 200, verticalAlign: 'middle', cursor: 'pointer' }}
          />
          <span style={{ marginLeft: 8, fontSize: '12px', color: '#666' }}>
            {boardSpacing <= 20 ? '🔒 Contracted' : boardSpacing >= 80 ? '🔓 Expanded' : '↔️ Separated'}
          </span>
          <button
            onClick={() => setBoardSpacing(8)}
            style={{ marginLeft: 12, padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}
          >
            Contract
          </button>
          <button
            onClick={() => setBoardSpacing(240)}
            style={{ marginLeft: 4, padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}
          >
            Expand
          </button>
        </div>
        <div style={{ 
          marginBottom: 4, 
          fontSize: '11px', 
          backgroundColor: '#fff3cd', 
          padding: (moveHistory.length > 0 && moveHistory[moveHistory.length - 1]?.capColor) ? 4 : 0, 
          border: (moveHistory.length > 0 && moveHistory[moveHistory.length - 1]?.capColor) ? '1px solid #ffc107' : 'none', 
          borderRadius: 3,
          minHeight: (moveHistory.length > 0 && moveHistory[moveHistory.length - 1]?.capColor) ? 'auto' : 0,
          visibility: (moveHistory.length > 0 && moveHistory[moveHistory.length - 1]?.capColor) ? 'visible' : 'hidden',
          height: (moveHistory.length > 0 && moveHistory[moveHistory.length - 1]?.capColor) ? 'auto' : 0,
          overflow: (moveHistory.length > 0 && moveHistory[moveHistory.length - 1]?.capColor) ? 'visible' : 'hidden'
        }}>
          {moveHistory.length > 0 && moveHistory[moveHistory.length - 1]?.capColor && (
            <>
              <strong>🔍 Last Capture:</strong><br/>
              Captured: <strong style={{ color: moveHistory[moveHistory.length - 1].capColor === 'white' ? '#666' : '#000', fontSize: '16px' }}>{getChessPiece(moveHistory[moveHistory.length - 1].capType, moveHistory[moveHistory.length - 1].capColor)}</strong>
            </>
          )}          # The node_modules changes are just cache files - safe to ignore
          # Push your current branch to GitHub
          git push backup-origin phase-1.1-pawn-movement
        </div>
        <div style={{ marginBottom: 0, fontSize: '12px', height: 100, minHeight: 100, maxHeight: 100, overflow: 'auto', backgroundColor: '#fff', padding: 4, border: '1px solid #ddd', contain: 'layout' }}>
          <strong>Moves:</strong>
          {moveHistory.length === 0 ? (
            <div>No moves yet.</div>
          ) : (
            <ol style={{ margin: 4, paddingLeft: 20 }}>
              {moveHistory.map((m, i) => {
                const moveColor = m.pieceColor || (i % 2 === 0 ? 'white' : 'black');
                const pieceSymbol = getChessPiece(m.piece, moveColor);
                const capturedSymbol = m.capType ? getChessPiece(m.capType, m.capColor) : '';
                
                return (
                  <li key={i}>
                    {m.castling ? (
                      <span>
                        <span style={{ color: moveColor === 'white' ? '#666' : '#000', fontWeight: 'bold' }}>
                          {m.castling === 'kingside' ? 'O-O' : 'O-O-O'}
                        </span>
                      </span>
                    ) : (
                      <span>
                        <span style={{ color: moveColor === 'white' ? '#666' : '#000', fontWeight: 'bold' }}>{pieceSymbol}</span>
                        {` (${m.from.x},${m.from.y},${m.from.z}) `}
                        {m.capColor && m.capType ? <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>×</span> : '→'}
                        {` (${m.to.x},${m.to.y},${m.to.z})`}
                        {m.capColor && m.capType && (
                          <span> <span style={{ color: m.capColor === 'white' ? '#666' : '#000', fontWeight: 'bold' }}>{capturedSymbol}</span></span>
                        )}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
      )}

      {showBoards && (
      <div style={{ 
        position: 'relative', 
        flex: '0 0 auto',
        width: canvasSize, 
        height: (boardSpacing * 2) + canvasSize,
        minHeight: (boardSpacing * 2) + canvasSize,
        margin: '0', 
        transition: 'all 0.3s ease-out', 
        order: compactMode ? 1 : 2,
        overflow: 'visible'
      }}>
        {/* Overlay all three boards in stacked order */}
        {Array.from({ length: levels }, (_, z) => {
          const zIndex = z; // Bottom=0, Middle=1, Top=2
          const offsetY = (2 - z) * boardSpacing; // Dynamic vertical offset for expand/contract
          const offsetX = 0; // Centered horizontally - no horizontal offset
          return (
            <canvas
              key={z}
              ref={(el) => (canvasesRef.current[z] = el)}
              width={canvasSize}
              height={canvasSize}
              onClick={(e) => handleClick(e, z)}
              style={{
                position: 'absolute',
                top: offsetY,
                left: offsetX,
                zIndex: zIndex,
                border: z === activeLevel ? '3px solid #00796b' : '1px solid rgba(204, 204, 204, 0.5)',
                cursor: 'pointer',
                willChange: 'transform, opacity',
                transition: 'all 0.3s ease-out, top 0.3s ease-out',
                pointerEvents: 'auto', // All boards receive clicks
                boxShadow: z === activeLevel ? '0 4px 12px rgba(0, 121, 107, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                borderRadius: 4
              }}
              data-testid={`level-canvas-${z}`}
            />
          );
        })}
      </div>
      )}
    </div>
  );
};

export default ThreeDChessBoard;
