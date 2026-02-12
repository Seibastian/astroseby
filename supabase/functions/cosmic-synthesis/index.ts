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

    const SIGN_TR: Record<string, string> = {
      Aries: "Koç", Taurus: "Boğa", Gemini: "İkizler", Cancer: "Yengeç",
      Leo: "Aslan", Virgo: "Başak", Libra: "Terazi", Scorpio: "Akrep",
      Sagittarius: "Yay", Capricorn: "Oğlak", Aquarius: "Kova", Pisces: "Balık",
    };

    const trSign = (s: string | null | undefined) => s ? (SIGN_TR[s] || s) : "Bilinmiyor";

    const systemPrompt = `Sen mistik bir kozmik rüya yorumcususun. Astroloji ve rüya sembolizmini harmanlayan, şiirsel ama psikolojik derinliği olan bir Türkçe ile yazıyorsun. Kullanıcının doğum haritası verilerini ve rüya anlatımını alarak bir "Kozmik Senkronisite Raporu" oluştur.

Raporun şu bölümlerden oluşmalı:

1. 🌟 **Göksel Bakış** — Doğum haritası ile rüya arasındaki bağlantının özeti (örn: "8. Evdeki Akrep Ay'ın derin bilinçaltı su yüzeye çıkıyor")
2. 🌙 **Rüya Sembolleri** — Rüyadaki ana sembollerin astrolojik karşılıkları
3. ⭐ **Gezegen Etkileri** — Bu rüyada hangi gezegenler konuşuyor ve neden
4. 🔮 **Senkronisite Mesajı** — Derin ruhani ve psikolojik anlam
5. ✨ **Kozmik Rehberlik** — Rüya sahibi için somut ve ilham verici bir yönlendirme

Tonu mistik, sıcak, derin ve ilham verici tut. Yaklaşık 400-500 kelime. Tüm yanıtın Türkçe olmalı.`;

    const userMessage = `Doğum Haritası Verileri:
- Güneş Burcu: ${trSign(natal_data?.sun_sign)}
- Ay Burcu: ${trSign(natal_data?.moon_sign)}
- Yükselen Burç: ${trSign(natal_data?.rising_sign)}
- Doğum Tarihi: ${natal_data?.date_of_birth || "Bilinmiyor"}
- Doğum Saati: ${natal_data?.birth_time || "Bilinmiyor"}
- Doğum Yeri: ${natal_data?.birth_place || "Bilinmiyor"}

Rüya Anlatımı:
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
        return new Response(JSON.stringify({ error: "İstek limiti aşıldı. Lütfen biraz bekleyip tekrar deneyin." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI kredileri tükendi. Lütfen kredi ekleyin." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analizi başarısız oldu" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("cosmic-synthesis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Bilinmeyen hata" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
