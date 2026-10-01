import { defineNuxtRouteMiddleware, navigateTo, useSupabaseUser, useSupabaseClient, useState } from '#imports'

export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  // Guardar estado de admin em memória para evitar chamadas lentas a cada rota
  const adminState = useState<boolean | null>('is-admin-checked', () => null)
  if (adminState.value === true) {
    return
  }

  let userId = user.value?.id
  if (!userId) {
    const { data } = await supabase.auth.getSession()
    userId = data?.session?.user?.id
  }

  if (!userId) {
    return navigateTo('/login')
  }

  // Consulta ao Supabase
  const { data: admin, error } = await supabase
    .from('administradores')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !admin) {
    adminState.value = false
    return navigateTo('/')
  }

  adminState.value = true
})
