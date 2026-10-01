import { defineEventHandler, createError, readBody } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }

  const client = await serverSupabaseServiceRole(event)

  if (event.node.req.method === 'POST') {
    const body = await readBody(event)
    const { action } = body || {}

    // Buscar a eleição principal (ou mais recente)
    const { data: eleicoes } = await client
      .from('eleicoes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    const eleicaoAtual = eleicoes?.[0]
    if (!eleicaoAtual) {
      throw createError({ statusCode: 404, statusMessage: 'Nenhuma eleição cadastrada.' })
    }

    if (action === 'toggle_public') {
      const novoStatus = !eleicaoAtual.resultado_publico_ativo
      await client
        .from('eleicoes')
        .update({ resultado_publico_ativo: novoStatus })
        .eq('id', eleicaoAtual.id)
      return { success: true, resultado_publico_ativo: novoStatus }
    }

    if (action === 'update_snapshot') {
      // 1. Obter todos os candidatos
      const { data: candidatos } = await client.from('candidatos').select('*')
      // 2. Obter votos
      const { data: votos } = await client.from('votos').select('*')

      const totalVotos = votos?.length || 0
      const countMap: Record<string, number> = {}
      let brancos = 0
      let nulos = 0

      votos?.forEach((v) => {
        if (v.tipo_voto === 'branco') brancos++
        else if (v.tipo_voto === 'nulo') nulos++
        else if (v.candidato_id) {
          countMap[v.candidato_id] = (countMap[v.candidato_id] || 0) + 1
        }
      })

      const apuracaoSnapshot = (candidatos || []).map((c) => {
        const qtd = countMap[c.id] || 0
        const pct = totalVotos > 0 ? (qtd / totalVotos) * 100 : 0
        return {
          id: c.id,
          nome: c.nome,
          numero: c.numero,
          partido: c.partido,
          foto_url: c.foto_url,
          qtdVotos: qtd,
          porcentagem: Number(pct.toFixed(1)),
        }
      })

      apuracaoSnapshot.sort((a, b) => b.qtdVotos - a.qtdVotos)

      const snapshotData = {
        updated_at: new Date().toISOString(),
        totalVotos,
        brancos,
        nulos,
        apuracao: apuracaoSnapshot,
      }

      await client
        .from('eleicoes')
        .update({ resultado_congelado: snapshotData })
        .eq('id', eleicaoAtual.id)

      return { success: true, snapshot: snapshotData }
    }
  }

  // GET NORMAL PARA O ADMIN (COM AUDITORIA COMPLETA E DADOS EM TEMPO REAL)
  const { data: eleicoes } = await client
    .from('eleicoes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  const eleicaoAtual = eleicoes?.[0] || null

  const { data: candidatos, error: errCand } = await client
    .from('candidatos')
    .select('*')
    .order('nome', { ascending: true })

  if (errCand) {
    throw createError({ statusCode: 500, statusMessage: errCand.message })
  }

  const { data: votos, error: errVotos } = await client
    .from('votos')
    .select(`
      id,
      eleicao_id,
      user_id,
      candidato_id,
      tipo_voto,
      created_at
    `)
    .order('created_at', { ascending: false })

  if (errVotos) {
    throw createError({ statusCode: 500, statusMessage: errVotos.message })
  }

  const { data: usersData } = await client.auth.admin.listUsers()
  const usersMap: Record<string, { email?: string; name?: string }> = {}

  if (usersData?.users) {
    usersData.users.forEach((u) => {
      usersMap[u.id] = {
        email: u.email,
        name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Eleitor',
      }
    })
  }

  const candMap: Record<string, any> = {}
  candidatos?.forEach((c) => {
    candMap[c.id] = c
  })

  const auditVotos = (votos || []).map((v) => {
    const voter = usersMap[v.user_id] || { email: 'Desconhecido', name: 'Eleitor' }
    const cand = v.candidato_id ? candMap[v.candidato_id] : null

    return {
      id: v.id,
      created_at: v.created_at,
      tipo_voto: v.tipo_voto,
      voter_id: v.user_id,
      voter_name: voter.name,
      voter_email: voter.email,
      candidato_nome: cand ? cand.nome : (v.tipo_voto === 'branco' ? 'Voto em Branco' : 'Voto Nulo'),
      candidato_numero: cand ? cand.numero : '-',
      candidato_partido: cand ? cand.partido : '-',
      candidato_foto: cand ? cand.foto_url : null,
    }
  })

  const totalVotos = votos?.length || 0
  const countMap: Record<string, number> = {}
  let brancos = 0
  let nulos = 0

  votos?.forEach((v) => {
    if (v.tipo_voto === 'branco') brancos++
    else if (v.tipo_voto === 'nulo') nulos++
    else if (v.candidato_id) {
      countMap[v.candidato_id] = (countMap[v.candidato_id] || 0) + 1
    }
  })

  const apuracao = (candidatos || []).map((c) => {
    const qtd = countMap[c.id] || 0
    const pct = totalVotos > 0 ? (qtd / totalVotos) * 100 : 0
    return {
      ...c,
      qtdVotos: qtd,
      porcentagem: Number(pct.toFixed(1)),
    }
  })

  apuracao.sort((a, b) => b.qtdVotos - a.qtdVotos)

  return {
    totalVotos,
    brancos,
    nulos,
    apuracao,
    auditVotos,
    resultado_publico_ativo: eleicaoAtual?.resultado_publico_ativo || false,
    resultado_congelado: eleicaoAtual?.resultado_congelado || null,
  }
})
