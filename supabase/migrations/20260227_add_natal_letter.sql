-- Add natal_letter_used column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS natal_letter_used BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS natal_letter_content TEXT;
