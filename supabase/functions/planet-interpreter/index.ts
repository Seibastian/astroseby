import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { planet, sign, house, degree } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    const SIGN_TR: Record<string, string> = {
      Aries: "Koç", Taurus: "Boğa", Gemini: "İkizler", Cancer: "Yengeç",
      Leo: "Aslan", Virgo: "Başak", Libra: "Terazi", Scorpio: "Akrep",
      Sagittarius: "Yay", Capricorn: "Oğlak", Aquarius: "Kova", Pisces: "Balık",
    };

    const trSign = (s: string) => SIGN_TR[s] || s;

    const systemPrompt = `Sen MANTAR'sın — gezegenlerin ve burçların çözücüsüsün. Tek bir gezegenin belirli bir burçtaki anlamını açıklıyorsun.

GEZEGEN: ${planet}
BURÇ: ${trSign(sign)}
EV: ${house}
DERECE: ${degree}

ÖNEMLİ:
- Sadece bu gezegenin bu burçtaki anlamını açıkla
- 4-5 cümle yeterli
- Paragraf halinde yaz
- Astroloji terimleri kullanabilirsin
- Başlık veya madde işareti YOK
- Türkçe yaz`;

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
          { role: "user", content: `Bu gezegeni yorumla.` },
        ],
        max_tokens: 500,
        temperature: 0.8,
        stream: true,
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Yorum başarısız" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Bilinmeyen hata" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
