<script setup lang="ts">
import { definePageMeta } from '#imports'
import { ref, onMounted } from 'vue'
import type { Candidato, Eleicao } from '~/shared/types/database'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-guard',
})

const candidatos = ref<Candidato[]>([])
const eleicoes = ref<Eleicao[]>([])
const showModal = ref(false)
const isEditing = ref(false)
const candidatoIdEdicao = ref<string | null>(null)

// Form fields
const eleicaoId = ref('')
const nome = ref('')
const numero = ref('')
const partido = ref('')
const descricao = ref('')
const fotoUrl = ref('')

const isLoading = ref(true)
const isSaving = ref(false)
const isUploadingPhoto = ref(false)
const errorMessage = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

function acionarInputArquivo() {
  fileInput.value?.click()
}

async function fazerUploadFoto(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  const formData = new FormData()
  formData.append('file', file)

  isUploadingPhoto.value = true
  errorMessage.value = ''

  try {
    const res = await $fetch<{ url: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    if (res?.url) {
      fotoUrl.value = res.url
    }
  } catch (err: any) {
    errorMessage.value = err?.statusMessage || 'Erro ao fazer upload da foto.'
  } finally {
    isUploadingPhoto.value = false
    if (input) input.value = ''
  }
}

async function carregarDados() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [cdData, elData] = await Promise.all([
      $fetch<Candidato[]>('/api/admin/candidatos'),
      $fetch<Eleicao[]>('/api/admin/eleicoes'),
    ])
    candidatos.value = cdData || []
    eleicoes.value = elData || []
  } catch (err: any) {
    errorMessage.value = err?.statusMessage || 'Erro ao carregar candidatos.'
  } finally {
    isLoading.value = false
  }
}

function abrirModalNovo() {
  isEditing.value = false
  candidatoIdEdicao.value = null
  nome.value = ''
  numero.value = ''
  partido.value = ''
  descricao.value = ''
  fotoUrl.value = ''
  eleicaoId.value = eleicoes.value[0]?.id || ''
  errorMessage.value = ''
  showModal.value = true
}

function abrirModalEditar(candidato: Candidato) {
  isEditing.value = true
  candidatoIdEdicao.value = candidato.id
  nome.value = candidato.nome
  numero.value = candidato.numero
  partido.value = candidato.partido || ''
  descricao.value = candidato.descricao || ''
  fotoUrl.value = candidato.foto_url || ''
  eleicaoId.value = candidato.eleicao_id || eleicoes.value[0]?.id || ''
  errorMessage.value = ''
  showModal.value = true
}

function fecharModal() {
  showModal.value = false
}

async function salvarCandidato() {
  if (!eleicaoId.value) {
    errorMessage.value = 'Você precisa cadastrar uma Eleição antes de criar um candidato.'
    return
  }

  if (!nome.value || !numero.value) {
    errorMessage.value = 'Preencha o Nome e o Número do Candidato.'
    return
  }

  isSaving.value = true
  errorMessage.value = ''

  const payload = {
    eleicao_id: eleicaoId.value || null,
    nome: nome.value,
    numero: numero.value,
    partido: partido.value || null,
    descricao: descricao.value || null,
    foto_url: fotoUrl.value || null,
  }

  try {
    if (isEditing.value && candidatoIdEdicao.value) {
      await $fetch(`/api/admin/candidatos/${candidatoIdEdicao.value}`, {
        method: 'PUT',
        body: payload,
      })
    } else {
      await $fetch('/api/admin/candidatos', {
        method: 'POST',
        body: payload,
      })
    }

    fecharModal()
    await carregarDados()
  } catch (err: any) {
    errorMessage.value = err?.statusMessage || 'Erro ao salvar candidato.'
  } finally {
    isSaving.value = false
  }
}

async function excluirCandidato(id: string) {
  if (!confirm('Tem certeza que deseja excluir este candidato?')) return
  try {
    await $fetch(`/api/admin/candidatos/${id}`, {
      method: 'DELETE',
    })
    await carregarDados()
  } catch (err: any) {
    errorMessage.value = err?.statusMessage || 'Erro ao excluir candidato.'
  }
}

onMounted(() => {
  carregarDados()
})
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-[#003B70]">Candidaturas</span>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight mt-1">Candidatos</h1>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#003B70] text-white font-bold text-xs shadow-sm hover:bg-[#002B54] transition active:scale-95"
          @click="abrirModalNovo"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Novo Candidato
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          @click="carregarDados"
        >
          Atualizar Lista
        </button>
      </div>
    </div>

    <!-- Mensagem de Erro se houver -->
    <div v-if="errorMessage && !showModal" class="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
      {{ errorMessage }}
    </div>

    <!-- Modal Modal/Card de Cadastro e Edição de Candidato -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div class="w-full max-w-xl rounded-3xl bg-white p-7 shadow-2xl space-y-6 animate-fade-in border border-slate-100 max-h-[90vh] overflow-y-auto">
          <!-- Cabeçalho Modal -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 class="text-xl font-black text-slate-900">
                {{ isEditing ? 'Editar Candidato' : 'Cadastrar Novo Candidato' }}
              </h2>
              <p class="text-xs text-slate-400 font-medium">Preencha os dados do candidato</p>
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
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Eleição Vinculada</label>
              <select v-model="eleicaoId" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:bg-white">
                <option v-for="e in eleicoes" :key="e.id" :value="e.id">
                  {{ e.titulo }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nome do Candidato *</label>
                <input
                  v-model="nome"
                  type="text"
                  placeholder="Ex: Candidato Alien 1"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-[#003B70]"
                />
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Número na Urna *</label>
                <input
                  v-model="numero"
                  type="text"
                  placeholder="Ex: 13, 22, 45"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-[#003B70]"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Partido / Aliança</label>
              <input
                v-model="partido"
                type="text"
                placeholder="Ex: Partido Intergaláctico"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-[#003B70]"
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Foto do Candidato</label>
              <div class="flex items-center gap-3">
                <!-- Miniatura de Pré-visualização -->
                <div class="h-12 w-12 overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <img v-if="fotoUrl" :src="fotoUrl" alt="Foto" class="h-full w-full object-cover" />
                  <svg v-else class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                <!-- Input Escondido e Botão Upar -->
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="fazerUploadFoto"
                />

                <button
                  type="button"
                  :disabled="isUploadingPhoto"
                  class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50 shrink-0"
                  @click="acionarInputArquivo"
                >
                  <svg class="h-4 w-4 text-[#003B70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {{ isUploadingPhoto ? 'Enviando...' : 'Upar Foto' }}
                </button>

                <!-- Input Texto para URL Direta/Link -->
                <input
                  v-model="fotoUrl"
                  type="text"
                  placeholder="Ou cole a URL..."
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-[#003B70]"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Descrição / Biografia (Opcional)</label>
              <textarea
                v-model="descricao"
                rows="2"
                placeholder="Ex: Representante da Galáxia Alfa"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-[#003B70]"
              />
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
              :disabled="isSaving || !nome || !numero"
              class="px-6 py-2.5 rounded-full bg-[#003B70] text-white font-bold text-xs hover:bg-[#002B54] transition disabled:opacity-50"
              @click="salvarCandidato"
            >
              {{ isSaving ? 'Salvando...' : 'Salvar Candidato' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Exibição de Candidatos em CRACHÁS VERTICAIS (Vertical ID Badges Grid) -->
    <div v-if="!isLoading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
        v-for="c in candidatos"
        :key="c.id"
        class="group relative rounded-3xl border-2 border-slate-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between text-center"
      >
        <!-- Furo Superior do Crachá (Lanyard Clip Slot) -->
        <div class="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
          <div class="h-3 w-14 rounded-full bg-slate-300 border border-slate-400/80 shadow-inner"></div>
        </div>

        <!-- Faixa Superior do Crachá (Justiça Eleitoral Header) -->
        <div class="bg-[#003B70] pt-7 pb-3.5 px-4 text-center text-white relative border-b-2 border-[#00A859]">
          <div class="flex items-center justify-center gap-1.5 opacity-95">
            <svg class="h-3.5 w-3.5 text-[#FFCC00]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="text-[11px] font-black uppercase tracking-widest text-[#FFCC00]">JUSTIÇA ELEITORAL</span>
          </div>
          <p class="text-[9px] font-bold uppercase tracking-wider text-slate-200 mt-0.5">CANDIDATO OFICIAL</p>
        </div>

        <!-- Corpo Vertical do Crachá -->
        <div class="p-6 flex flex-col items-center space-y-4">
          <!-- Moldura de Foto Centralizada em Formato Retrato (Vertical 3:4) -->
          <div class="h-36 w-28 rounded-2xl bg-slate-100 border-2 border-slate-200 shadow-md overflow-hidden shrink-0 flex flex-col items-center justify-center relative">
            <img v-if="c.foto_url" :src="c.foto_url" alt="Foto Candidato" class="h-full w-full object-cover" />
            <div v-else class="flex flex-col items-center justify-center text-slate-400 p-2">
              <span class="text-3xl font-black text-[#003B70] uppercase">
                {{ c.nome?.[0] || 'C' }}
              </span>
              <span class="text-[9px] font-bold text-slate-400 uppercase mt-1">Sem foto</span>
            </div>
          </div>

          <!-- Nome e Partido Centralizados -->
          <div class="space-y-1 w-full">
            <h3 class="font-black text-lg text-slate-900 leading-snug line-clamp-2 px-1" :title="c.nome">{{ c.nome }}</h3>
            <div class="pt-1">
              <span v-if="c.partido" class="inline-block px-3 py-1 rounded-full bg-emerald-50 text-[#00A859] border border-emerald-200 text-xs font-extrabold max-w-full truncate">
                {{ c.partido }}
              </span>
              <span v-else class="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                Sem partido
              </span>
            </div>
          </div>

          <!-- Número da Urna em Destaque Central (Carimbo do Crachá) -->
          <div class="w-full bg-[#003B70] text-white py-2 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2">
            <span class="text-xs font-bold uppercase tracking-widest opacity-80">Nº URNA</span>
            <span class="font-mono font-black text-2xl tracking-wider leading-none text-[#FFCC00]">{{ c.numero }}</span>
          </div>

          <!-- Eleição Vinculada Badge -->
          <div class="w-full text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 flex items-center justify-between">
            <span class="font-bold text-slate-400 text-[10px] uppercase">Eleição</span>
            <span class="font-extrabold text-[#003B70] text-[11px] truncate max-w-[140px]">
              {{ eleicoes.find(e => e.id === c.eleicao_id)?.titulo || 'Geral' }}
            </span>
          </div>

          <!-- Biografia se houver -->
          <p v-if="c.descricao" class="text-xs font-medium text-slate-500 line-clamp-2 italic bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/60 w-full text-left">
            "{{ c.descricao }}"
          </p>
        </div>

        <!-- Rodapé com Ações de Gerenciamento -->
        <div class="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID #{{ c.numero }}</span>

          <div class="flex items-center gap-3">
            <button
              type="button"
              class="text-xs font-extrabold text-[#003B70] hover:text-[#002B54] hover:underline"
              @click="abrirModalEditar(c)"
            >
              Editar
            </button>
            <button
              type="button"
              class="text-xs font-extrabold text-red-500 hover:text-red-700 hover:underline"
              @click="excluirCandidato(c.id)"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensagem de Vazio -->
    <div v-if="candidatos.length === 0 && !isLoading" class="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400 space-y-3">
      <p class="text-sm font-bold">Nenhum candidato cadastrado ainda.</p>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#003B70] text-white font-bold text-xs hover:bg-[#002B54] transition"
        @click="abrirModalNovo"
      >
        + Cadastrar Primeiro Candidato
      </button>
    </div>
  </div>
</template>
