import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  let user = await serverSupabaseUser(event)
  let userId = user?.id || (user as any)?.sub

  if (!userId) {
    try {
      const stdClient = await serverSupabaseClient(event)
      const { data: { user: authUser } } = await stdClient.auth.getUser()
      userId = authUser?.id || (authUser as any)?.sub
    } catch (err) {}
  }

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Sessão expirada. Faça login novamente.' })
  }

  const client = await serverSupabaseServiceRole(event)
  const body = await readBody(event)

  const { eleicao_id, candidato_numero, tipo_voto } = body

  if (!eleicao_id) {
    throw createError({ statusCode: 400, statusMessage: 'Eleição não informada.' })
  }

  // 1. Verificar se o usuário já votou nesta eleição
  const { data: votosExistentes } = await client
    .from('votos')
    .select('id')
    .eq('eleicao_id', eleicao_id)
    .eq('user_id', userId)

  if (votosExistentes && votosExistentes.length > 0) {
    throw createError({ statusCode: 400, statusMessage: 'Você já registrou seu voto nesta eleição!' })
  }

  let candidatoId: string | null = null
  let finalTipoVoto = tipo_voto || 'nominal'

  if (finalTipoVoto === 'nominal' && candidato_numero) {
    const { data: candidato } = await client
      .from('candidatos')
      .select('id')
      .eq('eleicao_id', eleicao_id)
      .eq('numero', candidato_numero)
      .single()

    if (candidato) {
      candidatoId = candidato.id
    } else {
      // Se não encontrar o número digitado, o voto é considerado NULO
      finalTipoVoto = 'nulo'
    }
  }

  // 2. Inserir voto garantindo user_id VÁLIDO e NÃO NULO
  const { data: novoVoto, error: insertError } = await client
    .from('votos')
    .insert({
      eleicao_id,
      user_id: userId,
      candidato_id: candidatoId,
      tipo_voto: finalTipoVoto,
    })
    .select()
    .single()

  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: insertError.message })
  }

  return { success: true, voto: novoVoto }
})
