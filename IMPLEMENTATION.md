# Pulse Lab Implementation Plan

This document turns `SPEC.md` into a concrete, buildable architecture and phased build order.

Pulse Lab is a standalone demo. It is not a library and not a pre-extracted RadiantForge package. The goal is to keep module boundaries clean and intentional so that later, when RadiantForge grows a 3D layer, the useful pieces here are easy to spot, reason about, and port.

## Guiding Principles

- Favor clean module boundaries over clever architecture.
- Smoothing and normalization live in the audio module, not in the scene.
- Scene reactions consume normalized `0..1` audio features only.
- No per-frame allocation in hot paths.
- Shared runtime state flows through a single small reactive object so the Vue HUD and the Three.js loop stay in lockstep.
- Keep scope tight. If it is not on the spec, it is not in MVP.

## File-Level Architecture

```
pulse-lab/
├── audio/
│   └── when_the_world_ends.mp3
├── public/
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── state/
│   │   └── runtime.js              # shared reactive state
│   ├── audio/
│   │   ├── AudioEngine.js          # load/decode/play/loop, node graph lifecycle
│   │   ├── AudioAnalyser.js        # FFT -> bass/mid/high/overall, smoothing
│   │   └── PulseDetector.js        # bass-derived transient detector
│   ├── scene/
│   │   ├── SceneRunner.js          # renderer/scene/camera/loop boilerplate
│   │   ├── PostFX.js               # EffectComposer + bloom
│   │   ├── EntityPool.js           # generic free/active pool
│   │   ├── ReactiveCamera.js       # lean, FOV lift, audio shake
│   │   ├── palette.js              # synthwave palette constants
│   │   ├── bindings.js             # declarative audio -> scene bindings
│   │   └── world/
│   │       ├── Tunnel.js           # streaming tunnel sections
│   │       ├── Rings.js            # reactive rings
│   │       ├── Shards.js           # mid-scale reactive shards
│   │       └── Trail.js            # player light-wake trail
│   ├── input/
│   │   └── InputController.js      # keyboard/pointer, pointer lock
│   └── ui/
│       ├── TitleCard.vue
│       ├── HUD.vue
│       └── FilePicker.vue
├── index.html
├── package.json
├── vite.config.js
├── SPEC.md
├── IMPLEMENTATION.md
└── README.md
```

The key separations to preserve:

- `audio/` knows nothing about Three.js.
- `scene/` consumes normalized audio features, not raw FFT bins.
- `input/` knows nothing about the scene, it just exposes intent.
- `ui/` reads from shared runtime state, it does not drive the engine.

## Shared Runtime State

A single small reactive object shared between Vue and the engine:

```
runtime = {
  ui:      { phase: 'title' | 'playing' | 'paused', trackName, time, duration },
  audio:   { bass, mid, high, overallEnergy, pulse, isPlaying, isLooping },
  control: { steeringX, steeringY, boostHeld, paused }
}
```

- Vue components read from this directly.
- The engine writes to this in its update loop.
- No store, no Pinia. Keep it minimal.

## Module Responsibilities

Short, intentional contracts. Exact signatures get finalized in code.

### `audio/AudioEngine`

- Load default track from `audio/when_the_world_ends.mp3`.
- Optionally swap to a user-selected file.
- Play, pause, restart.
- Loop forever by default.
- Expose an `AnalyserNode` for downstream analysis.
- Never leak audio nodes on reload.

### `audio/AudioAnalyser`

- Wraps the analyser node.
- Produces normalized `bass`, `mid`, `high`, and `overallEnergy` in `0..1`.
- Applies smoothing so values feel musical.
- No per-frame allocation.

### `audio/PulseDetector`

- Consumes normalized bass.
- Tracks a slow baseline and fires a `pulse` spike on transient jumps.
- Fast attack, controlled decay, refractory period to prevent strobing.

### `scene/SceneRunner`

- Owns renderer, scene, camera, and the animation loop.
- Fixed-dt clamp so tab switches do not explode the sim.
- Exposes `addUpdate(fn)` for modules to register per-frame work.

### `scene/PostFX`

- Builds an `EffectComposer` with `UnrealBloomPass` tuned for neon.
- Exposes a small set of tunable knobs instead of raw passes.

### `scene/EntityPool`

- Generic free/active pool for rings, shards, particles.
- Zero allocation on acquire in the steady state.

### `scene/ReactiveCamera`

- Applies steering lean, boost FOV lift, and pulse-driven shake.
- Visual feedback only, never alters forward direction.

### `scene/palette.js`

- Synthwave palette constants used everywhere color is chosen.

### `scene/bindings.js`

- Declarative source of truth for which audio feature drives which scene parameter.
- Keeps reactive mapping out of individual entity code.
- Easy to scan, easy to tweak, easy to extract later if we want.

### `scene/world/*`

- Scene-specific content: tunnel sections, rings, shards, trail.
- Each entity exposes a small surface the bindings layer can drive.

### `input/InputController`

- Keyboard for steering and boost.
- Mouse for light look-around only.
- Pointer lock with graceful fallback.

### `ui/*`

- Title card, HUD, file picker.
- Reads from shared runtime state.
- Does not drive the engine directly beyond start/pause/restart.

## Build Phases

### Phase 0: Scaffold

- Vite + Vue 3.
- Install `three`, `vue`.
- Empty folder skeleton matching the layout above.
- Verify `npm run dev` boots a blank Vue app.

### Phase 1: Audio Foundation

- Implement `AudioEngine` with default-track preload, looping, and play/pause/restart.
- Implement `AudioAnalyser` with smoothed, normalized bands.
- Implement `PulseDetector`.
- Wire to a tiny dev overlay that prints live values while the default track plays and loops.

### Phase 2: Scene Foundation

- Implement `SceneRunner` with resize handling and dt clamp.
- Implement `PostFX` with default bloom.
- Render a dark test scene with a single emissive object to confirm 60fps and bloom.

### Phase 3: Tunnel World

- Implement `palette.js`.
- Implement `Tunnel.js` with streaming sections via `EntityPool`.
- Verify forward flow looks clean at a static speed.

### Phase 4: Movement + Reactive Camera

- Implement `InputController`.
- Implement `ReactiveCamera` with lean, FOV lift, and shake.
- Hook steering into camera cross-section position, clamped to the tunnel.
- Boost modulates forward flow speed.

### Phase 5: Reactive Geometry

- Implement `Rings` and `Shards`.
- Populate `bindings.js` so bass, mids, and highs each drive a distinct visual layer.
- Verify at least three distinct reactive layers are visible.

### Phase 6: Trail + Pulse FX

- Implement `Trail.js` behind the camera.
- Intensity scales with speed and boost.
- Brightness lifts on `pulse` events.
- Add a one-shot accent flash or ring spike on `pulse.isFiring`.

### Phase 7: UI

- Title card with the neon title and a subtle ambient tunnel hint behind it.
- File picker as optional override.
- Minimal in-experience HUD.
- Title-card push-in transition on Start.

### Phase 8: Polish + DoD Pass

- Tune palette, bloom, speed, shake, and binding curves until all DoD items in `SPEC.md` feel true.
- Audit for per-frame allocation.
- Audit for cross-module import leaks (audio and scene should not know about each other beyond normalized features).

## Non-Goals for This Build

- No visual editor.
- No shader graph.
- No in-engine timeline.
- No test suite beyond manual smoke testing, matching the one-day demo cadence.

## Definition of Done for Implementation

- All build phases complete.
- `SPEC.md` Definition of Done satisfied.
- Default track auto-loads, plays, and loops forever.
- Title card -> tunnel push-in feels cinematic.
- Scene response feels musical, not noisy.
- Zero runtime errors on first `npm run dev` after the full build.
