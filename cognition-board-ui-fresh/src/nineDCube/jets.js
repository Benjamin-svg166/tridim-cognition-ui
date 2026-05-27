// Polar Jets: Collimated Magnetic Beams
// Appear during high-energy phases (overheat, collapse, flash)

// Particle system for jet streams
const jetParticles = [];

// Shock knots (bright pulses in jets)
const jetKnots = [];

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
 */
export function drawPolarJets(ctx, cx, cy, radius, intensity, time) {
  const length = radius * (2 + intensity * 4);
  const width = radius * (0.1 + intensity * 0.2);

  const pulse = 0.6 + Math.sin(time * 4) * 0.4;
  const alpha = 0.25 + intensity * 0.5;

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

  // --- TOP JET ---
  const gradTop = ctx.createLinearGradient(
    topX, 
    cy - radius + topOffsetY, 
    topX, 
    cy - length + topOffsetY
  );
  gradTop.addColorStop(0, `rgba(180,220,255,${alpha})`);
  gradTop.addColorStop(1, `rgba(180,220,255,0)`);

  ctx.fillStyle = gradTop;
  ctx.beginPath();
  ctx.ellipse(
    topX, 
    topY, 
    width * pulse, 
    length / 2, 
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // --- BOTTOM JET ---
  const gradBot = ctx.createLinearGradient(
    botX, 
    cy + radius + botOffsetY, 
    botX, 
    cy + length + botOffsetY
  );
  gradBot.addColorStop(0, `rgba(180,220,255,${alpha})`);
  gradBot.addColorStop(1, `rgba(180,220,255,0)`);

  ctx.fillStyle = gradBot;
  ctx.beginPath();
  ctx.ellipse(
    botX, 
    botY, 
    width * pulse, 
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
 * @returns {{x: number, y: number}} Offset in X and Y directions
 */
export function jetPrecession(time, intensity) {
  const wobble = 0.15 * intensity; // max tilt ~8.5 degrees
  return {
    x: Math.sin(time * 0.3) * wobble,
    y: Math.cos(time * 0.25) * wobble
  };
}

/**
 * Calculate helical offset for magnetic corkscrew jets
 * @param {number} time - Animation time in seconds
 * @param {number} intensity - Jet intensity (0.0-1.0)
 * @returns {{hx: number, hy: number}} Helix offset in X and Y
 */
export function jetHelix(time, intensity) {
  const radius = 0.15 * intensity;   // how wide the corkscrew is (realistic protostar)
  const speed = 2.0 + Math.sin(time * 0.4) * 2.0; // breathing twist - accelerates and slows

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

  // TOP jet
  if (Math.random() < spawnRate) {
    jetParticles.push({
      x: cx + helix.hx * radius,
      y: cy - radius + helix.hy * radius,
      speed: 6 + intensity * 10,   // Recommended: fast, energetic
      life: 1,
      dir: -1,                     // upward
      coreTemperature,
      helixX: helix.hx * radius,   // Store initial helix offset for widening
      helixY: helix.hy * radius
    });
  }

  // BOTTOM jet
  if (Math.random() < spawnRate) {
    jetParticles.push({
      x: cx - helix.hx * radius,
      y: cy + radius - helix.hy * radius,
      speed: 6 + intensity * 10,
      life: 1,
      dir: 1,                      // downward
      coreTemperature,
      helixX: -helix.hx * radius,  // Store initial helix offset for widening
      helixY: -helix.hy * radius
    });
  }
}

/**
 * Update and draw jet particles
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} dt - Delta time since last frame
 */
export function updateJetParticles(ctx, dt) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  
  for (let p of jetParticles) {
    // Motion along jet axis
    p.y += p.speed * p.dir;

    // Widening spiral: particles drift laterally outward
    const age = 1 - p.life; // 0 at birth, 1 at death
    const spiralFactor = 1 + age * 2; // Grows from 1 to 3
    p.x += p.helixX * spiralFactor * dt * 0.5;

    // Recommended: slower decay for long streaks
    p.life -= dt * 0.25;

    // Temperature-tinted plasma color
    const r = 200 + p.coreTemperature * 30;
    const g = 220;
    const b = 255 - p.coreTemperature * 40;

    ctx.fillStyle = `rgba(${r},${g},${b},${p.life})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

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
 */
export function drawAccretionDisk(ctx, cx, cy, radius, intensity, time) {
  const inner = radius * 1.1;
  const outer = radius * (2.0 + intensity * 1.5);
  const rotation = time * 0.4;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  const grad = ctx.createRadialGradient(0, 0, inner, 0, 0, outer);
  grad.addColorStop(0, `rgba(255,180,120,${0.2 * intensity})`);
  grad.addColorStop(0.5, `rgba(255,140,80,${0.3 * intensity})`);
  grad.addColorStop(1, "rgba(255,100,50,0)");

  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, outer, outer * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Calculate relativistic beaming boost (angle-dependent brightness)
 * Jets pointed toward camera appear brighter
 * @param {number} tiltX - X tilt from precession
 * @param {number} tiltY - Y tilt from precession
 * @returns {number} Gamma boost factor (0.5-1.0)
 */
export function relativisticBeaming(tiltX, tiltY) {
  // View direction is (0, 0, -1); we approximate with Y tilt only
  const align = 1 - Math.abs(tiltY); // 1 = aligned, 0 = sideways
  const gammaBoost = 0.5 + align * 0.5; // 0.5–1.0
  return gammaBoost;
}

/**
 * Spawn shock knots (bright pulses traveling along jets)
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} radius - Sphere radius
 * @param {number} intensity - Jet intensity (0.0-1.0)
 * @param {number} time - Animation time in seconds
 */
export function spawnJetKnots(cx, cy, radius, intensity, time) {
  // Apply magnetic corkscrew helix
  const helix = jetHelix(time, intensity);

  // Top jet knots
  if (Math.random() < 0.1 * intensity) {
    jetKnots.push({
      x: cx + helix.hx * radius,
      y: cy - radius + helix.hy * radius,
      dir: -1,
      t: 0,
      speed: 3 + intensity * 6,
      helixX: helix.hx * radius,   // Store initial helix offset for widening
      helixY: helix.hy * radius
    });
  }
  
  // Bottom jet knots
  if (Math.random() < 0.1 * intensity) {
    jetKnots.push({
      x: cx - helix.hx * radius,
      y: cy + radius - helix.hy * radius,
      dir: 1,
      t: 0,
      speed: 3 + intensity * 6,
      helixX: -helix.hx * radius,  // Store initial helix offset for widening
      helixY: -helix.hy * radius
    });
  }
}

/**
 * Update and draw shock knots
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} dt - Delta time since last frame
 * @param {Object} colorBase - Base color {r, g, b}
 */
export function updateJetKnots(ctx, dt, colorBase = { r: 200, g: 230, b: 255 }) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  
  for (let k of jetKnots) {
    k.t += dt;
    
    // Motion along jet axis
    k.y += k.speed * k.dir;

    // Widening spiral: knots drift laterally outward
    const spiralFactor = 1 + k.t * 0.5; // Grows over time
    k.x += k.helixX * spiralFactor * dt * 0.3;

    const life = Math.max(0, 1 - k.t * 0.4); // fade over time
    const radius = 4 + k.t * 3;

    ctx.fillStyle = `rgba(${colorBase.r},${colorBase.g},${colorBase.b},${life})`;
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
