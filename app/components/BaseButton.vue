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
    class="w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3.5 font-semibold text-white shadow-lg transition-all hover:from-primary-600 hover:to-primary-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
  >
    <slot />
  </button>
</template>
