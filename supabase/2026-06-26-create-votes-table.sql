-- Migración: Crear tabla de votaciones con Realtime
-- Fecha: 2026-06-26
-- Descripción: Tabla para guardar votos de usuarios por hotel con soporte Websockets
-- IMPORTANTE: Ejecutar en Supabase SQL Editor

-- 1. Crear tabla votes
CREATE TABLE IF NOT EXISTS public.votes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  hotel_slug text NOT NULL,
  voter_name text NOT NULL,
  voter_email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  site text NOT NULL DEFAULT 'chileadicto'::text
);

-- 2. Índice único para email por sitio (un email = un voto por sitio)
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_email_site_unique ON public.votes (voter_email, site);

-- 3. Índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_votes_hotel ON public.votes (hotel_slug);
CREATE INDEX IF NOT EXISTS idx_votes_site ON public.votes (site);

-- 4. Habilitar Realtime para la tabla votes
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;

-- 5. RLS (Row Level Security)
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (la validación es por API)
CREATE POLICY "Allow public read votes" ON public.votes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert votes" ON public.votes
  FOR INSERT WITH CHECK (true);

-- 6. Comentarios
COMMENT ON TABLE public.votes IS 'Tabla de votaciones de hoteles - Websockets habilitado';
COMMENT ON COLUMN public.votes.hotel_slug IS 'Slug del hotel votado';
COMMENT ON COLUMN public.votes.voter_name IS 'Nombre del votante';
COMMENT ON COLUMN public.votes.voter_email IS 'Email del votante (único por sitio)';
COMMENT ON COLUMN public.votes.site IS 'Sitio (chileadicto, santiagoadicto)';
