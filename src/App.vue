<template>
  <div class="app">
    <canvas ref="canvasRef" class="canvas"></canvas>

    <HUD
      v-if="runtime.ui.phase === 'playing' || runtime.ui.phase === 'paused'"
      :trackName="runtime.ui.trackName"
      :time="runtime.ui.time"
      :duration="runtime.ui.duration"
      :bass="runtime.audio.bass"
      :mid="runtime.audio.mid"
      :high="runtime.audio.high"
      :paused="runtime.ui.phase === 'paused'"
    />

    <TitleCard
      v-if="runtime.ui.phase === 'title' || titleFadingOut"
      :trackName="runtime.ui.trackName"
      :hasTrack="runtime.ui.hasTrack"
      :isLoading="runtime.ui.isLoading"
      :fadingOut="titleFadingOut"
      :errorMessage="runtime.ui.errorMessage"
      @start="onStart"
      @pickFile="onPickFile"
    />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import TitleCard from './ui/TitleCard.vue'
import HUD from './ui/HUD.vue'
import { runtime } from './state/runtime.js'

import defaultTrackUrl from '../audio/when_the_world_ends.mp3?url'

import { AudioEngine } from './audio/AudioEngine.js'
import { AudioAnalyser } from './audio/AudioAnalyser.js'
import { PulseDetector } from './audio/PulseDetector.js'

import { SceneRunner } from './scene/SceneRunner.js'
import { createPostFX } from './scene/PostFX.js'
import { ReactiveCamera } from './scene/ReactiveCamera.js'
import { Tunnel } from './scene/world/Tunnel.js'
import { Rings } from './scene/world/Rings.js'
import { Shards } from './scene/world/Shards.js'
import { Trail } from './scene/world/Trail.js'
import { applyBindings } from './scene/bindings.js'

import { InputController } from './input/InputController.js'

const canvasRef = ref(null)
const titleFadingOut = ref(false)

let audioEngine = null
let audioAnalyser = null
let pulseDetector = null
let sceneRunner = null
let postFX = null
let reactiveCamera = null
let world = null
let input = null
let startRamp = null

onMounted(async () => {
  const canvas = canvasRef.value

  sceneRunner = new SceneRunner({ canvas })
  postFX = createPostFX({
    renderer: sceneRunner.renderer,
    scene: sceneRunner.scene,
    camera: sceneRunner.camera
  })
  sceneRunner.setPostUpdate((w, h) => postFX.handleResize(w, h))
  sceneRunner.setRenderOverride(() => postFX.render())

  reactiveCamera = new ReactiveCamera({ camera: sceneRunner.camera })

  world = {
    tunnel: new Tunnel({ scene: sceneRunner.scene }),
    rings: new Rings({ scene: sceneRunner.scene }),
    shards: new Shards({ scene: sceneRunner.scene }),
    trail: new Trail({ scene: sceneRunner.scene, camera: sceneRunner.camera })
  }

  // Slow ambient flow while on the title card.
  world.tunnel.baseSpeed = 6

  audioEngine = new AudioEngine()
  audioAnalyser = null
  pulseDetector = new PulseDetector()

  input = new InputController({
    element: canvas,
    onPauseToggle: togglePause
  })
  input.attach()

  sceneRunner.addUpdate(frameUpdate)
  sceneRunner.start()

  await preloadDefaultTrack()
})

async function preloadDefaultTrack() {
  runtime.ui.isLoading = true
  runtime.ui.errorMessage = ''
  try {
    await audioEngine.loadURL(defaultTrackUrl, 'when_the_world_ends.mp3')
    runtime.ui.trackName = audioEngine.currentTrackName
    runtime.ui.hasTrack = true
    audioAnalyser = new AudioAnalyser({
      analyserNode: audioEngine.analyserNode,
      sampleRate: audioEngine.audioContext.sampleRate
    })
  } catch (err) {
    console.error('[PulseLab] failed to load default track', err)
    runtime.ui.errorMessage = 'Failed to load the default track. Pick a file to continue.'
  } finally {
    runtime.ui.isLoading = false
  }
}

async function onPickFile(file) {
  runtime.ui.isLoading = true
  runtime.ui.errorMessage = ''
  try {
    await audioEngine.loadFile(file)
    runtime.ui.trackName = audioEngine.currentTrackName
    runtime.ui.hasTrack = true
    if (!audioAnalyser) {
      audioAnalyser = new AudioAnalyser({
        analyserNode: audioEngine.analyserNode,
        sampleRate: audioEngine.audioContext.sampleRate
      })
    }
  } catch (err) {
    console.error('[PulseLab] failed to load file', err)
    runtime.ui.errorMessage = 'Could not decode that file. Try a different audio file.'
  } finally {
    runtime.ui.isLoading = false
  }
}

async function onStart() {
  if (!audioEngine || !runtime.ui.hasTrack) return
  titleFadingOut.value = true
  // Cinematic push-in: ramp tunnel speed from ambient to normal over ~1.2s.
  const startT = performance.now()
  const from = world.tunnel.baseSpeed
  const to = 22
  startRamp = (nowMs) => {
    const t = Math.min(1, (nowMs - startT) / 1200)
    const eased = t * t * (3 - 2 * t)
    world.tunnel.baseSpeed = from + (to - from) * eased
    return t >= 1
  }
  try {
    audioEngine.setLoop(true)
    await audioEngine.play()
    runtime.audio.isPlaying = true
  } catch (err) {
    console.error('[PulseLab] play failed', err)
    runtime.ui.errorMessage = 'Audio could not start. Click again.'
    titleFadingOut.value = false
    return
  }
  // After fade finishes, swap to playing phase.
  setTimeout(() => {
    runtime.ui.phase = 'playing'
    titleFadingOut.value = false
  }, 900)
}

function togglePause() {
  if (runtime.ui.phase === 'playing') {
    runtime.ui.phase = 'paused'
    audioEngine.pause()
    runtime.audio.isPlaying = false
    if (document.pointerLockElement) document.exitPointerLock()
  } else if (runtime.ui.phase === 'paused') {
    runtime.ui.phase = 'playing'
    audioEngine.play()
    runtime.audio.isPlaying = true
  }
}

function frameUpdate(dt) {
  const phase = runtime.ui.phase

  // Advance start ramp regardless of phase so the push-in feels continuous.
  if (startRamp) {
    const done = startRamp(performance.now())
    if (done) startRamp = null
  }

  // Audio analysis (skip while paused; values decay naturally).
  if (audioAnalyser && phase !== 'paused') {
    audioAnalyser.update()
    pulseDetector.update(dt, audioAnalyser.features.bass)
  }
  const features = audioAnalyser ? audioAnalyser.features : {
    bass: 0, mid: 0, high: 0, overallEnergy: 0, rawBins: null
  }

  // Input -> steering and boost.
  if (input) {
    if (phase === 'playing') {
      reactiveCamera.setSteering(input.steering.x, input.steering.y, world.tunnel.radius)
      reactiveCamera.setBoost(input.boost)
      world.tunnel.setBoost(input.boost)
      const look = input.consumeLookDelta()
      reactiveCamera.setLook(-look.dx, -look.dy)
      runtime.control.steeringX = input.steering.x
      runtime.control.steeringY = input.steering.y
      runtime.control.boost = input.boost
    } else {
      // Title/paused: no steering, no boost, neutral camera.
      reactiveCamera.setSteering(0, 0, world.tunnel.radius)
      reactiveCamera.setBoost(0)
      world.tunnel.setBoost(0)
    }
  }

  // Run the declarative bindings.
  applyBindings({
    dt,
    features,
    pulse: pulseDetector,
    world,
    reactiveCamera,
    postFX
  })

  reactiveCamera.update(dt)

  // Write audio + time back to reactive runtime for the UI.
  runtime.audio.bass = features.bass
  runtime.audio.mid = features.mid
  runtime.audio.high = features.high
  runtime.audio.overallEnergy = features.overallEnergy
  runtime.audio.pulse = pulseDetector.value
  if (audioEngine) {
    runtime.ui.time = audioEngine.currentTime
    runtime.ui.duration = audioEngine.duration
  }
}

onBeforeUnmount(() => {
  if (input) input.detach()
  if (sceneRunner) sceneRunner.dispose()
  if (audioEngine) audioEngine.pause()
})
</script>

<style scoped>
.app {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.canvas {
  width: 100%;
  height: 100%;
  display: block;
  background: #000;
}
</style>
