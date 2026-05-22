// Supernova Visual Effects - Timeline-based transformations
import { SupernovaPhase } from "./supernovaEngine.js"

export function applySupernovaEffects(engine, time, base) {
  const { phase, tPhase } = engine
  let { radius, brightness, saturation, halo, opacity, flareActivity } = base

  // CRITICAL: Validate all inputs before ANY calculations
  radius = isNaN(radius) || radius === undefined ? 3 : radius
  brightness = isNaN(brightness) || brightness === undefined ? 1 : brightness
  saturation = isNaN(saturation) || saturation === undefined ? 1 : saturation
  halo = isNaN(halo) || halo === undefined ? 1 : halo
  opacity = isNaN(opacity) || opacity === undefined ? 1 : opacity
  flareActivity = isNaN(flareActivity) || flareActivity === undefined ? 0 : flareActivity

  // Validate engine values
  const safePhase = isNaN(phase) ? SupernovaPhase.Stable : phase
  const safeTPhase = isNaN(tPhase) || tPhase === undefined ? 0 : tPhase

  switch (safePhase) {
    case SupernovaPhase.Overheat: {
      const k = Math.min(1, engine.instability)
      brightness *= 1 + k * 0.8
      saturation *= 1 - k * 0.2
      break
    }

    case SupernovaPhase.Collapse: {
      const c = Math.min(1, safeTPhase / 0.8)
      radius *= Math.max(0.3, 1 - c * 0.7) // Never shrink below 30%
      brightness *= 1 + c * 4
      saturation *= 1 - c
      halo *= Math.max(0.5, 1 - c * 0.5) // Never shrink below 50%
      break
    }

    case SupernovaPhase.Flash: {
      const f = Math.min(1, safeTPhase / 0.4)
      brightness *= 3 + f * 2
      halo *= 2 + f * 3
      saturation *= 0.2
      flareActivity = 1
      break
    }

    case SupernovaPhase.Shockwave: {
      const t = safeTPhase
      const shock = Math.sin(t * 8) * Math.exp(-t * 2)
      halo *= 1 + shock * 3
      brightness *= 1 + shock * 2
      flareActivity = Math.max(flareActivity, 0.7)
      break
    }

    case SupernovaPhase.Envelope: {
      const e = Math.min(1, safeTPhase / 2)
      opacity *= Math.exp(-e * 2)
      halo *= 1 - e * 0.7
      flareActivity *= 1 - e
      break
    }

    case SupernovaPhase.WhiteDwarf: {
      radius *= 0.3
      brightness *= 3
      saturation = 0
      halo *= 0.2
      opacity = 1
      flareActivity = 0
      break
    }

    default:
      break
  }

  // CRITICAL: Final validation before returning - ensure NO NaN values escape
  radius = isNaN(radius) ? 3 : Math.max(0.1, Math.min(200, radius))
  brightness = isNaN(brightness) ? 1 : Math.max(0.1, Math.min(10, brightness))
  saturation = isNaN(saturation) ? 1 : Math.max(0, Math.min(1, saturation))
  halo = isNaN(halo) ? 1 : Math.max(0.1, Math.min(10, halo))
  opacity = isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity))
  flareActivity = isNaN(flareActivity) ? 0 : Math.max(0, Math.min(1, flareActivity))

  return { radius, brightness, saturation, halo, opacity, flareActivity }
}

export function whiteDwarfColor() {
  // Hot blue-white remnant
  return "rgba(230, 240, 255, 1)"
}

export function getPhaseLabel(phase) {
  const labels = {
    [SupernovaPhase.Stable]: "Stable",
    [SupernovaPhase.Overheat]: "Overheating",
    [SupernovaPhase.Collapse]: "Core Collapse",
    [SupernovaPhase.Flash]: "Supernova Flash",
    [SupernovaPhase.Shockwave]: "Shockwave",
    [SupernovaPhase.Envelope]: "Envelope Ejection",
    [SupernovaPhase.WhiteDwarf]: "White Dwarf",
  }
  return labels[phase] || phase
}
