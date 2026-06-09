<script setup lang="ts">
import { ref } from 'vue'
import { formatClosestLabel, type ClosestMatch, type Swatch } from '../lib/palette'
import { validateCustomStep } from '../lib/swatchSteps'

const props = defineProps<{
  swatches: Swatch[]
  closest: ClosestMatch | null
  lockedStep: number | null
  customSteps: number[]
}>()

const emit = defineEmits<{
  copyHex: [hex: string]
  addStep: [step: number]
  removeStep: [step: number]
}>()

function isCustomStep(step: number): boolean {
  return props.customSteps.includes(step)
}

const newStepInput = ref('')
const addError = ref('')

function copyHex(hex: string) {
  emit('copyHex', hex)
}

function submitAddStep() {
  addError.value = ''
  const raw = String(newStepInput.value).trim()
  if (raw === '') {
    addError.value = 'Enter a step number'
    return
  }
  const parsed = Number(raw)
  if (Number.isNaN(parsed)) {
    addError.value = 'Enter a step number'
    return
  }
  const existingSteps = props.swatches.map((swatch) => swatch.step)
  const error = validateCustomStep(parsed, existingSteps)
  if (error) {
    addError.value = error
    return
  }
  emit('addStep', parsed)
  newStepInput.value = ''
}
</script>

<template>
  <div class="swatch-grid">
    <div class="swatch-grid__header">
      <span>Step</span>
      <span>Color</span>
      <span>Hex</span>
      <span />
    </div>
    <div
      v-for="swatch in swatches"
      :key="swatch.step"
      class="swatch-row"
      :class="{
        'swatch-row--closest': closest?.step === swatch.step && lockedStep === null,
        'swatch-row--locked': lockedStep === swatch.step,
      }"
    >
      <span class="swatch-row__step">{{ swatch.step }}</span>
      <span
        class="swatch-row__chip"
        :style="{ backgroundColor: swatch.hex }"
        :title="swatch.hex"
      />
      <span class="swatch-row__hex">{{ swatch.hex }}</span>
      <div class="swatch-row__meta">
        <span
          v-if="lockedStep === swatch.step"
          class="badge badge--locked"
        >
          Locked
        </span>
        <span
          v-else-if="closest?.step === swatch.step"
          class="badge badge--closest"
        >
          {{ formatClosestLabel(closest) }}
        </span>
        <button
          v-if="isCustomStep(swatch.step)"
          class="swatch-row__remove"
          type="button"
          aria-label="Remove step"
          @click="emit('removeStep', swatch.step)"
        >
          Remove
        </button>
        <button
          class="swatch-row__copy"
          type="button"
          @click="copyHex(swatch.hex)"
        >
          Copy
        </button>
      </div>
    </div>
    <form class="swatch-grid__add" @submit.prevent="submitAddStep">
      <label class="swatch-grid__add-label" for="new-step">Add step</label>
      <input
        id="new-step"
        v-model="newStepInput"
        class="swatch-grid__add-input"
        type="number"
        min="0"
        max="1000"
        step="1"
        placeholder="e.g. 350"
      />
      <button
        class="swatch-grid__add-button"
        type="button"
        @click="submitAddStep"
      >
        Add
      </button>
      <p v-if="addError" class="swatch-grid__add-error">{{ addError }}</p>
    </form>
  </div>
</template>

<style scoped>
.swatch-grid {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  overflow: hidden;
}

.swatch-grid__header,
.swatch-row {
  display: grid;
  grid-template-columns: 4rem 3rem 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 0.625rem 1rem;
}

.swatch-grid__header {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  background: var(--surface-muted);
  border-bottom: 1px solid var(--border);
}

.swatch-row {
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.swatch-grid__add {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border);
  background: var(--surface-muted);
}

.swatch-grid__add-label {
  font-size: 0.875rem;
  font-weight: 600;
}

.swatch-grid__add-input {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.875rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: var(--surface);
  color: var(--text);
}

.swatch-grid__add-button {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  background: var(--accent);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.swatch-grid__add-error {
  grid-column: 1 / -1;
  margin: 0;
  font-size: 0.8125rem;
  color: var(--error);
}

.swatch-row--closest {
  box-shadow: inset 3px 0 0 var(--accent);
}

.swatch-row--locked {
  box-shadow: inset 3px 0 0 var(--locked);
  background: color-mix(in srgb, var(--locked) 6%, var(--surface));
}

.swatch-row__step {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.swatch-row__chip {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
}

.swatch-row__hex {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.875rem;
}

.swatch-row__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-end;
}

.badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  white-space: nowrap;
}

.badge--closest {
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  color: var(--accent);
}

.badge--locked {
  background: color-mix(in srgb, var(--locked) 15%, transparent);
  color: var(--locked);
}

.swatch-row__copy,
.swatch-row__remove {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
}

.swatch-row__remove {
  color: var(--error);
  border-color: color-mix(in srgb, var(--error) 35%, var(--border));
}

.swatch-row__copy:hover,
.swatch-row__remove:hover {
  background: var(--surface-muted);
}
</style>
