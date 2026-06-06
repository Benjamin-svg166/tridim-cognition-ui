// 9D Hypercube Renderer Component
import React, { useEffect, useRef, useState } from 'react';
import { NINE_D_VERTICES, NINE_D_EDGES } from './vertices.js';
import { project9Dto2D, getAnimatedRotation, projectToSphere, rotateOnY } from './projection.js';
import { getVertexColor, hammingBloomIntensity, stellarBloom, stellarPressure, rotationalShear, depthHeat, applyBrightness, coronaScale, DIMENSION_COLORS } from '../cognition/colors9D.js';
import { SupernovaEngine, SupernovaPhase } from './supernovaEngine.js';
import { applySupernovaEffects, whiteDwarfColor, getPhaseLabel } from './supernovaEffects.js';
import { granulationIntensity } from './granulation.js';
import { drawMagneticArcs } from './magneticArcs.js';
import { whiteDwarfCooling } from './coolingCurve.js';
import { starspotPenumbra, starspotLatitudeBias, starspotLifecycle, flareFromSpots, polarSpotBias, drawStarspots } from './starspots.js';
import { jetIntensity, magneticPressure, drawPolarJets, drawJetGlow, spawnJetParticles, updateJetParticles, drawAccretionDisk, relativisticBeaming, spawnJetKnots, updateJetKnots, updateJetTips, drawJetTips, machDiskStrength, updateMachDisks, drawMachDisks, updateReconnectionFlares, drawReconnectionFlares, jetPrecession } from './jets.js';

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
  const supernovaEngineRef = useRef(new SupernovaEngine()); // Stellar lifecycle
  const lastTimeRef = useRef(0); // Delta time tracking
  const tWhiteDwarfRef = useRef(0); // Time since white dwarf phase
  const coreTempRef = useRef(1.0); // Use ref to avoid useEffect restart
  const showFlaresRef = useRef(true); // Use ref to avoid useEffect restart
  const [colorMode, setColorMode] = useState('dimension');
  const [coreTemp, setCoreTemp] = useState(1.0);
  const [showFlares, setShowFlares] = useState(true);
  const [supernovaPhase, setSupernovaPhase] = useState(SupernovaPhase.Stable);

  // Sync state to refs whenever they change
  useEffect(() => {
    coreTempRef.current = coreTemp;
  }, [coreTemp]);

  useEffect(() => {
    showFlaresRef.current = showFlares;
  }, [showFlares]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      
      // Debug logging
      console.log('9D Canvas resize:', { width, height });
      
      // Ensure minimum size
      canvas.width = width > 0 ? width : 800;
      canvas.height = height > 0 ? height : 480;
    };

    // Initial resize with small delay to ensure layout is complete
    setTimeout(resize, 0);
    
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
        const pulse = showFlaresRef.current ? pulsesRef.current.find(p => p.edgeIndex === edgeIndex) : null;

        if (pulse) {
          // Draw flare with dimension color
          const dimension = pulse.dimension;
          const flareColor = DIMENSION_COLORS[dimension];
          
          // Arc curvature (magnetic loop effect)
          const arc = Math.pow(Math.sin(pulse.t * Math.PI), 1.5);
          
          // Temperature-scaled flare intensity (hotter star → hotter flares)
          const flareHeat = 1 + coreTempRef.current * 0.6;
          
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

    const drawUnifiedSphere = (projectedVertices, timestamp, flareActivity = 0, time = 0, frame = 0) => {
      const engine = supernovaEngineRef.current;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Calculate aggregate stellar properties from all vertices
      let totalBrightness = 0;
      let totalBloom = 0;
      let colorSamples = [];
      
      projectedVertices.forEach(({ x, y, depth, index }) => {
        const vertex = NINE_D_VERTICES[index];
        const dimension = index % 9;
        const hammingLayer = vertex.filter(v => v !== 0).length;
        
        const minDepth = 3;
        const maxDepth = 5;
        const rawZDepth = ((depth - minDepth) / (maxDepth - minDepth)) * 2 - 1;
        const zDepth = Math.max(-1, Math.min(1, rawZDepth));
        
        const energy = Math.sin(timestamp * 0.001 + index * 0.1) * 0.5 + 0.5;
        
        const color = getVertexColor({
          vertex,
          hammingLayer,
          dimension,
          zDepth,
          energy,
          mode: colorMode
        });
        
        if (!color || color.includes('NaN')) return;
        
        // Calculate physics for this vertex
        const pressure = stellarPressure(hammingLayer);
        const heatZ = depthHeat(zDepth);
        const heatLayer = colorMode === 'stellar' 
          ? stellarBloom(hammingLayer)
          : hammingBloomIntensity(hammingLayer);
        const shear = rotationalShear(rotationRef.current.y, hammingLayer);
        const thermal = pressure * heatZ * heatLayer * shear * coreTempRef.current;
        
        totalBrightness += thermal;
        totalBloom += heatLayer * pressure * coreTempRef.current;
        colorSamples.push({ color, weight: thermal });
      });
      
      // Average properties
      const avgBrightness = totalBrightness / projectedVertices.length;
      const avgBloom = totalBloom / projectedVertices.length;
      
      // Pick dominant color (weighted by thermal output)
      const totalWeight = colorSamples.reduce((sum, s) => sum + s.weight, 0);
      const dominantColor = colorSamples.length > 0 
        ? colorSamples.sort((a, b) => b.weight - a.weight)[0].color
        : '#ffffff';
      
      // Base sphere radius (scales with temperature and bloom)
      let baseRadius = 120 + avgBloom * 80;
      
      // Apply atmospheric breathing
      const corona = coronaScale(coreTempRef.current, flareActivity, 4.5, time);
      let sphereRadius = baseRadius * corona;
      
      // Apply supernova effects to sphere
      let base = {
        radius: sphereRadius,
        brightness: avgBrightness,
        saturation: 1,
        halo: corona,
        opacity: 1,
        flareActivity
      };
      
      base = applySupernovaEffects(engine, time, base);
      sphereRadius = base.radius;
      const brightness = base.brightness;
      const opacity = base.opacity;
      const haloMultiplier = base.halo;
      
      // Safety clamps
      sphereRadius = Math.max(10, Math.min(400, sphereRadius || 120));
      
      // White dwarf special rendering with cooling curve
      if (engine.phase === SupernovaPhase.WhiteDwarf) {
        const wdRadius = sphereRadius * 0.3;
        const cooling = whiteDwarfCooling(tWhiteDwarfRef.current);
        const wdColor = cooling.color;
        
        ctx.save();
        ctx.globalAlpha = opacity * cooling.brightnessFactor;
        
        // Compact halo
        const wdHalo = wdRadius * 2.2;
        const wdGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, wdHalo);
        wdGrad.addColorStop(0.0, wdColor.replace('1)', '0.9)'));
        wdGrad.addColorStop(0.5, wdColor.replace('1)', '0.4)'));
        wdGrad.addColorStop(1.0, wdColor.replace('1)', '0)'));
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, wdHalo, 0, Math.PI * 2);
        ctx.fillStyle = wdGrad;
        ctx.fill();
        
        // Dense core
        ctx.beginPath();
        ctx.arc(centerX, centerY, wdRadius, 0, Math.PI * 2);
        ctx.fillStyle = wdColor;
        ctx.shadowBlur = 30 * cooling.brightnessFactor;
        ctx.shadowColor = wdColor;
        ctx.fill();
        
        ctx.restore();
        return;
      }
      
      // Draw unified stellar sphere with granulation
      ctx.save();
      ctx.globalAlpha = opacity;
      
      // Outer atmospheric halo (corona)
      const coronaRadius = sphereRadius * haloMultiplier * 2.5;
      const coronaGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coronaRadius);
      const haloColor = applyBrightness(dominantColor, brightness * 0.6);
      
      coronaGrad.addColorStop(0.0, haloColor);
      coronaGrad.addColorStop(0.3, haloColor);
      coronaGrad.addColorStop(0.7, applyBrightness(dominantColor, brightness * 0.2));
      coronaGrad.addColorStop(1.0, 'rgba(0,0,0,0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, coronaRadius, 0, Math.PI * 2);
      ctx.fillStyle = coronaGrad;
      ctx.fill();
      
      // Inner photosphere with cinematic starspot physics stack
      const photosphereGrad = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, sphereRadius
      );
      
      // --- STARSPOT SHADING STACK (DRAMATIC MODE B) ---
      // Optional: adjust these to control drama vs visibility
      const PENUMBRA_STRENGTH = 0.25;
      const UMBRA_STRENGTH = 0.45;
      const LAT_STRENGTH = 0.2;
      const LIFE_STRENGTH = 0.25;
      const POLAR_STRENGTH = 0.35;
      
      // Surface normal at center (facing viewer)
      const nx = 0, ny = 0, nz = 1;
      
      // 1. Granulation (boiling convection)
      let finalBrightness = brightness * granulationIntensity(nx, ny, nz, time);
      
      // 2. Penumbra + Umbra (dark core + lighter ring)
      const { umbra, penumbra } = starspotPenumbra(nx, ny, nz, time, flareActivity);
      finalBrightness *= 1 - (penumbra * PENUMBRA_STRENGTH + umbra * UMBRA_STRENGTH);
      
      // 3. Latitude clustering (magnetic belts)
      const latBias = starspotLatitudeBias(ny);
      finalBrightness *= 1 - latBias * LAT_STRENGTH;
      
      // 4. Lifecycle modulation (growth + decay)
      const life = starspotLifecycle(time);
      finalBrightness *= 1 - life * LIFE_STRENGTH;
      
      // 5. Polar spot bias (dramatic polar caps)
      const polar = polarSpotBias(ny);
      finalBrightness *= 1 - polar * POLAR_STRENGTH;
      
      // ⭐ Critical: clamp minimum brightness to prevent blackout
      finalBrightness = Math.max(finalBrightness, 0.15);
      
      // Calculate spot intensity for magnetic arc interaction
      const spotIntensity = (penumbra * PENUMBRA_STRENGTH + umbra * UMBRA_STRENGTH) + latBias * LAT_STRENGTH + polar * POLAR_STRENGTH;
      
      const coreColor = applyBrightness(dominantColor, finalBrightness * 1.8);
      const surfaceColor = applyBrightness(dominantColor, finalBrightness * 1.2);
      
      photosphereGrad.addColorStop(0.0, coreColor);
      photosphereGrad.addColorStop(0.6, surfaceColor);
      photosphereGrad.addColorStop(0.85, applyBrightness(dominantColor, finalBrightness * 0.8));
      photosphereGrad.addColorStop(1.0, applyBrightness(dominantColor, finalBrightness * 0.4));
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius, 0, Math.PI * 2);
      ctx.fillStyle = photosphereGrad;
      ctx.shadowBlur = 50 * finalBrightness;
      ctx.shadowColor = coreColor;
      ctx.fill();
      
      ctx.restore();
      
      // Draw starspots (dark magnetic regions)
      drawStarspots(ctx, centerX, centerY, sphereRadius, time, flareActivity);
      
      // Draw magnetic field arcs (brighten near starspot regions)
      drawMagneticArcs(ctx, centerX, centerY, sphereRadius * 1.05, flareActivity, time, spotIntensity);
      
      // Return sphere data for particle occlusion calculations
      const sphereData = { radius: sphereRadius };
      
      // Draw polar jets with accretion disk (disabled during white dwarf phase)
      if (engine.phase !== SupernovaPhase.WhiteDwarf) {
        let jets = jetIntensity(engine.phase, flareActivity, coreTempRef.current);
        
        // Draw accretion disk (protostellar engine) and get warp offset
        const diskWarp = drawAccretionDisk(ctx, centerX, centerY, sphereRadius, jets, time);
        
        // Disk → Jet coupling (disk strengthens jets)
        const diskBoost = jets * 0.5;
        jets = Math.min(1, jets + diskBoost);
        
        // Calculate relativistic beaming with disk-influenced precession
        const prec = jetPrecession(time, jets, diskWarp);
        const tiltX = prec.x;
        const tiltY = prec.y;
        const beamBoost = relativisticBeaming(tiltX, tiltY);
        const beamedIntensity = Math.min(1, jets * beamBoost);
        
        // Draw jet glow and beams with precession + relativistic beaming + magnetic collimation
        drawJetGlow(ctx, centerX, centerY, sphereRadius, beamedIntensity);
        drawPolarJets(ctx, centerX, centerY, sphereRadius, beamedIntensity, time, coreTempRef.current);
        
        // Spawn jet particles with temperature-tinted plasma
        spawnJetParticles(centerX, centerY, sphereRadius, jets, coreTempRef.current, time);
        
        // Spawn shock knots (bright pulses) with magnetic collimation
        spawnJetKnots(centerX, centerY, sphereRadius, jets, time, coreTempRef.current);
        
        // Store jet intensity and disk warp for particle updates
        sphereData.jets = jets;
        sphereData.diskWarp = diskWarp;
      }
      
      return sphereData;
    };

    const drawVertices = (projectedVertices, timestamp, flareActivity = 0, time = 0, frame = 0) => {
      // Sort by depth (draw far ones first)
      const sorted = projectedVertices
        .map((v, i) => ({ ...v, index: i }))
        .sort((a, b) => a.depth - b.depth);

      const engine = supernovaEngineRef.current;
      let drawnCount = 0;
      let skippedCount = 0;

      sorted.forEach(({ x, y, depth, index }) => {
        const screenX = x * canvas.width;
        const screenY = y * canvas.height;
        
        const isHighlighted = highlightedVertices.includes(index);
        let alpha = isHighlighted ? 1 : 0.7;

        // Calculate color properties for this vertex
        const vertex = NINE_D_VERTICES[index];
        const dimension = index % 9;
        const hammingLayer = vertex.filter(v => v !== 0).length; // Count non-zero dimensions
        
        // Normalize depth to [-1, 1] range (depth is typically around 3-5)
        const minDepth = 3;
        const maxDepth = 5;
        const rawZDepth = ((depth - minDepth) / (maxDepth - minDepth)) * 2 - 1;
        const zDepth = Math.max(-1, Math.min(1, rawZDepth)); // Clamp to valid range
        
        if (isNaN(depth) || isNaN(zDepth)) {
          console.warn('Invalid depth:', { index, depth, zDepth });
          skippedCount++;
          return;
        }
        
        const energy = Math.sin(timestamp * 0.001 + index * 0.1) * 0.5 + 0.5;

        const color = getVertexColor({
          vertex,
          hammingLayer,
          dimension,
          zDepth,
          energy,
          mode: colorMode  // Use state-controlled mode
        });
        
        // Validate base color IMMEDIATELY
        if (!color || color.includes('NaN') || color.includes('undefined')) {
          console.warn('Invalid base color from getVertexColor:', { 
            index, 
            color, 
            hammingLayer, 
            dimension, 
            zDepth, 
            energy, 
            mode: colorMode 
          });
          // Use a safe fallback color
          const fallbackColor = DIMENSION_COLORS[dimension % DIMENSION_COLORS.length];
          skippedCount++;
          // Continue with fallback instead of returning
          const screenX = x * canvas.width;
          const screenY = y * canvas.height;
          ctx.save();
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.arc(screenX, screenY, 3, 0, Math.PI * 2);
          ctx.fillStyle = fallbackColor;
          ctx.fill();
          ctx.restore();
          return;
        }

        // Apply combined thermal physics (Pressure + Temperature Fusion)
        const pressure = stellarPressure(hammingLayer);  // Core compression
        const heatZ = depthHeat(zDepth);  // Volumetric (closer = hotter)
        const heatLayer = colorMode === 'stellar' 
          ? stellarBloom(hammingLayer)  // Gaussian peak at center
          : hammingBloomIntensity(hammingLayer);  // Radial gradient
        const shear = rotationalShear(rotationRef.current.y, hammingLayer);  // Differential rotation
        
        // Validate physics calculations
        if (isNaN(pressure) || isNaN(heatZ) || isNaN(heatLayer) || isNaN(shear)) {
          console.warn('NaN in physics:', { index, pressure, heatZ, heatLayer, shear });
          skippedCount++;
          return;
        }
        
        // Fused thermal model: pressure × depth × radial × rotation × temperature
        const thermal = pressure * heatZ * heatLayer * shear * coreTempRef.current;
        let finalColor = applyBrightness(color, thermal);
        
        // Validate color string doesn't contain NaN
        if (finalColor.includes('NaN')) {
          console.warn('NaN in color calculation:', { 
            index, 
            pressure, 
            heatZ, 
            heatLayer, 
            shear, 
            thermal,
            coreTemp: coreTempRef.current,
            baseColor: color 
          });
          finalColor = color; // Use base color as fallback
        }

        // Bloom intensity (pressure-amplified core)
        const bloom = heatLayer * pressure * coreTempRef.current;
        
        // Dynamic corona scaling (atmospheric layering with breathing)
        const corona = coronaScale(coreTempRef.current, flareActivity, hammingLayer, time);
        let radius = isHighlighted ? HIGHLIGHT_RADIUS * bloom * 1.5 : NODE_RADIUS + bloom * 6;
        let haloRadius = radius * corona;

        // Apply supernova effects
        let base = {
          radius,
          brightness: 1,
          saturation: 1,
          halo: corona,
          opacity: 1,
          flareActivity
        };

        base = applySupernovaEffects(engine, time, base);
        radius = base.radius;
        haloRadius = radius * base.halo;
        alpha *= base.opacity;
        finalColor = applyBrightness(finalColor, base.brightness);
        
        // Validate color after supernova effects
        if (finalColor.includes('NaN')) {
          console.warn('NaN after supernova effects:', { index, brightness: base.brightness });
          finalColor = color; // Use base color as fallback
        }

        // Safeguards: prevent zero/NaN values
        radius = Math.max(0.8, Math.min(200, radius || 1));
        haloRadius = Math.max(2, Math.min(2000, haloRadius || 5));
        alpha = Math.max(0, Math.min(1, alpha || 0.7));
        
        if (isNaN(radius) || isNaN(haloRadius) || isNaN(alpha)) {
          console.warn('NaN detected in vertex render:', { radius, haloRadius, alpha, index });
          skippedCount++;
          return; // Skip this vertex
        }

        // White dwarf special rendering
        if (engine.phase === SupernovaPhase.WhiteDwarf) {
          const wdColor = whiteDwarfColor();
          const wdRadius = radius;

          ctx.save();
          ctx.globalAlpha = alpha;

          // Core
          ctx.beginPath();
          ctx.arc(screenX, screenY, wdRadius, 0, Math.PI * 2);
          ctx.fillStyle = wdColor;
          ctx.fill();

          // Compact halo
          const wdHalo = wdRadius * 2.2;
          const wdGrad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, wdHalo);
          wdGrad.addColorStop(0.0, "rgba(230,240,255,0.9)");
          wdGrad.addColorStop(1.0, "rgba(230,240,255,0)");

          ctx.beginPath();
          ctx.arc(screenX, screenY, wdHalo, 0, Math.PI * 2);
          ctx.fillStyle = wdGrad;
          ctx.fill();

          ctx.restore();
          return;
        }

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
        drawnCount++;
      });
      
      // Debug log on first 3 frames
      if (frame <= 3) {
        console.log(`📊 Drew ${drawnCount} vertices, skipped ${skippedCount}`);
      }
    };

    const drawTitle = () => {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('9D Hypercube', 12, 24);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillText(`512 vertices, 2304 edges | Canvas: ${canvas.width}×${canvas.height}`, 12, 40);
      ctx.restore();
    };

    const startTime = performance.now();
    lastTimeRef.current = startTime * 0.001;
    let frameCount = 0;

    const animate_frame = (timestamp) => {
      try {
        frameCount++;
        
        // Debug: First 3 frames to verify progression
        if (frameCount <= 3) {
          console.log(`🎬 Frame ${frameCount}`, { timestamp, canvas: `${canvas.width}×${canvas.height}`, vertices: NINE_D_VERTICES.length });
        }
        
        // Debug log every 60 frames
        if (frameCount % 60 === 0) {
        const jets = supernovaEngineRef.current.phase !== SupernovaPhase.WhiteDwarf 
          ? jetIntensity(supernovaEngineRef.current.phase, Math.min(1, pulsesRef.current.length / 40), coreTempRef.current)
          : 0;
        console.log('🌟 9D Cube Status:', {
          frame: frameCount,
          canvasSize: `${canvas.width}×${canvas.height}`,
          containerSize: `${container.offsetWidth}×${container.offsetHeight}`,
          vertices: NINE_D_VERTICES.length,
          pulses: pulsesRef.current.length,
          phase: supernovaEngineRef.current.phase,
          coreTemp: coreTempRef.current.toFixed(1),
          jetIntensity: jets.toFixed(2),
        });
      }
      
      // Ensure canvas has valid dimensions
      if (canvas.width === 0 || canvas.height === 0) {
        console.error('❌ Canvas collapsed to 0! Container:', container.offsetWidth, 'x', container.offsetHeight);
        resize(); // Force resize
        return; // Skip this frame
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();

      // Update rotation if animation is enabled
      if (animate) {
        rotationRef.current = getAnimatedRotation(timestamp - startTime);
      }

      // Supernova lifecycle update
      const now = timestamp * 0.001;
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      const engine = supernovaEngineRef.current;
      engine.update(dt, coreTempRef.current);
      setSupernovaPhase(engine.phase);

      // Track white dwarf cooling time
      if (engine.phase === SupernovaPhase.WhiteDwarf) {
        tWhiteDwarfRef.current += dt;
      } else {
        tWhiteDwarfRef.current = 0;
      }

      // Automatic trigger at extreme temperature
      if (coreTempRef.current >= 2.0 && engine.phase === SupernovaPhase.Stable) {
        console.log('🔥 AUTO-TRIGGER: Temp =', coreTempRef.current, 'Phase =', engine.phase);
        engine.trigger();
      }
      
      // Debug: Log actual core temp every 300 frames
      if (frameCount % 300 === 0) {
        console.log('🌡️ Core Temp Check:', { 
          coreTempRef: coreTempRef.current.toFixed(2), 
          enginePhase: engine.phase,
          shouldTrigger: (coreTempRef.current >= 2.0 && engine.phase === SupernovaPhase.Stable)
        });
      }

      // Temperature-scaled flare activity (hotter star → more flares)
      if (showFlaresRef.current) {
        // Main flare system: temperature-responsive frequency
        const flareChance = 0.001 + coreTempRef.current * 0.002;
        
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

      // Project all vertices (preserve index for lookup)
      const projectedVertices = NINE_D_VERTICES.map((vertex, index) =>
        ({
          ...project9Dto2D(vertex, {
            rotation: rotationRef.current,
          }),
          index
        })
      );

      // Time in seconds for oscillation modes
      const time = timestamp * 0.001;

      // Calculate flare activity (0.0 - 1.0 based on active pulses)
      const maxPulses = 40;
      let flareActivity = Math.min(1, pulsesRef.current.length / maxPulses);
      flareActivity = Math.max(0, Math.min(1, flareActivity || 0)); // Clamp and ensure valid
      
      // 6. Spot-driven flare boost (magnetic reconnection)
      const nx = 0, ny = 0, nz = 1;
      const { umbra, penumbra } = starspotPenumbra(nx, ny, nz, time, flareActivity);
      flareActivity = flareFromSpots(umbra, penumbra, flareActivity);

      // Draw unified spherical star
      const sphereData = drawUnifiedSphere(projectedVertices, timestamp, flareActivity, time, frameCount);
      
      // Update jet particles (must be after sphere rendering)
      const jets = engine.phase !== SupernovaPhase.WhiteDwarf 
        ? jetIntensity(engine.phase, flareActivity, coreTempRef.current)
        : 0;
      const centerY = canvas.height / 2;
      const sphereRadius = sphereData?.radius || 120;
      
      // Shadow strength: brighter jets → deeper disk shadows
      const shadowStrength = 0.5 + jets * 0.5;
      
      // Debug jets every 300 frames
      if (frameCount % 300 === 0 && jets > 0) {
        console.log('🚀 Jets Active:', { jets: jets.toFixed(2), phase: engine.phase, radius: sphereRadius.toFixed(0) });
      }
      
      updateJetParticles(ctx, dt, time, jets, centerY, sphereRadius, shadowStrength);
      
      // Update shock knots (bright pulses in jets)
      updateJetKnots(ctx, dt, centerY, sphereRadius, shadowStrength);
      
      // Update and draw jet tips (bright spots racing down the jets)
      if (jets > 0) {
        const pressure = magneticPressure(jets, coreTempRef.current);
        const baseLength = sphereRadius * 4;
        const jetLength = baseLength * (1 + pressure * 0.4);
        const centerX = canvas.width / 2;
        
        updateJetTips(dt, jets, pressure, centerX, centerY, sphereRadius, jetLength, time);
        drawJetTips(ctx, centerX, centerY, sphereRadius, jetLength, pressure, time, jets);
        
        // Update and draw Mach disks (over-pressured shock surfaces)
        updateMachDisks(dt, centerX, centerY, sphereRadius, jetLength, jets, pressure, time);
        drawMachDisks(ctx, centerX, centerY, sphereRadius, jetLength, jets, pressure, time);
        
        // Update and draw magnetic reconnection flares (sudden starbursts along spine)
        updateReconnectionFlares(dt, centerX, centerY, sphereRadius, jetLength, jets, pressure, time);
        drawReconnectionFlares(ctx);
      }
      
      // Optional: Draw edges with spherical projection (subtle, for structure)
      if (showEdges) {
        ctx.save();
        ctx.globalAlpha = 0.08;
        drawEdges(projectedVertices);
        ctx.restore();
      }
      
      drawTitle();

      rafRef.current = requestAnimationFrame(animate_frame);
    } catch (error) {
      console.error('❌ Animation frame error:', error);
      console.error('Error stack:', error.stack);
      // Don't schedule next frame on error
    }
    };

    rafRef.current = requestAnimationFrame(animate_frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, [highlightedVertices, showEdges, animate, colorMode]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '480px',
        minHeight: '480px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#050812',
        border: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      
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

        {/* Supernova Controls */}
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Phase: {getPhaseLabel(supernovaPhase)}
          </div>
          <button
            onClick={() => supernovaEngineRef.current.trigger()}
            disabled={supernovaPhase !== SupernovaPhase.Stable && supernovaPhase !== SupernovaPhase.Overheat}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '11px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '6px',
              cursor: (supernovaPhase === SupernovaPhase.Stable || supernovaPhase === SupernovaPhase.Overheat) ? 'pointer' : 'not-allowed',
              background: (supernovaPhase === SupernovaPhase.Stable || supernovaPhase === SupernovaPhase.Overheat)
                ? 'linear-gradient(135deg, #FF3B30, #FF9500)' 
                : 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              transition: 'all 0.2s ease',
              marginBottom: '6px',
              opacity: (supernovaPhase === SupernovaPhase.Stable || supernovaPhase === SupernovaPhase.Overheat) ? 1 : 0.5,
            }}
          >
            Trigger Supernova
          </button>
          <button
            onClick={() => {
              supernovaEngineRef.current.phase = SupernovaPhase.Stable;
              supernovaEngineRef.current.instability = 0;
              supernovaEngineRef.current.tPhase = 0;
              setSupernovaPhase(SupernovaPhase.Stable);
            }}
            style={{
              width: '100%',
              padding: '6px 12px',
              fontSize: '10px',
              fontWeight: '600',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              cursor: 'pointer',
              background: 'transparent',
              color: 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            Reset to Stable
          </button>
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
