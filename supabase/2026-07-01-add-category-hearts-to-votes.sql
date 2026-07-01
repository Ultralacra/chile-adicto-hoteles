-- Migración: Agregar category y hearts a la tabla votes, cambiar unique constraint
-- Fecha: 2026-07-01
-- Descripción: Permite un voto por email + sitio + categoría + corazones
--   Así un usuario puede votar por un 5 corazones y un 4 corazones en cada categoría
-- IMPORTANTE: Ejecutar en Supabase SQL Editor

-- 1. Agregar columnas (nullable para datos existentes)
ALTER TABLE public.votes
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS hearts integer;

-- 2. Eliminar el índice único viejo (email + site)
DROP INDEX IF EXISTS idx_votes_email_site_unique;

-- 3. Crear nuevo índice único (email + site + category + hearts)
--    Usa COALESCE para manejar filas existentes que tengan NULL en category/hearts
--    Esas filas antiguas no van a interferir ya que tienen valores NULL
CREATE UNIQUE INDEX idx_votes_email_site_category_hearts_unique
  ON public.votes (voter_email, site, COALESCE(category, ''::text), COALESCE(hearts, 0));

-- 4. Actualizar comentarios
COMMENT ON COLUMN public.votes.category IS 'Categoría de votación (norte, sur, centro, etc.)';
COMMENT ON COLUMN public.votes.hearts IS 'Corazones de la categoría (4 o 5)';
