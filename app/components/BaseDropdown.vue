<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface BaseDropdownProps {
  title: string
  align?: 'left' | 'right'
}

const props = withDefaults(defineProps<BaseDropdownProps>(), {
  align: 'right',
})

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

function toggleDropdown(): void {
  isOpen.value = !isOpen.value
}

function closeDropdown(): void {
  isOpen.value = false
}

function handleDocumentClick(event: MouseEvent): void {
  if (!dropdownRef.value?.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <div
    ref="dropdownRef"
    class="relative"
  >
    <button
      class="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground-lightSecondary transition hover:border-border-strong hover:bg-surface-hover hover:text-foreground-light dark:border-border-dark dark:bg-surface-dark dark:text-foreground-darkSecondary dark:hover:border-border-dark-strong dark:hover:bg-surface-dark-hover dark:hover:text-foreground-dark"
      type="button"
      @click="toggleDropdown"
    >
      <slot name="trigger" />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <section
        v-if="isOpen"
        class="absolute top-12 z-40 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-panel dark:border-border-dark dark:bg-surface-dark"
        :class="props.align === 'right' ? 'right-0' : 'left-0'"
      >
        <div class="border-b border-border-muted px-4 py-3 dark:border-border-dark-muted">
          <p class="text-xs font-semibold uppercase tracking-wide text-foreground-lightSubtle dark:text-foreground-darkSubtle">
            {{ props.title }}
          </p>
        </div>

        <div class="p-2">
          <slot :close="closeDropdown" />
        </div>
      </section>
    </Transition>
  </div>
</template>
