<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import ColorInput from './components/ColorInput.vue'
import SwatchGrid from './components/SwatchGrid.vue'
import ExtensionToggles from './components/ExtensionToggles.vue'
import DartExport from './components/DartExport.vue'
import HistoryLog, { type HistoryEntry } from './components/HistoryLog.vue'
import { isValidHex, normalizeHex } from './lib/colorDistance'
import {
  DEFAULT_SEED_HEX,
  findClosest,
  generateFromLock,
  generateFromSeed,
  virtualStepFromHex,
  type ClosestMatch,
  type Swatch,
} from './lib/palette'
import {
  DEFAULT_EXTENSIONS,
  getActiveSteps,
  type ExtensionToggles as ExtensionTogglesState,
} from './lib/swatchSteps'

const inputHex = ref(DEFAULT_SEED_HEX)
const extensions = ref<ExtensionTogglesState>({ ...DEFAULT_EXTENSIONS })
const swatches = ref<Swatch[]>([])
const closest = ref<ClosestMatch | null>(null)
const lockedStep = ref<number | null>(null)
const lockedHex = ref<string | null>(null)
const constantName = ref('PRIMARY')
const toast = ref('')
const history = ref<HistoryEntry[]>([])
const customSteps = ref<number[]>([])

const HISTORY_DEBOUNCE_MS = 500
let historyRecordTimeout: ReturnType<typeof setTimeout> | null = null

const activeSteps = computed(() => getActiveSteps(extensions.value, customSteps.value))

const isLocked = computed(() => lockedStep.value !== null)

const primaryHex = computed(() => {
  if (lockedHex.value) return lockedHex.value
  if (isValidHex(inputHex.value)) return normalizeHex(inputHex.value)
  return DEFAULT_SEED_HEX
})

const seedStep = computed(() => {
  if (lockedStep.value !== null) return lockedStep.value
  return closest.value?.step ?? null
})

function clearHistoryRecordTimeout() {
  if (historyRecordTimeout !== null) {
    clearTimeout(historyRecordTimeout)
    historyRecordTimeout = null
  }
}

function scheduleHistoryRecord() {
  clearHistoryRecordTimeout()
  historyRecordTimeout = setTimeout(() => {
    historyRecordTimeout = null
    if (isLocked.value || !isValidHex(inputHex.value)) return
    recordHistory(normalizeHex(inputHex.value), null)
  }, HISTORY_DEBOUNCE_MS)
}

function recordHistory(hex: string, step: number | null) {
  const normalized = normalizeHex(hex)
  const existingIndex = history.value.findIndex(
    (entry) => entry.hex === normalized && entry.lockedStep === step,
  )
  if (existingIndex === 0) return
  if (existingIndex > 0) {
    history.value.splice(existingIndex, 1)
  }
  history.value.unshift({ hex: normalized, lockedStep: step })
  if (history.value.length > 30) {
    history.value.length = 30
  }
}

function regenerate(options: { recordHistory?: boolean } = {}) {
  const steps = activeSteps.value
  const shouldRecordHistory = options.recordHistory ?? true

  if (lockedStep.value !== null && lockedHex.value !== null) {
    swatches.value = generateFromLock(lockedHex.value, lockedStep.value, steps)
    closest.value = {
      step: lockedStep.value,
      hex: lockedHex.value,
      virtualStep: virtualStepFromHex(lockedHex.value),
    }
    return
  }

  if (!isValidHex(inputHex.value)) {
    swatches.value = []
    closest.value = null
    return
  }

  const normalized = normalizeHex(inputHex.value)
  swatches.value = generateFromSeed(normalized, steps)
  closest.value = findClosest(normalized, swatches.value)
  if (shouldRecordHistory) {
    scheduleHistoryRecord()
  }
}

function selectHistoryEntry(entry: HistoryEntry) {
  clearHistoryRecordTimeout()
  inputHex.value = entry.hex
  if (entry.lockedStep !== null) {
    lockedStep.value = entry.lockedStep
    lockedHex.value = normalizeHex(entry.hex)
    regenerate({ recordHistory: false })
    return
  }
  lockedStep.value = null
  lockedHex.value = null
  regenerate({ recordHistory: false })
}

function lockToClosest() {
  if (!closest.value || !isValidHex(inputHex.value)) return
  lockedStep.value = closest.value.step
  lockedHex.value = normalizeHex(inputHex.value)
  regenerate()
}

function unlock() {
  lockedStep.value = null
  lockedHex.value = null
  regenerate()
}

function toggleLock() {
  if (isLocked.value) {
    unlock()
  } else {
    lockToClosest()
  }
}

function addCustomStep(step: number) {
  if (customSteps.value.includes(step)) return
  customSteps.value = [...customSteps.value, step]
  regenerate()
}

function removeCustomStep(step: number) {
  if (!customSteps.value.includes(step)) return
  customSteps.value = customSteps.value.filter((customStep) => customStep !== step)
  if (lockedStep.value === step) {
    lockedStep.value = null
    lockedHex.value = null
  }
  regenerate()
}

async function copyHex(hex: string) {
  await navigator.clipboard.writeText(hex)
  toast.value = `Copied ${hex}`
  setTimeout(() => {
    toast.value = ''
  }, 1500)
}

watch(extensions, () => {
  regenerate()
}, { deep: true })

watch(inputHex, () => {
  if (isLocked.value) return
  regenerate()
})

onUnmounted(clearHistoryRecordTimeout)

regenerate()
</script>

<template>
  <div class="app">
    <div class="app__row">
      <div class="app__center">
        <header class="app__header">
          <h1 class="app__title">Color Ramp Builder</h1>
          <p class="app__intro">
            Start with a single brand hex and build a full Material tonal ramp using Google's HCT
            engine.
          </p>
          <ol class="app__steps">
            <li><span class="app__steps-text">See where your color sits on the ramp.</span></li>
            <li>
              <span class="app__steps-text">
                If you want the ramp to follow your exact shade, lock it to a swatch.
              </span>
            </li>
            <li><span class="app__steps-text">Export in your chosen format.</span></li>
          </ol>
        </header>

      <main class="app__main">
        <section class="panel">
          <ColorInput v-model="inputHex" />

          <div class="actions">
            <button
              class="actions__toggle"
              :class="{ 'actions__toggle--locked': isLocked }"
              type="button"
              :disabled="!isLocked && (!closest || !isValidHex(inputHex))"
              @click="toggleLock"
            >
              <svg
                v-if="isLocked"
                class="actions__icon"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
              <svg
                v-else
                class="actions__icon"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {{ isLocked ? 'Unlock' : `Lock to ${closest?.step ?? '—'}` }}
            </button>
          </div>

          <ExtensionToggles v-model="extensions" />
        </section>

        <section class="panel">
          <SwatchGrid
            :swatches="swatches"
            :closest="closest"
            :locked-step="lockedStep"
            :custom-steps="customSteps"
            @copy-hex="copyHex"
            @add-step="addCustomStep"
            @remove-step="removeCustomStep"
          />
        </section>

        <DartExport
          v-model:constant-name="constantName"
          :swatches="swatches"
          :primary-hex="primaryHex"
          :seed-step="seedStep"
        />
        </main>
      </div>

      <HistoryLog
        class="app__history"
        :entries="history"
        :active-hex="primaryHex"
        :active-locked-step="lockedStep"
        @select="selectHistoryEntry"
      />
    </div>

    <p v-if="toast" class="toast" role="status">{{ toast }}</p>
  </div>
</template>

<style scoped>
.app {
  padding: 2rem 1.5rem 3rem;
}

.app__row {
  display: grid;
  grid-template-columns: 1fr minmax(0, 52rem) 1fr;
  width: 100%;
}

.app__center {
  grid-column: 2;
}

.app__history {
  grid-column: 3;
  grid-row: 1;
  align-self: start;
  width: 14rem;
  margin-left: 1.5rem;
}

@media (max-width: 70rem) {
  .app__row {
    grid-template-columns: 1fr;
  }

  .app__center {
    grid-column: 1;
    max-width: 52rem;
    margin: 0 auto;
    width: 100%;
  }

  .app__history {
    grid-column: 1;
    grid-row: auto;
    width: 100%;
    max-width: 52rem;
    margin: 2rem auto 0;
  }
}

.app__header {
  margin-bottom: 2rem;
}

.app__title {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
}

.app__intro {
  margin: 0 0 0.75rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.app__steps {
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: step;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.app__steps li {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  counter-increment: step;
}

.app__steps li::before {
  content: counter(step);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.app__steps-text {
  position: relative;
  top: -0.0625rem;
}

.app__main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

.actions__toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  background: var(--accent);
  color: white;
}

.actions__toggle--locked {
  border-color: var(--border);
  background: var(--surface);
  color: var(--text);
}

.actions__toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.actions__icon {
  flex-shrink: 0;
}

.toast {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  margin: 0;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  background: var(--text);
  color: var(--surface);
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}
</style>
