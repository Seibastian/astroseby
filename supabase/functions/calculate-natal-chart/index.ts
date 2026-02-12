import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id, date_of_birth, birth_time, birth_place } = await req.json();

    if (!date_of_birth || !birth_place) {
      return new Response(JSON.stringify({ error: "Missing date_of_birth or birth_place" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are an expert astrologer. Given the following birth data, calculate the Sun sign, Moon sign, and Rising sign (Ascendant).

Birth Data:
- Date of Birth: ${date_of_birth}
- Birth Time: ${birth_time || "12:00 (noon, unknown)"}
- Birth Place: ${birth_place}

Respond ONLY with valid JSON in this exact format, no other text:
{"sun_sign": "SignName", "moon_sign": "SignName", "rising_sign": "SignName"}

Use one of these exact sign names: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, errText);
      return new Response(JSON.stringify({ error: "AI calculation failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[^}]+\}/);
    if (!jsonMatch) {
      console.error("Could not parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse planetary data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signs = JSON.parse(jsonMatch[0]);

    // Update profile in database
    if (user_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceRoleKey);

      const updateData: Record<string, string> = {};
      if (signs.sun_sign) updateData.sun_sign = signs.sun_sign;
      if (signs.moon_sign) updateData.moon_sign = signs.moon_sign;
      if (signs.rising_sign) updateData.rising_sign = signs.rising_sign;

      await supabase.from("profiles").update(updateData).eq("user_id", user_id);
    }

    return new Response(JSON.stringify(signs), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("calculate-natal-chart error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
