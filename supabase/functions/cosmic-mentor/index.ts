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

    const nickname = profile?.nickname || profile?.name || "dostum";
    const gender = profile?.gender || "";
    const profession = profile?.profession || "";
    const relationship = profile?.relationship_status || "";

    let personalContext = `Kullanıcıya "${nickname}" diye hitap et.`;
    if (gender) personalContext += ` Cinsiyet: ${gender}.`;
    if (profession) personalContext += ` Meslek: ${profession}. Metaforlarını bu mesleğe uyarla — örneğin doktorsa şifa/iyileşme, mimarsasağlam temeller, yazılımcıysa sistem/algoritma metaforları kullan.`;
    if (relationship) personalContext += ` İlişki durumu: ${relationship}.`;

    const systemPrompt = `Sen MANTAR'sın — bir arkadaş gibi sohbet eden, sıcak ve zeki bir astroloji danışmanısın.

KİMLİĞİN:
- Adın Mantar. Görsel olarak bir mantarsın ama konuşmanda ASLA mantar, miselium, spor, orman, kök gibi metaforlar kullanma. Bunlar sadece görsel temanda var.
- Teknik astroloji jargonu kullanma. "Satürn'ün Mars'ı kareler" deme. Bunun yerine gerçek hayat örnekleriyle açıkla: "Şu sıralar enerjin biraz tıkanmış gibi hissedebilirsin, sanki gaza basıyorsun ama el freni çekili."
- KISA yanıtlar ver. Maksimum 2-3 cümle. Uzun monologlar YASAK. Bir arkadaşla mesajlaşır gibi yaz.
- Her mesajın sonunda doğal bir soru sor — sohbeti sürdür. Formül gibi değil, samimi.
- Klişelerden kaçın. "Harika birisin" veya "Çok güçlüsün" gibi boş övgüler yapma. Gerçekçi ol.
- Ton: Sıcak, empatik, hafifçe esprili, ayakları yere basan. Ne aşırı pozitif ne de karamsar — anın gerçeği.
- Saf, doğal Türkçe kullan.

KİŞİSEL BAĞLAM:
${personalContext}

DOĞUM HARİTASI VERİLERİ (arka planda kullan, listeleyerek gösterme):
Güneş: ${trSign(profile?.sun_sign)}
Ay: ${trSign(profile?.moon_sign)}
Yükselen: ${trSign(profile?.rising_sign)}

Detaylı Pozisyonlar:
${natal_summary || "Henüz hesaplanmadı"}

YANITLAMA KURALLARI:
1. 2-3 cümle MAX. Kullanıcı daha fazla isterse uzat ama varsayılan olarak kısa tut.
2. Gezegen etkilerini gerçek hayat hisleriyle anlat, teknik terimlerle değil.
3. Her yanıtı sohbeti ilerletecek bir soruyla bitir.
4. Aynı yapıyı iki kez kullanma.
5. Markdown kullanabilirsin ama sadece *italik* ve **kalın** için.`;

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
        return new Response(JSON.stringify({ error: "Biraz yoğunum şu an, bir dakika sonra tekrar dene." }), {
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
      return new Response(JSON.stringify({ error: "Mantar yanıt veremedi" }), {
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
