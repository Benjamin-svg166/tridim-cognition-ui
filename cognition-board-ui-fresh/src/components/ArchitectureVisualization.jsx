import React, { useState } from 'react';
import '../styles/ArchitectureVisualization.css';
import { useCognition, featureToNodeType } from '../cognition/CognitionContext';

function ArchitectureVisualization() {
  const [activeFeature, setActiveFeature] = useState(null);
  const { setActiveNodeType } = useCognition();

  const handleEnter = (id) => { setActiveFeature(id); setActiveNodeType(featureToNodeType[id] ?? null); };
  const handleLeave = ()   => { setActiveFeature(null); setActiveNodeType(null); };
  const handleClick = (id) => {
    const next = activeFeature === id ? null : id;
    setActiveFeature(next);
    setActiveNodeType(next ? (featureToNodeType[next] ?? null) : null);
  };

  const features = [
    {
      id: 'search',
      title: 'Neural-Guided Search',
      description: 'Context-aware retrieval that anticipates intent, surfacing knowledge before it\'s requested.',
      icon: '🔍',
      color: '#00D9FF'
    },
    {
      id: 'spatial',
      title: 'Spatial Reasoning Engine',
      description: '3D-aware cognition for navigating physical and abstract problem spaces with geometric precision.',
      icon: '🧭',
      color: '#9D4EDD'
    },
    {
      id: 'agents',
      title: 'Multi-Agent Simulation',
      description: 'Autonomous agent orchestration enabling parallel hypothesis testing and collaborative problem-solving.',
      icon: '🤖',
      color: '#3A86FF'
    },
    {
      id: 'memory',
      title: 'Adaptive Memory Fabric',
      description: 'Persistent, layered memory that evolves with context — bridging sessions, domains, and modalities.',
      icon: '💾',
      color: '#FF006E'
    }
  ];

  return (
    <div className="architecture-container">
      <div className="architecture-header">
        <h2>Unified Cognition Architecture</h2>
        <p>Multi-modal cognitive layers working in harmony</p>
      </div>

      <div className="center-core">
        <div className="core-box">GEN-2 CORE</div>
      </div>

      <div className="features-grid">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`feature-card ${activeFeature === feature.id ? 'active' : ''}`}
            style={{
              borderColor: feature.color,
              boxShadow: activeFeature === feature.id ? `0 0 20px ${feature.color}` : 'none'
            }}
            onMouseEnter={() => handleEnter(feature.id)}
            onMouseLeave={handleLeave}
            onClick={() => handleClick(feature.id)}
          >
            <div className="feature-icon" style={{ color: feature.color }}>
              {feature.icon}
            </div>
            <h3>{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
            <div 
              className="feature-indicator"
              style={{ backgroundColor: feature.color }}
            />
          </div>
        ))}
      </div>

      <div className="connection-lines">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none">
          <line x1="250" y1="100" x2="500" y2="200" stroke="#00D9FF" strokeWidth="2" opacity="0.5" />
          <line x1="750" y1="100" x2="500" y2="200" stroke="#9D4EDD" strokeWidth="2" opacity="0.5" />
          <line x1="250" y1="300" x2="500" y2="200" stroke="#3A86FF" strokeWidth="2" opacity="0.5" />
          <line x1="750" y1="300" x2="500" y2="200" stroke="#FF006E" strokeWidth="2" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

export default ArchitectureVisualization;
