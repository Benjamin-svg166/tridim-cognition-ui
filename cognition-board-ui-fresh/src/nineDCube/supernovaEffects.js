// Supernova Visual Effects - Timeline-based transformations
import { SupernovaPhase } from "./supernovaEngine.js"

export function applySupernovaEffects(engine, time, base) {
  const { phase, tPhase } = engine
  let { radius, brightness, saturation, halo, opacity, flareActivity } = base

  switch (phase) {
    case SupernovaPhase.Overheat: {
      const k = Math.min(1, engine.instability)
      brightness *= 1 + k * 0.8
      saturation *= 1 - k * 0.2
      break
    }

    case SupernovaPhase.Collapse: {
      const c = Math.min(1, tPhase / 0.8)
      radius *= Math.max(0.3, 1 - c * 0.7) // Never shrink below 30%
      brightness *= 1 + c * 4
      saturation *= 1 - c
      halo *= Math.max(0.5, 1 - c * 0.5) // Never shrink below 50%
      break
    }

    case SupernovaPhase.Flash: {
      const f = Math.min(1, tPhase / 0.4)
      brightness *= 3 + f * 2
      halo *= 2 + f * 3
      saturation *= 0.2
      flareActivity = 1
      break
    }

    case SupernovaPhase.Shockwave: {
      const t = tPhase
      const shock = Math.sin(t * 8) * Math.exp(-t * 2)
      halo *= 1 + shock * 3
      brightness *= 1 + shock * 2
      flareActivity = Math.max(flareActivity, 0.7)
      break
    }

    case SupernovaPhase.Envelope: {
      const e = Math.min(1, tPhase / 2)
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
