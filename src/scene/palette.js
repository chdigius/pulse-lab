// Synthwave palette constants.
// Near-black backdrop with magenta/cyan/electric blue/violet/hot pink accents.

import * as THREE from 'three'

export const PALETTE = {
  void: new THREE.Color(0x05020a),
  magenta: new THREE.Color(0xff2ad1),
  hotPink: new THREE.Color(0xff4fa3),
  cyan: new THREE.Color(0x22f0ff),
  electricBlue: new THREE.Color(0x2a6bff),
  violet: new THREE.Color(0x9b3bff),
  white: new THREE.Color(0xffffff)
}

export const PALETTE_ARRAY = [
  PALETTE.magenta,
  PALETTE.hotPink,
  PALETTE.cyan,
  PALETTE.electricBlue,
  PALETTE.violet
]

export function pickPaletteColor(index) {
  const i = ((index % PALETTE_ARRAY.length) + PALETTE_ARRAY.length) % PALETTE_ARRAY.length
  return PALETTE_ARRAY[i]
}
