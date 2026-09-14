<script setup lang="ts">
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
  <section class="relative flex flex-1 items-center justify-center overflow-hidden bg-gray-950 p-8 lg:p-16">
    <div class="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent" />
    <div class="absolute left-20 top-20 h-72 w-72 rounded-full bg-primary-500/5 blur-3xl" />
    <div class="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-primary-500/5 blur-3xl" />

    <div class="relative z-10 max-w-xl">
      <div class="mb-8">
        <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-3xl font-bold text-white shadow-2xl">
          C
        </div>
      </div>

      <h1 class="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl">
        Sistema de<br>
        Multi Atendimento
      </h1>

      <p class="mb-8 text-lg leading-relaxed text-gray-300 md:text-xl">
        Gerencie todas as suas conversas em um unico lugar. Atendimento eficiente e organizado para sua equipe.
      </p>

      <div class="space-y-4">
        <div
          v-for="feature in features"
          :key="feature.id"
          class="flex items-start gap-4"
        >
          <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-500/20 text-lg font-bold text-primary-400">
            ✓
          </div>
          <div>
            <h3 class="mb-1 text-lg font-semibold text-white">
              {{ feature.title }}
            </h3>
            <p class="text-gray-400">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
