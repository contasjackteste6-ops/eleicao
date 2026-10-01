import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }

  const client = await serverSupabaseServiceRole(event)
  const body = await readBody(event)

  const { titulo, descricao, data_inicio, data_fim, status } = body

  if (!titulo || !data_fim) {
    throw createError({ statusCode: 400, statusMessage: 'Título e Data de Término são obrigatórios.' })
  }

  const { data, error } = await client
    .from('eleicoes')
    .insert({
      titulo,
      descricao: descricao || null,
      data_inicio: data_inicio || new Date().toISOString(),
      data_fim,
      status: status || 'em_andamento',
      criado_por: user.id,
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
