import { defineEventHandler } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)

  // Obter a eleição ativa
  const { data: eleicoes } = await client
    .from('eleicoes')
    .select('id, titulo, resultado_publico_ativo, resultado_congelado')
    .order('created_at', { ascending: false })
    .limit(1)

  const eleicao = eleicoes?.[0]

  if (!eleicao || !eleicao.resultado_publico_ativo) {
    return {
      ativo: false,
      mensagem: 'A divulgação do resultado da apuração está temporariamente bloqueada pela administração.',
    }
  }

  return {
    ativo: true,
    titulo: eleicao.titulo,
    data: eleicao.resultado_congelado || {
      updated_at: new Date().toISOString(),
      totalVotos: 0,
      brancos: 0,
      nulos: 0,
      apuracao: [],
    },
  }
})
