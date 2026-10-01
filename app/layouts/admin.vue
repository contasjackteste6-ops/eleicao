<script setup lang="ts">
import { useRoute, useSupabaseUser } from '#imports'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const user = useSupabaseUser()
const { logout } = useAuth()

const navItems = [
  { label: 'Home', icon: 'home', path: '/admin' },
  { label: 'Eleições', icon: 'vote', path: '/admin/eleicoes' },
  { label: 'Candidatos', icon: 'users', path: '/admin/candidatos' },
  { label: 'Apuração', icon: 'chart', path: '/admin/votos' },
]

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin' || route.path === '/admin/'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="min-h-screen bg-white text-slate-900 flex font-sans antialiased selection:bg-slate-100">
    
    <!-- Sidebar Responsiva (Ocupa tamanho ideal no desktop e se adapta em dispositivos) -->
    <aside class="w-64 pl-6 pr-5 py-8 flex flex-col justify-between shrink-0 bg-white border-r border-slate-100 md:border-r-0">
      <div class="space-y-10">
        <!-- Logo e-Título / Eleições (Apenas imagem centralizada e maior) -->
        <div class="flex justify-center items-center py-2">
          <img src="/eleicoes2026.png" alt="Eleições 2026" class="h-16 w-auto object-contain" />
        </div>

        <!-- Links Verticais -->
        <nav class="space-y-2">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center gap-4 px-4 py-3 rounded-2xl text-base transition-all duration-150',
              isActive(item.path)
                ? 'border-2 border-slate-900 bg-white text-[#003B70] font-black shadow-sm'
                : 'text-slate-600 font-bold hover:text-slate-900 hover:bg-slate-50'
            ]"
          >
            <svg v-if="item.icon === 'home'" class="h-6 w-6 shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <svg v-else-if="item.icon === 'vote'" class="h-6 w-6 shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <svg v-else-if="item.icon === 'users'" class="h-6 w-6 shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="h-6 w-6 shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="tracking-tight">{{ item.label }}</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Botão Sair sutil -->
      <button
        type="button"
        class="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-800 transition"
        @click="logout()"
      >
        <svg class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
        </svg>
        <span>Sair da conta</span>
      </button>
    </aside>

    <!-- Conteúdo Principal Flutuante / Full-Width (Removido max-w estático) -->
    <div class="flex-1 flex flex-col min-w-0 w-full">
      
      <!-- Topo Wise -->
      <header class="flex h-20 items-center justify-end px-6 sm:px-10 gap-4">
        <!-- Sino Notificação -->
        <button class="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition text-slate-700">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" />
          </svg>
          <span class="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <!-- Badge Avatar -->
        <div class="flex items-center gap-2.5 pl-2 cursor-pointer">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-800 font-extrabold text-xs uppercase">
            {{ (user?.email?.slice(0, 2) || 'AD').toUpperCase() }}
          </div>
          <span class="text-xs font-bold text-slate-800 truncate max-w-[200px]">
            {{ user?.email }}
          </span>
          <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </header>

      <!-- Área de Conteúdo Responsiva (Preenche a largura total disponível) -->
      <main class="flex-1 px-6 sm:px-10 pb-16 w-full">
        <slot />
      </main>

    </div>

  </div>
</template>
