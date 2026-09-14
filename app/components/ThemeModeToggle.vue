<script setup lang="ts">
import { useThemeMode } from '../composables/useThemeMode'

const { label, toggleTheme } = useThemeMode()
</script>

<template>
  <button
    class="inline-flex min-h-touch items-center gap-3 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-foreground-lightSecondary shadow-soft transition hover:bg-surface-hover dark:border-border-dark dark:bg-surface-dark dark:text-foreground-darkSecondary dark:hover:bg-surface-dark-hover"
    type="button"
    @click="toggleTheme"
  >
    <span class="relative h-5 w-10 rounded-full bg-background-lightTertiary transition dark:bg-primary-500">
      <span class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition dark:translate-x-5" />
    </span>
    {{ label }}
  </button>
</template>
