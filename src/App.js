import React, { Suspense, lazy, useState } from 'react';
import ThreeDChessBoard from './components/ThreeDChessBoard';
import NineDChessBoard from './components/NineDChessBoard';

// Only lazy load visualizers and 3D game (less commonly used)
const ThreeDVisualizer = lazy(() => import('./components/ThreeDVisualizer'));
const NineDVisualizer = lazy(() => import('./components/NineDVisualizer'));
const ThreeDChessGame = lazy(() => import('./components/ThreeDChessGame'));
const NineDChessGame3D = lazy(() => import('./components/NineDChessGame3D'));

function App() {
  // Check URL parameter for initial mode
  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get('mode');
  let initialMode = 'game';
  if (modeParam === 'visualizer') initialMode = 'visualizer';
  if (modeParam === '9dvisualizer') initialMode = '9dvisualizer';
  if (modeParam === '3dgame') initialMode = '3dgame';
  if (modeParam === '9dgame') initialMode = '9dgame';
  if (modeParam === '9dgame3d') initialMode = '9dgame3d';
  const [mode, setMode] = useState(initialMode);

  const is3DMode = mode === 'visualizer' || mode === '3dgame' || mode === '9dvisualizer' || mode === '9dgame3d';
  
  const placeholderStyle = {
    padding: '80px 60px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 12,
    minHeight: is3DMode ? '100vh' : 600,
    height: is3DMode ? '100vh' : 600,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: is3DMode ? '100%' : 900,
    margin: '0 auto',
    contain: 'layout size style'
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 10, 
      padding: is3DMode ? 0 : 10, 
      paddingTop: is3DMode ? 0 : 0,
      maxWidth: is3DMode ? '100%' : 1400, 
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Mode Toggle Buttons */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <button
          onClick={() => setMode('9dgame3d')}
          style={{
            padding: '10px 20px',
            background: mode === '9dgame3d' ? '#ff1744' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: mode === '9dgame3d' ? 'bold' : 'normal',
            fontSize: '14px'
          }}
          title="Play full 9D chess in immersive 3D!"
        >
          🌌 9D Chess 3D Game (ULTIMATE!)
        </button>
        <button
          onClick={() => setMode('9dgame')}
          style={{
            padding: '10px 20px',
            background: mode === '9dgame' ? '#e74c3c' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: mode === '9dgame' ? 'bold' : 'normal'
          }}
          title="Play chess in 9 dimensions with 9 stacked boards!"
        >
          🚀 9D Chess (2D View)
        </button>
        <button
          onClick={() => setMode('3dgame')}
          style={{
            padding: '10px 20px',
            background: mode === '3dgame' ? '#9b59b6' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: mode === '3dgame' ? 'bold' : 'normal'
          }}
          title="Play chess in full 3D with Three.js"
        >
          🎲 3D Chess Game
        </button>
        <button
          onClick={() => window.open('http://localhost:3000/?mode=visualizer', '_blank')}
          style={{
            padding: '10px 20px',
            background: '#e67e22',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'normal'
          }}
          title="Open 3D visualizer in new tab"
        >
          🎯 3D Visualizer (New Tab)
        </button>
        <button
          onClick={() => window.open('http://localhost:3000/?mode=9dvisualizer', '_blank')}
          style={{
            padding: '10px 20px',
            background: '#f39c12',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'normal'
          }}
          title="Open 9D visualizer in new tab (recommended)"
        >
          🌟 9D Visualizer (New Tab)
        </button>
        <button
          onClick={() => setMode('game')}
          style={{
            padding: '10px 20px',
            background: mode === 'game' ? '#4a90e2' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: mode === 'game' ? 'bold' : 'normal'
          }}
        >
          🎮 Chess Game
        </button>
      </div>

      <div style={{ width: '100%', paddingTop: 0, marginTop: 0 }}>
        {/* Reserve space for heading to prevent CLS */}
        <h3 style={{ 
          textAlign: 'center', 
          marginTop: 0, 
          marginBottom: 10,
          minHeight: 29,
          lineHeight: 1.2,
          visibility: (mode === 'visualizer' || mode === '9dvisualizer' || mode === '9dgame3d') ? 'hidden' : 'visible',
          height: (mode === 'visualizer' || mode === '9dvisualizer' || mode === '9dgame3d') ? 0 : 'auto',
          overflow: (mode === 'visualizer' || mode === '9dvisualizer' || mode === '9dgame3d') ? 'hidden' : 'visible'
        }}>
          {mode === 'game' ? '3D Chess Game - Expanded View' : 
           mode === '3dgame' ? 'Full 3D Chess Game' : 
           mode === '9dgame' ? '🚀 Nine-Dimensional Layered Chess - 9 Stacked Boards!' :
           mode === '9dgame3d' ? '🌌 Nine-Dimensional Chess - Full 3D Playable Game' :
           '3D Chess Move Visualizer'}
        </h3>
        <div style={{ 
          width: '100%',
          overflow: 'visible'
        }}>
          {mode === 'game' ? (
            <ThreeDChessBoard showControlPanel={true} compactMode={false} />
          ) : mode === '9dgame' ? (
            <NineDChessBoard showControlPanel={true} compactMode={false} />
          ) : mode === '9dgame3d' ? (
            <Suspense fallback={
              <div style={placeholderStyle}>
                <div style={{ fontSize: 64, marginBottom: 30 }}>🌌🚀♔♕♖</div>
                <div style={{ fontSize: 32, fontWeight: 600, color: 'white', marginBottom: 15 }}>9D Chess 3D Game</div>
                <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)' }}>Loading ultimate 9-dimensional 3D environment...</div>
              </div>
            }>
              <NineDChessGame3D />
            </Suspense>
          ) : mode === '3dgame' ? (
            <Suspense fallback={
              <div style={placeholderStyle}>
                <div style={{ fontSize: 64, marginBottom: 30 }}>♔♕♖</div>
                <div style={{ fontSize: 32, fontWeight: 600, color: 'white', marginBottom: 15 }}>3D Chess Game</div>
                <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)' }}>Loading 3D environment...</div>
              </div>
            }>
              <ThreeDChessGame />
            </Suspense>
          ) : mode === '9dvisualizer' ? (
            <Suspense fallback={
              <div style={placeholderStyle}>
                <div style={{ fontSize: 64, marginBottom: 30 }}>🚀♔♕♖</div>
                <div style={{ fontSize: 32, fontWeight: 600, color: 'white', marginBottom: 15 }}>9D Chess Visualizer</div>
                <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)' }}>Loading 9-dimensional environment...</div>
              </div>
            }>
              <NineDVisualizer />
            </Suspense>
          ) : (
            <Suspense fallback={
              <div style={placeholderStyle}>
                <div style={{ fontSize: 64, marginBottom: 30 }}>♔♕♖</div>
                <div style={{ fontSize: 32, fontWeight: 600, color: 'white', marginBottom: 15 }}>3D Chess Visualizer</div>
                <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)' }}>Loading...</div>
              </div>
            }>
              <ThreeDVisualizer />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;