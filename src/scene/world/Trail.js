// Trail
// Player light-wake trail behind the camera.
// Emits from just behind the camera, drifts backward, fades out.
// Intensity scales with forward speed, boost, and pulse events.

import * as THREE from 'three'
import { EntityPool } from '../EntityPool.js'
import { pickPaletteColor } from '../palette.js'

const POOL_INITIAL = 80

function makeSparkTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.75)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

export class Trail {
  constructor({ scene, camera }) {
    this.scene = scene
    this.camera = camera

    this.group = new THREE.Group()
    scene.add(this.group)

    const tex = makeSparkTexture()
    this._pool = new EntityPool({
      factory: () => {
        const mat = new THREE.SpriteMaterial({
          map: tex,
          color: 0xffffff,
          transparent: true,
          opacity: 1,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        })
        const sprite = new THREE.Sprite(mat)
        sprite.scale.set(0.6, 0.6, 1)
        sprite.visible = false
        this.group.add(sprite)
        return {
          sprite, mat,
          vx: 0, vy: 0, vz: 0,
          age: 0, life: 1,
          startScale: 0.6, endScale: 1.6
        }
      },
      reset: (e) => { e.sprite.visible = false },
      initialSize: POOL_INITIAL
    })

    this._emitAccumulator = 0
    this._pulseBoost = 0
    this._colorIdx = 0
  }

  triggerPulse(intensity = 1) {
    this._pulseBoost = Math.min(1, this._pulseBoost + intensity)
  }

  _spawnParticle({ intensity }) {
    const e = this._pool.acquire()
    const color = pickPaletteColor(this._colorIdx++)
    e.mat.color.copy(color)
    e.mat.opacity = Math.min(1, 0.7 + intensity * 0.5)

    const spread = 0.35
    const cx = this.camera.position.x
    const cy = this.camera.position.y
    const cz = this.camera.position.z

    e.sprite.position.set(
      cx + (Math.random() - 0.5) * spread,
      cy + (Math.random() - 0.5) * spread,
      cz + 0.6
    )
    e.vx = (Math.random() - 0.5) * 0.4
    e.vy = (Math.random() - 0.5) * 0.4
    e.vz = 6 + Math.random() * 4
    e.age = 0
    e.life = 0.7 + Math.random() * 0.3
    e.startScale = 0.5 + intensity * 0.5
    e.endScale = e.startScale * 0.2
    e.sprite.scale.set(e.startScale, e.startScale, 1)
    e.sprite.visible = true
  }

  update(dt, { speed, features }) {
    const rate = 30 + speed * 1.2 + features.high * 40 + this._pulseBoost * 80
    this._emitAccumulator += rate * dt
    const toSpawn = Math.floor(this._emitAccumulator)
    this._emitAccumulator -= toSpawn
    const intensity = Math.max(features.high, features.overallEnergy * 0.6, this._pulseBoost)
    for (let i = 0; i < toSpawn; i++) {
      this._spawnParticle({ intensity })
    }

    this._pool.forEachActive((e) => {
      e.age += dt
      e.sprite.position.x += e.vx * dt
      e.sprite.position.y += e.vy * dt
      e.sprite.position.z += e.vz * dt
      const t = Math.min(1, e.age / e.life)
      const s = e.startScale + (e.endScale - e.startScale) * t
      e.sprite.scale.set(s, s, 1)
      e.mat.opacity = Math.max(0, 1 - t)
      if (t >= 1) this._pool.release(e)
    })

    this._pulseBoost = Math.max(0, this._pulseBoost - dt * 2.2)
  }
}
