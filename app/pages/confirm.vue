<script setup lang="ts">
import { definePageMeta, useSupabaseUser, useRouter, useSupabaseClient } from '#imports'
import { onMounted } from 'vue'

definePageMeta({
  layout: false,
})

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()

onMounted(async () => {
  let currentUser = user.value
  if (!currentUser?.id) {
    const { data } = await supabase.auth.getSession()
    currentUser = data?.session?.user || null
  }

  if (currentUser) {
    router.replace('/')
  } else {
    router.replace('/login')
  }
})
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center bg-background-light p-6 dark:bg-background-dark">
    <div class="flex flex-col items-center gap-4 text-center">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      <p class="text-sm font-medium text-foreground-lightSecondary dark:text-foreground-darkSecondary">
        Autenticando...
      </p>
    </div>
  </main>
</template>
