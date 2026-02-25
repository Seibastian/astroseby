import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { person1, person2 } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    const systemPrompt = `Sen MANTAR'sın — iki kişinin doğum haritasını karşılaştıran ilişki astroloğusun (Sinastri).

SİNASTRİ ANALİZİ YAP:
İki kişinin haritasındaki gezegenlerin, burçların ve açıların birbirleriyle nasıl etkileştiğini analiz et.

ANA BAKIŞ NOKTALARI:
1. GÜNEŞ-AY BAĞLANTI: Birinin Güneşi diğerinin Ay'ıyla nasıl etkileşiyor? Duygusal uyum mu, gerilim mi?
2. VENÜS-MARS DİNAMİĞİ: Çekim ve tutku nasıl çalışyor?
3. UYUMLU AÇILAR (Trine, Sextile): Kolaylaştırıcı enerjiler, uyumlu alanlar
4. GERİLİM AÇILARI (Square, Opposition): Öğrenilecek dersler, büyüme alanları
5. MERİDYEN/KİŞİSEL GEZEGENLER: İletişim, mantık, günlük enerji nasıl etkileşiyor?
6. ELEMENT & MODALİTE DENGESİ: Ateş, Toprak, Hava, Su dengesinde ne görünüyor?
7. EV YERLEŞİMLERİ: 7. ev (ilişki evi) ve diğer önemli evlerde ne var?

DİL:
- Paragraflar halinde, akıcı yaz
- Başlık veya madde işareti KULLANMA
- Poetik ama anlaşılır
- Türkçe
- 600-800 kelime

ÖNEMLİ: Somut, kişisel yorum yap. "Sizin için ne anlama geliyor" açısından yaz.`;

    const userMessage = `Kişi 1: ${person1.name || "Kişi 1"} - Doğum: ${person1.date} ${person1.time || ""} ${person1.place || ""}
Kişi 2: ${person2.name || "Kişi 2"} - Doğum: ${person2.date} ${person2.time || ""} ${person2.place || ""}

Bu iki kişinin sinastri analizini yap.`;

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
        max_tokens: 2000,
        temperature: 0.8,
        stream: true,
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Analiz başarısız" }), {
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
