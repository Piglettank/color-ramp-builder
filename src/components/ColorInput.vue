<script setup lang="ts">
import { computed } from 'vue'
import { isValidHex, normalizeHex } from '../lib/colorDistance'
import { DEFAULT_SEED_HEX } from '../lib/palette'

const model = defineModel<string>({ required: true })

const colorPickerValue = computed({
  get: () => (isValidHex(model.value) ? normalizeHex(model.value) : DEFAULT_SEED_HEX),
  set: (value: string) => {
    model.value = normalizeHex(value)
  },
})

function onTextInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  model.value = value.startsWith('#') ? value : `#${value}`
}
</script>

<template>
  <div class="color-input">
    <label class="color-input__label" for="hex-input">Seed color</label>
    <div class="color-input__row">
      <input
        v-model="colorPickerValue"
        class="color-input__picker"
        type="color"
        aria-label="Color picker"
      />
      <input
        id="hex-input"
        class="color-input__text"
        type="text"
        :value="model"
        :placeholder="DEFAULT_SEED_HEX"
        spellcheck="false"
        @input="onTextInput"
      />
    </div>
  </div>
</template>

<style scoped>
.color-input__label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.color-input__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-input__picker {
  width: 3rem;
  height: 3rem;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  cursor: pointer;
  background: transparent;
}

.color-input__text {
  flex: 1;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 1rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--text);
}
</style>
