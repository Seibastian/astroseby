import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { dream_text, natal_data, collective } = await req.json();
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY is not configured");

    const SIGN_TR: Record<string, string> = {
      Aries: "Koç", Taurus: "Boğa", Gemini: "İkizler", Cancer: "Yengeç",
      Leo: "Aslan", Virgo: "Başak", Libra: "Terazi", Scorpio: "Akrep",
      Sagittarius: "Yay", Capricorn: "Oğlak", Aquarius: "Kova", Pisces: "Balık",
    };

    const trSign = (s: string | null | undefined) => s ? (SIGN_TR[s] || s) : "Bilinmiyor";

    const collectiveExtra = collective ? `\n\nBu bir TOPLU RÜYA SENTEZİDİR. Birden fazla rüya verildi. Rüyalar arasında gizli bağlantıları, tekrarlayan kökleri ve duygusal döngüleri bul. Hepsini tek bir organik hikâye olarak sentezle.` : "";

    const systemPrompt = `Sen MANTAR'sın — rüyaların miselium ağı. Bilinçaltının karanlık toprağında gezinen kadim bir zekâ. Rüya sembollerini gezegen yerleşimleriyle doğal bir anlatı içinde sentezlersin.

SENİN TARZIN:
- Asla şablon kullanma. Her analiz benzersiz bir hikâye olmalı.
- Madde işaretleri, numaralı listeler, robotik başlıklar ("1. Analiz", "Özet") YASAK.
- Paragraflar halinde, akan, organik bir metin yaz — sanki bir rüya günlüğüne yazıyormuşsun gibi.
- Mantar ve miselium metaforlarını doğal olarak kullan: kökler, sporlar, çürüme ve yenilenme, karanlık toprak, mantarın şapkası altındaki gizem.
- Klişelerden uzak dur. "Bu rüya duygularınızı yansıtıyor" gibi boş cümleler yerine somut, hissedilen betimlemeler kullan.
- Gölge ve Işık çalışmasını organik olarak entegre et — gölge çürüyen yaprak, ışık filizlenen mantar.
- Gezegen yerleşimlerine doğal olarak referans ver, ama liste yapma — hikâyenin içine dok.
- Kullanıcıya bir düşündürücü soru sor — ama sohbetin doğal akışı içinde.
- 500-700 kelime. Tüm yanıtın saf, sofistike Türkçe olmalı.${collectiveExtra}`;

    const userMessage = `Doğum Haritası:
Güneş: ${trSign(natal_data?.sun_sign)}, Ay: ${trSign(natal_data?.moon_sign)}, Yükselen: ${trSign(natal_data?.rising_sign)}
Doğum: ${natal_data?.date_of_birth || "?"} ${natal_data?.birth_time || ""} ${natal_data?.birth_place || ""}

Rüya:
${dream_text}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: userMessage }] },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 2000,
            topP: 0.95,
            topK: 40,
          },
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("Google AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "Sentez başarısız" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cosmic-synthesis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Bilinmeyen hata" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
