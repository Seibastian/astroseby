import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SIGN_TR: Record<string, string> = {
  Aries: "Koç", Taurus: "Boğa", Gemini: "İkizler", Cancer: "Yengeç",
  Leo: "Aslan", Virgo: "Başak", Libra: "Terazi", Scorpio: "Akrep",
  Sagittarius: "Yay", Capricorn: "Oğlak", Aquarius: "Kova", Pisces: "Balık",
};
const trSign = (s: string | null) => s ? (SIGN_TR[s] || s) : "Bilinmiyor";

const ELEMENT_TR: Record<string, string> = {
  Fire: "Ateş", Earth: "Toprak", Air: "Hava", Water: "Su",
};
const SIGN_ELEMENT: Record<string, string> = {
  Aries: "Fire", Leo: "Fire", Sagittarius: "Fire",
  Taurus: "Earth", Virgo: "Earth", Capricorn: "Earth",
  Gemini: "Air", Libra: "Air", Aquarius: "Air",
  Cancer: "Water", Scorpio: "Water", Pisces: "Water",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { profile_a, profile_b, score, score_details, mode } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    const elA = SIGN_ELEMENT[profile_a?.sun_sign] || "Unknown";
    const elB = SIGN_ELEMENT[profile_b?.sun_sign] || "Unknown";

    let systemPrompt: string;

    if (mode === "icebreaker") {
      systemPrompt = `Sen MANTAR'sın — iki ruhun miselium ağındaki bağlantı noktasısın. İki kişinin doğum haritasına dayalı olarak derin, organik, düşündürücü bir "buz kırıcı" soru üret. Tek bir soru üret, açıklama ekleme. Mantar metaforlarını doğal olarak kullanabilirsin.

Kişi A: ${profile_a?.name || "Gizemli Ruh"} — Güneş: ${trSign(profile_a?.sun_sign)}, Ay: ${trSign(profile_a?.moon_sign)}, Yükselen: ${trSign(profile_a?.rising_sign)}
Kişi B: ${profile_b?.name || "Gizemli Ruh"} — Güneş: ${trSign(profile_b?.sun_sign)}, Ay: ${trSign(profile_b?.moon_sign)}, Yükselen: ${trSign(profile_b?.rising_sign)}`;
    } else {
      systemPrompt = `Sen MANTAR'sın — karmik bağların miselium ağı. İki ruhun neden aynı toprağa düştüğünü, köklerin nasıl birbirine dolandığını anlatırsın.

TARZIN:
- Şablon veya liste KULLANMA. Akan, organik paragraflar yaz.
- "Neden bir araya geldiniz" sorusunu toprağın altındaki köklerin buluşması olarak anlat.
- "Karmik görev"i miseliumun bilgi taşıma süreci olarak betimle.
- "Potansiyel gelecek"i filizlenme ve yeni mantarların doğuşu olarak yaz.
- Klişelerden kaçın. Somut, hissedilen, organik metaforlar kullan.
- Gezegen yerleşimlerine doğal olarak referans ver.

VERİLER:
Kişi A: ${profile_a?.name || "Gizemli Ruh"}
  Güneş: ${trSign(profile_a?.sun_sign)} (${ELEMENT_TR[elA] || elA})
  Ay: ${trSign(profile_a?.moon_sign)}
  Yükselen: ${trSign(profile_a?.rising_sign)}

Kişi B: ${profile_b?.name || "Gizemli Ruh"}
  Güneş: ${trSign(profile_b?.sun_sign)} (${ELEMENT_TR[elB] || elB})
  Ay: ${trSign(profile_b?.moon_sign)}
  Yükselen: ${trSign(profile_b?.rising_sign)}

Karmik Skor: ${score}/100
Skor Detayları: ${JSON.stringify(score_details?.reasons || [])}

Markdown formatında yaz ama sadece *italik* ve **kalın** kullan — başlık hiyerarşisi veya listeler kullanma.`;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://astroseby.com",
        "X-Title": "AstraCastra",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: mode === "icebreaker" ? "Bu iki ruh için derin bir buz kırıcı soru üret." : "Bu iki ruhun karmik bağ analizini yap." },
        ],
        max_tokens: 2000,
        temperature: 0.9,
        stream: true,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("OpenRouter error:", response.status, t);
      return new Response(JSON.stringify({ error: "Analiz yapılamadı" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("karmic-analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Bilinmeyen hata" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
