import React, { useState, useEffect } from 'react';
import '../styles/PerformanceMetrics.css';

function PerformanceMetrics() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const metrics = [
    {
      label: 'Reasoning Speed',
      value: '3.2×',
      unit: 'vs. Gen-1',
      color: '#00D9FF',
      icon: '⚡'
    },
    {
      label: 'Contextual Accuracy',
      value: '97.4%',
      unit: '',
      color: '#9D4EDD',
      icon: '🎯'
    },
    {
      label: 'Avg. Retrieval Latency',
      value: '12ms',
      unit: '',
      color: '#3A86FF',
      icon: '⏱️'
    },
    {
      label: 'Parameters Active',
      value: '10B+',
      unit: '',
      color: '#FF006E',
      icon: '🔗'
    },
    {
      label: 'Scalable Agent Instances',
      value: '∞',
      unit: '',
      color: '#FB5607',
      icon: '🌐'
    }
  ];

  return (
    <div className="metrics-container">
      <div className="metrics-header">
        <h2>Performance at a Glance</h2>
        <p>Next-generation cognitive capabilities</p>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`metric-card ${isVisible ? 'visible' : ''}`}
            style={{
              animationDelay: `${index * 0.1}s`,
              borderTopColor: metric.color
            }}
          >
            <div className="metric-icon">{metric.icon}</div>
            <div className="metric-value" style={{ color: metric.color }}>
              {metric.value}
            </div>
            <div className="metric-unit">{metric.unit}</div>
            <div className="metric-label">{metric.label}</div>
            <div
              className="metric-glow"
              style={{ backgroundColor: metric.color }}
            />
          </div>
        ))}
      </div>

      <div className="metrics-footer">
        <p>Continuously improving across all dimensions</p>
      </div>
    </div>
  );
}

export default PerformanceMetrics;
