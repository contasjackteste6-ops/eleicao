<script setup lang="ts">
import PasswordRecoveryForm from '../components/perfil/PasswordRecoveryForm.vue'
import UserProfileForm from '../components/perfil/UserProfileForm.vue'

definePageMeta({
  layout: 'default',
})
</script>

<template>
  <main class="p-6">
    <section class="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 class="text-3xl font-bold">
          Perfil
        </h1>
        <p class="mt-2 text-sm text-foreground-lightSecondary dark:text-foreground-darkSecondary">
          Gerencie seus dados pessoais e seguranca da conta.
        </p>
      </div>

      <UserProfileForm />
      <PasswordRecoveryForm />
    </section>
  </main>
</template>
