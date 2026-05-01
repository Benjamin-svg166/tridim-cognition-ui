import React, { useState } from 'react';
import '../styles/RoadmapTimeline.css';

function RoadmapTimeline() {
  const [activePhase, setActivePhase] = useState(null);

  const phases = [
    {
      id: 'phase1',
      phase: 'Phase 1',
      title: 'Foundation',
      timing: 'Q1 – Q2 2026',
      status: 'current',
      milestones: [
        'Core architecture deployed',
        'Neural search operational',
        'Spatial reasoning foundation'
      ],
      color: '#00D9FF'
    },
    {
      id: 'phase2',
      phase: 'Phase 2',
      title: 'Expansion',
      timing: 'Q3 – Q4 2026',
      status: 'upcoming',
      milestones: [
        'Multi-agent simulation at scale',
        'Cross-domain memory integration',
        'Enhanced reasoning capabilities'
      ],
      color: '#9D4EDD'
    },
    {
      id: 'phase3',
      phase: 'Phase 3',
      title: 'Convergence',
      timing: '2027+',
      status: 'future',
      milestones: [
        'Full cognitive unification',
        'Self-evolving architecture',
        'Emergent reasoning capabilities'
      ],
      color: '#3A86FF'
    }
  ];

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h2>The Road Ahead</h2>
        <p>Roadmap for cognitive evolution</p>
      </div>

      <div className="timeline-wrapper">
        <div className="timeline-line" />

        <div className="phases-container">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className={`phase-card ${phase.status} ${activePhase === phase.id ? 'active' : ''}`}
              onMouseEnter={() => setActivePhase(phase.id)}
              onMouseLeave={() => setActivePhase(null)}
              onClick={() => setActivePhase(activePhase === phase.id ? null : phase.id)}
              style={{
                borderColor: phase.color,
                boxShadow: activePhase === phase.id ? `0 0 25px ${phase.color}` : 'none'
              }}
            >
              <div className="phase-dot" style={{ backgroundColor: phase.color }} />

              <div className="phase-header-section">
                <span className="phase-label">{phase.phase}</span>
                <h3>{phase.title}</h3>
                <p className="phase-timing">{phase.timing}</p>
              </div>

              <div className={`milestones ${activePhase === phase.id ? 'expanded' : ''}`}>
                <div className="milestones-title">Key Milestones</div>
                {phase.milestones.map((milestone, idx) => (
                  <div key={idx} className="milestone-item">
                    <span className="milestone-bullet" style={{ backgroundColor: phase.color }} />
                    <span>{milestone}</span>
                  </div>
                ))}
              </div>

              <div className="status-badge" style={{ backgroundColor: phase.color }}>
                {phase.status.charAt(0).toUpperCase() + phase.status.slice(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="timeline-footer">
        <p>Progressive advancement toward full cognitive unification</p>
      </div>
    </div>
  );
}

export default RoadmapTimeline;
