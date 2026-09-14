<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-background-light text-foreground-light antialiased dark:bg-background-dark dark:text-foreground-dark">
    <AppHeader />
    <slot />
  </div>
</template>
