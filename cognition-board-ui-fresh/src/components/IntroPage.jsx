import React from 'react';
import ArchitectureVisualization from './ArchitectureVisualization';
import ApplicationDomains from './ApplicationDomains';
import RoadmapTimeline from './RoadmapTimeline';
import '../styles/IntroPage.css';

function IntroPage({ onEnter }) {
  return (
    <div className="intro-page">
      {/* Hero Section - Critical above-the-fold content */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">GEN-2 COGNITIVE PLATFORM</div>
          <h1 className="hero-title">
            The Next Evolution of
            <span className="hero-title-accent"> Cognitive Intelligence</span>
          </h1>
          <p className="hero-description">
            A unified architecture for multi-modal reasoning, spatial cognition, and autonomous agent orchestration.
            Built for the future of human-AI collaboration.
          </p>
          <button className="hero-cta" onClick={onEnter} aria-label="Enter the GEN-2 Platform">
            <span>Enter Platform</span>
            <span className="hero-cta-arrow" aria-hidden="true">→</span>
          </button>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">4</div>
              <div className="hero-stat-label">Cognitive Layers</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">8</div>
              <div className="hero-stat-label">Application Domains</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">∞</div>
              <div className="hero-stat-label">Possibilities</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orbit-container">
            <div className="orbit orbit-1">
              <div className="orbit-dot" style={{ backgroundColor: '#00D9FF' }} />
            </div>
            <div className="orbit orbit-2">
              <div className="orbit-dot" style={{ backgroundColor: '#9D4EDD' }} />
            </div>
            <div className="orbit orbit-3">
              <div className="orbit-dot" style={{ backgroundColor: '#3A86FF' }} />
            </div>
            <div className="orbit orbit-4">
              <div className="orbit-dot" style={{ backgroundColor: '#FF006E' }} />
            </div>
            <div className="core-sphere">GEN-2</div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="intro-section">
        <ArchitectureVisualization />
      </section>

      {/* Domains Section */}
      <section className="intro-section">
        <ApplicationDomains />
      </section>

      {/* Roadmap Section */}
      <section className="intro-section">
        <RoadmapTimeline />
      </section>

      {/* Footer CTA */}
      <section className="footer-cta">
        <h2>Ready to explore?</h2>
        <p>Experience the future of cognitive intelligence</p>
        <button className="footer-cta-button" onClick={onEnter} aria-label="Launch the GEN-2 Platform">
          Launch Platform
        </button>
      </section>
    </div>
  );
}

export default IntroPage;
