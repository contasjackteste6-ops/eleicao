<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'guest-guard',
})
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-background-light p-6 text-foreground-light dark:bg-background-dark dark:text-foreground-dark">
    <h1 class="text-3xl font-bold">
      Esqueci Senha
    </h1>
  </main>
</template>
