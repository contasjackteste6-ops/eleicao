<script setup lang="ts">
import { definePageMeta, useFetch } from '#imports'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-guard',
})

const { data: stats, pending, refresh } = useFetch('/api/admin/stats', {
  lazy: false,
})
</script>

<template>
  <div class="space-y-10">
    <!-- Bloco 1: Total Balance Header (Wise Style) -->
    <div class="space-y-4">
      <span class="text-xs font-semibold text-slate-500">Total de Eleitores / Votos Computados</span>
      
      <div class="flex items-baseline gap-2">
        <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">
          {{ pending ? '...' : `${stats?.totalVotos || 0} VOTOS` }}
        </h1>
        <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
          ↑
        </span>
      </div>

      <!-- Botões de Ação Rápida no Estilo Wise/Clean -->
      <div class="flex flex-wrap items-center gap-3 pt-1">
        <NuxtLink
          to="/admin/eleicoes"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#003B70] text-white font-bold text-xs shadow-sm hover:bg-[#002B54] transition active:scale-95"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Gerenciar Eleições
        </NuxtLink>

        <NuxtLink
          to="/admin/candidatos"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Novo Candidato
        </NuxtLink>

        <NuxtLink
          to="/admin/votos"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Apuração ao Vivo
        </NuxtLink>
      </div>
    </div>

    <!-- Bloco 2: Cards com Cantos Arredondados e Estatísticas Reais -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      <!-- Card 1: Eleições -->
      <NuxtLink to="/admin/eleicoes" class="rounded-3xl bg-[#F2F4F5] p-6 flex flex-col justify-between min-h-[160px] hover:bg-slate-100 transition group">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-sm text-[#003B70] shadow-sm">
              🇧🇷
            </div>
            <span class="font-bold text-sm text-slate-800">Eleições</span>
          </div>
          <span class="text-xs text-[#003B70] font-bold group-hover:underline">Acessar ↗</span>
        </div>
        <div class="mt-6">
          <span class="block text-xs font-semibold text-slate-400">Pleitos cadastrados</span>
          <span class="text-3xl font-black text-slate-900">{{ stats?.totalEleicoes || 0 }}</span>
        </div>
      </NuxtLink>

      <!-- Card 2: Candidatos -->
      <NuxtLink to="/admin/candidatos" class="rounded-3xl bg-[#F2F4F5] p-6 flex flex-col justify-between min-h-[160px] hover:bg-slate-100 transition group">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-sm text-emerald-600 shadow-sm">
              👥
            </div>
            <span class="font-bold text-sm text-slate-800">Candidatos</span>
          </div>
          <span class="text-xs text-[#003B70] font-bold group-hover:underline">Acessar ↗</span>
        </div>
        <div class="mt-6">
          <span class="block text-xs font-semibold text-slate-400">Total cadastrados</span>
          <span class="text-3xl font-black text-slate-900">{{ stats?.totalCandidatos || 0 }}</span>
        </div>
      </NuxtLink>

      <!-- Card 3: Apuração & Gráfico -->
      <NuxtLink to="/admin/votos" class="rounded-3xl bg-[#F2F4F5] p-6 flex flex-col justify-between min-h-[160px] hover:bg-slate-100 transition group">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#003B70] font-bold text-lg shadow-sm">
              📊
            </div>
            <span class="font-bold text-sm text-slate-800">Apuração & Divulgação</span>
          </div>
          <span class="text-xs text-[#003B70] font-bold group-hover:underline">Ver Apuração ↗</span>
        </div>
        <div class="mt-6">
          <span class="block text-xs font-semibold text-slate-400">Votos em tempo real</span>
          <span class="text-3xl font-black text-slate-900">{{ stats?.totalVotos || 0 }}</span>
        </div>
      </NuxtLink>

    </div>

    <!-- Bloco 3: Lista de Atividades Recentes em Tempo Real -->
    <div class="space-y-6 pt-2">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 class="text-xl font-black text-slate-900">Últimas Atividades</h2>
          <p class="text-xs text-slate-400 font-medium">Registros recentes de entrada na urna eletrônica</p>
        </div>
        <button type="button" class="text-xs font-bold text-[#003B70] hover:underline flex items-center gap-1" @click="refresh()">
          <span>🔄 Atualizar Dados</span>
        </button>
      </div>

      <div class="space-y-3">
        <div
          v-for="atv in (stats?.ultimasAtividades || [])"
          :key="atv.id"
          class="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-slate-200 transition"
        >
          <div class="flex items-center gap-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 font-black text-sm">
              ✓
            </div>
            <div>
              <p class="text-sm font-extrabold text-slate-900">Voto Confirmado na Urna</p>
              <p class="text-xs text-slate-400 font-medium">
                Voto: <strong class="text-slate-700 uppercase">{{ atv.candidato_nome }}</strong> ({{ atv.tipo_voto }})
              </p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-xs font-black text-emerald-600 block">+1 Voto</span>
            <span class="text-[10px] text-slate-400 block font-mono">
              {{ new Date(atv.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}
            </span>
          </div>
        </div>

        <div v-if="!stats?.ultimasAtividades || stats.ultimasAtividades.length === 0" class="text-xs font-bold text-slate-400 py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          Nenhum voto registrado até o momento.
        </div>
      </div>
    </div>
  </div>
</template>
