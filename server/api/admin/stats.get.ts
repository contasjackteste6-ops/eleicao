import { defineEventHandler, createError } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }

  const client = await serverSupabaseServiceRole(event)

  // 1. Contagem de Eleições
  const { count: totalEleicoes } = await client
    .from('eleicoes')
    .select('*', { count: 'exact', head: true })

  // 2. Contagem de Candidatos
  const { count: totalCandidatos } = await client
    .from('candidatos')
    .select('*', { count: 'exact', head: true })

  // 3. Contagem de Votos e últimas atividades
  const { count: totalVotos, data: ultimosVotos } = await client
    .from('votos')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(5)

  // 4. Buscar nomes dos candidatos para enriquecer as últimas atividades
  const { data: candidatos } = await client.from('candidatos').select('id, nome, numero')
  const candMap: Record<string, any> = {}
  candidatos?.forEach((c) => {
    candMap[c.id] = c
  })

  const ultimasAtividades = (ultimosVotos || []).map((v) => {
    const cand = v.candidato_id ? candMap[v.candidato_id] : null
    return {
      id: v.id,
      created_at: v.created_at,
      tipo_voto: v.tipo_voto,
      candidato_nome: cand ? cand.nome : (v.tipo_voto === 'branco' ? 'Voto em Branco' : 'Voto Nulo'),
      candidato_numero: cand ? cand.numero : '-',
    }
  })

  return {
    totalEleicoes: totalEleicoes || 0,
    totalCandidatos: totalCandidatos || 0,
    totalVotos: totalVotos || 0,
    ultimasAtividades,
  }
})
