
-- Add karmic match opt-in to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS karmic_match_enabled boolean NOT NULL DEFAULT false;

-- Karmic matches table
CREATE TABLE public.karmic_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a uuid NOT NULL,
  user_b uuid NOT NULL,
  score integer NOT NULL DEFAULT 0,
  score_details jsonb DEFAULT '{}'::jsonb,
  ai_analysis text,
  accepted_a boolean NOT NULL DEFAULT false,
  accepted_b boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours')
);

ALTER TABLE public.karmic_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches"
  ON public.karmic_matches FOR SELECT
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Users can update own acceptance"
  ON public.karmic_matches FOR UPDATE
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Soul chat messages
CREATE TABLE public.soul_chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid NOT NULL REFERENCES public.karmic_matches(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.soul_chat_messages ENABLE ROW LEVEL SECURITY;

-- Only allow chat if both accepted
CREATE POLICY "Users can view chat in accepted matches"
  ON public.soul_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.karmic_matches km
      WHERE km.id = match_id
      AND km.accepted_a = true AND km.accepted_b = true
      AND (auth.uid() = km.user_a OR auth.uid() = km.user_b)
    )
  );

CREATE POLICY "Users can send chat in accepted matches"
  ON public.soul_chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.karmic_matches km
      WHERE km.id = match_id
      AND km.accepted_a = true AND km.accepted_b = true
      AND (auth.uid() = km.user_a OR auth.uid() = km.user_b)
    )
  );

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.soul_chat_messages;

-- Index for faster match lookups
CREATE INDEX idx_karmic_matches_user_a ON public.karmic_matches(user_a);
CREATE INDEX idx_karmic_matches_user_b ON public.karmic_matches(user_b);
CREATE INDEX idx_karmic_matches_expires ON public.karmic_matches(expires_at);
CREATE INDEX idx_soul_chat_match ON public.soul_chat_messages(match_id);
