// ------------------------------------------------------------
// 9D Hypercube Color Map Module
// ------------------------------------------------------------

// 1. Dimension-coded neon palette (9 dimensions)
export const DIMENSION_COLORS = [
  "#FF3B30", // 0 red
  "#FF9500", // 1 orange
  "#FFCC00", // 2 gold
  "#4CD964", // 3 green
  "#5AC8FA", // 4 sky blue
  "#007AFF", // 5 blue
  "#5856D6", // 6 indigo
  "#AF52DE", // 7 violet
  "#FF2D55"  // 8 pink
]

// 2. Hamming-layer gradient (0 → 9) - warmer core
export function hammingGradient(layer) {
  const t = layer / 9
  const r = Math.round(40 + t * 215)
  const g = Math.round(30 + t * 140)
  const b = Math.round(80 + t * 40)
  return `rgb(${r}, ${g}, ${b})`
}

// 2b. Bloom intensity by Hamming layer (peaks at center)
export function hammingBloomIntensity(layer) {
  // 0..9 → 0.2..1.0, peaking in the middle
  const t = layer / 9
  const centerBoost = 1 - Math.abs(t - 0.5) * 2 // 0 at edges, 1 at center
  return 0.2 + centerBoost * 0.8
}

// 2c. Stellar gradient (deep blue → purple → magenta → orange → white-hot)
export function stellarGradient(layer) {
  const t = layer / 9

  // Outer layers: deep blue → purple
  if (t < 0.3) {
    const r = Math.round(30 + t * 40)
    const g = Math.round(40 + t * 20)
    const b = Math.round(120 + t * 80)
    return `rgb(${r}, ${g}, ${b})`
  }

  // Mid layers: purple → magenta → orange
  if (t < 0.7) {
    const r = Math.round(80 + (t - 0.3) * 400)
    const g = Math.round(20 + (t - 0.3) * 200)
    const b = Math.round(150 - (t - 0.3) * 150)
    return `rgb(${r}, ${g}, ${b})`
  }

  // Core: orange → gold → white-hot
  const r = Math.round(200 + (t - 0.7) * 200)
  const g = Math.round(120 + (t - 0.7) * 200)
  const b = Math.round(40 + (t - 0.7) * 100)
  return `rgb(${r}, ${g}, ${b})`
}

// 2d. Stellar bloom (Gaussian peak at center)
export function stellarBloom(layer) {
  const t = layer / 9
  const diff = t - 0.5
  return 0.3 + Math.exp(-(diff ** 2) * 12) // Gaussian peak at center
}

// 3. Depth shading (z ∈ [-1, 1])
export function depthShade(baseColor, z) {
  const factor = 0.4 + (z + 1) * 0.3
  return applyBrightness(baseColor, factor)
}

// 3b. Depth-heat modulation (closer = hotter)
export function depthHeat(z) {
  // z is in [-1, 1]
  // map to [0.7, 1.3]
  return 0.7 + (z + 1) * 0.3
}

// 4. Energy mode (pulse intensity)
export function energyColor(baseColor, energy) {
  const factor = 1 + energy * 0.8
  return applyBrightness(baseColor, factor)
}

// 5. Utility: brighten/darken any hex color
export function applyBrightness(hex, factor) {
  const c = hex.replace("#", "")
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)

  const nr = Math.min(255, Math.round(r * factor))
  const ng = Math.min(255, Math.round(g * factor))
  const nb = Math.min(255, Math.round(b * factor))

  return `rgb(${nr}, ${ng}, ${nb})`
}

// ------------------------------------------------------------
// Unified Color API
// ------------------------------------------------------------

export function getVertexColor({
  vertex,
  hammingLayer,
  dimension,
  zDepth,
  energy = 0,
  mode = "dimension"
}) {
  let base

  switch (mode) {
    case "dimension":
      base = DIMENSION_COLORS[dimension]
      break

    case "hamming":
      base = hammingGradient(hammingLayer)
      break

    case "depth":
      base = "#00E5FF"
      base = depthShade(base, zDepth)
      break

    case "energy":
      base = DIMENSION_COLORS[dimension]
      base = energyColor(base, energy)
      break

    case "hybrid":
      base = hammingGradient(hammingLayer)
      base = depthShade(base, zDepth)
      base = energyColor(base, energy)
      break

    case "stellar":
      base = stellarGradient(hammingLayer)
      break

    default:
      base = "#FFFFFF"
  }

  return base
}
