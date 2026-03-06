import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SporeField from "@/components/SporeField";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lock, Sparkles, Briefcase, Heart, MapPin, Star, Calendar, Eye, Sun, Moon, Loader2, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { calculateNatalChart } from "@/lib/astrology";
import { TR, trSign, trPlanet } from "@/lib/i18n";

const insights = [
  {
    id: "career",
    icon: Briefcase,
    title: "Kariyer Yolum",
    description: "Doğum haritan ve transitlerle kariyer yolun",
    prompt: "Bu kişinin doğum haritası ve güncel transitlerini analiz ederek kariyer yolunu, en uygun meslekleri ve bunların sebeplerini detaylı bir mektup olarak yaz.",
  },
  {
    id: "relationship",
    icon: Heart,
    title: "İlişkisel Öngörü",
    description: "Birlikte olabileceğin kişiler ve uygun zamanlar",
    prompt: "Bu kişinin doğum haritası ve güncel transitlerini analiz ederek ilişkisel öngörülerini, uyumlu olabileceği kişi özellikleri, uygun zaman aralıkları ve muhtemel ilişki dinamiklerini yaz.",
  },
  {
    id: "city",
    icon: MapPin,
    title: "İdeal Şehir",
    description: "Astrokartografine göre uygun şehirler",
    prompt: "Bu kişinin doğum haritası ve güncel transitlerini analiz ederek astro-kartografisine göre uygun 2-5 şehir ve bunların sebeplerini yaz.",
  },
  {
    id: "karmic",
    icon: Star,
    title: "Karmik Borçlar",
    description: "Geçmişten getirdiğin karmik dersler",
    prompt: "Bu kişinin doğum haritası ve güncel transitlerini analiz ederek karmik borçlarını, geçmişten getirdiği dersleri ve bunları nasıl dengeleyebileceğini yaz.",
  },
  {
    id: "lineage",
    icon: Moon,
    title: "Yıldız Soyu",
    description: "Hangi yıldızlardan izler taşıyorsun",
    prompt: "Bu kişinin doğum haritası ve güncel transitlerini analiz ederek hangi yıldız soyundan izler taşıdığını, hangi mitolojik figürlerle bağlantılı olduğunu yaz.",
  },
  {
    id: "monthly_1",
    icon: Calendar,
    title: "1 Aylık Öngörü",
    description: "Önümüzdeki 1 ay için astrolojik yol haritası",
    prompt: "Bu kişinin doğum haritası ve önümüzdeki 1 aylık güncel transitlerini analiz ederek 1 aylık detaylı öngörüyü yaz.",
  },
  {
    id: "monthly_6",
    icon: Calendar,
    title: "6 Aylık Öngörü",
    description: "Önümüzdeki 6 ay için astrolojik yol haritası",
    prompt: "Bu kişinin doğum haritası ve önümüzdeki 6 aylık güncel transitlerini analiz ederek 6 aylık detaylı öngörüyü yaz.",
  },
  {
    id: "monthly_12",
    icon: Calendar,
    title: "12 Aylık Öngörü",
    description: "Önümüzdeki 1 yıl için astrolojik yol haritası",
    prompt: "Bu kişinin doğum haritası ve önümüzdeki 12 aylık güncel transitlerini analiz ederek 12 aylık detaylı öngörüyü yaz.",
  },
  {
    id: "shadow",
    icon: Moon,
    title: "Gölge",
    description: "Bilinçaltındaki gölge yönlerin",
    prompt: "Bu kişinin doğum haritasındaki gölge enerjilerini analiz ederek gölge yönlerini listele ve bunların hangi güçlere dönüştürülebileceğini yaz.",
  },
  {
    id: "light",
    icon: Sun,
    title: "Işık",
    description: "Bilinçli yönlerin ve potansiyelin",
    prompt: "Bu kişinin doğum haritasındaki ışık enerjilerini analiz ederek bilinçli yönlerini, güçlü potansiyellerini ve bunlarla neler başarabileceğini yaz.",
  },
];

const Insight = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [keşifLifetime, setKeşifLifetime] = useState(false);
  const [keşifUses, setKeşifUses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [selectedInsight, setSelectedInsight] = useState<typeof insights[0] | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const checkPremiumAndProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*, keşif_lifetime, keşif_uses")
        .eq("user_id", user.id)
        .single();
      setProfile(data);
      setIsPremium(data?.is_premium || false);
      setKeşifLifetime(data?.keşif_lifetime || false);
      setKeşifUses(data?.keşif_uses || {});
      setLoading(false);
    };
    checkPremiumAndProfile();
  }, [user]);

  const canAccess = isPremium || keşifLifetime;

  const getNatalChartText = async (): Promise<string> => {
    if (!user || !profile) return;
    
    if (!canAccess) {
      toast.error("Bu özellik için Premium satın almalısın");
      navigate("/premium");
      return;
    }
    
    setSelectedInsight(insight);
    setAnalyzing(true);
    setStreamingText("");
    setShowResult(true);
    if (!profile?.date_of_birth || !profile?.birth_place) {
      return `Temel Bilgiler:
- İsim: ${profile?.name || "Kullanıcı"}
- Doğum Tarihi: ${profile?.date_of_birth || "Bilinmiyor"}
- Doğum Saati: ${profile?.birth_time || "Bilinmiyor"}
- Doğum Yeri: ${profile?.birth_place || "Bilinmiyor"}
- Güneş: ${trSign(profile?.sun_sign)}
- Ay: ${trSign(profile?.moon_sign)}
- Yükselen: ${trSign(profile?.rising_sign)}`;
    }

    let lat = 41.0, lon = 29.0;
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(profile.birth_place)}&format=json&limit=1`,
        { headers: { "User-Agent": "AstraCastra/1.0" } }
      );
      const geoData = await geoRes.json();
      if (geoData?.[0]) {
        lat = parseFloat(geoData[0].lat);
        lon = parseFloat(geoData[0].lon);
      }
    } catch {}

    const chart = calculateNatalChart(profile.date_of_birth, profile.birth_time, lat, lon);

    let chartText = `DOĞUM HARİTASI BİLGİLERİ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEMEL BİLGİLER:
- İsim: ${profile.name || "Kullanıcı"}
- Doğum Tarihi: ${profile.date_of_birth}
- Doğum Saati: ${profile.birth_time || "Bilinmiyor"}
- Doğum Yeri: ${profile.birth_place}

GEZEGEN POZİSYONLARI:
`;

    for (const p of chart.planets) {
      chartText += `- ${trPlanet(p.name)}: ${Math.round(p.degreeInSign)}° ${trSign(p.sign)} (${p.house}. Ev)\n`;
    }

    chartText += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANA ENERJİLER:
- Güneş (Kimlik): ${trSign(profile.sun_sign)}
- Ay (Duygular): ${trSign(profile.moon_sign)}
- Yükselen (Maske): ${trSign(profile.rising_sign)}
`;

    return chartText;
  };

  const analyze = async (insight: typeof insights[0]) => {
    if (!user || !profile) return;
    
    if (!canAccess) {
      toast.error("Bu özellik için Premium satın almalısın");
      navigate("/premium");
      return;
    }
    
    setSelectedInsight(insight);
    setAnalyzing(true);
    setStreamingText("");
    setShowResult(true);

    try {
      const natalChart = await getNatalChartText();

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/insight-generator`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt: insight.prompt,
            natalChart,
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
                setStreamingText(fullText);
              }
            } catch {}
          }
        }
      }
      setReport(fullText);
    } catch (e) {
      toast.error("Analiz başarısız");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen pb-24 relative">
        <SporeField />
        <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-display text-foreground mb-2">Keşif Premium</h1>
            <p className="text-muted-foreground mb-6">
              Bu özelliklere erişmek için Premium satın almalısın.
            </p>
            <Button onClick={() => navigate("/premium")} className="w-full">
              <CreditCard className="h-4 w-4 mr-2" />
              Premium Satın Al
            </Button>
          </motion.div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative">
      <SporeField />
      <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-display text-foreground">MANTAR Keşif</h1>
          </div>

          {/* Warning Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-4 mb-6 border-amber-500/30 bg-amber-500/5"
          >
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Bu alanda göreceğiniz içeriklerin hepsi doğum haritanız temel alınarak ortaya çıkarılan astrolojik analizlere dayanmaktadır. 
              Doğum haritamız bizi kompleks şekilde tanımlamaz, bize bir harita sunar ve bu harita yönümüzü kaybettiğimizde yardımcı olan bir araçtır. 
              Ego ile tanışmak ve onu anlamlandırmak bazen ağır ve yorucu olabilir. O sebeple yavaş ilerlemenizi ve kendinizi kaptırmamanızı tavsiye ederiz. 🌱
            </p>
          </motion.div>

          {showResult ? (
            <div>
              <Button
                variant="outline"
                onClick={() => { setShowResult(false); setReport(""); setStreamingText(""); }}
                className="mb-4"
              >
                Geri Dön
              </Button>

              {(report || analyzing) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-xl p-5"
                >
                  <h3 className="font-display text-primary mb-4 flex items-center gap-2">
                    {selectedInsight?.icon && <selectedInsight.icon className="h-5 w-5" />}
                    {selectedInsight?.title}
                  </h3>
                  <div className="text-sm text-foreground whitespace-pre-wrap">
                    {analyzing ? streamingText : report}
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {insights.map((insight) => {
                const Icon = insight.icon;
                return (
                  <motion.button
                    key={insight.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => analyze(insight)}
                    disabled={analyzing}
                    className="glass-card rounded-xl p-4 text-left hover:border-primary/50 transition-colors"
                  >
                    <Icon className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-display text-sm text-foreground mb-1">{insight.title}</h3>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Insight;
