import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";
import AmbientAudio from "@/components/AmbientAudio";
import NatalChartWheel from "@/components/NatalChartWheel";
import AnimatedNatalBackground from "@/components/AnimatedNatalBackground";
import CosmicLetterModal from "@/components/CosmicLetterModal";
import AspectFeed from "@/components/AspectFeed";
import MantarAvatar from "@/components/MantarAvatar";
import { motion } from "framer-motion";
import { BookOpen, Crown, Star, RefreshCw, Sparkles, ChevronDown, ChevronUp, Loader2, ScrollText, Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { TR, trSign, trPlanet } from "@/lib/i18n";
import type { NatalChartData, PlanetPosition } from "@/lib/astrology";
import { ZODIAC_SIGNS, calculateNatalChart } from "@/lib/astrology";

interface EdgeFunctionPlanet {
  name: string;
  longitude: number;
  sign: string;
  degree: number;
  dms: string;
  house: number;
}

interface EdgeFunctionResult {
  sun_sign: string;
  moon_sign: string;
  rising_sign: string;
  planets: EdgeFunctionPlanet[];
  ascendant: { longitude: number; sign: string; degree: number; dms: string };
  midheaven: { longitude: number; sign: string; degree: number; dms: string };
  houses: Array<{ house: number; longitude: number; sign: string; degree: number; dms: string }>;
  coordinates: { lat: number; lon: number };
  utc_offset: number;
  house_system: string;
}

function edgeResultToChartData(result: EdgeFunctionResult): NatalChartData {
  const planets: PlanetPosition[] = [];
  const ascIdx = ZODIAC_SIGNS.indexOf(result.ascendant.sign);
  planets.push({
    name: "Ascendant",
    longitude: result.ascendant.longitude,
    sign: result.ascendant.sign,
    degreeInSign: result.ascendant.degree,
    symbol: ascIdx >= 0 ? ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"][ascIdx] : "AC",
    house: 1,
    dms: result.ascendant.dms,
  });

  for (const p of result.planets) {
    const GLYPHS: Record<string, string> = {
      Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
      Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
      Chiron: "⚷", Lilith: "⚸", NorthNode: "☊", SouthNode: "☋", Vertex: "Vx",
    };
    planets.push({
      name: p.name,
      longitude: p.longitude,
      sign: p.sign,
      degreeInSign: p.degree,
      symbol: GLYPHS[p.name] || "?",
      house: p.house,
      dms: p.dms,
    });
  }

  const mcIdx = ZODIAC_SIGNS.indexOf(result.midheaven.sign);
  planets.push({
    name: "MC",
    longitude: result.midheaven.longitude,
    sign: result.midheaven.sign,
    degreeInSign: result.midheaven.degree,
    symbol: mcIdx >= 0 ? ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"][mcIdx] : "MC",
    house: 10,
    dms: result.midheaven.dms,
  });

  return {
    planets,
    houses: result.houses.map((h) => h.longitude),
    ascendant: result.ascendant.longitude,
    ascendantSign: result.ascendant.sign,
    midheaven: result.midheaven.longitude,
    midheavenSign: result.midheaven.sign,
  };
}

function edgeResultToChartDataLocal(result: NatalChartData): NatalChartData {
  return result;
}

function buildNatalSummary(data: NatalChartData): string {
  return data.planets
    .map((p) => `${trPlanet(p.name)}: ${trSign(p.sign)} ${p.house}. ev (${p.dms})`)
    .join("\n");
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
const [showAllPlanets, setShowAllPlanets] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<{name: string, sign: string, house: number, dms: string} | null>(null);
  const [planetInterpreting, setPlanetInterpreting] = useState(false);
  const [planetInterpretation, setPlanetInterpretation] = useState("");
  const [chartData, setChartData] = useState<NatalChartData | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [savedLetter, setSavedLetter] = useState("");

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
if (data && !data.onboarding_completed) {
      navigate("/onboarding");
    } else {
      setProfile(data);
      setSavedLetter(data?.natal_letter_content || "");
    }
  }, [user, navigate]);

  const fetchChart = useCallback(async (prof: any) => {
    if (!prof?.date_of_birth || !prof?.birth_place) return;
    setChartLoading(true);
    try {
      // Try to geocode the birth place
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(prof.birth_place)}&format=json&limit=1`,
        { headers: { "User-Agent": "AstroSeBy/1.0" } }
      );
      const geoData = await geoRes.json();
      
      let lat = 41.0, lon = 29.0;
      if (geoData?.length) {
        lat = parseFloat(geoData[0].lat);
        lon = parseFloat(geoData[0].lon);
      }

      // Calculate locally using the fixed astrology.ts
      const result = calculateNatalChart(prof.date_of_birth, prof.birth_time, lat, lon);
      setChartData(edgeResultToChartDataLocal(result));
    } catch {
      // silently fail
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);
  useEffect(() => { if (profile) fetchChart(profile); }, [profile, fetchChart]);

  const refreshChart = async () => {
    if (!profile) return;
    setRefreshing(true);
    try {
      // Geocode the birth place
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(profile.birth_place)}&format=json&limit=1`,
        { headers: { "User-Agent": "AstroSeBy/1.0" } }
      );
      const geoData = await geoRes.json();
      
      let lat = 41.0, lon = 29.0;
      if (geoData?.length) {
        lat = parseFloat(geoData[0].lat);
        lon = parseFloat(geoData[0].lon);
      }

      // Calculate locally
      const result = calculateNatalChart(profile.date_of_birth, profile.birth_time, lat, lon);
      setChartData(edgeResultToChartDataLocal(result));
      await fetchProfile();
      toast.success("Harita güncellendi ✨");
    } catch {
      toast.error("Harita güncellenemedi");
    } finally {
      setRefreshing(false);
    }
  };

  if (!profile) return null;

  const bigThree = [
    { label: trPlanet("Sun"), sign: trSign(profile.sun_sign), emoji: TR.signEmojis[profile.sun_sign] || "☉" },
    { label: trPlanet("Moon"), sign: trSign(profile.moon_sign), emoji: TR.signEmojis[profile.moon_sign] || "☽" },
    { label: trPlanet("Rising"), sign: trSign(profile.rising_sign), emoji: TR.signEmojis[profile.rising_sign] || "⬆" },
  ];

const allPlanets = chartData?.planets || [];

  const interpretPlanet = async (planet: {name: string, sign: string, house: number, dms: string}) => {
    setSelectedPlanet(planet);
    setPlanetInterpreting(true);
    setPlanetInterpretation("");
    
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/planet-interpreter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            planet: planet.name,
            sign: planet.sign,
            house: planet.house,
            degree: planet.dms,
          }),
        }
      );
      
      if (!resp.ok) throw new Error("Analiz başarısız");
      
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                setPlanetInterpretation(fullText);
              }
            } catch {}
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPlanetInterpreting(false);
    }
  };

  return (
    <div className="min-h-screen pb-32 relative theme-home">
      {/* Cosmic purple overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, hsla(270, 50%, 20%, 0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, hsla(260, 60%, 15%, 0.2) 0%, transparent 50%)",
        }}
      />

      <AmbientAudio />
      <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-sm text-muted-foreground">{TR.dashboard.welcome}</p>
          <h1 className="text-2xl font-display text-foreground">
            {profile.nickname || profile.name || TR.dashboard.stargazer}{" "}
            <span className="text-primary">{TR.signEmojis[profile.sun_sign] || "✨"}</span>
          </h1>
          <p className="text-sm text-primary mt-1">
            {trSign(profile.sun_sign)} {trPlanet("Sun")}
          </p>
        </motion.div>

{/* Cosmic Letter CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => {
            if (profile?.natal_letter_used && savedLetter) {
              setLetterOpen(true);
            } else if (!profile?.natal_letter_used) {
              setLetterOpen(true);
            } else {
              navigate("/premium");
            }
          }}
          className="w-full mb-6 p-4 rounded-2xl text-left flex items-center gap-4 transition-all hover:scale-[1.01]"
          style={{
            background: "linear-gradient(135deg, hsla(270, 40%, 18%, 0.8), hsla(260, 50%, 12%, 0.9))",
            border: "1px solid hsla(270, 50%, 35%, 0.3)",
            boxShadow: "0 4px 20px hsla(270, 50%, 20%, 0.3)",
          }}
        >
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "hsla(270, 60%, 50%, 0.2)" }}
          >
            <ScrollText className="h-5 w-5" style={{ color: "hsl(270, 60%, 70%)" }} />
          </div>
          <div>
            <p className="font-display text-sm text-foreground">{TR.dashboard.cosmicLetter}</p>
            <p className="text-xs text-muted-foreground">
              {profile?.natal_letter_used ? "Mektubun hazır" : TR.dashboard.cosmicLetterDesc}
            </p>
          </div>
        </motion.button>

        {/* Natal Chart Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <h2 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" /> {TR.dashboard.natalChart}
            <button
              onClick={refreshChart}
              disabled={refreshing}
              className="ml-auto p-1 rounded-full hover:bg-muted/50 transition-colors"
              title={TR.dashboard.refreshChart}
            >
              <RefreshCw className={`h-4 w-4 text-primary ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </h2>

          {chartLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : chartData ? (
            <div className="mb-6 relative mx-auto" style={{ width: 280, height: 280 }}>
              <NatalChartWheel data={chartData} size={280} />
              <AnimatedNatalBackground data={chartData} size={280} />
            </div>
          ) : (
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
              <div className="absolute inset-4 rounded-full border border-primary/20" />
              <div className="absolute inset-8 rounded-full border border-primary/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">{TR.signEmojis[profile.sun_sign] || "✨"}</span>
              </div>
            </div>
          )}

          {/* Big Three */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {bigThree.map((p) => (
              <div key={p.label} className="text-center p-2 rounded-lg bg-muted/30">
                <span className="text-lg">{p.emoji}</span>
                <p className="text-xs text-muted-foreground">{p.label}</p>
                <p className="text-sm font-medium text-foreground">{p.sign}</p>
              </div>
            ))}
          </div>

          {/* Detailed Planetary Positions */}
          {allPlanets.length > 0 && (
            <div>
              <button
                onClick={() => setShowAllPlanets(!showAllPlanets)}
                className="flex items-center gap-1 text-xs text-primary font-display mb-2 hover:underline"
              >
                {TR.dashboard.planetaryPositions}
                {showAllPlanets ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
{showAllPlanets && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-1.5"
                >
                  {allPlanets.map((planet) => (
                    <div
                      key={planet.name}
                      onClick={() => interpretPlanet(planet)}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/20 hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      <span className="text-muted-foreground font-medium">
                        {planet.symbol || ""} {trPlanet(planet.name)}
                      </span>
                      <span className="text-foreground">
                        {trSign(planet.sign)} {planet.house}. ev ({planet.dms})
                      </span>
                    </div>
                  ))}
                  {chartData && (
                    <div className="mt-3 pt-2 border-t border-border/30">
                      <p className="text-xs text-primary font-display mb-1">{TR.dashboard.houseCusps}</p>
                      <div className="grid grid-cols-2 gap-1">
                        {chartData.houses.map((cusp, i) => {
                          const sign = trSign(
                            ZODIAC_SIGNS[Math.floor(((cusp % 360) + 360) % 360 / 30)]
                          );
                          const deg = ((cusp % 360) + 360) % 360 % 30;
                          const d = Math.floor(deg);
                          const m = Math.floor((deg - d) * 60);
                          return (
                            <div key={i} className="text-xs text-muted-foreground">
                              {i + 1}. Ev: {sign} {d}° {m}'
                            </div>
                          );
                        })}
                      </div>
                    </div>
)}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* Planet Interpretation Modal */}
        {selectedPlanet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { setSelectedPlanet(null); setPlanetInterpretation(""); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-lg font-display text-primary">
                  {selectedPlanet.symbol} {trPlanet(selectedPlanet.name)} {trSign(selectedPlanet.sign)}
                </p>
                <button onClick={() => { setSelectedPlanet(null); setPlanetInterpretation(""); }} className="text-muted-foreground hover:text-foreground text-xl">
                  ✕
                </button>
              </div>
              {planetInterpreting ? (
                <p className="text-sm text-muted-foreground animate-pulse">Analiz ediliyor...</p>
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap">{planetInterpretation}</p>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Aspect Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-5 mb-6"
        >
          <AspectFeed data={chartData} />
        </motion.div>

        {/* Mantar Quick Chat CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate("/mentor")}
          className="w-full mb-6 p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.01] glass-card"
        >
          <MantarAvatar size="md" pulsing />
          <div className="text-left flex-1">
            <p className="font-display text-sm text-foreground">{TR.dashboard.askMentor}</p>
            <p className="text-xs text-muted-foreground">Haritanı yorumlayalım, bugün ne hissediyorsun?</p>
          </div>
          <MessageCircle className="h-5 w-5 text-primary shrink-0" />
        </motion.button>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            onClick={() => navigate("/dreams")}
            className="glass-card rounded-xl p-4 text-center hover:border-primary/50 transition-colors"
          >
            <BookOpen className="h-6 w-6 text-primary mb-2 mx-auto" />
            <p className="font-display text-xs text-foreground">{TR.dashboard.dreamJournal}</p>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate("/karmic-match")}
            className="glass-card rounded-xl p-4 text-center hover:border-accent/50 transition-colors"
          >
            <Heart className="h-6 w-6 text-accent mb-2 mx-auto" />
            <p className="font-display text-xs text-foreground">{TR.nav.karmic}</p>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            onClick={() => navigate("/premium")}
            className="glass-card rounded-xl p-4 text-center hover:border-gold/50 transition-colors"
          >
            <Crown className="h-6 w-6 text-gold mb-2 mx-auto" />
            <p className="font-display text-xs text-foreground">{TR.dashboard.premium}</p>
          </motion.button>
        </div>
      </div>

{/* Cosmic Letter Modal */}
      <CosmicLetterModal
        open={letterOpen}
        onClose={() => setLetterOpen(false)}
        profile={profile}
        natalSummary={chartData ? buildNatalSummary(chartData) : ""}
        savedLetter={savedLetter}
        onLetterSaved={(content) => {
          setSavedLetter(content);
        }}
      />

      <AdBanner />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
