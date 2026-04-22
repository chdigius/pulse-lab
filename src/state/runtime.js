// Shared reactive runtime state.
// Vue reads from this, the engine writes to it.

import { reactive } from 'vue'

export const runtime = reactive({
  ui: {
    phase: 'title', // 'title' | 'playing' | 'paused'
    trackName: '',
    time: 0,
    duration: 0,
    hasTrack: false,
    isLoading: false,
    errorMessage: ''
  },
  audio: {
    bass: 0,
    mid: 0,
    high: 0,
    overallEnergy: 0,
    pulse: 0,
    isPlaying: false
  },
  control: {
    steeringX: 0,
    steeringY: 0,
    boost: 0
  }
})
