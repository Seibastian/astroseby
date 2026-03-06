import SporeField from "@/components/SporeField";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Crown, Sparkles, Shield, Infinity, Moon, Star, Eye, Heart, Zap, Calendar, FileText, Users, Lock, Unlock, Check, Compass, MessageCircle, Home } from "lucide-react";
import { TR } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const benefits = [
  { id: "unlimited_ai", icon: Infinity, title: "Sınırsız Mantar Sentezi", desc: "Rüya analizlerinde günlük sınır yok", feature: "unlimitedDreams" },
  { id: "ad_free", icon: Shield, title: "Reklamsız Deneyim", desc: "AstraCastra'yı kesintisiz kullan", feature: "noAds" },
  { id: "detailed_reports", icon: Sparkles, title: "Derin Kök Raporları", desc: "Genişletilmiş doğum haritası ve gezegen transit okumaları", feature: "detailedReports" },
  { id: "dream_plus", icon: Moon, title: "Rüya Günlüğü Plus", desc: "Sınırsız rüya kaydı + otomatik sembol analizi", feature: "unlimitedDreams" },
  { id: "transit_calendar", icon: Eye, title: "Transit Takvimi", desc: "Önümüzdeki 90 günün önemli transiterini gör", feature: "transitCalendar" },
  { id: "karmic_plus", icon: Heart, title: "Karmik Eşleşme+", desc: "Sınırsız harita karşılaştırması ve detaylı uyum raporu", feature: "unlimitedKarmic" },
  { id: "webinar", icon: Star, title: "Özel Webinar", desc: "Aylık canlı astroloji ve rüya atölyeleri", feature: "webinars" },
  { id: "pdf_download", icon: FileText, title: "PDF Rapor İndir", desc: "Doğum haritanı ve analizlerini indirebilirsin", feature: "pdfDownload" },
  { id: "solar_return", icon: Zap, title: "Solar Return", desc: "Yıllık güneş dönüşü haritası ve detaylı yorum", feature: "solarReturn" },
  { id: "soul_plus", icon: Users, title: "Soul Chamber+", desc: "Özel odalara erişim ve derin bağlantılar", feature: "soulChamberPlus" },
  { id: "priority_support", icon: Calendar, title: "Öncelikli Destek", desc: "Sorularına 7/24 AI yerine gerçek mentor yanıtı", feature: "prioritySupport" },
];

const Premium = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPremium = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("user_id", user.id)
        .single();
      setIsPremium(data?.is_premium || false);
      setLoading(false);
    };
    checkPremium();
  }, [user]);

  const togglePremium = async () => {
    if (!user) return;
    const newValue = !isPremium;
    await supabase
      .from("profiles")
      .update({ is_premium: newValue })
      .eq("user_id", user.id);
    setIsPremium(newValue);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative">
      <SporeField />
      <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="relative inline-block">
            <Crown className={`h-12 w-12 mx-auto mb-3 ${isPremium ? "text-gold" : "text-muted-foreground"}`} />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className={`h-4 w-4 ${isPremium ? "text-gold" : "text-muted-foreground"}`} />
            </motion.div>
          </div>
          <h1 className="text-3xl font-display gold-shimmer">Kozmik VIP</h1>
          <p className="text-muted-foreground mt-2">
            {isPremium ? "🎉 Premium üesisin!" : "Tam deneyimin kilidini aç"}
          </p>
        </motion.div>

        {/* Quick Access */}
        <div className="mb-6">
          <h2 className="text-sm font-display text-muted-foreground mb-3">Hızlı Erişim</h2>
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate("/insight")}
              className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary/50"
            >
              <Compass className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium">Keşif</span>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => navigate("/synastry")}
              className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary/50"
            >
              <Heart className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium">İlişki</span>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => navigate("/chambers")}
              className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary/50"
            >
              <Home className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium">Salonlar</span>
            </motion.button>
          </div>
        </div>

        {/* Premium Status Toggle (for testing) */}
        <div className="glass-card rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPremium ? (
                <Unlock className="h-5 w-5 text-green-500" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-display text-sm">{isPremium ? "Premium Aktif" : "Premium Değil"}</p>
                <p className="text-xs text-muted-foreground">Test modu</p>
              </div>
            </div>
            <Button
              variant={isPremium ? "destructive" : "default"}
              size="sm"
              onClick={togglePremium}
            >
              {isPremium ? "Kapat" : "Aç"}
            </Button>
          </div>
        </div>

        {/* Premium Features */}
        <div className="space-y-3 mb-8">
          <h2 className="text-sm font-display text-muted-foreground mb-4">
            {isPremium ? "✨ Senin İçin Açık:" : "🔒 Premium Avantajları:"}
          </h2>
          {benefits.map((b, i) => {
            const isUnlocked = isPremium;
            const Icon = b.icon;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card rounded-xl p-4 flex items-center gap-4 ${isUnlocked ? "border-primary/30" : "opacity-60"}`}
              >
                <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${isUnlocked ? "bg-gradient-to-br from-primary/30 to-gold/20" : "bg-muted/30"}`}>
                  {isUnlocked ? (
                    <Icon className="h-5 w-5 text-primary" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-sm text-foreground flex items-center gap-2">
                    {b.title}
                    {isUnlocked && <Check className="h-3 w-3 text-green-500" />}
                  </h3>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card rounded-2xl p-6 text-center border-2 border-primary/30"
          >
            <p className="text-3xl font-display text-primary mb-1">₺149.99</p>
            <p className="text-xs text-muted-foreground mb-4">/ ay</p>
            <Button className="w-full font-display text-lg py-6 bg-gradient-to-r from-primary to-gold hover:opacity-90">
              Şimdi Abone Ol ✨
            </Button>
            <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-2">
              <Shield className="h-3 w-3" />
              İstediğin zaman iptal et. 7 günlük ücretsiz deneme.
            </p>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Premium;
