import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SporeField from "@/components/SporeField";
import BottomNav from "@/components/BottomNav";
import AdBanner from "@/components/AdBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Plus, Sparkles, X, BookOpen, Loader2, Mic, Layers } from "lucide-react";
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
  const [selectMode, setSelectMode] = useState(false);
  const [selectedDreams, setSelectedDreams] = useState<Set<string>>(new Set());
  const [collectiveAnalyzing, setCollectiveAnalyzing] = useState(false);
  const [collectiveReport, setCollectiveReport] = useState("");

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

  const streamSSE = async (resp: Response): Promise<string> => {
    if (!resp.body) return "";
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
    return fullText;
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

      const fullText = await streamSSE(resp);

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

  const toggleDreamSelection = (id: string) => {
    setSelectedDreams((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const analyzeCollective = async () => {
    if (!user || selectedDreams.size === 0) return;
    setCollectiveAnalyzing(true);
    setStreamingText("");
    setCollectiveReport("");

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const selectedDreamTexts = dreams
        .filter((d) => selectedDreams.has(d.id))
        .map((d, i) => `--- Rüya ${i + 1}: "${d.title}" ---\n${d.content}`)
        .join("\n\n");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cosmic-synthesis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            dream_text: `[TOPLU ANALİZ - ${selectedDreams.size} RÜYA]\n\n${selectedDreamTexts}`,
            natal_data: {
              sun_sign: profile?.sun_sign,
              moon_sign: profile?.moon_sign,
              rising_sign: profile?.rising_sign,
              date_of_birth: profile?.date_of_birth,
              birth_time: profile?.birth_time,
              birth_place: profile?.birth_place,
            },
            collective: true,
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Toplu analiz başarısız");
      }

      const fullText = await streamSSE(resp);
      setCollectiveReport(fullText);
    } catch (error: any) {
      toast.error(error.message || "Analiz başarısız");
    } finally {
      setCollectiveAnalyzing(false);
      setStreamingText("");
    }
  };

  return (
    <div className="min-h-screen pb-32 relative">
      <SporeField />
      <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> {TR.dreams.title}
          </h1>
          <div className="flex gap-2">
            {dreams.length > 1 && (
              <Button
                size="icon"
                variant={selectMode ? "default" : "outline"}
                className="rounded-full"
                onClick={() => {
                  setSelectMode(!selectMode);
                  setSelectedDreams(new Set());
                  setCollectiveReport("");
                }}
              >
                <Layers className="h-4 w-4" />
              </Button>
            )}
            <Button size="icon" onClick={() => setShowAdd(!showAdd)} variant="outline" className="rounded-full">
              {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Collective analysis bar */}
        {selectMode && selectedDreams.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-3 mb-4 flex items-center justify-between"
          >
            <span className="text-xs text-muted-foreground">
              {selectedDreams.size} {TR.dreams.selectedCount}
            </span>
            <Button
              size="sm"
              onClick={analyzeCollective}
              disabled={collectiveAnalyzing}
              className="font-display"
            >
              {collectiveAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              {TR.dreams.analyzeSelected}
            </Button>
          </motion.div>
        )}

        {/* Collective report */}
        {(collectiveReport || (collectiveAnalyzing && streamingText)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-xl p-4 mb-4 border border-primary/30"
          >
            <p className="text-xs text-primary font-display mb-2">{TR.dreams.collectiveAnalysis}</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {collectiveAnalyzing ? streamingText : collectiveReport}
            </p>
          </motion.div>
        )}

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
                className={`glass-card rounded-xl p-4 ${selectMode && selectedDreams.has(dream.id) ? "border-primary/50" : ""}`}
              >
                <div className="flex items-start justify-between mb-2">
                  {selectMode && (
                    <div className="mr-3 pt-1">
                      <Checkbox
                        checked={selectedDreams.has(dream.id)}
                        onCheckedChange={() => toggleDreamSelection(dream.id)}
                      />
                    </div>
                  )}
                  <div
                    onClick={() => !selectMode && setExpandedDream(expandedDream === dream.id ? null : dream.id)}
                    className="cursor-pointer flex-1"
                  >
                    <h3 className="font-display text-sm text-foreground">{dream.title}</h3>
                    <p className="text-xs text-muted-foreground">{format(new Date(dream.created_at), "d MMM yyyy")}</p>
                  </div>
                  {!selectMode && (
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
                  )}
                </div>

                {expandedDream === dream.id && !selectMode && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{dream.content}</p>

                    {analyzingId === dream.id && streamingText && (
                      <div className="rounded-lg bg-accent/30 p-3 border border-primary/20">
                        <p className="text-xs text-primary font-display mb-1">{TR.dreams.syncReport}</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{streamingText}</p>
                      </div>
                    )}

                    {syntheses[dream.id] && analyzingId !== dream.id && (
                      <div className="rounded-lg bg-accent/30 p-3 border border-primary/20">
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
