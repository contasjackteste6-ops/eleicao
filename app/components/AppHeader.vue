<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'
import ProfileDropdown from './ProfileDropdown.vue'
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur dark:border-border-dark dark:bg-surface-dark/95">
    <div class="mx-auto flex h-16 max-w-content items-center justify-between px-6">
      <NuxtLink
        class="flex items-center gap-3 text-foreground-light transition hover:text-primary-600 dark:text-foreground-dark dark:hover:text-primary-400"
        to="/"
      >
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white shadow-soft">
          <BaseIcon name="message-circle" />
        </span>
        <span class="text-base font-bold">
          Multi Atendimento
        </span>
      </NuxtLink>

      <ProfileDropdown />
    </div>
  </header>
</template>
