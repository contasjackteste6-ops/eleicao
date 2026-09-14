<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

type ThemeMode = 'light' | 'dark'

const mode = ref<ThemeMode>('light')

const label = computed(() => mode.value === 'dark' ? 'Modo dark' : 'Modo light')

function toggleTheme(): void {
  mode.value = mode.value === 'dark' ? 'light' : 'dark'
}

watch(mode, (value) => {
  document.documentElement.classList.toggle('dark', value === 'dark')
}, { flush: 'post' })

onMounted(() => {
  mode.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
})
</script>

<template>
  <button
    class="inline-flex min-h-touch items-center gap-3 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-neutral-700 shadow-soft transition hover:bg-neutral-50 dark:border-border-dark dark:bg-surface-dark dark:text-neutral-100 dark:hover:bg-surface-dark-muted"
    type="button"
    @click="toggleTheme"
  >
    <span class="relative h-5 w-10 rounded-full bg-neutral-300 transition dark:bg-primary-500">
      <span class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition dark:translate-x-5" />
    </span>
    {{ label }}
  </button>
</template>
