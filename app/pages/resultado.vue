<script setup lang="ts">
import { useFetch } from '#imports'

const { data: publicResult, pending } = useFetch('/api/publico/resultado')
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased py-4 sm:py-8 px-3 sm:px-6">
    <div class="max-w-4xl mx-auto space-y-5 sm:space-y-8">
      
      <!-- Topo / Cabeçalho -->
      <div class="flex items-center justify-between border-b border-slate-200 pb-4 sm:pb-6">
        <div class="flex items-center gap-3 sm:gap-4">
          <img src="/eleicoes2026.png" alt="Eleições 2026" class="h-10 sm:h-12 w-auto object-contain" />
          <div>
            <span class="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#003B70]">Boletim de Apuração</span>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">{{ publicResult?.titulo || 'Resultado da Eleição' }}</h1>
          </div>
        </div>
      </div>

      <!-- CASO 1: APURAÇÃO BLOQUEADA PELO ADMIN -->
      <div v-if="!pending && !publicResult?.ativo" class="rounded-3xl border-2 border-amber-200 bg-amber-50/80 p-6 sm:p-8 text-center space-y-4 shadow-sm my-8">
        <div class="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl sm:text-3xl font-black">
          🔒
        </div>
        <div class="max-w-md mx-auto space-y-2">
          <h2 class="text-lg sm:text-xl font-black text-amber-900">Divulgação Indisponível</h2>
          <p class="text-xs font-medium text-amber-800 leading-relaxed">
            {{ publicResult?.mensagem || 'A divulgação do resultado da apuração está temporariamente pausada ou não foi liberada pelo administrador.' }}
          </p>
        </div>
      </div>

      <!-- CASO 2: GRÁFICO PÚBLICO LIBERADO -->
      <div v-else-if="publicResult?.ativo" class="space-y-6 sm:space-y-8">
        
        <!-- O Gráfico de Barras Ajustado para PC e Celular sem Quebras -->
        <div class="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 sm:p-8 space-y-4 sm:space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 class="text-lg sm:text-xl font-black text-slate-900">Gráfico Oficial de Apuração</h2>
            <p class="text-[11px] sm:text-xs text-slate-500 font-medium">
              Última atualização: {{ publicResult.data?.updated_at ? new Date(publicResult.data.updated_at).toLocaleString('pt-BR') : '-' }}
            </p>
          </div>

          <div class="pt-4 pb-2">
            <!-- Container responsivo que cabe perfeitamente em telas móveis e desktop -->
            <div class="min-h-[340px] sm:min-h-[380px] flex items-end justify-center sm:justify-around gap-2 sm:gap-4 border-b-2 border-slate-200 pb-3 px-1 overflow-x-auto">
              <div
                v-for="item in (publicResult.data?.apuracao || [])"
                :key="item.id"
                class="flex flex-col items-center flex-1 max-w-[120px] min-w-[75px] sm:min-w-[95px] group transition-all duration-300"
              >
                <!-- Porcentagem e Votos -->
                <div class="mb-2 sm:mb-3 text-center">
                  <span class="text-base sm:text-lg font-black text-slate-900 block leading-none">{{ item.porcentagem }}%</span>
                  <span class="text-[10px] sm:text-[11px] font-extrabold text-slate-500 block mt-0.5">{{ item.qtdVotos }} {{ item.qtdVotos === 1 ? 'voto' : 'votos' }}</span>
                </div>

                <!-- Foto Redondinha -->
                <div class="relative mb-1.5 sm:mb-2 z-10">
                  <div class="h-12 w-12 sm:h-20 sm:w-20 rounded-full border-3 sm:border-4 border-white shadow-lg overflow-hidden bg-slate-100 ring-2 sm:ring-4 ring-[#003B70]/10 flex items-center justify-center">
                    <img v-if="item.foto_url" :src="item.foto_url" :alt="item.nome" class="h-full w-full object-cover" />
                    <span v-else class="text-xl sm:text-2xl font-black text-[#003B70] uppercase">{{ item.nome?.[0] }}</span>
                  </div>
                  <span class="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#003B70] text-white text-[9px] sm:text-[10px] font-black shadow-md">
                    {{ item.numero }}
                  </span>
                </div>

                <!-- Barra Vertical -->
                <div class="w-full bg-slate-100 rounded-t-xl sm:rounded-t-2xl flex items-end justify-center overflow-hidden h-[200px] sm:h-[240px] p-1 sm:p-1.5 border border-slate-200/80">
                  <div
                    class="w-full rounded-t-lg sm:rounded-t-xl bg-gradient-to-t from-[#003B70] via-blue-600 to-emerald-400 transition-all duration-700 shadow-md"
                    :style="{ height: Math.max(item.porcentagem, 5) + '%' }"
                  />
                </div>

                <!-- Nome e Partido -->
                <div class="mt-2.5 text-center space-y-0.5 w-full">
                  <p class="text-[11px] sm:text-xs font-black text-slate-800 leading-tight truncate w-full uppercase">{{ item.nome }}</p>
                  <p v-if="item.partido" class="text-[9px] sm:text-[10px] font-bold text-[#00A859] truncate w-full uppercase">{{ item.partido }}</p>
                </div>
              </div>
            </div>

            <div v-if="!publicResult.data?.apuracao || publicResult.data.apuracao.length === 0" class="py-12 text-center text-xs sm:text-sm font-bold text-slate-400">
              Nenhum dado publicado no boletim de apuração.
            </div>
          </div>
        </div>

      </div>

      <!-- Rodapé -->
      <div class="text-center text-[10px] sm:text-xs font-bold text-slate-400 py-3">
        Justiça Eleitoral • Apuração Oficial em Ambiente Seguro
      </div>

    </div>
  </div>
</template>
