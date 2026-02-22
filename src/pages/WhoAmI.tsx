import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { RefreshCw, Copy, Check, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SIGN_TR: Record<string, string> = {
  Aries: "Koç", Taurus: "Boğa", Gemini: "İkizler", Cancer: "Yengeç",
  Leo: "Aslan", Virgo: "Başak", Libra: "Terazi", Scorpio: "Akrep",
  Sagittarius: "Yay", Capricorn: "Oğlak", Aquarius: "Kova", Pisces: "Balık",
};

const trSign = (s: string | null | undefined) => s ? (SIGN_TR[s] || s) : "";

const SIGN_DETAILS: Record<string, { element: string; keywords: string[], description: string }> = {
  Aries: { element: "Ateş", keywords: ["Öncü", "Cesur", "Enerjik", "Impulsif", "Lider"], description: "Hayatta her zaman ilk adımı atmaktan çekinmez. Onun için plan yapmak değil, harekete geçmek daha önemli." },
  Taurus: { element: "Toprak", keywords: ["Sadık", "İnatçı", "Manevi", "Hassas", "Sabırlı"], description: "Bir kez güvenini kazandıysan, senin için her şeyi yapar. Ama ona ihanet etmek, sonsuza kadar kaybetmek demek." },
  Gemini: { element: "Hava", keywords: ["Meraklı", "Değişken", "Sosyal", "Zeki", "Dağınık"], description: "Birden fazla konuda uzmanlaşabilir. Ama aynı anda sadece bir konuya odaklanması zor." },
  Cancer: { element: "Su", keywords: ["Duygusal", "Koruyucu", "Aile", "Intuitif", "Kırılgan"], description: "Dışarıdan güçlü görünse de aslında çok hassas. Sevdiği insanları korumak için kendini feda edebilir." },
  Leo: { element: "Ateş", keywords: ["Özgüvenli", "Cömert", "Sahnenin", "Gururlu", "Yaratıcı"], description: "Onun olmadığı bir oda, bir konser, bir toplantı düşünemezsin. Tanınması ve takdir edilmesi onun için vazgeçilmez." },
  Virgo: { element: "Toprak", keywords: ["Titiz", "Mükemmel", "Analitik", "Eleştirel", "Pratik"], description: "Küçük detayları fark eder, ama bu onu bazen insanlardan uzaklaştırır. Temizlik ve düzen onun sığınağı." },
  Libra: { element: "Hava", keywords: ["Dengeli", "Adaletli", "İlişki", "Kararsız", "Zarif"], description: "Her zaman iki tarafı da anlamaya çalışır. Ama bu kararsızlığa yol açabilir. İlişkilerde denge onun için hayati önem taşır." },
  Scorpio: { element: "Su", keywords: ["Derin", "Mücadeleci", "Gizemli", "Tutkulu", "İntikamcı"], description: "Yüzeysel sohbetler onu sıkar. Ya bir şeyi tam olarak bilir, ya da hiç bilmek istemez. Yüzeysel ilişkiler ona göre değil." },
  Sagittarius: { element: "Ateş", keywords: ["Maceraperest", "Özgür", "Açık", "Düşünür", "Düşüncesiz"], description: "Onu bir kafese koyamazsın. Ruhu sürekli yeni yerler, yeni fikirler, yeni deneyimler arıyor. Ama bu onu duygusal bağlardan da uzaklaştırabiliyor." },
  Capricorn: { element: "Toprak", keywords: ["Hırslı", "Disiplinli", "Sorumlu", "Soğuk", "Kurallara"], description: "Başarı onun için bir zorunluluk. Hedeflerini gerçekleştirene kadar durmaz. Ama bu yarış onu duygusal olarak yalnızlaştırabiliyor." },
  Aquarius: { element: "Hava", keywords: ["Özgün", "İnsancıl", "Bağımsız", "Tuhaf", "Devrimci"], description: "Kurallara uymak onun doğasında yok. Toplumsal normları sorgular, farklı düşünür. Ama bu onu bazen insanlardan koparabiliyor." },
  Pisces: { element: "Su", keywords: ["Hayalperest", "Sezgili", "Sanatçı", "Kaçışçı", "Duyarlı"], description: "Gerçeklik bazen ona çok ağır geliyor. Sanata, müziğe, hayal dünyasına sığınıyor. Empati yeteneği çok güçlü ama bu onu kolayca yaralayabiliyor." },
};

const HOUSE_DESCRIPTIONS: Record<number, string> = {
  1: "Kimlik ve benlik",
  2: "Değerler ve sahip olunanlar",
  3: "İletişim ve gündelik hayat",
  4: "Aile ve kökler",
  5: "Yaratıcılık ve aşk",
  6: "İş ve sağlık",
  7: "İlişkiler ve ortaklıklar",
  8: "Dönüşüm ve paylaşılan kaynaklar",
  9: "Felsefe ve uzak yolculuklar",
  10: "Kariyer ve toplumsal rol",
  11: "Topluluk ve hayaller",
  12: "Bilinçaltı ve spiritüel yolculuk",
};

const WhoAmI = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [identityText, setIdentityText] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      setProfile(data);
    });
  }, [user]);

  const generateIdentity = async () => {
    if (!profile || !profile.sun_sign) {
      toast.error("Doğum haritan henüz hazır değil");
      return;
    }

    setLoading(true);
    try {
      const sun = trSign(profile.sun_sign);
      const moon = trSign(profile.moon_sign);
      const rising = trSign(profile.rising_sign);
      
      const sunDetails = SIGN_DETAILS[profile.sun_sign] || SIGN_DETAILS.Aries;
      const moonDetails = SIGN_DETAILS[profile.moon_sign] || SIGN_DETAILS.Cancer;
      const risingDetails = SIGN_DETAILS[profile.rising_sign] || SIGN_DETAILS.Aries;

      const { element: sunEl, description: sunDesc } = sunDetails;
      const { element: moonEl, description: moonDesc } = moonDetails;

      // Build detailed identity text
      let text = "";
      
      // Opening - unique hook
      const hooks = [
        "Eğer onu bir kelimeyle tanımlamak gerekirse:",
        "İşte o insan:",
        "Onu tanımak isteyenler bilmeli ki:",
        "Karakterinin özü şu cümlelerde gizli:",
      ];
      text += `${hooks[Math.floor(Math.random() * hooks.length)]}\n\n`;

      // Sun sign - core identity
      text += `☀️ TEMEL KİMLİK\n`;
      text += `${sunDesc}\n\n`;
      
      // Moon sign - emotional world  
      text += `🌙 DUYGUSAL DÜNYA\n`;
      text += `${moonDesc}\n\n`;

      // Rising sign - how others see
      text += `⬆️ DIŞA YANSIMALAR\n`;
      text += `Dışarıdan bakıldığında ${risingDetails.description.toLowerCase()}\n\n`;

      // Element balance
      text += `🔥 TOPLAM ENERJİ\n`;
      const elements = [sunEl, moonEl].filter((e, i, a) => a.indexOf(e) === i);
      if (elements.length === 1) {
        text += `Hayatı tek bir element ${elements[0].toLowerCase()} enerjisiyle deneyimliyor. ${elements[0] === "Ateş" ? "Bu onu dinamik ve tutkulu kılıyor." : elements[0] === "Su" ? "Bu ona derinlik ve duygusallık katıyor." : elements[0] === "Toprak" ? "Bu ona pratiklik ve dayanıklılık veriyor." : "Bu onu zeki ve sosyal kılıyor."}\n\n`;
      } else {
        text += `Enerjisi ${elements[0].toLowerCase()} ve ${elements[1].toLowerCase()} karışımı. Bu denge onu hem güçlü hem de duyarlı yapıyor.\n\n`;
      }

      // Key traits
      const allKeywords = [...new Set([...sunDetails.keywords, ...moonDetails.keywords])];
      const topTraits = allKeywords.slice(0, 6);
      text += `✨ ÖNE ÇIKAN ÖZELLİKLER\n`;
      text += topTraits.join(" • ") + "\n\n";

      // What they value
      const values = [
        "özgürlük ve bağımsızlık",
        "sevgi ve aidiyet",
        "başarı ve tanınma",
        "adalet ve denge",
        "derinlik ve otantiklik",
        "güvenlik ve stabilite",
        "yaratıcılık ve ifade",
        "bilgi ve öğrenme",
      ];
      const randomValues = values.sort(() => 0.5 - Math.random()).slice(0, 3);
      text += `💎 DEĞER VERDİKLERİ\n`;
      text += randomValues.join(" • ") + "\n\n";

      // Closing - impactful
      text += `🔮 SONUÇ\n`;
      const closings = [
        `O, ${sun.toLowerCase()} enerjisinin dışa vurumu, ${moon.toLowerCase()} duyarlılığının iç dünyası ve ${rising.toLowerCase()} maskesinin sunduğu bir bütün.`,
        `Onu tanımak için ${sun.toLowerCase()} tutkusuna, ${moon.toLowerCase()} duygusallığına ve ${rising.toLowerCase()} yaklaşımına bakmak yeterli.`,
        `Hayat onun için ${sunDetails.keywords[0].toLowerCase()} bir yolculuk. Ama asıl gücünü ${moonDetails.keywords[0].toLowerCase()} yürekten alıyor.`,
      ];
      text += closings[Math.floor(Math.random() * closings.length)];

      setIdentityText(text);
    } catch (error) {
      console.error(error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    const text = `🔮 BEN KİMİM?\n\n${identityText}\n\n— astroseby`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Kopyalandı! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!profile) return null;

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
          <p className="text-sm text-muted-foreground mt-2">Doğum haritan seni tanımlıyor</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          {!identityText ? (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">
                Doğum haritan üzerinden<br />
                sana özel bir kimlik kartı oluşturalım
              </p>
              <Button 
                onClick={generateIdentity} 
                disabled={loading}
                className="font-display"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Kimlik Kartı Oluştur
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="prose prose-invert prose-sm max-w-none">
                  {identityText.split('\n\n').map((para, i) => (
                    <div key={i} className="mb-4">
                      {para.split('\n').map((line, j) => (
                        <p key={j} className="text-foreground/90 leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Kopyalandı
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Kopyala
                    </>
                  )}
                </Button>
                <Button onClick={generateIdentity} disabled={loading} variant="outline">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          )}
        </motion.div>

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
