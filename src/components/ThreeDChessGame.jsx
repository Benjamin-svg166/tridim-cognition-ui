import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { isValidMove, isPathClear, canPromote, isCastling, canCastle, wouldBeInCheckAfterMove, isInCheck, isCheckmate, isStalemate } from './threeDChessUtils';
import { selectBestMove, selectBestMoveAdvanced } from './chessAI_advanced';
import PromotionModal from './PromotionModal';

/**
 * Full 3D Chess Game with Three.js
 * Combines chess game logic with 3D visualization
 */

const PIECE_SYMBOLS = {
  pawn: { white: '♙', black: '♟' },
  rook: { white: '♖', black: '♜' },
  knight: { white: '♘', black: '♞' },
  bishop: { white: '♗', black: '♝' },
  queen: { white: '♕', black: '♛' },
  king: { white: '♔', black: '♚' }
};

// Chess board component - one layer
function ChessBoard({ z, selectedSquare, highlightedMoves, onSquareClick }) {
  const boardSize = 8;
  const squareSize = 1;
  const yOffset = z * 3.5; // Vertical spacing between layers

  const squares = [];
  const labels = [];
  
  for (let x = 0; x < boardSize; x++) {
    for (let y = 0; y < boardSize; y++) {
      const isBlackSquare = (x + y) % 2 === 1;
      const squareKey = `${x},${y},${z}`;
      const isSelected = selectedSquare === squareKey;
      const isHighlighted = highlightedMoves?.some(m => m.x === x && m.y === y && m.z === z);

      let color = isBlackSquare ? '#555555' : '#cccccc';
      if (isSelected) color = '#4a90e2';
      if (isHighlighted) color = '#50c878';

      squares.push(
        <mesh
          key={squareKey}
          position={[x * squareSize, yOffset, y * squareSize]}
          onClick={(e) => {
            e.stopPropagation();
            onSquareClick(x, y, z);
          }}
        >
          <boxGeometry args={[squareSize * 0.95, 0.2, squareSize * 0.95]} />
          <meshStandardMaterial 
            color={color} 
            transparent={z !== 0}
            opacity={z === 0 ? 1 : 0.8}
          />
        </mesh>
      );

      // Add coordinate label on each square
      labels.push(
        <Text
          key={`label-${squareKey}`}
          position={[x * squareSize, yOffset + 0.11, y * squareSize]}
          fontSize={0.15}
          color={isBlackSquare ? '#ffffff' : '#000000'}
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {`${x},${y},${z}`}
        </Text>
      );
    }
  }

  return <group>{squares}{labels}</group>;
}

// Chess piece component
function ChessPiece({ x, y, z, type, color, onClick }) {
  const yOffset = z * 3.5 + 0.4;
  const symbol = PIECE_SYMBOLS[type]?.[color] || '?';

  return (
    <Text
      position={[x, yOffset, y]}
      fontSize={0.7}
      color={color === 'white' ? '#ffffff' : '#222222'}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.03}
      outlineColor={color === 'white' ? '#000000' : '#ffffff'}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {symbol}
    </Text>
  );
}

// Main 3D Chess Game Component
const ThreeDChessGame = () => {
  const size = 8;
  const levels = 3;
  
  // Game state
  const piecesRef = useRef(new Map());
  const toMoveRef = useRef('white');
  const selectedSquareRef = useRef(null);
  const highlightedMovesRef = useRef([]);
  const [toMove, setToMove] = useState('white');
  const [moveHistory, setMoveHistory] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [highlightedMoves, setHighlightedMoves] = useState([]);
  const [gameStatus, setGameStatus] = useState(null);
  const [gameMode, setGameMode] = useState('pvp');
  const [difficulty, setDifficulty] = useState('hard');
  const [computerColor, setComputerColor] = useState('black');
  const [version, setVersion] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [promotionPending, setPromotionPending] = useState(null);
  const hasInitialized = useRef(false);

  // Check game status
  const checkGameStatus = useCallback((nextPlayer) => {
    if (isInCheck(piecesRef.current, nextPlayer)) {
      if (isCheckmate(piecesRef.current, nextPlayer)) {
        setGameStatus('checkmate');
      } else {
        setGameStatus('check');
      }
    } else if (isStalemate(piecesRef.current, nextPlayer)) {
      setGameStatus('stalemate');
    } else {
      setGameStatus(null);
    }
  }, []);

  // Load saved game state from localStorage on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    
    try {
      const savedGame = localStorage.getItem('threeDChessGame3D');
      if (savedGame) {
        const data = JSON.parse(savedGame);
        
        // Restore pieces
        if (data.pieces) {
          piecesRef.current.clear();
          data.pieces.forEach(piece => {
            const key = `${piece.pos.x},${piece.pos.y},${piece.pos.z}`;
            piecesRef.current.set(key, piece);
          });
        }
        
        // Restore game state
        if (data.toMove) {
          toMoveRef.current = data.toMove;
          setToMove(data.toMove);
        }
        if (data.moveHistory) setMoveHistory(data.moveHistory);
        if (data.gameStatus) setGameStatus(data.gameStatus);
        if (data.gameMode) setGameMode(data.gameMode);
        if (data.difficulty) setDifficulty(data.difficulty);
        
        hasInitialized.current = true;
        setVersion(v => v + 1);
        console.log('Game restored from localStorage');
        
        return;
      }
    } catch (error) {
      console.error('Failed to load saved game:', error);
    }
  }, []);

  // Initialize pieces (only if no saved game)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const add = (type, x, y, z, color = 'white') => {
      const key = `${x},${y},${z}`;
      piecesRef.current.set(key, { id: key, type, color, pos: { x, y, z }, hasMoved: false });
    };
    
    // White pieces on top board (z=2)
    add('rook', 0, 0, 2, 'white');
    add('knight', 1, 0, 2, 'white');
    add('bishop', 2, 0, 2, 'white');
    add('queen', 3, 0, 2, 'white');
    add('king', 4, 0, 2, 'white');
    add('bishop', 5, 0, 2, 'white');
    add('knight', 6, 0, 2, 'white');
    add('rook', 7, 0, 2, 'white');
    for (let x = 0; x < size; x++) {
      add('pawn', x, 1, 2, 'white');
    }
    
    // Black pieces on bottom board (z=0)
    for (let x = 0; x < size; x++) {
      add('pawn', x, 6, 0, 'black');
    }
    add('rook', 0, 7, 0, 'black');
    add('knight', 1, 7, 0, 'black');
    add('bishop', 2, 7, 0, 'black');
    add('queen', 3, 7, 0, 'black');
    add('king', 4, 7, 0, 'black');
    add('bishop', 5, 7, 0, 'black');
    add('knight', 6, 7, 0, 'black');
    add('rook', 7, 7, 0, 'black');

    setVersion(v => v + 1);
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (!hasInitialized.current) return;

    try {
      const gameState = {
        pieces: Array.from(piecesRef.current.values()),
        toMove,
        moveHistory,
        gameStatus,
        gameMode,
        difficulty,
        computerColor
      };
      localStorage.setItem('threeDChessGame3D', JSON.stringify(gameState));
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }, [toMove, moveHistory, gameStatus, gameMode, difficulty, computerColor, version]);

  // Debug: Log all pieces when game state changes
  useEffect(() => {
    if (!hasInitialized.current) return;
  }, [version]);

  // Calculate valid moves for a piece
  const getValidMoves = useCallback((piece, fromPos) => {
    const moves = [];
    const { x, y, z } = fromPos;
    
    // Get all theoretical moves based on piece type
    let theoreticalMoves = [];
    
    // Use the same move logic from threeDChessUtils
    for (let tx = 0; tx < size; tx++) {
      for (let ty = 0; ty < size; ty++) {
        for (let tz = 0; tz < levels; tz++) {
          const to = { x: tx, y: ty, z: tz };
          if (tx === x && ty === y && tz === z) continue;
          
          const destKey = `${tx},${ty},${tz}`;
          const destPiece = piecesRef.current.get(destKey);
          
          // CRITICAL: Cannot move to square occupied by friendly piece
          if (destPiece && destPiece.color === piece.color) {
            continue;
          }
          
          const isCapture = destPiece !== undefined;
          
          // Check for castling if piece is a king
          let isValidCastling = false;
          if (piece.type === 'king') {
            const castlingInfo = isCastling(fromPos, to, piece.color);
            if (castlingInfo.type) {
              const rookKey = `${castlingInfo.rookFrom.x},${castlingInfo.rookFrom.y},${castlingInfo.rookFrom.z}`;
              const rook = piecesRef.current.get(rookKey);
              const rookHasMoved = rook ? rook.hasMoved : true;
              isValidCastling = canCastle(piecesRef.current, fromPos, castlingInfo, piece.color, piece.hasMoved, rookHasMoved);
            }
          }
          
          // Check if move is valid (either normal move or castling)
          if (!isValidCastling && !isValidMove(piece.type, fromPos, to, piece.color, isCapture, piece.hasMoved)) {
            continue;
          }
          
          if (isPathClear(piecesRef.current, fromPos, to, piece.type)) {
            // Check if move would leave king in check (skip for castling since canCastle already checks this)
            if (!isValidCastling && wouldBeInCheckAfterMove(piecesRef.current, fromPos, to, piece.color)) {
              continue;
            }
            theoreticalMoves.push({ x: tx, y: ty, z: tz });
          }
        }
      }
    }
    
    return theoreticalMoves;
  }, []);

  // Execute computer move
  const makeComputerMove = useCallback(async () => {
    if (gameMode !== 'pvc' || toMove !== computerColor || gameStatus === 'checkmate' || gameStatus === 'stalemate' || isThinking) {
      return;
    }

    setIsThinking(true);
    
    // Delay to show thinking state
    await new Promise(resolve => setTimeout(resolve, 500));

    const bestMove = await selectBestMoveAdvanced(piecesRef.current, computerColor, difficulty, true, moveHistory);
    
    if (!bestMove) {
      setIsThinking(false);
      return;
    }

    const { from, to, fromKey, toKey } = bestMove;
    const piece = piecesRef.current.get(fromKey);
    
    if (!piece) {
      setIsThinking(false);
      return;
    }

    // Handle capture - record before deleting
    let capturedColor = null;
    let capturedType = null;
    if (piecesRef.current.has(toKey)) {
      const capturedPiece = piecesRef.current.get(toKey);
      capturedColor = capturedPiece.color;
      capturedType = capturedPiece.type;
      piecesRef.current.delete(toKey);
    }
    
    // Move piece
    piecesRef.current.delete(fromKey);
    let movedPiece = {
      ...piece,
      id: toKey,
      pos: { ...to },
      hasMoved: true
    };
    
    // Check for pawn promotion - auto-promote to queen for computer
    let promotedTo = piece.type;
    if (piece.type === 'pawn' && canPromote(to, piece.color)) {
      movedPiece.type = 'queen';
      promotedTo = 'queen';
    }
    
    piecesRef.current.set(toKey, movedPiece);
    
    // Update game state
    const moveRecord = { from, to, piece: promotedTo, pieceColor: piece.color, capColor: capturedColor, capType: capturedType };
    if (promotedTo !== piece.type) {
      moveRecord.promotion = true;
    }
    setMoveHistory(h => [...h, moveRecord]);
    const nextPlayer = toMove === 'white' ? 'black' : 'white';
    toMoveRef.current = nextPlayer;
    setToMove(nextPlayer);
    checkGameStatus(nextPlayer);
    setVersion(v => v + 1);
    setIsThinking(false);
  }, [gameMode, toMove, computerColor, difficulty, gameStatus, isThinking, moveHistory, checkGameStatus]);

  // Trigger computer move when it's computer's turn
  useEffect(() => {
    if (gameMode === 'pvc' && toMove === computerColor && !promotionPending && gameStatus !== 'checkmate' && gameStatus !== 'stalemate' && hasInitialized.current) {
      makeComputerMove();
    }
  }, [gameMode, toMove, computerColor, promotionPending, gameStatus, makeComputerMove]);

  // Handle square click
  const handleSquareClick = useCallback((x, y, z) => {
    const clickedKey = `${x},${y},${z}`;
    const clickedPiece = piecesRef.current.get(clickedKey);
    const currentToMove = toMoveRef.current;
    const currentSelectedSquare = selectedSquareRef.current;
    const currentHighlightedMoves = highlightedMovesRef.current;

    // If a piece is already selected
    if (currentSelectedSquare) {
      const selectedPiece = piecesRef.current.get(currentSelectedSquare);
      
      // Check if clicking on a highlighted valid move
      const isValidMoveClick = currentHighlightedMoves.some(m => m.x === x && m.y === y && m.z === z);
      
      if (isValidMoveClick) {
        // Execute the move
        const from = selectedPiece.pos;
        const to = { x, y, z };
        
        // Check for castling
        if (selectedPiece.type === 'king') {
          const castlingInfo = isCastling(from, to, selectedPiece.color);
          if (castlingInfo.type) {
            const rookKey = `${castlingInfo.rookFrom.x},${castlingInfo.rookFrom.y},${castlingInfo.rookFrom.z}`;
            const rook = piecesRef.current.get(rookKey);
            const rookHasMoved = rook ? rook.hasMoved : true;
            
            if (canCastle(piecesRef.current, from, castlingInfo, selectedPiece.color, selectedPiece.hasMoved, rookHasMoved)) {
              // Execute castling
              piecesRef.current.delete(currentSelectedSquare);
              piecesRef.current.delete(rookKey);
              
              const newKingKey = clickedKey;
              const newRookKey = `${castlingInfo.rookTo.x},${castlingInfo.rookTo.y},${castlingInfo.rookTo.z}`;
              
              const movedKing = {
                ...selectedPiece,
                id: newKingKey,
                pos: { ...to },
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
              
              setMoveHistory(h => [...h, { from, to, piece: 'king', pieceColor: selectedPiece.color, castling: castlingInfo.type }]);
              const nextPlayer = currentToMove === 'white' ? 'black' : 'white';
              toMoveRef.current = nextPlayer;
              setToMove(nextPlayer);
              selectedSquareRef.current = null;
              setSelectedSquare(null);
              highlightedMovesRef.current = [];
              setHighlightedMoves([]);
              checkGameStatus(nextPlayer);
              setVersion(v => v + 1);
              return;
            }
          }
        }
        
        // Handle capture - record before deleting
        let capturedColor = null;
        let capturedType = null;
        if (piecesRef.current.has(clickedKey)) {
          const capturedPiece = piecesRef.current.get(clickedKey);
          capturedColor = capturedPiece.color;
          capturedType = capturedPiece.type;
          piecesRef.current.delete(clickedKey);
        }
        
        // Move piece
        piecesRef.current.delete(currentSelectedSquare);
        const movedPiece = {
          ...selectedPiece,
          id: clickedKey,
          pos: { x, y, z },
          hasMoved: true
        };
        
        // Check for pawn promotion
        if (selectedPiece.type === 'pawn' && canPromote(to, selectedPiece.color)) {
          setPromotionPending({ from, to, piece: movedPiece, capturedColor, capturedType });
          selectedSquareRef.current = null;
          setSelectedSquare(null);
          highlightedMovesRef.current = [];
          setHighlightedMoves([]);
          setVersion(v => v + 1);
          return;
        }
        
        piecesRef.current.set(clickedKey, movedPiece);
        
        // Update game state
        setMoveHistory(h => [...h, { from, to, piece: selectedPiece.type, pieceColor: selectedPiece.color, capColor: capturedColor, capType: capturedType }]);
        const nextPlayer = currentToMove === 'white' ? 'black' : 'white';
        toMoveRef.current = nextPlayer;
        setToMove(nextPlayer);
        selectedSquareRef.current = null;
        setSelectedSquare(null);
        highlightedMovesRef.current = [];
        setHighlightedMoves([]);
        checkGameStatus(nextPlayer);
        setVersion(v => v + 1);
        
        return;
      } else if (clickedPiece && clickedPiece.color === currentToMove) {
        // Clicked on another piece of same color - select it instead
        const moves = getValidMoves(clickedPiece, { x, y, z });
        selectedSquareRef.current = clickedKey;
        setSelectedSquare(clickedKey);
        highlightedMovesRef.current = moves;
        setHighlightedMoves(moves);
        setVersion(v => v + 1);
        return;
      } else {
        // Clicked elsewhere - deselect
        selectedSquareRef.current = null;
        setSelectedSquare(null);
        highlightedMovesRef.current = [];
        setHighlightedMoves([]);
        setVersion(v => v + 1);
        return;
      }
    }

    // No piece selected - try to select one
    if (clickedPiece && clickedPiece.color === currentToMove) {
      const moves = getValidMoves(clickedPiece, { x, y, z });
      selectedSquareRef.current = clickedKey;
      setSelectedSquare(clickedKey);
      highlightedMovesRef.current = moves;
      setHighlightedMoves(moves);
      setVersion(v => v + 1);
    }
  }, [getValidMoves, checkGameStatus]);

  // Handle piece click
  const handlePieceClick = useCallback((piece, pos) => {
    const currentToMove = toMoveRef.current;
    const currentSelectedSquare = selectedSquareRef.current;
    const currentHighlightedMoves = highlightedMovesRef.current;
    
    // If a piece is already selected, check if this is a valid capture target
    if (currentSelectedSquare) {
      const isValidCapture = currentHighlightedMoves.some(m => m.x === pos.x && m.y === pos.y && m.z === pos.z);
      if (isValidCapture) {
        // Delegate to square click handler to execute the capture
        handleSquareClick(pos.x, pos.y, pos.z);
        return;
      }
    }
    
    // Otherwise, only select pieces belonging to current player
    if (piece.color !== currentToMove) {
      return;
    }
    
    const key = `${pos.x},${pos.y},${pos.z}`;
    const moves = getValidMoves(piece, pos);
    selectedSquareRef.current = key;
    setSelectedSquare(key);
    highlightedMovesRef.current = moves;
    setHighlightedMoves(moves);
    setVersion(v => v + 1);
  }, [getValidMoves, handleSquareClick]);

  // Handle pawn promotion selection
  const handlePromotion = useCallback((newType) => {
    if (!promotionPending) return;
    
    const { from, to, piece, capturedColor, capturedType } = promotionPending;
    const destKey = `${to.x},${to.y},${to.z}`;
    
    // Create promoted piece
    const promotedPiece = {
      ...piece,
      id: destKey,
      type: newType
    };
    piecesRef.current.set(destKey, promotedPiece);
    
    // Update move history with promotion
    setMoveHistory(h => [...h, { from, to, piece: newType, pieceColor: piece.color, capColor: capturedColor, capType: capturedType, promotion: true }]);
    const nextPlayer = toMove === 'white' ? 'black' : 'white';
    toMoveRef.current = nextPlayer;
    setToMove(nextPlayer);
    checkGameStatus(nextPlayer);
    setPromotionPending(null);
    setVersion(v => v + 1);
  }, [promotionPending, toMove, checkGameStatus]);

  // Render pieces
  const pieces = Array.from(piecesRef.current.values());

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'row' }}>
      {/* Promotion Modal */}
      {promotionPending && (
        <PromotionModal
          color={promotionPending.piece.color}
          onSelect={handlePromotion}
        />
      )}
      
      {/* Sidebar with Controls and Move History */}
      <div style={{ 
        width: '300px', 
        background: '#2d2d44',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 10px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '20px', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ margin: '0 0 10px 0' }}>♔ 3D Chess</h2>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
            Turn: <span style={{ color: toMove === 'white' ? '#fff' : '#aaa' }}>{toMove.toUpperCase()}</span>
          </div>
          {isThinking && (
            <div style={{ fontSize: '14px', color: '#ffd700', fontStyle: 'italic' }}>
              🤖 AI is thinking...
            </div>
          )}
        </div>

        {/* Game Status */}
        {gameStatus && (
          <div style={{ 
            padding: '15px', 
            background: gameStatus === 'checkmate' ? '#d32f2f' : gameStatus === 'check' ? '#ff9800' : gameStatus === 'draw' ? '#4caf50' : '#666',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            {gameStatus === 'checkmate' ? '♔ CHECKMATE!' : gameStatus === 'check' ? '♔ CHECK!' : gameStatus === 'draw' ? '🤝 DRAW!' : '⚔ STALEMATE'}
          </div>
        )}

        {/* Game Controls */}
        <div style={{ padding: '15px', borderBottom: '1px solid #444' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Game Mode</label>
            <select 
              value={gameMode} 
              onChange={(e) => setGameMode(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '4px', 
                border: 'none',
                background: '#3d3d5c',
                color: 'white',
                fontSize: '14px'
              }}
            >
              <option value="pvp">Player vs Player</option>
              <option value="pvc">Player vs Computer</option>
            </select>
          </div>

          {gameMode === 'pvc' && (
            <>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Difficulty</label>
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: 'none',
                    background: '#3d3d5c',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="master">Master</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Computer Plays</label>
                <select 
                  value={computerColor} 
                  onChange={(e) => setComputerColor(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: 'none',
                    background: '#3d3d5c',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="white">White</option>
                  <option value="black">Black</option>
                </select>
              </div>
            </>
          )}

          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to offer a draw?')) {
                setGameStatus('draw');
              }
            }}
            style={{ 
              width: '100%',
              padding: '10px', 
              cursor: 'pointer', 
              borderRadius: '5px', 
              border: 'none',
              background: '#ff9800',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '10px'
            }}
            disabled={gameStatus === 'checkmate' || gameStatus === 'stalemate' || gameStatus === 'draw'}
          >
            🤝 Offer Draw
          </button>

          <button 
            onClick={() => {
              localStorage.removeItem('threeDChessGame3D');
              piecesRef.current.clear();
              hasInitialized.current = false;
              setMoveHistory([]);
              toMoveRef.current = 'white';
              setToMove('white');
              selectedSquareRef.current = null;
              setSelectedSquare(null);
              highlightedMovesRef.current = [];
              setHighlightedMoves([]);
              setGameStatus(null);
              setIsThinking(false);
              setVersion(v => v + 1);
              window.location.reload();
            }}
            style={{ 
              width: '100%',
              padding: '10px', 
              cursor: 'pointer', 
              borderRadius: '5px', 
              border: 'none',
              background: '#667eea',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            🔄 Reset Game
          </button>
        </div>

        {/* Move History */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 15px', borderBottom: '1px solid #444', fontWeight: 'bold', fontSize: '14px' }}>
            Move History ({moveHistory.length} moves)
          </div>
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '10px 15px',
            fontSize: '13px'
          }}>
            {moveHistory.length === 0 ? (
              <div style={{ color: '#888', fontStyle: 'italic' }}>No moves yet</div>
            ) : (
              moveHistory.map((move, idx) => {
                const moveNum = Math.floor(idx / 2) + 1;
                const isWhite = idx % 2 === 0;
                const pieceColor = isWhite ? 'white' : 'black';
                const pieceSymbol = PIECE_SYMBOLS[move.piece]?.[pieceColor] || move.piece;
                const capturedSymbol = move.capType ? (PIECE_SYMBOLS[move.capType]?.[move.capColor] || move.capType) : '';
                const fromStr = `(${move.from.x},${move.from.y},${move.from.z})`;
                const toStr = `(${move.to.x},${move.to.y},${move.to.z})`;
                const moveConnector = move.capColor && move.capType ? '×' : '→';
                
                return (
                  <div 
                    key={idx} 
                    style={{ 
                      padding: '6px 8px', 
                      marginBottom: '4px',
                      background: isWhite ? '#3d3d5c' : '#2d2d44',
                      borderRadius: '4px',
                      borderLeft: `3px solid ${isWhite ? '#fff' : '#888'}`
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                      {isWhite && `${moveNum}. `}<span style={{ color: isWhite ? '#fff' : '#888' }}>{pieceSymbol}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#aaa' }}>
                      {fromStr} {moveConnector} {toStr}
                      {move.capColor && move.capType && (
                        <span> <span style={{ color: move.capColor === 'white' ? '#fff' : '#888' }}>{capturedSymbol}</span></span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div style={{ flex: 1 }}>
        <Canvas
          camera={{ position: [10, 12, 10], fov: 60 }}
          style={{ background: '#1a1a2e' }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />

          {/* Render boards */}
          {[0, 1, 2].map(z => (
            <ChessBoard
              key={z}
              z={z}
              selectedSquare={selectedSquare}
              highlightedMoves={highlightedMoves}
              onSquareClick={handleSquareClick}
            />
          ))}

          {/* Render pieces */}
          {pieces.map(piece => (
            <ChessPiece
              key={piece.id}
              x={piece.pos.x}
              y={piece.pos.y}
              z={piece.pos.z}
              type={piece.type}
              color={piece.color}
              onClick={() => handlePieceClick(piece, piece.pos)}
            />
          ))}

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={8}
            maxDistance={25}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default ThreeDChessGame;
