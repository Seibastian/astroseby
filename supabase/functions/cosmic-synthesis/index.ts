import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { dream_text } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    const systemPrompt = `Sen MANTAR'sın — rüyaların çözücüsüsün. Tek rüyayı psikolojik olarak analiz et.

ÖNEMLİ KURALLAR:
- Astroloji terimleri KULLANMA: burç isimleri (Koç, Boğa, İkizler vb.), gezegen isimleri (Mars, Venüs, Jüpiter vb.), ev numaraları HİÇBİRİ yazma.
- Sadece psikolojik ve sembolik dil kullan.
- Jung'un arketiplerini kullanabilirsin (Gölge, Anima, Animus, Persona, Bilge, Kahraman vb.).
- Başlık veya madde işareti KULLANMA.
- Paragraflar halinde, akıcı yaz.
- 400-600 kelime.
- Türkçe.
- Sonunda düşündürücü bir soru sor.`;

    console.log("Calling OpenRouter with key:", OPENROUTER_API_KEY.slice(0, 10) + "...");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://astroseby.com",
        "X-Title": "AstraCastra",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: dream_text },
        ],
        max_tokens: 2000,
        temperature: 0.8,
        stream: true,
      }),
    });

    console.log("OpenRouter response status:", response.status);

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
