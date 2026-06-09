<script setup lang="ts">
import { ref, watch } from 'vue'
import { exportDart, type DartExportFormat } from '../lib/exportDart'
import type { Swatch } from '../lib/palette'

const props = defineProps<{
  swatches: Swatch[]
  primaryHex: string
  seedStep: number | null
}>()

const constantName = defineModel<string>('constantName', { default: 'PRIMARY' })
const exportFormat = ref<DartExportFormat>('materialColor')
const dartCode = ref('')
const copyLabel = ref('Copy')
const error = ref('')

watch(
  () =>
    [props.swatches, props.primaryHex, props.seedStep, constantName.value, exportFormat.value] as const,
  () => {
    try {
      dartCode.value = exportDart(
        exportFormat.value,
        props.swatches,
        constantName.value,
        props.primaryHex,
        props.seedStep,
      )
      error.value = ''
    } catch (e) {
      dartCode.value = ''
      error.value = e instanceof Error ? e.message : 'Export failed'
    }
  },
  { immediate: true, deep: true },
)

async function copyDart() {
  if (!dartCode.value) return
  await navigator.clipboard.writeText(dartCode.value)
  copyLabel.value = 'Copied!'
  setTimeout(() => {
    copyLabel.value = 'Copy'
  }, 1500)
}
</script>

<template>
  <section class="dart-export">
    <div class="dart-export__header">
      <h2 class="dart-export__title">Flutter export</h2>
      <div class="dart-export__controls">
        <label class="dart-export__field">
          Format
          <select v-model="exportFormat" class="dart-export__select">
            <option value="materialColor">MaterialColor</option>
            <option value="colorConstants">Color constants</option>
          </select>
        </label>
        <label class="dart-export__field">
          Constant name
          <input
            v-model="constantName"
            class="dart-export__name-input"
            type="text"
            spellcheck="false"
          />
        </label>
      </div>
    </div>
    <p v-if="error" class="dart-export__error">{{ error }}</p>
    <pre class="dart-export__code">{{ dartCode }}</pre>
    <button
      class="dart-export__copy"
      type="button"
      :disabled="!dartCode"
      @click="copyDart"
    >
      {{ copyLabel }}
    </button>
  </section>
</template>

<style scoped>
.dart-export {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem;
  background: var(--surface);
}

.dart-export__header {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.dart-export__title {
  margin: 0;
  font-size: 1rem;
}

.dart-export__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.dart-export__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
}

.dart-export__select,
.dart-export__name-input {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.875rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: var(--surface-muted);
  color: var(--text);
}

.dart-export__name-input {
  min-width: 10rem;
}

.dart-export__error {
  color: var(--error);
  font-size: 0.875rem;
  margin: 0 0 0.75rem;
}

.dart-export__code {
  margin: 0;
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--surface-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8125rem;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre;
}

.dart-export__copy {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--accent);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.dart-export__copy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
