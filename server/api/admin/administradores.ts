import { defineEventHandler, createError, readBody } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }

  const client = await serverSupabaseServiceRole(event)

  // 1. GET: Listar administradores e buscar e-mails
  if (event.node.req.method === 'GET') {
    const { data: admins, error: errAdmins } = await client
      .from('administradores')
      .select('*')
      .order('created_at', { ascending: false })

    if (errAdmins) {
      throw createError({ statusCode: 500, statusMessage: errAdmins.message })
    }

    const { data: usersData } = await client.auth.admin.listUsers()
    const usersMap: Record<string, string> = {}
    if (usersData?.users) {
      usersData.users.forEach((u) => {
        usersMap[u.id] = u.email || 'Email não disponível'
      })
    }

    const listaAdmins = (admins || []).map((a) => ({
      user_id: a.user_id,
      created_at: a.created_at,
      email: usersMap[a.user_id] || 'Cadastrado (Aguardando login)',
    }))

    return listaAdmins
  }

  // 2. POST: Adicionar administrador por e-mail
  if (event.node.req.method === 'POST') {
    const body = await readBody(event)
    const { email } = body || {}

    if (!email || typeof email !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'E-mail inválido.' })
    }

    const emailTratado = email.trim().toLowerCase()

    // Buscar se o usuário já existe no Auth do Supabase
    const { data: usersData } = await client.auth.admin.listUsers()
    const usuarioExistente = usersData?.users?.find(
      (u) => u.email?.toLowerCase() === emailTratado
    )

    let targetUserId: string

    if (usuarioExistente) {
      targetUserId = usuarioExistente.id
    } else {
      // Se não existir no Auth, cria a conta de usuário convidado
      const { data: novoUsuario, error: createErr } = await client.auth.admin.createUser({
        email: emailTratado,
        email_confirm: true,
      })

      if (createErr || !novoUsuario?.user) {
        throw createError({
          statusCode: 500,
          statusMessage: createErr?.message || 'Erro ao criar conta de administrador.',
        })
      }

      targetUserId = novoUsuario.user.id
    }

    // Inserir na tabela administradores
    const { error: insertErr } = await client
      .from('administradores')
      .upsert({ user_id: targetUserId })

    if (insertErr) {
      throw createError({ statusCode: 500, statusMessage: insertErr.message })
    }

    return { success: true, email: emailTratado }
  }

  // 3. DELETE: Remover permissão de administrador
  if (event.node.req.method === 'DELETE') {
    const body = await readBody(event)
    const { user_id } = body || {}

    if (!user_id) {
      throw createError({ statusCode: 400, statusMessage: 'User ID do administrador não informado.' })
    }

    const { error: delErr } = await client
      .from('administradores')
      .delete()
      .eq('user_id', user_id)

    if (delErr) {
      throw createError({ statusCode: 500, statusMessage: delErr.message })
    }

    return { success: true }
  }
})
