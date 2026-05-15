// 9D Hypercube Renderer Component
import React, { useEffect, useRef, useState } from 'react';
import { NINE_D_VERTICES, NINE_D_EDGES } from './vertices.js';
import { project9Dto2D, getAnimatedRotation } from './projection.js';
import { getVertexColor, hammingBloomIntensity, stellarBloom, depthHeat, applyBrightness } from '../cognition/colors9D.js';

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
  const [colorMode, setColorMode] = useState('dimension');
  const [coreTemp, setCoreTemp] = useState(1.0);

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

    const drawVertices = (projectedVertices, timestamp) => {
      // Sort by depth (draw far ones first)
      const sorted = projectedVertices
        .map((v, i) => ({ ...v, index: i }))
        .sort((a, b) => a.depth - b.depth);

      sorted.forEach(({ x, y, depth, index }) => {
        const screenX = x * canvas.width;
        const screenY = y * canvas.height;
        
        const isHighlighted = highlightedVertices.includes(index);
        const alpha = isHighlighted ? 1 : 0.7;

        // Calculate color properties for this vertex
        const vertex = NINE_D_VERTICES[index];
        const dimension = index % 9;
        const hammingLayer = vertex.filter(v => v !== 0).length; // Count non-zero dimensions
        
        // Normalize depth to [-1, 1] range (depth is typically around 3-5)
        const minDepth = 3;
        const maxDepth = 5;
        const zDepth = ((depth - minDepth) / (maxDepth - minDepth)) * 2 - 1;
        
        const energy = Math.sin(timestamp * 0.001 + index * 0.1) * 0.5 + 0.5;

        const color = getVertexColor({
          vertex,
          hammingLayer,
          dimension,
          zDepth,
          energy,
          mode: colorMode  // Use state-controlled mode
        });

        // Apply depth-heat modulation
        const heat = depthHeat(zDepth);
        const finalColor = applyBrightness(color, heat * coreTemp);

        // Bloom intensity for hot core effect
        const bloom = colorMode === 'stellar' 
          ? stellarBloom(hammingLayer) * coreTemp
          : hammingBloomIntensity(hammingLayer) * coreTemp;
        const bloomRadius = isHighlighted ? HIGHLIGHT_RADIUS * bloom * 1.5 : NODE_RADIUS + bloom * 6;
        const haloRadius = bloomRadius * 3.5;

        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Draw soft halo with stronger corona
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, haloRadius);
        gradient.addColorStop(0, finalColor);
        gradient.addColorStop(0.4, finalColor);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, haloRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw core vertex with bloom
        if (isHighlighted) {
          ctx.shadowBlur = 20 * bloom;
          ctx.shadowColor = finalColor;
        }

        ctx.beginPath();
        ctx.arc(screenX, screenY, bloomRadius, 0, Math.PI * 2);
        ctx.fillStyle = finalColor;
        ctx.fill();

        if (isHighlighted) {
          ctx.strokeStyle = color;
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
      drawVertices(projectedVertices, timestamp);
      drawTitle();

      rafRef.current = requestAnimationFrame(animate_frame);
    };

    rafRef.current = requestAnimationFrame(animate_frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, [highlightedVertices, showEdges, animate, colorMode, coreTemp]);

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
      
      {/* Core Temperature Control */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        background: 'rgba(5, 8, 18, 0.85)',
        backdropFilter: 'blur(10px)',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        minWidth: '200px',
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: '600',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Core Temperature: {coreTemp.toFixed(1)}
        </div>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={coreTemp}
          onChange={(e) => setCoreTemp(parseFloat(e.target.value))}
          style={{
            width: '100%',
            cursor: 'pointer',
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '9px',
          color: 'rgba(255,255,255,0.5)',
          marginTop: '4px',
        }}>
          <span>0.0</span>
          <span>2.0</span>
        </div>
      </div>
      
      {/* Color Mode Toggle */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        display: 'flex',
        gap: '6px',
        background: 'rgba(5, 8, 18, 0.85)',
        backdropFilter: 'blur(10px)',
        padding: '8px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        {['dimension', 'hamming', 'stellar', 'depth', 'energy', 'hybrid'].map(mode => (
          <button
            key={mode}
            onClick={() => setColorMode(mode)}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              background: colorMode === mode 
                ? 'linear-gradient(135deg, #00D9FF, #9D4EDD)' 
                : 'rgba(255,255,255,0.05)',
              color: colorMode === mode ? '#ffffff' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s ease',
              textTransform: 'capitalize',
            }}
            onMouseEnter={(e) => {
              if (colorMode !== mode) {
                e.target.style.background = 'rgba(255,255,255,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (colorMode !== mode) {
                e.target.style.background = 'rgba(255,255,255,0.05)';
              }
            }}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NineDCubeRenderer;
