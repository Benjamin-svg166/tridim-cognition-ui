// src/cognition/layouts.js

export function layoutHierarchical(nodes, pulses) {
  const incoming = new Map(nodes.map((n) => [n.id, 0]));
  pulses.forEach((p) => incoming.set(p.to, (incoming.get(p.to) ?? 0) + 1));

  const layerMap = new Map();
  const queue = [];

  nodes.forEach((n) => {
    if ((incoming.get(n.id) ?? 0) === 0) {
      layerMap.set(n.id, 0);
      queue.push(n.id);
    }
  });

  while (queue.length) {
    const id = queue.shift();
    const layer = layerMap.get(id);
    pulses
      .filter((p) => p.from === id)
      .forEach((p) => {
        const nextLayer = Math.max(layer + 1, layerMap.get(p.to) ?? 0);
        layerMap.set(p.to, nextLayer);
        queue.push(p.to);
      });
  }

  const byLayer = new Map();
  nodes.forEach((n) => {
    const layer = layerMap.get(n.id) ?? 0;
    if (!byLayer.has(layer)) byLayer.set(layer, []);
    byLayer.get(layer).push(n);
  });

  const maxLayer = Math.max(...byLayer.keys());
  const laidOut = [];

  [...byLayer.entries()].forEach(([layer, layerNodes]) => {
    const x = 0.12 + (0.76 * layer) / (maxLayer || 1);
    const step = 0.8 / (layerNodes.length + 1);
    layerNodes.forEach((n, i) => {
      laidOut.push({
        ...n,
        x,
        y: 0.1 + step * (i + 1),
      });
    });
  });

  return laidOut;
}

export function layoutRadial(nodes, { centerX = 0.5, centerY = 0.5, radiusStep = 0.14 } = {}) {
  const byLayer = new Map();
  nodes.forEach((n) => {
    const layer = n.layer ?? 0;
    if (!byLayer.has(layer)) byLayer.set(layer, []);
    byLayer.get(layer).push(n);
  });

  const laidOut = [];
  [...byLayer.entries()].forEach(([layer, layerNodes]) => {
    const r = radiusStep * (layer + 1);
    const step = (Math.PI * 2) / layerNodes.length;
    layerNodes.forEach((n, i) => {
      const angle = i * step - Math.PI / 2;
      laidOut.push({
        ...n,
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      });
    });
  });

  return laidOut;
}

export function layoutForceDirected(nodes, pulses, iterations = 250) {
  const k = 0.12;
  const repulsion = 0.002;
  const dt = 0.9;

  const pos = new Map(
    nodes.map((n) => [
      n.id,
      { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.8 + 0.1, vx: 0, vy: 0 },
    ])
  );

  for (let step = 0; step < iterations; step++) {
    nodes.forEach((a) => {
      const pa = pos.get(a.id);
      nodes.forEach((b) => {
        if (a.id === b.id) return;
        const pb = pos.get(b.id);
        const dx = pa.x - pb.x;
        const dy = pa.y - pb.y;
        const dist2 = dx * dx + dy * dy + 0.0001;
        const f = repulsion / dist2;
        pa.vx += dx * f;
        pa.vy += dy * f;
      });
    });

    pulses.forEach((e) => {
      const pa = pos.get(e.from);
      const pb = pos.get(e.to);
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      pa.vx += dx * k;
      pa.vy += dy * k;
      pb.vx -= dx * k;
      pb.vy -= dy * k;
    });

    nodes.forEach((n) => {
      const p = pos.get(n.id);
      p.x = Math.min(0.95, Math.max(0.05, p.x + p.vx * dt));
      p.y = Math.min(0.95, Math.max(0.05, p.y + p.vy * dt));
      p.vx *= 0.8;
      p.vy *= 0.8;
    });
  }

  return nodes.map((n) => {
    const p = pos.get(n.id);
    return { ...n, x: p.x, y: p.y };
  });
}
