import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import StarField from "@/components/StarField";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles, User } from "lucide-react";
import { TR, trSign, trPlanet } from "@/lib/i18n";
import { calculateNatalChart, type NatalChartData, type PlanetPosition } from "@/lib/astrology";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildNatalSummary(chart: NatalChartData): string {
  return chart.planets
    .map((p) => `${trPlanet(p.name)}: ${trSign(p.sign)} ${p.house}. ev (${p.dms})`)
    .join("\n");
}

const Mentor = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<NatalChartData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          try {
            const chart = calculateNatalChart(
              data.date_of_birth,
              data.birth_time,
              41.0,
              29.0
            );
            setChartData(chart);
          } catch {}
        }
      });
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !chartData) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    let assistantText = "";

    try {
      const natalSummary = buildNatalSummary(chartData);

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cosmic-mentor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: newMessages,
            natal_summary: natalSummary,
            profile: {
              name: profile?.name,
              sun_sign: profile?.sun_sign,
              moon_sign: profile?.moon_sign,
              rising_sign: profile?.rising_sign,
            },
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Mentor yanıt veremedi");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Add empty assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

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
              assistantText += c;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantText };
                return updated;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen pb-16 relative flex flex-col">
      <StarField />
      <div className="relative z-10 flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="px-4 pt-6 pb-3">
          <h1 className="text-xl font-display text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> {TR.mentor.title}
          </h1>
          <p className="text-xs text-muted-foreground">{TR.mentor.subtitle}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
          {/* Welcome message */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-4 text-sm text-foreground"
            >
              <Sparkles className="h-4 w-4 text-primary mb-2" />
              <p className="whitespace-pre-wrap">{TR.mentor.welcome}</p>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "glass-card text-foreground"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <Sparkles className="h-3 w-3 text-primary mb-1 inline-block mr-1" />
                  )}
                  {msg.content || (loading && i === messages.length - 1 ? "..." : "")}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-20 pt-2">
          <div className="flex gap-2 glass-card rounded-xl p-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={TR.mentor.placeholder}
              className="border-0 bg-transparent focus-visible:ring-0 text-sm"
              disabled={loading || !chartData}
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="shrink-0 rounded-lg"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Mentor;
