import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as Astronomy from "npm:astronomy-engine@2.1.19";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

function longitudeToSign(lon: number): string {
  const idx = Math.floor(((lon % 360) + 360) % 360 / 30);
  return ZODIAC_SIGNS[idx];
}

function longitudeToDegree(lon: number): number {
  return Math.round(((lon % 360) + 360) % 360 % 30 * 10) / 10;
}

function getEclipticLongitude(body: Astronomy.Body, date: Date): number {
  if (body === Astronomy.Body.Sun) {
    // SunPosition gives geocentric ecliptic coords
    const sunPos = Astronomy.SunPosition(date);
    return sunPos.elon;
  }
  if (body === Astronomy.Body.Moon) {
    // For Moon, use GeoVector then convert to ecliptic
    const geo = Astronomy.GeoVector(Astronomy.Body.Moon, date, true);
    const ecl = Astronomy.Ecliptic(geo);
    return ecl.elon;
  }
  // For planets, EclipticLongitude works (geocentric ecliptic longitude)
  return Astronomy.EclipticLongitude(body, date);
}

function calculateAscendant(date: Date, lat: number, lon: number): number {
  const gast = Astronomy.SiderealTime(date);
  const lst = ((gast * 15) + lon + 360) % 360;
  const lstRad = lst * Math.PI / 180;
  const obliquity = 23.4393 * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  const y = -Math.cos(lstRad);
  const x = Math.sin(lstRad) * Math.cos(obliquity) + Math.tan(latRad) * Math.sin(obliquity);
  let asc = Math.atan2(y, x) * 180 / Math.PI;
  return ((asc % 360) + 360) % 360;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id, date_of_birth, birth_time, birth_place } = await req.json();

    if (!date_of_birth || !birth_place) {
      return new Response(JSON.stringify({ error: "Doğum tarihi ve yeri gereklidir" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Geocode
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(birth_place)}&format=json&limit=1`,
      { headers: { "User-Agent": "AstroDreamAI/1.0" } }
    );
    const geoData = await geoRes.json();
    if (!geoData?.length) {
      return new Response(JSON.stringify({ error: "Doğum yeri bulunamadı" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);

    // Parse date/time
    const dob = new Date(date_of_birth);
    let hour = 12, minute = 0;
    if (birth_time) {
      const parts = birth_time.split(":");
      hour = parseInt(parts[0], 10);
      minute = parseInt(parts[1], 10);
    }
    const tzOffset = Math.round(lon / 15);
    dob.setUTCHours(hour - tzOffset, minute, 0, 0);

    // Calculate planets
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

    const planets = bodies.map(({ name, body }) => {
      const eclLon = getEclipticLongitude(body, dob);
      return {
        name,
        longitude: Math.round(eclLon * 100) / 100,
        sign: longitudeToSign(eclLon),
        degree: longitudeToDegree(eclLon),
      };
    });

    const ascLon = calculateAscendant(dob, lat, lon);
    const ascSign = longitudeToSign(ascLon);
    const sunSign = planets.find(p => p.name === "Sun")?.sign || null;
    const moonSign = planets.find(p => p.name === "Moon")?.sign || null;

    // Update profile
    if (user_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const updateData: Record<string, string> = {};
      if (sunSign) updateData.sun_sign = sunSign;
      if (moonSign) updateData.moon_sign = moonSign;
      if (ascSign) updateData.rising_sign = ascSign;
      await supabase.from("profiles").update(updateData).eq("user_id", user_id);
    }

    return new Response(JSON.stringify({
      sun_sign: sunSign,
      moon_sign: moonSign,
      rising_sign: ascSign,
      planets,
      ascendant: { longitude: ascLon, sign: ascSign, degree: longitudeToDegree(ascLon) },
      coordinates: { lat, lon },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("calculate-natal-chart error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Bilinmeyen hata" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
