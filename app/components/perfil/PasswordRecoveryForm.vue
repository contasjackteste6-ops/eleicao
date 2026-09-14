<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '../BaseButton.vue'
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
  <section class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
    <div class="border-b border-gray-200 p-6 dark:border-gray-800">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-danger-100 text-lg font-bold text-danger-600 dark:bg-danger-950 dark:text-danger-300">
          !
        </div>

        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">
            Alterar Senha
          </h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
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
          icon="*"
          label="Senha"
          placeholder="Digite sua senha"
          :right-padding="true"
          :type="showPassword ? 'text' : 'password'"
        >
          <template #right>
            <button
              class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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
            icon="*"
            label="Nova Senha"
            placeholder="Digite sua nova senha"
            :right-padding="true"
            :type="showNewPassword ? 'text' : 'password'"
          >
            <template #right>
              <button
                class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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
              <span class="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700" />
              <span class="text-gray-500 dark:text-gray-400">
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
