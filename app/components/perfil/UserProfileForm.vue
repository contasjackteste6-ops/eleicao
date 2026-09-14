<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '../BaseButton.vue'
import BaseIcon from '../BaseIcon.vue'
import BaseInput from '../BaseInput.vue'

const fullName = ref('Joao Silva')
const email = ref('joao.silva@email.com')
const phone = ref('+55 (11) 98765-4321')
</script>

<template>
  <section class="rounded-2xl border border-border bg-surface shadow-soft dark:border-border-dark dark:bg-surface-dark">
    <div class="border-b border-border p-6 dark:border-border-dark">
      <div>
        <h3 class="text-lg font-bold text-foreground-light dark:text-foreground-dark">
          Perfil do Usuario
        </h3>
        <p class="mt-1 text-sm text-foreground-lightSecondary dark:text-foreground-darkSecondary">
          Atualize suas informacoes pessoais
        </p>
      </div>
    </div>

    <div class="p-6">
      <div class="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div class="relative h-24 w-24 flex-shrink-0">
          <div class="flex h-24 w-24 items-center justify-center rounded-2xl bg-background-lightTertiary text-foreground-lightSubtle dark:bg-background-darkTertiary dark:text-foreground-darkSubtle">
            <BaseIcon name="user" />
          </div>

          <button
            class="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white shadow-soft transition hover:bg-primary-600"
            type="button"
          >
            <BaseIcon name="camera" />
          </button>
        </div>

        <div class="flex-1">
          <h4 class="mb-1 text-xl font-bold text-foreground-light dark:text-foreground-dark">
            Joao Silva
          </h4>

          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-lg bg-success-100 px-3 py-1 text-xs font-semibold text-success-700 dark:bg-success-950 dark:text-success-300">
              Ativo
            </span>
            <span class="rounded-lg bg-info-100 px-3 py-1 text-xs font-semibold text-info-700 dark:bg-info-950 dark:text-info-300">
              Verificado
            </span>
          </div>
        </div>
      </div>

      <form class="space-y-5">
        <BaseInput
          id="profile-full-name"
          v-model="fullName"
          icon="user"
          label="Nome Completo"
        />

        <div>
          <label
            class="mb-2 block text-sm font-medium text-foreground-lightSecondary dark:text-foreground-darkSecondary"
            for="profile-email"
          >
            Email
          </label>
          <div class="relative">
            <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground-lightSubtle dark:text-foreground-darkSubtle">
              <BaseIcon name="mail" />
            </span>
            <input
              id="profile-email"
              v-model="email"
              class="w-full cursor-not-allowed rounded-xl border border-border bg-input-disabled py-3.5 pl-12 pr-4 text-sm text-foreground-lightMuted transition-all dark:border-border-dark dark:bg-input-dark-disabled dark:text-foreground-darkMuted"
              readonly
              type="email"
            >
          </div>
        </div>

        <BaseInput
          id="profile-phone"
          v-model="phone"
          icon="phone"
          label="Telefone"
          type="tel"
        />

        <div class="pt-4 sm:w-fit sm:min-w-64">
          <BaseButton type="submit">
            Salvar Alteracoes
          </BaseButton>
        </div>
      </form>
    </div>
  </section>
</template>
