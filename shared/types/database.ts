export interface Profile {
  id: number
  user_id: string
  created_at: string
  data_expiracao: string
  nome: string | null
  email: string | null
  telefone: string | null
  customer: string | null
  subscription_id: string | null
  canais: number
  welcome_completed: boolean
  avatar_url: string | null
}

export interface Administrador {
  user_id: string
  created_at: string
}

export interface Eleicao {
  id: string
  titulo: string
  descricao?: string | null
  data_inicio: string
  data_fim: string
  status: 'rascunho' | 'em_andamento' | 'encerrada'
  resultado_publico_ativo?: boolean
  resultado_congelado?: any
  criado_por?: string | null
  created_at: string
  updated_at?: string
}

export interface Candidato {
  id: string
  eleicao_id?: string | null
  nome: string
  numero: string
  descricao?: string | null
  partido?: string | null
  foto_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface Voto {
  id: string
  eleicao_id: string
  user_id: string
  candidato_id?: string | null
  tipo_voto: 'nominal' | 'branco' | 'nulo'
  created_at: string
}
