// Polar Jets: Collimated Magnetic Beams
// Appear during high-energy phases (overheat, collapse, flash)

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

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // --- TOP JET ---
  const gradTop = ctx.createLinearGradient(cx, cy - radius, cx, cy - length);
  gradTop.addColorStop(0, `rgba(180,220,255,${alpha})`);
  gradTop.addColorStop(1, `rgba(180,220,255,0)`);

  ctx.fillStyle = gradTop;
  ctx.beginPath();
  ctx.ellipse(cx, cy - length / 2, width * pulse, length / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- BOTTOM JET ---
  const gradBot = ctx.createLinearGradient(cx, cy + radius, cx, cy + length);
  gradBot.addColorStop(0, `rgba(180,220,255,${alpha})`);
  gradBot.addColorStop(1, `rgba(180,220,255,0)`);

  ctx.fillStyle = gradBot;
  ctx.beginPath();
  ctx.ellipse(cx, cy + length / 2, width * pulse, length / 2, 0, 0, Math.PI * 2);
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
