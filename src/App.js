import React, { Suspense, lazy, useState } from 'react';
import ThreeDChessBoard from './components/ThreeDChessBoard';

// Only lazy load visualizer and 3D game (less commonly used)
const ThreeDVisualizer = lazy(() => import('./components/ThreeDVisualizer'));
const ThreeDChessGame = lazy(() => import('./components/ThreeDChessGame'));

function App() {
  // Check URL parameter for initial mode
  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get('mode');
  let initialMode = 'game';
  if (modeParam === 'visualizer') initialMode = 'visualizer';
  if (modeParam === '3dgame') initialMode = '3dgame';
  const [mode, setMode] = useState(initialMode);

  // Placeholder style matching actual board container dimensions
  const placeholderStyle = {
    padding: '80px 60px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 12,
    minHeight: (mode === 'visualizer' || mode === '3dgame') ? '100vh' : 600,
    height: (mode === 'visualizer' || mode === '3dgame') ? '100vh' : 600,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: (mode === 'visualizer' || mode === '3dgame') ? '100%' : 900,
    margin: '0 auto',
    contain: 'layout size style'
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 10, 
      padding: (mode === 'visualizer' || mode === '3dgame') ? 0 : 10, 
      paddingTop: (mode === 'visualizer' || mode === '3dgame') ? 0 : 0,
      maxWidth: (mode === 'visualizer' || mode === '3dgame') ? '100%' : 1400, 
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
          title="Open visualizer in new tab (recommended)"
        >
          🎯 3D Visualizer (New Tab)
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
          visibility: mode === 'visualizer' ? 'hidden' : 'visible',
          height: mode === 'visualizer' ? 0 : 'auto',
          overflow: mode === 'visualizer' ? 'hidden' : 'visible'
        }}>
          {mode === 'game' ? '3D Chess Game - Expanded View' : mode === '3dgame' ? 'Full 3D Chess Game' : '3D Chess Move Visualizer'}
        </h3>
        <div style={{ 
          width: '100%',
          overflow: 'visible'
        }}>
          {mode === 'game' ? (
            <ThreeDChessBoard showControlPanel={true} compactMode={false} />
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