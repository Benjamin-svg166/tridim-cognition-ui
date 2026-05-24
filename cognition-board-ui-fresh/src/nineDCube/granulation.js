// Surface Granulation (Convection Cells)
// Creates noisy brightness pattern on sphere surface

/**
 * Calculate granulation intensity for surface convection cells
 * @param {number} u - Normalized X coordinate (-1 to 1)
 * @param {number} v - Normalized Y coordinate (-1 to 1)
 * @param {number} time - Time in seconds
 * @returns {number} Brightness multiplier (0.7 to 1.3)
 */
export function granulationIntensity(u, v, time) {
  // u, v in [-1, 1] from sphere normal (x, y)
  const scale = 6;
  const t = time * 0.15;

  const n =
    Math.sin((u * scale) + t) *
    Math.sin((v * scale * 1.3) - t * 0.7);

  // map from [-1,1] → [0.7, 1.3]
  return 1 + n * 0.3;
}
