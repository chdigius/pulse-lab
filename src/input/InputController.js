// InputController
// Keyboard for steering + boost. Mouse for light look-around. Pointer lock optional.
// Exposes normalized intent only; does not touch the scene.

const STEER_KEYS = {
  ArrowLeft: { axis: 'x', sign: -1 },
  ArrowRight: { axis: 'x', sign: 1 },
  ArrowUp: { axis: 'y', sign: 1 },
  ArrowDown: { axis: 'y', sign: -1 },
  KeyA: { axis: 'x', sign: -1 },
  KeyD: { axis: 'x', sign: 1 },
  KeyW: { axis: 'y', sign: 1 },
  KeyS: { axis: 'y', sign: -1 },
  KeyQ: { axis: 'y', sign: -1 },
  KeyE: { axis: 'y', sign: 1 },
  KeyR: { axis: 'y', sign: 1 },
  KeyF: { axis: 'y', sign: -1 }
}

export class InputController {
  constructor({ element, onPauseToggle }) {
    this.element = element
    this._onPauseToggle = onPauseToggle || (() => {})

    this.steering = { x: 0, y: 0 }
    this.boost = 0
    this.lookDelta = { x: 0, y: 0 }
    this.pointerLocked = false

    this._down = new Set()
    this._attached = false

    this._onKeyDown = this._onKeyDown.bind(this)
    this._onKeyUp = this._onKeyUp.bind(this)
    this._onMouseMove = this._onMouseMove.bind(this)
    this._onPointerLockChange = this._onPointerLockChange.bind(this)
    this._onClick = this._onClick.bind(this)
  }

  attach() {
    if (this._attached) return
    window.addEventListener('keydown', this._onKeyDown)
    window.addEventListener('keyup', this._onKeyUp)
    window.addEventListener('mousemove', this._onMouseMove)
    document.addEventListener('pointerlockchange', this._onPointerLockChange)
    this.element.addEventListener('click', this._onClick)
    this._attached = true
  }

  detach() {
    if (!this._attached) return
    window.removeEventListener('keydown', this._onKeyDown)
    window.removeEventListener('keyup', this._onKeyUp)
    window.removeEventListener('mousemove', this._onMouseMove)
    document.removeEventListener('pointerlockchange', this._onPointerLockChange)
    this.element.removeEventListener('click', this._onClick)
    this._attached = false
  }

  _onKeyDown(e) {
    if (e.code === 'Escape') {
      this._onPauseToggle()
      return
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this.boost = 1
      return
    }
    if (STEER_KEYS[e.code]) {
      this._down.add(e.code)
    }
    this._recomputeSteering()
  }

  _onKeyUp(e) {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this.boost = 0
      return
    }
    if (STEER_KEYS[e.code]) {
      this._down.delete(e.code)
    }
    this._recomputeSteering()
  }

  _recomputeSteering() {
    let x = 0
    let y = 0
    for (const code of this._down) {
      const entry = STEER_KEYS[code]
      if (!entry) continue
      if (entry.axis === 'x') x += entry.sign
      else y += entry.sign
    }
    this.steering.x = Math.max(-1, Math.min(1, x))
    this.steering.y = Math.max(-1, Math.min(1, y))
  }

  _onMouseMove(e) {
    if (!this.pointerLocked) return
    this.lookDelta.x += e.movementX * 0.0015
    this.lookDelta.y += e.movementY * 0.0015
  }

  _onClick() {
    if (!this.pointerLocked && this.element.requestPointerLock) {
      try { this.element.requestPointerLock() } catch (e) { /* noop */ }
    }
  }

  _onPointerLockChange() {
    this.pointerLocked = document.pointerLockElement === this.element
  }

  consumeLookDelta() {
    const dx = this.lookDelta.x
    const dy = this.lookDelta.y
    this.lookDelta.x = 0
    this.lookDelta.y = 0
    return { dx, dy }
  }
}
