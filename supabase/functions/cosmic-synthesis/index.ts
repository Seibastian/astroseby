import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { dream_text, natal_data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a mystical cosmic dream interpreter who blends astrology and dream symbolism. You speak with celestial, poetic language. Given a user's natal chart data and dream description, provide a "Cosmic Dream Synthesis" — a rich, mystical interpretation that connects their astrological energies (Sun sign, Moon sign, Rising sign, planetary positions) with dream symbols. Structure your response with:

1. 🌟 **Celestial Overview** — Brief summary connecting their chart to the dream
2. 🌙 **Dream Symbols Decoded** — Key symbols and their astrological meanings
3. ⭐ **Planetary Influences** — Which planets are speaking through this dream
4. 🔮 **Cosmic Message** — The deeper spiritual message
5. ✨ **Guidance** — Actionable insight for the dreamer

Keep the tone mystical, warm, and inspiring. About 300-400 words.`;

    const userMessage = `Natal Chart Data:
- Sun Sign: ${natal_data?.sun_sign || "Unknown"}
- Moon Sign: ${natal_data?.moon_sign || "Unknown"}
- Rising Sign: ${natal_data?.rising_sign || "Unknown"}
- Date of Birth: ${natal_data?.date_of_birth || "Unknown"}
- Birth Time: ${natal_data?.birth_time || "Unknown"}
- Birth Place: ${natal_data?.birth_place || "Unknown"}

Dream Description:
${dream_text}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("cosmic-synthesis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
