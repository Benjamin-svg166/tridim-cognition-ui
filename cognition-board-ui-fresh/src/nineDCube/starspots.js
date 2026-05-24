// Starspots: Dark Magnetic Regions
// Procedurally generated sunspot-like features on stellar surface

/**
 * Generate starspot with penumbra (dark core + lighter ring)
 * Real sunspots have a dark umbra and lighter penumbra
 * @param {number} nx - Surface normal X (-1 to 1)
 * @param {number} ny - Surface normal Y (-1 to 1)
 * @param {number} nz - Surface normal Z (-1 to 1)
 * @param {number} time - Animation time in seconds
 * @param {number} flareActivity - Flare intensity 0-1
 * @returns {Object} {umbra: 0-1, penumbra: 0-1}
 */
export function starspotPenumbra(nx, ny, nz, time, flareActivity) {
  const lat = Math.asin(ny);
  const lon = Math.atan2(nz, nx) + time * 0.05;

  const seed =
    Math.sin(lon * 2.0 + lat * 3.0) +
    Math.sin(lon * 1.3 - lat * 4.0) +
    Math.sin(lon * 2.7 + lat * 2.2);

  let s = Math.abs(seed / 3);

  // Umbra (dark core) - very sharp
  const umbra = Math.pow(s, 8);

  // Penumbra (lighter ring) - softer
  const penumbra = Math.pow(s, 4);

  const flareBoost = 1 + flareActivity * 1.5;

  return {
    umbra: umbra * flareBoost,
    penumbra: penumbra * flareBoost,
  };
}

/**
 * Starspot latitude bias (magnetic activity bands)
 * Spots cluster around ±30° latitude like real stars
 * @param {number} ny - Surface normal Y (-1 to 1)
 * @returns {number} Latitude band strength 0-1
 */
export function starspotLatitudeBias(ny) {
  const lat = Math.asin(ny);
  const band = Math.exp(-((lat - 0.5) ** 2) * 6) +
               Math.exp(-((lat + 0.5) ** 2) * 6);
  return band; // 0-1
}

/**
 * Starspot lifecycle (growth, drift, decay)
 * Spots evolve over time: appear, grow, fade, vanish
 * @param {number} time - Animation time in seconds
 * @returns {number} Lifecycle phase 0-1 (smooth rise/fall)
 */
export function starspotLifecycle(time) {
  const cycle = (Math.sin(time * 0.05) + 1) / 2; // 0-1
  const growth = Math.pow(cycle, 2);
  const decay = 1 - Math.pow(1 - cycle, 2);
  return growth * decay; // smooth rise/fall
}

/**
 * Flare generation from magnetic reconnection
 * Flares erupt at boundaries between strong magnetic regions
 * @param {number} umbra - Umbra intensity 0-1
 * @param {number} penumbra - Penumbra intensity 0-1
 * @param {number} flareActivity - Current flare activity 0-1
 * @returns {number} Boosted flare activity 0-1
 */
export function flareFromSpots(umbra, penumbra, flareActivity) {
  const magneticStress = penumbra * 0.6 + umbra * 1.2;
  return Math.min(1, flareActivity + magneticStress * 0.5);
}

/**
 * Polar spot bias (dramatic stylized mode)
 * Hotter stars have massive polar spots
 * @param {number} ny - Surface normal Y (-1 to 1)
 * @returns {number} Polar strength 0-1
 */
export function polarSpotBias(ny) {
  const pole = Math.abs(ny);
  return Math.pow(pole, 4); // strong at poles
}

/**
 * Legacy function - kept for backwards compatibility
 * @deprecated Use starspotPenumbra instead
 */
export function starspotMask(nx, ny, nz, time, flareActivity) {
  const { umbra, penumbra } = starspotPenumbra(nx, ny, nz, time, flareActivity);
  return penumbra * 0.4 + umbra * 0.6;
}

/**
 * Calculate average starspot darkening for a sphere
 * Samples multiple points on the visible hemisphere
 * @param {number} time - Animation time in seconds
 * @param {number} flareActivity - Flare intensity 0-1
 * @returns {number} Darkening factor 0-1 (1 = no darkening, 0 = full dark)
 */
export function averageStarspotDarkening(time, flareActivity) {
  // Sample key points around the visible hemisphere
  const samples = [
    { nx: 0, ny: 0, nz: 1 },      // Center facing viewer
    { nx: 0.7, ny: 0, nz: 0.7 },  // Right
    { nx: -0.7, ny: 0, nz: 0.7 }, // Left
    { nx: 0, ny: 0.7, nz: 0.7 },  // Top
    { nx: 0, ny: -0.7, nz: 0.7 }, // Bottom
  ];

  let totalSpot = 0;
  samples.forEach(({ nx, ny, nz }) => {
    totalSpot += starspotMask(nx, ny, nz, time, flareActivity);
  });

  const avgSpot = totalSpot / samples.length;

  // Convert spot intensity to darkening factor
  // Spots reduce brightness by up to 60%
  const spotDarkening = 1 - avgSpot * 0.6;

  return spotDarkening;
}

/**
 * Generate starspot positions on the visible hemisphere with penumbra
 * @param {number} time - Animation time in seconds
 * @param {number} flareActivity - Flare intensity 0-1
 * @param {number} radius - Sphere radius
 * @returns {Array} Array of spot objects with {x, y, sizeUmbra, sizePenumbra, intensity}
 */
export function generateStarspots(time, flareActivity, radius) {
  const spots = [];
  const lifecycle = starspotLifecycle(time);
  
  // Sample grid across visible hemisphere
  for (let lat = -0.9; lat <= 0.9; lat += 0.25) {
    for (let lon = -0.9; lon <= 0.9; lon += 0.25) {
      // Convert lat/lon to 3D normal (approximate visible hemisphere)
      const lonAngle = lon * Math.PI / 2;
      const latAngle = lat * Math.PI / 3;
      
      const nx = Math.cos(latAngle) * Math.sin(lonAngle);
      const ny = Math.sin(latAngle);
      const nz = Math.cos(latAngle) * Math.cos(lonAngle);
      
      // Only visible if facing viewer (nz > 0)
      if (nz > 0.2) {
        const { umbra, penumbra } = starspotPenumbra(nx, ny, nz, time, flareActivity);
        const latBias = starspotLatitudeBias(ny);
        const polarBias = polarSpotBias(ny);
        
        // Combined spot intensity
        const spotIntensity = (penumbra * 0.4 + umbra * 0.6) * (1 + latBias * 0.5 + polarBias * 0.8) * lifecycle;
        
        // Only draw if intensity is significant
        if (spotIntensity > 0.35) {
          // Project to 2D screen coordinates
          const x = nx * radius * 0.95;
          const y = -ny * radius * 0.95; // Flip Y for screen coords
          
          // Size based on intensity and features
          const baseSize = radius * 0.09;
          const umbraSize = baseSize * (0.3 + umbra * 0.6) * (1 + flareActivity * 0.4) * lifecycle;
          const penumbraSize = umbraSize * 2.5; // Penumbra is larger
          
          spots.push({
            x,
            y,
            sizeUmbra: umbraSize,
            sizePenumbra: penumbraSize,
            umbra,
            penumbra,
            intensity: spotIntensity,
          });
        }
      }
    }
  }
  
  return spots;
}

/**
 * Draw starspots with penumbra on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} radius - Sphere radius
 * @param {number} time - Animation time in seconds
 * @param {number} flareActivity - Flare activity level (0.0-1.0)
 */
export function drawStarspots(ctx, cx, cy, radius, time, flareActivity) {
  const spots = generateStarspots(time, flareActivity, radius);
  
  ctx.save();
  
  spots.forEach(spot => {
    const screenX = cx + spot.x;
    const screenY = cy + spot.y;
    
    // Draw penumbra (lighter ring)
    const penumbraGrad = ctx.createRadialGradient(
      screenX, screenY, 0,
      screenX, screenY, spot.sizePenumbra
    );
    
    const penumbraDark = 0.3 + spot.penumbra * 0.3; // 0.3 to 0.6 alpha
    penumbraGrad.addColorStop(0, `rgba(0, 0, 0, ${penumbraDark})`);
    penumbraGrad.addColorStop(0.5, `rgba(0, 0, 0, ${penumbraDark * 0.6})`);
    penumbraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = penumbraGrad;
    ctx.beginPath();
    ctx.arc(screenX, screenY, spot.sizePenumbra, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw umbra (dark core)
    const umbraGrad = ctx.createRadialGradient(
      screenX, screenY, 0,
      screenX, screenY, spot.sizeUmbra
    );
    
    const umbraDark = 0.5 + spot.umbra * 0.4; // 0.5 to 0.9 alpha
    umbraGrad.addColorStop(0, `rgba(0, 0, 0, ${umbraDark})`);
    umbraGrad.addColorStop(0.7, `rgba(0, 0, 0, ${umbraDark * 0.7})`);
    umbraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = umbraGrad;
    ctx.beginPath();
    ctx.arc(screenX, screenY, spot.sizeUmbra, 0, Math.PI * 2);
    ctx.fill();
  });
  
  ctx.restore();
}
