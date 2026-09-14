<script setup lang="ts">
import { navigateTo } from '#imports'
import { ref } from 'vue'
import BaseDropdown from './BaseDropdown.vue'
import BaseIcon from './BaseIcon.vue'
import { useAuth } from '../composables/useAuth'
import { useThemeMode } from '../composables/useThemeMode'

const { logout } = useAuth()
const { mode, toggleTheme } = useThemeMode()

const isLoggingOut = ref(false)

async function handleLogout(close: () => void): Promise<void> {
  if (isLoggingOut.value) {
    return
  }

  isLoggingOut.value = true

  try {
    await logout()
    close()
    await navigateTo('/login')
  }
  finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <BaseDropdown title="Conta">
    <template #trigger>
      <BaseIcon name="user" />
      <span class="sr-only">Abrir menu da conta</span>
    </template>

    <template #default="{ close }">
      <div
        class="space-y-0"
        @click="close"
      >
        <NuxtLink
          class="flex min-h-touch items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground-lightSecondary transition hover:bg-surface-hover hover:text-foreground-light dark:text-foreground-darkSecondary dark:hover:bg-surface-dark-hover dark:hover:text-foreground-dark"
          to="/perfil"
        >
          <BaseIcon name="user" />
          <span>Perfil</span>
        </NuxtLink>

        <NuxtLink
          class="flex min-h-touch items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground-lightSecondary transition hover:bg-surface-hover hover:text-foreground-light dark:text-foreground-darkSecondary dark:hover:bg-surface-dark-hover dark:hover:text-foreground-dark"
          to="/assinatura"
        >
          <BaseIcon name="credit-card" />
          <span>Assinatura</span>
        </NuxtLink>

        <button
          class="flex min-h-touch w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground-lightSecondary transition hover:bg-surface-hover hover:text-foreground-light dark:text-foreground-darkSecondary dark:hover:bg-surface-dark-hover dark:hover:text-foreground-dark"
          type="button"
          @click="toggleTheme"
        >
          <BaseIcon :name="mode === 'dark' ? 'sun' : 'moon'" />
          <span>{{ mode === 'dark' ? 'Modo Light' : 'Modo Dark' }}</span>
        </button>

        <button
          class="flex min-h-touch w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-danger-600 transition hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-70 dark:text-danger-400 dark:hover:bg-danger-950"
          :disabled="isLoggingOut"
          type="button"
          @click="handleLogout(close)"
        >
          <BaseIcon name="log-out" />
          <span>Sair</span>
          <span class="text-xs text-danger-400">
            {{ isLoggingOut ? 'Saindo...' : '' }}
          </span>
        </button>
      </div>
    </template>
  </BaseDropdown>
</template>
