<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '../BaseButton.vue'
import BaseIcon from '../BaseIcon.vue'
import BaseInput from '../BaseInput.vue'

const password = ref('')
const newPassword = ref('')
const showPassword = ref(false)
const showNewPassword = ref(false)

const requirements = [
  'Minimo de 8 caracteres',
  'Uma letra maiuscula',
  'Um numero',
  'Um caractere especial',
]
</script>

<template>
  <section class="rounded-2xl border border-border bg-surface shadow-soft dark:border-border-dark dark:bg-surface-dark">
    <div class="border-b border-border p-6 dark:border-border-dark">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-danger-100 text-danger-600 dark:bg-danger-950 dark:text-danger-300">
          <BaseIcon name="shield" />
        </div>

        <div>
          <h3 class="text-lg font-bold text-foreground-light dark:text-foreground-dark">
            Alterar Senha
          </h3>
          <p class="mt-1 text-sm text-foreground-lightSecondary dark:text-foreground-darkSecondary">
            Mantenha sua conta segura com uma senha forte
          </p>
        </div>
      </div>
    </div>

    <div class="p-6">
      <form class="space-y-5">
        <BaseInput
          id="password"
          v-model="password"
          icon="lock"
          label="Senha"
          placeholder="Digite sua senha"
          :right-padding="true"
          :type="showPassword ? 'text' : 'password'"
        >
          <template #right>
            <button
              class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-foreground-lightMuted hover:text-foreground-lightSecondary dark:text-foreground-darkMuted dark:hover:text-foreground-darkSecondary"
              type="button"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Ocultar' : 'Ver' }}
            </button>
          </template>
        </BaseInput>

        <div>
          <BaseInput
            id="new-password"
            v-model="newPassword"
            icon="lock"
            label="Nova Senha"
            placeholder="Digite sua nova senha"
            :right-padding="true"
            :type="showNewPassword ? 'text' : 'password'"
          >
            <template #right>
              <button
                class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-foreground-lightMuted hover:text-foreground-lightSecondary dark:text-foreground-darkMuted dark:hover:text-foreground-darkSecondary"
                type="button"
                @click="showNewPassword = !showNewPassword"
              >
                {{ showNewPassword ? 'Ocultar' : 'Ver' }}
              </button>
            </template>
          </BaseInput>

          <div class="mt-2 space-y-1">
            <div
              v-for="requirement in requirements"
              :key="requirement"
              class="flex items-center gap-2 text-xs"
            >
              <span class="h-2 w-2 rounded-full bg-foreground-lightSubtle dark:bg-foreground-darkSubtle" />
              <span class="text-foreground-lightMuted dark:text-foreground-darkMuted">
                {{ requirement }}
              </span>
            </div>
          </div>
        </div>

        <div class="pt-4 sm:w-fit sm:min-w-56">
          <BaseButton type="submit">
            Atualizar Senha
          </BaseButton>
        </div>
      </form>
    </div>
  </section>
</template>
