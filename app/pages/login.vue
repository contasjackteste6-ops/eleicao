<script setup lang="ts">
import LoginAuthForm from '~/components/login/LoginAuthForm.vue'

definePageMeta({
  layout: false,
  middleware: 'guest-guard',
})
</script>

<template>
  <main class="relative flex min-h-screen flex-col items-center justify-center bg-[#002855] bg-gradient-to-b from-[#001D40] via-[#002B54] to-[#003B70] p-4 sm:p-6 text-white overflow-hidden">
    
    <!-- Padrão sutil decorativo de fundo -->
    <div class="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

    <!-- TopoGov / e-Título Header Badge -->
    <div class="z-10 mb-6 flex flex-col items-center gap-1.5 text-center">
      <div class="flex items-center gap-2 text-xs font-bold tracking-wider text-emerald-400 uppercase">
        <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        República Federativa do Brasil
      </div>
      <h1 class="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
        JUSTIÇA ELEITORAL
      </h1>
    </div>

    <!-- Card Principal de Login -->
    <div class="z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/95 backdrop-blur-md shadow-2xl dark:border-slate-800 dark:bg-slate-900/95">
      <LoginAuthForm />
    </div>

    <!-- Footer Institucional -->
    <footer class="z-10 mt-8 text-center text-xs font-medium text-slate-300/80">
      <p>© Justiça Eleitoral • Todos os direitos reservados</p>
    </footer>

  </main>
</template>
