import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Element mapping
const SIGN_ELEMENT: Record<string, string> = {
  Aries: "Fire", Leo: "Fire", Sagittarius: "Fire",
  Taurus: "Earth", Virgo: "Earth", Capricorn: "Earth",
  Gemini: "Air", Libra: "Air", Aquarius: "Air",
  Cancer: "Water", Scorpio: "Water", Pisces: "Water",
};

// Complementary elements
const COMPLEMENTARY: Record<string, string> = {
  Fire: "Air", Air: "Fire",
  Earth: "Water", Water: "Earth",
};

function getElement(sign: string | null): string {
  return sign ? (SIGN_ELEMENT[sign] || "Unknown") : "Unknown";
}

function sameElement(signA: string | null, signB: string | null): boolean {
  const eA = getElement(signA);
  const eB = getElement(signB);
  return eA !== "Unknown" && eB !== "Unknown" && eA === eB;
}

function complementaryElements(signA: string | null, signB: string | null): boolean {
  const eA = getElement(signA);
  const eB = getElement(signB);
  return eA !== "Unknown" && eB !== "Unknown" && COMPLEMENTARY[eA] === eB;
}

function calculateElementDistribution(profile: any): Record<string, number> {
  const dist: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const signs = [profile.sun_sign, profile.moon_sign, profile.rising_sign];
  for (const s of signs) {
    const el = getElement(s);
    if (el !== "Unknown") dist[el]++;
  }
  return dist;
}

function calculateKarmicScore(profileA: any, profileB: any): { score: number; details: any } {
  let score = 0;
  const details: any = { luminaries: 0, vertex_nodes: 0, elemental: 0, venus_mars: 0, reasons: [] };

  // 1. Luminaries (30 pts): Sun-Moon element harmony
  if (sameElement(profileA.sun_sign, profileB.moon_sign)) {
    score += 15;
    details.luminaries += 15;
    details.reasons.push("A'nın Güneşi ile B'nin Ayı aynı element");
  }
  if (sameElement(profileB.sun_sign, profileA.moon_sign)) {
    score += 15;
    details.luminaries += 15;
    details.reasons.push("B'nin Güneşi ile A'nın Ayı aynı element");
  }

  // 2. Vertex & Nodes (40 pts) — simplified using sign-based conjunctions
  // We check if sun/moon/rising match (same sign = conjunction approximation)
  const nodesAndVertex = ["NorthNode", "Vertex"]; // Would need full chart data
  // Simplified: Rising sign harmony as proxy for destined connection
  if (profileA.rising_sign && profileB.rising_sign) {
    if (sameElement(profileA.rising_sign, profileB.sun_sign) || 
        sameElement(profileA.rising_sign, profileB.moon_sign)) {
      score += 20;
      details.vertex_nodes += 20;
      details.reasons.push("Yükselen-Luminaries element uyumu (kadersel bağ)");
    }
    if (sameElement(profileB.rising_sign, profileA.sun_sign) || 
        sameElement(profileB.rising_sign, profileA.moon_sign)) {
      score += 20;
      details.vertex_nodes += 20;
      details.reasons.push("Karşılıklı yükselen-luminaries uyumu");
    }
  }

  // 3. Elemental Balance (20 pts)
  const distA = calculateElementDistribution(profileA);
  const distB = calculateElementDistribution(profileB);
  // Check complementary balance
  let compScore = 0;
  for (const [el, count] of Object.entries(distA)) {
    const comp = COMPLEMENTARY[el];
    if (comp && distB[comp] > 0 && count > 0) compScore++;
  }
  if (compScore >= 2) {
    score += 20;
    details.elemental = 20;
    details.reasons.push("Tamamlayıcı element dengesi mükemmel");
  } else if (compScore >= 1) {
    score += 10;
    details.elemental = 10;
    details.reasons.push("Kısmi element dengesi");
  }

  // 4. Venus/Mars harmony (10 pts) — using Sun/Moon as proxy
  // In a full implementation this would use actual Venus/Mars positions
  if (complementaryElements(profileA.sun_sign, profileB.moon_sign) ||
      complementaryElements(profileB.sun_sign, profileA.moon_sign)) {
    score += 10;
    details.venus_mars = 10;
    details.reasons.push("Doğal çekim enerjisi (tamamlayıcı elementler)");
  }

  // Cap at 100
  details.total = Math.min(score, 100);
  return { score: Math.min(score, 100), details };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id } = await req.json();
    if (!user_id) throw new Error("user_id is required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get requesting user's profile
    const { data: myProfile, error: myError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (myError || !myProfile) {
      return new Response(JSON.stringify({ error: "Profil bulunamadı" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check 24h cooldown
    const { data: recentMatch } = await supabase
      .from("karmic_matches")
      .select("id, created_at")
      .or(`user_a.eq.${user_id},user_b.eq.${user_id}`)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (recentMatch && recentMatch.length > 0) {
      // Return existing match
      const existingId = recentMatch[0].id;
      const { data: existingMatch } = await supabase
        .from("karmic_matches")
        .select("*")
        .eq("id", existingId)
        .single();

      if (existingMatch) {
        const otherUserId = existingMatch.user_a === user_id ? existingMatch.user_b : existingMatch.user_a;
        const { data: otherProfile } = await supabase
          .from("profiles")
          .select("name, sun_sign, moon_sign, rising_sign")
          .eq("user_id", otherUserId)
          .single();

        return new Response(JSON.stringify({
          match: existingMatch,
          other_profile: otherProfile,
          cooldown: true,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Get all opted-in users (excluding self)
    const { data: candidates, error: candError } = await supabase
      .from("profiles")
      .select("user_id, name, sun_sign, moon_sign, rising_sign")
      .eq("karmic_match_enabled", true)
      .neq("user_id", user_id)
      .not("sun_sign", "is", null);

    if (candError || !candidates || candidates.length === 0) {
      return new Response(JSON.stringify({ error: "Henüz eşleşecek başka ruh yok. Sabırlı ol, evren çalışıyor..." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Score all candidates and pick the best
    let bestMatch: any = null;
    let bestScore = -1;
    let bestDetails: any = null;

    for (const candidate of candidates) {
      const { score, details } = calculateKarmicScore(myProfile, candidate);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
        bestDetails = details;
      }
    }

    if (!bestMatch) {
      return new Response(JSON.stringify({ error: "Uygun eşleşme bulunamadı" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create match record
    const { data: newMatch, error: matchError } = await supabase
      .from("karmic_matches")
      .insert({
        user_a: user_id,
        user_b: bestMatch.user_id,
        score: bestScore,
        score_details: bestDetails,
      })
      .select()
      .single();

    if (matchError) throw matchError;

    return new Response(JSON.stringify({
      match: newMatch,
      other_profile: {
        name: bestMatch.name,
        sun_sign: bestMatch.sun_sign,
        moon_sign: bestMatch.moon_sign,
        rising_sign: bestMatch.rising_sign,
      },
      cooldown: false,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("karmic-match error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Bilinmeyen hata" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
