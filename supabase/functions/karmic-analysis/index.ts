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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const elA = SIGN_ELEMENT[profile_a?.sun_sign] || "Unknown";
    const elB = SIGN_ELEMENT[profile_b?.sun_sign] || "Unknown";

    let systemPrompt: string;

    if (mode === "icebreaker") {
      systemPrompt = `Sen bir astrolojik sohbet kolaylaştırıcısısın. İki kişinin doğum haritasına dayalı olarak derin, anlamlı ve mistik bir "buz kırıcı" soru üret. Soru Türkçe olmalı, ruhani ve düşündürücü olmalı. Tek bir soru üret, açıklama ekleme.

Kişi A: ${profile_a?.name || "Gizemli Ruh"} — Güneş: ${trSign(profile_a?.sun_sign)}, Ay: ${trSign(profile_a?.moon_sign)}, Yükselen: ${trSign(profile_a?.rising_sign)}
Kişi B: ${profile_b?.name || "Gizemli Ruh"} — Güneş: ${trSign(profile_b?.sun_sign)}, Ay: ${trSign(profile_b?.moon_sign)}, Yükselen: ${trSign(profile_b?.rising_sign)}`;
    } else {
      systemPrompt = `Sen derin astroloji ve karmik ilişkiler konusunda uzman bir kozmik rehbersin. Türkçe yazıyorsun. Yüksek titreşimli, mistik ve psikolojik derinliği olan bir dil kullanıyorsun.

İki kişinin sinastri (karşılaştırmalı harita) analizini yapacaksın. TAM OLARAK 3 paragraf yaz:

**Paragraf 1 — "Neden Bir Araya Geldiniz?"**
Gezegen dizilimlerine odaklan. Element uyumlarını, Güneş-Ay ilişkisini ve yükselen burç etkileşimlerini açıkla.

**Paragraf 2 — "Karmik Göreviniz"**
Birbirlerine ne öğretebileceklerini açıkla. Gölge çalışması (shadow work) perspektifinden yaz. Her iki kişinin potansiyel gölge yönlerini ve karşılıklı iyileşme alanlarını belirt.

**Paragraf 3 — "Potansiyel Gelecek"**
Ruhani büyüme perspektifinden yaz. Bu bağlantının her iki kişiyi nereye götürebileceğini, evrimsel potansiyellerini açıkla.

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

Markdown formatında yaz. Her paragrafın başlığını kalın yap.`;
    }

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
          { role: "user", content: mode === "icebreaker" ? "Bu iki kişi için derin bir buz kırıcı soru üret." : "Bu iki kişinin karmik bağ analizini yap." },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "İstek limiti aşıldı. Lütfen biraz bekleyin." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI kredileri tükendi." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
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
