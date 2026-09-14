import { useSupabaseClient } from '#imports'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterCredentials {
  name: string
  email: string
  phone: string
  whatsapp: string
  password: string
  confirmPassword: string
}

export function useAuth() {
  const supabase = useSupabaseClient()

  async function login(credentials: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      throw error
    }

    return data
  }

  async function register(credentials: RegisterCredentials) {
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('As senhas nao conferem.')
    }

    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
          phone: credentials.phone,
          whatsapp: credentials.whatsapp,
        },
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
  }

  return {
    login,
    logout,
    register,
  }
}
