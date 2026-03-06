import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as Astronomy from "https://esm.sh/astronomy-engine@2.1.19";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const trSign = (sign: string): string => {
  const signs: Record<string, string> = {
    Aries: "Koç", Taurus: "Boğa", Gemini: "İkizler", Cancer: "Yengeç",
    Leo: "Aslan", Virgo: "Başak", Libra: "Terazi", Scorpio: "Akrep",
    Sagittarius: "Yay", Capricorn: "Oğlak", Aquarius: "Kova", Pisces: "Balık"
  };
  return signs[sign] || sign;
};

const trPlanet = (name: string): string => {
  const planets: Record<string, string> = {
    Sun: "Güneş", Moon: "Ay", Mercury: "Merkür", Venus: "Venüs",
    Mars: "Mars", Jupiter: "Jüpiter", Saturn: "Satürn", Uranus: "Uranüs",
    Neptune: "Neptün", Pluto: "Plüton", Chiron: "Hiron",
  };
  return planets[name] || name;
};

function longitudeToSign(longitude: number): string {
  const idx = Math.floor(((longitude % 360) + 360) % 360 / 30);
  return ZODIAC_SIGNS[idx];
}

function getEclipticLongitude(body: Astronomy.Body, date: Date): number {
  if (body === Astronomy.Body.Sun) {
    const sunPos = Astronomy.SunPosition(date);
    return sunPos.elon;
  }
  const geo = Astronomy.GeoVector(body, date, true);
  const ecl = Astronomy.Ecliptic(geo);
  return ecl.elon;
}

function calculateChiron(date: Date): number {
  const epoch = new Date("2000-01-01T12:00:00Z");
  const years = (date.getTime() - epoch.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return (50.6 + years * 0.036) % 360;
}

function calculateNodes(date: Date) {
  const synodic = 6798.383;
  const jd = Astronomy.JulianDay(date);
  const n = (jd - 2451550.1) / synodic;
  const mean = (n * 360) % 360;
  const corr = 6.3 * Math.sin((166.56 + 132.87 * n) * Math.PI / 180);
  return { north: (mean + corr + 180) % 360, south: (mean + corr) % 360 };
}

function parseTimeParts(timeStr?: string | null) {
  if (!timeStr) return { hour: 12, minute: 0 };
  const parts = timeStr.split(":").map((p) => parseInt(p, 10));
  return { hour: isNaN(parts[0]) ? 12 : parts[0], minute: isNaN(parts[1]) ? 0 : parts[1] ?? 0 };
}

function calculateNatalChart(dateOfBirth: string, birthTime: string | null, lat: number, lon: number) {
  const { hour, minute } = parseTimeParts(birthTime);
  const birthDate = new Date(`${dateOfBirth}T00:00:00Z`);
  const utcDate = new Date(Date.UTC(birthDate.getUTCFullYear(), birthDate.getUTCMonth(), birthDate.getUTCDate(), hour, minute, 0));

  const bodies = [
    { name: "Sun", body: Astronomy.Body.Sun },
    { name: "Moon", body: Astronomy.Body.Moon },
    { name: "Mercury", body: Astronomy.Body.Mercury },
    { name: "Venus", body: Astronomy.Body.Venus },
    { name: "Mars", body: Astronomy.Body.Mars },
    { name: "Jupiter", body: Astronomy.Body.Jupiter },
    { name: "Saturn", body: Astronomy.Body.Saturn },
    { name: "Uranus", body: Astronomy.Body.Uranus },
    { name: "Neptune", body: Astronomy.Body.Neptune },
    { name: "Pluto", body: Astronomy.Body.Pluto },
  ];

  const nodes = calculateNodes(utcDate);
  const planets = bodies.map(({ name, body }) => {
    const eclLon = getEclipticLongitude(body, utcDate);
    const sign = longitudeToSign(eclLon);
    const degInSign = ((eclLon % 360) + 360) % 360 % 30;
    return {
      name: trPlanet(name),
      sign: trSign(sign),
      degree: Math.round(degInSign * 100) / 100,
      house: Math.floor(((eclLon % 360) + 360) % 360 / 30) + 1,
    };
  });

  const chironLon = calculateChiron(utcDate);
  planets.push({
    name: trPlanet("Chiron"),
    sign: trSign(longitudeToSign(chironLon)),
    degree: Math.round(((chironLon % 360) + 360) % 360 % 30 * 100) / 100,
    house: Math.floor(((chironLon % 360) + 360) % 360 / 30) + 1,
  });

  planets.push({
    name: "Kuzey Düğüm",
    sign: trSign(longitudeToSign(nodes.north)),
    degree: Math.round(((nodes.north % 360) + 360) % 360 % 30 * 100) / 100,
    house: Math.floor(((nodes.north % 360) + 360) % 360 / 30) + 1,
  });

  planets.push({
    name: "Güney Düğüm",
    sign: trSign(longitudeToSign(nodes.south)),
    degree: Math.round(((nodes.south % 360) + 360) % 360 % 30 * 100) / 100,
    house: Math.floor(((nodes.south % 360) + 360) % 360 / 30) + 1,
  });

  return planets;
}

const formatNatalChart = async (profile: any): Promise<string> => {
  if (!profile?.date_of_birth || !profile?.birth_place) {
    return `Temel Bilgiler:
- İsim: ${profile?.name || "Kullanıcı"}
- Doğum Tarihi: ${profile?.date_of_birth || "Bilinmiyor"}
- Doğum Saati: ${profile?.birth_time || "Bilinmiyor"}
- Doğum Yeri: ${profile?.birth_place || "Bilinmiyor"}
- Güneş: ${trSign(profile?.sun_sign)}
- Ay: ${trSign(profile?.moon_sign)}
- Yükselen: ${trSign(profile?.rising_sign)}`;
  }

  let lat = 41.0, lon = 29.0;
  try {
    const q = encodeURIComponent(profile.birth_place);
    const geoResp = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { "User-Agent": "AstraCastra/1.0" } }
    );
    if (geoResp.ok) {
      const geoData = await geoResp.json();
      if (geoData?.[0]) {
        lat = parseFloat(geoData[0].lat);
        lon = parseFloat(geoData[0].lon);
      }
    }
  } catch (err) {
    console.error("Geocoding error:", err);
  }

  const planets = calculateNatalChart(profile.date_of_birth, profile.birth_time, lat, lon);

  let chartText = `DOĞUM HARİTASI BİLGİLERİ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEMEL BİLGİLER:
- İsim: ${profile.name || "Kullanıcı"}
- Doğum Tarihi: ${profile.date_of_birth}
- Doğum Saati: ${profile.birth_time || "Bilinmiyor"}
- Doğum Yeri: ${profile.birth_place}

GEZEGEN POZİSYONLARI:
`;

  for (const p of planets) {
    chartText += `- ${p.name}: ${p.degree}° ${p.sign} (${p.house}. Ev)\n`;
  }

  chartText += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANA ENERJİLER:
- Güneş (Kimlik): ${trSign(profile.sun_sign)}
- Ay (Duygular): ${trSign(profile.moon_sign)}
- Yükselen (Maske): ${trSign(profile.rising_sign)}
`;

  return chartText;
};

console.info("insight-generator function started");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response(JSON.stringify({ error: "Beklenen içerik tipi: application/json" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prompt, natalChart, profile } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    let natalChartInfo = natalChart;
    if (!natalChartInfo && profile) {
      natalChartInfo = await formatNatalChart(profile);
    }
    if (!natalChartInfo) {
      natalChartInfo = "Doğum haritası bilgisi bulunamadı.";
    }

    const enhancedPrompt = `
${natalChartInfo}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ŞİMDİKİ TRANSİT ENERJİLERİ:
(Mevcut gezegen pozisyonlarını doğum haritasıyla karşılaştırarak transiti analiz et)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALİZ İSTEĞİ:
${prompt}

Yukarıdaki doğum haritasını ve şimdiki transitleri detaylı şekilde analiz et. Kişiye özel, derin içgörüler sun. Paragraflar halinde yaz.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://astroseby.com",
        "X-Title": "AstraCastra",
      },
      body: JSON.stringify({
        model: "google/gemini-1.5-flash-8b",
        messages: [
          { role: "system", content: "Sen MANTAR'sın — astrolojik analiz uzmanısın ve yaşam koçusun. Kullanıcının doğum haritasını ve güncel transitlerini analiz ederek derin, kişisel ve şiirsel yorumlar yapıyorsun. Her analizde gezegenlerin hangi evlerde ve burçlarda olduğuna dikkat et. Paragraflar halinde, akıcı ve anlaşılır yaz. Başlık veya madde işareti kullanma. Türkçe. Ego ile çalışmayı teşvik et." },
          { role: "user", content: enhancedPrompt },
        ],
        max_tokens: 5000,
        temperature: 0.8,
        stream: true,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "OpenRouter hata");
      return new Response(JSON.stringify({ error: "Analiz başarısız", detail: text }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
