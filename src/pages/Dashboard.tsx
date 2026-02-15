import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import SporeField from "@/components/SporeField";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";
import AmbientAudio from "@/components/AmbientAudio";
import NatalChartWheel from "@/components/NatalChartWheel";
import { motion } from "framer-motion";
import { BookOpen, Crown, Star, RefreshCw, Sparkles, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TR, trSign, trPlanet } from "@/lib/i18n";
import type { NatalChartData, PlanetPosition } from "@/lib/astrology";
import { ZODIAC_SIGNS } from "@/lib/astrology";

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

  // Add Ascendant
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

  // Add planets
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

  // Add MC
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

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllPlanets, setShowAllPlanets] = useState(false);
  const [chartData, setChartData] = useState<NatalChartData | null>(null);
  const [chartLoading, setChartLoading] = useState(false);

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
    }
  }, [user, navigate]);

  const fetchChart = useCallback(async (prof: any) => {
    if (!prof?.date_of_birth || !prof?.birth_place) return;
    setChartLoading(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-natal-chart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            user_id: prof.user_id,
            date_of_birth: prof.date_of_birth,
            birth_time: prof.birth_time,
            birth_place: prof.birth_place,
          }),
        }
      );
      if (resp.ok) {
        const result: EdgeFunctionResult = await resp.json();
        setChartData(edgeResultToChartData(result));
      }
    } catch {
      // silently fail, chart will show placeholder
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  useEffect(() => {
    if (profile) fetchChart(profile);
  }, [profile, fetchChart]);

  const refreshChart = async () => {
    if (!profile) return;
    setRefreshing(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-natal-chart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            user_id: profile.user_id,
            date_of_birth: profile.date_of_birth,
            birth_time: profile.birth_time,
            birth_place: profile.birth_place,
          }),
        }
      );
      if (resp.ok) {
        const result: EdgeFunctionResult = await resp.json();
        setChartData(edgeResultToChartData(result));
        await fetchProfile();
        toast.success("Harita güncellendi ✨");
      } else {
        const data = await resp.json();
        toast.error(data.error || "Harita güncellenemedi");
      }
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

  return (
    <div className="min-h-screen pb-32 relative">
      <SporeField />
      <AmbientAudio />
      <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-sm text-muted-foreground">{TR.dashboard.welcome}</p>
          <h1 className="text-2xl font-display text-foreground">
            {profile.name || TR.dashboard.stargazer}{" "}
            <span className="text-primary">{TR.signEmojis[profile.sun_sign] || "✨"}</span>
          </h1>
          <p className="text-sm text-primary mt-1">
            {trSign(profile.sun_sign)} {trPlanet("Sun")}
          </p>
        </motion.div>

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
            <div className="mb-6">
              <NatalChartWheel data={chartData} size={280} />
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
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/20"
                    >
                      <span className="text-muted-foreground font-medium">
                        {planet.symbol || ""} {trPlanet(planet.name)}
                      </span>
                      <span className="text-foreground">
                        {trSign(planet.sign)} {planet.house}. ev ({planet.dms})
                      </span>
                    </div>
                  ))}
                  {/* House Cusps */}
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

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate("/dreams")}
            className="glass-card rounded-xl p-4 text-left hover:border-primary/50 transition-colors"
          >
            <BookOpen className="h-6 w-6 text-primary mb-2" />
            <p className="font-display text-xs text-foreground">{TR.dashboard.dreamJournal}</p>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            onClick={() => navigate("/mentor")}
            className="glass-card rounded-xl p-4 text-left hover:border-primary/50 transition-colors"
          >
            <Sparkles className="h-6 w-6 text-primary mb-2" />
            <p className="font-display text-xs text-foreground">{TR.dashboard.mentor}</p>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate("/premium")}
            className="glass-card rounded-xl p-4 text-left hover:border-primary/50 transition-colors"
          >
            <Crown className="h-6 w-6 text-primary mb-2" />
            <p className="font-display text-xs text-foreground">{TR.dashboard.premium}</p>
          </motion.button>
        </div>
      </div>
      <AdBanner />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
