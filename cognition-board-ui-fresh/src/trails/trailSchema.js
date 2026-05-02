// Cognition trail schema — normalized x/y (0–1) scaled to canvas at render time
export const nodeTypes = {
  search:    { color: '#00D9FF', label: 'Neural Search' },
  reasoning: { color: '#9D4EDD', label: 'Reasoning' },
  memory:    { color: '#FF006E', label: 'Memory' },
  spatial:   { color: '#3A86FF', label: 'Spatial' },
  agent:     { color: '#FB5607', label: 'Agent' },
};

export const sampleTrail = {
  id: 'trail-001',
  nodes: [
    { id: 'n1', type: 'search',    label: 'Query Init', x: 0.12, y: 0.28 },
    { id: 'n2', type: 'reasoning', label: 'Infer',      x: 0.32, y: 0.18 },
    { id: 'n3', type: 'memory',    label: 'Recall',     x: 0.52, y: 0.32 },
    { id: 'n4', type: 'spatial',   label: 'Map',        x: 0.42, y: 0.62 },
    { id: 'n5', type: 'agent',     label: 'Execute',    x: 0.70, y: 0.50 },
    { id: 'n6', type: 'reasoning', label: 'Validate',   x: 0.78, y: 0.22 },
    { id: 'n7', type: 'memory',    label: 'Store',      x: 0.85, y: 0.72 },
  ],
  pulses: [
    { from: 'n1', to: 'n2', type: 'hover', weight: 1 },
    { from: 'n2', to: 'n3', type: 'click', weight: 2 },
    { from: 'n3', to: 'n4', type: 'hover', weight: 1 },
    { from: 'n4', to: 'n5', type: 'click', weight: 2 },
    { from: 'n2', to: 'n6', type: 'hover', weight: 1 },
    { from: 'n5', to: 'n7', type: 'click', weight: 2 },
    { from: 'n6', to: 'n7', type: 'hover', weight: 1 },
  ],
};