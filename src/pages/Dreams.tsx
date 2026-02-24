import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SporeField from "@/components/SporeField";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Plus, Sparkles, X, BookOpen, Loader2, Mic, Layers, Moon, Heart, Wind, Flame, Eye, Ghost, Home, Car, Phone, TreeDeciduous, Sun, Star } from "lucide-react";
import { format } from "date-fns";
import { TR } from "@/lib/i18n";

interface Dream {
  id: string;
  title: string;
  content: string;
  created_at: string;
  tags?: string[];
  mood?: string;
}

interface Synthesis {
  id: string;
  dream_id: string;
  report_text: string;
}

const moods = [
  { id: "mutlu", label: "Mutlu", emoji: "😊", color: "bg-green-500/20 text-green-400" },
  { id: "uzgun", label: "Üzgün", emoji: "😢", color: "bg-blue-500/20 text-blue-400" },
  { id: "korku", label: "Korku", emoji: "😱", color: "bg-red-500/20 text-red-400" },
  { id: "sic", label: "Şaşkın", emoji: "😲", color: "bg-yellow-500/20 text-yellow-400" },
  { id: "nefret", label: "Nefret", emoji: "😠", color: "bg-orange-500/20 text-orange-400" },
  { id: "huzur", label: "Huzur", emoji: "😌", color: "bg-purple-500/20 text-purple-400" },
  { id: "heyecan", label: "Heyecan", emoji: "🤩", color: "bg-pink-500/20 text-pink-400" },
  { id: "bsk", label: "Belirsiz", emoji: "🤔", color: "bg-gray-500/20 text-gray-400" },
];

const dreamSymbols = [
  { id: "su", label: "Su", icon: Moon, color: "bg-blue-500/20 text-blue-400" },
  { id: "ucmak", label: "Uçmak", icon: Star, color: "bg-purple-500/20 text-purple-400" },
  { id: "dusmek", label: "Düşmek", icon: Wind, color: "bg-gray-500/20 text-gray-400" },
  { id: "ates", label: "Ateş", icon: Flame, color: "bg-red-500/20 text-red-400" },
  { id: "goz", label: "Göz", icon: Eye, color: "bg-amber-500/20 text-amber-400" },
  { id: "hayalet", label: "Hayalet", icon: Ghost, color: "bg-slate-500/20 text-slate-400" },
  { id: "ev", label: "Ev", icon: Home, color: "bg-amber-600/20 text-amber-400" },
  { id: "araba", label: "Araba", icon: Car, color: "bg-zinc-500/20 text-zinc-400" },
  { id: "telefon", label: "Telefon", icon: Phone, color: "bg-emerald-500/20 text-emerald-400" },
  { id: "agac", label: "Ağaç", icon: TreeDeciduous, color: "bg-green-600/20 text-green-400" },
  { id: "gunes", label: "Güneş", icon: Sun, color: "bg-yellow-500/20 text-yellow-400" },
  { id: "kalp", label: "Kalp", icon: Heart, color: "bg-rose-500/20 text-rose-400" },
];

const Dreams = () => {
  const { user } = useAuth();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [syntheses, setSyntheses] = useState<Record<string, string>>({});
  const [streamingText, setStreamingText] = useState("");
  const [expandedDream, setExpandedDream] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedDreams, setSelectedDreams] = useState<Set<string>>(new Set());
  const [collectiveAnalyzing, setCollectiveAnalyzing] = useState(false);
  const [collectiveReport, setCollectiveReport] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "analyzed" | "unanalyzed">("all");

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
      setSelectedMood("");
      setSelectedSymbols([]);
      setShowAdd(false);
      fetchDreams();
      toast.success(TR.dreams.saved);
    }
    setSaving(false);
  };

  const toggleSymbol = (id: string) => {
    setSelectedSymbols(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
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

  const filteredDreams = dreams.filter(d => {
    if (viewMode === "analyzed") return syntheses[d.id];
    if (viewMode === "unanalyzed") return !syntheses[d.id];
    return true;
  });

  return (
    <div className="min-h-screen pb-32 relative">
      <SporeField />
      <div className="relative z-10 px-4 pt-8 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-display text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> {TR.dreams.title}
          </h1>
          <Button size="icon" onClick={() => setShowAdd(!showAdd)} variant="outline" className="rounded-full">
            {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setViewMode("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              viewMode === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            Tümü ({dreams.length})
          </button>
          <button
            onClick={() => setViewMode("analyzed")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              viewMode === "analyzed" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            Analiz Edilmiş ({dreams.filter(d => syntheses[d.id]).length})
          </button>
          <button
            onClick={() => setViewMode("unanalyzed")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              viewMode === "unanalyzed" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            Analiz Edilmemiş ({dreams.filter(d => !syntheses[d.id]).length})
          </button>
        </div>

        {/* Multi-select mode */}
        {dreams.length > 1 && (
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              variant={selectMode ? "default" : "outline"}
              onClick={() => {
                setSelectMode(!selectMode);
                setSelectedDreams(new Set());
                setCollectiveReport("");
              }}
              className="font-display text-xs"
            >
              <Layers className="h-3 w-3 mr-1" />
              {selectMode ? "İptal" : "Çoklu Seç"}
            </Button>
            {selectMode && selectedDreams.size > 0 && (
              <Button
                size="sm"
                onClick={analyzeCollective}
                disabled={collectiveAnalyzing}
                className="font-display text-xs"
              >
                {collectiveAnalyzing ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Sparkles className="h-3 w-3 mr-1" />
                )}
                Analiz Et ({selectedDreams.size})
              </Button>
            )}
          </div>
        )}

        {/* Collective report */}
        {(collectiveReport || (collectiveAnalyzing && streamingText)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-xl p-4 mb-4 border border-primary/30"
          >
            <p className="text-xs text-primary font-display mb-2">📊 {TR.dreams.collectiveAnalysis}</p>
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
              {/* Mood selector */}
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Rüya hissi (duygu)</p>
                <div className="flex flex-wrap gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={() => setSelectedMood(selectedMood === mood.id ? "" : mood.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedMood === mood.id 
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background" 
                          : "opacity-70 hover:opacity-100"
                      } ${mood.color}`}
                    >
                      {mood.emoji} {mood.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dream symbols */}
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Rüyadaki semboller</p>
                <div className="flex flex-wrap gap-2">
                  {dreamSymbols.map((symbol) => {
                    const Icon = symbol.icon;
                    return (
                      <button
                        key={symbol.id}
                        onClick={() => toggleSymbol(symbol.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          selectedSymbols.includes(symbol.id)
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "opacity-70 hover:opacity-100"
                        } ${symbol.color}`}
                      >
                        <Icon className="h-3 w-3" />
                        {symbol.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Input
                placeholder="Rüya başlığı..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-muted/50 border-border mb-3"
              />
              <div className="relative">
                <Textarea
                  placeholder="Rüyanı anlat..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="bg-muted/50 border-border min-h-[120px] mb-3 pr-12"
                />
                <button
                  className="absolute right-3 top-3 p-1.5 rounded-full bg-muted/50 hover:bg-primary/20 transition-colors"
                  title={TR.dreams.voiceInput}
                  onClick={() => toast.info("Sesle yazma özelliği yakında!")}
                >
                  <Mic className="h-4 w-4 text-primary" />
                </button>
              </div>
              <Button onClick={addDream} disabled={saving || !title.trim() || !content.trim()} className="w-full font-display">
                {saving ? TR.dreams.saving : "Rüyayı Kaydet 💫"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredDreams.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{viewMode === "analyzed" ? "Henüz analiz edilmiş rüya yok" : viewMode === "unanalyzed" ? "Tüm rüyalar analiz edilmiş!" : TR.dreams.noDreams}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDreams.map((dream) => (
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
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-sm text-foreground">{dream.title}</h3>
                      {dream.mood && (
                        <span className="text-xs">
                          {moods.find(m => m.id === dream.mood)?.emoji}
                        </span>
                      )}
                      {syntheses[dream.id] && (
                        <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">✓</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{format(new Date(dream.created_at), "d MMM yyyy • HH:mm")}</p>
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

                {/* Tags display */}
                {dream.tags && dream.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {dream.tags.map(tag => {
                      const symbol = dreamSymbols.find(s => s.id === tag);
                      const Icon = symbol?.icon;
                      return (
                        <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${symbol?.color || "bg-muted"}`}>
                          {Icon && <Icon className="h-2.5 w-2.5 inline mr-1" />}
                          {symbol?.label || tag}
                        </span>
                      );
                    })}
                  </div>
                )}

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
      <BottomNav />
    </div>
  );
};

export default Dreams;
