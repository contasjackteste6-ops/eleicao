<script setup lang="ts">
import BaseIcon from '../BaseIcon.vue'

const features = [
  {
    id: 'multi-channel',
    title: 'Multiplos Canais',
    description: 'WhatsApp, Telegram, Instagram e muito mais',
  },
  {
    id: 'real-time',
    title: 'Atendimento em Tempo Real',
    description: 'Responda seus clientes instantaneamente',
  },
  {
    id: 'reports',
    title: 'Relatorios Detalhados',
    description: 'Acompanhe metricas e performance da equipe',
  },
]
</script>

<template>
  <section class="relative flex flex-1 items-center justify-center overflow-hidden bg-background-dark p-8 lg:p-16">
    <div class="absolute inset-0 border-r border-border-dark bg-background-dark" />

    <div class="relative z-10 max-w-xl">
      <div class="mb-8">
        <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-500 text-3xl font-bold text-white shadow-soft">
          C
        </div>
      </div>

      <h1 class="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl">
        Sistema de<br>
        Multi Atendimento
      </h1>

      <p class="mb-8 text-lg leading-relaxed text-foreground-darkSecondary md:text-xl">
        Gerencie todas as suas conversas em um unico lugar. Atendimento eficiente e organizado para sua equipe.
      </p>

      <div class="space-y-4">
        <div
          v-for="feature in features"
          :key="feature.id"
          class="flex items-start gap-4"
        >
          <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400">
            <BaseIcon name="check" />
          </div>
          <div>
            <h3 class="mb-1 text-lg font-semibold text-white">
              {{ feature.title }}
            </h3>
            <p class="text-foreground-darkMuted">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
