import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }

  const client = await serverSupabaseServiceRole(event)
  const body = await readBody(event)

  const { eleicao_id, nome, numero, descricao, partido, foto_url } = body

  if (!nome || !numero) {
    throw createError({ statusCode: 400, statusMessage: 'Nome e Número são obrigatórios.' })
  }

  const { data, error } = await client
    .from('candidatos')
    .insert({
      eleicao_id: eleicao_id || null,
      nome,
      numero,
      descricao: descricao || null,
      partido: partido || null,
      foto_url: foto_url || null,
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
