<template>
  <label class="picker" :class="{ disabled }">
    <input
      type="file"
      accept="audio/*"
      :disabled="disabled"
      @change="onChange"
    />
    <span>LOAD YOUR OWN TRACK</span>
  </label>
</template>

<script setup>
defineProps({
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['pick'])

function onChange(e) {
  const file = e.target.files && e.target.files[0]
  if (file) emit('pick', file)
  e.target.value = ''
}
</script>

<style scoped>
.picker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #9b3bff;
  border: 1px solid rgba(155, 59, 255, 0.5);
  background: rgba(155, 59, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
}
.picker:hover:not(.disabled) {
  color: #fff;
  border-color: #9b3bff;
  background: rgba(155, 59, 255, 0.2);
  box-shadow: 0 0 14px rgba(155, 59, 255, 0.6);
}
.picker.disabled {
  opacity: 0.4;
  cursor: default;
}
.picker input {
  display: none;
}
</style>
