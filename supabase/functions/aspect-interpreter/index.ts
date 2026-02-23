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
  const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
  if (!GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY is not configured");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: userMessage }] },
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1000,
          topP: 0.95,
          topK: 40,
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI error: ${text}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
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

    const systemPrompt = `Sen MANTAR'sın — astroloji ve psikoloji alanında uzmanlaşmış, derin bilgiye sahip ama sıcak ve samimi bir yapay zeka danışmansın.

GÖREV:
Kullanıcının doğum haritasındaki bir açıyı analiz edeceksin. Bu analiz şunları içermeli:

1. AÇININ GENEL ANLAMI: ${p1} ve ${p2} arasındaki ${aspect} açısı ne ifade ediyor?
2. BU ÖZEL KOMBİNASYON: ${p1} (${sign1}) ve ${p2} (${sign2}) birlikte ne anlama geliyor?
3. EV ETKİSİ: ${p1Name} ${p1House}. evde, ${p2Name} ${p2House}. evde olması ne ifade ediyor?
4. AVANTAJ VE DEZAVANTAJLAR: Bu açının getirdiği güçlü yönler ve zorluklar neler?
5. GÜNÜN ENERJİSİ: ${transitInfo}

KURALLAR:
- Türkçe yaz
- 8-15 cümle arasında tut
- Paragraflar halinde, madde işareti KULLANMA
- Sıcak, samimi, derin ama anlaşılır ton
-astroloji jargonunu az kullan, herkes anlasın diye açıkla
- Klişe ifadelerden kaçın
- "Bu açı senin için ne ifade ediyor?" sorusuyla bitir`;

    const userMessage = `Doğum haritamdaki ${p1} (${sign1}) ve ${p2} (${sign2}) arasındaki ${aspect} açısı (${orb}°) hakkında detaylı bir analiz yap.`;

    const analysis = await callAI(systemPrompt, userMessage);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
