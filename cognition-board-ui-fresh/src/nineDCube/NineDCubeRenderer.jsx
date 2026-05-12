// 9D Hypercube Renderer Component
import React, { useEffect, useRef } from 'react';
import { NINE_D_VERTICES, NINE_D_EDGES } from './vertices.js';
import { project9Dto2D, getAnimatedRotation } from './projection.js';

const NODE_RADIUS = 3;
const HIGHLIGHT_RADIUS = 5;

const NineDCubeRenderer = ({ 
  highlightedVertices = [], 
  showEdges = true,
  animate = true 
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const rotationRef = useRef({ x: 0.3, y: 0.4, z: 0.1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const drawBackground = () => {
      ctx.fillStyle = '#050812';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawEdges = (projectedVertices) => {
      if (!showEdges) return;

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;

      NINE_D_EDGES.forEach(([i, j]) => {
        const v1 = projectedVertices[i];
        const v2 = projectedVertices[j];

        ctx.beginPath();
        ctx.moveTo(v1.x * canvas.width, v1.y * canvas.height);
        ctx.lineTo(v2.x * canvas.width, v2.y * canvas.height);
        ctx.stroke();
      });

      ctx.restore();
    };

    const drawVertices = (projectedVertices) => {
      // Sort by depth (draw far ones first)
      const sorted = projectedVertices
        .map((v, i) => ({ ...v, index: i }))
        .sort((a, b) => a.depth - b.depth);

      sorted.forEach(({ x, y, index }) => {
        const screenX = x * canvas.width;
        const screenY = y * canvas.height;
        
        const isHighlighted = highlightedVertices.includes(index);
        const radius = isHighlighted ? HIGHLIGHT_RADIUS : NODE_RADIUS;
        const alpha = isHighlighted ? 1 : 0.7;

        ctx.save();
        ctx.globalAlpha = alpha;
        
        if (isHighlighted) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#00D9FF';
        }

        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        ctx.fillStyle = isHighlighted ? '#00D9FF' : 'rgba(255, 255, 255, 0.8)';
        ctx.fill();

        if (isHighlighted) {
          ctx.strokeStyle = '#00D9FF';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.restore();
      });
    };

    const drawTitle = () => {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('9D Hypercube', 12, 24);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillText('512 vertices, 2304 edges', 12, 40);
      ctx.restore();
    };

    const startTime = performance.now();

    const animate_frame = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();

      // Update rotation if animation is enabled
      if (animate) {
        rotationRef.current = getAnimatedRotation(timestamp - startTime);
      }

      // Project all vertices
      const projectedVertices = NINE_D_VERTICES.map(vertex =>
        project9Dto2D(vertex, {
          rotation: rotationRef.current,
        })
      );

      drawEdges(projectedVertices);
      drawVertices(projectedVertices);
      drawTitle();

      rafRef.current = requestAnimationFrame(animate_frame);
    };

    rafRef.current = requestAnimationFrame(animate_frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, [highlightedVertices, showEdges, animate]);

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

export default NineDCubeRenderer;
