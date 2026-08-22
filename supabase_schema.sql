-- Habilitar a extensão UUID se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE VIVEIROS
CREATE TABLE IF NOT EXISTS public.viveiros (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    area NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE POVOAMENTOS / CULTIVOS (com numero_lote e status)
CREATE TABLE IF NOT EXISTS public.povoamentos (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    viveiro_id TEXT REFERENCES public.viveiros(id) ON DELETE CASCADE,
    numero_lote TEXT NOT NULL,
    data_povoamento DATE NOT NULL,
    quantidade NUMERIC NOT NULL,
    densidade NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'ativo', -- 'ativo' ou 'finalizado'
    data_finalizacao DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE PARÂMETROS
CREATE TABLE IF NOT EXISTS public.parametros (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    has_min BOOLEAN NOT NULL DEFAULT true,
    min NUMERIC,
    max NUMERIC NOT NULL,
    is_custom BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE LANÇAMENTOS DIÁRIOS (com povoamento_id, date, time e value)
CREATE TABLE IF NOT EXISTS public.lancamentos (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    viveiro_id TEXT REFERENCES public.viveiros(id) ON DELETE CASCADE,
    povoamento_id TEXT REFERENCES public.povoamentos(id) ON DELETE CASCADE,
    parameter_id TEXT REFERENCES public.parametros(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TEXT DEFAULT '08:00',
    value NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- HABILITAR ROW LEVEL SECURITY (RLS) PARA SEGURANÇA MULTI-TENANT POR USUÁRIO
ALTER TABLE public.viveiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.povoamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parametros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE RLS PARA ISOLAR DADOS POR USER_ID
CREATE POLICY "Permitir tudo apenas para o proprietario em viveiros"
ON public.viveiros FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir tudo apenas para o proprietario em povoamentos"
ON public.povoamentos FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir tudo apenas para o proprietario em parametros"
ON public.parametros FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir tudo apenas para o proprietario em lancamentos"
ON public.lancamentos FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
