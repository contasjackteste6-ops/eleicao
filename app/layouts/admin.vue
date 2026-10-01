<script setup lang="ts">
import { useRoute, useSupabaseUser } from '#imports'
import { ref, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const user = useSupabaseUser()
const { logout } = useAuth()

const isSidebarOpen = ref(false)

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

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

// Fechar sidebar automaticamente ao trocar de página no mobile
watch(() => route.path, () => {
  closeSidebar()
})
</script>

<template>
  <div class="min-h-screen bg-white text-slate-900 flex font-sans antialiased selection:bg-slate-100 relative">
    
    <!-- Backdrop / Fundo Escuro para Mobile quando a Sidebar está aberta -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
      @click="closeSidebar"
    />

    <!-- Sidebar Responsiva (Fixa deslizando no Mobile, Estática no Desktop) -->
    <aside
      :class="[
        'fixed lg:static top-0 bottom-0 left-0 z-50 w-64 px-6 py-8 flex flex-col justify-between shrink-0 bg-white border-r border-slate-100 transition-transform duration-300 ease-in-out',
        isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="space-y-8">
        <!-- Logo e Botão Fechar no Mobile -->
        <div class="flex items-center justify-between py-2">
          <div class="flex justify-center items-center mx-auto lg:mx-0">
            <img src="/eleicoes2026.png" alt="Eleições 2026" class="h-20 lg:h-24 w-auto object-contain" />
          </div>

          <!-- Botão fechar (visível apenas no mobile) -->
          <button
            type="button"
            class="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
            @click="closeSidebar"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
                ? 'bg-[#003B70] text-white font-black shadow-md'
                : 'text-slate-600 font-bold hover:text-slate-900 hover:bg-slate-50'
            ]"
            @click="closeSidebar"
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
        class="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-800 transition mt-auto"
        @click="logout()"
      >
        <svg class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
        </svg>
        <span>Sair da conta</span>
      </button>
    </aside>

    <!-- Conteúdo Principal Flutuante / Full-Width -->
    <div class="flex-1 flex flex-col min-w-0 w-full">
      
      <!-- Topo Wise com Botão Hambúrguer no Mobile -->
      <header class="flex h-20 items-center justify-between px-4 sm:px-10 border-b lg:border-b-0 border-slate-100">
        
        <!-- Botão Hambúrguer para abrir Sidebar no Mobile/Tablet -->
        <button
          type="button"
          class="lg:hidden p-2.5 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          aria-label="Abrir Menu"
          @click="toggleSidebar"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Lado direito do topo (Avatar & Notificações) -->
        <div class="flex items-center gap-3 sm:gap-4 ml-auto">
          <!-- Sino Notificação -->
          <button class="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition text-slate-700">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <!-- Badge Avatar -->
          <div class="flex items-center gap-2.5 pl-1 sm:pl-2 cursor-pointer">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-800 font-extrabold text-xs uppercase">
              {{ (user?.email?.slice(0, 2) || 'AD').toUpperCase() }}
            </div>
            <span class="text-xs font-bold text-slate-800 truncate max-w-[120px] sm:max-w-[200px]">
              {{ user?.email }}
            </span>
          </div>
        </div>
      </header>

      <!-- Área de Conteúdo Responsiva -->
      <main class="flex-1 px-4 sm:px-10 pb-16 w-full">
        <slot />
      </main>

    </div>

  </div>
</template>
