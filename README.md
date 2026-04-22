# pulse-lab
Spec driven development experiment #2

Audio-reactive synthwave tunnel demo. Vue 3 + Three.js + Web Audio. Built spec-first as R&D for a future 3D layer in RadiantForge.

See `SPEC.md` for the full creative direction and `IMPLEMENTATION.md` for the build plan.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/` and hit `ENTER THE TUNNEL`.

## Controls

- `W A S D` / arrow keys: steer within the tunnel
- `Q E` or `R F`: steer vertically
- `Shift`: boost (FOV lift + faster flow)
- `Mouse`: light look-around (click canvas for pointer lock)
- `Esc`: pause / resume

## Default Track

`audio/when_the_world_ends.mp3` is loaded automatically. You can override with your own file from the title card via `LOAD YOUR OWN TRACK`.

Playback loops forever by default so the demo never dead-ends.

## Architecture

```
src/
├── audio/       Web Audio + FFT + pulse detection (no Three.js)
├── scene/       Three.js runner, post FX, camera rig, world pieces
├── input/       Keyboard/pointer intent (no scene knowledge)
├── ui/          Vue components (read-only from runtime state)
└── state/       Shared reactive runtime state
```

`scene/bindings.js` is the declarative source of truth mapping normalized audio features (`bass`, `mid`, `high`, `overallEnergy`, `pulse`) to scene parameters. Swap behavior by editing that one file.

## Modules

Reusable pieces that are likely future RadiantForge 3D primitives:

- `audio/AudioEngine` — load/decode/play/loop, clean node graph
- `audio/AudioAnalyser` — smoothed, normalized `bass/mid/high/overallEnergy`
- `audio/PulseDetector` — lightweight bass-derived transient detector
- `scene/SceneRunner` — renderer/scene/camera/loop, fixed-dt clamp
- `scene/PostFX` — EffectComposer + UnrealBloomPass, tuned for neon
- `scene/EntityPool` — generic free/active pool, zero-alloc steady state
- `scene/ReactiveCamera` — steering lean, boost FOV lift, pulse shake
- `input/InputController` — keyboard + pointer lock + normalized intent

## License

MIT
