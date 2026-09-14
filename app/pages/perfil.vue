<script setup lang="ts">
import PasswordRecoveryForm from '../components/perfil/PasswordRecoveryForm.vue'
import UserProfileForm from '../components/perfil/UserProfileForm.vue'
</script>

<template>
  <main class="min-h-screen bg-gray-50 p-6 text-gray-900 dark:bg-gray-950 dark:text-gray-50">
    <section class="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 class="text-3xl font-bold">
          Perfil
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Gerencie seus dados pessoais e seguranca da conta.
        </p>
      </div>

      <UserProfileForm />
      <PasswordRecoveryForm />
    </section>
  </main>
</template>
