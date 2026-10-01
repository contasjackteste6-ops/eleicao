import { defineEventHandler } from 'h3'
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)
    if (!user) return { isAdmin: false }

    const client = serverSupabaseServiceRole(event)
    const { data } = await client
      .from('administradores')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    return { isAdmin: !!data }
  } catch (err) {
    return { isAdmin: false }
  }
})
