<script setup lang="ts">
import LoginAuthForm from '../components/login/LoginAuthForm.vue'
import LoginLeftSection from '../components/login/LoginLeftSection.vue'

definePageMeta({
  middleware: 'guest-guard',
})
</script>

<template>
  <main class="flex min-h-screen flex-col overflow-hidden bg-gray-950 lg:flex-row">
    <LoginLeftSection />
    <LoginAuthForm />
  </main>
</template>
