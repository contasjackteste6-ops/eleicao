<script setup lang="ts">
defineProps<{
  id: string
  modelValue: string
  icon?: string
  label?: string
  placeholder?: string
  rightPadding?: boolean
  type?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <label
    :for="id"
    class="block"
  >
    <span
      v-if="label"
      class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
    >
      {{ label }}
    </span>
    <span class="relative block">
      <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
        {{ icon || '@' }}
      </span>
      <input
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :type="type || 'text'"
        :class="[
          'w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-primary-900',
          rightPadding ? 'pr-12' : 'pr-4',
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <slot name="right" />
    </span>
  </label>
</template>
