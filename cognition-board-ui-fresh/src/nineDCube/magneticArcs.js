// Magnetic Field Arc Visualization
// Draws curved magnetic field lines around stellar surface

/**
 * Draw magnetic field arcs around the sphere
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} radius - Sphere radius
 * @param {number} flareActivity - Flare activity level (0.0-1.0)
 * @param {number} time - Time in seconds
 * @param {number} spotIntensity - Starspot intensity (0.0-1.0, optional)
 */
export function drawMagneticArcs(ctx, cx, cy, radius, flareActivity, time, spotIntensity = 0) {
  const count = 6;
  
  ctx.save();
  
  for (let i = 0; i < count; i++) {
    const phase = (i / count) * Math.PI * 2 + time * 0.1;
    const tilt = Math.sin(phase) * 0.6;

    ctx.beginPath();
    const steps = 32;
    for (let s = 0; s <= steps; s++) {
      const t = (s / steps) * Math.PI;
      const x = cx + Math.cos(t) * radius * Math.cos(tilt);
      const y = cy + Math.sin(t) * radius;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    // Arcs brighten near active spot regions (magnetic field interaction)
    const arcIntensity = flareActivity * 0.5 + spotIntensity * 0.3;
    const alpha = 0.15 + arcIntensity * 0.4;
    ctx.strokeStyle = `rgba(120,200,255,${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  ctx.restore();
}
