import SporeField from "@/components/SporeField";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Crown, Sparkles, Shield, Infinity, Moon, Star, Eye, Heart, Zap, Calendar, FileText, Users } from "lucide-react";
import { TR } from "@/lib/i18n";
import { useState } from "react";

const plans = [
  {
    id: "monthly",
    name: "Aylık",
    price: "₺149.99",
    period: "/ay",
    popular: false,
  },
  {
    id: "yearly",
    name: "Yıllık",
    price: "₺999.99",
    period: "/yıl",
    popular: true,
    savings: "%45 tasarruf",
  },
  {
    id: "lifetime",
    name: "Sonsuz",
    price: "₺2.999",
    period: "",
    popular: false,
  },
];

const benefits = [
  { icon: Infinity, title: "Sınırsız Mantar Sentezi", desc: "Rüya analizlerinde günlük sınır yok" },
  { icon: Shield, title: "Reklamsız Deneyim", desc: "AstraCastra'yı kesintisiz kullan" },
  { icon: Sparkles, title: "Derin Kök Raporları", desc: "Genişletilmiş doğum haritası ve gezegen transit okumaları" },
  { icon: Moon, title: "Rüya Günlüğü Plus", desc: "Sınırsız rüya kaydı + otomatik sembol analizi" },
  { icon: Eye, title: "Transit Takvimi", desc: "Önümüzdeki 90 günün önemli transiterini gör" },
  { icon: Heart, title: "Karmik Eşleşme+", desc: "Sınırsız harita karşılaştırması ve detaylı uyum raporu" },
  { icon: Star, title: "Özel Webinar", desc: "Aylık canlı astroloji ve rüya atölyeleri" },
  { icon: FileText, title: "PDF Rapor İndir", desc: "Doğum haritanı ve analizlerini indirebilirsin" },
  { icon: Calendar, title: "Solar Return", desc: "Yıllık güneş dönüşü haritası ve detaylı yorum" },
  { icon: Users, title: "Soul Chamber+", desc: "Özel odalara erişim ve derin bağlantılar" },
  { icon: Zap, title: "Öncelikli Destek", desc: "Sorularına 7/24 AI yerine gerçek mentor yanıtı" },
];

const Premium = () => {
  const [selectedPlan, setSelectedPlan] = useState("yearly");

  return (
    <div className="min-h-screen pb-24 relative">
      <SporeField />
      <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="relative inline-block">
            <Crown className="h-12 w-12 text-primary mx-auto mb-3" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="h-4 w-4 text-gold" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-display gold-shimmer">Kozmik VIP</h1>
          <p className="text-muted-foreground mt-2">Tam deneyimin kilidini aç</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 bg-muted/30 p-1 rounded-xl"
        >
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                selectedPlan === plan.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {plan.name}
            </button>
          ))}
        </motion.div>

        <div className="space-y-3 mb-8">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-4 flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/30 to-gold/20 flex items-center justify-center shrink-0">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-sm text-foreground">{b.title}</h3>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-6 text-center border-2 border-primary/30"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-display text-primary">
              {plans.find(p => p.id === selectedPlan)?.price}
            </span>
            <span className="text-muted-foreground">
              {plans.find(p => p.id === selectedPlan)?.period}
            </span>
          </div>
          {selectedPlan === "yearly" && (
            <span className="inline-block bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full mb-4">
              %45 tasarruf
            </span>
          )}
          <Button className="w-full font-display text-lg py-6 bg-gradient-to-r from-primary to-gold hover:opacity-90">
            Şimdi Abone Ol ✨
          </Button>
          <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-2">
            <Shield className="h-3 w-3" />
            İstediğin zaman iptal et. 7 günlük ücretsiz deneme.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-muted-foreground">
            Ödeme metodları: Kredi Kartı, Banka Kartı, Apple Pay, Google Pay
          </p>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Premium;
