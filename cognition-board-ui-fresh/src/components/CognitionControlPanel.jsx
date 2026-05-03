// src/components/CognitionControlPanel.jsx
import React from 'react';
import { useCognition } from '../cognition/CognitionContext';
import { cognitionTrails } from '../cognition/trails';

const layouts = [
  { id: 'hierarchical', label: 'Hierarchical' },
  { id: 'radial', label: 'Radial' },
  { id: 'force', label: 'Force-Directed' },
];

const CognitionControlPanel = () => {
  const {
    activeLayout,
    setActiveLayout,
    activeTrailId,
    setActiveTrailId,
    isControlPanelOpen,
    setIsControlPanelOpen,
    activeTrail,
  } = useCognition();

  const nodeCount = activeTrail?.nodes?.length ?? 0;
  const pulseCount = activeTrail?.pulses?.length ?? 0;

  return (
    <div className={`cog-panel-wrapper ${isControlPanelOpen ? 'open' : 'closed'}`}>
      <button
        className="cog-panel-toggle"
        onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
        aria-label="Toggle cognition controls"
      >
        {isControlPanelOpen ? '<' : '>'}
      </button>

      <div className="cog-panel" aria-hidden={!isControlPanelOpen}>
        <div className="cog-panel-section">
          <div className="cog-panel-title">Cognition Layout</div>
          <div className="cog-panel-layout-buttons">
            {layouts.map((l) => (
              <button
                key={l.id}
                className={`cog-pill ${activeLayout === l.id ? 'active' : ''}`}
                onClick={() => setActiveLayout(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cog-panel-section">
          <div className="cog-panel-title">Cognition Trail</div>
          <select className="cog-select" value={activeTrailId} onChange={(e) => setActiveTrailId(e.target.value)}>
            {cognitionTrails.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="cog-panel-section">
          <div className="cog-panel-title">Live Stats</div>
          <div className="cog-stats-row">
            <span>Nodes</span>
            <span>{nodeCount}</span>
          </div>
          <div className="cog-stats-row">
            <span>Pulses</span>
            <span>{pulseCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CognitionControlPanel;
