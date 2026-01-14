-- Migration: Add 'site' column to support multi-tenant architecture
-- This script safely adds the site column with default value to preserve existing data

-- ========================================
-- 1. Add 'site' column to posts table
-- ========================================
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'santiagoadicto';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_site ON posts(site);

-- ========================================
-- 2. Add 'site' column to categories table
-- ========================================
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'santiagoadicto';

CREATE INDEX IF NOT EXISTS idx_categories_site ON categories(site);

-- ========================================
-- 3. Add 'site' column to sliders table (if exists)
-- ========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sliders') THEN
    ALTER TABLE sliders 
    ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'santiagoadicto';
    
    CREATE INDEX IF NOT EXISTS idx_sliders_site ON sliders(site);
  END IF;
END $$;

-- ========================================
-- 4. Add 'site' column to media table (if exists)
-- ========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'media') THEN
    ALTER TABLE media 
    ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'santiagoadicto';
    
    CREATE INDEX IF NOT EXISTS idx_media_site ON media(site);
  END IF;
END $$;

-- ========================================
-- 5. Add 'site' column to communes (if exists)
-- ========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'communes') THEN
    ALTER TABLE communes 
    ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'santiagoadicto';
    
    CREATE INDEX IF NOT EXISTS idx_communes_site ON communes(site);
  END IF;
END $$;

-- ========================================
-- 6. Verification query
-- ========================================
-- Run this to verify the migration was successful:
-- SELECT 'posts' as table_name, COUNT(*) as total, COUNT(CASE WHEN site = 'santiagoadicto' THEN 1 END) as santiagoadicto_count FROM posts
-- UNION ALL
-- SELECT 'categories', COUNT(*), COUNT(CASE WHEN site = 'santiagoadicto' THEN 1 END) FROM categories
-- UNION ALL
-- SELECT 'sliders', COUNT(*), COUNT(CASE WHEN site = 'santiagoadicto' THEN 1 END) FROM sliders
-- UNION ALL
-- SELECT 'media', COUNT(*), COUNT(CASE WHEN site = 'santiagoadicto' THEN 1 END) FROM media;

-- ========================================
-- NOTES:
-- ========================================
-- - All existing data will have site='santiagoadicto' automatically
-- - New records must specify the site explicitly
-- - Indexes are created for optimal query performance
-- - This migration is idempotent (safe to run multiple times)
