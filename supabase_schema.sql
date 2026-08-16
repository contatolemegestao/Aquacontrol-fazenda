-- =======================================================
-- ESQUEMA DE BANCO DE DADOS SUPABASE - AQUACONTROL (MULTI-LOTE)
-- Execute este script no SQL Editor do seu projeto Supabase
-- =======================================================

-- 1. Tabela de Viveiros
CREATE TABLE IF NOT EXISTS public.viveiros (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  area NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Povoamentos (Lotes)
CREATE TABLE IF NOT EXISTS public.povoamentos (
  id TEXT PRIMARY KEY,
  viveiro_id TEXT REFERENCES public.viveiros(id) ON DELETE CASCADE,
  numero_lote TEXT NOT NULL DEFAULT 'Lote 01',
  data_povoamento DATE NOT NULL,
  quantidade NUMERIC NOT NULL,
  densidade NUMERIC NOT NULL,
  status TEXT DEFAULT 'ativo' NOT NULL,
  data_finalizacao DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar coluna numero_lote caso a tabela já existisse
ALTER TABLE public.povoamentos ADD COLUMN IF NOT EXISTS numero_lote TEXT DEFAULT 'Lote 01';
ALTER TABLE public.povoamentos ADD COLUMN IF NOT EXISTS data_finalizacao DATE;

-- 3. Tabela de Parâmetros de Qualidade de Água
CREATE TABLE IF NOT EXISTS public.parametros (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  has_min BOOLEAN DEFAULT true NOT NULL,
  min NUMERIC,
  max NUMERIC NOT NULL,
  is_custom BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Lançamentos Diários / Medições por Lote
CREATE TABLE IF NOT EXISTS public.lancamentos (
  id TEXT PRIMARY KEY,
  viveiro_id TEXT REFERENCES public.viveiros(id) ON DELETE CASCADE,
  povoamento_id TEXT REFERENCES public.povoamentos(id) ON DELETE CASCADE,
  parameter_id TEXT REFERENCES public.parametros(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar coluna povoamento_id caso a tabela já existisse
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS povoamento_id TEXT REFERENCES public.povoamentos(id) ON DELETE CASCADE;

-- Desabilitar RLS ou permitir acesso de leitura/escrita pública com a Anon Key
ALTER TABLE public.viveiros DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.povoamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.parametros DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos DISABLE ROW LEVEL SECURITY;

-- =======================================================
-- DADOS INICIAIS DE PARÂMETROS DA SUA PLANILHA
-- =======================================================
INSERT INTO public.parametros (id, name, unit, has_min, min, max, is_custom) VALUES
('param-1', 'Oxigênio Dissolvido (O2)', 'mg/L', true, 4, 20, false),
('param-2', 'pH', '-', true, 6, 8.5, false),
('param-3', 'Temperatura', '°C', true, 28, 32, false),
('param-4', 'Alcalinidade', 'mg CaCO₃/L', true, 80, 250, false),
('param-5', 'Dureza', 'mg CaCO₃/L', true, 80, 250, false),
('param-6', 'Amônia Tóxica (NH₃)', 'mg/L', false, NULL, 0.05, false),
('param-7', 'Nitrogênio Amoniacal Total (NAT)', 'mg/L', false, NULL, 1, false),
('param-8', 'Nitrito (NO₂⁻)', 'mg/L', false, NULL, 0.5, false),
('param-9', 'Salinidade', 'ppt (g/L)', true, 10, 20, false),
('param-10', 'Transparência', 'cm', true, 30, 50, false)
ON CONFLICT (id) DO NOTHING;
