// Shards
// Small tumbling geometric pieces scattered through the tunnel.
// Flow with the tunnel, rotate based on mids, scale softly on highs.

import * as THREE from 'three'
import { pickPaletteColor } from '../palette.js'

const SHARD_COUNT = 36
const TUNNEL_LENGTH = 180
const TUNNEL_RADIUS = 7.6
const SPAWN_BEHIND = 6

function makeShardGeometry() {
  const size = 0.55
  const positions = new Float32Array([
    // four line segments forming a cross/shard shape
    -size, 0, 0,   size, 0, 0,
    0, -size, 0,   0, size, 0,
    -size * 0.7, -size * 0.7, 0,   size * 0.7, size * 0.7, 0,
    -size * 0.7, size * 0.7, 0,   size * 0.7, -size * 0.7, 0
  ])
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geo
}

export class Shards {
  constructor({ scene }) {
    this.scene = scene
    this.group = new THREE.Group()
    scene.add(this.group)

    const geo = makeShardGeometry()
    this._shards = []

    for (let i = 0; i < SHARD_COUNT; i++) {
      const mat = new THREE.LineBasicMaterial({
        color: pickPaletteColor(i),
        transparent: true,
        opacity: 0.85
      })
      const mesh = new THREE.LineSegments(geo, mat)
      const angle = Math.random() * Math.PI * 2
      const radius = TUNNEL_RADIUS * (0.55 + Math.random() * 0.4)
      mesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        -Math.random() * TUNNEL_LENGTH
      )
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      )
      this.group.add(mesh)
      this._shards.push({
        mesh,
        mat,
        spinX: (Math.random() - 0.5) * 1.2,
        spinY: (Math.random() - 0.5) * 1.2,
        spinZ: (Math.random() - 0.5) * 0.6,
        baseOpacity: 0.6 + Math.random() * 0.3
      })
    }
  }

  update(dt, { speed, features }) {
    const advance = speed * dt
    const midBoost = 1 + features.mid * 2.5
    for (let i = 0; i < this._shards.length; i++) {
      const s = this._shards[i]
      s.mesh.position.z += advance
      if (s.mesh.position.z > SPAWN_BEHIND) {
        s.mesh.position.z -= TUNNEL_LENGTH
      }
      s.mesh.rotation.x += s.spinX * dt * midBoost
      s.mesh.rotation.y += s.spinY * dt * midBoost
      s.mesh.rotation.z += s.spinZ * dt * midBoost
      const k = 1 + features.high * 0.5
      s.mesh.scale.set(k, k, k)
      s.mat.opacity = Math.min(1, s.baseOpacity + features.high * 0.3)
    }
  }
}
