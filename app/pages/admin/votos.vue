<script setup lang="ts">
import { definePageMeta, useFetch, $fetch } from '#imports'
import { ref } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-guard',
})

const activeTab = ref<'grafico' | 'auditoria'>('grafico')
const copiadoLink = ref(false)

const { data: dadosApuracao, pending, refresh } = useFetch('/api/admin/votos', {
  lazy: false,
})

const isUpdating = ref(false)
const isTogglingPublic = ref(false)

async function manualRefresh() {
  isUpdating.value = true
  try {
    const res: any = await $fetch('/api/admin/votos', {
      method: 'POST',
      body: { action: 'update_snapshot' },
    })
    if (res?.snapshot) {
      if (dadosApuracao.value) {
        dadosApuracao.value.resultado_congelado = res.snapshot
      }
    }
    await refresh()
  } catch (err: any) {
    console.error('Erro ao atualizar votos:', err)
    alert(err?.statusMessage || err?.message || 'Erro ao atualizar snapshot dos votos. Verifique a tabela no Supabase.')
  } finally {
    setTimeout(() => {
      isUpdating.value = false
    }, 400)
  }
}

async function alternarDivulgacaoPublica() {
  isTogglingPublic.value = true
  try {
    const res: any = await $fetch('/api/admin/votos', {
      method: 'POST',
      body: { action: 'toggle_public' },
    })
    if (res && typeof res.resultado_publico_ativo === 'boolean') {
      if (dadosApuracao.value) {
        dadosApuracao.value.resultado_publico_ativo = res.resultado_publico_ativo
      }
    }
    await refresh()
  } catch (err: any) {
    console.error('Erro ao alterar permissão de divulgação:', err)
    alert(err?.statusMessage || err?.message || 'Erro ao alterar liberação. Certifique-se de executar o SQL da tabela eleicoes no Supabase.')
  } finally {
    isTogglingPublic.value = false
  }
}

function copiarLinkResultado() {
  const url = `${window.location.origin}/resultado`
  navigator.clipboard.writeText(url)
  copiadoLink.value = true
  setTimeout(() => {
    copiadoLink.value = false
  }, 2500)
}
            async function excluirVoto(votoId: string, voterName: string) {
  if (!confirm(`Deseja realmente excluir o voto de ${voterName}? Isso permitirá que o eleitor vote novamente.`)) return
  try {
    await $fetch(`/api/admin/votos/${votoId}`, {
      method: 'DELETE',
    })
    await refresh()
  } catch (err: any) {
    alert(err?.statusMessage || 'Erro ao excluir voto.')
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span class="text-xs font-bold uppercase tracking-wider text-[#003B70]">Painel de Controle do Administrador</span>
        </div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight mt-1">Apuração & Auditoria de Votos</h1>
      </div>

      <!-- Ações do Cabeçalho: Botão de Atualizar e Divulgar Link -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Botão de Bloquear/Liberar Divulgação Pública -->
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-extrabold shadow-sm transition"
          :class="dadosApuracao?.resultado_publico_ativo
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
            : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'"
          :disabled="isTogglingPublic"
          @click="alternarDivulgacaoPublica"
        >
          <span>{{ dadosApuracao?.resultado_publico_ativo ? '🟢 Divulgação Pública LIBERADA' : '🔴 Divulgação BLOQUEADA' }}</span>
        </button>

        <!-- Botão de Copiar Link Público -->
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-extrabold text-slate-800 shadow-sm hover:bg-slate-50 transition"
          @click="copiarLinkResultado"
        >
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-5.367 3 3 0 000 5.367zm0 8.005a3 3 0 100-5.367 3 3 0 000 5.367z" />
          </svg>
          <span>{{ copiadoLink ? '✨ Link Copiado!' : 'Copiar Link do Gráfico' }}</span>
        </button>

        <!-- Botão Principal de Atualizar Votos Agora (Atualiza o Gráfico Público) -->
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#003B70] text-white text-xs font-extrabold shadow-lg hover:bg-[#002b52] active:scale-95 transition duration-150"
          :class="{ 'opacity-70 cursor-not-allowed': pending || isUpdating }"
          @click="manualRefresh"
        >
          <svg
            class="w-4 h-4"
            :class="{ 'animate-spin': pending || isUpdating }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ pending || isUpdating ? 'Atualizando Gráfico...' : 'Atualizar Votos Agora' }}</span>
        </button>
      </div>
    </div>

    <!-- Banner Informativo do Link Público -->
    <div class="rounded-2xl bg-blue-50 border border-blue-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
      <div class="flex items-center gap-3">
        <span class="text-xl">📢</span>
        <div>
          <strong class="font-extrabold block text-sm">Divulgação de Resultados por Link Público</strong>
          <span class="text-blue-700 font-medium">
            O resultado compartilhado no link público (<code class="bg-blue-100 px-1.5 py-0.5 rounded font-bold">/resultado</code>) só é atualizado quando você clica em <strong>"Atualizar Votos Agora"</strong>.
          </span>
        </div>
      </div>
      <a
        href="/resultado"
        target="_blank"
        class="shrink-0 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-[11px] shadow hover:bg-blue-700 transition"
      >
        Visualizar Link Público ↗
      </a>
    </div>

    <!-- Navegação de Abas (Gráfico vs Auditoria Exclusiva do Admin) -->
    <div class="flex border-b border-slate-200 gap-6">
      <button
        type="button"
        class="pb-3 text-sm font-black transition relative"
        :class="activeTab === 'grafico' ? 'text-[#003B70] border-b-3 border-[#003B70]' : 'text-slate-400 hover:text-slate-600'"
        @click="activeTab = 'grafico'"
      >
        📊 Gráfico Interativo de Apuração
      </button>
      <button
        type="button"
        class="pb-3 text-sm font-black transition relative flex items-center gap-1.5"
        :class="activeTab === 'auditoria' ? 'text-[#003B70] border-b-3 border-[#003B70]' : 'text-slate-400 hover:text-slate-600'"
        @click="activeTab = 'auditoria'"
      >
        <span>🔒 Quem Votou em Quem</span>
        <span class="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold uppercase">Apenas Admin</span>
      </button>
    </div>

    <!-- Cards de Resumo -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total de Votos</span>
          <p class="text-4xl font-black text-slate-900 mt-1">{{ dadosApuracao?.totalVotos || 0 }}</p>
        </div>
        <div class="h-12 w-12 rounded-2xl bg-[#003B70]/10 text-[#003B70] flex items-center justify-center font-black text-xl">
          🗳️
        </div>
      </div>

      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Votos em Branco</span>
          <p class="text-3xl font-black text-slate-700 mt-1">{{ dadosApuracao?.brancos || 0 }}</p>
        </div>
        <div class="h-12 w-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xl">
          ⚪
        </div>
      </div>
    </div>

    <!-- TAB 1: GRÁFICO DE BARRAS VERTICAIS COM FOTOS REDONDAS DOS CANDIDATOS -->
    <div v-if="activeTab === 'grafico'" class="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-black text-slate-900">Resultado da Apuração</h2>
          <p class="text-xs text-slate-500 font-medium">As barras sobem proporcionalmente de acordo com a votação obtida.</p>
        </div>
      </div>

      <!-- Área Visual do Gráfico (Candidatos Lado a Lado / Barras Subindo) -->
      <div class="pt-6 pb-4">
        <div class="min-h-[380px] flex items-end justify-around gap-4 border-b-2 border-slate-200 pb-2 px-2 overflow-x-auto">
          <div
            v-for="item in (dadosApuracao?.apuracao || [])"
            :key="item.id"
            class="flex flex-col items-center flex-1 max-w-[130px] min-w-[90px] group transition-all duration-300"
          >
            <!-- Porcentagem e Votos no Topo da Barra -->
            <div class="mb-3 text-center transition group-hover:scale-110">
              <span class="text-lg font-black text-slate-900 block leading-none">{{ item.porcentagem }}%</span>
              <span class="text-[11px] font-extrabold text-slate-500 block mt-0.5">{{ item.qtdVotos }} votos</span>
            </div>

            <!-- Foto Redondinha do Candidato no Topo da Barra -->
            <div class="relative mb-2 z-10">
              <div class="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 ring-4 ring-[#003B70]/10 flex items-center justify-center">
                <img v-if="item.foto_url" :src="item.foto_url" :alt="item.nome" class="h-full w-full object-cover" />
                <span v-else class="text-2xl font-black text-[#003B70] uppercase">{{ item.nome?.[0] }}</span>
              </div>
              <span class="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#003B70] text-white text-[10px] font-black shadow-md">
                {{ item.numero }}
              </span>
            </div>

            <!-- Barra que sobe proporcionalmente à porcentagem de votos -->
            <div class="w-full bg-slate-100 rounded-t-2xl flex items-end justify-center overflow-hidden h-[240px] p-1.5 border border-slate-200/80">
              <div
                class="w-full rounded-t-xl bg-gradient-to-t from-[#003B70] via-blue-600 to-emerald-400 transition-all duration-700 shadow-md"
                :style="{ height: Math.max(item.porcentagem, 4) + '%' }"
              />
            </div>

            <!-- Nome e Partido em baixo -->
            <div class="mt-3 text-center space-y-0.5">
              <p class="text-xs font-black text-slate-800 leading-tight truncate w-full uppercase">{{ item.nome }}</p>
              <p v-if="item.partido" class="text-[10px] font-bold text-[#00A859] truncate w-full uppercase">{{ item.partido }}</p>
            </div>
          </div>
        </div>

        <div v-if="!dadosApuracao?.apuracao || dadosApuracao.apuracao.length === 0" class="py-16 text-center text-sm font-bold text-slate-400">
          Nenhum candidato ou voto registrado até o momento.
        </div>
      </div>
    </div>

    <!-- TAB 2: AUDITORIA PRIVADA (SOMENTE ADMIN - QUEM VOTOU E EM QUEM) -->
    <div v-else-if="activeTab === 'auditoria'" class="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden space-y-4">
      <div class="p-6 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xl">🔒</span>
            <h2 class="text-lg font-black tracking-tight">Registro Restrito de Votação (Audit Log)</h2>
          </div>
          <p class="text-xs text-slate-400 font-medium mt-0.5">Visível estritamente para Administradores com chave Master/ServiceRole.</p>
        </div>
        <span class="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase">
          Acesso Total Autorizado
        </span>
      </div>

      <!-- Tabela de Auditoria com Coluna de Ações para Excluir Voto -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs min-w-[650px]">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
            <tr>
              <th class="py-3.5 px-6">Eleitor (Quem Votou)</th>
              <th class="py-3.5 px-6">E-mail do Eleitor</th>
              <th class="py-3.5 px-6">Voto Registrado (Em Quem)</th>
              <th class="py-3.5 px-6">Tipo do Voto</th>
              <th class="py-3.5 px-6">Data / Hora</th>
              <th class="py-3.5 px-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
            <tr v-for="voto in (dadosApuracao?.auditVotos || [])" :key="voto.id" class="hover:bg-slate-50/80 transition">
              <!-- Nome do Eleitor -->
              <td class="py-4 px-6 font-bold text-slate-900">
                <div class="flex items-center gap-2">
                  <div class="h-8 w-8 rounded-full bg-[#003B70]/10 text-[#003B70] font-black flex items-center justify-center text-xs">
                    {{ voto.voter_name?.[0] || 'E' }}
                  </div>
                  <span>{{ voto.voter_name }}</span>
                </div>
              </td>

              <!-- Email -->
              <td class="py-4 px-6 text-slate-600 font-mono text-[11px]">
                {{ voto.voter_email }}
              </td>

              <!-- Voto Registrado -->
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <img
                    v-if="voto.candidato_foto"
                    :src="voto.candidato_foto"
                    class="h-9 w-9 rounded-full object-cover border border-slate-200 shadow-sm"
                  />
                  <div>
                    <p class="font-extrabold text-slate-900">{{ voto.candidato_nome }}</p>
                    <p v-if="voto.candidato_numero !== '-'" class="text-[10px] text-slate-400 font-mono">
                      Nº {{ voto.candidato_numero }} - {{ voto.candidato_partido }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Tipo -->
              <td class="py-4 px-6">
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide"
                  :class="{
                    'bg-emerald-100 text-emerald-800': voto.tipo_voto === 'nominal',
                    'bg-slate-100 text-slate-700': voto.tipo_voto === 'branco',
                    'bg-red-100 text-red-800': voto.tipo_voto === 'nulo'
                  }"
                >
                  {{ voto.tipo_voto }}
                </span>
              </td>

              <!-- Data/Hora -->
              <td class="py-4 px-6 text-slate-500 text-[11px]">
                {{ new Date(voto.created_at).toLocaleString('pt-BR') }}
              </td>

              <!-- Ação de Excluir Voto para o usuário votar novamente -->
              <td class="py-4 px-6 text-right">
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-extrabold hover:bg-red-100 transition"
                  @click="excluirVoto(voto.id, voto.voter_name)"
                >
                  Excluir Voto
                </button>
              </td>
            </tr>

            <tr v-if="!dadosApuracao?.auditVotos || dadosApuracao.auditVotos.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400 font-bold">
                Nenhum voto auditado encontrado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
