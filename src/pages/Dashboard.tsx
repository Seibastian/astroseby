import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import StarField from "@/components/StarField";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";
import { motion } from "framer-motion";
import { BookOpen, Crown, Star, Sun, Moon, Sparkles } from "lucide-react";

const zodiacEmojis: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data && !data.onboarding_completed) {
          navigate("/onboarding");
        } else {
          setProfile(data);
        }
      });
  }, [user, navigate]);

  if (!profile) return null;

  const planets = [
    { name: "Sun", icon: Sun, sign: profile.sun_sign || "—" },
    { name: "Moon", icon: Moon, sign: profile.moon_sign || "—" },
    { name: "Rising", icon: Sparkles, sign: profile.rising_sign || "—" },
  ];

  return (
    <div className="min-h-screen pb-32 relative">
      <StarField />
      <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-2xl font-display text-foreground">
            {profile.name || "Stargazer"}{" "}
            <span className="text-primary">{zodiacEmojis[profile.sun_sign] || "✨"}</span>
          </h1>
          <p className="text-sm text-primary mt-1">{profile.sun_sign || "Unknown"} Sun</p>
        </motion.div>

        {/* Natal Chart Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <h2 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" /> Natal Chart
          </h2>

          {/* Visual chart placeholder */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
            <div className="absolute inset-4 rounded-full border border-primary/20" />
            <div className="absolute inset-8 rounded-full border border-primary/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">{zodiacEmojis[profile.sun_sign] || "✨"}</span>
            </div>
            {/* Planet markers */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-primary/60"
                style={{
                  top: `${50 - 42 * Math.cos((deg * Math.PI) / 180)}%`,
                  left: `${50 + 42 * Math.sin((deg * Math.PI) / 180)}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {planets.map((p) => (
              <div key={p.name} className="text-center p-2 rounded-lg bg-muted/30">
                <p.icon className="h-4 w-4 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">{p.name}</p>
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
            <p className="font-display text-sm text-foreground">Dream Journal</p>
            <p className="text-xs text-muted-foreground">Log your dreams</p>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate("/premium")}
            className="glass-card rounded-xl p-4 text-left hover:border-primary/50 transition-colors"
          >
            <Crown className="h-6 w-6 text-primary mb-2" />
            <p className="font-display text-sm text-foreground">Premium</p>
            <p className="text-xs text-muted-foreground">Unlock full power</p>
          </motion.button>
        </div>
      </div>
      <AdBanner />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
