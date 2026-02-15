
-- Chamber messages table for Soul Chambers (Ruh Ailesi)
CREATE TABLE public.chamber_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chamber_id text NOT NULL, -- zodiac sign name e.g. 'Aries', 'Taurus'
  user_id uuid NOT NULL,
  sender_handle text NOT NULL, -- cosmic handle e.g. 'Oğlak_15°'
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chamber_messages ENABLE ROW LEVEL SECURITY;

-- Security definer function to get user's sun sign
CREATE OR REPLACE FUNCTION public.get_user_sun_sign(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sun_sign FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Users can only READ messages from their own sun sign chamber
CREATE POLICY "Users can read own chamber"
ON public.chamber_messages
FOR SELECT
USING (
  chamber_id = public.get_user_sun_sign(auth.uid())
);

-- Users can only INSERT messages into their own sun sign chamber
CREATE POLICY "Users can write own chamber"
ON public.chamber_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND chamber_id = public.get_user_sun_sign(auth.uid())
);

-- Index for fast chamber queries
CREATE INDEX idx_chamber_messages_chamber ON public.chamber_messages(chamber_id, created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chamber_messages;
