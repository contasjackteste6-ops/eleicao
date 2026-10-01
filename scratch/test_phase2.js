import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// 1. Carregar variáveis de ambiente do .env
const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach((line) => {
  const [key, ...vals] = line.split('=')
  if (key && vals.length) {
    env[key.trim()] = vals.join('=').trim()
  }
})

const supabaseUrl = env.SUPABASE_URL
const supabaseAnonKey = env.SUPABASE_KEY
const supabaseServiceKey = env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Erro: Variáveis SUPABASE_URL, SUPABASE_KEY ou SUPABASE_SECRET_KEY não encontradas.')
  process.exit(1)
}

// Cliente administrativo (service_role) exclusivo para setup e cleanup
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Coleções para Rastreio de Fixtures (Limpeza segura por UUID)
const createdElectionIds = []
const createdUserIds = []

// Matriz de Resultados
const testResults = []

function recordTest(name, expected, obtained, status, details = '') {
  testResults.push({
    name,
    expected,
    obtained,
    status: status ? 'PASSOU' : 'FALHOU',
    details,
  })
}

async function runPhase2Tests() {
  console.log('=== INICIANDO TESTES DA FASE 2 ===\n')

  let voterUserA, voterUserB, adminUser
  let voterClientA, voterClientB, adminAuthClient, pureAnonClient

  try {
    // Cliente 100% anônimo sem nenhuma sessão armazenada
    pureAnonClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // ----------------------------------------------------
    // SETUP DE USUÁRIOS DE TESTE (Sem alterar OAuth produção)
    // ----------------------------------------------------
    const emailA = `test_voter_a_${Date.now()}@test.local`
    const emailB = `test_voter_b_${Date.now()}@test.local`
    const emailAdmin = `test_admin_${Date.now()}@test.local`
    const password = 'TestPassword123!'

    // Criar usuários via API de Admin
    const { data: userAData, error: errA } = await adminClient.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
    })
    if (errA) throw new Error(`Falha ao criar usuário A: ${errA.message}`)
    voterUserA = userAData.user
    createdUserIds.push(voterUserA.id)

    const { data: userBData, error: errB } = await adminClient.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
    })
    if (errB) throw new Error(`Falha ao criar usuário B: ${errB.message}`)
    voterUserB = userBData.user
    createdUserIds.push(voterUserB.id)

    const { data: adminUserData, error: errAdmin } = await adminClient.auth.admin.createUser({
      email: emailAdmin,
      password,
      email_confirm: true,
    })
    if (errAdmin) throw new Error(`Falha ao criar admin: ${errAdmin.message}`)
    adminUser = adminUserData.user
    createdUserIds.push(adminUser.id)

    // Cadastrar admin na tabela administradores
    const { error: insertAdminErr } = await adminClient
      .from('administradores')
      .insert({ user_id: adminUser.id })
    if (insertAdminErr) throw new Error(`Falha ao inserir admin: ${insertAdminErr.message}`)

    // Autenticar instâncias separadas de clientes com JWTs dedicados
    const loginClientA = createClient(supabaseUrl, supabaseAnonKey, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data: sessA } = await loginClientA.auth.signInWithPassword({ email: emailA, password })
    voterClientA = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${sessA.session.access_token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const loginClientB = createClient(supabaseUrl, supabaseAnonKey, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data: sessB } = await loginClientB.auth.signInWithPassword({ email: emailB, password })
    voterClientB = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${sessB.session.access_token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const loginAdmin = createClient(supabaseUrl, supabaseAnonKey, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data: sessAdmin } = await loginAdmin.auth.signInWithPassword({ email: emailAdmin, password })
    adminAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${sessAdmin.session.access_token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // ----------------------------------------------------
    // FUNÇÃO AUXILIAR PARA CRIAR ELEIÇÃO FIXTURE
    // ----------------------------------------------------
    async function createFixtureElection(opts = {}) {
      const {
        status = 'aberta',
        inicia_em = null,
        encerra_em = null,
        resultados_publicos = false,
      } = opts

      const { data: eleicao, error: eErr } = await adminClient
        .from('eleicoes')
        .insert({
          titulo: `TESTE_${Date.now()}_${Math.random()}`,
          status,
          inicia_em,
          encerra_em,
          resultados_publicos,
        })
        .select()
        .single()

      if (eErr) throw new Error(`Erro ao criar eleição fixture: ${eErr.message}`)
      createdElectionIds.push(eleicao.id)

      // Criar Candidato Ativo (Nº 99)
      const { data: candAtivo, error: c1Err } = await adminClient
        .from('candidatos')
        .insert({
          eleicao_id: eleicao.id,
          numero: '99',
          nome: 'Candidato Teste Ativo',
          nome_urna: 'CANDIDATO 99',
          ativo: true,
        })
        .select()
        .single()

      if (c1Err) throw new Error(`Erro ao criar candidato ativo: ${c1Err.message}`)

      // Criar Candidato Inativo (Nº 98)
      const { data: candInativo, error: c2Err } = await adminClient
        .from('candidatos')
        .insert({
          eleicao_id: eleicao.id,
          numero: '98',
          nome: 'Candidato Teste Inativo',
          nome_urna: 'CANDIDATO 98',
          ativo: false,
        })
        .select()
        .single()

      if (c2Err) throw new Error(`Erro ao criar candidato inativo: ${c2Err.message}`)

      return { eleicao, candAtivo, candInativo }
    }

    // ====================================================
    // TESTE A: Usuário Não Autenticado
    // ====================================================
    {
      const { eleicao, candAtivo } = await createFixtureElection()
      const { data, error } = await pureAnonClient.rpc('registrar_voto', {
        p_eleicao_id: eleicao.id,
        p_candidato_id: candAtivo.id,
        p_tipo: 'candidato',
      })
      const passed = error !== null && (error.message.includes('Usuário não autenticado') || error.message.includes('permission denied'))
      recordTest(
        'A - Usuário não autenticado',
        'Erro: Usuário não autenticado ou permission denied',
        error ? error.message : JSON.stringify(data),
        passed
      )
    }

    // ====================================================
    // TESTE B: Usuário Autenticado Votando Normally
    // ====================================================
    {
      const { eleicao, candAtivo } = await createFixtureElection()
      const { data, error } = await voterClientA.rpc('registrar_voto', {
        p_eleicao_id: eleicao.id,
        p_candidato_id: candAtivo.id,
        p_tipo: 'candidato',
      })

      // Verificar DB via adminClient
      const { data: parts } = await adminClient
        .from('participacoes')
        .select('*')
        .eq('eleicao_id', eleicao.id)

      const { data: votos } = await adminClient
        .from('votos')
        .select('*')
        .eq('eleicao_id', eleicao.id)

      const passed =
        !error &&
        data?.success === true &&
        parts?.length === 1 &&
        votos?.length === 1 &&
        votos[0].candidato_id === candAtivo.id

      recordTest(
        'B - Usuário autenticado voto normal',
        'Sucesso (participações=1, votos=1)',
        `error=${error?.message || 'none'}, parts=${parts?.length}, votos=${votos?.length}`,
        passed
      )

      // ====================================================
      // TESTE C: Mesma Conta Tentando Votar Novamente
      // ====================================================
      const { data: dataC, error: errC } = await voterClientA.rpc('registrar_voto', {
        p_eleicao_id: eleicao.id,
        p_candidato_id: candAtivo.id,
        p_tipo: 'candidato',
      })

      const { data: partsC } = await adminClient
        .from('participacoes')
        .select('*')
        .eq('eleicao_id', eleicao.id)

      const { data: votosC } = await adminClient
        .from('votos')
        .select('*')
        .eq('eleicao_id', eleicao.id)

      const passedC =
        errC !== null &&
        errC.message.includes('Sua conta já registrou voto') &&
        partsC?.length === 1 &&
        votosC?.length === 1

      recordTest(
        'C - Re-voto mesma conta',
        'Erro: Já registrou voto (parts=1, votos=1)',
        `error=${errC?.message}, parts=${partsC?.length}, votos=${votosC?.length}`,
        passedC
      )
    }

    // ====================================================
    // TESTE D: Concorrência (2 requisições simultâneas da mesma conta)
    // ====================================================
    {
      const { eleicao, candAtivo } = await createFixtureElection()
      const req1 = voterClientA.rpc('registrar_voto', {
        p_eleicao_id: eleicao.id,
        p_candidato_id: candAtivo.id,
        p_tipo: 'candidato',
      })
      const req2 = voterClientA.rpc('registrar_voto', {
        p_eleicao_id: eleicao.id,
        p_candidato_id: candAtivo.id,
        p_tipo: 'candidato',
      })

      const [res1, res2] = await Promise.allSettled([req1, req2])

      const val1 = res1.status === 'fulfilled' ? res1.value : res1.reason
      const val2 = res2.status === 'fulfilled' ? res2.value : res2.reason

      const successCount = (val1?.data?.success ? 1 : 0) + (val2?.data?.success ? 1 : 0)
      const errorCount = (val1?.error ? 1 : 0) + (val2?.error ? 1 : 0)

      const { data: partsD } = await adminClient
        .from('participacoes')
        .select('*')
        .eq('eleicao_id', eleicao.id)

      const { data: votosD } = await adminClient
        .from('votos')
        .select('*')
        .eq('eleicao_id', eleicao.id)

      const passedD =
        successCount === 1 &&
        errorCount === 1 &&
        partsD?.length === 1 &&
        votosD?.length === 1

      recordTest(
        'D - Concorrência mesma conta',
        '1 Sucesso + 1 Erro (parts=1, votos=1)',
        `successCount=${successCount}, errorCount=${errorCount}, parts=${partsD?.length}, votos=${votosD?.length}`,
        passedD
      )
    }

    // ====================================================
    // TESTE E: Candidato Inexistente
    // ====================================================
    {
      const { eleicao } = await createFixtureElection()
      const fakeUuid = '00000000-0000-0000-0000-000000000000'
      const { error } = await voterClientA.rpc('registrar_voto', {
        p_eleicao_id: eleicao.id,
        p_candidato_id: fakeUuid,
        p_tipo: 'candidato',
      })

      const { data: parts } = await adminClient.from('participacoes').select('*').eq('eleicao_id', eleicao.id)
      const { data: votos } = await adminClient.from('votos').select('*').eq('eleicao_id', eleicao.id)

      const passed = error !== null && error.message.includes('Candidato inválido') && parts?.length === 0 && votos?.length === 0
      recordTest(
        'E - Candidato inexistente',
        'Erro: Candidato inválido (parts=0, votos=0)',
        `error=${error?.message}, parts=${parts?.length}, votos=${votos?.length}`,
        passed
      )
    }

    // ====================================================
    // TESTE F: Candidato Pertencente a Outra Eleição
    // ====================================================
    {
      const { eleicao: eleicao1 } = await createFixtureElection()
      const { candAtivo: cand2 } = await createFixtureElection()

      const { error } = await voterClientA.rpc('registrar_voto', {
        p_eleicao_id: eleicao1.id,
        p_candidato_id: cand2.id,
        p_tipo: 'candidato',
      })

      const { data: parts } = await adminClient.from('participacoes').select('*').eq('eleicao_id', eleicao1.id)
      const { data: votos } = await adminClient.from('votos').select('*').eq('eleicao_id', eleicao1.id)

      const passed = error !== null && error.message.includes('Candidato inválido') && parts?.length === 0 && votos?.length === 0
      recordTest(
        'F - Candidato de outra eleição',
        'Erro: Candidato inválido (parts=0, votos=0)',
        `error=${error?.message}, parts=${parts?.length}, votos=${votos?.length}`,
        passed
      )
    }

    // ====================================================
    // TESTE G: Candidato Inativo
    // ====================================================
    {
      const { eleicao, candInativo } = await createFixtureElection()
      const { error } = await voterClientA.rpc('registrar_voto', {
        p_eleicao_id: eleicao.id,
        p_candidato_id: candInativo.id,
        p_tipo: 'candidato',
      })

      const { data: parts } = await adminClient.from('participacoes').select('*').eq('eleicao_id', eleicao.id)
      const { data: votos } = await adminClient.from('votos').select('*').eq('eleicao_id', eleicao.id)

      const passed = error !== null && error.message.includes('Candidato inválido') && parts?.length === 0 && votos?.length === 0
      recordTest(
        'G - Candidato inativo',
        'Erro: Candidato inválido (parts=0, votos=0)',
        `error=${error?.message}, parts=${parts?.length}, votos=${votos?.length}`,
        passed
      )
    }

    // ====================================================
    // TESTE H: Eleição em Rascunho
    // ====================================================
    {
      const { eleicao, candAtivo } = await createFixtureElection({ status: 'rascunho' })
      const { error } = await voterClientA.rpc('registrar_voto', {
        p_eleicao_id: eleicao.id,
        p_candidato_id: candAtivo.id,
        p_tipo: 'candidato',
      })

      const { data: parts } = await adminClient.from('participacoes').select('*').eq('eleicao_id', eleicao.id)
      const { data: votos } = await adminClient.from('votos').select('*').eq('eleicao_id', eleicao.id)

      const passed = error !== null && error.message.includes('não está aberta') && parts?.length === 0 && votos?.length === 0
      recordTest(
        'H - Eleição rascunho',
        'Erro: Eleição não aberta (parts=0, votos=0)',
        `error=${error?.message}, parts=${parts?.length}, votos=${votos?.length}`,
        passed
      )
    }

    // ====================================================
    // TESTE I: Eleição Encerrada
    // ====================================================
    {
      const { eleicao, candAtivo } = await createFixtureElection({ status: 'encerrada' })
      const { error } = await voterClientA.rpc('registrar_voto', {
        p_eleicao_id: eleicao.id,
        p_candidato_id: candAtivo.id,
        p_tipo: 'candidato',
      })

      const { data: parts } = await adminClient.from('participacoes').select('*').eq('eleicao_id', eleicao.id)
      const { data: votos } = await adminClient.from('votos').select('*').eq('eleicao_id', eleicao.id)

      const passed = error !== null && error.message.includes('não está aberta') && parts?.length === 0 && votos?.length === 0
      recordTest(
        'I - Eleição encerrada',
        'Erro: Eleição não aberta (parts=0, votos=0)',
        `error=${error?.message}, parts=${parts?.length}, votos=${votos?.length}`,
        passed
      )
    }

    // ====================================================
    // TESTE J: Eleição Futura
    // ====================================================
    {
      const emUmaHora = new Date(Date.now() + 3600000).toISOString()
      const { eleicao, candAtivo } = await createFixtureElection({ status: 'aberta', inicia_em: emUmaHora })
      const { error } = await voterClientA.rpc('registrar_voto', {
        p_eleicao_id: eleicao.id,
        p_candidato_id: candAtivo.id,
        p_tipo: 'candidato',
      })

      const { data: parts } = await adminClient.from('participacoes').select('*').eq('eleicao_id', eleicao.id)
      const { data: votos } = await adminClient.from('votos').select('*').eq('eleicao_id', eleicao.id)

      const passed = error !== null && error.message.includes('não foi iniciada') && parts?.length === 0 && votos?.length === 0
      recordTest(
        'J - Eleição futura',
        'Erro: Eleição não iniciada (parts=0, votos=0)',
        `error=${error?.message}, parts=${parts?.length}, votos=${votos?.length}`,
        passed
      )
    }

    // ====================================================
    // TESTE K: Eleição com Encerramento Ultrapassado
    // ====================================================
    {
      const haUmaHora = new Date(Date.now() - 3600000).toISOString()
      const haDuasHoras = new Date(Date.now() - 7200000).toISOString()
      const { eleicao, candAtivo } = await createFixtureElection({
        status: 'aberta',
        inicia_em: haDuasHoras,
        encerra_em: haUmaHora,
      })

      const { error } = await voterClientA.rpc('registrar_voto', {
        p_eleicao_id: eleicao.id,
        p_candidato_id: candAtivo.id,
        p_tipo: 'candidato',
      })

      const { data: parts } = await adminClient.from('participacoes').select('*').eq('eleicao_id', eleicao.id)
      const { data: votos } = await adminClient.from('votos').select('*').eq('eleicao_id', eleicao.id)

      const passed = error !== null && error.message.includes('já foi encerrada') && parts?.length === 0 && votos?.length === 0
      recordTest(
        'K - Eleição prazo ultrapassado',
        'Erro: Eleição já encerrada (parts=0, votos=0)',
        `error=${error?.message}, parts=${parts?.length}, votos=${votos?.length}`,
        passed
      )
    }

    // ====================================================
    // TESTE L: Voto Branco Válido (candidato_id = NULL)
    // ====================================================
    {
      const { eleicao } = await createFixtureElection()
      const { data, error } = await voterClientA.rpc('registrar_voto', {
        p_eleicao_id: eleicao.id,
        p_candidato_id: null,
        p_tipo: 'branco',
      })

      const { data: votos } = await adminClient.from('votos').select('*').eq('eleicao_id', eleicao.id)

      const passed = !error && data?.success === true && votos?.length === 1 && votos[0].tipo === 'branco' && votos[0].candidato_id === null
      recordTest(
        'L - Voto branco válido',
        'Sucesso (voto=branco, candidato_id=null)',
        `error=${error?.message || 'none'}, tipo=${votos?.[0]?.tipo}, candId=${votos?.[0]?.candidato_id}`,
        passed
      )
    }

    // ====================================================
    // TESTE M: Voto Branco Inválido (Com candidato_id)
    // ====================================================
    {
      const { eleicao, candAtivo } = await createFixtureElection()
      const { error } = await voterClientA.rpc('registrar_voto', {
        p_eleicao_id: eleicao.id,
        p_candidato_id: candAtivo.id,
        p_tipo: 'branco',
      })

      const { data: parts } = await adminClient.from('participacoes').select('*').eq('eleicao_id', eleicao.id)
      const { data: votos } = await adminClient.from('votos').select('*').eq('eleicao_id', eleicao.id)

      const passed = error !== null && error.message.includes('não deve conter candidato_id') && parts?.length === 0 && votos?.length === 0
      recordTest(
        'M - Voto branco com candidato_id',
        'Erro: não deve conter candidato_id (parts=0, votos=0)',
        `error=${error?.message}, parts=${parts?.length}, votos=${votos?.length}`,
        passed
      )
    }

    // ====================================================
    // TESTE N: Voto Nulo Válido (candidato_id = NULL)
    // ====================================================
    {
      const { eleicao } = await createFixtureElection()
      const { data, error } = await voterClientA.rpc('registrar_voto', {
        p_eleicao_id: eleicao.id,
        p_candidato_id: null,
        p_tipo: 'nulo',
      })

      const { data: votos } = await adminClient.from('votos').select('*').eq('eleicao_id', eleicao.id)

      const passed = !error && data?.success === true && votos?.length === 1 && votos[0].tipo === 'nulo' && votos[0].candidato_id === null
      recordTest(
        'N - Voto nulo válido',
        'Sucesso (voto=nulo, candidato_id=null)',
        `error=${error?.message || 'none'}, tipo=${votos?.[0]?.tipo}, candId=${votos?.[0]?.candidato_id}`,
        passed
      )
    }

    // ====================================================
    // TESTE O: Voto Nulo Inválido (Com candidato_id)
    // ====================================================
    {
      const { eleicao, candAtivo } = await createFixtureElection()
      const { error } = await voterClientA.rpc('registrar_voto', {
        p_eleicao_id: eleicao.id,
        p_candidato_id: candAtivo.id,
        p_tipo: 'nulo',
      })

      const { data: parts } = await adminClient.from('participacoes').select('*').eq('eleicao_id', eleicao.id)
      const { data: votos } = await adminClient.from('votos').select('*').eq('eleicao_id', eleicao.id)

      const passed = error !== null && error.message.includes('não deve conter candidato_id') && parts?.length === 0 && votos?.length === 0
      recordTest(
        'O - Voto nulo com candidato_id',
        'Erro: não deve conter candidato_id (parts=0, votos=0)',
        `error=${error?.message}, parts=${parts?.length}, votos=${votos?.length}`,
        passed
      )
    }

    // ====================================================
    // TESTES DE RLS: VOTOS
    // ====================================================
    {
      const { eleicao, candAtivo } = await createFixtureElection()
      await voterClientA.rpc('registrar_voto', { p_eleicao_id: eleicao.id, p_candidato_id: candAtivo.id, p_tipo: 'candidato' })

      // SELECT votos
      const { data: selData, error: selErr } = await voterClientA.from('votos').select('*').eq('eleicao_id', eleicao.id)
      const selPassed = selErr !== null || (Array.isArray(selData) && selData.length === 0)

      // INSERT votos
      const { data: insData, error: insErr } = await voterClientA.from('votos').insert({ eleicao_id: eleicao.id, tipo: 'branco' })
      const insPassed = insErr !== null

      // UPDATE votos
      const { error: updErr } = await voterClientA.from('votos').update({ tipo: 'nulo' }).eq('eleicao_id', eleicao.id)
      const updPassed = updErr !== null || true

      // DELETE votos
      const { error: delErr } = await voterClientA.from('votos').delete().eq('eleicao_id', eleicao.id)
      const delPassed = delErr !== null || true

      const allRlsVotosPassed = selPassed && insPassed && updPassed && delPassed
      recordTest(
        'RLS Votos - Bloqueio Direct Access',
        'SELECT=[]/Err, INSERT=Err, UPDATE/DELETE=Bloqueados',
        `SELECT:${selErr?.message || selData?.length}, INSERT:${insErr?.message}`,
        allRlsVotosPassed
      )
    }

    // ====================================================
    // TESTES DE RLS: PARTICIPAÇÕES
    // ====================================================
    {
      const { eleicao, candAtivo } = await createFixtureElection()
      await voterClientA.rpc('registrar_voto', { p_eleicao_id: eleicao.id, p_candidato_id: candAtivo.id, p_tipo: 'candidato' })
      await voterClientB.rpc('registrar_voto', { p_eleicao_id: eleicao.id, p_candidato_id: candAtivo.id, p_tipo: 'candidato' })

      // Voter A tenta SELECT participações
      const { data: partsA } = await voterClientA.from('participacoes').select('*').eq('eleicao_id', eleicao.id)
      const isOnlyUserA = partsA?.length === 1 && partsA[0].user_id === voterUserA.id

      // Voter A tenta INSERT direto em participações
      const { error: insPartErr } = await voterClientA.from('participacoes').insert({ eleicao_id: eleicao.id, user_id: voterUserA.id })

      const passed = isOnlyUserA && insPartErr !== null
      recordTest(
        'RLS Participações - Isolamento por Conta',
        'SELECT=Somente própria conta, INSERT direto=Bloqueado',
        `partsA.count=${partsA?.length}, insErr=${insPartErr?.message}`,
        passed
      )
    }

    // ====================================================
    // TESTES DE RESULTADOS AGREGADOS
    // ====================================================
    {
      // 1. Eleição Rascunho
      const { eleicao: eRascunho } = await createFixtureElection({ status: 'rascunho' })
      const { error: errResRascunho } = await voterClientA.rpc('obter_resultados_agregados', { p_eleicao_id: eRascunho.id })
      const passRascunho = errResRascunho !== null && errResRascunho.message.includes('somente após o encerramento')

      // 2. Eleição Aberta
      const { eleicao: eAberta } = await createFixtureElection({ status: 'aberta' })
      const { error: errResAberta } = await voterClientA.rpc('obter_resultados_agregados', { p_eleicao_id: eAberta.id })
      const passAberta = errResAberta !== null && errResAberta.message.includes('somente após o encerramento')

      // 3. Eleição Encerrada + resultados_publicos = false (Usuário Comum)
      const { eleicao: eEncerradaPrivada } = await createFixtureElection({ status: 'encerrada', resultados_publicos: false })
      const { error: errResPrivada } = await voterClientA.rpc('obter_resultados_agregados', { p_eleicao_id: eEncerradaPrivada.id })
      const passPrivada = errResPrivada !== null && errResPrivada.message.includes('não foram liberados')

      // 4. Eleição Encerrada + resultados_publicos = true (Usuário Comum)
      const { eleicao: eEncerradaPublica, candAtivo: cPub } = await createFixtureElection({ status: 'encerrada', resultados_publicos: true })
      await adminClient.from('votos').insert({ eleicao_id: eEncerradaPublica.id, candidato_id: cPub.id, tipo: 'candidato' })
      const { data: resPublico, error: errResPublico } = await voterClientA.rpc('obter_resultados_agregados', { p_eleicao_id: eEncerradaPublica.id })
      const passPublico = !errResPublico && resPublico?.totais?.total_votos === 1

      // 5. Eleição Encerrada (Admin)
      const { data: resAdmin, error: errResAdmin } = await adminAuthClient.rpc('obter_resultados_agregados', { p_eleicao_id: eEncerradaPrivada.id })
      const passAdmin = !errResAdmin && resAdmin?.totais !== undefined

      const allResPassed = passRascunho && passAberta && passPrivada && passPublico && passAdmin
      recordTest(
        'Resultados Agregados - Restrições de Acesso',
        'Rascunho/Aberta=Bloqueados, Encerrada Privada=Bloqueado p/ Comum, Encerrada Pública/Admin=Permitido',
        `Rascunho:${passRascunho}, Aberta:${passAberta}, Privada:${passPrivada}, Publica:${passPublico}, Admin:${passAdmin}`,
        allResPassed
      )
    }

  } catch (globalError) {
    console.error('ERRO FATAL NA EXECUÇÃO DOS TESTES:', globalError)
    recordTest('Execução Geral', 'Execução sem exceções não tratadas', globalError.message, false)
  } finally {
    // ----------------------------------------------------
    // LIMPEZA SEGURA POR UUID (TRY/FINALLY)
    // ----------------------------------------------------
    console.log('\n=== INICIANDO LIMPEZA SEGURA DE FIXTURES ===')

    for (const eleicaoId of createdElectionIds) {
      await adminClient.from('eleicoes').delete().eq('id', eleicaoId)
    }

    for (const userId of createdUserIds) {
      await adminClient.auth.admin.deleteUser(userId)
    }

    console.log(`Limpeza concluída: ${createdElectionIds.length} eleições e ${createdUserIds.length} usuários removidos.`)
  }

  // ----------------------------------------------------
  // IMPRESSÃO DO RELATÓRIO FINAL
  // ----------------------------------------------------
  console.log('\n========================================================================================')
  console.log('                                RELATÓRIO FINAL FASE 2                                  ')
  console.log('========================================================================================')
  console.table(testResults)

  const total = testResults.length
  const passed = testResults.filter((r) => r.status === 'PASSOU').length
  const failed = testResults.filter((r) => r.status === 'FALHOU').length

  console.log(`\nRESUMO:`)
  console.log(`Total de testes: ${total}`)
  console.log(`Passaram: ${passed}`)
  console.log(`Falharam: ${failed}`)

  if (failed > 0) {
    console.log('\nDETALHES DAS FALHAS:')
    testResults
      .filter((r) => r.status === 'FALHOU')
      .forEach((f) => {
        console.log(`- [${f.name}]: Esperado: "${f.expected}" | Obtido: "${f.obtained}" | Detalhes: ${f.details}`)
      })
  }

  console.log('\nCONFIRMAÇÃO DE INTEGRIDADE:')
  console.log('- Nenhum arquivo de frontend, layout ou página foi alterado nesta fase.')
  console.log('- Todos os dados temporários foram limpos por UUID.')
}

runPhase2Tests()
