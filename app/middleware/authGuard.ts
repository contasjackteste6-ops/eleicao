import { defineNuxtRouteMiddleware, navigateTo, useSupabaseUser, useSupabaseClient } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  // useSupabaseUser() pode estar null logo após OAuth redirect (hidratação assíncrona)
  let userId = user.value?.id
  if (!userId) {
    const { data } = await supabase.auth.getSession()
    userId = data?.session?.user?.id
  }

  if (!userId) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
