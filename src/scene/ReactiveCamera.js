// ReactiveCamera
// Applies visual feedback on top of a base camera: steering position (cross-section),
// steering lean, boost FOV lift, and pulse-driven shake.
// Never alters forward direction; the world flows toward -Z past the camera.

const DEFAULTS = {
  baseFOV: 75,
  boostFOVGain: 12,
  leanMax: 0.22,
  shakeDecay: 4.5,
  shakeAmount: 0.35,
  steeringSpeed: 7,
  returnSpeed: 3,
  lookMax: 0.08
}

export class ReactiveCamera {
  constructor({ camera, config = {} }) {
    this.camera = camera
    this.config = { ...DEFAULTS, ...config }

    this.posX = 0
    this.posY = 0
    this.targetX = 0
    this.targetY = 0
    this.lean = 0
    this.targetLean = 0
    this.fov = this.config.baseFOV
    this.boost = 0
    this._shakeX = 0
    this._shakeY = 0
    this._lookX = 0
    this._lookY = 0

    this.camera.fov = this.fov
    this.camera.updateProjectionMatrix()
  }

  setSteering(x, y, boundsRadius) {
    const r = Math.max(0.5, boundsRadius * 0.55)
    this.targetX = Math.max(-r, Math.min(r, x * r))
    this.targetY = Math.max(-r, Math.min(r, y * r))
    this.targetLean = -x * this.config.leanMax
  }

  setLook(dx, dy) {
    const m = this.config.lookMax
    this._lookX = Math.max(-m, Math.min(m, this._lookX + dx))
    this._lookY = Math.max(-m, Math.min(m, this._lookY + dy))
  }

  setBoost(amount) {
    this.boost = Math.max(0, Math.min(1, amount))
  }

  addShake(intensity) {
    const a = this.config.shakeAmount * intensity
    this._shakeX += (Math.random() - 0.5) * a
    this._shakeY += (Math.random() - 0.5) * a
  }

  update(dt) {
    const cfg = this.config

    // Smooth steering to target.
    const sx = cfg.steeringSpeed * dt
    this.posX += (this.targetX - this.posX) * Math.min(1, sx)
    this.posY += (this.targetY - this.posY) * Math.min(1, sx)
    this.lean += (this.targetLean - this.lean) * Math.min(1, sx)

    // Decay shake and look offset.
    const decay = Math.exp(-cfg.shakeDecay * dt)
    this._shakeX *= decay
    this._shakeY *= decay
    this._lookX += (0 - this._lookX) * Math.min(1, cfg.returnSpeed * dt * 0.3)
    this._lookY += (0 - this._lookY) * Math.min(1, cfg.returnSpeed * dt * 0.3)

    // FOV lift.
    const targetFov = cfg.baseFOV + this.boost * cfg.boostFOVGain
    this.fov += (targetFov - this.fov) * Math.min(1, 4 * dt)
    this.camera.fov = this.fov
    this.camera.updateProjectionMatrix()

    // Apply transform.
    this.camera.position.x = this.posX + this._shakeX
    this.camera.position.y = this.posY + this._shakeY
    this.camera.position.z = 0

    this.camera.rotation.x = this._lookY
    this.camera.rotation.y = this._lookX
    this.camera.rotation.z = this.lean
  }
}
