-- ==========================================================
-- SCRIPT SQL DE SEGURANÇA MÁXIMA PARA A TABELA DE VOTOS
-- COPIE E EXECUTE ESTE CÓDIGO NO SQL EDITOR DO SEU SUPABASE
-- ==========================================================

-- 1. Criar tabela de Votos (se ainda não existir)
CREATE TABLE IF NOT EXISTS public.votos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eleicao_id UUID REFERENCES public.eleicoes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  candidato_id UUID REFERENCES public.candidatos(id) ON DELETE SET NULL,
  tipo_voto VARCHAR(20) NOT NULL CHECK (tipo_voto IN ('nominal', 'branco', 'nulo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unq_user_eleicao UNIQUE (user_id, eleicao_id)
);

-- 2. HABILITAR ROW LEVEL SECURITY (RLS ATIVADO PARA SEGURANÇA TOTAL)
ALTER TABLE public.votos ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas para evitar duplicidade
DROP POLICY IF EXISTS "Usuários podem ver apenas seus votos" ON public.votos;
DROP POLICY IF EXISTS "Usuários podem registrar seu próprio voto" ON public.votos;
DROP POLICY IF EXISTS "Permitir leitura de votos para autenticados" ON public.votos;
DROP POLICY IF EXISTS "Permitir insercao de voto pelo eleitor" ON public.votos;

-- 4. POLÍTICA DE LEITURA (SELECT): Cada eleitor só pode visualizar SEU PRÓPRIO voto
CREATE POLICY "Usuários podem ver apenas seus votos"
ON public.votos FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. POLÍTICA DE INSERÇÃO (INSERT): Cada eleitor só pode registrar um voto com seu próprio user_id
CREATE POLICY "Usuários podem registrar seu próprio voto"
ON public.votos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- OBS: Nenhuma política de UPDATE ou DELETE é criada para eleitores.
-- Isso torna os votos 100% IMUTÁVEIS e IMPOSSÍVEIS de serem alterados ou apagados pelos usuários!
