import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { RefreshCw, Copy, Check, Sparkles, Loader2, Share2 } from "lucide-react";
import { TR, trSign } from "@/lib/i18n";
import { toast } from "sonner";

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
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cosmic-letter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            type: "identity",
          }),
        }
      );

      if (!resp.ok) {
        throw new Error("Kart oluşturulamadı");
      }

      const data = await resp.json();
      setIdentityText(data.letter || "");
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
          <p className="text-sm text-muted-foreground mt-2">AI seni tanımlıyor</p>
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
                <h2 className="text-lg font-display mb-4 text-center">Sen</h2>
                <div className="prose prose-invert prose-sm max-w-none">
                  {identityText.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 text-foreground/90 leading-relaxed">
                      {line}
                    </p>
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
