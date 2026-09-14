<script setup lang="ts">
import { computed, ref } from 'vue'
import { navigateTo } from '#imports'
import BaseButton from '../BaseButton.vue'
import BaseInput from '../BaseInput.vue'
import { useAuth } from '../../composables/useAuth'

type AuthTab = 'login' | 'register'

const activeTab = ref<AuthTab>('login')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const loginEmail = ref('')
const loginPassword = ref('')
const rememberMe = ref(false)

const registerName = ref('')
const registerEmail = ref('')
const registerPhone = ref('')
const registerWhatsapp = ref('')
const registerPassword = ref('')
const registerConfirmPassword = ref('')
const acceptedTerms = ref(false)
const authError = ref('')
const authSuccess = ref('')
const isLoading = ref(false)
const { login, register } = useAuth()

const title = computed(() => activeTab.value === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta')
const subtitle = computed(() => activeTab.value === 'login'
  ? 'Entre para acessar sua central de atendimento.'
  : 'Cadastre sua equipe e comece a organizar conversas.')

function setActiveTab(tab: AuthTab): void {
  activeTab.value = tab
  authError.value = ''
  authSuccess.value = ''
}

async function handleLogin(): Promise<void> {
  authError.value = ''
  isLoading.value = true

  try {
    await login({
      email: loginEmail.value,
      password: loginPassword.value,
    })
    await navigateTo('/')
  } catch (error) {
    authError.value = error instanceof Error ? error.message : 'Nao foi possivel fazer login.'
  } finally {
    isLoading.value = false
  }
}

async function handleRegister(): Promise<void> {
  authError.value = ''
  authSuccess.value = ''
  isLoading.value = true

  try {
    await register({
      name: registerName.value,
      email: registerEmail.value,
      phone: registerPhone.value,
      whatsapp: registerWhatsapp.value,
      password: registerPassword.value,
      confirmPassword: registerConfirmPassword.value,
    })

    authSuccess.value = 'Conta criada com sucesso. Voce ja pode fazer login.'
    activeTab.value = 'login'
    loginEmail.value = registerEmail.value
    loginPassword.value = ''
  } catch (error) {
    authError.value = error instanceof Error ? error.message : 'Nao foi possivel criar a conta.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="flex w-full items-center justify-center bg-surface p-6 transition-colors dark:bg-surface-dark lg:w-[32rem] lg:p-10">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <h2 class="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
          {{ title }}
        </h2>
        <p class="mt-2 text-sm text-foreground-lightSecondary dark:text-foreground-darkSecondary">
          {{ subtitle }}
        </p>
      </div>

      <div class="mb-6 grid grid-cols-2 rounded-2xl bg-background-lightTertiary p-1 dark:bg-background-darkTertiary">
        <button
          :class="[
            'rounded-xl px-4 py-3 text-sm font-semibold transition-all',
            activeTab === 'login' ? 'bg-surface text-primary-600 shadow-soft dark:bg-surface-dark-raised dark:text-primary-400' : 'text-foreground-lightMuted hover:text-foreground-lightSecondary dark:text-foreground-darkMuted dark:hover:text-foreground-darkSecondary',
          ]"
          type="button"
          @click="setActiveTab('login')"
        >
          Login
        </button>
        <button
          :class="[
            'rounded-xl px-4 py-3 text-sm font-semibold transition-all',
            activeTab === 'register' ? 'bg-surface text-primary-600 shadow-soft dark:bg-surface-dark-raised dark:text-primary-400' : 'text-foreground-lightMuted hover:text-foreground-lightSecondary dark:text-foreground-darkMuted dark:hover:text-foreground-darkSecondary',
          ]"
          type="button"
          @click="setActiveTab('register')"
        >
          Cadastro
        </button>
      </div>

      <form
        v-if="activeTab === 'login'"
        class="space-y-5"
        @submit.prevent="handleLogin"
      >
        <BaseInput
          id="login-email"
          v-model="loginEmail"
          icon="mail"
          label="Email"
          placeholder="seu@email.com"
          type="email"
        />

        <BaseInput
          id="login-password"
          v-model="loginPassword"
          icon="lock"
          label="Senha"
          placeholder="********"
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

        <div class="flex items-center justify-between gap-4">
          <label class="flex cursor-pointer items-center gap-2">
            <input
              v-model="rememberMe"
              class="h-4 w-4 rounded border-border-strong bg-input text-primary-500 focus:ring-primary-500 dark:border-border-dark-strong dark:bg-input-dark"
              type="checkbox"
            >
            <span class="text-sm text-foreground-lightSecondary dark:text-foreground-darkSecondary">Lembrar-me</span>
          </label>
          <NuxtLink
            class="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            to="/esquecisenha"
          >
            Esqueceu a senha?
          </NuxtLink>
        </div>

        <p
          v-if="authError"
          class="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 dark:border-danger-900 dark:bg-danger-950 dark:text-danger-200"
        >
          {{ authError }}
        </p>

        <p
          v-if="authSuccess"
          class="rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm font-medium text-success-700 dark:border-success-900 dark:bg-success-950 dark:text-success-200"
        >
          {{ authSuccess }}
        </p>

        <BaseButton
          :disabled="isLoading"
          type="submit"
        >
          {{ isLoading ? 'Entrando...' : 'Entrar' }}
        </BaseButton>
      </form>

      <form
        v-else
        class="space-y-5"
        @submit.prevent="handleRegister"
      >
        <BaseInput
          id="register-name"
          v-model="registerName"
          icon="user"
          label="Nome Completo"
          placeholder="Seu nome completo"
        />
        <BaseInput
          id="register-email"
          v-model="registerEmail"
          icon="mail"
          label="Email"
          placeholder="seu@email.com"
          type="email"
        />
        <BaseInput
          id="register-phone"
          v-model="registerPhone"
          icon="phone"
          label="Telefone"
          placeholder="+55 (11) 3333-3333"
          type="tel"
        />
        <BaseInput
          id="register-whatsapp"
          v-model="registerWhatsapp"
          icon="message-circle"
          label="WhatsApp"
          placeholder="+55 (11) 99999-9999"
          type="tel"
        />
        <BaseInput
          id="register-password"
          v-model="registerPassword"
          icon="lock"
          label="Senha"
          placeholder="********"
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
        <BaseInput
          id="register-confirm-password"
          v-model="registerConfirmPassword"
          icon="lock"
          label="Confirmar Senha"
          placeholder="********"
          :right-padding="true"
          :type="showConfirmPassword ? 'text' : 'password'"
        >
          <template #right>
            <button
              class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-foreground-lightMuted hover:text-foreground-lightSecondary dark:text-foreground-darkMuted dark:hover:text-foreground-darkSecondary"
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? 'Ocultar' : 'Ver' }}
            </button>
          </template>
        </BaseInput>

        <label class="flex items-start gap-2">
          <input
            v-model="acceptedTerms"
            class="mt-1 h-4 w-4 rounded border-border-strong bg-input text-primary-500 focus:ring-primary-500 dark:border-border-dark-strong dark:bg-input-dark"
            type="checkbox"
          >
          <span class="text-sm text-foreground-lightSecondary dark:text-foreground-darkSecondary">
            Eu aceito os
            <a class="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300" href="#">Termos de Uso</a>
            e a
            <a class="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300" href="#">Politica de Privacidade</a>
          </span>
        </label>

        <p
          v-if="authError"
          class="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 dark:border-danger-900 dark:bg-danger-950 dark:text-danger-200"
        >
          {{ authError }}
        </p>

        <BaseButton
          :disabled="isLoading"
          type="submit"
        >
          {{ isLoading ? 'Criando conta...' : 'Criar Conta' }}
        </BaseButton>
      </form>

    </div>
  </section>
</template>
