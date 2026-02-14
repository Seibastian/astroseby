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
  return Math.round(((lon % 360) + 360) % 360 % 30 * 100) / 100;
}

function degreeToDMS(deg: number): string {
  const d = Math.floor(deg);
  const mf = (deg - d) * 60;
  const m = Math.floor(mf);
  const s = Math.round((mf - m) * 60);
  return `${d}° ${m.toString().padStart(2, "0")}' ${s.toString().padStart(2, "0")}"`;
}

function getEclipticLongitude(body: Astronomy.Body, date: Date): number {
  if (body === Astronomy.Body.Sun) {
    const sunPos = Astronomy.SunPosition(date);
    return sunPos.elon;
  }
  if (body === Astronomy.Body.Moon) {
    const geo = Astronomy.GeoVector(Astronomy.Body.Moon, date, true);
    const ecl = Astronomy.Ecliptic(geo);
    return ecl.elon;
  }
  return Astronomy.EclipticLongitude(body, date);
}

function getObliquity(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  return 23.439291 - 0.0130042 * T - 1.64e-7 * T * T + 5.036e-7 * T * T * T;
}

function getJulianDate(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
  let yr = y, mo = m;
  if (mo <= 2) { yr -= 1; mo += 12; }
  const A = Math.floor(yr / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yr + 4716)) + Math.floor(30.6001 * (mo + 1)) + d + B - 1524.5;
}

// Proper MC calculation
function calculateMC(lstDeg: number, oblDeg: number): number {
  const lstRad = lstDeg * Math.PI / 180;
  const oblRad = oblDeg * Math.PI / 180;
  let mc = Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(oblRad)) * 180 / Math.PI;
  return ((mc % 360) + 360) % 360;
}

// Proper Ascendant calculation
function calculateAscendant(lstDeg: number, latDeg: number, oblDeg: number): number {
  const lstRad = lstDeg * Math.PI / 180;
  const oblRad = oblDeg * Math.PI / 180;
  const latRad = latDeg * Math.PI / 180;
  // Swiss Ephemeris formula: ASC = atan2(cos(ARMC), -(sin(ε)*tan(φ) + cos(ε)*sin(ARMC)))
  const y = Math.cos(lstRad);
  const x = -(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(lstRad));
  let asc = Math.atan2(y, x) * 180 / Math.PI;
  return ((asc % 360) + 360) % 360;
}

// Turkey DST-aware offset
function getTurkeyUTCOffset(year: number, month: number, day: number): number {
  if (year > 2016 || (year === 2016 && (month > 10 || (month === 10 && day >= 30)))) {
    return 3;
  }
  if (month >= 4 && month <= 10) return 3;
  if (month === 3 && day >= 25) return 3;
  return 2;
}

function estimateUTCOffset(lat: number, lon: number, year: number, month: number, day: number): number {
  if (lat >= 36 && lat <= 42 && lon >= 26 && lon <= 45) {
    return getTurkeyUTCOffset(year, month, day);
  }
  return Math.round(lon / 15);
}

// Placidus intermediate cusps
function placidusCusp(fraction: number, aboveHorizon: boolean, lstDeg: number, latDeg: number, oblDeg: number, asc: number, mc: number): number {
  const latRad = latDeg * Math.PI / 180;
  const oblRad = oblDeg * Math.PI / 180;

  let lon: number;
  if (aboveHorizon) {
    let diff = asc - mc; if (diff < 0) diff += 360;
    lon = (mc + diff * fraction) % 360;
  } else {
    const ic = (mc + 180) % 360;
    let diff = ic - asc; if (diff < 0) diff += 360;
    lon = (asc + diff * fraction) % 360;
  }

  for (let iter = 0; iter < 50; iter++) {
    const lonRad = lon * Math.PI / 180;
    const dec = Math.asin(Math.sin(lonRad) * Math.sin(oblRad));
    const clamped = Math.max(-1, Math.min(1, -Math.tan(dec) * Math.tan(latRad)));
    const dsa = Math.acos(clamped) * 180 / Math.PI;

    let targetRA: number;
    if (aboveHorizon) {
      targetRA = (lstDeg + fraction * dsa) % 360;
    } else {
      const nsa = 180 - dsa;
      targetRA = (lstDeg + 180 + fraction * nsa) % 360;
    }

    const targetRARad = targetRA * Math.PI / 180;
    let newLon = Math.atan2(Math.sin(targetRARad), Math.cos(targetRARad) * Math.cos(oblRad)) * 180 / Math.PI;
    newLon = ((newLon % 360) + 360) % 360;

    let diff = Math.abs(newLon - lon);
    if (diff > 180) diff = 360 - diff;
    lon = newLon;
    if (diff < 0.001) break;
  }
  return lon;
}

function calculatePlacidusHouses(lstDeg: number, latDeg: number, oblDeg: number, asc: number, mc: number): number[] {
  const houses = new Array(12);
  houses[0] = asc;
  houses[9] = mc;
  houses[6] = (mc + 180) % 360;
  houses[3] = (asc + 180) % 360;
  houses[10] = placidusCusp(1/3, true, lstDeg, latDeg, oblDeg, asc, mc);
  houses[11] = placidusCusp(2/3, true, lstDeg, latDeg, oblDeg, asc, mc);
  houses[1] = placidusCusp(1/3, false, lstDeg, latDeg, oblDeg, asc, mc);
  houses[2] = placidusCusp(2/3, false, lstDeg, latDeg, oblDeg, asc, mc);
  houses[4] = (houses[10] + 180) % 360;
  houses[5] = (houses[11] + 180) % 360;
  houses[7] = (houses[1] + 180) % 360;
  houses[8] = (houses[2] + 180) % 360;
  return houses;
}

function getHouse(longitude: number, houses: number[]): number {
  const lon = ((longitude % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    const start = houses[i];
    const end = houses[(i + 1) % 12];
    if (start < end) {
      if (lon >= start && lon < end) return i + 1;
    } else {
      if (lon >= start || lon < end) return i + 1;
    }
  }
  return 1;
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
    const dobParts = date_of_birth.split("-");
    const year = parseInt(dobParts[0], 10);
    const month = parseInt(dobParts[1], 10);
    const day = parseInt(dobParts[2], 10);
    let hour = 12, minute = 0;
    if (birth_time) {
      const parts = birth_time.split(":");
      hour = parseInt(parts[0], 10);
      minute = parseInt(parts[1], 10);
    }

    // Proper timezone conversion with DST awareness
    const utcOffset = estimateUTCOffset(lat, lon, year, month, day);
    const utcHour = hour - utcOffset;
    const dob = new Date(Date.UTC(year, month - 1, day, utcHour, minute, 0));

    // Julian Date and obliquity
    const jd = getJulianDate(dob);
    const obliquity = getObliquity(jd);

    // Local Sidereal Time
    const gast = Astronomy.SiderealTime(dob);
    const lstDeg = ((gast * 15) + lon + 360) % 360;

    // MC and Ascendant
    const mc = calculateMC(lstDeg, obliquity);
    const ascLon = calculateAscendant(lstDeg, lat, obliquity);
    const ascSign = longitudeToSign(ascLon);

    // Placidus houses
    const houses = calculatePlacidusHouses(lstDeg, lat, obliquity, ascLon, mc);

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
      const degInSign = longitudeToDegree(eclLon);
      return {
        name,
        longitude: Math.round(eclLon * 100) / 100,
        sign: longitudeToSign(eclLon),
        degree: degInSign,
        dms: degreeToDMS(degInSign),
        house: getHouse(eclLon, houses),
      };
    });

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
      ascendant: { longitude: Math.round(ascLon * 100) / 100, sign: ascSign, degree: longitudeToDegree(ascLon), dms: degreeToDMS(longitudeToDegree(ascLon)) },
      midheaven: { longitude: Math.round(mc * 100) / 100, sign: longitudeToSign(mc), degree: longitudeToDegree(mc), dms: degreeToDMS(longitudeToDegree(mc)) },
      houses: houses.map((h, i) => ({
        house: i + 1,
        longitude: Math.round(h * 100) / 100,
        sign: longitudeToSign(h),
        degree: longitudeToDegree(h),
        dms: degreeToDMS(longitudeToDegree(h)),
      })),
      coordinates: { lat, lon },
      utc_offset: utcOffset,
      house_system: "Placidus",
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
