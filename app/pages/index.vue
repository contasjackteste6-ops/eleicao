<script setup lang="ts">
import { computed, ref } from 'vue'
import { navigateTo, useSupabaseUser } from '#imports'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import ChannelStatusList from '../components/ChannelStatusList.vue'
import ButtonShowcase from '../components/ButtonShowcase.vue'
import DashboardStatCard from '../components/DashboardStatCard.vue'
import ThemePreviewHeader from '../components/ThemePreviewHeader.vue'
import ThemeModeToggle from '../components/ThemeModeToggle.vue'
import { useAuth } from '../composables/useAuth'
import { useDashboardMock } from '../composables/useDashboardMock'

const { stats, channels } = useDashboardMock()
const user = useSupabaseUser()
const { logout } = useAuth()
const testEmail = ref('')
const isLoggingOut = ref(false)

const userName = computed(() => {
  const metadata = user.value?.user_metadata as { name?: string; full_name?: string } | undefined

  return metadata?.name || metadata?.full_name || user.value?.name || 'Usuario logado'
})

const userEmail = computed(() => user.value?.email || 'Email nao disponivel')

async function handleLogout(): Promise<void> {
  isLoggingOut.value = true

  try {
    await logout()
    await navigateTo('/login')
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <main class="p-6">
    <section class="mx-auto flex max-w-content flex-col gap-6">
      <ThemePreviewHeader>
        <template #actions>
          <ThemeModeToggle />
        </template>
      </ThemePreviewHeader>

      <section class="rounded-2xl border border-border bg-surface p-5 shadow-panel dark:border-border-dark dark:bg-surface-dark">
        <div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p class="text-sm font-semibold uppercase text-primary-600 dark:text-primary-300">
              Sessao atual
            </p>
            <h2 class="mt-1 text-xl font-semibold">
              {{ userName }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ userEmail }}
            </p>
          </div>

          <button
            class="min-h-touch rounded-xl border border-danger-200 bg-danger-50 px-5 text-sm font-semibold text-danger-700 transition hover:bg-danger-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-danger-800 dark:bg-danger-950 dark:text-danger-200 dark:hover:bg-danger-900"
            :disabled="isLoggingOut"
            type="button"
            @click="handleLogout"
          >
            {{ isLoggingOut ? 'Saindo...' : 'Logout' }}
          </button>
        </div>
      </section>

      <div class="grid gap-4 md:grid-cols-3">
        <DashboardStatCard
          v-for="stat in stats"
          :key="stat.label"
          :stat="stat"
        />
      </div>

      <ButtonShowcase />

      <section class="rounded-2xl border border-border bg-surface p-5 shadow-panel dark:border-border-dark dark:bg-surface-dark">
        <div class="mb-5">
          <h2 class="text-xl font-semibold">
            Componentes base
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            BaseInput e BaseButton importados diretamente na pagina inicial.
          </p>
        </div>

        <div class="max-w-md space-y-4">
          <BaseInput
            id="preview-email"
            v-model="testEmail"
            label="Email do atendente"
            placeholder="nome@empresa.com"
            type="email"
          />
          <BaseButton>
            Entrar no atendimento
          </BaseButton>
        </div>
      </section>

      <ChannelStatusList :channels="channels" />
    </section>
  </main>
</template>
