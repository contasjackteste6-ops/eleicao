<script setup lang="ts">
import type { DashboardStatDTO } from '../../shared/types/DashboardDTO'

defineProps<{
  stat: DashboardStatDTO
}>()
</script>

<template>
  <article class="rounded-xl border border-border bg-surface p-5 shadow-soft dark:border-border-dark dark:bg-surface-dark">
    <p class="text-sm text-foreground-lightSecondary dark:text-foreground-darkSecondary">
      {{ stat.label }}
    </p>
    <strong :class="['mt-2 block text-4xl font-bold', stat.colorClass]">
      {{ stat.value }}
    </strong>
  </article>
</template>
