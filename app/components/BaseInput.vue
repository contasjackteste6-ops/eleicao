<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'

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
      class="mb-2 block text-sm font-medium text-foreground-lightSecondary dark:text-foreground-darkSecondary"
    >
      {{ label }}
    </span>
    <span class="relative block">
      <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground-lightSubtle dark:text-foreground-darkSubtle">
        <BaseIcon :name="icon || 'mail'" />
      </span>
      <input
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :type="type || 'text'"
        :class="[
          'w-full rounded-xl border border-border bg-input py-3.5 pl-12 text-sm text-foreground-light transition-all placeholder:text-foreground-lightSubtle focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-border-dark dark:bg-input-dark dark:text-foreground-dark dark:placeholder:text-foreground-darkSubtle dark:focus:ring-primary-900',
          rightPadding ? 'pr-12' : 'pr-4',
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <slot name="right" />
    </span>
  </label>
</template>
