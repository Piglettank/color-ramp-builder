<script setup lang="ts">
import type { ExtensionToggles } from '../lib/swatchSteps'

const model = defineModel<ExtensionToggles>({ required: true })
</script>

<template>
  <label class="extensions">
    <input v-model="model.enabled" type="checkbox" />
    <span class="extensions__text">
      Include extended swatches (50, 950, 980)
    </span>
  </label>
</template>

<style scoped>
.extensions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.extensions__text {
  color: var(--text);
}
</style>
