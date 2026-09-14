<script setup lang="ts">
import LoginAuthForm from '~/components/login/LoginAuthForm.vue'
import LoginLeftSection from '~/components/login/LoginLeftSection.vue'

definePageMeta({
  layout: false,
  middleware: 'guest-guard',
})
</script>

<template>
  <main class="flex min-h-screen flex-col overflow-hidden bg-background-dark lg:flex-row">
    <LoginLeftSection />
    <LoginAuthForm />
  </main>
</template>
