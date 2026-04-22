// PostFX
// EffectComposer with UnrealBloomPass tuned for neon geometry.

import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

const DEFAULTS = {
  bloomStrength: 1.35,
  bloomRadius: 0.9,
  bloomThreshold: 0.0
}

export function createPostFX({ renderer, scene, camera, config = {} }) {
  const cfg = { ...DEFAULTS, ...config }

  const composer = new EffectComposer(renderer)
  const renderPass = new RenderPass(scene, camera)
  const size = renderer.getSize(new THREE.Vector2())
  const bloomPass = new UnrealBloomPass(size, cfg.bloomStrength, cfg.bloomRadius, cfg.bloomThreshold)
  const outputPass = new OutputPass()

  composer.addPass(renderPass)
  composer.addPass(bloomPass)
  composer.addPass(outputPass)

  const handleResize = (w, h) => {
    composer.setSize(w, h)
    bloomPass.setSize(w, h)
  }

  return {
    composer,
    bloomPass,
    handleResize,
    setBloomStrength(v) { bloomPass.strength = v },
    setBloomRadius(v) { bloomPass.radius = v },
    setBloomThreshold(v) { bloomPass.threshold = v },
    render() { composer.render() }
  }
}
