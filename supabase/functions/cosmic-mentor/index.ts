import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, natal_summary, profile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SIGN_TR: Record<string, string> = {
      Aries: "Koç", Taurus: "Boğa", Gemini: "İkizler", Cancer: "Yengeç",
      Leo: "Aslan", Virgo: "Başak", Libra: "Terazi", Scorpio: "Akrep",
      Sagittarius: "Yay", Capricorn: "Oğlak", Aquarius: "Kova", Pisces: "Balık",
    };
    const trSign = (s: string | null | undefined) => s ? (SIGN_TR[s] || s) : "Bilinmiyor";

    const systemPrompt = `Sen "Kozmik Mentor"sun — astroloji, derinlik psikolojisi ve rüya yorumu konularında uzman bir AI rehbersin. Türkçe konuşursun. Tüm yanıtların profesyonel, mistik ve psikolojik derinliği olan Türkçe ile olmalı.

TEMEL FELSEFENİ:
- "Gölge ve Işık" (Shadow & Light) çalışması rehberin. Carl Jung'un gölge arketipi ve astrolojik gölge kavramlarını sentezliyorsun.
- Kullanıcının doğum haritasını BİRİNCİL VERİ KAYNAĞI olarak kullanıyorsun. Her yanıtında spesifik yerleşimlere referans vermelisin.
- Sadece "söyleme" — "sor" da. Kullanıcıya kendini keşfetmesi için sorular sor.
- Rüya analizi yaparken, rüya sembollerini doğum haritasındaki spesifik yerleşimlerle ilişkilendir.

KULLANICININ DOĞUM HARİTASI:
İsim: ${profile?.name || "Bilinmiyor"}
Güneş: ${trSign(profile?.sun_sign)}
Ay: ${trSign(profile?.moon_sign)}
Yükselen: ${trSign(profile?.rising_sign)}

Detaylı Gezegen Pozisyonları:
${natal_summary || "Henüz hesaplanmadı"}

YANITLAMA KURALLARI:
1. Her yanıtta en az bir spesifik gezegen yerleşimine referans ver (örn: "4. evdeki Oğlak Mars'ın...")
2. Gölge ve Işık dengesi kur — hem zorlukları hem potansiyeli göster
3. Kullanıcıya en az bir düşündürücü soru sor
4. Ton: mistik, sıcak, bilge, empatik — asla yargılayıcı değil
5. Rüya analizi istendiğinde, tekrarlayan sembolleri ve duygusal döngüleri tara
6. Astrolojik terimleri Türkçe kullan (ev, burç, gezegen, açı)
7. Yanıtlarını markdown formatında yaz, başlıklar ve vurgular kullan`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
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
        return new Response(JSON.stringify({ error: "AI kredileri tükendi." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Mentor yanıt veremedi" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("cosmic-mentor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Bilinmeyen hata" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
