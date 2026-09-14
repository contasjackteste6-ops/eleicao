<script setup lang="ts">
defineProps<{
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
  <button
    :disabled="disabled"
    :type="type || 'button'"
    class="w-full rounded-xl bg-primary-500 py-3.5 font-semibold text-white shadow-soft transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-70"
  >
    <slot />
  </button>
</template>
