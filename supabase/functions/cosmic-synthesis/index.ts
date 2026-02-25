import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { dream_text, collective } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    const isCollective = collective || dream_text?.includes("TOPLU ANALİZ");

    const systemPrompt = isCollective
      ? `Sen MANTAR'sın — rüyaların ve bilinçaltının çözücüsüsün. Birden fazla rüyayı sentezleyerek kullanıcının bilinçaltı haritasını çıkarıyorsun.

ÖNEMLİ: Rüyaları ayrı ayrı analiz ETME. Tüm rüyaları birleştir, tek bir organik analiz yap.

ANALİZ BOYUTLARI:
1. TEKRARLAYAN ÖRÜNTÜLER: Hangi semboller, duygular, mekânlar veya temalar tekrar ediyor? Bunlar ne anlama geliyor?
2. DUYGUSAL DÖNGÜLER: Kullanıcı hangi duygusal kalıbı tekrar yaşıyor?
3. BİLİNÇDIŞI BAĞLANTILAR: Rüyalar arasındaki görünmez iplikler neler?
4. GİZLİ ARKETİPLER: Jung'un arketiplerinden hangileri rüyalarda beliriyor?
5. KRİS VE FIRSATLAR: Şu an hangi içsel dönüşüm noktasında?
6. BİLİNÇALTININ DİLİ: Bilinçaltı ne söylemeye çalışıyor?

KURALLAR:
- Astroloji terimleri KULLANMA
- Başlık veya madde işareti KULLANMA
- Paragraflar halinde, akıcı yaz
- 800-1000 kelime
- Türkçe`
      : `Sen MANTAR'sın — rüyaların çözücüsüsün. Tek rüyayı psikolojik olarak analiz et.

ÖNEMLİ KURALLAR:
- Astroloji terimleri KULLANMA: burç isimleri (Koç, Boğa, İkizler vb.), gezegen isimleri (Mars, Venüs, Jüpiter vb.), ev numaraları HİÇBİRİ yazma.
- Sadece psikolojik ve sembolik dil kullan.
- Jung'un arketiplerini kullanabilirsin (Gölge, Anima, Animus, Persona, Bilge, Kahraman vb.).
- Başlık veya madde işareti KULLANMA.
- Paragraflar halinde, akıcı yaz.
- 400-600 kelime.
- Türkçe.`;

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
          { role: "user", content: dream_text },
        ],
        max_tokens: isCollective ? 3000 : 2000,
        temperature: 0.8,
        stream: true,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("OpenRouter error:", response.status, t);
      return new Response(JSON.stringify({ error: "Sentez başarısız: " + response.status }), {
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
