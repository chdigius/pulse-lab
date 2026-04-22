# Pulse Lab Spec

## Overview

`Pulse Lab` is a spec-driven Three.js + Vue 3 demo that visualizes a music track as a playable, flyable 3D world. The user loads a local audio file, enters the scene, and flies through a stylized environment where geometry, lighting, particles, and post-processing react in real time to FFT-derived audio data.

This is a demo, not a DAW, editor, or full game. The goal is to create a slick, immediate, high-impact audiovisual experience with strong "Rez"-style energy: neon geometry, rhythmic motion, clean UI, and satisfying moment-to-moment feedback.

## Creative Direction

### Core Vibe

- Futuristic, synesthetic, rhythmic, and slightly abstract.
- Strong "Rez" influence, but not a clone.
- The world should feel musical rather than physically realistic.
- Motion should feel smooth and intentional, never noisy or chaotic.

### Visual Pillars

- Dark void backdrop with vivid emissive color accents.
- Wireframe and line-heavy geometry mixed with glowing solid forms.
- Long, readable silhouettes over cluttered detail.
- Strong contrast between calm ambient motion and beat-driven spikes.
- Camera motion that feels fluid and empowering, not twitchy.
- Fixed neon/synthwave palette for MVP: magenta, cyan, electric blue, violet, and hot pink highlights against near-black space.

### Aesthetic Keywords

- neon
- synthwave
- vector
- tunnel
- lattice
- pulse
- bloom
- rhythm
- cyber-abstract

## Product Goals

### Primary Goal

Create a browser-based audio-reactive 3D demo that feels polished enough to be a showcase piece for a future 3D layer in `RadiantForge`.

### Secondary Goals

- Prove a clean Vue 3 + Three.js integration pattern.
- Establish a reusable audio analysis pipeline for future demos.
- Explore how reactive scene parameters can map cleanly from audio features.
- Produce a strong visual result quickly without overbuilding tooling.

### Non-Goals

- Live microphone input.
- Multiplayer or networking.
- Level progression, enemies, scoring, or win/loss states.
- Timeline editing or visual scripting.
- Audio stem separation or advanced DSP beyond browser FFT analysis.
- Mobile optimization for MVP.

## User Experience

### User Story

As a user, I can load an audio file from disk, start playback, and fly around a reactive 3D world where the environment visibly and satisfyingly responds to the music in real time.

### Experience Flow

1. User lands on a stylized neon title card with the product name and a subtle ambient tunnel hint behind it.
2. A default bundled track is preloaded automatically so the `Start Experience` action is ready immediately.
3. User can optionally select a different audio file from local disk before starting.
4. On Start, the title card transitions out with a short cinematic push-in as the tunnel accelerates into view.
5. Music begins and the world reacts immediately.
6. User steers through the tunnel on a continuous forward flow while the music drives the visuals.
7. Music loops indefinitely when the track ends so the demo keeps rolling.
8. User can pause, resume, restart, or load a different file at any time.

### Emotional Goals

- Immediate "whoa, this is sick" first impression.
- Clear correlation between sound and motion.
- A feeling of presence and agency while flying.
- Consistent visual coherence instead of random FX spam.

## MVP Scope

### Must Have

- Vue 3 app shell with HUD/overlay UI.
- Three.js scene rendered full-screen in the browser.
- Local audio file selection from disk.
- Audio playback through Web Audio API.
- FFT analysis via `AnalyserNode`.
- Derived audio feature bands exposed to the renderer in real time.
- Flyable 3D camera controls.
- A stylized world with multiple reactive element types.
- Post-processing for strong visual impact.
- Basic playback controls and track status UI.

### Nice to Have

- Multiple camera modes.
- Beat pulse accent events on transients.
- Palette presets.
- Low/high sensitivity sliders.
- Optional autopilot/demo mode.

### Explicitly Out of Scope for MVP

- Full options/settings menu.
- Saving user presets.
- Playlist support.
- Procedural level generation beyond lightweight repeated structures.
- Recording/exporting video.

## Core Interaction Design

### Movement Model

The user rides a constant forward flow through a guided tunnel and steers within a bounded cross-section. Forward velocity is system-driven and modulated by audio energy and boost, while the player controls lateral and vertical positioning and light look-around. There is no free 6DOF flight and no backward motion.

The camera is a first-person cockpit-style view. It leans subtly into steering, lifts FOV slightly when boosting, and applies soft audio-driven shake on heavy bass hits. The lean and FOV response must stay readable and never feel nauseating.

### Proposed Controls

- `W/S`: nudge forward speed faster/slower within a clamped range
- `A/D`: steer left/right within the tunnel cross-section
- `Q/E` or `R/F`: steer down/up within the tunnel cross-section
- Mouse move: light look-around offset (does not change flight direction)
- `Shift`: boost (temporary forward speed and FOV lift)
- `Space`: reserved for future pulse/shockwave accent, unused in MVP
- `Esc`: release pointer lock / pause

### Control Principles

- Forward flow is always on during playback.
- Steering is clamped to the tunnel cross-section so the player cannot exit the world.
- Smooth acceleration and deceleration on both steering and boost.
- No roll axis for MVP.
- Responsiveness wins over realism; momentum should feel good but never sluggish.

## Player Presence

### Character Concept

The player has no visible avatar in the MVP. The camera itself is the player. Presence is conveyed entirely through motion, trailing light, and audio-reactive framing rather than a rendered ship or body.

### Representation

- No cockpit frame.
- No ship model.
- No avatar geometry.
- The player is implied as a glowing point of light carving through the tunnel.

### Motion Trail

A subtle light wake follows the camera to sell presence and speed:

- Particle trail or additive line streaks emitted from just behind the camera.
- Trail intensity scales with forward speed and boost.
- Trail color pulls from the active synthwave palette.
- Trail brightness gains a soft lift on `pulse` events.
- Trail must never occlude forward visibility.

### Camera-Level Feedback

Player presence is reinforced through camera behavior already defined in the Movement Model:

- Subtle lean into steering input.
- Small FOV lift on boost.
- Soft audio-driven shake on heavy bass hits.

### Non-Goals for MVP

- No visible ship, cockpit, or avatar geometry.
- No character animation.
- No third-person or chase camera.
- No on-screen character HUD elements tied to an avatar.

### Post-MVP Expansion

A Rez-style wireframe humanoid or geometric avatar is an explicit post-MVP expansion path. The reactive scene, camera behavior, and trail system should be built so that a future avatar can be dropped in without re-architecting movement, audio, or rendering.

## Scene Design

### World Concept

The scene is an abstract neon/synthwave tunnel that the player flies through on a continuous forward flow. The tunnel is composed of large-scale structural forms, rhythm-driven mid-scale objects, and fast-reacting accent FX. The environment is intentionally repeatable and modular so sections can be streamed past the camera without feeling random.

### Recommended MVP Scene Composition

#### 1. Main Structural Forms

Large repeating geometric forms that define space:

- rings
- gates
- corridor/tunnel frames
- floating monoliths
- line-grid architecture

These should react subtly to broad audio energy and more strongly to bass impact.

#### 2. Mid-Scale Reactive Objects

Elements that create visible rhythm and movement:

- floating panels
- node clusters
- rotating shards
- emissive pillars
- waveform-like rails

These should respond to specific band groups such as bass, mids, and highs.

#### 3. Particles / Accent FX

Fast feedback layers:

- particle bursts
- spark trails
- pulse lines
- bloom spikes
- additive flashes

These should react to peaks and short-lived transients.

### Motion Language

- Bass should feel heavy, large, and spatial.
- Mids should feel structural and rhythmic.
- Highs should feel spark-like, detailed, and flickery.
- Everything should interpolate smoothly to avoid ugly jitter.

## Audio System

### Input

Audio input comes from a single audio file. The app supports both a bundled default track and user-selected files from disk.

Accepted MVP formats are whatever the browser can decode reliably, with `mp3` and `wav` treated as the primary happy path.

### Default Track

A default track is shipped with the repo under `audio/` at the project root and is used automatically if the user starts the experience without choosing a file.

- Default path: `audio/when_the_world_ends.mp3`
- Served as a static asset through Vite.
- The default track is loaded on app boot so the user can hit `Start` immediately.
- Swapping to a user-selected file must replace the active source cleanly without leaking audio nodes.

### Playback Pipeline

1. App loads the default track, or the user selects a file via the file input.
2. App creates an object URL or array buffer for the chosen source.
3. Audio is decoded and routed through Web Audio.
4. Source feeds:
   - destination output
   - analyser node
5. Render loop samples analyser data each frame.

### Looping

Playback must loop indefinitely by default so the demo never dead-ends:

- When the active track reaches its end, it restarts from the beginning seamlessly.
- Looping is the default for both the bundled default track and user-selected files.
- The loop must not reset audio feature values to zero between loops; smoothing state should carry over so there is no visible "snap" at the loop point.
- The visual scene must continue rendering and reacting without interruption across the loop boundary.

### FFT Analysis

Use `AnalyserNode` with configurable FFT size. The app should compute stable, renderer-friendly values rather than feeding raw bins directly into the scene.

### Derived Audio Features

At minimum, expose:

- `rawBins`: current FFT magnitude array
- `bass`: low-frequency energy, normalized to `0..1`
- `mid`: mid-frequency energy, normalized to `0..1`
- `high`: high-frequency energy, normalized to `0..1`
- `overallEnergy`: average intensity, normalized to `0..1`
- `pulse`: lightweight transient-detected accent value, normalized to `0..1`

### Pulse Derivation

`pulse` is a cheap, stylized transient detector built on top of the `bass` band:

- Track a running baseline of `bass` via a slow exponential average.
- When current `bass` exceeds baseline by a tunable threshold, fire a `pulse` spike.
- Apply fast attack so `pulse` jumps to its new peak immediately.
- Apply controlled decay so it fades smoothly over a tunable window.
- Enforce a minimum refractory period between pulses so fast passages do not strobe.

This keeps `pulse` responsive on kick-drum-like hits without requiring real beat detection.

### Audio Smoothing

The system should apply smoothing and damping so visuals feel musical rather than noisy. Raw FFT values should be normalized into a predictable range, ideally `0..1`.

Potential techniques:

- analyser smoothing plus app-level smoothing
- exponential damping/interpolation
- peak detection with controlled decay

## Reactive Mapping

### Mapping Principles

- Every visual response should have an obvious reason to exist.
- Different scene layers should react differently to avoid uniform motion.
- Audio-driven change should be stylized, not literal.
- The world should remain attractive even during quiet passages.

### Example Mappings

- `bass` -> large scale, slow deformation, ring expansion, camera impulse, bloom lift
- `mid` -> rotation speeds, panel movement, emissive lattice animation
- `high` -> particles, sparkle intensity, line flicker, edge glow
- `overallEnergy` -> global exposure, fog tint, ambient motion amount
- `pulse` -> one-shot burst effects, shockwaves, accent flashes

### Reaction Categories

- transform: scale, rotation, position offsets
- material: emissive intensity, color shifts, opacity
- post FX: bloom strength, chromatic intensity, vignette pulse
- environment: fog density, background pulse, tunnel speed impression

## Rendering and Visual Tech

### Core Stack

- Vue 3 for app shell and reactive UI
- Three.js for rendering
- Web Audio API for playback and FFT analysis
- Vite for dev/build tooling

### Rendering Features

- Full-screen canvas
- Perspective camera
- Emissive materials and strong color contrast
- Post-processing pipeline

### Post-Processing Targets

At minimum:

- bloom

Potential extras if they help without overcomplicating:

- vignette
- chromatic aberration
- subtle scanline/grain treatment
- color grading or tone shift

### Performance Strategy

- Favor instancing or pooled objects where useful.
- Keep geometry readable and stylized over overly dense meshes.
- Avoid per-frame object allocation in hot paths.
- Keep the demo smooth on a modern laptop.

## UI / HUD

### Overlay Requirements

The Vue layer should provide:

- title / intro panel
- audio file picker
- start button
- playback state
- track name
- elapsed time / duration
- minimal help text for controls
- pause / resume / restart / load another file

### Optional Runtime HUD

Keep it minimal and stylish. Possible elements:

- current bass/mid/high meters
- playback progress bar
- sensitivity indicator
- camera mode label

The UI should feel like part of the experience, not generic app chrome.

## Architecture

### High-Level Modules

#### App / UI Layer

Responsible for:

- file selection
- user actions
- HUD state
- overlay state
- binding runtime data to the UI

#### Audio Engine

Responsible for:

- decoding audio
- playback control
- analyser setup
- per-frame feature extraction
- exposing normalized audio features

#### Three Scene Engine

Responsible for:

- renderer / scene / camera lifecycle
- world creation
- reactive object updates
- post-processing
- animation loop

#### Input Controller

Responsible for:

- keyboard and mouse handling
- pointer lock coordination
- movement intent state

### Shared Runtime State

Prefer a small, explicit shared state object rather than a full app store for MVP. State should be cleanly split between:

- UI state
- audio state
- render state
- control state

### Suggested File-Level Architecture

This is directional, not mandatory:

- `src/App.vue`
- `src/main.js`
- `src/state/runtime.js`
- `src/audio/AudioEngine.js`
- `src/scene/SceneController.js`
- `src/scene/world/*`
- `src/input/InputController.js`
- `src/ui/*`

## Technical Constraints

- Must run entirely in-browser.
- Must work from a local user-selected audio file.
- Must not require any backend service.
- Must support modern desktop Chrome-based browsers as the primary target.
- Must degrade gracefully if pointer lock or file decode fails.

## Definition of Done

The MVP is done when all of the following are true:

- The bundled default track loads automatically and plays on Start without requiring user file selection.
- User can optionally load their own local audio file and start playback successfully.
- Playback loops indefinitely when a track reaches its end, with no visible reset in the reactive scene.
- Audio analysis data updates continuously during playback.
- The 3D world renders smoothly and responds visibly to the music.
- User can steer through the tunnel in real time on a constant forward flow.
- Visual response includes at least three distinct reactive layers.
- The scene has a strong neon/synthwave post-processed aesthetic.
- UI supports load, start, pause, resume, and restart flows.
- The whole thing feels polished enough to demo without apology.

## Quality Bar

### Success Criteria

- Strong first impression within 5 seconds.
- Clear audio-to-visual connection.
- No ugly jitter, stutter, or random-looking reactions.
- Clean scene composition with deliberate color and motion.
- Code structure clean enough to extend into future demos.

### Failure Modes to Avoid

- Generic "bars go up and down" visualizer energy.
- Camera feel that is floaty in a bad way or hard to control.
- Overreactive flicker from raw FFT bins.
- UI that feels like a dev tool instead of part of the demo.
- Too many competing effects at once.

## Open Questions for Tuning

These should be resolved before implementation starts:

All MVP direction decisions are locked:

1. Environment: `guided tunnel/corridor`
2. Movement: `forward-moving flow with steering`
3. Palette: `fixed neon/synthwave palette`
4. Pulse: `lightweight transient detector derived from bass energy with fast attack and controlled decay`
5. Camera: `first-person cockpit-style camera with subtle lean into steering and boost-based FOV lift`
6. Intro: `short title-card intro moment that transitions into the tunnel on Start`

## Recommendation

The locked-in MVP direction is:

- guided tunnel/corridor composition
- forward-moving flow with player steering and bounded lateral freedom
- first-person cockpit camera with subtle lean and boost FOV lift
- fixed neon/synthwave palette for MVP
- strong bloom and emissive geometry
- bass/mid/high plus a lightweight bass-derived transient `pulse`
- short title-card intro that transitions into the tunnel on Start

This preserves the fantasy of flying while keeping composition, readability, and spectacle under control.

## Post-MVP Expansion Ideas

- Palette presets
- autopilot camera mode
- beat marker events
- reactive shader materials
- procedural section transitions
- on-screen photo mode
- alternate scene themes
- microphone/live input mode
- Rez-style wireframe avatar with optional third-person/chase camera mode
