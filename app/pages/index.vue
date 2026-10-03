<script setup lang="ts">
import { definePageMeta, useSupabaseUser, useSupabaseClient } from '#imports'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import UrnaEleitoral from '~/components/urna/UrnaEleitoral.vue'
import type { Profile, Eleicao, Candidato, Voto } from '~/shared/types/database'

definePageMeta({
  middleware: 'auth-guard',
})

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const { logout } = useAuth()

const profile = ref<Profile | null>(null)
const isAdmin = ref(false)
const isLoggingOut = ref(false)
const isLoading = ref(true)
const isSubmittingVoto = ref(false)
const errorMessage = ref('')

// Dados da Eleição e Votação
const eleicaoAtiva = ref<Eleicao | null>(null)
const candidatos = ref<Candidato[]>([])
const jaVotou = ref(false)
const votoUsuario = ref<Voto | null>(null)

// Cronômetro de Contagem Regressiva
const tempoRestante = ref({ dias: 0, horas: 0, minutos: 0, segundos: 0, encerrado: false })
let timerInterval: any = null

const isEleicaoEncerrada = computed(() => {
  if (!eleicaoAtiva.value) return false
  if (eleicaoAtiva.value.status === 'finalizada' || eleicaoAtiva.value.status === 'encerrada') return true
  if (tempoRestante.value.encerrado) return true
  if (eleicaoAtiva.value.data_fim) {
    const fim = new Date(eleicaoAtiva.value.data_fim).getTime()
    const agora = new Date().getTime()
    if (agora >= fim) return true
  }
  return false
})

async function checkAdminStatus() {
  try {
    let userId = user.value?.id
    if (!userId) {
      const { data } = await supabase.auth.getSession()
      userId = data?.session?.user?.id
    }
    if (!userId) return

    // 1. Tentar verificação direta via Supabase Client
    const { data: adminData } = await supabase
      .from('administradores')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (adminData) {
      isAdmin.value = true
      return
    }

    // 2. Fallback via API server
    const res = await $fetch<{ isAdmin: boolean }>('/api/auth/is-admin')
    if (res?.isAdmin) {
      isAdmin.value = true
    }
  } catch (err) {
    console.error('Erro ao verificar status admin:', err)
  }
}

async function fetchProfile() {
  if (!user.value?.id) return
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.value.id)
      .single()

    if (data) {
      profile.value = data as Profile
    }
  } catch (err) {
    console.error('Erro ao carregar perfil:', err)
  }
}

async function checarStatusVotacao() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await $fetch<{
      jaVotou: boolean
      voto: Voto | null
      eleicao: Eleicao | null
      candidatos: Candidato[]
    }>('/api/votos/status')

    jaVotou.value = res.jaVotou
    votoUsuario.value = res.voto
    eleicaoAtiva.value = res.eleicao
    candidatos.value = res.candidatos || []

    if (eleicaoAtiva.value?.data_fim) {
      iniciarCronometro(eleicaoAtiva.value.data_fim)
    }
  } catch (err: any) {
    console.error('Erro ao consultar status:', err)
    errorMessage.value = err?.statusMessage || 'Erro ao carregar votação.'
  } finally {
    isLoading.value = false
  }
}

function iniciarCronometro(dataFimIso: string) {
  if (timerInterval) clearInterval(timerInterval)

  const atualizarTempo = () => {
    const agora = new Date().getTime()
    const fim = new Date(dataFimIso).getTime()
    const diferenca = fim - agora

    if (diferenca <= 0) {
      tempoRestante.value = { dias: 0, horas: 0, minutos: 0, segundos: 0, encerrado: true }
      if (timerInterval) clearInterval(timerInterval)
      return
    }

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24))
    const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60))
    const segundos = Math.floor((diferenca % (1000 * 60)) / 1000)

    tempoRestante.value = { dias, horas, minutos, segundos, encerrado: false }
  }

  atualizarTempo()
  timerInterval = setInterval(atualizarTempo, 1000)
}

async function handleConfirmarVoto(payload: { tipo: 'nominal' | 'branco' | 'nulo'; numero?: string; candidato_id?: string }) {
  if (!eleicaoAtiva.value) {
    errorMessage.value = 'Nenhuma eleição ativa no momento.'
    return
  }

  isSubmittingVoto.value = true
  errorMessage.value = ''

  try {
    await $fetch('/api/votos', {
      method: 'POST',
      body: {
        eleicao_id: eleicaoAtiva.value.id,
        tipo_voto: payload.tipo,
        candidato_numero: payload.numero,
      },
    })

    jaVotou.value = true
    if (eleicaoAtiva.value.data_fim) {
      iniciarCronometro(eleicaoAtiva.value.data_fim)
    }
  } catch (err: any) {
    errorMessage.value = err?.statusMessage || 'Erro ao registrar voto.'
  } finally {
    isSubmittingVoto.value = false
  }
}

async function handleLogout() {
  try {
    isLoggingOut.value = true
    await logout()
  } catch (err) {
    console.error('Erro ao realizar logout:', err)
    isLoggingOut.value = false
  }
}

onMounted(() => {
  fetchProfile()
  checkAdminStatus()
  checarStatusVotacao()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <main
    class="relative min-h-screen w-full overflow-y-auto bg-cover bg-center bg-no-repeat flex flex-col justify-between p-3 sm:p-5 select-none"
    style="background-image: url('/voting_room_bg.jpg'); touch-action: pan-y; -webkit-user-select: none; user-select: none;"
  >
    <!-- Overlay sutil para garantir contraste -->
    <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />

    <!-- Barra Superior com perfil do eleitor -->
    <header class="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3.5 text-slate-900 shadow-lg backdrop-blur-md">
      <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div v-if="user?.user_metadata?.avatar_url || profile?.avatar_url" class="h-10 w-10 overflow-hidden rounded-full border border-slate-300 shrink-0">
          <img :src="user?.user_metadata?.avatar_url || profile?.avatar_url || ''" alt="Eleitor" class="h-full w-full object-cover" />
        </div>
        <div v-else class="flex h-10 w-10 items-center justify-center rounded-full bg-[#003B70]/10 text-[#003B70] font-black text-sm shrink-0">
          {{ (user?.email?.[0] || 'E').toUpperCase() }}
        </div>
        <div class="min-w-0">
          <h1 class="text-xs sm:text-base font-extrabold text-slate-900 truncate">
            Eleitor: {{ profile?.nome || user?.user_metadata?.full_name || user?.email }}
          </h1>
          <p class="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">
            Sessão Eleitoral • Status:
            <span v-if="jaVotou" class="text-emerald-600 font-extrabold">Voto Registrado ✓</span>
            <span v-else-if="isEleicaoEncerrada" class="text-amber-600 font-extrabold">Votação Encerrada 🔒</span>
            <span v-else class="text-[#003B70] font-bold">Aguardando Voto</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- BOTÃO PAINEL ADMIN (APENAS PARA ADMINISTRADORES) -->
        <NuxtLink
          v-if="isAdmin"
          to="/admin"
          class="flex items-center gap-1.5 rounded-xl bg-[#003B70] px-3.5 py-2 text-xs font-black text-white hover:bg-[#002850] transition active:scale-95 shadow-md border border-blue-400/30 shrink-0"
        >
          <svg class="h-4 w-4 text-[#FFCC00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="hidden sm:inline">Painel Admin</span>
          <span class="sm:hidden">Admin</span>
        </NuxtLink>

        <!-- BOTÃO DE SAIR SÓ APARECE SE AINDA NÃO VOTOU -->
        <button
          v-if="!jaVotou"
          type="button"
          :disabled="isLoggingOut"
          class="flex items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-700 transition active:scale-95 disabled:opacity-50 shadow-sm shrink-0"
          @click="handleLogout"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>{{ isLoggingOut ? 'Saindo...' : 'Sair' }}</span>
        </button>

        <!-- SE JÁ VOTOU: ÍCONE DE BLOQUEIO / COMPROVANTE -->
        <div v-else class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black shadow-sm shrink-0">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Votação Concluída</span>
        </div>
      </div>
    </header>

    <!-- ÁREA CENTRAL MAIS ELEVADA (MENOS ESPAÇO NO TOPO) -->
    <div class="relative z-10 my-4 w-full flex flex-col justify-center items-center">
      <!-- Loading State -->
      <div v-if="isLoading" class="p-8 rounded-3xl bg-white/90 backdrop-blur-md shadow-2xl text-center font-bold text-slate-700 space-y-3">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#003B70] border-t-transparent"></div>
        <p class="text-sm">Carregando sistema eleitoral...</p>
      </div>

      <!-- TELA 1: SE JÁ VOTOU -> EXIBIR CRONÔMETRO DE VOTAÇÃO FINALIZADA -->
      <div v-else-if="jaVotou" class="w-full max-w-2xl rounded-3xl border-2 border-slate-200 bg-white/95 p-8 sm:p-10 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-fade-in my-auto">
        <!-- Ícone de Sucesso -->
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 border-4 border-emerald-200 text-emerald-600 shadow-md">
          <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <span class="inline-block px-3.5 py-1 rounded-full bg-[#003B70]/10 text-[#003B70] text-xs font-black uppercase tracking-widest mb-2">
            Comprovante Digital de Votação
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Voto Computado com Sucesso!
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-md mx-auto">
            Seu voto foi registrado com sigilo e segurança no banco da Justiça Eleitoral.
          </p>
        </div>

        <!-- Card do Cronômetro -->
        <div class="rounded-2xl border-2 border-slate-200 bg-slate-900 p-6 text-white shadow-inner space-y-4">
          <p class="text-xs font-extrabold uppercase tracking-widest text-[#FFCC00]">
            Tempo restante para o encerramento da votação:
          </p>

          <div v-if="!tempoRestante.encerrado" class="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto font-mono">
            <div class="rounded-xl bg-slate-800 p-3 border border-slate-700">
              <span class="block text-2xl sm:text-3xl font-black text-white">{{ String(tempoRestante.dias).padStart(2, '0') }}</span>
              <span class="text-[10px] font-bold uppercase text-slate-400">Dias</span>
            </div>

            <div class="rounded-xl bg-slate-800 p-3 border border-slate-700">
              <span class="block text-2xl sm:text-3xl font-black text-white">{{ String(tempoRestante.horas).padStart(2, '0') }}</span>
              <span class="text-[10px] font-bold uppercase text-slate-400">Horas</span>
            </div>

            <div class="rounded-xl bg-slate-800 p-3 border border-slate-700">
              <span class="block text-2xl sm:text-3xl font-black text-white">{{ String(tempoRestante.minutos).padStart(2, '0') }}</span>
              <span class="text-[10px] font-bold uppercase text-slate-400">Min.</span>
            </div>

            <div class="rounded-xl bg-slate-800 p-3 border border-slate-700">
              <span class="block text-2xl sm:text-3xl font-black text-emerald-400 animate-pulse">{{ String(tempoRestante.segundos).padStart(2, '0') }}</span>
              <span class="text-[10px] font-bold uppercase text-slate-400">Seg.</span>
            </div>
          </div>

          <div v-else class="py-3 text-amber-400 font-bold text-base uppercase tracking-wider">
            VOTAÇÃO ENCERRADA! AGUARDANDO APURAÇÃO DOS RESULTADOS.
          </div>
        </div>

        <!-- Detalhes do Pleito -->
        <div v-if="eleicaoAtiva" class="text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
          Eleição: <strong class="text-slate-800">{{ eleicaoAtiva.titulo }}</strong>
        </div>
      </div>

      <!-- TELA 2: SE A ELEIÇÃO FOI ENCERRADA E O USUÁRIO NÃO VOTOU -> EXIBIR TELA DE ELEIÇÃO FINALIZADA -->
      <div v-else-if="isEleicaoEncerrada" class="w-full max-w-2xl rounded-3xl border-2 border-slate-200 bg-white/95 p-8 sm:p-10 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-fade-in my-auto">
        <!-- Ícone de Eleição Encerrada -->
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 border-4 border-amber-200 text-amber-600 shadow-md">
          <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <div>
          <span class="inline-block px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-widest mb-2">
            Votação Encerrada
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Esta Eleição foi Finalizada!
          </h2>
          <p class="text-xs sm:text-sm text-slate-600 font-medium mt-1 max-w-md mx-auto">
            O período de votação para este pleito foi encerrado e não é mais possível registrar novos votos.
          </p>
        </div>

        <!-- Card Informativo -->
        <div class="rounded-2xl border-2 border-slate-200 bg-slate-900 p-6 text-white shadow-inner space-y-3">
          <p class="text-xs font-extrabold uppercase tracking-widest text-[#FFCC00]">
            Status do Pleito:
          </p>
          <p class="text-base sm:text-lg font-black text-amber-400 uppercase tracking-wider">
            Votação Oficialmente Encerrada
          </p>
          <p v-if="eleicaoAtiva?.resultado_publico_ativo" class="text-xs text-slate-300">
            Os resultados oficiais já estão disponíveis para consulta pública.
          </p>
          <p v-else class="text-xs text-slate-400">
            A comissão eleitoral está apurando os votos. Os resultados serão divulgados em breve.
          </p>
        </div>

        <!-- Botão para ver Resultado se ativo -->
        <div v-if="eleicaoAtiva?.resultado_publico_ativo" class="pt-2">
          <NuxtLink
            to="/resultado"
            class="inline-flex items-center gap-2 rounded-2xl bg-[#003B70] px-6 py-3.5 text-xs font-black text-white hover:bg-[#002850] transition active:scale-95 shadow-lg"
          >
            <svg class="h-4 w-4 text-[#FFCC00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Ver Resultado da Eleição</span>
          </NuxtLink>
        </div>

        <!-- Detalhes do Pleito -->
        <div v-if="eleicaoAtiva" class="text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
          Eleição: <strong class="text-slate-800">{{ eleicaoAtiva.titulo }}</strong>
        </div>
      </div>

      <!-- TELA 3: SE AINDA NÃO VOTOU E A ELEIÇÃO ESTÁ ATIVA -> EXIBIR URNA -->
      <div v-else class="w-full flex justify-center items-center flex-col space-y-6">
        <div v-if="errorMessage" class="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold max-w-xl text-center">
          {{ errorMessage }}
        </div>

        <!-- URNA ELEITORAL REPOSICIONADA MAIS ACIMA -->
        <UrnaEleitoral
          cargo="PRESIDENTE"
          :numero-max="4"
          :candidatos="candidatos"
          @confirmar="handleConfirmarVoto"
        />

        <!-- CARDS DE OPÇÕES DE CANDIDATOS DISPONÍVEIS (ESTILO CRACHÁ) ABAIXO DA URNA -->
        <div v-if="candidatos.length > 0" class="w-full max-w-4xl space-y-3 pt-2">
          <div class="flex items-center justify-between border-b border-white/20 pb-2 text-white">
            <h3 class="text-xs sm:text-sm font-black uppercase tracking-wider text-[#FFCC00] drop-shadow-md">
              Candidatos Registrados nesta Eleição
            </h3>
            <span class="text-[11px] font-bold text-slate-200">
              Consulte os números abaixo para votar
            </span>
          </div>

          <!-- Cards em Grid dos Candidatos -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div
              v-for="c in candidatos"
              :key="c.id"
              class="relative rounded-2xl border border-slate-200/90 bg-white/95 p-3 text-center shadow-lg backdrop-blur-md space-y-2 flex flex-col justify-between hover:scale-[1.02] transition duration-200"
            >
              <!-- Furo Superior do Crachá Sutil -->
              <div class="h-1.5 w-8 rounded-full bg-slate-300 mx-auto"></div>

              <!-- Foto do Candidato -->
              <div class="h-28 w-22 mx-auto rounded-xl bg-slate-100 border border-slate-300 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                <img v-if="c.foto_url" :src="c.foto_url" alt="Foto" class="h-full w-full object-cover" />
                <div v-else class="flex flex-col items-center justify-center text-slate-400 p-1">
                  <span class="text-2xl font-black text-[#003B70] uppercase">{{ c.nome?.[0] }}</span>
                  <span class="text-[8px] font-bold uppercase text-slate-400">Sem Foto</span>
                </div>
              </div>

              <!-- Nome e Partido -->
              <div class="space-y-0.5">
                <h4 class="font-black text-xs text-slate-900 leading-snug line-clamp-1" :title="c.nome">{{ c.nome }}</h4>
                <p class="text-[10px] font-extrabold text-[#00A859] truncate">{{ c.partido || 'Sem partido' }}</p>
              </div>

              <!-- Número da Urna em Destaque no Crachá -->
              <div class="bg-[#003B70] text-white py-1.5 px-3 rounded-xl text-center shadow-sm flex items-center justify-center gap-1">
                <span class="text-[9px] font-bold uppercase opacity-80">Nº</span>
                <span class="font-mono font-black text-base text-[#FFCC00]">{{ c.numero }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rodapé Informativo -->
    <footer class="relative z-10 mx-auto text-center text-xs font-semibold text-slate-200 drop-shadow-md">
      Justiça Eleitoral • Sistema de Votação Eletrônica Brasil 2026
    </footer>
  </main>
</template>
