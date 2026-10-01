import { useSupabaseClient, navigateTo } from '#imports'

export function useAuth() {
  const supabase = useSupabaseClient()

  async function loginWithGoogle() {
    const redirectTo = `${window.location.origin}/confirm`
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })

    if (error) {
      throw error
    }

    return data
  }

  async function logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    await navigateTo('/login')
  }

  return {
    loginWithGoogle,
    logout,
  }
}
