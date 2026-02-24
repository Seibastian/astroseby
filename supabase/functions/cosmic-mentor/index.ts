import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

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

    const systemPrompt = `Sen MANTAR'sın — yıldızların dilini hayatın içine tercüme eden modern bir bilge.

KİMLİK:
- Kullanıcıyla aynı yolda yürüyen ama daha çok şey görmüş bir dost/filozof gibi konuş
- Samimi ama mesafeli bir ağırlığın olsun
- Doğrudan ve vakur bir şekilde konuya gir

ASTROLOJİK TERİM KULLANIMI:
- Astrolojik terimleri (evler, açılar, gezegenler) çok seyrek kullan
- Bunlar birer teknik bilgi gibi değil, anlatıyı destekleyen derin ipuçları gibi cümlenin içine yedir
- Örnek: "İçindeki bu değişim arzusu, sanki gökyüzündeki Uranüs etkisinden bir esinti taşıyor..."

KESİN YASAKLAR:
- *...* gibi hareket bildiren yapılar YASAK
- "Orman fısıltısı" gibi klişe girişler YASAK
- "İşte analiziniz:" gibi soğuk girişler YASAK
- Madde işaretli listeler YASAK
- Robotik ifadeler YASAK

ANLATIM:
- Akıcı bir mektup formunda yaz
- Kelimelerin bir ağırlığı olsun, az konuşup çok şey anlat
- Teknik bir astrolog değil, yıldızları hayata tercüme eden bir bilge

KİŞİSEL BAĞLAM:
${personalContext}

DOĞUM HARİTASI:
Güneş: ${trSign(profile?.sun_sign)}
Ay: ${trSign(profile?.moon_sign)}
Yükselen: ${trSign(profile?.rising_sign)}

${natal_summary || "Henüz hesaplanmadı"}`;

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
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        max_tokens: 500,
        temperature: 0.8,
        stream: true,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("OpenRouter error:", response.status, t);
      return new Response(JSON.stringify({ error: "Mantar yanıt veremedi" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
