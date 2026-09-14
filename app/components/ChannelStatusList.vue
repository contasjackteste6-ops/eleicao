<script setup lang="ts">
import type { DashboardChannelDTO } from '../../shared/types/DashboardDTO'

defineProps<{
  channels: DashboardChannelDTO[]
}>()
</script>

<template>
  <section class="rounded-2xl border border-border bg-surface p-5 shadow-panel dark:border-border-dark dark:bg-surface-dark">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold">
          Canais
        </h2>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          Componentes simples para testar badges e listas.
        </p>
      </div>
      <span class="rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold text-secondary-700 dark:bg-secondary-900 dark:text-secondary-200">
        {{ channels.length }} setores
      </span>
    </div>

    <div class="mt-5 divide-y divide-border dark:divide-border-dark">
      <div
        v-for="channel in channels"
        :key="channel.id"
        class="flex items-center justify-between gap-4 py-4"
      >
        <div>
          <p class="font-medium">
            {{ channel.name }}
          </p>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            {{ channel.description }}
          </p>
        </div>
        <span :class="['rounded-full px-3 py-1 text-xs font-semibold', channel.toneClass]">
          {{ channel.status }}
        </span>
      </div>
    </div>
  </section>
</template>
