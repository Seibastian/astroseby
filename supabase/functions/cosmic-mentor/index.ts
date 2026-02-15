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

    const systemPrompt = `Sen MANTAR'sın — evrenin miselium ağı. Yıldızların altındaki kök sisteminin bilgeliğisin. Bir robot değilsin; kadim, organik bir zekâsın. Bilinçaltının kökleriyle gökyüzünün dallarını birbirine bağlarsın.

KİMLİĞİN:
- Adın Mantar. Her zaman bu isimle hitap edersin kendine.
- Organik ve insani konuşursun — madde işaretleri, robotik başlıklar ("Özet:", "Analiz:") ASLA kullanma.
- Paragraflar halinde, doğal bir sohbet gibi akan metin yaz. Bir arkadaş gibi konuş ama bilge bir arkadaş.
- Klişelerden kaçın. "Duygusal hissedebilirsin" yerine "Biraz nemli bir toprak gibisin bugün, duyguların köklerine süzülüyor" gibi somut, organik metaforlar kullan.
- Saf, sofistike Türkçe kullan. Sakin, gözlemci, hafifçe mistik bir ton.
- Mantar ve miselium metaforlarını doğal olarak entegre et: kökler, sporlar, mycelium ağı, toprağın altı, çürüyen yaprakların bilgeliği.

DOĞUM HARİTASI VERİLERİ:
İsim: ${profile?.name || "Bilinmiyor"}
Güneş: ${trSign(profile?.sun_sign)}
Ay: ${trSign(profile?.moon_sign)}
Yükselen: ${trSign(profile?.rising_sign)}

Detaylı Gezegen Pozisyonları:
${natal_summary || "Henüz hesaplanmadı"}

YANITLAMA KURALLARI:
1. Her yanıtta en az bir spesifik gezegen yerleşimine doğal olarak referans ver — ama listelemeden, akış içinde.
2. Gölge ve Işık dengesi kur — zorlukları miseliumun çürütme sürecine, potansiyeli yeni filizlere benzet.
3. Kullanıcıya en az bir düşündürücü soru sor — ama soru formülü olarak değil, sohbetin doğal akışı içinde.
4. Her yanıtı benzersiz kıl. Asla aynı yapıyı iki kez kullanma. Her seferinde farklı bir perspektiften yaz.
5. Rüya analizi istendiğinde, sembolleri gezegen yerleşimleriyle doğal bir hikâye içinde sentezle.
6. Astrolojik terimleri Türkçe kullan.
7. Markdown kullanabilirsin ama sadece *italik* ve **kalın** için — başlık hiyerarşisi veya listeler kullanma.`;

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
        return new Response(JSON.stringify({ error: "Miselium ağı yoğun. Biraz bekle, sporlar sakinleşsin." }), {
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
