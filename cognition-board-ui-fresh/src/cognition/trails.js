// src/cognition/trails.js
export const nodeTypes = {
  search: { color: '#00D9FF', label: 'Neural Search' },
  reasoning: { color: '#9D4EDD', label: 'Reasoning' },
  memory: { color: '#FF006E', label: 'Memory' },
  spatial: { color: '#3A86FF', label: 'Spatial' },
  agent: { color: '#FB5607', label: 'Agent' },
  meta: { color: '#FFD60A', label: 'Meta-Cognition' },
  evaluation: { color: '#4CC9F0', label: 'Evaluation' },
  synthesis: { color: '#F72585', label: 'Synthesis' },
};

export const cognitionTrails = [
  {
    id: 'gen2-advanced',
    label: 'Gen-2 Advanced Flow',
    nodes: [
      { id: 'q1', type: 'search', label: 'Query Init', x: 0.10, y: 0.25, layer: 0 },
      { id: 'q2', type: 'search', label: 'Context Expand', x: 0.18, y: 0.18, layer: 0 },
      { id: 'q3', type: 'memory', label: 'Recall Prior', x: 0.22, y: 0.32, layer: 0 },

      { id: 'r1', type: 'reasoning', label: 'Infer', x: 0.35, y: 0.20, layer: 1 },
      { id: 'r2', type: 'reasoning', label: 'Hypothesize', x: 0.42, y: 0.30, layer: 1 },
      { id: 'r3', type: 'evaluation', label: 'Evaluate', x: 0.38, y: 0.42, layer: 1 },

      { id: 's1', type: 'spatial', label: 'Map Structure', x: 0.55, y: 0.25, layer: 2 },
      { id: 's2', type: 'spatial', label: 'Align Geometry', x: 0.60, y: 0.40, layer: 2 },

      { id: 'y1', type: 'synthesis', label: 'Fuse Signals', x: 0.72, y: 0.28, layer: 3 },
      { id: 'y2', type: 'synthesis', label: 'Generate Plan', x: 0.78, y: 0.42, layer: 3 },

      { id: 'a1', type: 'agent', label: 'Execute', x: 0.88, y: 0.32, layer: 4 },
      { id: 'a2', type: 'agent', label: 'Validate', x: 0.92, y: 0.18, layer: 4 },

      { id: 'm1', type: 'meta', label: 'Self-Monitor', x: 0.50, y: 0.10, layer: 5 },
      { id: 'm2', type: 'meta', label: 'Adjust Strategy', x: 0.65, y: 0.12, layer: 5 },
    ],
    pulses: [
      { from: 'q1', to: 'q2', type: 'hover', weight: 1 },
      { from: 'q2', to: 'q3', type: 'hover', weight: 1 },
      { from: 'q3', to: 'r1', type: 'click', weight: 2 },

      { from: 'r1', to: 'r2', type: 'hover', weight: 1 },
      { from: 'r2', to: 'r3', type: 'click', weight: 2 },

      { from: 'r2', to: 's1', type: 'hover', weight: 1 },
      { from: 'r3', to: 's2', type: 'hover', weight: 1 },

      { from: 's1', to: 'y1', type: 'click', weight: 2 },
      { from: 's2', to: 'y2', type: 'hover', weight: 1 },

      { from: 'y1', to: 'a1', type: 'click', weight: 2 },
      { from: 'y2', to: 'a2', type: 'hover', weight: 1 },

      { from: 'a1', to: 'q3', type: 'hover', weight: 1 },

      { from: 'm1', to: 'r3', type: 'hover', weight: 1 },
      { from: 'm2', to: 'y2', type: 'click', weight: 2 },
      { from: 'm2', to: 'a1', type: 'hover', weight: 1 },
    ],
  },

  // You can add more flows here:
  // { id: 'search-flow', label: 'Neural Search Flow', nodes: [...], pulses: [...] },
];
