// Rings
// Hero pulse rings. Spawn on pulse events, fly past the camera expanding.
// Pool-based, zero per-frame allocation in steady state.

import * as THREE from 'three'
import { EntityPool } from '../EntityPool.js'
import { pickPaletteColor } from '../palette.js'

const RING_SEGMENTS = 64
const INITIAL_POOL = 12
const SPAWN_Z = -160
const DESPAWN_Z = 6
const RING_START_RADIUS = 6
const RING_END_RADIUS = 20

function makeRingGeometry(radius, segments) {
  const positions = []
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2
    const a1 = ((i + 1) / segments) * Math.PI * 2
    positions.push(
      Math.cos(a0) * radius, Math.sin(a0) * radius, 0,
      Math.cos(a1) * radius, Math.sin(a1) * radius, 0
    )
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geo
}

export class Rings {
  constructor({ scene }) {
    this.scene = scene
    this.group = new THREE.Group()
    scene.add(this.group)

    this._unitGeo = makeRingGeometry(1, RING_SEGMENTS)
    this._colorIndex = 0

    this._pool = new EntityPool({
      factory: () => {
        const mat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 1
        })
        const mesh = new THREE.LineSegments(this._unitGeo, mat)
        mesh.visible = false
        this.group.add(mesh)
        return { mesh, mat, age: 0, life: 1 }
      },
      reset: (e) => { e.mesh.visible = false },
      initialSize: INITIAL_POOL
    })
  }

  spawn({ speed }) {
    const e = this._pool.acquire()
    const color = pickPaletteColor(this._colorIndex++)
    e.mat.color.copy(color)
    e.mat.opacity = 1
    e.mesh.position.set(0, 0, SPAWN_Z)
    e.mesh.scale.set(RING_START_RADIUS, RING_START_RADIUS, 1)
    e.age = 0
    e.life = Math.max(2.2, Math.abs(SPAWN_Z - DESPAWN_Z) / Math.max(18, speed))
    e.mesh.visible = true
    return e
  }

  update(dt, { speed }) {
    this._pool.forEachActive((e) => {
      e.age += dt
      e.mesh.position.z += speed * dt
      const t = Math.min(1, e.age / e.life)
      const r = RING_START_RADIUS + (RING_END_RADIUS - RING_START_RADIUS) * t
      e.mesh.scale.set(r, r, 1)
      e.mat.opacity = Math.max(0, 1 - t * 0.9)
      if (e.mesh.position.z > DESPAWN_Z || t >= 1) {
        this._pool.release(e)
      }
    })
  }
}
