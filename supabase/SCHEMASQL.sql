-- =============================================
-- AstraCastra Supabase Database Schema
-- Tüm tablolar ve RLS politikaları
-- =============================================

-- =============================================
-- PROFILES TABLOSU
-- =============================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  birth_time TIME,
  birth_place TEXT,
  sun_sign TEXT,
  moon_sign TEXT,
  rising_sign TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  nickname TEXT,
  gender TEXT,
  profession TEXT,
  relationship_status TEXT,
  karmic_match_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- DREAMS TABLOSU
-- =============================================
CREATE TABLE public.dreams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dreams" ON public.dreams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dreams" ON public.dreams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dreams" ON public.dreams FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own dreams" ON public.dreams FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- SYNTHESES TABLOSU (Rüya analizleri)
-- =============================================
CREATE TABLE public.syntheses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dream_id UUID NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
  report_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.syntheses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own syntheses" ON public.syntheses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own syntheses" ON public.syntheses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own syntheses" ON public.syntheses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own syntheses" ON public.syntheses FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- KARMIC MATCHES TABLOSU
-- =============================================
CREATE TABLE public.karmic_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a UUID NOT NULL,
  user_b UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  score_details JSONB DEFAULT '{}'::JSONB,
  ai_analysis TEXT,
  accepted_a BOOLEAN NOT NULL DEFAULT false,
  accepted_b BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

ALTER TABLE public.karmic_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches" ON public.karmic_matches FOR SELECT 
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Users can update own acceptance" ON public.karmic_matches FOR UPDATE 
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Indexes
CREATE INDEX idx_karmic_matches_user_a ON public.karmic_matches(user_a);
CREATE INDEX idx_karmic_matches_user_b ON public.karmic_matches(user_b);
CREATE INDEX idx_karmic_matches_expires ON public.karmic_matches(expires_at);

-- =============================================
-- SOUL CHAT MESSAGES TABLOSU
-- =============================================
CREATE TABLE public.soul_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.karmic_matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.soul_chat_messages ENABLE ROW LEVEL SECURITY;

-- Only allow chat if both accepted
CREATE POLICY "Users can view chat in accepted matches" ON public.soul_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.karmic_matches km
      WHERE km.id = match_id
      AND km.accepted_a = true AND km.accepted_b = true
      AND (auth.uid() = km.user_a OR auth.uid() = km.user_b)
    )
  );

CREATE POLICY "Users can send chat in accepted matches" ON public.soul_chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.karmic_matches km
      WHERE km.id = match_id
      AND km.accepted_a = true AND km.accepted_b = true
      AND (auth.uid() = km.user_a OR auth.uid() = km.user_b)
    )
  );

CREATE INDEX idx_soul_chat_match ON public.soul_chat_messages(match_id);

-- =============================================
-- CHAMBER MESSAGES TABLOSU (Soul Chambers)
-- =============================================
CREATE TABLE public.chamber_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chamber_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  sender_handle TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chamber_messages ENABLE ROW LEVEL SECURITY;

-- Function to get user's sun sign
CREATE OR REPLACE FUNCTION public.get_user_sun_sign(_user_id UUID)
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT sun_sign FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Users can only READ messages from their own sun sign chamber
CREATE POLICY "Users can read own chamber" ON public.chamber_messages FOR SELECT
  USING (chamber_id = public.get_user_sun_sign(auth.uid()));

-- Users can only INSERT messages into their own sun sign chamber
CREATE POLICY "Users can write own chamber" ON public.chamber_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND chamber_id = public.get_user_sun_sign(auth.uid())
  );

CREATE INDEX idx_chamber_messages_chamber ON public.chamber_messages(chamber_id, created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chamber_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.soul_chat_messages;

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
