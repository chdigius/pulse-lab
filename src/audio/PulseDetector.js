// PulseDetector
// Lightweight bass-derived transient detector.
// Fast attack, controlled decay, refractory period to prevent strobing.

const DEFAULT_CONFIG = {
  baselineRelease: 0.02,
  triggerMultiplier: 1.35,
  triggerMinimum: 0.18,
  attack: 0.85,
  decay: 0.06,
  refractoryMs: 140
}

export class PulseDetector {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.baseline = 0
    this.value = 0
    this.isFiring = false
    this._lastFiredAt = -Infinity
  }

  update(dt, bass, nowMs) {
    const t = nowMs ?? performance.now()
    const cfg = this.config

    this.baseline = this.baseline + (bass - this.baseline) * cfg.baselineRelease

    const threshold = Math.max(cfg.triggerMinimum, this.baseline * cfg.triggerMultiplier)
    const canFire = (t - this._lastFiredAt) >= cfg.refractoryMs
    const fires = canFire && bass >= threshold && bass > this.value

    this.isFiring = fires
    if (fires) {
      this.value = this.value + (bass - this.value) * cfg.attack
      this._lastFiredAt = t
    } else {
      this.value = Math.max(0, this.value - cfg.decay)
    }
  }
}
