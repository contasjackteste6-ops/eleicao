<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Candidato } from '~/shared/types/database'

const props = defineProps<{
  cargo?: string
  numeroMax?: number
  candidatos?: Candidato[]
}>()

const emit = defineEmits<{
  (e: 'confirmar', payload: { tipo: 'nominal' | 'branco' | 'nulo'; numero?: string; candidato_id?: string }): void
}>()

const numeroDigitado = ref('')
const isBranco = ref(false)
const mensagemErroUrna = ref('')

const maxDigitsLimit = computed(() => {
  if (props.numeroMax) return props.numeroMax
  if (props.candidatos && props.candidatos.length > 0) {
    const maxLen = Math.max(...props.candidatos.map((c) => (c.numero || '').length))
    return Math.max(maxLen, 4)
  }
  return 4
})

const candidatoAtual = computed(() => {
  if (isBranco.value || !numeroDigitado.value) return null
  return props.candidatos?.find((c) => c.numero === numeroDigitado.value) || null
})

const isNulo = computed(() => {
  if (isBranco.value) return false
  if (!numeroDigitado.value) return false
  return numeroDigitado.value.length === maxDigitsLimit.value && !candidatoAtual.value
})

function tocarSomTecla() {
  try {
    const audio = new Audio('/tecla.wav')
    audio.volume = 0.5
    audio.play().catch(() => {})
  } catch (err) {}
}

function tocarSomFim() {
  try {
    const audio = new Audio('/fim.wav')
    audio.volume = 0.9
    audio.play().catch(() => {
      sintetizarConfirmaUrna()
    })
  } catch (err) {
    sintetizarConfirmaUrna()
  }
}

function sintetizarConfirmaUrna() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const tones = [
      { freq: 523.25, time: 0, duration: 0.1 },
      { freq: 659.25, time: 0.1, duration: 0.1 },
      { freq: 783.99, time: 0.2, duration: 0.45 },
    ]
    tones.forEach((tone) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(tone.freq, ctx.currentTime + tone.time)
      gain.gain.setValueAtTime(0.25, ctx.currentTime + tone.time)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + tone.time + tone.duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + tone.time)
      osc.stop(ctx.currentTime + tone.time + tone.duration)
    })
  } catch (err) {}
}

function tocarSomErro() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(180, ctx.currentTime)
    osc.frequency.setValueAtTime(110, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  } catch (err) {}
}

function pressionarTeclado(tecla: string) {
  mensagemErroUrna.value = ''
  if (isBranco.value) return
  if (numeroDigitado.value.length < maxDigitsLimit.value) {
    numeroDigitado.value += tecla
    tocarSomTecla()
  }
}

function clicarBranco() {
  tocarSomTecla()
  mensagemErroUrna.value = ''
  numeroDigitado.value = ''
  isBranco.value = true
}

function clicarCorrigir() {
  tocarSomTecla()
  mensagemErroUrna.value = ''
  numeroDigitado.value = ''
  isBranco.value = false
}

function clicarConfirma() {
  if (isBranco.value) {
    tocarSomFim()
    emit('confirmar', { tipo: 'branco' })
    numeroDigitado.value = ''
    isBranco.value = false
    mensagemErroUrna.value = ''
  } else if (candidatoAtual.value) {
    tocarSomFim()
    emit('confirmar', {
      tipo: 'nominal',
      numero: numeroDigitado.value,
      candidato_id: candidatoAtual.value.id,
    })
    numeroDigitado.value = ''
    isBranco.value = false
    mensagemErroUrna.value = ''
  } else {
    // Número inválido (não pertence a nenhum candidato registrado)
    tocarSomErro()
    mensagemErroUrna.value = 'Número incorreto! Digite o número de um candidato cadastrado ou aperte BRANCO.'
    numeroDigitado.value = ''
    isBranco.value = false
  }
}
</script>

<template>
  <div class="relative mx-auto flex w-full max-w-4xl flex-col rounded-2xl border-4 border-[#c5c8cb] bg-[#dce1e5] p-4 sm:p-6 shadow-2xl md:flex-row gap-6 text-slate-800 select-none">
    
    <!-- ESQUERDA: TELA DA URNA -->
    <div class="relative flex flex-1 flex-col justify-between rounded-xl border-2 border-[#808891] bg-[#f4f6f8] p-5 shadow-inner min-h-[380px] overflow-hidden">
      <!-- Topo da tela -->
      <div class="flex items-center justify-between border-b border-slate-300 pb-2">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">JUSTIÇA ELEITORAL</span>
        <span class="text-xs font-black text-[#003B70] uppercase">{{ cargo || 'SEU VOTO VAI PARA PRESIDENTE' }}</span>
      </div>

      <!-- ALERTA DE ERRO NA URNA -->
      <div v-if="mensagemErroUrna" class="my-auto p-4 rounded-2xl bg-red-100 border-2 border-red-400 text-red-900 text-xs font-extrabold text-center shadow-md animate-fade-in space-y-1">
        <p class="text-sm font-black uppercase text-red-600">⚠️ VOTO INVÁLIDO</p>
        <p>{{ mensagemErroUrna }}</p>
      </div>

      <!-- VOTO EM BRANCO -->
      <div v-else-if="isBranco" class="my-auto text-center py-10 animate-fade-in">
        <h2 class="text-3xl font-black tracking-wider text-slate-800 uppercase animate-pulse">
          VOTO EM BRANCO
        </h2>
      </div>

      <!-- CONTEÚDO PRINCIPAL (DÍGITOS, NOME, PARTIDO E FOTO RESPONSIVA) -->
      <div v-else class="my-auto py-2 space-y-3">
        <!-- Linha do Topo: Dígitos (Centralizado no Mobile, à Esquerda no PC) + Foto no PC à Direita -->
        <div class="flex items-start justify-between gap-3">
          <!-- Esquerda: Dígitos, e Dados no PC -->
          <div class="space-y-3 flex-1">
            <!-- Dígitos: Centralizado no Mobile, Alinhado à Esquerda no PC -->
            <div class="flex flex-col items-center sm:items-start">
              <p class="text-xs font-black uppercase tracking-wider text-slate-600 mb-2">Número:</p>
              <div class="flex items-center gap-1.5 sm:gap-2.5 flex-nowrap">
                <div
                  v-for="i in maxDigitsLimit"
                  :key="i"
                  class="flex h-12 w-10 sm:h-20 sm:w-16 shrink-0 items-center justify-center rounded-xl border-2 sm:border-3 border-slate-700 bg-white text-2xl sm:text-4xl font-black text-slate-900 shadow-md transition-all duration-150"
                  :class="{ 'border-[#003B70] ring-2 ring-[#003B70]/20': numeroDigitado[i - 1] }"
                >
                  {{ numeroDigitado[i - 1] || '' }}
                </div>
              </div>
            </div>

            <!-- Dados do Candidato no PC (Abaixo do número no PC) -->
            <div v-if="candidatoAtual" class="hidden sm:block space-y-1.5 pt-1 animate-fade-in">
              <div>
                <span class="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Nome:</span>
                <p class="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">{{ candidatoAtual.nome }}</p>
              </div>

              <div v-if="candidatoAtual.partido">
                <span class="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Partido:</span>
                <p class="text-base font-extrabold text-[#00A859] uppercase tracking-wide">{{ candidatoAtual.partido }}</p>
              </div>
            </div>

            <!-- Voto Nulo no PC -->
            <div v-else-if="isNulo" class="hidden sm:block pt-2 text-red-600 animate-fade-in">
              <span class="text-2xl font-black uppercase tracking-wider">VOTO NULO</span>
              <p class="text-xs font-extrabold text-slate-500 mt-0.5">Número de candidato não cadastrado.</p>
            </div>
          </div>

          <!-- Direita (SOMENTE NO PC/DESKTOP): Foto Grande do Candidato -->
          <div v-if="candidatoAtual" class="hidden sm:flex shrink-0 animate-fade-in">
            <div class="h-60 w-44 rounded-2xl border-3 border-slate-400 bg-white shadow-xl overflow-hidden flex flex-col items-center justify-center">
              <img v-if="candidatoAtual.foto_url" :src="candidatoAtual.foto_url" alt="Foto do Candidato" class="h-full w-full object-cover" />
              <div v-else class="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                <span class="text-5xl font-black text-[#003B70] uppercase">{{ candidatoAtual.nome?.[0] }}</span>
                <span class="text-xs font-bold uppercase mt-1">Foto Oficial</span>
              </div>
            </div>
          </div>
        </div>

        <!-- NO MOBILE: LINHA INFERIOR COM NOME À ESQUERDA E FOTO À DIREITA (AUMENTADOS) -->
        <div v-if="candidatoAtual" class="flex sm:hidden items-center justify-between gap-3 pt-2 border-t border-slate-200/80 animate-fade-in">
          <!-- Nome e Partido à Esquerda no Mobile -->
          <div class="space-y-2 flex-1 min-w-0 pr-1">
            <div>
              <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Nome:</span>
              <p class="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight break-words">{{ candidatoAtual.nome }}</p>
            </div>

            <div v-if="candidatoAtual.partido">
              <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Partido:</span>
              <p class="text-sm font-extrabold text-[#00A859] uppercase tracking-wide truncate">{{ candidatoAtual.partido }}</p>
            </div>
          </div>

          <!-- Foto Maior à Direita no Mobile -->
          <div class="shrink-0">
            <div class="h-36 w-28 rounded-2xl border-2 border-slate-400 bg-white shadow-md overflow-hidden flex flex-col items-center justify-center">
              <img v-if="candidatoAtual.foto_url" :src="candidatoAtual.foto_url" alt="Foto do Candidato" class="h-full w-full object-cover" />
              <div v-else class="flex flex-col items-center justify-center text-slate-400 p-1 text-center">
                <span class="text-4xl font-black text-[#003B70] uppercase">{{ candidatoAtual.nome?.[0] }}</span>
                <span class="text-[9px] font-bold uppercase mt-0.5">Foto Oficial</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Voto Nulo no Mobile -->
        <div v-else-if="isNulo" class="block sm:hidden pt-2 border-t border-slate-200/80 text-red-600 text-center animate-fade-in">
          <span class="text-xl font-black uppercase tracking-wider">VOTO NULO</span>
          <p class="text-xs font-extrabold text-slate-500 mt-0.5">Número de candidato não cadastrado.</p>
        </div>
      </div>

      <!-- Rodapé das instruções da Tela -->
      <div class="border-t border-slate-300 pt-3 text-[11px] font-medium text-slate-500 space-y-1">
        <p>Aperte a tecla:</p>
        <p><strong class="text-emerald-700 font-extrabold">CONFIRMA</strong> para CONFIRMAR este voto</p>
        <p><strong class="text-orange-600 font-extrabold">CORRIGE</strong> para REINICIAR este voto</p>
      </div>
    </div>

    <!-- DIREITA: PAINEL / TECLADO DA URNA -->
    <div class="flex w-full md:w-72 flex-col justify-between rounded-xl bg-[#2a2f35] p-5 text-white shadow-lg border border-slate-700">
      
      <!-- Cabeçalho do teclado -->
      <div class="mb-4 text-center border-b border-slate-700 pb-3">
        <h3 class="text-xs font-black uppercase tracking-widest text-slate-300">JUSTIÇA ELEITORAL</h3>
      </div>

      <!-- Teclado Numérico (0 a 9) -->
      <div class="grid grid-cols-3 gap-3 px-2">
        <button
          v-for="n in ['1','2','3','4','5','6','7','8','9']"
          :key="n"
          type="button"
          class="flex h-12 items-center justify-center rounded-lg bg-[#1a1d20] text-xl font-black text-white shadow-md transition active:translate-y-0.5 active:bg-slate-700 hover:bg-[#23272b]"
          @click="pressionarTeclado(n)"
        >
          {{ n }}
        </button>
        <div />
        <button
          type="button"
          class="flex h-12 items-center justify-center rounded-lg bg-[#1a1d20] text-xl font-black text-white shadow-md transition active:translate-y-0.5 active:bg-slate-700 hover:bg-[#23272b]"
          @click="pressionarTeclado('0')"
        >
          0
        </button>
        <div />
      </div>

      <!-- Botões de Ação (BRANCO, CORRIGE, CONFIRMA) -->
      <div class="mt-6 grid grid-cols-3 gap-2">
        <button
          type="button"
          class="flex h-12 items-center justify-center rounded-md bg-white text-[11px] font-extrabold uppercase text-slate-900 shadow transition active:opacity-80 hover:bg-slate-100"
          @click="clicarBranco"
        >
          Branco
        </button>

        <button
          type="button"
          class="flex h-12 items-center justify-center rounded-md bg-[#e65100] text-[11px] font-extrabold uppercase text-white shadow transition active:opacity-80 hover:bg-[#f57c00]"
          @click="clicarCorrigir"
        >
          Corrige
        </button>

        <button
          type="button"
          class="flex h-14 items-center justify-center rounded-md bg-[#008044] text-[11px] font-extrabold uppercase text-white shadow-lg transition active:opacity-80 hover:bg-[#009952]"
          @click="clicarConfirma"
        >
          Confirma
        </button>
      </div>

    </div>

  </div>
</template>
