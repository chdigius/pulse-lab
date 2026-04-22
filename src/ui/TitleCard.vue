<template>
  <div class="title-card" :class="{ 'fade-out': fadingOut }">
    <div class="glow-bg"></div>
    <div class="stack">
      <div class="brand">PULSE</div>
      <div class="brand brand-sub">LAB</div>
      <div class="subtitle">audio-reactive synthwave tunnel</div>

      <div class="track-line" v-if="trackName">
        <span class="track-label">TRACK</span>
        <span class="track-name">{{ trackName }}</span>
      </div>

      <FilePicker :disabled="isLoading" @pick="$emit('pickFile', $event)" />

      <button
        class="start-btn"
        :disabled="!hasTrack || isLoading"
        @click="$emit('start')"
      >
        <span v-if="isLoading">LOADING...</span>
        <span v-else>ENTER THE TUNNEL</span>
      </button>

      <div class="hint">
        WASD / arrows to steer &nbsp;·&nbsp; SHIFT to boost &nbsp;·&nbsp; ESC to pause
      </div>

      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import FilePicker from './FilePicker.vue'

defineProps({
  trackName: { type: String, default: '' },
  hasTrack: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  fadingOut: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' }
})

defineEmits(['start', 'pickFile'])
</script>

<style scoped>
.title-card {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  color: #fff;
  pointer-events: auto;
  background: radial-gradient(ellipse at center, rgba(155, 59, 255, 0.15) 0%, rgba(0, 0, 0, 0.85) 60%);
  transition: opacity 0.9s ease, transform 0.9s ease;
}
.title-card.fade-out {
  opacity: 0;
  transform: scale(1.12);
  pointer-events: none;
}
.glow-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(255, 42, 209, 0.25), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(34, 240, 255, 0.22), transparent 45%);
  pointer-events: none;
}
.stack {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 40px 56px;
  text-align: center;
}
.brand {
  font-family: 'Orbitron', 'Inter', system-ui, sans-serif;
  font-size: 96px;
  font-weight: 900;
  letter-spacing: 12px;
  line-height: 1;
  color: #fff;
  text-shadow:
    0 0 12px #ff2ad1,
    0 0 28px #ff2ad1,
    0 0 60px rgba(34, 240, 255, 0.7);
}
.brand-sub {
  color: #22f0ff;
  text-shadow:
    0 0 12px #22f0ff,
    0 0 28px #22f0ff,
    0 0 60px rgba(255, 42, 209, 0.6);
}
.subtitle {
  color: #c0a8ff;
  letter-spacing: 6px;
  font-size: 14px;
  text-transform: uppercase;
  margin-bottom: 18px;
  text-shadow: 0 0 10px rgba(155, 59, 255, 0.8);
}
.track-line {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border: 1px solid rgba(34, 240, 255, 0.4);
  background: rgba(34, 240, 255, 0.08);
  border-radius: 2px;
}
.track-label {
  color: #22f0ff;
  font-size: 11px;
  letter-spacing: 3px;
}
.track-name {
  color: #fff;
  font-size: 13px;
  letter-spacing: 1px;
}
.start-btn {
  margin-top: 10px;
  padding: 16px 42px;
  font-family: inherit;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 6px;
  background: transparent;
  color: #fff;
  border: 2px solid #ff2ad1;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  box-shadow: 0 0 20px rgba(255, 42, 209, 0.5), inset 0 0 12px rgba(255, 42, 209, 0.2);
}
.start-btn:hover:not(:disabled) {
  background: rgba(255, 42, 209, 0.15);
  box-shadow: 0 0 30px rgba(255, 42, 209, 0.9), inset 0 0 20px rgba(255, 42, 209, 0.3);
  transform: translateY(-1px);
}
.start-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.hint {
  margin-top: 18px;
  font-size: 11px;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
}
.error {
  color: #ff6a8a;
  font-size: 12px;
  margin-top: 8px;
}
</style>
