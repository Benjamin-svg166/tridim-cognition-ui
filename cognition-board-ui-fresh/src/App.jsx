import React from 'react';
import NavBar from './components/NavBar';
import ArchitectureVisualization from './components/ArchitectureVisualization';
import PerformanceMetrics from './components/PerformanceMetrics';
import RoadmapTimeline from './components/RoadmapTimeline';
import ApplicationDomains from './components/ApplicationDomains';
import CognitionShell from './components/CognitionShell';
import { CognitionProvider } from './cognition/CognitionContext';
import './App.css';

function App() {
  return (
    <CognitionProvider>
    <div className="App">
      <NavBar />
      <header className="app-header">
        <div className="header-content">
          <h1 className="main-title">GEN-2</h1>
          <h2 className="subtitle">Unified Cognition Platform</h2>
          <p className="tagline">Beyond search. Beyond reasoning. A new architecture of thought.</p>
        </div>
      </header>

      <main className="app-main">
        <section id="architecture" className="section">
          <ArchitectureVisualization />
        </section>

        <section id="performance" className="section">
          <PerformanceMetrics />
        </section>

        <section id="roadmap" className="section">
          <RoadmapTimeline />
        </section>

        <section id="domains" className="section">
          <ApplicationDomains />
        </section>

        <section className="section">
          <div id="trail" style={{ padding: '60px 40px 20px', textAlign: 'center' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FB5607 0%, #FF006E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 12px 0',
            }}>Live Cognition Trail</h2>
            <p style={{ color: '#b0b0b0', marginBottom: '30px' }}>Real-time visualization of cognitive signal propagation</p>
          </div>
          <CognitionShell />
        </section>
      </main>

      <footer className="app-footer">
        <p>Gen-2 Cognitive Platform  •  Confidential</p>
        <p>Made by Copilot</p>
        <p>gen2.cognitive.ai</p>
      </footer>
    </div>
    </CognitionProvider>
  );
}

export default App;