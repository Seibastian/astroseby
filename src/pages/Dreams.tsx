import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import StarField from "@/components/StarField";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Plus, Sparkles, X, BookOpen, Loader2, Mic } from "lucide-react";
import { format } from "date-fns";
import { TR } from "@/lib/i18n";

interface Dream {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface Synthesis {
  id: string;
  dream_id: string;
  report_text: string;
}

const Dreams = () => {
  const { user } = useAuth();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [syntheses, setSyntheses] = useState<Record<string, string>>({});
  const [streamingText, setStreamingText] = useState("");
  const [expandedDream, setExpandedDream] = useState<string | null>(null);

  const fetchDreams = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("dreams")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setDreams(data);

    const { data: synths } = await supabase
      .from("syntheses")
      .select("*")
      .eq("user_id", user.id);
    if (synths) {
      const map: Record<string, string> = {};
      synths.forEach((s: Synthesis) => { map[s.dream_id] = s.report_text; });
      setSyntheses(map);
    }
  };

  useEffect(() => { fetchDreams(); }, [user]);

  const addDream = async () => {
    if (!user || !title.trim() || !content.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("dreams").insert({
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
    });
    if (error) {
      toast.error(error.message);
    } else {
      setTitle("");
      setContent("");
      setShowAdd(false);
      fetchDreams();
      toast.success(TR.dreams.saved);
    }
    setSaving(false);
  };

  const analyzeDream = async (dream: Dream) => {
    if (!user) return;
    setAnalyzingId(dream.id);
    setExpandedDream(dream.id);
    setStreamingText("");

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cosmic-synthesis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            dream_text: dream.content,
            natal_data: {
              sun_sign: profile?.sun_sign,
              moon_sign: profile?.moon_sign,
              rising_sign: profile?.rising_sign,
              date_of_birth: profile?.date_of_birth,
              birth_time: profile?.birth_time,
              birth_place: profile?.birth_place,
            },
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "AI analizi başarısız");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) {
              fullText += c;
              setStreamingText(fullText);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      await supabase.from("syntheses").insert({
        user_id: user.id,
        dream_id: dream.id,
        report_text: fullText,
      });

      setSyntheses((prev) => ({ ...prev, [dream.id]: fullText }));
    } catch (error: any) {
      toast.error(error.message || "Analiz başarısız");
    } finally {
      setAnalyzingId(null);
      setStreamingText("");
    }
  };

  return (
    <div className="min-h-screen pb-32 relative">
      <StarField />
      <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> {TR.dreams.title}
          </h1>
          <Button size="icon" onClick={() => setShowAdd(!showAdd)} variant="outline" className="rounded-full">
            {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-2xl p-5 mb-6 overflow-hidden"
            >
              <Input
                placeholder={TR.dreams.addTitle}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-muted/50 border-border mb-3"
              />
              <div className="relative">
                <Textarea
                  placeholder={TR.dreams.addContent}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="bg-muted/50 border-border min-h-[120px] mb-3 pr-12"
                />
                {/* Speech-to-text placeholder button */}
                <button
                  className="absolute right-3 top-3 p-1.5 rounded-full bg-muted/50 hover:bg-primary/20 transition-colors"
                  title={TR.dreams.voiceInput}
                  onClick={() => toast.info("Sesle yazma özelliği yakında eklenecek!")}
                >
                  <Mic className="h-4 w-4 text-primary" />
                </button>
              </div>
              <Button onClick={addDream} disabled={saving} className="w-full font-display">
                {saving ? TR.dreams.saving : TR.dreams.saveDream}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {dreams.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{TR.dreams.noDreams}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dreams.map((dream) => (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div onClick={() => setExpandedDream(expandedDream === dream.id ? null : dream.id)} className="cursor-pointer flex-1">
                    <h3 className="font-display text-sm text-foreground">{dream.title}</h3>
                    <p className="text-xs text-muted-foreground">{format(new Date(dream.created_at), "d MMM yyyy")}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => analyzeDream(dream)}
                    disabled={analyzingId === dream.id}
                    className="text-primary shrink-0"
                  >
                    {analyzingId === dream.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {expandedDream === dream.id && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{dream.content}</p>

                    {analyzingId === dream.id && streamingText && (
                      <div className="rounded-lg bg-cosmic-purple/30 p-3 border border-primary/20">
                        <p className="text-xs text-primary font-display mb-1">{TR.dreams.syncReport}</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{streamingText}</p>
                      </div>
                    )}

                    {syntheses[dream.id] && analyzingId !== dream.id && (
                      <div className="rounded-lg bg-cosmic-purple/30 p-3 border border-primary/20">
                        <p className="text-xs text-primary font-display mb-1">{TR.dreams.syncReport}</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{syntheses[dream.id]}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <AdBanner />
      <BottomNav />
    </div>
  );
};

export default Dreams;
