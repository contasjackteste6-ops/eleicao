import { defineEventHandler, getHeader } from 'h3'
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    let userId: string | undefined

    try {
      const user = await serverSupabaseUser(event)
      if (user?.id) {
        userId = user.id
      }
    } catch (_) {}

    if (!userId) {
      const authHeader = getHeader(event, 'authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        const client = serverSupabaseServiceRole(event)
        const { data } = await client.auth.getUser(token)
        userId = data?.user?.id
      }
    }

    if (!userId) {
      return { isAdmin: false, message: 'Nenhum usuário autenticado na requisição.' }
    }

    const client = serverSupabaseServiceRole(event)
    const { data } = await client
      .from('administradores')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    return { isAdmin: !!data }
  } catch (err: any) {
    return { isAdmin: false, error: err?.message }
  }
})
