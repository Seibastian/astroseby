import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import StarField from "@/components/StarField";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";
import AmbientAudio from "@/components/AmbientAudio";
import NatalChartWheel from "@/components/NatalChartWheel";
import { motion } from "framer-motion";
import { BookOpen, Crown, Star, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { TR, trSign, trPlanet } from "@/lib/i18n";
import { calculateNatalChart, type NatalChartData } from "@/lib/astrology";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
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
  };

  useEffect(() => { fetchProfile(); }, [user, navigate]);

  const refreshChart = async () => {
    if (!user || !profile) return;
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
            user_id: user.id,
            date_of_birth: profile.date_of_birth,
            birth_time: profile.birth_time,
            birth_place: profile.birth_place,
          }),
        }
      );
      const data = await resp.json();
      if (resp.ok) {
        await fetchProfile();
        toast.success("Harita güncellendi ✨");
      } else {
        toast.error(data.error || "Harita güncellenemedi");
      }
    } catch {
      toast.error("Harita güncellenemedi");
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate natal chart locally for display
  const chartData: NatalChartData | null = useMemo(() => {
    if (!profile?.date_of_birth || !profile?.birth_place) return null;
    try {
      // Use approximate coordinates (will be refined by edge function)
      // For display purposes, use a simple lat/lon estimation
      return calculateNatalChart(
        profile.date_of_birth,
        profile.birth_time,
        41.0, // default lat (Istanbul)
        29.0  // default lon
      );
    } catch {
      return null;
    }
  }, [profile]);

  if (!profile) return null;

  const bigThree = [
    { label: trPlanet("Sun"), sign: trSign(profile.sun_sign), emoji: TR.signEmojis[profile.sun_sign] || "☉" },
    { label: trPlanet("Moon"), sign: trSign(profile.moon_sign), emoji: TR.signEmojis[profile.moon_sign] || "☽" },
    { label: trPlanet("Rising"), sign: trSign(profile.rising_sign), emoji: TR.signEmojis[profile.rising_sign] || "⬆" },
  ];

  return (
    <div className="min-h-screen pb-32 relative">
      <StarField />
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

          {/* Real Natal Chart Wheel */}
          {chartData ? (
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
          <div className="grid grid-cols-3 gap-3">
            {bigThree.map((p) => (
              <div key={p.label} className="text-center p-2 rounded-lg bg-muted/30">
                <span className="text-lg">{p.emoji}</span>
                <p className="text-xs text-muted-foreground">{p.label}</p>
                <p className="text-sm font-medium text-foreground">{p.sign}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate("/dreams")}
            className="glass-card rounded-xl p-4 text-left hover:border-primary/50 transition-colors"
          >
            <BookOpen className="h-6 w-6 text-primary mb-2" />
            <p className="font-display text-sm text-foreground">{TR.dashboard.dreamJournal}</p>
            <p className="text-xs text-muted-foreground">{TR.dashboard.logDreams}</p>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate("/premium")}
            className="glass-card rounded-xl p-4 text-left hover:border-primary/50 transition-colors"
          >
            <Crown className="h-6 w-6 text-primary mb-2" />
            <p className="font-display text-sm text-foreground">{TR.dashboard.premium}</p>
            <p className="text-xs text-muted-foreground">{TR.dashboard.unlockPower}</p>
          </motion.button>
        </div>
      </div>
      <AdBanner />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
