// 9D Hypercube Renderer Component
import React, { useEffect, useRef, useState } from 'react';
import { NINE_D_VERTICES, NINE_D_EDGES } from './vertices.js';
import { project9Dto2D, getAnimatedRotation } from './projection.js';
import { getVertexColor, hammingBloomIntensity, stellarBloom, stellarPressure, rotationalShear, depthHeat, applyBrightness, coronaScale, DIMENSION_COLORS } from '../cognition/colors9D.js';

const NODE_RADIUS = 3;
const HIGHLIGHT_RADIUS = 5;

// Pulse-flare configuration (temperature-responsive)
const PULSE_SPEED_MIN = 0.008;
const PULSE_SPEED_MAX = 0.025;
const FLARE_INTENSITY_PEAK = 3.0;
const FLARE_BASE_WIDTH = 1.5;
const FLARE_MAX_WIDTH = 4;

/**
 * Get the dimension of an edge (which bit differs between vertices)
 * @param {number} v1Index - First vertex index
 * @param {number} v2Index - Second vertex index
 * @returns {number} Dimension (0-8)
 */
function getEdgeDimension(v1Index, v2Index) {
  const xor = v1Index ^ v2Index;
  // Find which bit is set (0-8)
  for (let bit = 0; bit < 9; bit++) {
    if ((xor >> bit) & 1) {
      return bit;
    }
  }
  return 0; // fallback
}

const NineDCubeRenderer = ({ 
  highlightedVertices = [], 
  showEdges = true,
  animate = true 
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const rotationRef = useRef({ x: 0.3, y: 0.4, z: 0.1 });
  const pulsesRef = useRef([]); // Pulse-flare system
  const [colorMode, setColorMode] = useState('dimension');
  const [coreTemp, setCoreTemp] = useState(1.0);
  const [showFlares, setShowFlares] = useState(true);

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

      NINE_D_EDGES.forEach(([i, j], edgeIndex) => {
        const v1 = projectedVertices[i];
        const v2 = projectedVertices[j];

        // Find pulse on this edge
        const pulse = showFlares ? pulsesRef.current.find(p => p.edgeIndex === edgeIndex) : null;

        if (pulse) {
          // Draw flare with dimension color
          const dimension = pulse.dimension;
          const flareColor = DIMENSION_COLORS[dimension];
          
          // Arc curvature (magnetic loop effect)
          const arc = Math.pow(Math.sin(pulse.t * Math.PI), 1.5);
          
          // Temperature-scaled flare intensity (hotter star → hotter flares)
          const flareHeat = 1 + coreTemp * 0.6;
          
          // Calculate intensity with arc curvature
          const baseIntensity = 1.0 + arc * (pulse.micro ? 2.5 : FLARE_INTENSITY_PEAK);
          const intensity = baseIntensity * flareHeat;
          
          // Draw enhanced trail (fading comet tail)
          const trailLength = pulse.micro ? 0.1 : 0.2;
          const trailStart = Math.max(0, pulse.t - trailLength);
          
          for (let i = 0; i < 8; i++) {
            const trailT = trailStart + (pulse.t - trailStart) * (i / 8);
            const trailFade = Math.max(0, 1 - pulse.t) * 0.6; // Fading tail effect
            const trailIntensity = intensity * (0.15 + 0.85 * (i / 8)) * (0.4 + trailFade);
            
            const trailX = v1.x + (v2.x - v1.x) * trailT;
            const trailY = v1.y + (v2.y - v1.y) * trailT;
            
            const nextT = trailStart + (pulse.t - trailStart) * ((i + 1) / 8);
            const nextX = v1.x + (v2.x - v1.x) * nextT;
            const nextY = v1.y + (v2.y - v1.y) * nextT;
            
            ctx.beginPath();
            ctx.moveTo(trailX * canvas.width, trailY * canvas.height);
            ctx.lineTo(nextX * canvas.width, nextY * canvas.height);
            ctx.strokeStyle = applyBrightness(flareColor, trailIntensity);
            ctx.lineWidth = FLARE_BASE_WIDTH + (trailIntensity * 0.3);
            ctx.stroke();
          }
          
          // Draw main flare pulse
          const pulseX = v1.x + (v2.x - v1.x) * pulse.t;
          const pulseY = v1.y + (v2.y - v1.y) * pulse.t;
          
          // Micro-flares are smaller but brighter
          const pulseSize = pulse.micro 
            ? FLARE_MAX_WIDTH * intensity * 0.3
            : FLARE_MAX_WIDTH * intensity * 0.5;
          
          ctx.beginPath();
          ctx.arc(pulseX * canvas.width, pulseY * canvas.height, pulseSize, 0, Math.PI * 2);
          ctx.fillStyle = applyBrightness(flareColor, intensity * 1.5);
          ctx.globalAlpha = pulse.micro ? 0.9 : 0.8;
          ctx.fill();
          ctx.globalAlpha = 1.0;
          
          // Draw edge with flare brightness
          ctx.strokeStyle = applyBrightness(flareColor, intensity * 0.8);
          ctx.lineWidth = pulse.micro ? 2 + intensity * 0.3 : FLARE_BASE_WIDTH + intensity * 0.5;
          ctx.beginPath();
          ctx.moveTo(v1.x * canvas.width, v1.y * canvas.height);
          ctx.lineTo(v2.x * canvas.width, v2.y * canvas.height);
          ctx.stroke();
          
        } else {
          // Draw normal edge (dim white)
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 1;
          
          ctx.beginPath();
          ctx.moveTo(v1.x * canvas.width, v1.y * canvas.height);
          ctx.lineTo(v2.x * canvas.width, v2.y * canvas.height);
          ctx.stroke();
        }
      });

      ctx.restore();
    };

    const drawVertices = (projectedVertices, timestamp, flareActivity = 0) => {
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

        // Apply combined thermal physics (Pressure + Temperature Fusion)
        const pressure = stellarPressure(hammingLayer);  // Core compression
        const heatZ = depthHeat(zDepth);  // Volumetric (closer = hotter)
        const heatLayer = colorMode === 'stellar' 
          ? stellarBloom(hammingLayer)  // Gaussian peak at center
          : hammingBloomIntensity(hammingLayer);  // Radial gradient
        const shear = rotationalShear(rotationRef.current.y, hammingLayer);  // Differential rotation
        
        // Fused thermal model: pressure × depth × radial × rotation × temperature
        const thermal = pressure * heatZ * heatLayer * shear * coreTemp;
        const finalColor = applyBrightness(color, thermal);

        // Bloom intensity (pressure-amplified core)
        const bloom = heatLayer * pressure * coreTemp;
        
        // Dynamic corona scaling (breathes with temperature and flare activity)
        const corona = coronaScale(coreTemp, flareActivity);
        const radius = isHighlighted ? HIGHLIGHT_RADIUS * bloom * 1.5 : NODE_RADIUS + bloom * 6;
        const haloRadius = radius * corona;

        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Draw soft halo with dynamic corona
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, haloRadius);
        gradient.addColorStop(0, finalColor);
        gradient.addColorStop(0.35, finalColor);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, haloRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw solid core vertex with bloom
        if (isHighlighted) {
          ctx.shadowBlur = 20 * bloom;
          ctx.shadowColor = finalColor;
        }

        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
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

      // Temperature-scaled flare activity (hotter star → more flares)
      if (showFlares) {
        // Main flare system: temperature-responsive frequency
        const flareChance = 0.001 + coreTemp * 0.002;
        
        if (Math.random() < flareChance) {
          const edgeIndex = Math.floor(Math.random() * NINE_D_EDGES.length);
          const [v1, v2] = NINE_D_EDGES[edgeIndex];
          const dimension = getEdgeDimension(v1, v2);
          const isMicro = Math.random() < 0.3;  // 30% chance of micro-flare
          
          pulsesRef.current.push({
            edgeIndex,
            t: 0,
            speed: isMicro 
              ? 0.03 + Math.random() * 0.05  // Fast micro-flares
              : PULSE_SPEED_MIN + Math.random() * (PULSE_SPEED_MAX - PULSE_SPEED_MIN),  // Normal flares
            dimension,
            micro: isMicro
          });
        }
      }

      // Update all pulses
      pulsesRef.current = pulsesRef.current
        .map(p => ({ ...p, t: p.t + p.speed }))
        .filter(p => p.t <= 1.0); // Remove completed pulses

      // Project all vertices
      const projectedVertices = NINE_D_VERTICES.map(vertex =>
        project9Dto2D(vertex, {
          rotation: rotationRef.current,
        })
      );

      // Calculate flare activity (0.0 - 1.0 based on active pulses)
      const maxPulses = 40;
      const flareActivity = Math.min(1, pulsesRef.current.length / maxPulses);

      drawEdges(projectedVertices);
      drawVertices(projectedVertices, timestamp, flareActivity);
      drawTitle();

      rafRef.current = requestAnimationFrame(animate_frame);
    };

    rafRef.current = requestAnimationFrame(animate_frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, [highlightedVertices, showEdges, animate, colorMode, coreTemp, showFlares]);

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
        
        {/* Solar Flares Toggle */}
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            <input
              type="checkbox"
              checked={showFlares}
              onChange={(e) => setShowFlares(e.target.checked)}
              style={{
                cursor: 'pointer',
                width: '16px',
                height: '16px',
              }}
            />
            Solar Flares
          </label>
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
