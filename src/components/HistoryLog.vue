<script setup lang="ts">
export interface HistoryEntry {
  hex: string
  lockedStep: number | null
}

const props = defineProps<{
  entries: HistoryEntry[]
  activeHex: string
  activeLockedStep: number | null
}>()

function isActive(entry: HistoryEntry): boolean {
  return entry.hex === props.activeHex && entry.lockedStep === props.activeLockedStep
}

const emit = defineEmits<{
  select: [entry: HistoryEntry]
}>()
</script>

<template>
  <aside class="history">
    <h2 class="history__title">History</h2>
    <p v-if="entries.length === 0" class="history__empty">No palettes generated yet.</p>
    <ul v-else class="history__list">
      <li v-for="(entry, index) in entries" :key="`${entry.hex}-${entry.lockedStep ?? 'seed'}-${index}`">
        <button
          class="history__item"
          :class="{ 'history__item--active': isActive(entry) }"
          type="button"
          @click="emit('select', entry)"
        >
          <span class="history__chip" :style="{ backgroundColor: entry.hex }" />
          <span class="history__details">
            <span class="history__hex">{{ entry.hex }}</span>
            <span v-if="entry.lockedStep !== null" class="history__meta">
              Locked at {{ entry.lockedStep }}
            </span>
          </span>
        </button>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.history {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem;
  background: var(--surface);
}

.history__title {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.history__empty {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.history__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  background: var(--surface-muted);
  cursor: pointer;
  text-align: left;
}

.history__item:hover {
  border-color: var(--border);
}

.history__item--active {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, var(--surface));
}

.history__chip {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.375rem;
  border: 1px solid rgb(0 0 0 / 10%);
  flex-shrink: 0;
}

.history__details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.history__hex {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8125rem;
}

.history__meta {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
