-- ALTER TABLE DA TABELA PUBLIC.ELEICOES
-- Adiciona a coluna para publicar resultado congelado e liberar/bloquear acesso público
ALTER TABLE public.eleicoes 
ADD COLUMN IF NOT EXISTS resultado_publico_ativo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS resultado_congelado JSONB DEFAULT NULL;
