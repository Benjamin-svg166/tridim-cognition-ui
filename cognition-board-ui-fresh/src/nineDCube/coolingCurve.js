// White Dwarf Cooling Curve
// Simulates gradual cooling and color shift of white dwarf remnant

/**
 * Calculate white dwarf cooling effects over time
 * @param {number} tSinceWhiteDwarf - Time in seconds since entering white dwarf phase
 * @returns {Object} { brightnessFactor, blueShift, color }
 */
export function whiteDwarfCooling(tSinceWhiteDwarf) {
  // Cooling over 60 seconds (adjustable)
  const k = Math.min(1, tSinceWhiteDwarf / 60);
  
  // Gradually dim to 30% of initial brightness
  const brightnessFactor = 1 - k * 0.7;
  
  // Color shift from blue-white to warmer white
  const blueShift = 1 - k * 0.4;
  
  // Generate color: starts blue-white (230,240,255), ends warmer white (250,240,153)
  const base = 230;
  const r = Math.round(base + (1 - blueShift) * 20);
  const g = Math.round(base + (1 - blueShift) * 10);
  const b = Math.round(base * blueShift);
  
  const color = `rgba(${r},${g},${b},1)`;
  
  return { brightnessFactor, blueShift, color };
}
