import React, { useCallback, useEffect, useRef, useState } from 'react';
import { isValidMove, isPathClear, canPromote, isEnPassant, isCastling, canCastle, wouldBeInCheckAfterMove, isInCheck, isCheckmate, isStalemate } from './nineDChessUtils';
import { selectBestMove } from './nineDChessAI';
import { selectBestMoveAdvanced } from './nineDChessAI_advanced';
import PromotionModal from './PromotionModal';

// Lazy-load neural network to improve initial page load
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
      nnLoadPromise = import('./neuralNetwork').then(module => {
        neuralNetworkModule.trainingCollector = module.trainingCollector;
        neuralNetworkModule.isModelTrained = module.isModelTrained;
        neuralNetworkModule.getNNStatus = module.getNNStatus;
        return neuralNetworkModule;
      }).catch(error => {
        console.warn('Failed to load neural network module:', error);
        nnLoadPromise = null;
        return neuralNetworkModule;
      });
    } catch (error) {
      console.warn('Error initializing neural network import:', error);
      nnLoadPromise = null;
      return neuralNetworkModule;
    }
  }
  return nnLoadPromise;
};

// Reset module on HMR
if (module.hot) {
  module.hot.dispose(() => {
    nnLoadPromise = null;
    neuralNetworkModule.trainingCollector = null;
  });
}

// Unicode chess piece symbols
const getChessPiece = (type, color) => {
  const pieces = {
    white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
    black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
  };
  return pieces[color][type] || '?';
};

// Nine-Dimensional Chess Board - 9 stacked boards (z=0 to z=8)
const NineDChessBoard = ({ size = 8, levels = 9, canvasSize = 240, showControlPanel = true, compactMode = false }) => {
  const canvasesRef = useRef([]);
  const markersRef = useRef(Array.from({ length: levels }, () => []));
  const piecesRef = useRef(new Map());
  const selectedRef = useRef(null);
  const [activeLevel, setActiveLevel] = useState(8);
  const [version, setVersion] = useState(0);
  const [toMove, setToMove] = useState('white');
  const [moveHistory, setMoveHistory] = useState([]);
  const moveHistoryRef = useRef([]);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const animationRef = useRef(null);
  const [promotionPending, setPromotionPending] = useState(null);
  const [gameStatus, setGameStatus] = useState(null); // 'check', 'checkmate', 'stalemate'
  const [viewMode, setViewMode] = useState('all');
  const [layoutMode, setLayoutMode] = useState('stacked');
  const [showNotation, setShowNotation] = useState(true);
  const [boardSpacing, setBoardSpacing] = useState(25);
  const [gameMode, setGameMode] = useState('pvc'); // 'pvp' or 'pvc'
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard', 'master'
  const [useAdvancedAI, setUseAdvancedAI] = useState(true);
  const [computerColor, setComputerColor] = useState('black');
  const [trainingProgress, setTrainingProgress] = useState(null);
  const [nnStatus, setNNStatus] = useState('untrained');
  const [trainingDataSize, setTrainingDataSize] = useState(0);
  const gamePositionsRef = useRef([]);
  const [lastRecordedOutcome, setLastRecordedOutcome] = useState(null);
  const hasInitialized = useRef(false);
  
  // New feature states
  const [positionEvaluation, setPositionEvaluation] = useState(0); // -100 to +100 (white advantage)
  const [lastMove, setLastMove] = useState(null); // { from, to } for highlighting
  const [showHint, setShowHint] = useState(false);
  const [hintMove, setHintMove] = useState(null);
  const [materialCount, setMaterialCount] = useState({ white: 0, black: 0 });
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  const [moveTimer, setMoveTimer] = useState({ white: 0, black: 0 });
  const timerIntervalRef = useRef(null);
  const moveStartTimeRef = useRef(Date.now());
  const [showEvalBar, setShowEvalBar] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Check NN status on mount
  useEffect(() => {
    const checkStatus = async () => {
      const nn = await loadNeuralNetwork();
      const status = nn.getNNStatus();
      setNNStatus(status.isReady ? 'trained' : 'untrained');
      setTrainingDataSize(status.trainingDataSize || 0);
    };
    checkStatus();
  }, []);

  // Initialize pieces for 9D chess
  const initializePieces = useCallback(() => {
    const startPieces = new Map();
    const whiteLevels = [8, 7, 6];
    const blackLevels = [2, 1, 0];

    whiteLevels.forEach(z => {
      // White back rank
      [[0, 'rook'], [1, 'knight'], [2, 'bishop'], [3, 'queen'], [4, 'king'], [5, 'bishop'], [6, 'knight'], [7, 'rook']].forEach(([x, type]) => {
        startPieces.set(`${x},0,${z}`, { type, color: 'white', hasMoved: false });
      });
      // White pawns
      for (let x = 0; x < 8; x++) {
        startPieces.set(`${x},1,${z}`, { type: 'pawn', color: 'white', hasMoved: false });
      }
    });

    blackLevels.forEach(z => {
      // Black pawns
      for (let x = 0; x < 8; x++) {
        startPieces.set(`${x},6,${z}`, { type: 'pawn', color: 'black', hasMoved: false });
      }
      // Black back rank
      [[0, 'rook'], [1, 'knight'], [2, 'bishop'], [3, 'queen'], [4, 'king'], [5, 'bishop'], [6, 'knight'], [7, 'rook']].forEach(([x, type]) => {
        startPieces.set(`${x},7,${z}`, { type, color: 'black', hasMoved: false });
      });
    });

    piecesRef.current = startPieces;
    setVersion(v => v + 1);
  }, []);

  useEffect(() => {
    if (!hasInitialized.current) {
      initializePieces();
      hasInitialized.current = true;
    }
  }, [initializePieces]);

  const getBoardLabel = (z) => {
    const labels = ["Foundation (Black Elite)", "Lower (Black Guard)", "Deep (Black Base)", "Mid-Low (Reserve)", "Center (Neutral)", "Mid-High (Reserve)", "High (White Base)", "Upper (White Guard)", "Celestial (White Elite)"];
    return `Level ${z}: ${labels[z]}`;
  };

  const getLayerOpacity = useCallback((z) => {
    if (viewMode === 'single' && z !== activeLevel) return 0;
    const distance = Math.abs(z - activeLevel);
    if (distance === 0) return 0.20;
    if (distance === 1) return 0.14;
    if (distance === 2) return 0.10;
    if (distance === 3) return 0.07;
    return 0.04;
  }, [viewMode, activeLevel]);

  const getLevelTint = (z) => {
    if (z >= 6) return 'rgba(255, 245, 230, 1)';
    if (z <= 2) return 'rgba(230, 240, 255, 1)';
    return 'rgba(250, 250, 250, 1)';
  };

  const renderBoard = useCallback((canvas, z, notation = showNotation) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const sq = canvasSize / size;
    const isActive = z === activeLevel;
    const opacity = getLayerOpacity(z);

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // Background tint
    ctx.fillStyle = getLevelTint(z);
    ctx.globalAlpha = opacity;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.globalAlpha = 1.0;

    // Checkerboard with notation
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? `rgba(240, 217, 181, ${opacity})` : `rgba(181, 136, 99, ${opacity})`;
        ctx.fillRect(x * sq, y * sq, sq, sq);
        
        // Draw square notation if enabled
        if (notation) {
          const file = String.fromCharCode(97 + x); // a-h
          const rank = 8 - y; // 8-1 (chess notation has rank 1 at bottom)
          const label = `${file}${rank}z${z}`;
          ctx.font = '7px Arial';
          ctx.fillStyle = (x + y) % 2 === 0 ? 'rgba(100, 100, 100, 0.6)' : 'rgba(200, 200, 200, 0.6)';
          ctx.fillText(label, x * sq + 2, y * sq + 9);
        }
      }
    }

    // Grid
    ctx.strokeStyle = `rgba(102, 102, 102, ${isActive ? 0.6 : 0.3})`;
    ctx.lineWidth = 1;
    for (let i = 0; i <= size; i++) {
      ctx.beginPath();
      ctx.moveTo(i * sq, 0);
      ctx.lineTo(i * sq, canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * sq);
      ctx.lineTo(canvasSize, i * sq);
      ctx.stroke();
    }

    // Selection highlight
    if (selectedRef.current && selectedRef.current.z === z && isActive) {
      const { x, y } = selectedRef.current;
      ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
      ctx.fillRect(x * sq, y * sq, sq, sq);
    }

    // Move markers
    markersRef.current[z].forEach(marker => {
      ctx.fillStyle = marker.color || 'rgba(0, 255, 0, 0.3)';
      ctx.fillRect(marker.x * sq, marker.y * sq, sq, sq);
    });

    // Last move highlighting
    if (lastMove) {
      if (lastMove.from.z === z) {
        ctx.fillStyle = 'rgba(255, 255, 100, 0.5)';
        ctx.fillRect(lastMove.from.x * sq, lastMove.from.y * sq, sq, sq);
        ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(lastMove.from.x * sq + 1, lastMove.from.y * sq + 1, sq - 2, sq - 2);
      }
      if (lastMove.to.z === z) {
        ctx.fillStyle = 'rgba(100, 255, 100, 0.5)';
        ctx.fillRect(lastMove.to.x * sq, lastMove.to.y * sq, sq, sq);
        ctx.strokeStyle = 'rgba(0, 200, 100, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(lastMove.to.x * sq + 1, lastMove.to.y * sq + 1, sq - 2, sq - 2);
      }
    }

    // Hint move highlighting
    if (showHint && hintMove && hintMove.from && hintMove.to) {
      if (hintMove.from.z === z) {
        ctx.fillStyle = 'rgba(255, 152, 0, 0.4)';
        ctx.fillRect(hintMove.from.x * sq, hintMove.from.y * sq, sq, sq);
        ctx.strokeStyle = 'rgba(255, 152, 0, 1)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(hintMove.from.x * sq + 2, hintMove.from.y * sq + 2, sq - 4, sq - 4);
        ctx.setLineDash([]);
      }
      if (hintMove.to.z === z) {
        ctx.fillStyle = 'rgba(76, 175, 80, 0.4)';
        ctx.fillRect(hintMove.to.x * sq, hintMove.to.y * sq, sq, sq);
        ctx.strokeStyle = 'rgba(76, 175, 80, 1)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(hintMove.to.x * sq + 2, hintMove.to.y * sq + 2, sq - 4, sq - 4);
        ctx.setLineDash([]);
      }
    }

    // Pieces
    piecesRef.current.forEach((piece, key) => {
      const [px, py, pz] = key.split(',').map(Number);
      if (pz !== z) return;
      const symbol = getChessPiece(piece.type, piece.color);
      ctx.font = 'bold 13px Arial';
      ctx.fillStyle = piece.color === 'white' ? '#ffffff' : '#1a1a1a';
      ctx.strokeStyle = piece.color === 'white' ? '#000000' : '#ffffff';
      ctx.lineWidth = 2.5;
      const cx = px * sq + sq / 2;
      const cy = py * sq + sq / 2 + 5;
      ctx.shadowBlur = 3;
      ctx.shadowColor = piece.color === 'white' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
      ctx.strokeText(symbol, cx - 6, cy);
      ctx.fillText(symbol, cx - 6, cy);
      ctx.shadowBlur = 0;
    });
  }, [size, canvasSize, activeLevel, viewMode, showNotation, getLayerOpacity, getLevelTint, lastMove, showHint, hintMove]);

  useEffect(() => {
    canvasesRef.current.forEach((canvas, z) => {
      if (canvas) renderBoard(canvas, z);
    });
  }, [version, renderBoard]);

  // Calculate material count
  const calculateMaterial = useCallback(() => {
    const pieceValues = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 };
    let whiteMaterial = 0;
    let blackMaterial = 0;
    const whiteCaptured = [];
    const blackCaptured = [];
    
    piecesRef.current.forEach(piece => {
      const value = pieceValues[piece.type] || 0;
      if (piece.color === 'white') {
        whiteMaterial += value;
      } else {
        blackMaterial += value;
      }
    });
    
    // Track captured pieces from move history
    moveHistory.forEach(move => {
      if (move.capType && move.capColor) {
        const capturedPiece = { type: move.capType, color: move.capColor };
        if (move.capColor === 'white') {
          whiteCaptured.push(capturedPiece);
        } else {
          blackCaptured.push(capturedPiece);
        }
      }
    });
    
    setMaterialCount({ white: whiteMaterial, black: blackMaterial });
    setCapturedPieces({ white: whiteCaptured, black: blackCaptured });
    
    return whiteMaterial - blackMaterial;
  }, [moveHistory]);

  // Evaluate current position
  const evaluateCurrentPosition = useCallback(() => {
    const pieceValues = { pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000 };
    let score = 0;
    
    piecesRef.current.forEach(piece => {
      const value = pieceValues[piece.type] || 0;
      const multiplier = piece.color === 'white' ? 1 : -1;
      score += value * multiplier;
      
      // Positional bonuses
      if (piece.type === 'pawn' && piece.pos.z >= 3 && piece.pos.z <= 5) {
        score += 10 * multiplier; // Neutral zone control
      }
      if (piece.type !== 'king' && piece.hasMoved) {
        score += 5 * multiplier; // Development bonus
      }
    });
    
    // Normalize to -100 to +100 range
    const normalizedScore = Math.max(-100, Math.min(100, score / 100));
    setPositionEvaluation(normalizedScore);
    return normalizedScore;
  }, []);

  // Generate AI hint
  const generateHint = useCallback(async () => {
    setShowHint(true);
    try {
      const bestMove = useAdvancedAI 
        ? await selectBestMoveAdvanced(piecesRef.current, toMove, difficulty, false, moveHistoryRef.current)
        : selectBestMove(piecesRef.current, toMove, difficulty);
      
      if (bestMove) {
        setHintMove(bestMove);
      } else {
        setHintMove(null);
        alert('No legal moves available!');
      }
    } catch (error) {
      console.error('Hint generation failed:', error);
      setHintMove(null);
    }
  }, [useAdvancedAI, toMove, difficulty]);

  // Save game to localStorage
  const saveGame = useCallback(() => {
    const gameState = {
      pieces: Array.from(piecesRef.current.entries()),
      toMove,
      moveHistory,
      activeLevel,
      gameMode,
      difficulty,
      computerColor,
      gameStatus,
      moveTimer,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem('nineD_chess_save', JSON.stringify(gameState));
      alert('✅ Game saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('❌ Failed to save game: ' + error.message);
    }
  }, [toMove, moveHistory, activeLevel, gameMode, difficulty, computerColor, gameStatus, moveTimer]);

  // Load game from localStorage
  const loadGame = useCallback(() => {
    try {
      const saved = localStorage.getItem('nineD_chess_save');
      if (!saved) {
        alert('No saved game found!');
        return;
      }
      
      const gameState = JSON.parse(saved);
      const loadedPieces = new Map(gameState.pieces);
      let hasValidKings = false;
      
      // Validate loaded data
      ['white', 'black'].forEach(color => {
        let kingCount = 0;
        loadedPieces.forEach(piece => {
          if (piece.color === color && piece.type === 'king') kingCount++;
        });
        if (kingCount >= 3) hasValidKings = true;
      });
      
      if (!hasValidKings) {
        alert('❌ Saved game is corrupted!');
        return;
      }
      
      piecesRef.current = loadedPieces;
      setToMove(gameState.toMove);
      setMoveHistory(gameState.moveHistory || []);
      moveHistoryRef.current = gameState.moveHistory || [];
      setActiveLevel(gameState.activeLevel || 8);
      setGameMode(gameState.gameMode || 'pvp');
      setDifficulty(gameState.difficulty || 'medium');
      setComputerColor(gameState.computerColor || 'black');
      setGameStatus(gameState.gameStatus || 'active');
      setMoveTimer(gameState.moveTimer || { white: 0, black: 0 });
      undoStackRef.current = [];
      redoStackRef.current = [];
      setVersion(v => v + 1);
      
      alert(`✅ Game loaded! Last played: ${new Date(gameState.timestamp).toLocaleString()}`);
    } catch (error) {
      console.error('Load failed:', error);
      alert('❌ Failed to load game: ' + error.message);
    }
  }, []);

  // Auto-save on every move
  useEffect(() => {
    if (autoSaveEnabled && moveHistory.length > 0 && hasInitialized.current) {
      const timeoutId = setTimeout(() => {
        const gameState = {
          pieces: Array.from(piecesRef.current.entries()),
          toMove,
          moveHistory,
          activeLevel,
          gameMode,
          difficulty,
          computerColor,
          gameStatus,
          moveTimer,
          timestamp: Date.now()
        };
        try {
          localStorage.setItem('nineD_chess_autosave', JSON.stringify(gameState));
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [moveHistory, toMove, activeLevel, gameMode, difficulty, computerColor, gameStatus, moveTimer, autoSaveEnabled]);

  // Update material and evaluation after moves
  useEffect(() => {
    if (hasInitialized.current) {
      calculateMaterial();
      evaluateCurrentPosition();
    }
  }, [version, calculateMaterial, evaluateCurrentPosition]);

  // Move timer
  useEffect(() => {
    if (gameStatus !== 'checkmate' && gameStatus !== 'stalemate') {
      timerIntervalRef.current = setInterval(() => {
        setMoveTimer(prev => ({
          ...prev,
          [toMove]: prev[toMove] + 1
        }));
      }, 1000);
      
      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [toMove, gameStatus]);

  // Check game status after moves
  const checkGameStatus = useCallback((nextPlayer) => {
    if (isCheckmate(piecesRef.current, nextPlayer)) {
      setGameStatus('checkmate');
      const winner = nextPlayer === 'white' ? 'black' : 'white';
      alert(`CHECKMATE! ${winner.toUpperCase()} wins!`);
      recordGameOutcome(winner);
    } else if (isStalemate(piecesRef.current, nextPlayer)) {
      setGameStatus('stalemate');
      alert('STALEMATE! Game is a draw.');
      recordGameOutcome('draw');
    } else if (isInCheck(piecesRef.current, nextPlayer)) {
      setGameStatus('check');
    } else {
      setGameStatus(null);
    }
  }, []);

  // Record game outcome for ML
  const recordGameOutcome = useCallback(async (winner) => {
    if (gamePositionsRef.current.length > 0) {
      const nn = await loadNeuralNetwork();
      await nn.trainingCollector.addGame(gamePositionsRef.current, winner);
      setLastRecordedOutcome(winner);
      const dataSize = nn.trainingCollector.getDataSize();
      setTrainingDataSize(dataSize);
    }
  }, []);

  const captureState = useCallback(() => {
    const piecesCopy = new Map();
    piecesRef.current.forEach((piece, key) => {
      piecesCopy.set(key, { ...piece, pos: { ...piece.pos } });
    });
    
    const positionSnapshot = new Map();
    piecesRef.current.forEach((piece, key) => {
      positionSnapshot.set(key, { ...piece, pos: { ...piece.pos } });
    });
    gamePositionsRef.current.push(positionSnapshot);
    
    if (lastRecordedOutcome) {
      setLastRecordedOutcome(null);
    }
    
    undoStackRef.current.push({
      pieces: piecesCopy,
      moveHistory,
      toMove,
    });
    redoStackRef.current = [];
  }, [moveHistory, toMove, lastRecordedOutcome]);

  // Computer move execution
  const makeComputerMove = useCallback(async () => {
    if (gameMode !== 'pvc' || toMove !== computerColor || gameStatus === 'checkmate' || gameStatus === 'stalemate') {
      return;
    }

    setTimeout(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const bestMove = useAdvancedAI 
        ? await selectBestMoveAdvanced(piecesRef.current, computerColor, difficulty, false, moveHistoryRef.current)
        : selectBestMove(piecesRef.current, computerColor, difficulty);
      
      if (!bestMove) return;

      const { from, to, fromKey, toKey } = bestMove;
      const piece = piecesRef.current.get(fromKey);
      
      if (!piece) return;

      captureState();

      let capturedColor = null;
      let capturedType = null;
      if (piecesRef.current.has(toKey)) {
        const capturedPiece = piecesRef.current.get(toKey);
        if (capturedPiece.type === 'king') {
          console.error('AI attempted illegal king capture');
          return;
        }
        capturedColor = capturedPiece.color;
        capturedType = capturedPiece.type;
        piecesRef.current.delete(toKey);
      }

      piecesRef.current.delete(fromKey);
      const movedPiece = {
        ...piece,
        pos: { ...to },
        hasMoved: true
      };
      piecesRef.current.set(toKey, movedPiece);

      setMoveHistory((h) => [...h, { from, to, piece: piece.type, pieceColor: piece.color, capColor: capturedColor, capType: capturedType }]);
      moveHistoryRef.current = [...moveHistoryRef.current, { from, to, piece: piece.type, pieceColor: piece.color }];
      
      // Update last move for highlighting
      setLastMove({ from, to });
      moveStartTimeRef.current = Date.now();
      
      const nextPlayer = toMove === 'white' ? 'black' : 'white';
      setToMove(nextPlayer);
      checkGameStatus(nextPlayer);

      setVersion((v) => v + 1);
    }, 500);
  }, [gameMode, toMove, computerColor, difficulty, gameStatus, useAdvancedAI, checkGameStatus, captureState]);

  // Trigger computer move when it's the computer's turn (or AI vs AI mode)
  useEffect(() => {
    const isPvCTurn = gameMode === 'pvc' && toMove === computerColor;
    const isAIvsAI = gameMode === 'avsa';
    const shouldMove = (isPvCTurn || isAIvsAI) && !promotionPending && gameStatus !== 'checkmate' && gameStatus !== 'stalemate';
    
    if (shouldMove) {
      makeComputerMove();
    }
  }, [gameMode, toMove, computerColor, promotionPending, gameStatus, makeComputerMove]);

  // Pawn promotion handler
  const handlePromotion = useCallback((newType) => {
    if (!promotionPending) return;
    
    const { from, to, piece, capturedColor, capturedType } = promotionPending;
    const destKey = `${to.x},${to.y},${to.z}`;
    
    // Create promoted piece (new object to avoid mutation)
    const promotedPiece = {
      ...piece,
      id: destKey,
      type: newType,
      pos: to,
      hasMoved: true
    };
    piecesRef.current.set(destKey, promotedPiece);
    setMoveHistory((h) => [...h, { from, to, piece: newType, pieceColor: piece.color, capColor: capturedColor, capType: capturedType, promotion: true }]);
    moveHistoryRef.current = [...moveHistoryRef.current, { from, to, piece: newType, pieceColor: piece.color }];
    
    // Update last move for highlighting
    setLastMove({ from, to });
    moveStartTimeRef.current = Date.now();
    
    const nextPlayer = toMove === 'white' ? 'black' : 'white';
    setToMove(nextPlayer);
    checkGameStatus(nextPlayer);
    setPromotionPending(null);
    setVersion((v) => v + 1);
  }, [promotionPending, toMove, checkGameStatus]);

  // Neural network training
  const handleTrainNN = useCallback(async () => {
    const nn = await loadNeuralNetwork();
    const dataSize = nn.trainingCollector.getDataSize();
    
    if (dataSize < 100) {
      alert(`⚠️ Not enough training data. Need at least 100 positions, currently have ${dataSize}.\n\nPlay more games to generate training data!`);
      return;
    }
    
    setNNStatus('training');
    setTrainingProgress({ epoch: 0, loss: 0, totalEpochs: 50 });
    
    console.log(`🧠 Starting neural network training with ${dataSize} positions...`);
    
    try {
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

  // Self-play generation
  const handleGenerateSelfPlay = useCallback(async (numGames, description) => {
    const nn = await loadNeuralNetwork();
    const currentSize = nn.trainingCollector.getDataSize();
    const confirmed = window.confirm(
      `🎮 Generate ${numGames} Self-Play Games?\n\n` +
      `This will take approximately ${description}.\n` +
      `The AI will play against itself to generate 9D chess training data.\n\n` +
      `Current training data: ${currentSize} positions\n` +
      `After completion: ~${currentSize + (numGames * 60)} positions (9D games are longer)\n\n` +
      `Continue?`
    );
    
    if (!confirmed) return;
    
    setNNStatus('training');
    const startTime = Date.now();
    
    try {
      console.log(`🎮 Starting 9D self-play generation: ${numGames} games...`);
      
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
    handleGenerateSelfPlay(5, '3-5 minutes');
  }, [handleGenerateSelfPlay]);

  const handleGenerateSelfPlay100 = useCallback(() => {
    handleGenerateSelfPlay(25, '15-20 minutes');
  }, [handleGenerateSelfPlay]);

  const handleGenerateSelfPlay1000 = useCallback(() => {
    handleGenerateSelfPlay(1000, '15-25 hours');
  }, [handleGenerateSelfPlay]);

  // Undo/Redo functionality
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
        
        // Deep copy the pieces to avoid reference corruption
        const restoredPieces = new Map();
        state.pieces.forEach((piece, key) => {
          restoredPieces.set(key, { ...piece, pos: { ...piece.pos } });
        });
        piecesRef.current = restoredPieces;
        setMoveHistory(state.moveHistory);
        moveHistoryRef.current = state.moveHistory;
        setToMove(state.toMove);
      }
    }
    setGameStatus('active');
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
      
      // Deep copy the pieces to avoid reference corruption
      const restoredPieces = new Map();
      state.pieces.forEach((piece, key) => {
        restoredPieces.set(key, { ...piece, pos: { ...piece.pos } });
      });
      piecesRef.current = restoredPieces;
      setMoveHistory(state.moveHistory);
      moveHistoryRef.current = state.moveHistory;
      setToMove(state.toMove);
    }
    setGameStatus('active');
    setVersion((v) => v + 1);
  }, [moveHistory, toMove]);

  const handleCanvasClick = useCallback((e, z) => {
    // Prevent moves during computer's turn, AI vs AI mode, or game over
    if (gameMode === 'avsa') return; // AI vs AI spectator mode
    if (gameMode === 'pvc' && toMove === computerColor) return;
    if (gameStatus === 'checkmate' || gameStatus === 'stalemate') return;
    
    if (z !== activeLevel) return;
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (canvasSize / size));
    const y = Math.floor((e.clientY - rect.top) / (canvasSize / size));
    const key = `${x},${y},${z}`;
    const piece = piecesRef.current.get(key);

    if (selectedRef.current) {
      const from = selectedRef.current;
      const fromKey = `${from.x},${from.y},${from.z}`;
      const movingPiece = piecesRef.current.get(fromKey);

      if (movingPiece && movingPiece.color === toMove) {
        const to = { x, y, z };
        const targetPiece = piecesRef.current.get(key);
        const isCapture = targetPiece && targetPiece.color !== movingPiece.color;

        if (isValidMove(movingPiece.type, from, to, movingPiece.color, isCapture, movingPiece.hasMoved)) {
          if (isPathClear(piecesRef.current, from, to)) {
            // Check if move would leave king in check
            if (wouldBeInCheckAfterMove(piecesRef.current, from, to, movingPiece.color)) {
              alert('Illegal move: Would leave your king in check!');
              selectedRef.current = null;
              markersRef.current = Array.from({ length: levels }, () => []);
              setVersion(v => v + 1);
              return;
            }

            // Capture state before move
            captureState();

            let capturedColor = null;
            let capturedType = null;
            if (targetPiece) {
              capturedColor = targetPiece.color;
              capturedType = targetPiece.type;
            }

            // Check for pawn promotion (9D chess: pawns promote on opposite extreme)
            if (movingPiece.type === 'pawn' && canPromote(movingPiece.color, to, levels)) {
              piecesRef.current.delete(fromKey);
              setPromotionPending({ from, to, piece: movingPiece, capturedColor, capturedType });
              selectedRef.current = null;
              markersRef.current = Array.from({ length: levels }, () => []);
              setVersion(v => v + 1);
              return;
            }

            piecesRef.current.delete(fromKey);
            piecesRef.current.set(key, { ...movingPiece, pos: to, hasMoved: true });
            setMoveHistory(prev => [...prev, { from, to, piece: movingPiece.type, pieceColor: movingPiece.color, capColor: capturedColor, capType: capturedType }]);
            moveHistoryRef.current = [...moveHistoryRef.current, { from, to, piece: movingPiece.type, pieceColor: movingPiece.color }];
            
            // Update last move for highlighting
            setLastMove({ from, to });
            setShowHint(false);
            moveStartTimeRef.current = Date.now();
            
            const nextPlayer = toMove === 'white' ? 'black' : 'white';
            setToMove(nextPlayer);
            checkGameStatus(nextPlayer);
            
            selectedRef.current = null;
            markersRef.current = Array.from({ length: levels }, () => []);
            setVersion(v => v + 1);
            setActiveLevel(z);
            return;
          }
        }
      }
      selectedRef.current = null;
      markersRef.current = Array.from({ length: levels }, () => []);
      setVersion(v => v + 1);
    } else if (piece && piece.color === toMove) {
      selectedRef.current = { x, y, z };
      markersRef.current = Array.from({ length: levels }, () => []);

      for (let tz = 0; tz < levels; tz++) {
        for (let ty = 0; ty < size; ty++) {
          for (let tx = 0; tx < size; tx++) {
            const targetKey = `${tx},${ty},${tz}`;
            const targetPiece = piecesRef.current.get(targetKey);
            const isCapture = targetPiece && targetPiece.color !== piece.color;
            if (isValidMove(piece.type, { x, y, z }, { x: tx, y: ty, z: tz }, piece.color, isCapture, piece.hasMoved)) {
              if (isPathClear(piecesRef.current, { x, y, z }, { x: tx, y: ty, z: tz })) {
                // Check if move would leave king in check
                if (!wouldBeInCheckAfterMove(piecesRef.current, { x, y, z }, { x: tx, y: ty, z: tz }, piece.color)) {
                  const zDist = Math.abs(tz - z);
                  let markerColor = 'rgba(0, 255, 0, 0.3)';
                  if (zDist === 1) markerColor = 'rgba(255, 255, 0, 0.3)';
                  else if (zDist === 2) markerColor = 'rgba(255, 165, 0, 0.3)';
                  else if (zDist >= 3) markerColor = 'rgba(255, 0, 0, 0.3)';
                  markersRef.current[tz].push({ x: tx, y: ty, color: markerColor });
                }
              }
            }
          }
        }
      }
      setVersion(v => v + 1);
    }
  }, [activeLevel, canvasSize, size, toMove, levels, gameMode, computerColor, gameStatus, captureState, checkGameStatus]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo/Redo shortcuts
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setActiveLevel(prev => e.shiftKey ? (prev === 0 ? levels - 1 : prev - 1) : (prev === levels - 1 ? 0 : prev + 1));
      } else if (e.key >= '1' && e.key <= '9') {
        const targetLevel = parseInt(e.key) - 1;
        if (targetLevel < levels) setActiveLevel(targetLevel);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [levels, undo, redo]);

  const handleReset = useCallback(() => {
    initializePieces();
    setToMove('white');
    setMoveHistory([]);
    moveHistoryRef.current = [];
    selectedRef.current = null;
    markersRef.current = Array.from({ length: levels }, () => []);
    setActiveLevel(8);
    setGameStatus('active');
    gamePositionsRef.current = [];
    setLastRecordedOutcome(null);
    undoStackRef.current = [];
    redoStackRef.current = [];
    setPromotionPending(null);
    setLastMove(null);
    setShowHint(false);
    setHintMove(null);
    setMaterialCount({ white: 0, black: 0 });
    setCapturedPieces({ white: [], black: [] });
    setMoveTimer({ white: 0, black: 0 });
    moveStartTimeRef.current = Date.now();
    setPositionEvaluation(0);
  }, [initializePieces, levels]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ 
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', 
        color: 'white', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        Nine-Dimensional Layered Chess
      </h1>
      
      {/* Position Evaluation & Material Panel */}
      {showEvalBar && (
        <div style={{ marginBottom: '20px', background: 'white', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          {/* Evaluation Bar */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Position Evaluation</span>  
              <span style={{ fontSize: '12px', color: positionEvaluation > 0 ? '#28a745' : positionEvaluation < 0 ? '#343a40' : '#6c757d', fontWeight: 'bold' }}>
                {positionEvaluation > 0 ? '+' : ''}{positionEvaluation.toFixed(1)}
              </span>
            </div>
            <div style={{ width: '100%', height: '20px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
              <div 
                style={{ 
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '50%',
                  background: '#343a40',
                  transition: 'all 0.3s ease'
                }}
              />
              <div 
                style={{ 
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '50%',
                  background: '#f8f9fa',
                  transition: 'all 0.3s ease'
                }}
              />
              <div 
                style={{ 
                  position: 'absolute',
                  left: positionEvaluation >= 0 ? '50%' : `${50 + positionEvaluation/2}%`,
                  right: positionEvaluation >= 0 ? `${50 - positionEvaluation/2}%` : '50%',
                  top: 0,
                  bottom: 0,
                  background: positionEvaluation > 0 ? 'linear-gradient(90deg, #f8f9fa, #28a745)' : 'linear-gradient(90deg, #343a40, #000)',
                  transition: 'all 0.3s ease',
                  minWidth: '2px'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#999', marginTop: '4px' }}>
              <span>⚫ Black</span>
              <span>⚪ White</span>
            </div>
          </div>
          
          {/* Material & Timer Display */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {/* White Stats */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', color: '#666' }}>⚪ White</div>
              <div style={{ fontSize: '10px', color: '#666' }}>
                <strong>Material:</strong> {materialCount.white} points
                <br />
                <strong>Timer:</strong> {Math.floor(moveTimer.white / 60)}:{(moveTimer.white % 60).toString().padStart(2, '0')}
                {capturedPieces.black.length > 0 && (
                  <>
                    <br />
                    <strong>Captured:</strong> {capturedPieces.black.map((p, i) => <span key={i}>{getChessPiece(p.type, p.color)}</span>)}
                  </>
                )}
              </div>
            </div>
            
            {/* Black Stats */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', color: '#333' }}>⚫ Black</div>
              <div style={{ fontSize: '10px', color: '#666' }}>
                <strong>Material:</strong> {materialCount.black} points
                <br />
                <strong>Timer:</strong> {Math.floor(moveTimer.black / 60)}:{(moveTimer.black % 60).toString().padStart(2, '0')}
                {capturedPieces.white.length > 0 && (
                  <>
                    <br />
                    <strong>Captured:</strong> {capturedPieces.white.map((p, i) => <span key={i}>{getChessPiece(p.type, p.color)}</span>)}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* AI Control Panel */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        background: 'white', 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '15px',
          marginBottom: '15px'
        }}>
          {/* Left Column */}
          <div>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ fontSize: '14px', color: '#333' }}>Game Mode:</strong>
              <select 
                value={gameMode} 
                onChange={(e) => setGameMode(e.target.value)}
                style={{ 
                  marginLeft: '10px',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontSize: '13px'
                }}
              >
                <option value="pvp">Player vs Player</option>
                <option value="pvc">Player vs Computer</option>
              </select>
            </div>
            
            {gameMode === 'pvc' && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '14px', color: '#333' }}>Difficulty:</strong>
                  <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={{ 
                      marginLeft: '10px',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '13px'
                    }}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="master">Master</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '14px', color: '#333' }}>Computer Plays:</strong>
                  <select 
                    value={computerColor} 
                    onChange={(e) => setComputerColor(e.target.value)}
                    style={{ 
                      marginLeft: '10px',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '13px'
                    }}
                  >
                    <option value="white">⚪ White</option>
                    <option value="black">⚫ Black</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={useAdvancedAI} 
                      onChange={(e) => setUseAdvancedAI(e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    🧠 Use Advanced AI (Minimax)
                  </label>
                </div>
              </>
            )}
            
            <div style={{ marginTop: '15px' }}>
              <button 
                onClick={handleReset}
                style={{ 
                  padding: '8px 16px',
                  marginRight: '8px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}
              >
                🔄 Reset Game
              </button>
              <button 
                onClick={() => alert('Draw offered! (Feature coming soon)')}
                style={{ 
                  padding: '8px 16px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                🤝 Offer Draw
              </button>
            </div>
            
            {/* Advanced Controls */}
            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>🎯 Advanced Features</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  onClick={generateHint}
                  disabled={gameStatus === 'checkmate' || gameStatus === 'stalemate' || (gameMode === 'pvc' && toMove === computerColor)}
                  style={{ 
                    padding: '6px 12px',
                    background: gameStatus === 'checkmate' || gameStatus === 'stalemate' ? '#ccc' : '#ffc107',
                    color: gameStatus === 'checkmate' || gameStatus === 'stalemate' ? '#999' : '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: gameStatus === 'checkmate' || gameStatus === 'stalemate' ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                >
                  💡 Hint
                </button>
                <button 
                  onClick={saveGame}
                  style={{ 
                    padding: '6px 12px',
                    background: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  💾 Save
                </button>
                <button 
                  onClick={loadGame}
                  style={{ 
                    padding: '6px 12px',
                    background: '#6f42c1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  📂 Load
                </button>
                <button 
                  onClick={() => setGameMode(gameMode === 'avsa' ? 'pvp' : 'avsa')}
                  style={{ 
                    padding: '6px 12px',
                    background: gameMode === 'avsa' ? '#e83e8c' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                  title="AI vs AI Spectator Mode"
                >
                  {gameMode === 'avsa' ? '⏸️ Stop AI' : '👁️ AI vs AI'}
                </button>
              </div>
              
              <div style={{ marginTop: '10px', display: 'flex', gap: '15px', fontSize: '11px' }}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input 
                    type="checkbox" 
                    checked={showEvalBar} 
                    onChange={(e) => setShowEvalBar(e.target.checked)}
                  />
                  Show Eval Bar
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input 
                    type="checkbox" 
                    checked={autoSaveEnabled} 
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  />
                  Auto-Save
                </label>
              </div>
              
              {/* Hint Display */}
              {showHint && hintMove && (
                <div style={{ 
                  marginTop: '10px',
                  padding: '10px',
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>
                  <strong>💡 Suggested Move:</strong><br />
                  Move piece from ({hintMove.from.x},{hintMove.from.y},z{hintMove.from.z}) → ({hintMove.to.x},{hintMove.to.y},z{hintMove.to.z})
                  <button 
                    onClick={() => { setShowHint(false); setHintMove(null); }}
                    style={{ 
                      marginLeft: '10px',
                      padding: '2px 8px',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '10px'
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Game Status */}
          <div>
            <div style={{ 
              background: toMove === 'white' ? '#f8f9fa' : '#343a40',
              color: toMove === 'white' ? '#000' : '#fff',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '12px',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '15px'
            }}>
              Turn: {toMove === 'white' ? '⚪ WHITE' : '⚫ BLACK'}
            </div>
            
            {gameStatus === 'check' && (
              <div style={{ 
                background: '#fff3cd',
                color: '#856404',
                padding: '8px',
                borderRadius: '4px',
                marginBottom: '8px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                ⚠️ CHECK!
              </div>
            )}
            
            {gameStatus === 'checkmate' && (
              <div style={{ 
                background: '#f8d7da',
                color: '#721c24',
                padding: '8px',
                borderRadius: '4px',
                marginBottom: '8px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                👑 CHECKMATE! {toMove === 'white' ? '⚫ Black' : '⚪ White'} Wins!
              </div>
            )}
            
            {gameStatus === 'stalemate' && (
              <div style={{ 
                background: '#d1ecf1',
                color: '#0c5460',
                padding: '8px',
                borderRadius: '4px',
                marginBottom: '8px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                🤝 STALEMATE! Game Draw!
              </div>
            )}
            
            <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              <strong>Moves:</strong> {moveHistory.length}
              <br />
              <strong>Training Data:</strong> {trainingDataSize} positions
              {gamePositionsRef.current.length > 0 && (
                <>
                  <br />
                  <strong style={{ color: '#28a745' }}>Current Game:</strong> {gamePositionsRef.current.length} positions
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Neural Network Training Section */}
        <div style={{ 
          marginTop: '15px',
          paddingTop: '15px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>
            🧠 Neural Network Training
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <button 
              onClick={handleTrainNN}
              disabled={nnStatus === 'training' || trainingDataSize < 100}
              style={{ 
                padding: '6px 12px',
                background: nnStatus === 'training' || trainingDataSize < 100 ? '#ccc' : '#4a90e2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: nnStatus === 'training' || trainingDataSize < 100 ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
            >
              {nnStatus === 'training' ? '⏳ Training...' : '🎓 Train Network'}
            </button>
            <button 
              onClick={() => recordGameOutcome('white')}
              disabled={gamePositionsRef.current.length === 0}
              style={{ 
                padding: '6px 10px',
                background: gamePositionsRef.current.length === 0 ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: gamePositionsRef.current.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '11px'
              }}
              title="Record current game as White win"
            >
              ♔ White Wins
            </button>
            <button 
              onClick={() => recordGameOutcome('black')}
              disabled={gamePositionsRef.current.length === 0}
              style={{ 
                padding: '6px 10px',
                background: gamePositionsRef.current.length === 0 ? '#ccc' : '#343a40',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: gamePositionsRef.current.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '11px'
              }}
              title="Record current game as Black win"
            >
              ♚ Black Wins
            </button>
            <button 
              onClick={() => recordGameOutcome('draw')}
              disabled={gamePositionsRef.current.length === 0}
              style={{ 
                padding: '6px 10px',
                background: gamePositionsRef.current.length === 0 ? '#ccc' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: gamePositionsRef.current.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '11px'
              }}
              title="Record current game as Draw"
            >
              ⚖ Draw
            </button>
          </div>
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '10px' }}>
            {trainingDataSize < 100 
              ? `Need ${100 - trainingDataSize} more positions to start training`
              : 'Ready to train! Play more games to improve results.'}
          </div>
          
          {/* Self-Play Generation */}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #ccc' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>🎮 Generate Self-Play Training Data</div>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '6px' }}>AI plays against itself to create training positions</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button 
                onClick={handleGenerateSelfPlay10}
                disabled={nnStatus === 'training'}
                style={{ 
                  padding: '5px 10px',
                  background: nnStatus === 'training' ? '#ccc' : '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: nnStatus === 'training' ? 'not-allowed' : 'pointer',
                  fontSize: '10px'
                }}
                title="Generate 5 games (3-5 minutes)"
              >
                🚀 Quick (5)
              </button>
              <button 
                onClick={handleGenerateSelfPlay100}
                disabled={nnStatus === 'training'}
                style={{ 
                  padding: '5px 10px',
                  background: nnStatus === 'training' ? '#ccc' : '#6f42c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: nnStatus === 'training' ? 'not-allowed' : 'pointer',
                  fontSize: '10px'
                }}
                title="Generate 25 games (15-20 minutes)"
              >
                📚 Standard (25)
              </button>
              <button 
                onClick={handleGenerateSelfPlay1000}
                disabled={nnStatus === 'training'}
                style={{ 
                  padding: '5px 10px',
                  background: nnStatus === 'training' ? '#ccc' : '#e83e8c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: nnStatus === 'training' ? 'not-allowed' : 'pointer',
                  fontSize: '10px'
                }}
                title="Generate 1000 games (15-25 hours)"
              >
                🏆 Massive (1000)
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Move History & Undo/Redo Panel */}
      <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>📜 Move History</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={undo}
              disabled={undoStackRef.current.length === 0}
              style={{ 
                padding: '4px 10px',
                background: undoStackRef.current.length === 0 ? '#e0e0e0' : '#6c757d',
                color: undoStackRef.current.length === 0 ? '#999' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: undoStackRef.current.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
              title="Undo (Ctrl+Z)"
            >
              ↶ Undo
            </button>
            <button 
              onClick={redo}
              disabled={redoStackRef.current.length === 0}
              style={{ 
                padding: '4px 10px',
                background: redoStackRef.current.length === 0 ? '#e0e0e0' : '#6c757d',
                color: redoStackRef.current.length === 0 ? '#999' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: redoStackRef.current.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
              title="Redo (Ctrl+Y)"
            >
              ↷ Redo
            </button>
          </div>
        </div>
        <div style={{ maxHeight: '120px', overflowY: 'auto', fontSize: '11px', background: '#f8f9fa', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
          {moveHistory.length === 0 ? (
            <div style={{ color: '#999', textAlign: 'center', padding: '10px' }}>No moves yet.</div>
          ) : (
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {moveHistory.map((m, i) => {
                const moveColor = m.pieceColor || (i % 2 === 0 ? 'white' : 'black');
                const pieceSymbol = getChessPiece(m.piece, moveColor);
                const capturedSymbol = m.capType ? getChessPiece(m.capType, m.capColor) : '';
                
                return (
                  <li key={i} style={{ marginBottom: '3px' }}>
                    <span style={{ color: moveColor === 'white' ? '#666' : '#000', fontWeight: 'bold' }}>{pieceSymbol}</span>
                    {` (${m.from.x},${m.from.y},z${m.from.z}) `}
                    {m.capColor && m.capType ? <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>×</span> : '→'}
                    {` (${m.to.x},${m.to.y},z${m.to.z})`}
                    {m.capColor && m.capType && (
                      <span> <span style={{ color: m.capColor === 'white' ? '#666' : '#000', fontWeight: 'bold' }}>{capturedSymbol}</span></span>
                    )}
                    {m.promotion && <span style={{ color: '#4a90e2' }}> 👑</span>}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
      
      {/* Board Configuration Panel */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <div style={{ marginBottom: '10px' }}>
          <strong>Active Level:</strong> {activeLevel} - {getBoardLabel(activeLevel)}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>View Mode:</strong>
          <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} style={{ marginLeft: '10px', padding: '4px', borderRadius: '4px' }}>
            <option value="single">Single Level</option>
            <option value="all">All Levels</option>
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Layout:</strong>
          <select value={layoutMode} onChange={(e) => setLayoutMode(e.target.value)} style={{ marginLeft: '10px', padding: '4px', borderRadius: '4px' }}>
            <option value="stacked">Stacked (3D)</option>
            <option value="horizontal">Horizontal (Separated)</option>
          </select>
          <label style={{ marginLeft: '20px' }}>
            <input type="checkbox" checked={showNotation} onChange={(e) => setShowNotation(e.target.checked)} />
            Show Square Notation
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Board Spacing:</strong>
          <button onClick={() => setBoardSpacing(prev => Math.max(8, prev - 10))} style={{ marginLeft: '10px', padding: '4px 12px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>Contract ▼</button>
          <span style={{ margin: '0 10px', fontSize: '12px', color: '#666' }}>{boardSpacing}px</span>
          <button onClick={() => setBoardSpacing(prev => Math.min(80, prev + 10))} style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>Expand ▲</button>
        </div>
        <div>
          <button onClick={() => setActiveLevel(prev => (prev + 1) % levels)} style={{ padding: '6px 14px', marginRight: '8px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>Next Level ↑</button>
          <button onClick={() => setActiveLevel(prev => (prev === 0 ? levels - 1 : prev - 1))} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>Previous Level ↓</button>
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          <strong>Controls:</strong> Tab/Shift+Tab to cycle | Keys 1-9 to jump | Click to move
        </div>
      </div>

      {/* Board Container */}
      {layoutMode === 'stacked' ? (
        <div style={{ 
          position: 'relative', 
          display: 'inline-block', 
          width: canvasSize, 
          height: (levels - 1) * boardSpacing + canvasSize,
          minHeight: (levels - 1) * boardSpacing + canvasSize,
          perspective: '1000px',
          overflow: 'visible'
        }}>
          {Array.from({ length: levels }, (_, z) => {
            const isActive = z === activeLevel;
            const offsetY = (levels - 1 - z) * boardSpacing; // Dynamic vertical offset
            const offsetX = 0; // Centered - no horizontal offset like 3D chess
            const opacity = getLayerOpacity(z);
            const elevation = z + 1;
            const shadowIntensity = elevation * 0.12;
            const shadowBlur = 6 + (elevation * 2);

            if (opacity === 0) return null;

            return (
              <canvas
                key={z}
                ref={el => canvasesRef.current[z] = el}
                width={canvasSize}
                height={canvasSize}
                onClick={(e) => handleCanvasClick(e, z)}
                style={{
                  position: 'absolute',
                  top: offsetY,
                  left: offsetX,
                  zIndex: z,
                  border: isActive ? '3px solid #00796b' : '1px solid rgba(204, 204, 204, 0.5)',
                  cursor: 'pointer',
                  pointerEvents: 'auto', // All boards receive clicks like 3D chess
                  boxShadow: isActive 
                    ? `0 ${shadowBlur}px ${shadowBlur * 2}px rgba(0, 121, 107, 0.4), 0 ${shadowBlur / 2}px ${shadowBlur}px rgba(0, 0, 0, ${shadowIntensity})`
                    : `0 ${shadowBlur}px ${shadowBlur * 2}px rgba(0, 0, 0, ${shadowIntensity})`,
                  borderRadius: 4,
                  willChange: 'transform, opacity',
                  transition: 'all 0.3s ease-out, top 0.3s ease-out'
                }}
              />
            );
          })}
          {/* Board labels below the stack */}
          <div style={{ position: 'absolute', top: (levels - 1) * boardSpacing + canvasSize + 10, left: 0, width: '100%' }}>
            {Array.from({ length: levels }, (_, z) => {
              const isActive = z === activeLevel;
              return (
                <div key={`label-${z}`} style={{ 
                  textAlign: 'center', 
                  fontSize: '11px', 
                  fontWeight: isActive ? 'bold' : 'normal', 
                  color: isActive ? '#00796b' : '#666',
                  marginBottom: '2px'
                }}>
                  {getBoardLabel(z)}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', maxWidth: '100%' }}>
          {Array.from({ length: levels }, (_, z) => {
            const isActive = z === activeLevel;

            return (
              <div key={z} style={{ display: 'inline-block' }}>
                <div style={{ border: isActive ? '3px solid #00796b' : '1px solid rgba(204, 204, 204, 0.5)', boxShadow: isActive ? '0 4px 12px rgba(0, 121, 107, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <canvas ref={el => canvasesRef.current[z] = el} width={canvasSize} height={canvasSize} onClick={(e) => handleCanvasClick(e, z)} style={{ display: 'block', cursor: 'pointer' }} />
                </div>
                <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '11px', fontWeight: isActive ? 'bold' : 'normal', color: isActive ? '#00796b' : '#666' }}>
                  {getBoardLabel(z)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Move History */}
      
      {/* Pawn Promotion Modal */}
      {promotionPending && (
        <PromotionModal
          color={promotionPending.piece.color}
          onSelect={handlePromotion}
          onCancel={() => {
            setPromotionPending(null);
            setVersion(v => v + 1);
          }}
        />
      )}
    </div>
  );
};

export default NineDChessBoard;
