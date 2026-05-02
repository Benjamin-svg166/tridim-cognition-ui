import React from 'react';
import BoardRenderer from './BoardRenderer';
import ArchitectureVisualization from './components/ArchitectureVisualization';
import PerformanceMetrics from './components/PerformanceMetrics';
import RoadmapTimeline from './components/RoadmapTimeline';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1 className="main-title">GEN-2</h1>
          <h2 className="subtitle">Unified Cognition Platform</h2>
          <p className="tagline">Beyond search. Beyond reasoning. A new architecture of thought.</p>
        </div>
      </header>

      <main className="app-main">
        <section className="section">
          <ArchitectureVisualization />
        </section>

        <section className="section">
          <PerformanceMetrics />
        </section>

        <section className="section">
          <RoadmapTimeline />
        </section>

        <section className="section">
          <BoardRenderer />
        </section>
      </main>

      <footer className="app-footer">
        <p>Gen-2 Cognitive Platform  •  Confidential</p>
        <p>Made by Copilot</p>
        <p>gen2.cognitive.ai</p>
      </footer>
    </div>
  );
}

export default App;