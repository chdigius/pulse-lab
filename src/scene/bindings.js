// bindings.js
// Declarative source of truth for audio -> scene parameter mapping.
// Consumers pass in the world, camera, and post FX handles; this file decides
// which audio feature drives what.

export function applyBindings({ dt, features, pulse, world, reactiveCamera, postFX }) {
  // Structural tunnel: bass-driven gate pulse, overall-driven opacity.
  world.tunnel.update(dt, features)

  // Mid-scale shards: mids drive spin, highs drive scale/opacity.
  world.shards.update(dt, {
    speed: world.tunnel.currentSpeed + features.overallEnergy * 12,
    features
  })

  // Hero rings: only spawn on pulse events. Float past at tunnel speed.
  world.rings.update(dt, { speed: world.tunnel.currentSpeed + features.overallEnergy * 12 })
  if (pulse.isFiring) {
    world.rings.spawn({ speed: world.tunnel.currentSpeed + features.overallEnergy * 12 })
    world.trail.triggerPulse(1)
    world.tunnel.triggerPulse()
    reactiveCamera.addShake(0.6 + pulse.value * 0.4)
  }

  // Trail: continuous emission scaled by speed/high/boost/pulse.
  world.trail.update(dt, {
    speed: world.tunnel.currentSpeed,
    features
  })

  // Post FX: bloom breathes with overall energy + pulse accent.
  const bloom = 1.1 + features.overallEnergy * 0.85 + pulse.value * 0.6
  postFX.setBloomStrength(bloom)
}
