-- Add mood and tags columns to dreams table
ALTER TABLE public.dreams ADD COLUMN IF NOT EXISTS mood TEXT;
ALTER TABLE public.dreams ADD COLUMN IF NOT EXISTS tags TEXT[];
