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

const trSign = (s: string | null | undefined) => s ? (SIGN_TR[s] || s) : "Bilinmiyor";

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
    }),
  });

  if (!response.ok) {
    const t = await response.text();
    throw new Error(`AI hatası: ${t}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, user_id } = await req.json();

    // Get profile data
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${user_id}&select=*`, {
      headers: { "apikey": SUPABASE_SERVICE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}` }
    });
    const profiles = await profileRes.json();
    const profile = profiles?.[0];

    const nickname = profile?.nickname || profile?.name || "Dostum";
    const gender = profile?.gender || "";
    const profession = profile?.profession || "";
    const relationship = profile?.relationship_status || "";

    if (type === "identity") {
      const systemPrompt = `Sen bir karakter analistsin. Kullanıcıya doğum haritasından yola çıkarak kısa, net ve direkt bir kimlik tanımı yazacaksın.

KURALLAR:
- Burç isimleri KULLANMA (Koç, Boğa gibi HAYIR)
- Sadece insanın karakterini, davranış kalıplarını, güçlü ve zayıf yönlerini anlat
- 3-5 cümle MAX
- Doğrudan, samimi, gerçekçi ton
- Klişelerden kaçın
- Okuyan kişi "evet bu benim" demeli
- Paragraf paragraf yaz, maddeler HAYIR

Veriler (arkaplanda kullan, doğrudan yazma):
- Güneş enerjisi: ${trSign(profile?.sun_sign)}
- Duygusal dünya: ${trSign(profile?.moon_sign)}
- Dışarıya yansıyan: ${trSign(profile?.rising_sign)}
${gender ? `- Cinsiyet: ${gender}` : ""}
${profession ? `- Meslek: ${profession}` : ""}`;

      const letter = await callAI(systemPrompt, `${nickname} için kısa bir kimlik tanımı yaz.`);

      return new Response(JSON.stringify({ letter }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: cosmic letter
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
Güneş: ${trSign(profile?.sun_sign)}, Ay: ${trSign(profile?.moon_sign)}, Yükselen: ${trSign(profile?.rising_sign)}`;

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
          { role: "user", content: `${nickname} için kişisel kozmik mektup yaz.` },
        ],
        max_tokens: 2000,
        temperature: 0.9,
        stream: true,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("OpenRouter error:", response.status, t);
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
