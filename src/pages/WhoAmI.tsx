import { useState } from "react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Share2, Copy, Check, X, Sparkles, Star, Moon } from "lucide-react";
import { TR, trSign } from "@/lib/i18n";
import { toast } from "sonner";

const WhoAmI = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      setProfile(data);
    });
  }, [user]);

  const generateCardText = () => {
    if (!profile) return "";
    
    const sun = trSign(profile.sun_sign);
    const moon = trSign(profile.moon_sign);
    const rising = trSign(profile.rising_sign);
    
    return `🔮 Ben Kimim?

☀️ Güneş: ${sun}
🌙 Ay: ${moon}
⬆️ Yükselen: ${rising}

Doğum haritam: astroseby.app/${user?.id?.slice(0,8)}`;
  };

  const copyToClipboard = async () => {
    const text = generateCardText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Kopyalandı! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!profile) return null;

  const sun = trSign(profile.sun_sign);
  const moon = trSign(profile.moon_sign);
  const rising = trSign(profile.rising_sign);

  const signEmojis: Record<string, string> = {
    Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
    Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 20%, hsla(270, 50%, 20%, 0.3) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-display gold-shimmer">Ben Kimim? ✨</h1>
          <p className="text-sm text-muted-foreground mt-2">Doğum haritan ile tanış</p>
        </motion.div>

        {!showCard ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 text-center mb-6"
          >
            <div className="mb-6">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-display">{profile.nickname || "Kozmik Yolcu"}</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-muted-foreground">Güneş</span>
                </div>
                <span className="font-display text-lg">
                  {signEmojis[profile.sun_sign]} {sun}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-blue-400" />
                  <span className="text-muted-foreground">Ay</span>
                </div>
                <span className="font-display text-lg">
                  {signEmojis[profile.moon_sign]} {moon}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <span className="text-muted-foreground">Yükselen</span>
                </div>
                <span className="font-display text-lg">
                  {signEmojis[profile.rising_sign]} {rising}
                </span>
              </div>
            </div>

            <Button onClick={() => setShowCard(true)} className="w-full font-display">
              <Share2 className="h-4 w-4 mr-2" />
              Paylaşılabilir Kart Oluştur
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 text-center mb-6 border-2 border-primary/50"
          >
            <button 
              onClick={() => setShowCard(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 p-4 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl">
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
              <h2 className="text-xl font-display">{profile.nickname || "Kozmik Yolcu"}</h2>
              <p className="text-xs text-muted-foreground">astroseby</p>
            </div>

            <div className="space-y-3 mb-6 text-left">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">☀️ Güneş</span>
                <span className="font-display">{sun}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">🌙 Ay</span>
                <span className="font-display">{moon}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">⬆️ Yükselen</span>
                <span className="font-display">{rising}</span>
              </div>
            </div>

            <Button onClick={copyToClipboard} variant="outline" className="w-full">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Kopyalandı!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Kopyala
                </>
              )}
            </Button>
          </motion.div>
        )}

        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>Bu kartı arkadaşlarınla paylaş</p>
          <p className="mt-2">astroseby.app</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default WhoAmI;
