// Polar Jets: Collimated Magnetic Beams
// Appear during high-energy phases (overheat, collapse, flash)

// Particle system for jet streams
const jetParticles = [];

// Shock knots (bright pulses in jets)
const jetKnots = [];

// Jet tips (bright spots racing down the jet showing propagation)
const jetTips = [
  { dir: -1, t: 0, speed: 1, life: 1 }, // top jet (dir -1 = upward)
  { dir: 1, t: 0, speed: 1, life: 1 },  // bottom jet (dir 1 = downward)
];

// Shock compression particles (compressed plasma ahead of jet tips)
let shockParticles = [];

// Mach disk turbulence particles (chaotic plasma around shock surfaces)
let machTurbulence = [];

// Turbulence cones (downstream chaos from Mach disks)
let turbulenceCones = [];

// Reconnection flares (sudden magnetic field starbursts along spine)
let reconnectionFlares = [];

// Mixing layer particles (boundary turbulence between spine and sheath)
let mixingParticles = [];

// Ambient medium particles (external environment around jets)
let ambientParticles = [];

// ⭐ OBSERVATION MODES (4 physically-motivated modes)
// Multi-wavelength observation modes for selective band rendering
const OBSERVATION_MODES = {
  radio: {
    radio: 1.4,    // Boost radio for clarity
    optical: 0.0,  // Suppress optical
    xray: 0.0      // Suppress X-ray
  },
  optical: {
    radio: 0.0,    // Suppress radio
    optical: 1.2,  // Boost optical
    xray: 0.0      // Suppress X-ray
  },
  xray: {
    radio: 0.0,    // Suppress radio
    optical: 0.0,  // Suppress optical
    xray: 2.0      // Boost X-ray (faint, needs amplification)
  },
  composite: {
    radio: 1.0,    // Full radio
    optical: 1.0,  // Full optical
    xray: 1.0      // Full X-ray
  }
};

// Current observation mode (default: composite - all bands visible)
let observationMode = 'composite';

/**
 * Set the current observation mode
 * @param {string} mode - One of: 'radio', 'optical', 'xray', 'composite'
 */
export function setObservationMode(mode) {
  if (OBSERVATION_MODES[mode]) {
    observationMode = mode;
  } else {
    console.warn(`Invalid observation mode: ${mode}. Using 'composite'.`);
    observationMode = 'composite';
  }
}

/**
 * Get the current observation mode
 * @returns {string} Current mode name
 */
export function getObservationMode() {
  return observationMode;
}

/**
 * Calculate disk shadow factor for occlusion
 * @param {number} y - Y coordinate of particle/knot
 * @param {number} diskYTop - Top edge of disk band
 * @param {number} diskYBottom - Bottom edge of disk band
 * @param {number} shadowStrength - Shadow intensity multiplier (0.5-1.0)
 * @returns {number} Visibility factor (0.0-1.0)
 */
function diskShadowFactor(y, diskYTop, diskYBottom, shadowStrength = 1.0) {
  if (y < diskYTop || y > diskYBottom) return 1; // fully visible

  // inside the band → fade based on depth into disk
  const mid = (diskYTop + diskYBottom) / 2;
  const dist = Math.abs(y - mid);
  const maxDist = (diskYBottom - diskYTop) / 2;

  // 0 at center, 1 at edges
  const edgeFactor = dist / maxDist;

  // keep some visibility, but strongly dim in the middle
  const baseShadow = 0.2 + 0.8 * edgeFactor;
  
  // Apply shadow strength: brighter jets → deeper shadows (disk thickens)
  return baseShadow * shadowStrength + (1 - shadowStrength);
}

/**
 * Calculate magnetic pressure for jet collimation
 * @param {number} jets - Jet intensity (0.0-1.0)
 * @param {number} coreTemperature - Core temperature (0.0-2.0)
 * @returns {number} Magnetic pressure (0.0-1.0) - higher = tighter jets
 */
export function magneticPressure(jets, coreTemperature) {
  return Math.min(1, jets * 0.6 + coreTemperature * 0.4);
}

/**
 * Calculate shock compression strength for jet tips
 * @param {number} tipSpeed - Speed of jet tip (0.4-1.2)
 * @param {number} jets - Jet intensity (0.0-1.0)
 * @param {number} pressure - Magnetic pressure (0.0-1.0)
 * @returns {number} Compression factor (0.0-1.0)
 */
export function shockCompression(tipSpeed, jets, pressure) {
  return Math.min(1, tipSpeed * 0.5 + jets * 0.3 + pressure * 0.4);
}

/**
 * Synchrotron color mapping (energy → RGB color)
 * High-energy electrons radiate blue/white near source, cooling to yellow/orange downstream
 * @param {number} energy - Energy level (0.0-1.0, where 1.0 = maximum energy)
 * @returns {string} RGB values as comma-separated string (for use in rgba())
 */
function synchrotronColor(energy) {
  if (energy > 0.7) {
    // High energy: blue-white (hot synchrotron emission)
    const t = (energy - 0.7) / 0.3;  // 0-1 range within high energy regime
    const r = 255;
    const g = Math.floor(255 - t * 80);  // 175-255 (bluer at higher energy)
    const b = 255;
    return `${r},${g},${b}`;
  }
  if (energy > 0.3) {
    // Medium energy: pure white
    return '255,255,255';
  }
  // Low energy: warm yellow/orange (cooled synchrotron)
  const t = energy / 0.3;  // 0-1 range within low energy regime
  const r = 255;
  const g = Math.floor(200 + t * 55);  // 200-255
  const b = Math.floor(80 + t * 175);  // 80-255
  return `${r},${g},${b}`;
}

/**
 * Multi-band emission functions
 * Derive radio, optical, and X-ray emissivities from particle energy
 * Each band has different cooling rates and beaming response
 */

/**
 * Radio emission weight - strong at low-mid energy, long-lived
 * @param {number} energy - Energy level (0.0-1.0)
 * @returns {number} Radio emission weight (0.0-1.0)
 */
function radioEmission(energy) {
  // Strong at low–mid energy, fades at very high
  // Peak around 0.3–0.6
  const t = Math.max(0, Math.min(1, (energy - 0.1) / 0.5));  // 0.1–0.6
  return t * (1 - Math.max(0, energy - 0.7) * 1.5);          // suppress >0.7
}

/**
 * Optical emission weight - strong at mid energy
 * @param {number} energy - Energy level (0.0-1.0)
 * @returns {number} Optical emission weight (0.0-1.0)
 */
function opticalEmission(energy) {
  // Strong at mid energy, fades at extremes
  const t = Math.max(0, Math.min(1, (energy - 0.25) / 0.4)); // 0.25–0.65
  return t * (1 - Math.abs(energy - 0.5) * 1.4);
}

/**
 * X-ray emission weight - only at very high energy, short-lived
 * @param {number} energy - Energy level (0.0-1.0)
 * @returns {number} X-ray emission weight (0.0-1.0)
 */
function xrayEmission(energy) {
  // Only at very high energy, dies quickly
  if (energy < 0.6) return 0;
  const t = (energy - 0.6) / 0.4;  // 0–1 for energy 0.6–1.0
  return t * t;  // Quadratic rise
}

/**
 * Radio band color (violet-ish, low-energy radio visualization)
 * @returns {string} RGB values as comma-separated string
 */
function radioColor() {
  return '180, 120, 255';   // violet-ish
}

/**
 * Optical band color (reuses synchrotron color mapping)
 * @param {number} energy - Energy level (0.0-1.0)
 * @returns {string} RGB values as comma-separated string
 */
function opticalColor(energy) {
  return synchrotronColor(energy);
}

/**
 * X-ray band color (cyan/blue-white for high-energy emission)
 * @returns {string} RGB values as comma-separated string
 */
function xrayColor() {
  return '180, 255, 255';   // cyan/blue-white
}

/**
 * Calculate Kelvin-Helmholtz shear ripple offset
 * KH instability creates wave-like distortions along jet edges due to velocity shear
 * @param {number} dNorm - Normalized distance along jet (0.0-1.0)
 * @param {number} time - Animation time in seconds
 * @param {number} jets - Jet intensity (0.0-1.0)
 * @param {number} pressure - Magnetic pressure (0.0-1.0)
 * @returns {number} Ripple offset in pixels (perpendicular to jet direction)
 */
function kelvinHelmholtzRipple(dNorm, time, jets, pressure) {
  // KH instability strength increases with jet velocity and magnetic pressure
  const shearAmp = 3 + pressure * 6;      // 3-9px ripple amplitude
  const shearFreq = 8 + jets * 6;         // 8-14 waves along jet
  const shearSpeed = 4 + pressure * 3;    // 4-7 rad/s temporal oscillation

  // Sinusoidal wave with temporal animation
  // Damped downstream: KH is strongest near the base
  const dampFactor = 1 - dNorm * 0.6;     // 1.0 at base → 0.4 at far end
  
  return Math.sin(dNorm * shearFreq * Math.PI * 2 + time * shearSpeed) 
         * shearAmp 
         * dampFactor;
}

/**
 * Calculate jet intensity based on stellar phase and activity
 * @param {string} phase - Current supernova phase
 * @param {number} flareActivity - Flare activity level (0.0-1.0)
 * @param {number} coreTemperature - Core temperature (0.0-2.0)
 * @returns {number} Jet intensity 0-1
 */
export function jetIntensity(phase, flareActivity, coreTemperature) {
  let base = 0;

  if (phase === "overheat") base = 0.4;
  if (phase === "collapse") base = 0.7;
  if (phase === "flash") base = 1.0;
  if (phase === "shockwave") base = 0.6;
  if (phase === "stable") base = 0.15;

  const tempBoost = Math.max(0, (coreTemperature - 1.0) * 0.5);
  const flareBoost = flareActivity * 0.8;

  return Math.min(1, base + tempBoost + flareBoost);
}

/**
 * Draw polar jets (top and bottom beams along Y axis)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} radius - Sphere radius
 * @param {number} intensity - Jet intensity (0.0-1.0)
 * @param {number} time - Animation time in seconds
 * @param {number} coreTemperature - Core temperature for magnetic pressure calculation
 */
export function drawPolarJets(ctx, cx, cy, radius, intensity, time, coreTemperature = 1.0) {
  // Apply magnetic collimation
  const pressure = magneticPressure(intensity, coreTemperature);
  
  // Collimated width: high pressure → needle-thin beams
  const baseWidth = radius * 0.22;
  const width = baseWidth * (1 - pressure * 0.6);
  
  // Collimated length: high pressure → longer, more focused jets
  const baseLength = radius * 4;
  const length = baseLength * (1 + pressure * 0.4);

  const pulse = 0.6 + Math.sin(time * 4) * 0.4;
  const alpha = 0.25 + intensity * 0.5;

  // Kelvin-Helmholtz shear modulation on beam width (subtle breathing effect)
  // Sample at mid-jet (dNorm=0.5) for consistent modulation
  const khMidRipple = kelvinHelmholtzRipple(0.5, time, intensity, pressure);
  const khWidthMod = 1 + (khMidRipple / width) * 0.15; // ±15% width modulation

  // Apply jet precession (wobble)
  const prec = jetPrecession(time, intensity);
  const topOffsetX = prec.x * radius;
  const topOffsetY = prec.y * radius;
  const botOffsetX = -prec.x * radius;
  const botOffsetY = -prec.y * radius;

  // Apply magnetic corkscrew helix
  const helix = jetHelix(time, intensity);
  const topX = cx + topOffsetX + helix.hx * radius;
  const topY = cy - length / 2 + topOffsetY + helix.hy * radius;
  const botX = cx + botOffsetX - helix.hx * radius;
  const botY = cy + length / 2 + botOffsetY - helix.hy * radius;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // Spine-sheath structure: two-layer flow
  const spineRadius = width * 0.45;   // Fast, bright inner core (45% of width)
  const sheathRadius = width;          // Slower, diffuse outer envelope (100% of width)
  
  // Relativistic beaming: jets brighten when pointing toward observer
  const topBeaming = relativisticBeaming(-1, prec.x, prec.y);
  const botBeaming = relativisticBeaming(1, prec.x, prec.y);
  
  const baseSpineAlpha = alpha * 1.5;      // Base spine brightness (1.5x)
  const baseSheathAlpha = alpha * 0.5;     // Base sheath brightness (0.5x)
  
  // Apply beaming boosts (spine responds more than sheath)
  const topSpineAlpha = baseSpineAlpha * topBeaming.spineBoost;
  const topSheathAlpha = baseSheathAlpha * topBeaming.sheathBoost;
  const botSpineAlpha = baseSpineAlpha * botBeaming.spineBoost;
  const botSheathAlpha = baseSheathAlpha * botBeaming.sheathBoost;

  // --- TOP JET ---
  // Synchrotron gradient: blue-white at base → white → orange at far end
  const baseEnergy = 1.0;  // Maximum energy near star
  const farEnergy = 0.3;   // Cooled energy at jet end
  const midEnergy = 0.65;  // Medium energy at mid-jet

  // SHEATH (outer envelope) - draw first (behind spine)
  const gradTopSheath = ctx.createLinearGradient(
    topX, 
    cy - radius + topOffsetY, 
    topX, 
    cy - length + topOffsetY
  );
  gradTopSheath.addColorStop(0, `rgba(${synchrotronColor(baseEnergy)},${topSheathAlpha})`);
  gradTopSheath.addColorStop(0.5, `rgba(${synchrotronColor(midEnergy)},${topSheathAlpha * 0.8})`);
  gradTopSheath.addColorStop(1, `rgba(${synchrotronColor(farEnergy)},0)`);

  ctx.fillStyle = gradTopSheath;
  ctx.beginPath();
  ctx.ellipse(
    topX, 
    topY, 
    sheathRadius * pulse * khWidthMod,  // Full width with modulation
    length / 2, 
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // SPINE (inner core) - draw on top
  const gradTopSpine = ctx.createLinearGradient(
    topX, 
    cy - radius + topOffsetY, 
    topX, 
    cy - length + topOffsetY
  );
  gradTopSpine.addColorStop(0, `rgba(${synchrotronColor(baseEnergy)},${topSpineAlpha})`);
  gradTopSpine.addColorStop(0.5, `rgba(${synchrotronColor(midEnergy)},${topSpineAlpha * 0.8})`);
  gradTopSpine.addColorStop(1, `rgba(${synchrotronColor(farEnergy)},0)`);

  ctx.fillStyle = gradTopSpine;
  ctx.beginPath();
  ctx.ellipse(
    topX, 
    topY, 
    spineRadius * pulse * khWidthMod * 0.95,  // Spine slightly less affected by KH
    length / 2, 
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // --- BOTTOM JET ---
  // SHEATH (outer envelope)
  const gradBotSheath = ctx.createLinearGradient(
    botX, 
    cy + radius + botOffsetY, 
    botX, 
    cy + length + botOffsetY
  );
  gradBotSheath.addColorStop(0, `rgba(${synchrotronColor(baseEnergy)},${botSheathAlpha})`);
  gradBotSheath.addColorStop(0.5, `rgba(${synchrotronColor(midEnergy)},${botSheathAlpha * 0.8})`);
  gradBotSheath.addColorStop(1, `rgba(${synchrotronColor(farEnergy)},0)`);

  ctx.fillStyle = gradBotSheath;
  ctx.beginPath();
  ctx.ellipse(
    botX, 
    botY, 
    sheathRadius * pulse * khWidthMod,  // Full width with modulation
    length / 2, 
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // SPINE (inner core)
  const gradBotSpine = ctx.createLinearGradient(
    botX, 
    cy + radius + botOffsetY, 
    botX, 
    cy + length + botOffsetY
  );
  gradBotSpine.addColorStop(0, `rgba(${synchrotronColor(baseEnergy)},${botSpineAlpha})`);
  gradBotSpine.addColorStop(0.5, `rgba(${synchrotronColor(midEnergy)},${botSpineAlpha * 0.8})`);
  gradBotSpine.addColorStop(1, `rgba(${synchrotronColor(farEnergy)},0)`);

  ctx.fillStyle = gradBotSpine;
  ctx.beginPath();
  ctx.ellipse(
    botX, 
    botY, 
    spineRadius * pulse * khWidthMod * 0.95,  // Spine slightly less affected by KH
    length / 2, 
    0, 0, Math.PI * 2
  );
  ctx.fill();

  ctx.restore();
}

/**
 * Draw soft glow cone around polar jets
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} radius - Sphere radius
 * @param {number} intensity - Jet intensity (0.0-1.0)
 */
export function drawJetGlow(ctx, cx, cy, radius, intensity) {
  const glowR = radius * (1.5 + intensity * 2);

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
  grad.addColorStop(0, `rgba(150,200,255,${0.15 * intensity})`);
  grad.addColorStop(1, "rgba(150,200,255,0)");

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Calculate jet precession (wobble of jet axis)
 * @param {number} time - Animation time in seconds
 * @param {number} intensity - Jet intensity (0.0-1.0)
 * @param {number} diskWarp - Disk vertical warp offset (coupling from disk wobble)
 * @returns {{x: number, y: number}} Offset in X and Y directions
 */
export function jetPrecession(time, intensity, diskWarp = 0) {
  const wobble = 0.15 * intensity; // max tilt ~8.5 degrees
  
  // Disk influence: jets wobble because the disk is wobbling
  const diskInfluence = diskWarp * 0.002;
  
  return {
    x: Math.sin(time * 0.3) * wobble + diskInfluence,
    y: Math.cos(time * 0.25) * wobble - diskInfluence * 0.5
  };
}

/**
 * Calculate helical offset for magnetic corkscrew jets
 * @param {number} time - Animation time in seconds
 * @param {number} intensity - Jet intensity (0.0-1.0)
 * @returns {{hx: number, hy: number}} Helix offset in X and Y
 */
export function jetHelix(time, intensity) {
  // Field-anchored radius: magnetic tension varies
  const tension = 0.5 + Math.sin(time * 0.7) * 0.5; // 0.0–1.0 oscillation
  const baseRadius = 0.14 + intensity * 0.05;      // 0.14–0.19 range (sweet spot)
  const radius = baseRadius * tension;              // tightens and loosens

  // Dual-frequency helix motion: slow breathing + fast turbulent jitter
  const speed = 
    2.0 
    + Math.sin(time * 0.4) * 2.0   // slow breathing (main harmonic)
    + Math.sin(time * 1.7) * 0.3;  // fast turbulent jitter (second harmonic)

  return {
    hx: Math.cos(time * speed) * radius,
    hy: Math.sin(time * speed) * radius
  };
}

/**
 * Spawn jet particles for motion effects
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} radius - Sphere radius
 * @param {number} intensity - Jet intensity (0.0-1.0)
 * @param {number} coreTemperature - Core temperature for color tinting
 * @param {number} time - Animation time for helix calculation
 */
export function spawnJetParticles(cx, cy, radius, intensity, coreTemperature, time) {
  // Recommended spawn rate: dense but not noisy
  const spawnRate = 0.5 * intensity;

  // Apply magnetic corkscrew helix
  const helix = jetHelix(time, intensity);
  
  // Apply magnetic collimation to particle spread
  const pressure = magneticPressure(intensity, coreTemperature);
  const spread = (1 - pressure) * 12; // degrees/px offset: high pressure → tight beam

  // Kelvin-Helmholtz ripple at spawn position (dNorm=0, base of jet)
  const khRipple = kelvinHelmholtzRipple(0, time, intensity, pressure);

  // Spine-sheath differentiation
  const baseSpeed = 6 + intensity * 10;

  // TOP jet
  if (Math.random() < spawnRate) {
    const angleOffset = (Math.random() - 0.5) * spread;
    const xOffset = Math.sin(angleOffset) * 4;
    
    // Spine-sheath tagging: 50% spine (inner fast core), 50% sheath (outer slow envelope)
    const isSpine = Math.random() < 0.5;
    const speedMultiplier = isSpine ? 1.3 : 0.7;  // Spine 30% faster, sheath 30% slower
    
    // Apply KH ripple perpendicular to jet direction (horizontal for vertical jet)
    // Sheath particles get stronger KH modulation (more turbulent)
    const khStrength = isSpine ? 0.25 : 0.5;  // Spine: 25%, Sheath: 50%
    const khOffset = khRipple * khStrength;
    
    jetParticles.push({
      x: cx + helix.hx * radius + xOffset + khOffset,
      y: cy - radius + helix.hy * radius,
      speed: baseSpeed * speedMultiplier,
      life: 1,
      t: 0,                        // Track elapsed time for helix drift
      dir: -1,                     // upward
      coreTemperature,
      helixX: helix.hx * radius,   // Store initial helix offset for widening
      helixY: helix.hy * radius,
      energy: 1.0,                 // Spawn at maximum energy (near star)
      isSpine                      // Tag as spine or sheath
    });
  }

  // BOTTOM jet
  if (Math.random() < spawnRate) {
    const angleOffset = (Math.random() - 0.5) * spread;
    const xOffset = Math.sin(angleOffset) * 4;
    
    // Spine-sheath tagging
    const isSpine = Math.random() < 0.5;
    const speedMultiplier = isSpine ? 1.3 : 0.7;
    
    // Apply KH ripple (stronger for sheath)
    const khStrength = isSpine ? 0.25 : 0.5;
    const khOffset = khRipple * khStrength;
    
    jetParticles.push({
      x: cx - helix.hx * radius + xOffset + khOffset,
      y: cy + radius - helix.hy * radius,
      speed: baseSpeed * speedMultiplier,
      life: 1,
      t: 0,                        // Track elapsed time for helix drift
      dir: 1,                      // downward
      coreTemperature,
      helixX: -helix.hx * radius,  // Store initial helix offset for widening
      helixY: -helix.hy * radius,
      energy: 1.0,                 // Spawn at maximum energy (near star)
      isSpine                      // Tag as spine or sheath
    });
  }
}

/**
 * Update and draw jet particles
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} dt - Delta time since last frame
 * @param {number} time - Global animation time for helix synchronization
 * @param {number} intensity - Current jet intensity for helix calculation
 * @param {number} centerY - Center Y coordinate of star for disk occlusion
 * @param {number} sphereRadius - Radius of star for disk band calculation
 * @param {number} shadowStrength - Shadow intensity multiplier (0.5-1.0)
 */
export function updateJetParticles(ctx, dt, time, intensity, centerY, sphereRadius, shadowStrength = 1.0) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  
  // Debug particle count periodically
  if (Math.random() < 0.01 && jetParticles.length > 0) {
    console.log('💨 Jet Particles:', jetParticles.length, 'intensity:', intensity.toFixed(2));
  }
  
  // Compute precession for beaming calculation
  const prec = jetPrecession(time, intensity);
  
  for (let p of jetParticles) {
    // Motion along jet axis
    p.y += p.speed * p.dir;

    // Update particle time tracker
    p.t += dt;

    // Helix-driven particle drift: particles ride the global helix wave
    const helix = jetHelix(time + p.t * 0.6, intensity);
    p.x += helix.hx * 0.4;

    // Widening spiral: particles drift laterally outward
    const age = 1 - p.life; // 0 at birth, 1 at death
    const spiralFactor = 1 + age * 2; // Grows from 1 to 3
    p.x += p.helixX * spiralFactor * dt * 0.5;

    // Recommended: slower decay for long streaks
    p.life -= dt * 0.25;

    // Synchrotron cooling: energy decreases as particle travels
    p.energy -= dt * 0.4;  // Cool over time
    p.energy = Math.max(0, p.energy);

    // Synchrotron color based on energy
    const rgb = synchrotronColor(p.energy);

    // Disk shadowing: occlude particles passing through the accretion disk
    const diskHalfThickness = sphereRadius * 0.35;
    const diskYTop = centerY - diskHalfThickness;
    const diskYBottom = centerY + diskHalfThickness;
    const shadow = diskShadowFactor(p.y, diskYTop, diskYBottom, shadowStrength);
    
    // Relativistic beaming: particles brighten when jet points toward observer
    const beaming = relativisticBeaming(p.dir, prec.x, prec.y);
    const beamBoost = p.isSpine ? beaming.spineBoost : beaming.sheathBoost;
    
    // Spine-sheath brightness with beaming
    const baseBrightness = p.isSpine ? 1.4 : 0.7;  // Base brightness (spine/sheath)
    const baseAlpha = p.life * shadow * baseBrightness;
    
    // Multi-band rendering: radio, optical, X-ray
    const e = p.energy;
    
    // Get observation mode multipliers
    const m = OBSERVATION_MODES[observationMode];
    
    // Band-specific beaming (X-ray responds most, radio least)
    const radioBoost = 0.8 + beaming.beamingFactor * 0.1;
    const opticalBoost = 0.7 + beaming.beamingFactor * 0.3;
    const xrayBoost = 0.5 + beaming.beamingFactor * 0.5;
    
    // Radio emission (long-lived, low-mid energy, slightly larger)
    const radioW = radioEmission(e);
    if (radioW > 0.01) {
      const rgb = radioColor();
      const alpha = baseAlpha * radioW * 0.4 * radioBoost * m.radio;
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Optical emission (mid energy, normal size)
    const optW = opticalEmission(e);
    if (optW > 0.01) {
      const rgb = opticalColor(e);
      const alpha = baseAlpha * optW * 0.7 * opticalBoost * m.optical;
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // X-ray emission (very high energy, compact, strongly beamed)
    const xrayW = xrayEmission(e);
    if (xrayW > 0.01) {
      const rgb = xrayColor();
      const alpha = baseAlpha * xrayW * 0.9 * xrayBoost * m.xray;
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Apply spine-sheath diffusion (entrainment: particles swap layers)
  applySpineSheathDiffusion(dt);

  // Cleanup
  for (let i = jetParticles.length - 1; i >= 0; i--) {
    if (jetParticles[i].life <= 0) {
      jetParticles.splice(i, 1);
    }
  }
  
  ctx.restore();
}

/**
 * Draw rotating accretion disk around the star
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} radius - Sphere radius
 * @param {number} intensity - Jet intensity (0.0-1.0)
 * @param {number} time - Animation time in seconds
 * @returns {number} Disk warp offset for jet coupling
 */
export function drawAccretionDisk(ctx, cx, cy, radius, intensity, time) {
  const inner = radius * 1.1;
  const outer = radius * (2.0 + intensity * 1.5);
  const rotation = time * 0.4;
  
  // Disk warping from jet torque (jets exert force on inner disk)
  const warp = Math.sin(time * 1.2) * intensity * 3;
  
  // Disk brightness responds to jet intensity (inner disk heats up)
  const diskHeat = 0.4 + intensity * 0.6; // 0.4–1.0 range

  ctx.save();
  ctx.translate(cx, cy + warp); // Apply vertical wobble
  ctx.rotate(rotation);

  const grad = ctx.createRadialGradient(0, 0, inner, 0, 0, outer);
  
  // Heat-modulated colors: hotter disk when jets are strong
  const r1 = Math.floor(255 * diskHeat);
  const g1 = Math.floor(180 * diskHeat);
  const b1 = Math.floor(120 * diskHeat);
  const r2 = Math.floor(255 * diskHeat);
  const g2 = Math.floor(140 * diskHeat);
  const b2 = Math.floor(80 * diskHeat);
  const r3 = Math.floor(255 * diskHeat);
  const g3 = Math.floor(100 * diskHeat);
  const b3 = Math.floor(50 * diskHeat);
  
  grad.addColorStop(0, `rgba(${r1},${g1},${b1},${0.2 * intensity})`);
  grad.addColorStop(0.5, `rgba(${r2},${g2},${b2},${0.3 * intensity})`);
  grad.addColorStop(1, `rgba(${r3},${g3},${b3},0)`);

  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, outer, outer * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  
  return warp; // Return warp for jet coupling
}

/**
 * Calculate relativistic beaming boost (angle-dependent brightness)
 * Jets pointed toward camera appear brighter
 * @param {number} tiltX - X tilt from precession
 * @param {number} tiltY - Y tilt from precession
 * @returns {number} Gamma boost factor (0.5-1.0)
 */
/**
 * Calculate relativistic beaming factor based on viewing angle
 * Jets appear brighter when pointing toward observer (Doppler beaming)
 * @param {number} dir - Jet direction (-1 = upward, 1 = downward)
 * @param {number} precX - Precession X offset (normalized)
 * @param {number} precY - Precession Y offset (normalized)
 * @returns {{beamingFactor: number, spineBoost: number, sheathBoost: number}} Beaming multipliers
 */
export function relativisticBeaming(dir, precX, precY) {
  // Camera direction: viewer above screen looking down
  const camDir = { x: 0, y: -1 };
  
  // Jet direction vector (base direction + precession offset)
  const jetDir = {
    x: precX,
    y: dir + precY * dir  // dir is -1 (up) or 1 (down)
  };
  
  // Normalize jet direction
  const jetMag = Math.sqrt(jetDir.x * jetDir.x + jetDir.y * jetDir.y);
  if (jetMag < 0.001) {
    // Fallback for near-zero vector
    return { beamingFactor: 1.0, spineBoost: 1.0, sheathBoost: 1.0 };
  }
  const jetDirNorm = { x: jetDir.x / jetMag, y: jetDir.y / jetMag };
  
  // Dot product: 1 = pointing at camera, -1 = pointing away
  const dot = jetDirNorm.x * camDir.x + jetDirNorm.y * camDir.y;
  
  // Convert to viewing angle (0 = toward camera, π = away)
  const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
  
  // Normalize to 0–1 (1 = toward camera, 0 = away)
  const viewNorm = 1 - angle / Math.PI;
  
  // Relativistic beaming: (1 + k·viewNorm)^γ
  const baseGamma = 2.0;                          // Beaming sharpness
  const beamingGain = 1 + viewNorm * 1.8;         // 1.0–2.8 range
  const beaming = Math.pow(beamingGain, baseGamma); // ~1–8
  const beamingFactor = Math.min(beaming, 6.0);   // Clamp to 6.0
  
  // Spine responds more strongly than sheath (relativistic core dominance)
  const spineBoost = 0.6 + beamingFactor * 0.4;   // 0.6–3.0
  const sheathBoost = 0.7 + beamingFactor * 0.2;  // 0.7–1.9
  
  return { beamingFactor, spineBoost, sheathBoost };
}

/**
 * Spawn shock knots (bright pulses traveling along jets)
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} radius - Sphere radius
 * @param {number} intensity - Jet intensity (0.0-1.0)
 * @param {number} time - Animation time in seconds
 */
export function spawnJetKnots(cx, cy, radius, intensity, time, coreTemperature = 1.0) {
  // Apply magnetic corkscrew helix
  const helix = jetHelix(time, intensity);
  
  // Apply magnetic collimation to shock knot spread
  const pressure = magneticPressure(intensity, coreTemperature);
  const knotSpread = (1 - pressure) * 8; // high pressure → narrow channel

  // Base speed for knots
  const baseSpeed = 3 + intensity * 6;

  // Top jet knots
  if (Math.random() < 0.1 * intensity) {
    const kx = (Math.random() - 0.5) * knotSpread;
    
    // Spine-sheath tagging for knots
    const isSpine = Math.random() < 0.5;
    const speedMultiplier = isSpine ? 1.3 : 0.7;  // Spine faster, sheath slower
    
    jetKnots.push({
      x: cx + helix.hx * radius + kx,
      y: cy - radius + helix.hy * radius,
      dir: -1,
      t: 0,
      speed: baseSpeed * speedMultiplier,
      helixX: helix.hx * radius,   // Store initial helix offset for widening
      helixY: helix.hy * radius,
      energy: 1.0,                 // Spawn at maximum energy
      isSpine                      // Tag as spine or sheath
    });
  }
  
  // Bottom jet knots
  if (Math.random() < 0.1 * intensity) {
    const kx = (Math.random() - 0.5) * knotSpread;
    
    // Spine-sheath tagging for knots
    const isSpine = Math.random() < 0.5;
    const speedMultiplier = isSpine ? 1.3 : 0.7;
    
    jetKnots.push({
      x: cx - helix.hx * radius + kx,
      y: cy + radius - helix.hy * radius,
      dir: 1,
      t: 0,
      speed: baseSpeed * speedMultiplier,
      helixX: -helix.hx * radius,  // Store initial helix offset for widening
      helixY: -helix.hy * radius,
      energy: 1.0,                 // Spawn at maximum energy
      isSpine                      // Tag as spine or sheath
    });
  }
}

/**
 * Update and draw shock knots
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} dt - Delta time since last frame
 * @param {number} centerY - Center Y coordinate of star for disk occlusion
 * @param {number} sphereRadius - Radius of star for disk band calculation
 * @param {number} shadowStrength - Shadow intensity multiplier (0.5-1.0)
 * @param {Object} colorBase - Base color {r, g, b}
 */
export function updateJetKnots(ctx, dt, centerY, sphereRadius, shadowStrength = 1.0, colorBase = { r: 200, g: 230, b: 255 }) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  
  for (let k of jetKnots) {
    k.t += dt;
    
    // Motion along jet axis
    k.y += k.speed * k.dir;

    // Widening spiral: knots drift laterally outward
    const spiralFactor = 1 + k.t * 0.5; // Grows over time
    k.x += k.helixX * spiralFactor * dt * 0.3;

    // Synchrotron cooling: energy decreases as knot travels
    k.energy -= dt * 0.35;  // Cool slightly slower than particles
    k.energy = Math.max(0, k.energy);

    const life = Math.max(0, 1 - k.t * 0.4); // fade over time
    const radius = 4 + k.t * 3;

    // Synchrotron color based on energy
    const rgb = synchrotronColor(k.energy);

    // Disk shadowing: occlude knots passing through the accretion disk
    const diskHalfThickness = sphereRadius * 0.35;
    const diskYTop = centerY - diskHalfThickness;
    const diskYBottom = centerY + diskHalfThickness;
    const shadow = diskShadowFactor(k.y, diskYTop, diskYBottom, shadowStrength);
    
    // Spine-sheath brightness differentiation for knots
    const brightnessBoost = k.isSpine ? 1.4 : 0.7;  // Spine brighter, sheath dimmer
    const alpha = life * shadow * brightnessBoost;

    ctx.fillStyle = `rgba(${rgb},${alpha})`;
    ctx.beginPath();
    ctx.arc(k.x, k.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cleanup old knots
  for (let i = jetKnots.length - 1; i >= 0; i--) {
    if (jetKnots[i].t > 3) {
      jetKnots.splice(i, 1);
    }
  }
  
  ctx.restore();
}

/**
 * Update jet tip positions and speeds based on jet intensity and collimation
 * @param {number} dt - Delta time since last frame
 * @param {number} jets - Jet intensity (0.0-1.0)
 * @param {number} pressure - Magnetic pressure for collimation (0.0-1.0)
 */
export function updateJetTips(dt, jets, pressure, cx, cy, sphereRadius, jetLength, time) {
  // Speed increases with jet intensity and magnetic collimation
  const baseSpeed = 0.4 + jets * 0.8;           // 0.4-1.2 range
  const collimationBoost = 0.4 + pressure * 0.6; // 0.4-1.0 range
  const speed = baseSpeed * collimationBoost;    // faster when strong + collimated

  // Calculate shock compression strength
  const compression = shockCompression(speed, jets, pressure);

  // Get current jet direction offsets (precession + helix)
  const prec = jetPrecession(time, jets);
  const helix = jetHelix(time, jets);

  for (const tip of jetTips) {
    tip.speed = speed;
    tip.t += tip.speed * dt;

    // Loop back when tip reaches far end
    if (tip.t > 1.1) {
      tip.t = 0;
      tip.life = 1;
    }

    // Fade slightly over distance
    tip.life = Math.max(0.6, 1 - tip.t * 0.3);

    // Spawn shock compression particles ahead of the tip
    if (Math.random() < compression * 0.3) {
      const distance = tip.t * jetLength;
      const dir = tip.dir;

      // Apply precession and helix to position
      const precX = dir === -1 ? prec.x * sphereRadius : -prec.x * sphereRadius;
      const precY = dir === -1 ? prec.y * sphereRadius : -prec.y * sphereRadius;
      const helixX = dir === -1 ? helix.hx * sphereRadius : -helix.hx * sphereRadius;
      const helixY = dir === -1 ? helix.hy * sphereRadius : -helix.hy * sphereRadius;

      // Spawn slightly ahead of tip
      const ahead = 8 + compression * 12;
      const x = cx + precX + helixX;
      const y = cy + dir * (sphereRadius + distance + ahead) + precY + helixY;

      shockParticles.push({
        x,
        y,
        size: 2,
        life: 1,
        compression,
        energy: 1 - (distance / jetLength) * 0.7  // Energy based on distance from star
      });
    }
  }

  // Update shock particles
  for (const s of shockParticles) {
    s.life -= dt * 2.2;
    s.size += dt * 18;
    // Slight lateral drift
    s.x += (Math.random() - 0.5) * 2;
    s.y += (Math.random() - 0.5) * 2;
  }

  // Remove dead particles
  shockParticles = shockParticles.filter(s => s.life > 0);
}

/**
 * Update and spawn magnetic reconnection flares along jet spine
 * @param {number} dt - Delta time since last frame
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} sphereRadius - Sphere radius
 * @param {number} jetLength - Length of jets
 * @param {number} jets - Jet intensity (0.0-1.0)
 * @param {number} pressure - Magnetic pressure (0.0-1.0)
 * @param {number} time - Animation time
 */
export function updateReconnectionFlares(dt, cx, cy, sphereRadius, jetLength, jets, pressure, time) {
  // Flares only occur in high-stress spine conditions
  const canFlare = pressure > 0.8 && jets > 0.6 && Math.random() < 0.015;  // ~0.9 flares/sec at 60fps

  if (canFlare) {
    // Get current jet direction offsets (precession + helix)
    const prec = jetPrecession(time, jets);
    const helix = jetHelix(time, jets);

    // Spawn flares along both jets (top and bottom)
    for (const dir of [-1, 1]) {
      // Random position along spine (20-80% of jet length)
      const dNorm = 0.2 + Math.random() * 0.6;
      const flareDistance = dNorm * jetLength;

      // Apply precession and helix to position
      const precX = dir === -1 ? prec.x * sphereRadius : -prec.x * sphereRadius;
      const precY = dir === -1 ? prec.y * sphereRadius : -prec.y * sphereRadius;
      const helixX = dir === -1 ? helix.hx * sphereRadius : -helix.hx * sphereRadius;
      const helixY = dir === -1 ? helix.hy * sphereRadius : -helix.hy * sphereRadius;

      const flareX = cx + precX + helixX;
      const flareY = cy + dir * (sphereRadius + flareDistance) + precY + helixY;

      reconnectionFlares.push({
        x: flareX,
        y: flareY,
        life: 1,
        size: 4,
        energy: 1.0,      // Starts ultra-hot (blue-white)
        dNorm,            // Position for spine brightening
        dir               // Jet direction for beaming calculation
      });
    }
  }

  // Update existing flares
  for (const f of reconnectionFlares) {
    f.life -= dt * 2.5;   // ~0.4s lifetime
    f.size += dt * 40;    // Rapid expansion: 4px → 20px in 0.4s
    f.energy -= dt * 1.5; // Fast cooling: 1.0 → 0 in 0.67s
    f.energy = Math.max(0, f.energy);
  }

  // Remove dead flares
  reconnectionFlares = reconnectionFlares.filter(f => f.life > 0);
}

/**
 * Spawn mixing layer particles at spine-sheath boundary
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} sphereRadius - Sphere radius
 * @param {number} jetLength - Length of jets
 * @param {number} jets - Jet intensity (0.0-1.0)
 * @param {number} pressure - Magnetic pressure (0.0-1.0)
 * @param {number} time - Animation time
 */
export function spawnMixingParticles(cx, cy, sphereRadius, jetLength, jets, pressure, time) {
  if (jets < 0.1) return;

  // Spawn rate scales with pressure (more mixing when jet is stressed)
  const spawnRate = 0.02 + pressure * 0.08;  // 0.02-0.10 per frame
  if (Math.random() > spawnRate) return;

  // Get current jet direction offsets (precession + helix)
  const prec = jetPrecession(time, jets);
  const helix = jetHelix(time, jets);

  // Spine-sheath structure dimensions
  const baseWidth = sphereRadius * 0.22;
  const width = baseWidth * (1 - pressure * 0.6);
  const spineRadius = width * 0.45;

  // Mixing layer thickness (thin shell around spine radius)
  const mixInner = spineRadius * 0.95;   // 95% of spine radius
  const mixOuter = spineRadius * 1.25;   // 125% of spine radius

  // Spawn along both jets (top and bottom)
  for (const dir of [-1, 1]) {
    // Random position along jet (0-100% of jet length)
    const dNorm = Math.random();
    const distance = dNorm * jetLength;

    // Apply precession and helix to position
    const precX = dir === -1 ? prec.x * sphereRadius : -prec.x * sphereRadius;
    const precY = dir === -1 ? prec.y * sphereRadius : -prec.y * sphereRadius;
    const helixX = dir === -1 ? helix.hx * sphereRadius : -helix.hx * sphereRadius;
    const helixY = dir === -1 ? helix.hy * sphereRadius : -helix.hy * sphereRadius;

    // Random radial position in mixing layer
    const radius = mixInner + Math.random() * (mixOuter - mixInner);
    const angle = Math.random() * Math.PI * 2;

    // Position in cylindrical coordinates around jet axis
    const lateralX = Math.cos(angle) * radius;
    const lateralY = Math.sin(angle) * radius * 0.3;  // Compressed perpendicular to jet

    const particleX = cx + precX + helixX + lateralX;
    const particleY = cy + dir * (sphereRadius + distance) + precY + helixY + lateralY;

    // Energy based on distance from star (same as jet particles)
    const energy = 1 - (distance / jetLength) * 0.7;

    mixingParticles.push({
      x: particleX,
      y: particleY,
      size: 1.5,
      life: 1,
      energy,
      dir,
      dNorm,
      time: time  // Store spawn time for KH ripple phase
    });
  }
}

/**
 * Update mixing layer particles with drift, growth, and fading
 * @param {number} dt - Delta time since last frame
 * @param {number} time - Current animation time
 * @param {number} jets - Jet intensity (0.0-1.0)
 * @param {number} pressure - Magnetic pressure (0.0-1.0)
 */
export function updateMixingParticles(dt, time, jets, pressure) {
  for (const m of mixingParticles) {
    // Drift outward and fade
    m.life -= dt * 1.4;        // ~0.7s lifetime
    m.size += dt * 3;          // Grows: 1.5px → 4px
    m.energy -= dt * 0.3;      // Synchrotron cooling
    m.energy = Math.max(0, m.energy);

    // KH ripple modulation for shimmer effect
    const ripple = kelvinHelmholtzRipple(m.dNorm, time, jets, pressure);
    
    // Normal vector pointing outward from jet axis (radially)
    // For simplicity, use horizontal offset (perpendicular to vertical jet)
    m.x += ripple * 0.2;

    // Random lateral drift (filamentary turbulence)
    m.x += (Math.random() - 0.5) * 0.4;
    m.y += (Math.random() - 0.5) * 0.4;
  }

  // Remove dead particles
  mixingParticles = mixingParticles.filter(m => m.life > 0);
}

/**
 * Draw mixing layer particles with synchrotron colors
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function drawMixingParticles(ctx) {
  if (mixingParticles.length === 0) return;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const m of mixingParticles) {
    const e = Math.max(0, m.energy);
    const baseAlpha = 0.25 * m.life;  // Soft, turbulent glow
    
    // Get observation mode multipliers
    const modeMult = OBSERVATION_MODES[observationMode];
    
    // Multi-band rendering: mixing layer is radio-dominant with optical, minimal X-ray
    
    // Radio emission (strong in cooler mixing layer)
    const radioW = radioEmission(e);
    if (radioW > 0.01) {
      const rgb = radioColor();
      const alpha = baseAlpha * radioW * 0.6 * modeMult.radio;  // Radio-dominant
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Optical emission (moderate in mixing layer)
    const optW = opticalEmission(e);
    if (optW > 0.01) {
      const rgb = opticalColor(e);
      const alpha = baseAlpha * optW * 0.4 * modeMult.optical;
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // X-ray emission (minimal in cooler boundary layer)
    const xrayW = xrayEmission(e);
    if (xrayW > 0.01) {
      const rgb = xrayColor();
      const alpha = baseAlpha * xrayW * 0.2 * modeMult.xray;  // Suppressed
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Apply spine-sheath diffusion (particle layer swapping)
 * Called from updateJetParticles to simulate entrainment
 * @param {number} dt - Delta time since last frame
 */
export function applySpineSheathDiffusion(dt) {
  for (const p of jetParticles) {
    // Particles near the boundary can swap layers occasionally
    if (Math.random() < 0.002) {  // ~0.12 swaps per second per particle
      p.isSpine = !p.isSpine;
      
      // Adjust speed to match new layer
      const baseSpeed = 6 + 10 * 0.5;  // Approximate average
      const speedMultiplier = p.isSpine ? 1.3 : 0.7;
      p.speed = baseSpeed * speedMultiplier;
    }
  }
}

/**
 * Spawn ambient medium particles (external environment around jets)
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} sphereRadius - Sphere radius
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
export function spawnAmbientParticles(cx, cy, sphereRadius, canvasWidth, canvasHeight) {
  // Maintain a sparse field of ambient particles (target: ~50 particles)
  if (ambientParticles.length < 50) {
    // Spawn uniformly in a large radius around the star
    const spawnRadius = sphereRadius * 6;  // Large spawn zone
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * spawnRadius;
    
    const px = cx + Math.cos(angle) * distance;
    const py = cy + Math.sin(angle) * distance;
    
    // Only spawn if within canvas bounds
    if (px > 0 && px < canvasWidth && py > 0 && py < canvasHeight) {
      ambientParticles.push({
        x: px,
        y: py,
        size: 1.0,
        life: 1,
        energy: 0.15,  // Low-energy ambient medium
        vx: (Math.random() - 0.5) * 0.3,  // Slow drift
        vy: (Math.random() - 0.5) * 0.3
      });
    }
  }
}

/**
 * Update ambient particles with jet entrainment effects
 * @param {number} dt - Delta time since last frame
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} sphereRadius - Sphere radius
 * @param {number} jetLength - Length of jets
 * @param {number} jets - Jet intensity (0.0-1.0)
 * @param {number} pressure - Magnetic pressure (0.0-1.0)
 * @param {number} time - Animation time
 */
export function updateAmbientParticles(dt, cx, cy, sphereRadius, jetLength, jets, pressure, time) {
  if (jets < 0.1) {
    // No entrainment when jets are weak - just ambient drift
    for (const p of ambientParticles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt * 0.1;  // Slow fade
    }
    ambientParticles = ambientParticles.filter(p => p.life > 0);
    return;
  }

  // Get current jet direction offsets (precession + helix)
  const prec = jetPrecession(time, jets);
  const helix = jetHelix(time, jets);

  // Spine-sheath structure dimensions
  const baseWidth = sphereRadius * 0.22;
  const width = baseWidth * (1 - pressure * 0.6);
  const sheathRadius = width;
  const influenceRadius = sheathRadius * 1.8;  // Entrainment zone

  // Process both jets (top and bottom)
  for (const dir of [-1, 1]) {
    // Apply precession and helix to jet axis position
    const precX = dir === -1 ? prec.x * sphereRadius : -prec.x * sphereRadius;
    const helixX = dir === -1 ? helix.hx * sphereRadius : -helix.hx * sphereRadius;
    const jetAxisX = cx + precX + helixX;

    for (const p of ambientParticles) {
      // Check multiple points along jet axis for entrainment
      for (let dNorm = 0; dNorm <= 1; dNorm += 0.2) {
        const distance = dNorm * jetLength;
        const precY = dir === -1 ? prec.y * sphereRadius : -prec.y * sphereRadius;
        const helixY = dir === -1 ? helix.hy * sphereRadius : -helix.hy * sphereRadius;
        const jetAxisY = cy + dir * (sphereRadius + distance) + precY + helixY;

        // Distance from particle to this point on jet axis
        const dx = p.x - jetAxisX;
        const dy = p.y - jetAxisY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // If within influence radius, apply inward pull
        if (dist < influenceRadius && dist > 0.1) {
          const pullStrength = (1 - dist / influenceRadius) * pressure * jets * 0.15;
          
          // Pull toward jet axis
          const nx = -dx / dist;  // Normal pointing toward axis
          const ny = -dy / dist;
          
          p.vx += nx * pullStrength;
          p.vy += ny * pullStrength;

          // Ambient turbulence near jet (swirling fog)
          p.x += (Math.random() - 0.5) * 0.2;
          p.y += (Math.random() - 0.5) * 0.2;

          // If particle reaches sheath boundary, convert to sheath particle
          if (dist < sheathRadius) {
            // Add to jet particle system as sheath particle
            jetParticles.push({
              x: p.x,
              y: p.y,
              speed: (6 + jets * 10) * 0.7,  // Sheath speed
              life: 1,
              t: 0,
              dir: dir,
              coreTemperature: 1.0,
              helixX: helixX,
              helixY: helixY,
              energy: 0.4,  // Low energy from ambient ingestion
              isSpine: false  // Entrained into sheath
            });
            
            // Mark ambient particle for removal
            p.life = 0;
            break;
          }
        }
      }
    }
  }

  // Update ambient particle positions and life
  for (const p of ambientParticles) {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= dt * 0.1;  // Slow fade
    
    // Damping (ambient friction)
    p.vx *= 0.98;
    p.vy *= 0.98;
  }

  // Remove dead particles
  ambientParticles = ambientParticles.filter(p => p.life > 0);
}

/**
 * Draw ambient medium particles with low-energy synchrotron colors
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function drawAmbientParticles(ctx) {
  if (ambientParticles.length === 0) return;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const p of ambientParticles) {
    const e = Math.max(0, p.energy);
    const baseAlpha = 0.12 * p.life;  // Very faint ambient glow
    
    // Get observation mode multipliers
    const modeMult = OBSERVATION_MODES[observationMode];
    
    // Multi-band rendering: ambient medium is radio-only (very low energy)
    
    // Radio emission (only significant band for cool ambient medium)
    const radioW = radioEmission(e);
    if (radioW > 0.01) {
      const rgb = radioColor();
      const alpha = baseAlpha * radioW * 0.7 * modeMult.radio;  // Radio-dominant fog
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Optical emission (very weak)
    const optW = opticalEmission(e);
    if (optW > 0.01) {
      const rgb = opticalColor(e);
      const alpha = baseAlpha * optW * 0.3 * modeMult.optical;  // Suppressed
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // No X-ray emission (too cool for X-ray)
  }

  ctx.restore();
}

/**
 * Draw magnetic reconnection flares
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} time - Animation time for precession/beaming
 * @param {number} jets - Jet intensity for precession calculation
 */
export function drawReconnectionFlares(ctx, time, jets) {
  if (reconnectionFlares.length === 0) return;

  // Compute precession for beaming
  const prec = jetPrecession(time, jets);
  const topBeaming = relativisticBeaming(-1, prec.x, prec.y);
  const botBeaming = relativisticBeaming(1, prec.x, prec.y);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const f of reconnectionFlares) {
    // Apply beaming to flare (high-energy spine event)
    const beaming = f.dir === -1 ? topBeaming : botBeaming;
    
    // Get observation mode multipliers
    const modeMult = OBSERVATION_MODES[observationMode];
    
    // Band-specific beaming (X-ray most responsive)
    const radioBoost = 0.8 + beaming.beamingFactor * 0.1;
    const opticalBoost = 0.7 + beaming.beamingFactor * 0.3;
    const xrayBoost = 0.4 + beaming.beamingFactor * 0.6;  // 0.4–4.0
    
    const e = Math.max(0, f.energy);
    const baseAlpha = 0.35 * f.life;
    
    // Multi-band flare rendering (strong X-ray at birth → optical → radio tail)
    
    // Radio afterglow (appears as flare cools)
    const radioW = radioEmission(e);
    if (radioW > 0.01) {
      const rgb = radioColor();
      const alpha = baseAlpha * radioW * 0.5 * radioBoost * modeMult.radio;
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Optical emission (mid-life flare)
    const optW = opticalEmission(e);
    if (optW > 0.01) {
      const rgb = opticalColor(e);
      const alpha = baseAlpha * optW * 0.7 * opticalBoost * modeMult.optical;
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // X-ray burst (strongest at birth, dies quickly)
    const xrayW = xrayEmission(e);
    if (xrayW > 0.01) {
      const rgb = xrayColor();
      const alpha = baseAlpha * xrayW * 0.9 * xrayBoost * modeMult.xray;
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
      
      // Bright X-ray core for extra punch when fresh
      if (f.life > 0.7) {
        const coreAlpha = 0.6 * f.life * xrayBoost * modeMult.xray;
        ctx.fillStyle = `rgba(${rgb}, ${coreAlpha})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

/**
 * Draw jet tips with relativistic beaming effects
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} sphereRadius - Sphere radius
 * @param {number} jetLength - Length of jets
 * @param {number} pressure - Magnetic pressure for size calculation
 * @param {number} time - Animation time for helix/precession
 * @param {number} intensity - Jet intensity for brightness
 */
export function drawJetTips(ctx, cx, cy, sphereRadius, jetLength, pressure, time, intensity) {
  if (intensity < 0.1) return; // Skip if jets are weak

  // Get current jet direction offsets (precession + helix)
  const prec = jetPrecession(time, intensity);
  const helix = jetHelix(time, intensity);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // Compute beaming for top and bottom jets
  const topBeaming = relativisticBeaming(-1, prec.x, prec.y);
  const botBeaming = relativisticBeaming(1, prec.x, prec.y);

  // Draw shock compression particles first (behind tips)
  for (const s of shockParticles) {
    // Determine which jet this shock particle belongs to (based on y position)
    const dir = s.y < cy ? -1 : 1;
    const beaming = dir === -1 ? topBeaming : botBeaming;
    
    // Get observation mode multipliers
    const modeMult = OBSERVATION_MODES[observationMode];
    
    // Band-specific beaming for high-energy shocks
    const radioBoost = 0.8 + beaming.beamingFactor * 0.1;
    const opticalBoost = 0.7 + beaming.beamingFactor * 0.3;
    const xrayBoost = 0.5 + beaming.beamingFactor * 0.5;
    
    const e = s.energy;
    const baseAlpha = 0.25 * s.life;
    
    // Multi-band shock rendering (strong X-ray → optical → radio)
    
    // Radio emission (appears as shock cools)
    const radioW = radioEmission(e);
    if (radioW > 0.01) {
      const rgb = radioColor();
      const alpha = baseAlpha * radioW * 0.5 * radioBoost * modeMult.radio;
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Optical emission (mid-life shock)
    const optW = opticalEmission(e);
    if (optW > 0.01) {
      const rgb = opticalColor(e);
      const alpha = baseAlpha * optW * 0.7 * opticalBoost * modeMult.optical;
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // X-ray emission (strongest at shock birth)
    const xrayW = xrayEmission(e);
    if (xrayW > 0.01) {
      const rgb = xrayColor();
      const alpha = baseAlpha * xrayW * 0.9 * xrayBoost * modeMult.xray;
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Calculate compression for halos
  const baseSpeed = 0.4 + intensity * 0.8;
  const collimationBoost = 0.4 + pressure * 0.6;
  const speed = baseSpeed * collimationBoost;
  const compression = shockCompression(speed, intensity, pressure);

  for (const tip of jetTips) {
    // Calculate position along jet
    const distance = tip.t * jetLength;
    const dir = tip.dir; // -1 for top, +1 for bottom

    // Apply precession and helix to tip position
    const precX = dir === -1 ? prec.x * sphereRadius : -prec.x * sphereRadius;
    const precY = dir === -1 ? prec.y * sphereRadius : -prec.y * sphereRadius;
    const helixX = dir === -1 ? helix.hx * sphereRadius : -helix.hx * sphereRadius;
    const helixY = dir === -1 ? helix.hy * sphereRadius : -helix.hy * sphereRadius;

    const x = cx + precX + helixX;
    const y = cy + dir * (sphereRadius + distance) + precY + helixY;

    // Relativistic beaming: tips pointing toward camera are brighter
    const beaming = dir === -1 ? topBeaming : botBeaming;
    const beamBoost = 0.5 + beaming.beamingFactor * 0.5;  // 0.5–3.5

    // Tip size: larger when highly collimated
    const radius = 6 + pressure * 4; // 6-10px range

    // Brightness combines intensity, beaming, and life
    const baseBrightness = 0.4 + intensity * 0.4;
    const brightness = Math.min(1, baseBrightness * beamBoost * tip.life);

    // Calculate energy based on tip position
    const tipEnergy = 1 - (distance / jetLength) * 0.7;
    const rgb = synchrotronColor(tipEnergy);

    // Draw bright tip with synchrotron gradient
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(${rgb}, ${brightness})`);
    grad.addColorStop(0.5, `rgba(${rgb}, ${brightness * 0.6})`);
    grad.addColorStop(1, `rgba(${rgb}, 0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw compression halo around tip (punching through space)
    if (compression > 0.3) {
      const halo = 6 + compression * 12;
      ctx.strokeStyle = `rgba(${rgb}, ${0.15 * compression * tip.life})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, halo, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Calculate Mach disk strength (over-pressured jet shock surface)
 * @param {number} jets - Jet intensity (0.0-1.0)
 * @param {number} pressure - Magnetic pressure (0.0-1.0)
 * @returns {number} Mach disk strength (0.0-1.0)
 */
export function machDiskStrength(jets, pressure) {
  // Mach disks only form when jets are over-pressured
  return Math.max(0, jets * 0.7 + pressure * 0.6 - 0.8);
}

/**
 * Update Mach disk positions and spawn turbulence particles
 * @param {number} dt - Delta time since last frame
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} sphereRadius - Sphere radius
 * @param {number} jetLength - Length of jets
 * @param {number} jets - Jet intensity (0.0-1.0)
 * @param {number} pressure - Magnetic pressure (0.0-1.0)
 * @param {number} time - Animation time for precession/helix
 */
export function updateMachDisks(dt, cx, cy, sphereRadius, jetLength, jets, pressure, time) {
  const strength = machDiskStrength(jets, pressure);
  
  if (strength < 0.05) {
    // Clear turbulence when no Mach disk
    machTurbulence = [];
    turbulenceCones = [];
    return;
  }

  // Get current jet direction offsets (precession + helix)
  const prec = jetPrecession(time, jets);
  const helix = jetHelix(time, jets);

  // Mach disk position: halfway down each jet
  const diskDistance = jetLength * 0.55;

  // Top and bottom jet Mach disks
  for (const dir of [-1, 1]) {
    // Apply precession and helix to position
    const precX = dir === -1 ? prec.x * sphereRadius : -prec.x * sphereRadius;
    const precY = dir === -1 ? prec.y * sphereRadius : -prec.y * sphereRadius;
    const helixX = dir === -1 ? helix.hx * sphereRadius : -helix.hx * sphereRadius;
    const helixY = dir === -1 ? helix.hy * sphereRadius : -helix.hy * sphereRadius;

    const diskX = cx + precX + helixX;
    const diskY = cy + dir * (sphereRadius + diskDistance) + precY + helixY;

    // Spawn turbulence particles around disk edge
    if (Math.random() < strength * 0.4) {
      const diskRadius = 12 + strength * 18;
      const angle = Math.random() * Math.PI * 2;
      const edgeDist = diskRadius + Math.random() * 4;

      // Mach disk is at 55% of jet length
      const diskEnergy = 1 - (diskDistance / jetLength) * 0.7;
      
      machTurbulence.push({
        x: diskX + Math.cos(angle) * edgeDist,
        y: diskY + Math.sin(angle) * edgeDist,
        size: 2,
        life: 1,
        strength,
        energy: diskEnergy  // High-energy shock surface
      });
    }

    // Spawn turbulence cones downstream from Mach disk
    if (strength > 0.4 && Math.random() < 0.08) {
      const coneLength = jetLength * (0.25 + strength * 0.35); // 25-60% of jet
      const maxWidth = 18 + strength * 26;                     // 18-44px

      turbulenceCones.push({
        x: diskX,
        y: diskY,
        dir: dir, // -1 for top (upward), +1 for bottom (downward)
        length: coneLength,
        maxWidth,
        strength,
        life: 1,
      });
    }
  }

  // Update turbulence particles
  for (const p of machTurbulence) {
    p.life -= dt * 1.8;
    p.size += dt * 6;
  }

  // Remove dead particles
  machTurbulence = machTurbulence.filter(p => p.life > 0);

  // Update turbulence cones
  for (const c of turbulenceCones) {
    c.life -= dt * 0.7; // cones live ~1.4s
  }

  // Remove dead cones
  turbulenceCones = turbulenceCones.filter(c => c.life > 0);
}

/**
 * Draw Mach disks (bright shock surfaces) inside jets
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} sphereRadius - Sphere radius
 * @param {number} jetLength - Length of jets
 * @param {number} jets - Jet intensity (0.0-1.0)
 * @param {number} pressure - Magnetic pressure (0.0-1.0)
 * @param {number} time - Animation time for precession/helix and pulsing
 */
export function drawMachDisks(ctx, cx, cy, sphereRadius, jetLength, jets, pressure, time) {
  const strength = machDiskStrength(jets, pressure);
  
  if (strength < 0.05) return; // No disk to draw

  // Get current jet direction offsets (precession + helix)
  const prec = jetPrecession(time, jets);
  const helix = jetHelix(time, jets);
  
  // Compute beaming for top and bottom jets
  const topBeaming = relativisticBeaming(-1, prec.x, prec.y);
  const botBeaming = relativisticBeaming(1, prec.x, prec.y);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // Draw turbulence cones first (furthest back)
  for (const cone of turbulenceCones) {
    const spawnCount = 3 + Math.floor(cone.strength * 4); // 3-7 eddies per cone per frame
    const lifeFactor = cone.life; // Cone fades as it ages
    
    // Apply beaming to cone (high-energy turbulence)
    const beaming = cone.dir === -1 ? topBeaming : botBeaming;
    const coneBeamBoost = 0.6 + beaming.beamingFactor * 0.4;  // 0.6–2.8

    for (let i = 0; i < spawnCount; i++) {
      // Random position inside cone
      const t = Math.random(); // Position along cone length (0-1)
      const distance = t * cone.length;
      const widthAtT = cone.maxWidth * t; // Cone widens linearly

      // Random lateral offset within cone width
      const lateralOffset = (Math.random() - 0.5) * widthAtT;

      // Kelvin-Helmholtz ripple modulation at cone entry
      // Cone starts at disk position (dNorm ≈ 0.55), ripples propagate downstream
      const dNorm = 0.55 + t * 0.25;  // Approximate position in jet (0.55-0.8)
      const khRipple = kelvinHelmholtzRipple(dNorm, time, jets, pressure);
      const khModulation = khRipple * 0.3;  // 30% of ripple amplitude

      // Calculate position with KH modulation
      const x = cone.x + lateralOffset + khModulation;
      const y = cone.y + cone.dir * distance;

      // Eddy size: smaller near disk, larger downstream
      const size = 2 + t * 4; // 2-6px range

      // Synchrotron cooling downstream: energy decreases with distance from disk
      // Disk already has cooled energy, cone cools further
      const diskEnergy = 1 - (0.55 * 0.7);  // Energy at disk position (~0.62)
      const eddyEnergy = diskEnergy * (1 - t * 0.5);  // Cool further downstream
      
      const baseAlpha = 0.18 * lifeFactor * (1 - t * 0.3);
      
      // Get observation mode multipliers
      const m = OBSERVATION_MODES[observationMode];
      
      // Band-specific beaming for turbulence cones
      const radioBoost = 0.8 + beaming.beamingFactor * 0.1;
      const opticalBoost = 0.7 + beaming.beamingFactor * 0.3;
      const xrayBoost = 0.6 + beaming.beamingFactor * 0.4;
      
      // Multi-band turbulence cone rendering (radio-dominant with optical)
      
      // Radio emission (strong in turbulent regions)
      const radioW = radioEmission(eddyEnergy);
      if (radioW > 0.01) {
        const rgb = radioColor();
        const alpha = baseAlpha * radioW * 0.6 * radioBoost * m.radio;
        ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size * 1.15, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Optical emission
      const optW = opticalEmission(eddyEnergy);
      if (optW > 0.01) {
        const rgb = opticalColor(eddyEnergy);
        const alpha = baseAlpha * optW * 0.5 * opticalBoost * m.optical;
        ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // X-ray emission (minimal in cooler turbulence)
      const xrayW = xrayEmission(eddyEnergy);
      if (xrayW > 0.01) {
        const rgb = xrayColor();
        const alpha = baseAlpha * xrayW * 0.3 * xrayBoost * m.xray;
        ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Draw turbulence particles (behind disks)
  for (const p of machTurbulence) {
    // Determine which jet this turbulence belongs to
    const dir = p.y < cy ? -1 : 1;
    const beaming = dir === -1 ? topBeaming : botBeaming;
    
    // Get observation mode multipliers
    const m = OBSERVATION_MODES[observationMode];
    
    // Band-specific beaming
    const radioBoost = 0.8 + beaming.beamingFactor * 0.1;
    const opticalBoost = 0.7 + beaming.beamingFactor * 0.3;
    const xrayBoost = 0.6 + beaming.beamingFactor * 0.4;
    
    const e = p.energy;
    const baseAlpha = 0.2 * p.life;
    
    // Multi-band turbulence particle rendering
    
    // Radio emission (dominant)
    const radioW = radioEmission(e);
    if (radioW > 0.01) {
      const rgb = radioColor();
      const alpha = baseAlpha * radioW * 0.6 * radioBoost * m.radio;
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Optical emission
    const optW = opticalEmission(e);
    if (optW > 0.01) {
      const rgb = opticalColor(e);
      const alpha = baseAlpha * optW * 0.5 * opticalBoost * m.optical;
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // X-ray emission (weak)
    const xrayW = xrayEmission(e);
    if (xrayW > 0.01) {
      const rgb = xrayColor();
      const alpha = baseAlpha * xrayW * 0.3 * xrayBoost * m.xray;
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Mach disk position: halfway down each jet
  const diskDistance = jetLength * 0.55;

  // Pulsing effect: subtle high-frequency throb
  const pulse = 1 + Math.sin(time * 6) * 0.1 * strength;

  // Draw Mach disks for top and bottom jets
  for (const dir of [-1, 1]) {
    // Apply precession and helix to position
    const precX = dir === -1 ? prec.x * sphereRadius : -prec.x * sphereRadius;
    const precY = dir === -1 ? prec.y * sphereRadius : -prec.y * sphereRadius;
    const helixX = dir === -1 ? helix.hx * sphereRadius : -helix.hx * sphereRadius;
    const helixY = dir === -1 ? helix.hy * sphereRadius : -helix.hy * sphereRadius;

    const diskX = cx + precX + helixX;
    const diskY = cy + dir * (sphereRadius + diskDistance) + precY + helixY;

    // Disk size: larger when over-pressured
    const baseRadius = 12 + strength * 18; // 12-30px range
    const radius = baseRadius * pulse;
    
    // Apply beaming to disk (high-energy shock surface)
    const beaming = dir === -1 ? topBeaming : botBeaming;
    const diskBeamBoost = 0.5 + beaming.beamingFactor * 0.5;  // 0.5–3.5

    // Disk brightness: increases with strength and beaming
    const baseAlpha = 0.25 + strength * 0.5; // 0.25-0.75 range
    const alpha = baseAlpha * diskBeamBoost;

    // Mach disk energy: high-energy shock surface (blue-white)
    const diskEnergy = 1 - (diskDistance / jetLength) * 0.7;
    const rgb = synchrotronColor(diskEnergy);

    // Draw bright circular Mach disk with synchrotron color
    ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(diskX, diskY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Add subtle plasma core (slightly brighter)
    ctx.fillStyle = `rgba(${rgb}, ${alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(diskX, diskY, radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
