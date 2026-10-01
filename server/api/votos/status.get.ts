import { defineEventHandler, createError } from 'h3'
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
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }

  const client = await serverSupabaseServiceRole(event)

  // 1. Buscar a eleição ativa (ou a mais recente)
  const { data: eleicoes } = await client
    .from('eleicoes')
    .select('*')
    .eq('status', 'em_andamento')
    .order('created_at', { ascending: false })
    .limit(1)

  let eleicaoAtiva = eleicoes && eleicoes.length > 0 ? eleicoes[0] : null

  if (!eleicaoAtiva) {
    const { data: ultimas } = await client
      .from('eleicoes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
    if (ultimas && ultimas.length > 0) {
      eleicaoAtiva = ultimas[0]
    }
  }

  if (!eleicaoAtiva) {
    return {
      jaVotou: false,
      voto: null,
      eleicao: null,
      candidatos: [],
    }
  }

  // 2. Verificar se o usuário já votou nesta eleição
  let jaVotou = false
  let votoUsuario = null

  try {
    const { data: votos } = await client
      .from('votos')
      .select('*')
      .eq('eleicao_id', eleicaoAtiva.id)
      .eq('user_id', userId)
      .limit(1)

    if (votos && votos.length > 0) {
      jaVotou = true
      votoUsuario = votos[0]
    }
  } catch (err) {
    console.error('Erro ao consultar votos:', err)
  }

  // 3. Buscar candidatos da eleição
  const { data: candidatos } = await client
    .from('candidatos')
    .select('*')
    .eq('eleicao_id', eleicaoAtiva.id)

  return {
    jaVotou,
    voto: votoUsuario,
    eleicao: eleicaoAtiva,
    candidatos: candidatos || [],
  }
})
