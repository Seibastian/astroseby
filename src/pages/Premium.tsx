import SporeField from "@/components/SporeField";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Crown, Sparkles, Shield, Infinity, Moon, Star, Eye, Heart, Zap, Calendar, FileText, Users, Lock, Unlock, Check, Compass, User, MessageCircle, CreditCard } from "lucide-react";
import { TR } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const keşifFeatures = [
  { id: "career", title: "Kariyer Yolum", price: 98.99 },
  { id: "relationship", title: "İlişkisel Öngörü", price: 98.99 },
  { id: "city", title: "İdeal Şehir", price: 98.99 },
  { id: "karmic", title: "Karmik Borçlar", price: 98.99 },
  { id: "lineage", title: "Yıldız Soyu", price: 98.99 },
  { id: "monthly_1", title: "1 Aylık Öngörü", price: 98.99 },
  { id: "monthly_6", title: "6 Aylık Öngörü", price: 98.99 },
  { id: "monthly_12", title: "12 Aylık Öngörü", price: 98.99 },
  { id: "shadow", title: "Gölge", price: 98.99 },
  { id: "light", title: "Işık", price: 98.99 },
];

const LIFETIME_PRICE = 1776;
const SINASTRY_SINGLE_PRICE = 89.99;

const Premium = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [keşifLifetime, setKeşifLifetime] = useState(false);
  const [keşifUses, setKeşifUses] = useState<Record<string, number>>({});
  const [sinastrySingle, setSinastrySingle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const checkPremium = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("is_premium, keşif_lifetime, keşif_uses, sinastry_single_use")
        .eq("user_id", user.id)
        .single();
      setIsPremium(data?.is_premium || false);
      setKeşifLifetime(data?.keşif_lifetime || false);
      setKeşifUses(data?.keşif_uses || {});
      setSinastrySingle(data?.sinastry_single_use || false);
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

  const handleSinglePurchase = async (featureId: string, price: number) => {
    if (!user) return;
    
    setProcessing(true);
    
    const currentUses = keşifUses[featureId] || 0;
    const newUses = { ...keşifUses, [featureId]: currentUses + 1 };
    
    await supabase
      .from("profiles")
      .update({ keşif_uses: newUses })
      .eq("user_id", user.id);
    
    setKeşifUses(newUses);
    setProcessing(false);
    toast.success(`${price} TL karşılığında satın alındı!`);
  };

  const handleLifetimePurchase = async () => {
    if (!user) return;
    setProcessing(true);
    await supabase
      .from("profiles")
      .update({ keşif_lifetime: true })
      .eq("user_id", user.id);
    setKeşifLifetime(true);
    setProcessing(false);
    toast.success(`${LIFETIME_PRICE} TL karşılığında ömür boyu üyelik satın alındı!`);
  };

  const handleSinastryPurchase = async () => {
    if (!user) return;
    setProcessing(true);
    await supabase
      .from("profiles")
      .update({ sinastry_single_use: true })
      .eq("user_id", user.id);
    setSinastrySingle(true);
    setProcessing(false);
    toast.success(`${SINASTRY_SINGLE_PRICE} TL karşılığında Sinastri satın alındı!`);
  };

  const canAccessKeşif = isPremium || keşifLifetime;
  const canAccessBen = true; // Ben Kimim is free
  const canAccessSinastry = isPremium || sinastrySingle;

  const handleNavigation = (path: string, hasAccess: boolean) => {
    if (hasAccess) {
      navigate(path);
    } else {
      toast.error("Bu özellik için Premium satın almalısın");
    }
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
          </div>
          <h1 className="text-3xl font-display gold-shimmer">Premium</h1>
          <p className="text-muted-foreground mt-2">
            {isPremium ? "Premium üyesin!" : "Tam deneyimin kilidini aç"}
          </p>
        </motion.div>

        {/* Premium Toggle (Test) */}
        <div className="glass-card rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPremium ? <Unlock className="h-5 w-5 text-green-500" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
              <div>
                <p className="font-display text-sm">{isPremium ? "Premium Aktif" : "Premium Değil"}</p>
                <p className="text-xs text-muted-foreground">Test modu</p>
              </div>
            </div>
            <Button variant={isPremium ? "destructive" : "default"} size="sm" onClick={togglePremium}>
              {isPremium ? "Kapat" : "Aç"}
            </Button>
          </div>
        </div>

        {/* Quick Access */}
        <div className="mb-6">
          <h2 className="text-sm font-display text-muted-foreground mb-3">Premium İçerikler</h2>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleNavigation("/insight", canAccessKeşif)}
              disabled={processing}
              className={`glass-card rounded-xl p-4 flex flex-col items-center gap-2 ${canAccessKeşif ? "hover:border-primary/50" : "opacity-60"}`}
            >
              <Compass className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium">Keşif</span>
              {!canAccessKeşif && <Lock className="h-3 w-3 text-muted-foreground" />}
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => handleNavigation("/synastry", canAccessSinastry)}
              disabled={processing}
              className={`glass-card rounded-xl p-4 flex flex-col items-center gap-2 ${canAccessSinastry ? "hover:border-primary/50" : "opacity-60"}`}
            >
              <Heart className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium">Sinastri</span>
              {!canAccessSinastry && <Lock className="h-3 w-3 text-muted-foreground" />}
            </motion.button>
          </div>
        </div>

        {/* Keşif Lifetime Purchase */}
        {!keşifLifetime && !isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 mb-6 border-2 border-gold/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <Crown className="h-8 w-8 text-gold" />
              <div>
                <h3 className="font-display text-lg text-gold">Keşif Ömür Boyu</h3>
                <p className="text-xs text-muted-foreground">10 keşif aracı + gelecek eklemeler</p>
              </div>
            </div>
            <p className="text-2xl font-display text-gold mb-4">₺{LIFETIME_PRICE}</p>
            <Button 
              className="w-full bg-gold/20 hover:bg-gold/30 text-gold border border-gold/30" 
              onClick={handleLifetimePurchase}
              disabled={processing}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Ömür Boyu Satın Al
            </Button>
          </motion.div>
        )}

        {/* Keşif Tek Seferlik Satın Almalar */}
        {!keşifLifetime && !isPremium && keşifFeatures.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-display text-muted-foreground mb-3">Keşif Tek Seferlik</h2>
            <div className="space-y-2">
              {keşifFeatures.map((feature, i) => {
                const used = keşifUses[feature.id] || 0;
                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass-card rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Compass className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{feature.title}</span>
                      {used > 0 && <Check className="h-4 w-4 text-green-500" />}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSinglePurchase(feature.id, feature.price)}
                      disabled={processing}
                    >
                      ₺{feature.price}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sinastri Tek Seferlik */}
        {!isPremium && !sinastrySingle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-display text-lg">Sinastri Tek Seferlik</h3>
                <p className="text-xs text-muted-foreground">Bir kişiyle detaylı uyum analizi</p>
              </div>
            </div>
            <p className="text-2xl font-display text-primary mb-4">₺{SINASTRY_SINGLE_PRICE}</p>
            <Button 
              className="w-full" 
              onClick={handleSinastryPurchase}
              disabled={processing}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Satın Al
            </Button>
          </motion.div>
        )}

        {/* Premium Benefits (for non-premium) */}
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
              Premium Abonelik ✨
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
