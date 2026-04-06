import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { isValidMove, isPathClear, canPromote, wouldBeInCheckAfterMove, isInCheck, isCheckmate, isStalemate } from './nineDChessUtils';
import { selectBestMove } from './nineDChessAI';
import { selectBestMoveAdvanced } from './nineDChessAI_advanced';
import PromotionModal from './PromotionModal';

/**
 * 9D Chess - Full 3D Playable Game
 * 
 * Features:
 * - Nine stacked chess boards in full 3D with orbit controls
 * - Complete game logic with move validation
 * - AI opponents (Easy, Medium, Hard, Master)
 * - Full game controls and state management
 * - Interactive piece movement
 * - Position evaluation, hints, timers
 * - Save/Load functionality
 */

// Chess piece symbols
const PIECE_SYMBOLS = {
  pawn: { white: '♙', black: '♟' },
  rook: { white: '♖', black: '♜' },
  knight: { white: '♘', black: '♞' },
  bishop: { white: '♗', black: '♝' },
  queen: { white: '♕', black: '♛' },
  king: { white: '♔', black: '♚' }
};

// Lazy-load neural network
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

// 3D Chess Piece Component
function ChessPiece3D({ position, type, color, isSelected, onClick }) {
  const symbol = PIECE_SYMBOLS[type]?.[color] || '?';
  
  return (
    <group onClick={onClick}>
      <Text
        position={position}
        fontSize={0.6}
        color={isSelected ? '#4a90e2' : (color === 'white' ? '#ffffff' : '#1a1a1a')}
        anchorX="center"
        anchorY="middle"
        outlineWidth={isSelected ? 0.05 : 0.03}
        outlineColor={isSelected ? '#ffff00' : (color === 'white' ? '#000000' : '#ffffff')}
      >
        {symbol}
      </Text>
    </group>
  );
}

// Chess Board Component (one layer)
function ChessBoard3D({ z, pieces, selectedSquare, highlightedMoves, lastMove, onSquareClick, showNotation = true }) {
  const boardSize = 8;
  const squareSize = 1;
  const yOffset = z * 2.5; // Vertical spacing between layers

  const squares = [];
  const notationLabels = [];
  
  for (let x = 0; x < boardSize; x++) {
    for (let y = 0; y < boardSize; y++) {
      const isBlackSquare = (x + y) % 2 === 1;
      const squareKey = `${x},${y},${z}`;
      const isSelected = selectedSquare === squareKey;
      const isHighlighted = highlightedMoves?.some(m => m.x === x && m.y === y && m.z === z);
      const isLastMoveSquare = lastMove && (
        (lastMove.from.x === x && lastMove.from.y === y && lastMove.from.z === z) ||
        (lastMove.to.x === x && lastMove.to.y === y && lastMove.to.z === z)
      );

      // Color selection
      let baseColor = isBlackSquare ? '#555555' : '#cccccc';
      if (isSelected) baseColor = '#4a90e2'; // Blue for selected
      if (isHighlighted) baseColor = '#50c878'; // Green for valid moves
      if (isLastMoveSquare) baseColor = '#ffd700'; // Gold for last move

      // Level tints
      const levelTints = [
        '#1a1a2e', '#16213e', '#0f3460', '#533483', '#7b2869',
        '#a91d3a', '#c73e1d', '#e8751a', '#ffa41b'
      ];

      squares.push(
        <mesh
          key={squareKey}
          position={[x * squareSize, yOffset, y * squareSize]}
          onClick={(e) => {
            e.stopPropagation();
            onSquareClick(x, y, z);
          }}
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

      // Add square notation
      if (showNotation) {
        const file = String.fromCharCode(97 + x); // a-h
        const rank = 8 - y; // 8-1
        notationLabels.push(
          <Text
            key={`notation-${squareKey}`}
            position={[x * squareSize, yOffset + 0.09, y * squareSize]}
            fontSize={0.12}
            color={isBlackSquare ? '#ffffff' : '#000000'}
            anchorX="center"
            anchorY="middle"
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {`${file}${rank}z${z}`}
          </Text>
        );
      }
    }
  }

  return <group>{squares}{notationLabels}</group>;
}

// Coordinate Labels
function CoordinateLabels3D() {
  const labels = [];
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  
  // X-axis labels (files)
  for (let i = 0; i < 8; i++) {
    labels.push(
      <Text key={`x-${i}`} position={[i, -0.5, -0.5]} fontSize={0.4} color="#ffffff">{files[i]}</Text>
    );
  }

  // Y-axis labels (ranks)
  for (let i = 0; i < 8; i++) {
    labels.push(
      <Text key={`y-${i}`} position={[-0.5, -0.5, i]} fontSize={0.4} color="#ffffff">{8 - i}</Text>
    );
  }

  // Z-axis labels (layers)
  const layerLabels = ['Bottom', 'Low-1', 'Low-2', 'Mid-1', 'Middle', 'Mid-2', 'High-1', 'High-2', 'Top'];
  for (let i = 0; i < 9; i++) {
    labels.push(
      <Text key={`z-${i}`} position={[8.5, i * 2.5, 4]} fontSize={0.35} color="#ffff00">
        {`z${i} (${layerLabels[i]})`}
      </Text>
    );
  }

  return <group>{labels}</group>;
}

// Main Game Component
const NineDChessGame3D = () => {
  const piecesRef = useRef(new Map());
  const [version, setVersion] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [highlightedMoves, setHighlightedMoves] = useState([]);
  const [toMove, setToMove] = useState('white');
  const [moveHistory, setMoveHistory] = useState([]);
  const moveHistoryRef = useRef([]);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const [promotionPending, setPromotionPending] = useState(null);
  const [gameStatus, setGameStatus] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  
  // Game mode and AI settings (with localStorage persistence)
  const [gameMode, setGameMode] = useState(() => {
    return localStorage.getItem('9dchess_gameMode') || 'pvc';
  });
  const [difficulty, setDifficulty] = useState(() => {
    return localStorage.getItem('9dchess_difficulty') || 'medium';
  });
  const [computerColor, setComputerColor] = useState(() => {
    return localStorage.getItem('9dchess_computerColor') || 'black';
  });
  const [useAdvancedAI, setUseAdvancedAI] = useState(() => {
    const saved = localStorage.getItem('9dchess_useAdvancedAI');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  // Advanced features
  const [positionEvaluation, setPositionEvaluation] = useState(0);
  const [materialCount, setMaterialCount] = useState({ white: 0, black: 0 });
  const [moveTimer, setMoveTimer] = useState({ white: 0, black: 0 });
  const timerIntervalRef = useRef(null);
  const moveStartTimeRef = useRef(Date.now());
  const [showHint, setShowHint] = useState(false);
  const [hintMove, setHintMove] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [showNotation, setShowNotation] = useState(true);
  const [drawOfferedBy, setDrawOfferedBy] = useState(null); // 'white', 'black', or null
  
  const hasInitialized = useRef(false);

  // Initialize pieces for 9D chess
  const initializePieces = useCallback(() => {
    const startPieces = new Map();
    const whiteLevels = [8, 7, 6];
    const blackLevels = [2, 1, 0];

    whiteLevels.forEach(z => {
      // White back rank
      [[0, 'rook'], [1, 'knight'], [2, 'bishop'], [3, 'queen'], [4, 'king'], [5, 'bishop'], [6, 'knight'], [7, 'rook']].forEach(([x, type]) => {
        startPieces.set(`${x},0,${z}`, { type, color: 'white', pos: { x, y: 0, z }, hasMoved: false });
      });
      // White pawns
      for (let x = 0; x < 8; x++) {
        startPieces.set(`${x},1,${z}`, { type: 'pawn', color: 'white', pos: { x, y: 1, z }, hasMoved: false });
      }
    });

    blackLevels.forEach(z => {
      // Black pawns
      for (let x = 0; x < 8; x++) {
        startPieces.set(`${x},6,${z}`, { type: 'pawn', color: 'black', pos: { x, y: 6, z }, hasMoved: false });
      }
      // Black back rank
      [[0, 'rook'], [1, 'knight'], [2, 'bishop'], [3, 'queen'], [4, 'king'], [5, 'bishop'], [6, 'knight'], [7, 'rook']].forEach(([x, type]) => {
        startPieces.set(`${x},7,${z}`, { type, color: 'black', pos: { x, y: 7, z }, hasMoved: false });
      });
    });

    piecesRef.current = startPieces;
    calculateMaterial();
    setVersion(v => v + 1);
  }, []);

  useEffect(() => {
    if (!hasInitialized.current) {
      initializePieces();
      hasInitialized.current = true;
    }
  }, [initializePieces]);

  // Persist game mode and AI settings to localStorage
  useEffect(() => {
    localStorage.setItem('9dchess_gameMode', gameMode);
  }, [gameMode]);

  useEffect(() => {
    localStorage.setItem('9dchess_difficulty', difficulty);
  }, [difficulty]);

  useEffect(() => {
    localStorage.setItem('9dchess_computerColor', computerColor);
  }, [computerColor]);

  useEffect(() => {
    localStorage.setItem('9dchess_useAdvancedAI', JSON.stringify(useAdvancedAI));
  }, [useAdvancedAI]);

  // Calculate material count
  const calculateMaterial = useCallback(() => {
    const values = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 };
    let white = 0, black = 0;
    
    piecesRef.current.forEach(piece => {
      const value = values[piece.type] || 0;
      if (piece.color === 'white') white += value;
      else black += value;
    });
    
    setMaterialCount({ white, black });
  }, []);

  // Evaluate position (simplified)
  const evaluateCurrentPosition = useCallback(() => {
    const values = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 100 };
    let score = 0;
    
    piecesRef.current.forEach(piece => {
      const value = values[piece.type] || 0;
      const multiplier = piece.color === 'white' ? 1 : -1;
      
      // Position bonus for advanced pieces
      let posBonus = 0;
      if (piece.type === 'pawn') {
        posBonus = piece.color === 'white' ? piece.pos.y * 0.1 : (7 - piece.pos.y) * 0.1;
      }
      
      score += (value + posBonus) * multiplier;
    });
    
    setPositionEvaluation(Math.max(-100, Math.min(100, score * 5)));
  }, []);

  // Handle square click
  const handleSquareClick = useCallback((x, y, z) => {
    const clickedKey = `${x},${y},${z}`;
    const clickedPiece = piecesRef.current.get(clickedKey);

    if (selectedSquare) {
      const [sx, sy, sz] = selectedSquare.split(',').map(Number);
      const selectedPiece = piecesRef.current.get(selectedSquare);

      // Try to move
      if (highlightedMoves.some(m => m.x === x && m.y === y && m.z === z)) {
        const from = { x: sx, y: sy, z: sz };
        const to = { x, y, z };

        // Check for pawn promotion
        if (selectedPiece.type === 'pawn' && canPromote(to, selectedPiece.color)) {
          setPromotionPending({ from, to, piece: selectedPiece });
          setSelectedSquare(null);
          setHighlightedMoves([]);
          return;
        }

        // Execute move
        executeMove(from, to);
      } else if (clickedPiece && clickedPiece.color === toMove) {
        // Select different piece
        selectPiece(x, y, z, clickedPiece);
      } else {
        // Deselect
        setSelectedSquare(null);
        setHighlightedMoves([]);
      }
    } else if (clickedPiece && clickedPiece.color === toMove) {
      // Select piece
      selectPiece(x, y, z, clickedPiece);
    }
  }, [selectedSquare, highlightedMoves, toMove]);

  // Select a piece and calculate valid moves
  const selectPiece = (x, y, z, piece) => {
    const key = `${x},${y},${z}`;
    setSelectedSquare(key);

    // Calculate valid moves
    const validMoves = [];
    for (let tx = 0; tx < 8; tx++) {
      for (let ty = 0; ty < 8; ty++) {
        for (let tz = 0; tz < 9; tz++) {
          const targetKey = `${tx},${ty},${tz}`;
          const targetPiece = piecesRef.current.get(targetKey);
          
          // Skip if target square has our own piece
          if (targetPiece && targetPiece.color === piece.color) continue;
          
          const isCapture = targetPiece && targetPiece.color !== piece.color;
          
          if (isValidMove(piece.type, { x, y, z }, { x: tx, y: ty, z: tz }, piece.color, isCapture, piece.hasMoved) &&
              isPathClear(piecesRef.current, { x, y, z }, { x: tx, y: ty, z: tz }, piece.type) &&
              !wouldBeInCheckAfterMove(piecesRef.current, { x, y, z }, { x: tx, y: ty, z: tz }, piece.color)) {
            validMoves.push({ x: tx, y: ty, z: tz });
          }
        }
      }
    }

    setHighlightedMoves(validMoves);
  };

  // Execute a move
  const executeMove = (from, to, promoteTo = null) => {
    const fromKey = `${from.x},${from.y},${from.z}`;
    const toKey = `${to.x},${to.y},${to.z}`;
    const piece = piecesRef.current.get(fromKey);
    const captured = piecesRef.current.get(toKey);

    // CRITICAL: Prevent capturing your own pieces
    if (captured && captured.color === piece.color) {
      console.error('Illegal move: Cannot capture your own piece!');
      return;
    }

    // Record move for undo
    undoStackRef.current.push({
      from, to, piece: { ...piece },
      captured: captured ? { ...captured, pos: to } : null
    });
    redoStackRef.current = [];

    // Update piece
    const updatedPiece = { 
      ...piece, 
      pos: to,
      hasMoved: true,
      type: promoteTo || piece.type
    };

    piecesRef.current.delete(fromKey);
    piecesRef.current.set(toKey, updatedPiece);

    // Record move
    const moveNotation = formatMove(from, to, piece, captured, promoteTo);
    moveHistoryRef.current.push(moveNotation);
    setMoveHistory([...moveHistoryRef.current]);
    setLastMove({ from, to });

    // Clear selection
    setSelectedSquare(null);
    setHighlightedMoves([]);
    setHintMove(null);

    // Update material and evaluation
    calculateMaterial();
    evaluateCurrentPosition();

    // Check game status
    const nextPlayer = toMove === 'white' ? 'black' : 'white';
    const inCheck = isInCheck(piecesRef.current, nextPlayer);
    const inCheckmate = inCheck && isCheckmate(piecesRef.current, nextPlayer);
    const inStalemate = !inCheck && isStalemate(piecesRef.current, nextPlayer);

    if (inCheckmate) {
      setGameStatus(`Checkmate! ${toMove} wins!`);
    } else if (inStalemate) {
      setGameStatus('Stalemate! Draw.');
    } else if (inCheck) {
      setGameStatus(`${nextPlayer} is in check!`);
    } else {
      setGameStatus(null);
    }

    // Switch turn
    setToMove(nextPlayer);
    setVersion(v => v + 1);
    moveStartTimeRef.current = Date.now();
    setDrawOfferedBy(null); // Clear any pending draw offers after a move
  };

  // Format move notation
  const formatMove = (from, to, piece, captured, promoteTo) => {
    const files = 'abcdefgh';
    const pieceSymbol = piece.type === 'pawn' ? '' : piece.type[0].toUpperCase();
    const captureSymbol = captured ? 'x' : '';
    const fromNotation = `${files[from.x]}${8 - from.y}z${from.z}`;
    const toNotation = `${files[to.x]}${8 - to.y}z${to.z}`;
    const promotion = promoteTo ? `=${promoteTo[0].toUpperCase()}` : '';
    return `${pieceSymbol}${fromNotation}${captureSymbol}${toNotation}${promotion}`;
  };

  // AI move
  useEffect(() => {
    if (gameMode === 'pvc' && toMove === computerColor && !gameStatus?.includes('mate') && !promotionPending) {
      setAiThinking(true);
      const timer = setTimeout(() => {
        makeComputerMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [toMove, gameMode, computerColor, gameStatus, promotionPending]);

  const makeComputerMove = async () => {
    try {
      const move = useAdvancedAI && (difficulty === 'hard' || difficulty === 'master')
        ? await selectBestMoveAdvanced(piecesRef.current, computerColor, difficulty)
        : selectBestMove(piecesRef.current, computerColor, difficulty);

      if (move) {
        if (move.piece === 'pawn' && canPromote(move.to, computerColor)) {
          executeMove(move.from, move.to, 'queen');
        } else {
          executeMove(move.from, move.to);
        }
      }
    } catch (error) {
      console.error('Error in makeComputerMove:', error);
    } finally {
      setAiThinking(false);
    }
  };

  // Promotion handler
  const handlePromotion = (pieceType) => {
    if (promotionPending) {
      executeMove(promotionPending.from, promotionPending.to, pieceType);
      setPromotionPending(null);
    }
  };

  // Undo move
  const undo = () => {
    const lastMove = undoStackRef.current.pop();
    if (!lastMove) return;

    redoStackRef.current.push(lastMove);
    
    const fromKey = `${lastMove.from.x},${lastMove.from.y},${lastMove.from.z}`;
    const toKey = `${lastMove.to.x},${lastMove.to.y},${lastMove.to.z}`;

    piecesRef.current.delete(toKey);
    piecesRef.current.set(fromKey, lastMove.piece);
    
    if (lastMove.captured) {
      piecesRef.current.set(toKey, lastMove.captured);
    }

    moveHistoryRef.current.pop();
    setMoveHistory([...moveHistoryRef.current]);
    setToMove(toMove === 'white' ? 'black' : 'white');
    setGameStatus(null);
    calculateMaterial();
    evaluateCurrentPosition();
    setVersion(v => v + 1);
  };

  // Generate hint
  const generateHint = () => {
    const move = useAdvancedAI
      ? selectBestMoveAdvanced(piecesRef.current, toMove, 2)
      : selectBestMove(piecesRef.current, toMove, 'medium');
    
    if (move) {
      setHintMove(move);
      setShowHint(true);
      setTimeout(() => setShowHint(false), 3000);
    }
  };

  // New game
  const newGame = () => {
    initializePieces();
    setToMove('white');
    setMoveHistory([]);
    moveHistoryRef.current = [];
    undoStackRef.current = [];
    redoStackRef.current = [];
    setGameStatus(null);
    setSelectedSquare(null);
    setHighlightedMoves([]);
    setLastMove(null);
    setHintMove(null);
    setMoveTimer({ white: 0, black: 0 });
    moveStartTimeRef.current = Date.now();
    setDrawOfferedBy(null);
  };

  // Save/Load
  const saveGame = () => {
    const gameState = {
      pieces: Array.from(piecesRef.current.entries()),
      toMove,
      moveHistory: moveHistoryRef.current,
      undoStack: undoStackRef.current,
      materialCount,
      positionEvaluation
    };
    localStorage.setItem('9dchess_game_3d', JSON.stringify(gameState));
    alert('Game saved!');
  };

  const loadGame = () => {
    const saved = localStorage.getItem('9dchess_game_3d');
    if (saved) {
      const gameState = JSON.parse(saved);
      piecesRef.current = new Map(gameState.pieces);
      setToMove(gameState.toMove);
      moveHistoryRef.current = gameState.moveHistory;
      setMoveHistory([...gameState.moveHistory]);
      undoStackRef.current = gameState.undoStack;
      setMaterialCount(gameState.materialCount);
      setPositionEvaluation(gameState.positionEvaluation);
      setVersion(v => v + 1);
      alert('Game loaded!');
    }
  };

  // Draw offer management
  const offerDraw = () => {
    if (gameStatus) return; // Can't offer draw if game is over
    if (gameMode === 'pvc' && toMove === computerColor) return; // Can't offer on computer's turn
    
    setDrawOfferedBy(toMove);
    alert(`${toMove.toUpperCase()} offers a draw!`);
  };

  const acceptDraw = () => {
    if (!drawOfferedBy) return;
    setGameStatus('Draw by agreement');
    setDrawOfferedBy(null);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const declineDraw = () => {
    setDrawOfferedBy(null);
    alert('Draw offer declined.');
  };

  // Timer
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setMoveTimer(prev => ({
        ...prev,
        [toMove]: prev[toMove] + 1
      }));
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [toMove]);

  // Render 3D pieces
  const renderPieces = () => {
    const pieces = [];
    piecesRef.current.forEach((piece, key) => {
      const [x, y, z] = key.split(',').map(Number);
      const yOffset = z * 2.5 + 0.35; // Above the board
      const isSelected = selectedSquare === key;
      
      pieces.push(
        <ChessPiece3D
          key={key}
          position={[x, yOffset, y]}
          type={piece.type}
          color={piece.color}
          isSelected={isSelected}
          onClick={(e) => {
            e.stopPropagation();
            handleSquareClick(x, y, z);
          }}
        />
      );
    });
    return pieces;
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#1a1a1a' }}>
      {/* 3D Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [12, 15, 12], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 20, 10]} intensity={0.8} />
          <pointLight position={[-10, 10, -10]} intensity={0.4} />
          
          {/* Render all 9 boards */}
          {[...Array(9)].map((_, z) => (
            <ChessBoard3D
              key={z}
              z={z}
              pieces={piecesRef.current}
              selectedSquare={selectedSquare}
              highlightedMoves={highlightedMoves}
              lastMove={lastMove}
              onSquareClick={handleSquareClick}
              showNotation={showNotation}
            />
          ))}
          
          {/* Render pieces */}
          {renderPieces()}
          
          {/* Coordinate labels */}
          <CoordinateLabels3D />
          
          <OrbitControls 
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={10}
            maxDistance={50}
          />
        </Canvas>

        {/* Game status overlay */}
        {gameStatus && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: gameStatus.includes('Checkmate') ? '#d32f2f' : gameStatus.includes('check') ? '#ff9800' : '#2196f3',
            color: 'white',
            padding: '15px 30px',
            borderRadius: '8px',
            fontSize: '20px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 1000
          }}>
            {gameStatus}
          </div>
        )}

        {/* AI thinking indicator - ENHANCED for deep evaluation */}
        {aiThinking && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 87, 34, 0.95)',
            color: 'white',
            padding: '20px 30px',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: 'bold',
            boxShadow: '0 4px 20px rgba(255, 87, 34, 0.5)',
            zIndex: 1000,
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                border: '3px solid white', 
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div>
                <div>🧠 AI Deep Thinking...</div>
                <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '5px' }}>
                  Evaluating hundreds of moves across 9 dimensions
                </div>
              </div>
            </div>
          </div>
        )}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>

      {/* Control Panel */}
      <div style={{
        width: '350px',
        background: '#2d2d2d',
        color: 'white',
        padding: '20px',
        overflowY: 'auto',
        borderLeft: '2px solid #444'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#4a90e2' }}>9D Chess Control Panel</h2>

        {/* Game Controls */}
        <div style={{ marginBottom: '20px', padding: '15px', background: '#383838', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Game Controls</h3>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            <button onClick={newGame} style={buttonStyle}>New Game</button>
            <button onClick={undo} style={buttonStyle}>Undo</button>
            <button onClick={generateHint} style={buttonStyle}>Hint</button>
            <button onClick={saveGame} style={buttonStyle}>Save</button>
            <button onClick={loadGame} style={buttonStyle}>Load</button>
          </div>
          
          {/* Draw Controls */}
          <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {!drawOfferedBy && !gameStatus && (
              <button 
                onClick={offerDraw} 
                disabled={gameMode === 'pvc' && toMove === computerColor}
                style={{
                  ...buttonStyle,
                  background: '#ff9800',
                  opacity: (gameMode === 'pvc' && toMove === computerColor) ? 0.5 : 1,
                  cursor: (gameMode === 'pvc' && toMove === computerColor) ? 'not-allowed' : 'pointer'
                }}
              >
                Offer Draw
              </button>
            )}
            {drawOfferedBy && drawOfferedBy !== toMove && (
              <>
                <button onClick={acceptDraw} style={{ ...buttonStyle, background: '#4caf50' }}>
                  Accept Draw
                </button>
                <button onClick={declineDraw} style={{ ...buttonStyle, background: '#f44336' }}>
                  Decline Draw
                </button>
              </>
            )}
            {drawOfferedBy && (
              <div style={{ 
                fontSize: '11px', 
                color: '#ff9800', 
                padding: '8px', 
                background: '#2d2d2d', 
                borderRadius: '5px',
                width: '100%',
                marginTop: '5px'
              }}>
                {drawOfferedBy === toMove 
                  ? `You offered a draw. Waiting for opponent...` 
                  : `${drawOfferedBy.toUpperCase()} offers a draw!`}
              </div>
            )}
          </div>
        </div>

        {/* Turn & Status */}
        <div style={{ marginBottom: '20px', padding: '15px', background: '#383838', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Turn</h3>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: toMove === 'white' ? '#ffffff' : '#888888' }}>
            {toMove.toUpperCase()}
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px' }}>
            White: {formatTime(moveTimer.white)} | Black: {formatTime(moveTimer.black)}
          </div>
        </div>

        {/* Game Mode */}
        <div style={{ marginBottom: '20px', padding: '15px', background: '#383838', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Game Mode</h3>
          <select value={gameMode} onChange={(e) => setGameMode(e.target.value)} style={selectStyle}>
            <option value="pvp">Player vs Player</option>
            <option value="pvc">Player vs Computer</option>
          </select>
          
          {gameMode === 'pvc' && (
            <>
              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '12px' }}>Computer plays as:</label>
                <select value={computerColor} onChange={(e) => setComputerColor(e.target.value)} style={selectStyle}>
                  <option value="black">Black</option>
                  <option value="white">White</option>
                </select>
              </div>
              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '12px' }}>Difficulty:</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={selectStyle}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="master">Master</option>
                </select>
              </div>
              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '12px' }}>
                  <input 
                    type="checkbox" 
                    checked={useAdvancedAI} 
                    onChange={(e) => setUseAdvancedAI(e.target.checked)}
                  />
                  {' '}Use Advanced AI (Minimax)
                </label>
              </div>
            </>
          )}
        </div>

        {/* Position Evaluation */}
        <div style={{ marginBottom: '20px', padding: '15px', background: '#383838', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Position Evaluation</h3>
          <div style={{ 
            height: '20px', 
            background: '#555', 
            borderRadius: '10px', 
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${50 + positionEvaluation / 2}%`,
              background: positionEvaluation > 0 ? '#4caf50' : '#f44336',
              transition: 'width 0.3s'
            }} />
          </div>
          <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '5px' }}>
            {positionEvaluation > 0 ? `White +${positionEvaluation.toFixed(1)}` : positionEvaluation < 0 ? `Black +${Math.abs(positionEvaluation).toFixed(1)}` : 'Equal'}
          </div>
        </div>

        {/* Material Count */}
        <div style={{ marginBottom: '20px', padding: '15px', background: '#383838', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Material</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>White: {materialCount.white}</div>
            <div>Black: {materialCount.black}</div>
          </div>
        </div>

        {/* Display Settings */}
        <div style={{ marginBottom: '20px', padding: '15px', background: '#383838', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Display Settings</h3>
          <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showNotation} 
              onChange={(e) => setShowNotation(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Show Square Notation
          </label>
        </div>

        {/* Hint Display */}
        {showHint && hintMove && (
          <div style={{ marginBottom: '20px', padding: '15px', background: '#4a90e2', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Hint</h3>
            <div style={{ fontSize: '14px' }}>
              {formatMove(hintMove.from, hintMove.to, hintMove.piece, null, null)}
            </div>
          </div>
        )}

        {/* Move History */}
        <div style={{ padding: '15px', background: '#383838', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Move History</h3>
          <div style={{ 
            maxHeight: '300px', 
            overflowY: 'auto', 
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {moveHistory.length === 0 ? (
              <div style={{ color: '#888' }}>No moves yet</div>
            ) : (
              moveHistory.map((move, i) => (
                <div key={i} style={{ padding: '2px 0' }}>
                  {Math.floor(i / 2) + 1}. {move}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Promotion Modal */}
      {promotionPending && (
        <PromotionModal
          color={promotionPending.piece.color}
          onSelect={handlePromotion}
          onClose={() => setPromotionPending(null)}
        />
      )}
    </div>
  );
};

const buttonStyle = {
  padding: '8px 12px',
  background: '#4a90e2',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 'bold'
};

const selectStyle = {
  width: '100%',
  padding: '8px',
  marginTop: '5px',
  background: '#2d2d2d',
  color: 'white',
  border: '1px solid #555',
  borderRadius: '5px',
  fontSize: '12px'
};

export default NineDChessGame3D;
