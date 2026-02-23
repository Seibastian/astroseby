import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY is not configured");

    const { messages, natal_summary, profile } = await req.json();

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

    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 500,
            topP: 0.95,
            topK: 40,
          },
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("Google AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "Mantar yanıt veremedi" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Bir hata oluştu.";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cosmic-mentor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Bilinmeyen hata" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
