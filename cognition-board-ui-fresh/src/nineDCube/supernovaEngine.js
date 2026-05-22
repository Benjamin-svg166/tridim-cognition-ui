// Supernova Engine - Stellar Lifecycle State Machine
export const SupernovaPhase = {
  Stable: "stable",
  Overheat: "overheat",
  Collapse: "collapse",
  Flash: "flash",
  Shockwave: "shockwave",
  Envelope: "envelope",
  WhiteDwarf: "white_dwarf",
}

export class SupernovaEngine {
  constructor() {
    this.phase = SupernovaPhase.Stable
    this.instability = 0
    this.tPhase = 0
  }

  trigger() {
    if (this.phase === SupernovaPhase.Stable) {
      this.phase = SupernovaPhase.Overheat;
      this.tPhase = 0;
      this.instability = 0;
    } else if (this.phase === SupernovaPhase.Overheat) {
      // Fast-forward: immediately trigger collapse
      this.instability = 1.0;
    }
  }

  update(dt, coreTemperature) {
    this.tPhase += dt

    switch (this.phase) {
      case SupernovaPhase.Overheat: {
        if (coreTemperature > 2.0) {
          this.instability += (coreTemperature - 2.0) * dt * 0.8
        }
        if (this.instability >= 1) {
          this.phase = SupernovaPhase.Collapse
          this.tPhase = 0
        }
        break
      }

      case SupernovaPhase.Collapse: {
        if (this.tPhase > 0.8) {
          this.phase = SupernovaPhase.Flash
          this.tPhase = 0
        }
        break
      }

      case SupernovaPhase.Flash: {
        if (this.tPhase > 0.4) {
          this.phase = SupernovaPhase.Shockwave
          this.tPhase = 0
        }
        break
      }

      case SupernovaPhase.Shockwave: {
        if (this.tPhase > 1.2) {
          this.phase = SupernovaPhase.Envelope
          this.tPhase = 0
        }
        break
      }

      case SupernovaPhase.Envelope: {
        if (this.tPhase > 2.0) {
          this.phase = SupernovaPhase.WhiteDwarf
          this.tPhase = 0
        }
        break
      }

      case SupernovaPhase.WhiteDwarf:
      case SupernovaPhase.Stable:
      default:
        break
    }
  }
}
