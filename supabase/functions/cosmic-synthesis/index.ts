import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { dream_text, natal_data, collective } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    const SIGN_TR: Record<string, string> = {
      Aries: "Koç", Taurus: "Boğa", Gemini: "İkizler", Cancer: "Yengeç",
      Leo: "Aslan", Virgo: "Başak", Libra: "Terazi", Scorpio: "Akrep",
      Sagittarius: "Yay", Capricorn: "Oğlak", Aquarius: "Kova", Pisces: "Balık",
    };

    const trSign = (s: string | null | undefined) => s ? (SIGN_TR[s] || s) : "Bilinmiyor";

    const isCollective = collective || dream_text.includes("TOPLU ANALİZ");

    const systemPrompt = isCollective
      ? `Sen MANTAR'sın — rüyaların ve bilinçaltının çözücüsüsün. Birden fazla rüyayı sentezleyerek kullanıcının bilinçaltı haritasını çıkarıyorsun. Astroloji terimleri kullanma. Burç isimleri, gezegen isimleri, ev numaraları HİÇBİRİ yazma.

ANALİZ YAPISI:
Her rüya tek başına bir ipucudur. Birden fazlası bir haritadır. Sen bu haritayı çıkaracaksın:

1. TEKRARLAYAN ÖRÜNTÜLER: Hangi semboller, duygular, mekânlar veya temalar tekrar ediyor? Bunlar ne anlama geliyor?

2. DUYGUSAL DÖNGÜLER: Kullanıcı hangi duygusal kalıbı tekrar yaşıyor? Hangi duygular (korku, özlem, kayıp, sevinç) rüyaların altında akıyor?

3. BİLİNÇDIŞI BAĞLANTILAR: Rüyalar arasındaki görünmez iplikler neler? Bir rüyadaki kişi, diğer rüyadaki nesneyle ne bağlantıda?

4. GİZLİ ARKETİPLER: Jung'un arketiplerinden (Gölge, Persona, Anima/Animus, Bilge, Kahraman, Masum, Asi) hangileri rüyalarda dans ediyor?

5. KRİZ VE FIRSATLAR: Şu an hangi içsel dönüşüm noktasında kullanıcı? Rüyalar ne gösteriyor?

6. BİLİNÇALTININ DİLİ: Sembollerin ötesinde, bilinçaltı ne söylemeye çalışıyor?

DİL VE ÜSLUP:
- Dengeli, akıcı, şiirsel ama anlaşılır. Ne ağır ne hafif. İnsanı sersemleten değil, uyandıran kelimeler.
- Paragraflar arasında doğal geçişler. Başlık veya madde işareti kullanma.
- Her paragraf bir kapı açsın. Okuyucu "hmm" desin, "evet" desin.
- 700-1000 kelime arası.
- Türkçe. Sofistike ama sade.${isCollective ? "\n\n[BU BİR TOPLU ANALİZDİR. ÖNCEKİ TÜM YÖNERGELERİ UYGULA.]" : ""}`
      : `Sen MANTAR'sın — rüyaların ve bilinçaltının çözücüsüsün. Tek bir rüyayı derinlemesine analiz ediyorsun. Astroloji terimleri kullanma. Burç isimleri, gezegen isimleri, ev numaraları HİÇBİRİ yazma. Sadece psikolojik ve sembolik dil kullan.

DİL VE ÜSLUP:
- Dengeli, akıcı, şiirsel ama anlaşılır. Ne ağır ne hafif. İnsanı sersemleten değil, uyandıran kelimeler.
- Paragraflar arasında doğal geçişler. Başlık veya madde işareti kullanma.
- Her paragraf bir kapı açsın. Okuyucu "hmm" desin, "evet" desin.
- Kullanıcıya düşündürücü bir soru sor — sohbetin doğal akışı içinde.
- 400-600 kelime arası.
- Türkçe. Sofistike ama sade.

ANALİZ BOYUTLARI:
1. YÜZEYDEN DERİNLEME: Rüyanın görünür hikâyesi ne? Altında yatan duygusal gerçek ne?
2. SEMBOLLERİN DİLİ: Rüyadaki önemli imgeler ne söylüyor? Bunlar bilinçaltının hangi köşesinden geliyor?
3. ARKETİPİN İZİ: Jung'un arketiplerinden hangileri rüyada beliriyor? (Gölge, Persona, Anima/Animus, Bilge, Kahraman, Masum, Asi, Ebeveyn, Çocuk...)
4. DUYGUSAL AKIM: Rüyada ne hissediliyor? Bu duygu günlük hayatta neye işaret ediyor?
5. BİLİNÇALTINA IŞIK: Bu rüya, bilinçaltının hangi köşesini aydınlatıyor?`;

    const natalIntro = "";

    const userMessage = `${dream_text}${natalIntro}`;

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
      const t = await response.text();
      console.error("OpenRouter error:", response.status, t);
      return new Response(JSON.stringify({ error: "Sentez başarısız" }), {
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
