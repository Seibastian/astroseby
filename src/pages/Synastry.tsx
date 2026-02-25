import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SporeField from "@/components/SporeField";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Heart, Users, Sparkles, Loader2, Lock, ChevronDown, ChevronUp, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PersonData {
  name: string;
  date: string;
  time: string;
  place: string;
}

const Synastry = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [person1, setPerson1] = useState<PersonData>({ name: "", date: "", time: "", place: "" });
  const [person2, setPerson2] = useState<PersonData>({ name: "", date: "", time: "", place: "" });
  const [showForm, setShowForm] = useState(true);

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

  const analyzeSynastry = async () => {
    if (!person1.date || !person2.date) {
      toast.error("Lütfen her iki kişinin doğum tarihini girin");
      return;
    }
    setAnalyzing(true);
    setStreamingText("");
    setReport("");

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/synastry-analysis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            person1: person1,
            person2: person2,
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
      setShowForm(false);
    } catch (e) {
      toast.error("Analiz başarısız oldu");
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

  if (!isPremium) {
    return (
      <div className="min-h-screen pb-24 relative">
        <SporeField />
        <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-display gold-shimmer mb-4">Sinastri</h1>
            <p className="text-muted-foreground mb-8">
              İki kişinin doğum haritasını karşılaştırarak ilişkinizin derin dinamiklerini keşfedin.
            </p>
            <div className="glass-card rounded-2xl p-6 mb-6">
              <p className="text-sm text-muted-foreground mb-4">
                Bu özellik <span className="text-primary font-display">Premium</span> üyelere özeldir.
              </p>
              <Button onClick={() => navigate("/premium")} className="w-full font-display">
                Premium'a Geç
              </Button>
            </div>
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
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-display text-foreground">Sinastri</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            İki kişinin doğum haritasını karşılaştırarak ilişkinizin derin dinamiklerini keşfedin.
          </p>

          {showForm ? (
            <div className="space-y-6">
              {/* Person 1 */}
              <div className="glass-card rounded-xl p-4">
                <h3 className="font-display text-sm text-primary mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" /> Kişi 1 (Siz)
                </h3>
                <div className="space-y-3">
                  <Input
                    placeholder="İsim (opsiyonel)"
                    value={person1.name}
                    onChange={(e) => setPerson1({ ...person1, name: e.target.value })}
                    className="bg-muted/50"
                  />
                  <Input
                    type="date"
                    placeholder="Doğum Tarihi"
                    value={person1.date}
                    onChange={(e) => setPerson1({ ...person1, date: e.target.value })}
                    className="bg-muted/50"
                  />
                  <Input
                    type="time"
                    placeholder="Doğum Saati"
                    value={person1.time}
                    onChange={(e) => setPerson1({ ...person1, time: e.target.value })}
                    className="bg-muted/50"
                  />
                  <Input
                    placeholder="Doğum Yeri"
                    value={person1.place}
                    onChange={(e) => setPerson1({ ...person1, place: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
              </div>

              {/* Person 2 */}
              <div className="glass-card rounded-xl p-4">
                <h3 className="font-display text-sm text-primary mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Kişi 2 (Partner)
                </h3>
                <div className="space-y-3">
                  <Input
                    placeholder="İsim (opsiyonel)"
                    value={person2.name}
                    onChange={(e) => setPerson2({ ...person2, name: e.target.value })}
                    className="bg-muted/50"
                  />
                  <Input
                    type="date"
                    placeholder="Doğum Tarihi"
                    value={person2.date}
                    onChange={(e) => setPerson2({ ...person2, date: e.target.value })}
                    className="bg-muted/50"
                  />
                  <Input
                    type="time"
                    placeholder="Doğum Saati"
                    value={person2.time}
                    onChange={(e) => setPerson2({ ...person2, time: e.target.value })}
                    className="bg-muted/50"
                  />
                  <Input
                    placeholder="Doğum Yeri"
                    value={person2.place}
                    onChange={(e) => setPerson2({ ...person2, place: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <Button
                onClick={analyzeSynastry}
                disabled={analyzing || !person1.date || !person2.date}
                className="w-full font-display py-6"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analiz ediliyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Sinastri Analizi Yap
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div>
              <Button
                variant="outline"
                onClick={() => { setShowForm(true); setReport(""); }}
                className="mb-4"
              >
                Yeni Analiz
              </Button>

              {(report || analyzing) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-xl p-5"
                >
                  <h3 className="font-display text-primary mb-4 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    İlişki Analizi
                  </h3>
                  <div className="text-sm text-foreground whitespace-pre-wrap">
                    {analyzing ? streamingText : report}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Synastry;
