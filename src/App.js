import React from 'react';
import BoardRenderer from './components/BoardRenderer';
import ThreeDChessBoard from './components/ThreeDChessBoard';
function App() {
  return (
    <div>
      <BoardRenderer />
      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center' }}>3D Chess Prototype</h3>
        <ThreeDChessBoard size={8} levels={3} canvasSize={240} />
      </div>
    </div>
  );
}

export default App;