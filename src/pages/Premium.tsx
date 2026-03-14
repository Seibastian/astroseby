import SporeField from "@/components/SporeField";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Crown, Sparkles, Shield, CreditCard, Check, Lock, Unlock, ArrowRight, Heart, Compass, Briefcase, MapPin, Star, Calendar, Eye, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const LIFETIME_PRICE = 1776;
const MONTHLY_PRICE = 149.99;
const SINGLE_PRICE = 98.99;
const SINASTRY_PRICE = 89.99;

const keşifFeatures = [
  { id: "career", title: "Kariyer Yolum", icon: Briefcase },
  { id: "relationship", title: "İlişkisel Öngörü", icon: Heart },
  { id: "city", title: "İdeal Şehir", icon: MapPin },
  { id: "karmic", title: "Karmik Borçlar", icon: Star },
  { id: "lineage", title: "Yıldız Soyu", icon: Star },
  { id: "monthly_1", title: "1 Aylık Öngörü", icon: Calendar },
  { id: "monthly_6", title: "6 Aylık Öngörü", icon: Calendar },
  { id: "monthly_12", title: "12 Aylık Öngörü", icon: Calendar },
  { id: "shadow", title: "Gölge", icon: Moon },
  { id: "light", title: "Işık", icon: Sun },
];

const Premium = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [keşifLifetime, setKeşifLifetime] = useState(false);
  const [keşifUses, setKeşifUses] = useState<Record<string, number>>({});
  const [sinastrySingle, setSinastrySingle] = useState(false);
  const [loading, setLoading] = useState(true);

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
    toast.success(newValue ? "Premium aktif!" : "Premium kapatıldı");
  };

  const handleLifetimePurchase = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ keşif_lifetime: true })
      .eq("user_id", user.id);
    setKeşifLifetime(true);
    toast.success(`${LIFETIME_PRICE} TL Keşif Lifetime satın alındı!`);
  };

  const handleSinastryPurchase = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ sinastry_single_use: true })
      .eq("user_id", user.id);
    setSinastrySingle(true);
    toast.success("Sinastri tek seferlik satın alındı!");
  };

  const handleSinglePurchase = async (featureId: string) => {
    if (!user) return;
    const currentUses = keşifUses[featureId] || 0;
    const newUses = { ...keşifUses, [featureId]: currentUses + 1 };
    await supabase
      .from("profiles")
      .update({ keşif_uses: newUses })
      .eq("user_id", user.id);
    setKeşifUses(newUses);
    toast.success(`${SINGLE_PRICE} TL satın alındı!`);
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
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-500/20 mb-4">
            <Crown className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-display text-foreground">Premium</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AstraCastra'nın tüm gücünü keşfet
          </p>
        </motion.div>

        {/* Test Toggle */}
        <div className="flex items-center justify-between bg-card/50 rounded-xl p-3 mb-6">
          <div className="flex items-center gap-3">
            {isPremium ? (
              <Unlock className="h-5 w-5 text-green-500" />
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="text-sm">Premium Durumu</span>
          </div>
          <Button 
            size="sm" 
            variant={isPremium ? "destructive" : "default"}
            onClick={togglePremium}
          >
            {isPremium ? "Kapat" : "Aç"}
          </Button>
        </div>

        {/* Subscription Options */}
        <div className="space-y-3 mb-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Abonelik</h2>
          
          {/* Monthly */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-2xl border transition-all ${
              isPremium 
                ? "border-green-500/50 bg-green-500/10" 
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Aylık Premium</h3>
                <p className="text-xs text-muted-foreground">Tüm özellikler</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-display text-primary">₺{MONTHLY_PRICE}</p>
                <p className="text-xs text-muted-foreground">/ay</p>
              </div>
            </div>
          </motion.div>

          {/* Lifetime */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-4 rounded-2xl border transition-all ${
              keşifLifetime 
                ? "border-green-500/50 bg-green-500/10" 
                : "border-amber-500/30 bg-amber-500/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Keşif Ömür Boyu</h3>
                  {keşifLifetime && <Check className="h-4 w-4 text-green-500" />}
                </div>
                <p className="text-xs text-muted-foreground">10 keşif aracı</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-display text-amber-400">₺{LIFETIME_PRICE}</p>
                <Button 
                  size="sm" 
                  variant={keşifLifetime ? "outline" : "default"}
                  className="mt-1"
                  onClick={handleLifetimePurchase}
                  disabled={keşifLifetime}
                >
                  {keşifLifetime ? "Sahipsin" : "Al"}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Sinastry Single */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-4 rounded-2xl border transition-all ${
              sinastrySingle 
                ? "border-green-500/50 bg-green-500/10" 
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Sinastri</h3>
                  {sinastrySingle && <Check className="h-4 w-4 text-green-500" />}
                </div>
                <p className="text-xs text-muted-foreground">Tek seferlik</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-display text-primary">₺89.99</p>
                <Button 
                  size="sm" 
                  variant={sinastrySingle ? "outline" : "default"}
                  className="mt-1"
                  onClick={handleSinastryPurchase}
                  disabled={sinastrySingle}
                >
                  {sinastrySingle ? "Sahipsin" : "Al"}
                </Button>
              </div>
            </div>
            </motion.div>
        </div>

        {/* Keşif Tek Seferlik */}
        {!keşifLifetime && !isPremium && (
          <div className="space-y-3 mb-6">
            <h2 className="text-sm font-medium text-muted-foreground">Keşif Tek Seferlik</h2>
            
            <div className="grid grid-cols-2 gap-2">
              {keşifFeatures.map((feature, i) => {
                const used = keşifUses[feature.id] || 0;
                const Icon = feature.icon;
                return (
                  <motion.button
                    key={feature.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.03 }}
                    onClick={() => handleSinglePurchase(feature.id)}
                    className={`p-3 rounded-xl border transition-all flex items-center gap-2 ${
                      used > 0
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 text-left">
                      <p className="text-xs font-medium truncate">{feature.title}</p>
                      {used > 0 && <p className="text-[10px] text-green-500">Kullanıldı</p>}
                    </div>
                    <span className="text-xs font-medium">₺{SINGLE_PRICE}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Premium Benefits */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Neler Dahil?</h2>
          
          {[
            { icon: Compass, title: "Keşif", desc: "10 astroloji aracı" },
            { icon: Heart, title: "Sinastri", desc: "İlişki uyumu" },
            { icon: Crown, title: "VIP", desc: "Özel içerikler" },
            { icon: Shield, title: "Reklamsız", desc: "Kesintisiz deneyim" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center gap-4 p-3 rounded-xl bg-card/50"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-primary/20 to-amber-500/10 border border-primary/20"
          >
            <Button className="w-full" size="lg">
              <CreditCard className="h-4 w-4 mr-2" />
              Premium Ol
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Premium;
