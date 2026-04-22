// AudioAnalyser
// Wraps an AnalyserNode and produces normalized, smoothed band values in 0..1.

const DEFAULT_BANDS = {
  bass: { from: 20, to: 180 },
  mid: { from: 180, to: 2200 },
  high: { from: 2200, to: 12000 }
}

const DEFAULT_SMOOTHING = {
  attack: 0.35,
  release: 0.08
}

export class AudioAnalyser {
  constructor({ analyserNode, sampleRate, bands = DEFAULT_BANDS, smoothing = DEFAULT_SMOOTHING }) {
    this.analyserNode = analyserNode
    this.sampleRate = sampleRate
    this.bands = bands
    this.smoothing = smoothing

    this.binCount = analyserNode.frequencyBinCount
    this.rawBins = new Uint8Array(this.binCount)

    this.bandBinRanges = this._computeBandBinRanges()

    this.features = {
      bass: 0,
      mid: 0,
      high: 0,
      overallEnergy: 0,
      rawBins: this.rawBins
    }
  }

  _computeBandBinRanges() {
    const nyquist = this.sampleRate / 2
    const binHz = nyquist / this.binCount
    const out = {}
    for (const key of Object.keys(this.bands)) {
      const { from, to } = this.bands[key]
      const start = Math.max(0, Math.floor(from / binHz))
      const end = Math.min(this.binCount - 1, Math.ceil(to / binHz))
      out[key] = { start, end: Math.max(start + 1, end) }
    }
    return out
  }

  _bandAverage(start, end) {
    let sum = 0
    let count = 0
    for (let i = start; i <= end; i++) {
      sum += this.rawBins[i]
      count++
    }
    return count > 0 ? (sum / count) / 255 : 0
  }

  _smooth(prev, next) {
    const k = next > prev ? this.smoothing.attack : this.smoothing.release
    return prev + (next - prev) * k
  }

  update() {
    this.analyserNode.getByteFrequencyData(this.rawBins)

    const bassRaw = this._bandAverage(this.bandBinRanges.bass.start, this.bandBinRanges.bass.end)
    const midRaw = this._bandAverage(this.bandBinRanges.mid.start, this.bandBinRanges.mid.end)
    const highRaw = this._bandAverage(this.bandBinRanges.high.start, this.bandBinRanges.high.end)

    this.features.bass = this._smooth(this.features.bass, bassRaw)
    this.features.mid = this._smooth(this.features.mid, midRaw)
    this.features.high = this._smooth(this.features.high, highRaw)

    const overall = (this.features.bass + this.features.mid + this.features.high) / 3
    this.features.overallEnergy = this._smooth(this.features.overallEnergy, overall)
  }
}
