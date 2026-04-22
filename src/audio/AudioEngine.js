// AudioEngine
// Owns the Web Audio graph and the underlying HTMLAudioElement source.
// Uses MediaElementAudioSource so looping/pause/resume come for free from <audio>.

export class AudioEngine {
  constructor() {
    this.audioContext = null
    this.audioElement = null
    this.sourceNode = null
    this.analyserNode = null
    this.gainNode = null
    this.currentTrackName = ''
    this.currentObjectUrl = null
    this.isReady = false
    this.isPlaying = false
  }

  _ensureContext() {
    if (this.audioContext) return
    const AC = window.AudioContext || window.webkitAudioContext
    this.audioContext = new AC()
  }

  _ensureAudioElement() {
    if (this.audioElement) return
    const el = new Audio()
    el.crossOrigin = 'anonymous'
    el.preload = 'auto'
    el.loop = true
    this.audioElement = el
  }

  _rebuildSourceNode() {
    this._ensureContext()
    this._ensureAudioElement()

    if (this.sourceNode) {
      try { this.sourceNode.disconnect() } catch (e) { /* noop */ }
      this.sourceNode = null
    }

    this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement)

    if (!this.analyserNode) {
      this.analyserNode = this.audioContext.createAnalyser()
      this.analyserNode.fftSize = 2048
      this.analyserNode.smoothingTimeConstant = 0.75
    }
    if (!this.gainNode) {
      this.gainNode = this.audioContext.createGain()
      this.gainNode.gain.value = 1.0
    }

    this.sourceNode.connect(this.analyserNode)
    this.analyserNode.connect(this.gainNode)
    this.gainNode.connect(this.audioContext.destination)
  }

  async loadURL(url, trackName = '') {
    this._ensureContext()
    this._ensureAudioElement()

    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl)
      this.currentObjectUrl = null
    }

    this.audioElement.src = url
    this.currentTrackName = trackName || url.split('/').pop() || 'track'

    // MediaElementSource can only be created once per <audio> element.
    // Build it lazily on first load.
    if (!this.sourceNode) this._rebuildSourceNode()

    await new Promise((resolve, reject) => {
      const onReady = () => { cleanup(); resolve() }
      const onError = (e) => { cleanup(); reject(e) }
      const cleanup = () => {
        this.audioElement.removeEventListener('canplaythrough', onReady)
        this.audioElement.removeEventListener('loadeddata', onReady)
        this.audioElement.removeEventListener('error', onError)
      }
      this.audioElement.addEventListener('canplaythrough', onReady, { once: true })
      this.audioElement.addEventListener('loadeddata', onReady, { once: true })
      this.audioElement.addEventListener('error', onError, { once: true })
      this.audioElement.load()
    })

    this.isReady = true
  }

  async loadFile(file) {
    const url = URL.createObjectURL(file)
    await this.loadURL(url, file.name)
    this.currentObjectUrl = url
  }

  async play() {
    if (!this.isReady) return
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
    await this.audioElement.play()
    this.isPlaying = true
  }

  pause() {
    if (!this.isReady) return
    this.audioElement.pause()
    this.isPlaying = false
  }

  async restart() {
    if (!this.isReady) return
    this.audioElement.currentTime = 0
    await this.play()
  }

  setLoop(enabled) {
    if (this.audioElement) this.audioElement.loop = !!enabled
  }

  get currentTime() {
    return this.audioElement ? this.audioElement.currentTime : 0
  }

  get duration() {
    return this.audioElement && Number.isFinite(this.audioElement.duration)
      ? this.audioElement.duration
      : 0
  }
}
