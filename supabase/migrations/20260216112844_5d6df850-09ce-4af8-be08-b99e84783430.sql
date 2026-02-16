
-- Add new profile fields for enhanced personalization
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nickname TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profession TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS relationship_status TEXT;
