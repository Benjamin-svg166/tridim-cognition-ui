import React, { useEffect, useRef } from 'react';
import { useCognition } from './cognition/CognitionContext';
import { nodeTypes } from './cognition/trails';

const PULSE_DURATION = 1800;
const PULSE_STAGGER = 320;
const noop = () => {};
const EMPTY_TRAIL = { nodes: [], pulses: [] };

const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const NODE_RADIUS = 16;

const BoardRenderer = () => {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const rafRef       = useRef(null);
  const {
    activeTrail,
    activeNodeType = null,
    inspectedNode = null,
    setInspectedNode = noop,
  } = useCognition() ?? {};
  const sampleTrail = activeTrail ?? EMPTY_TRAIL;

  const activeNodeTypeRef = useRef(activeNodeType);
  const inspectedNodeRef  = useRef(inspectedNode);

  useEffect(() => { activeNodeTypeRef.current = activeNodeType; }, [activeNodeType]);
  useEffect(() => { inspectedNodeRef.current  = inspectedNode;  }, [inspectedNode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let hit = null;
      sampleTrail.nodes.forEach((node) => {
        const nx = node.x * canvas.width;
        const ny = node.y * canvas.height;
        if (Math.hypot(mx - nx, my - ny) <= NODE_RADIUS) hit = node.id;
      });
      setInspectedNode(hit === inspectedNodeRef.current ? null : hit);
    };
    canvas.addEventListener('click', onClick);

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const over = sampleTrail.nodes.some((node) => {
        return Math.hypot(mx - node.x * canvas.width, my - node.y * canvas.height) <= NODE_RADIUS;
      });
      canvas.style.cursor = over ? 'pointer' : 'default';
    };
    canvas.addEventListener('mousemove', onMouseMove);

    const pos = (node) => ({
      x: node.x * canvas.width,
      y: node.y * canvas.height,
    });

    const drawBackground = () => {
      ctx.fillStyle = '#050812';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawTrailLines = () => {
      sampleTrail.pulses.forEach((pulse) => {
        const from = pos(sampleTrail.nodes.find((n) => n.id === pulse.from));
        const to   = pos(sampleTrail.nodes.find((n) => n.id === pulse.to));
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });
    };

    const drawAnimatedPulse = (from, to, progress, color, weight) => {
      const e = easeInOut(progress);
      const x = from.x + (to.x - from.x) * e;
      const y = from.y + (to.y - from.y) * e;

      // Glowing trail behind dot
      const trailProgress = Math.max(0, progress - 0.18);
      const te = easeInOut(trailProgress);
      const tx = from.x + (to.x - from.x) * te;
      const ty = from.y + (to.y - from.y) * te;
      const grad = ctx.createLinearGradient(tx, ty, x, y);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, color + 'bb');
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(x, y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5 * weight;
      ctx.stroke();
      ctx.restore();

      // Traveling dot
      ctx.save();
      ctx.shadowBlur = 22 * weight;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(x, y, 5 * weight, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    const drawNodes = (timestamp) => {
      const highlightType = activeNodeTypeRef.current;
      const selectedId    = inspectedNodeRef.current;

      sampleTrail.nodes.forEach((node) => {
        const { x, y }  = pos(node);
        const color      = nodeTypes[node.type]?.color ?? '#ffffff';
        const isHighlighted = highlightType === node.type;
        const isSelected    = selectedId === node.id;
        const isDimmed      = !!highlightType && !isHighlighted;
        const pulse         = isHighlighted ? 1 + 0.28 * Math.sin(timestamp * 0.006) : 1;
        const ringR         = NODE_RADIUS * pulse;

        ctx.globalAlpha = isDimmed ? 0.22 : 1;

        if (isSelected) {
          ctx.save();
          ctx.shadowBlur  = 40;
          ctx.shadowColor = color;
          ctx.beginPath();
          ctx.arc(x, y, ringR + 9, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth   = 2;
          ctx.stroke();
          ctx.restore();
        }

        ctx.save();
        ctx.shadowBlur  = isHighlighted ? 50 : 30;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(x, y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = isHighlighted ? color + 'aa' : color + '44';
        ctx.lineWidth   = isHighlighted ? 2.5 : 2;
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.shadowBlur  = isHighlighted ? 28 : 18;
        ctx.shadowColor = color;
        const grad = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, 9);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, color);
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.font      = `${isHighlighted || isSelected ? '700' : '600'} 11px system-ui, sans-serif`;
        ctx.fillStyle = isHighlighted || isSelected ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.80)';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, x, y + 28);
        ctx.restore();

        ctx.globalAlpha = 1;
      });
    };

    const startTime = performance.now();

    const animate = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      drawTrailLines();

      sampleTrail.pulses.forEach((pulse, i) => {
        const fromNode = sampleTrail.nodes.find((n) => n.id === pulse.from);
        const toNode   = sampleTrail.nodes.find((n) => n.id === pulse.to);
        const color    = nodeTypes[toNode.type]?.color ?? '#ffffff';
        const offset   = i * PULSE_STAGGER;
        const progress = ((timestamp - startTime + offset) % PULSE_DURATION) / PULSE_DURATION;
        drawAnimatedPulse(pos(fromNode), pos(toNode), progress, color, pulse.weight ?? 1);
      });

      drawNodes(timestamp);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('mousemove', onMouseMove);
    };
  }, [setInspectedNode, sampleTrail.nodes, sampleTrail.pulses]);

  if (!activeTrail) return null;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '480px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#050812',
        border: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
};

export default BoardRenderer;