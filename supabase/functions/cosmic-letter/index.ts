import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { natal_summary, profile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SIGN_TR: Record<string, string> = {
      Aries: "Koç", Taurus: "Boğa", Gemini: "İkizler", Cancer: "Yengeç",
      Leo: "Aslan", Virgo: "Başak", Libra: "Terazi", Scorpio: "Akrep",
      Sagittarius: "Yay", Capricorn: "Oğlak", Aquarius: "Kova", Pisces: "Balık",
    };
    const trSign = (s: string | null | undefined) => s ? (SIGN_TR[s] || s) : "Bilinmiyor";

    const nickname = profile?.nickname || profile?.name || "Gezgin";
    const gender = profile?.gender || "";
    const profession = profile?.profession || "";
    const relationship = profile?.relationship_status || "";

    let personalContext = "";
    if (gender) personalContext += `Cinsiyet: ${gender}. `;
    if (profession) personalContext += `Meslek: ${profession}. `;
    if (relationship) personalContext += `İlişki durumu: ${relationship}. `;

    const systemPrompt = `Sen MANTAR'sın. Kullanıcıya kişisel bir mektup yazacaksın — doğum haritası analizini sıcak, samimi, mektup formatında sun.

FORMAT:
- "Sevgili ${nickname}," ile başla.
- Paragraflar halinde yaz — madde işareti veya başlık KULLANMA.
- Doğum haritasındaki önemli yerleşimleri gerçek hayat anlamlarıyla aç. Teknik jargon yok.
- Kişinin mesleki hayatı, ilişkileri ve iç dünyası hakkında somut gözlemler yap.
- Şu anki yaşam dönemini genel transit etkileriyle yorumla.
- Mektubu şu cümleyle bitir: "Aklına takılan detaylar veya güncel durumlar için bana danışabilirsin."
- Ton: Sıcak, samimi, gerçekçi. Ne fazla dramatik ne de klişe.
- Mantar, miselium, spor gibi metaforlar KULLANMA.
- Uzunluk: 4-6 paragraf.

KİŞİSEL BAĞLAM:
${personalContext}

DOĞUM HARİTASI:
Güneş: ${trSign(profile?.sun_sign)}, Ay: ${trSign(profile?.moon_sign)}, Yükselen: ${trSign(profile?.rising_sign)}

Detaylı Pozisyonlar:
${natal_summary || "Hesaplanmadı"}`;

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
          { role: "user", content: `${nickname} için kişisel kozmik mektup yaz.` },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Biraz yoğunum, bir dakika sonra tekrar dene." }), {
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
      return new Response(JSON.stringify({ error: "Mektup oluşturulamadı" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("cosmic-letter error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Bilinmeyen hata" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
