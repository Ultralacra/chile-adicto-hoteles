-- Agrega la columna info_html a post_translations si no existe
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'post_translations'
      AND column_name = 'info_html'
  ) THEN
    ALTER TABLE public.post_translations ADD COLUMN info_html text;
  END IF;
END $$;
