import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SIGN_TR: Record<string, string> = {
  Aries: "Koç", Taurus: "Boğa", Gemini: "İkizler", Cancer: "Yengeç",
  Leo: "Aslan", Virgo: "Başak", Libra: "Terazi", Scorpio: "Akrep",
  Sagittarius: "Yay", Capricorn: "Oğlak", Aquarius: "Kova", Pisces: "Balık",
};

const ASPECT_TR: Record<string, string> = {
  conjunction: "Kavuşum",
  trine: "Üçgen",
  sextile: "Altıgen",
  square: "Kare",
  opposition: "Karşıt",
};

const PLANET_TR: Record<string, string> = {
  Sun: "Güneş", Moon: "Ay", Mercury: "Merkür", Venus: "Venüs",
  Mars: "Mars", Jupiter: "Jüpiter", Saturn: "Satürn", Uranus: "Uranüs",
  Neptune: "Neptün", Pluto: "Plüton", Chiron: "Şiron", Lilith: "Lilith",
  NorthNode: "Kuzey Düğümü", SouthNode: "Güney Düğümü",
  Ascendant: "Yükselen", MC: "MC",
};

async function callAI(systemPrompt: string, userMessage: string) {
  const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

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
        { role: "user", content: userMessage },
      ],
      max_tokens: 1000,
      temperature: 0.9,
      stream: true,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI error: ${text}`);
  }

  return response;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { p1Name, p1Sign, p1House, p2Name, p2Sign, p2House, aspectType, orb, transits } = await req.json();

    const p1 = PLANET_TR[p1Name] || p1Name;
    const p2 = PLANET_TR[p2Name] || p2Name;
    const aspect = ASPECT_TR[aspectType] || aspectType;
    const sign1 = SIGN_TR[p1Sign] || p1Sign;
    const sign2 = SIGN_TR[p2Sign] || p2Sign;

    let transitInfo = "";
    if (transits && transits.length > 0) {
      transitInfo = "\n\nGÜNÜN TRANSİTLERİ:\n";
      for (const t of transits.slice(0, 5)) {
        const tPlanet = PLANET_TR[t.planet] || t.planet;
        const tSign = SIGN_TR[t.sign] || t.sign;
        transitInfo += `- ${tPlanet} ${tSign} burcunda hareket ediyor.\n`;
      }
    }

    const systemPrompt = `Sen MANTAR'sın — astroloji ve rüya yorumcusu, sıcak ve bilge bir dostsun.

GÖREV: Kısa ve öz bir açıklama yap.

ŞABLON:
"[Gezegen1] ([burç]) ve [Gezegen2] ([burç]) arasındaki [açı] açısı şu anlama geliyor: [2-3 cümle]. Bu enerji hayatında [1 cümle] etkisi yaratıyor."

KURALLAR:
- Türkçe yaz
- Maksimum 4-6 cümle
- Paragraf halinde, madde işareti YASAK
- Teknik jargonu cümlenin içine yedir, ayrı açıklama YAPMA
- Doğal, akıcı, şiirsel dil
- "Peki bu senin için ne anlama geliyor?" sorusuyla bitir`;

    const userMessage = `Doğum haritamdaki ${p1} (${sign1}) ve ${p2} (${sign2}) arasındaki ${aspect} açısı (${orb}°) hakkında detaylı bir analiz yap.`;

    const aiResponse = await callAI(systemPrompt, userMessage);

    if (!aiResponse.ok) {
      const t = await aiResponse.text();
      throw new Error(`AI error: ${t}`);
    }

    return new Response(aiResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
