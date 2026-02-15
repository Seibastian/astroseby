import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Star, Moon, Sparkles, Heart, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trSign } from "@/lib/i18n";
import ReactMarkdown from "react-markdown";

interface Props {
  match: any;
  otherProfile: any;
  myProfile: any;
  onAccept: () => void;
  accepted: boolean;
  bothAccepted: boolean;
  onOpenChat: () => void;
}

const MatchReveal = ({ match, otherProfile, myProfile, onAccept, accepted, bothAccepted, onOpenChat }: Props) => {
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const analysisRef = useRef(false);

  useEffect(() => {
    if (analysisRef.current || match.ai_analysis) {
      if (match.ai_analysis) setAnalysis(match.ai_analysis);
      return;
    }
    analysisRef.current = true;

    const fetchAnalysis = async () => {
      setAnalyzing(true);
      try {
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/karmic-analysis`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              profile_a: myProfile,
              profile_b: otherProfile,
              score: match.score,
              score_details: match.score_details,
            }),
          }
        );

        if (!resp.ok || !resp.body) {
          setAnalysis("Analiz yüklenemedi.");
          setAnalyzing(false);
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                setAnalysis(fullText);
              }
            } catch { /* partial json */ }
          }
        }
      } catch {
        setAnalysis("Analiz yüklenemedi.");
      } finally {
        setAnalyzing(false);
      }
    };

    fetchAnalysis();
  }, [match, otherProfile, myProfile]);

  const score = match.score || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Score Ring */}
      <div className="glass-card rounded-2xl p-6 text-center">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="52" fill="none"
              stroke="hsl(var(--primary))" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 327} 327`}
              initial={{ strokeDasharray: "0 327" }}
              animate={{ strokeDasharray: `${(score / 100) * 327} 327` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-display text-primary">{score}</span>
            <span className="text-[10px] text-muted-foreground">Karmik Skor</span>
          </div>
        </div>

        <h2 className="font-display text-lg text-foreground mb-1">
          {otherProfile.name || "Gizemli Ruh"}
        </h2>

        {/* Other person's Big Three */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <Star className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Güneş</p>
            <p className="text-xs font-medium text-foreground">{trSign(otherProfile.sun_sign)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <Moon className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Ay</p>
            <p className="text-xs font-medium text-foreground">{trSign(otherProfile.moon_sign)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <Sparkles className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Yükselen</p>
            <p className="text-xs font-medium text-foreground">{trSign(otherProfile.rising_sign)}</p>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-display text-sm text-primary mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> Karmik Analiz
          {analyzing && <Loader2 className="h-3 w-3 animate-spin" />}
        </h3>
        <div className="prose prose-sm prose-invert max-w-none text-foreground/90 text-xs leading-relaxed">
          <ReactMarkdown>{analysis || "Analiz hazırlanıyor..."}</ReactMarkdown>
        </div>
      </div>

      {/* Actions */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        {!accepted && (
          <Button
            onClick={onAccept}
            className="w-full bg-primary text-primary-foreground font-display"
          >
            <Heart className="h-4 w-4 mr-2" /> Kaderi Kabul Et
          </Button>
        )}
        {accepted && !bothAccepted && (
          <div className="text-center py-3">
            <p className="text-sm text-muted-foreground animate-pulse">
              🌙 Diğer ruhun yanıtını bekliyorsun...
            </p>
          </div>
        )}
        {bothAccepted && (
          <Button
            onClick={onOpenChat}
            className="w-full bg-primary text-primary-foreground font-display"
          >
            <MessageCircle className="h-4 w-4 mr-2" /> Ruh Sohbetini Aç
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default MatchReveal;
