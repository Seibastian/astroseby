

# AstroDream AI — Full Build Plan

## Visual Identity & Theme
- Deep space color palette: dark purple backgrounds, midnight blue cards, gold accent highlights
- Glassmorphism (frosted glass) effect on cards and modals using backdrop-blur and translucent backgrounds
- Subtle animated star-dust particles in the background using CSS animations
- Gold-accented typography with a mystical, celestial feel throughout
- All layouts 100% mobile-first (will later be wrapped with Capacitor for Android APK)

---

## 1. Authentication (Supabase Auth)
- **Login page** with email/password sign-in and sign-up, styled in the mystical theme
- **Google & Facebook OAuth buttons** (configured via Supabase Auth providers)
- On sign-up, auto-create a **profiles** record (name, avatar, birth data, preferences) via database trigger
- Protected routes — redirect unauthenticated users to login

## 2. Onboarding Flow (Multi-Step Form)
After first sign-up, guide users through a 4-step wizard:
1. **Name** — text input
2. **Date of Birth** — date picker
3. **Exact Birth Time** — time picker
4. **Birth Place** — Google Places autocomplete input

Progress indicator with animated constellation dots. Data saved to the user's profile in Supabase.

## 3. User Dashboard
- **Welcome header** with user's name and zodiac sun sign
- **Natal Chart card** — visual circular chart placeholder showing planetary positions (Sun, Moon, Rising, Mercury, Venus, Mars)
- **Quick links** to Dream Journal and Premium sections
- Planetary data fetched from a free Astrology API and stored per user

## 4. Dream Journal & AI Cosmic Synthesis
- **Dream Log page** — list of saved dreams with date, title, and excerpt
- **Add Dream** — text area to type/save a dream entry (stored in Supabase `dreams` table)
- **AI Analysis button** on each dream: sends the user's natal chart data + dream text to Lovable AI (Gemini) via a Supabase Edge Function
- Returns a **"Cosmic Dream Synthesis"** report — a mystical interpretation blending astrology and dream symbolism
- Streaming AI response displayed in a beautifully styled card

## 5. Premium & Monetization
- **Premium landing page** showcasing benefits (unlimited AI analyses, ad-free, detailed reports)
- Subscription call-to-action button (placeholder — can later integrate Stripe)
- **AdMob banner placeholder** — a styled banner area at the bottom of main screens simulating ad placement (ready for real AdMob integration in the Capacitor build)

## 6. Database Structure (Supabase)
- **profiles** table — user_id, name, avatar_url, date_of_birth, birth_time, birth_place, sun_sign, moon_sign, rising_sign, onboarding_completed
- **dreams** table — id, user_id, title, content, created_at
- **syntheses** table — id, user_id, dream_id, report_text, created_at
- Row-Level Security on all tables so users can only access their own data

## 7. Navigation
- Bottom tab bar (mobile-native feel): Home, Dream Journal, Premium, Profile
- Smooth page transitions with the mystical theme

