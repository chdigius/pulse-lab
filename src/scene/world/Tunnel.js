// Tunnel
// Structural layer: octagonal ring sections that flow past the camera.
// Every Nth section is a brighter "gate" that pulses harder on audio.

import * as THREE from 'three'
import { PALETTE } from '../palette.js'

const SECTION_COUNT = 64
const SECTION_SPACING = 3
const TUNNEL_LENGTH = SECTION_COUNT * SECTION_SPACING
const TUNNEL_RADIUS = 9
const OCTAGON_SIDES = 8
const GATE_INTERVAL = 5

function makeRingGeometry(radius, sides) {
  const positions = []
  for (let i = 0; i < sides; i++) {
    const a0 = (i / sides) * Math.PI * 2
    const a1 = ((i + 1) / sides) * Math.PI * 2
    positions.push(
      Math.cos(a0) * radius, Math.sin(a0) * radius, 0,
      Math.cos(a1) * radius, Math.sin(a1) * radius, 0
    )
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geo
}

export class Tunnel {
  constructor({ scene }) {
    this.scene = scene
    this.radius = TUNNEL_RADIUS
    this.baseSpeed = 22
    this.boost = 0
    this._pulseAccent = 0

    const ringGeo = makeRingGeometry(TUNNEL_RADIUS, OCTAGON_SIDES)
    const gateGeo = makeRingGeometry(TUNNEL_RADIUS * 1.03, OCTAGON_SIDES)

    this.group = new THREE.Group()
    scene.add(this.group)

    this.sections = []
    for (let i = 0; i < SECTION_COUNT; i++) {
      const isGate = i % GATE_INTERVAL === 0
      const geo = isGate ? gateGeo : ringGeo
      const baseColor = isGate
        ? PALETTE.cyan.clone()
        : (i % 2 === 0 ? PALETTE.magenta.clone() : PALETTE.violet.clone())
      const baseOpacity = isGate ? 1.0 : 0.55
      const mat = new THREE.LineBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: baseOpacity
      })
      const mesh = new THREE.LineSegments(geo, mat)
      mesh.position.z = -i * SECTION_SPACING
      this.group.add(mesh)
      this.sections.push({ mesh, mat, isGate, baseOpacity })
    }
  }

  setBoost(v) { this.boost = Math.max(0, Math.min(1, v)) }

  triggerPulse() { this._pulseAccent = 1 }

  get currentSpeed() {
    return this.baseSpeed + this.boost * 45
  }

  update(dt, features) {
    const speed = this.currentSpeed + features.overallEnergy * 12
    const advance = speed * dt
    const wrapFront = SECTION_SPACING * 2

    for (let i = 0; i < this.sections.length; i++) {
      const s = this.sections[i]
      s.mesh.position.z += advance
      if (s.mesh.position.z > wrapFront) {
        s.mesh.position.z -= TUNNEL_LENGTH
      }
      if (s.isGate) {
        const k = 1 + features.bass * 0.25 + this._pulseAccent * 0.6
        s.mesh.scale.set(k, k, 1)
        s.mat.opacity = Math.min(1, s.baseOpacity + features.bass * 0.25 + this._pulseAccent * 0.35)
      } else {
        s.mat.opacity = s.baseOpacity + features.overallEnergy * 0.25
      }
    }

    this._pulseAccent = Math.max(0, this._pulseAccent - dt * 2.8)
  }
}
