// SceneRunner
// Owns renderer, scene, camera, and the animation loop.
// Modules register per-frame work via addUpdate(fn).

import * as THREE from 'three'
import { PALETTE } from './palette.js'

const MAX_DT = 1 / 30

export class SceneRunner {
  constructor({ canvas, fov = 75 }) {
    this.canvas = canvas

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(PALETTE.void, 1)

    this.scene = new THREE.Scene()
    this.scene.background = PALETTE.void
    this.scene.fog = new THREE.Fog(PALETTE.void, 40, 140)

    this.camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 500)
    this.camera.position.set(0, 0, 0)
    this.camera.lookAt(0, 0, -1)

    this._clock = new THREE.Clock()
    this._updates = []
    this._running = false
    this._rafId = null
    this._elapsed = 0
    this._postUpdate = null

    this._onResize = this._onResize.bind(this)
    window.addEventListener('resize', this._onResize)
    this._onResize()
  }

  _onResize() {
    const w = this.canvas.clientWidth || window.innerWidth
    const h = this.canvas.clientHeight || window.innerHeight
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    if (this._postUpdate) this._postUpdate(w, h)
  }

  setPostUpdate(fn) {
    this._postUpdate = fn
    this._onResize()
  }

  addUpdate(fn) {
    this._updates.push(fn)
    return () => {
      const i = this._updates.indexOf(fn)
      if (i !== -1) this._updates.splice(i, 1)
    }
  }

  setRenderOverride(renderFn) {
    this._renderOverride = renderFn
  }

  start() {
    if (this._running) return
    this._running = true
    this._clock.start()
    const loop = () => {
      if (!this._running) return
      this._rafId = requestAnimationFrame(loop)
      const rawDt = this._clock.getDelta()
      const dt = Math.min(rawDt, MAX_DT)
      this._elapsed += dt
      for (let i = 0; i < this._updates.length; i++) {
        this._updates[i](dt, this._elapsed)
      }
      if (this._renderOverride) {
        this._renderOverride()
      } else {
        this.renderer.render(this.scene, this.camera)
      }
    }
    loop()
  }

  stop() {
    this._running = false
    if (this._rafId !== null) cancelAnimationFrame(this._rafId)
    this._rafId = null
    this._clock.stop()
  }

  dispose() {
    this.stop()
    window.removeEventListener('resize', this._onResize)
    this.renderer.dispose()
  }
}
