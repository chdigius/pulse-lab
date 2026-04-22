<template>
  <div class="hud">
    <div class="top-left">
      <div class="track">{{ trackName || '—' }}</div>
      <div class="time">{{ formatTime(time) }} / {{ formatTime(duration) }}</div>
    </div>

    <div class="bottom-bar">
      <div class="meter">
        <div class="meter-label">BASS</div>
        <div class="meter-bar"><div class="meter-fill bass" :style="{ width: pct(bass) }"></div></div>
      </div>
      <div class="meter">
        <div class="meter-label">MID</div>
        <div class="meter-bar"><div class="meter-fill mid" :style="{ width: pct(mid) }"></div></div>
      </div>
      <div class="meter">
        <div class="meter-label">HIGH</div>
        <div class="meter-bar"><div class="meter-fill high" :style="{ width: pct(high) }"></div></div>
      </div>
    </div>

    <div v-if="paused" class="paused-banner">
      <div class="paused-text">PAUSED</div>
      <div class="paused-hint">ESC to resume</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  trackName: { type: String, default: '' },
  time: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  bass: { type: Number, default: 0 },
  mid: { type: Number, default: 0 },
  high: { type: Number, default: 0 },
  paused: { type: Boolean, default: false }
})

function pct(v) {
  return `${Math.max(0, Math.min(1, v)) * 100}%`
}

function formatTime(t) {
  if (!Number.isFinite(t) || t <= 0) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  z-index: 5;
}
.top-left {
  position: absolute;
  top: 18px;
  left: 22px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.track {
  font-size: 12px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #22f0ff;
  text-shadow: 0 0 8px rgba(34, 240, 255, 0.7);
}
.time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 2px;
}
.bottom-bar {
  position: absolute;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 22px;
  align-items: center;
  padding: 10px 22px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.meter {
  display: flex;
  align-items: center;
  gap: 10px;
}
.meter-label {
  font-size: 10px;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 0.55);
  width: 32px;
}
.meter-bar {
  width: 120px;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
.meter-fill {
  height: 100%;
  transition: width 0.05s linear;
}
.meter-fill.bass { background: #ff2ad1; box-shadow: 0 0 8px #ff2ad1; }
.meter-fill.mid { background: #9b3bff; box-shadow: 0 0 8px #9b3bff; }
.meter-fill.high { background: #22f0ff; box-shadow: 0 0 8px #22f0ff; }
.paused-banner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: none;
}
.paused-text {
  font-size: 56px;
  letter-spacing: 12px;
  color: #fff;
  text-shadow: 0 0 20px #ff2ad1, 0 0 40px #22f0ff;
}
.paused-hint {
  margin-top: 14px;
  font-size: 11px;
  letter-spacing: 4px;
  color: rgba(255, 255, 255, 0.55);
}
</style>
