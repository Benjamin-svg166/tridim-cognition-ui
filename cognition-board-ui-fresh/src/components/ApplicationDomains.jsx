import React, { useState, useEffect, useRef } from 'react';
import '../styles/ApplicationDomains.css';

const domains = [
  {
    id: 'autonomous',
    icon: '🚗',
    title: 'Autonomous Systems',
    description: 'Self-navigating agents that perceive, decide, and act in dynamic real-world environments.',
    color: '#00D9FF',
    tags: ['Perception', 'Planning', 'Control'],
  },
  {
    id: 'science',
    icon: '🔬',
    title: 'Scientific Discovery',
    description: 'Accelerating hypothesis generation, experiment design, and cross-domain knowledge synthesis.',
    color: '#9D4EDD',
    tags: ['Research', 'Simulation', 'Analysis'],
  },
  {
    id: 'finance',
    icon: '📈',
    title: 'Financial Modeling',
    description: 'Real-time risk assessment, market simulation, and predictive portfolio intelligence.',
    color: '#3A86FF',
    tags: ['Risk', 'Forecasting', 'Markets'],
  },
  {
    id: 'healthcare',
    icon: '🧬',
    title: 'Healthcare Intelligence',
    description: 'Diagnostic reasoning, treatment pathway optimization, and genomic pattern recognition.',
    color: '#FF006E',
    tags: ['Diagnostics', 'Genomics', 'Pathways'],
  },
  {
    id: 'defense',
    icon: '🛡️',
    title: 'Defense & Security',
    description: 'Threat modeling, anomaly detection, and multi-domain situational awareness at scale.',
    color: '#FB5607',
    tags: ['Threat Intel', 'Detection', 'Awareness'],
  },
  {
    id: 'creative',
    icon: '🎨',
    title: 'Creative Design',
    description: 'Generative ideation, aesthetic reasoning, and collaborative human-AI co-creation.',
    color: '#FFBE0B',
    tags: ['Generative', 'Ideation', 'Co-creation'],
  },
  {
    id: 'robotics',
    icon: '🦾',
    title: 'Robotics & Manufacturing',
    description: 'Precision motion planning, adaptive assembly, and real-time quality cognition.',
    color: '#38B000',
    tags: ['Motion', 'Assembly', 'Quality'],
  },
  {
    id: 'urban',
    icon: '🏙️',
    title: 'Urban Planning',
    description: 'City-scale simulation, infrastructure optimization, and sustainable growth modeling.',
    color: '#00B4D8',
    tags: ['Simulation', 'Infrastructure', 'Growth'],
  },
];

function ApplicationDomains() {
  const [hoveredId, setHoveredId] = useState(null);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="domains-container" ref={containerRef}>
      <div className="domains-header">
        <h2>Application Domains</h2>
        <p>Transforming industries through unified cognitive architecture</p>
      </div>

      <div className="domains-grid">
        {domains.map((domain, index) => (
          <div
            key={domain.id}
            className={`domain-card ${visible ? 'domain-card--visible' : ''} ${hoveredId === domain.id ? 'domain-card--active' : ''}`}
            style={{
              '--domain-color': domain.color,
              animationDelay: `${index * 0.07}s`,
            }}
            onMouseEnter={() => setHoveredId(domain.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="domain-card__glow" />

            <div className="domain-card__icon">{domain.icon}</div>

            <h3 className="domain-card__title">{domain.title}</h3>

            <p className="domain-card__description">{domain.description}</p>

            <div className="domain-card__tags">
              {domain.tags.map((tag) => (
                <span key={tag} className="domain-card__tag">{tag}</span>
              ))}
            </div>

            <div className="domain-card__bar" />
          </div>
        ))}
      </div>

      <div className="domains-footer">
        <span className="domains-footer__count">8</span>
        <span className="domains-footer__label"> active deployment domains</span>
        <span className="domains-footer__dot">·</span>
        <span className="domains-footer__label">Expanding continuously</span>
      </div>
    </div>
  );
}

export default ApplicationDomains;
