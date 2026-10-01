<script setup lang="ts">
import { definePageMeta } from '#imports'
import { ref, onMounted } from 'vue'
import type { Eleicao } from '~/shared/types/database'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-guard',
})

const eleicoes = ref<Eleicao[]>([])
const showModal = ref(false)
const eleicaoEditando = ref<Eleicao | null>(null)

const novoTitulo = ref('')
const novaDescricao = ref('')
const dataInicio = ref('')
const dataFim = ref('')
const novoStatus = ref<'rascunho' | 'em_andamento' | 'encerrada'>('em_andamento')

const isLoading = ref(true)
const isSaving = ref(false)
const errorMessage = ref('')

function setDatasPadrao() {
  const agora = new Date()
  const daqui7dias = new Date()
  daqui7dias.setDate(daqui7dias.getDate() + 7)

  dataInicio.value = agora.toISOString().slice(0, 16)
  dataFim.value = daqui7dias.toISOString().slice(0, 16)
}

function abrirModalCriar() {
  eleicaoEditando.value = null
  setDatasPadrao()
  novoTitulo.value = ''
  novaDescricao.value = ''
  novoStatus.value = 'em_andamento'
  errorMessage.value = ''
  showModal.value = true
}

function abrirModalEditar(eleicao: Eleicao) {
  eleicaoEditando.value = eleicao
  novoTitulo.value = eleicao.titulo
  novaDescricao.value = eleicao.descricao || ''
  novoStatus.value = eleicao.status

  if (eleicao.data_inicio) {
    dataInicio.value = new Date(eleicao.data_inicio).toISOString().slice(0, 16)
  }
  if (eleicao.data_fim) {
    dataFim.value = new Date(eleicao.data_fim).toISOString().slice(0, 16)
  }

  errorMessage.value = ''
  showModal.value = true
}

function fecharModal() {
  showModal.value = false
  eleicaoEditando.value = null
}

async function carregarEleicoes() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = await $fetch<Eleicao[]>('/api/admin/eleicoes')
    eleicoes.value = data || []
  } catch (err: any) {
    errorMessage.value = err?.statusMessage || 'Erro ao carregar lista de eleições.'
  } finally {
    isLoading.value = false
  }
}

async function salvarEleicao() {
  if (!novoTitulo.value || !dataFim.value) {
    errorMessage.value = 'Preencha o título e a data de encerramento.'
    return
  }

  isSaving.value = true
  errorMessage.value = ''

  try {
    const payload = {
      titulo: novoTitulo.value,
      descricao: novaDescricao.value,
      data_inicio: dataInicio.value ? new Date(dataInicio.value).toISOString() : new Date().toISOString(),
      data_fim: new Date(dataFim.value).toISOString(),
      status: novoStatus.value,
    }

    if (eleicaoEditando.value) {
      // Editar eleição existente
      await $fetch(`/api/admin/eleicoes/${eleicaoEditando.value.id}`, {
        method: 'PUT',
        body: payload,
      })
    } else {
      // Criar nova eleição
      await $fetch('/api/admin/eleicoes', {
        method: 'POST',
        body: payload,
      })
    }

    fecharModal()
    await carregarEleicoes()
  } catch (err: any) {
    errorMessage.value = err?.statusMessage || 'Erro ao salvar eleição.'
  } finally {
    isSaving.value = false
  }
}

async function alterarStatus(eleicao: Eleicao, proximoStatus: 'rascunho' | 'em_andamento' | 'encerrada') {
  try {
    await $fetch(`/api/admin/eleicoes/${eleicao.id}`, {
      method: 'PUT',
      body: { status: proximoStatus }
    })
    await carregarEleicoes()
  } catch (err: any) {
    errorMessage.value = err?.statusMessage || 'Erro ao alterar status.'
  }
}

async function excluirEleicao(id: string) {
  if (!confirm('Tem certeza que deseja excluir esta eleição?')) return
  try {
    await $fetch(`/api/admin/eleicoes/${id}`, {
      method: 'DELETE',
    })
    await carregarEleicoes()
  } catch (err: any) {
    errorMessage.value = err?.statusMessage || 'Erro ao excluir eleição.'
  }
}

onMounted(() => {
  carregarEleicoes()
})
</script>

<template>
  <div class="space-y-8">
    <!-- Header com botão para abrir Modal de Nova Eleição -->
    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-[#003B70]">Gestão Pleitoral</span>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight mt-1">Eleições</h1>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#003B70] text-white font-bold text-xs shadow-sm hover:bg-[#002B54] transition active:scale-95"
          @click="abrirModalCriar"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Nova Eleição
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          @click="carregarEleicoes"
        >
          Atualizar Lista
        </button>
      </div>
    </div>

    <!-- Mensagem de Erro se houver -->
    <div v-if="errorMessage && !showModal" class="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
      {{ errorMessage }}
    </div>

    <!-- Modal Modal/Card de Criação/Edição de Eleição -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div class="w-full max-w-xl rounded-3xl bg-white p-7 shadow-2xl space-y-6 animate-fade-in border border-slate-100">
          <!-- Cabeçalho Modal -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 class="text-xl font-black text-slate-900">
                {{ eleicaoEditando ? 'Editar Eleição' : 'Cadastrar Nova Eleição' }}
              </h2>
              <p class="text-xs text-slate-400 font-medium">Preencha os dados do pleito eleitoral</p>
            </div>

            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              @click="fecharModal"
            >
              ✕
            </button>
          </div>

          <!-- Mensagem de Erro Modal -->
          <div v-if="errorMessage" class="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold">
            {{ errorMessage }}
          </div>

          <!-- Campos do Formulário -->
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Título da Eleição *</label>
              <input
                v-model="novoTitulo"
                type="text"
                placeholder="Ex: Eleição Presidencial 2026"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-[#003B70]"
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Descrição (Opcional)</label>
              <textarea
                v-model="novaDescricao"
                rows="2"
                placeholder="Ex: Pleito oficial da Galáxia"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-[#003B70]"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Data de Início</label>
                <input
                  v-model="dataInicio"
                  type="datetime-local"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-[#003B70]"
                />
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Data de Término *</label>
                <input
                  v-model="dataFim"
                  type="datetime-local"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-[#003B70]"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Status</label>
              <select v-model="novoStatus" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white">
                <option value="em_andamento">Em Andamento (Aberta para Votação)</option>
                <option value="rascunho">Rascunho</option>
                <option value="encerrada">Encerrada</option>
              </select>
            </div>
          </div>

          <!-- Rodapé de Ações Modal -->
          <div class="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              class="px-5 py-2.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
              @click="fecharModal"
            >
              Cancelar
            </button>

            <button
              type="button"
              :disabled="isSaving || !novoTitulo || !dataFim"
              class="px-6 py-2.5 rounded-full bg-[#003B70] text-white font-bold text-xs hover:bg-[#002B54] transition disabled:opacity-50"
              @click="salvarEleicao"
            >
              {{ isSaving ? 'Salvando...' : 'Salvar Eleição' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Tabela de Eleições com opção de Editar -->
    <div class="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="text-sm font-extrabold text-slate-800">Pleitos Cadastrados</h3>
        <span class="text-xs font-semibold text-slate-400">Total: {{ eleicoes.length }}</span>
      </div>

      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
          <tr>
            <th class="py-3.5 px-6">Eleição</th>
            <th class="py-3.5 px-6">Período</th>
            <th class="py-3.5 px-6">Status</th>
            <th class="py-3.5 px-6 text-right">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
          <tr v-for="e in eleicoes" :key="e.id" class="hover:bg-slate-50/50 transition">
            <td class="py-4 px-6 font-bold text-slate-900">
              {{ e.titulo }}
              <span v-if="e.descricao" class="block text-xs font-normal text-slate-400">{{ e.descricao }}</span>
            </td>
            <td class="py-4 px-6 text-xs text-slate-500">
              <div>Início: {{ new Date(e.data_inicio).toLocaleString('pt-BR') }}</div>
              <div>Fim: {{ new Date(e.data_fim).toLocaleString('pt-BR') }}</div>
            </td>
            <td class="py-4 px-6">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-bold',
                  e.status === 'em_andamento'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : e.status === 'encerrada'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-slate-100 text-slate-600'
                ]"
              >
                {{ e.status === 'em_andamento' ? 'Em Andamento' : e.status === 'encerrada' ? 'Encerrada' : 'Rascunho' }}
              </span>
            </td>
            <td class="py-4 px-6 text-right space-x-3">
              <!-- Botão Editar Eleição -->
              <button
                type="button"
                class="text-xs font-bold text-[#003B70] hover:underline"
                @click="abrirModalEditar(e)"
              >
                Editar
              </button>

              <button
                v-if="e.status !== 'em_andamento'"
                type="button"
                class="text-xs font-bold text-emerald-600 hover:underline"
                @click="alterarStatus(e, 'em_andamento')"
              >
                Abrir
              </button>
              <button
                v-if="e.status === 'em_andamento'"
                type="button"
                class="text-xs font-bold text-amber-600 hover:underline"
                @click="alterarStatus(e, 'encerrada')"
              >
                Encerrar
              </button>
              <button
                type="button"
                class="text-xs font-bold text-red-500 hover:underline"
                @click="excluirEleicao(e.id)"
              >
                Excluir
              </button>
            </td>
          </tr>

          <tr v-if="eleicoes.length === 0 && !isLoading">
            <td colspan="4" class="py-8 px-6 text-center text-xs font-medium text-slate-400">
              Nenhuma eleição cadastrada. Clique em "+ Nova Eleição" acima.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
