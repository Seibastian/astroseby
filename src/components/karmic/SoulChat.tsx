import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Send, X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trSign } from "@/lib/i18n";

interface Props {
  matchId: string;
  otherProfile: any;
  myProfile: any;
  onClose: () => void;
}

const SoulChat = ({ matchId, otherProfile, myProfile, onClose }: Props) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [icebreaker, setIcebreaker] = useState("");
  const [loadingIce, setLoadingIce] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("soul_chat_messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    // Subscribe to realtime
    const channel = supabase
      .channel(`soul-chat-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "soul_chat_messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.find((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user || sending) return;
    setSending(true);
    const text = input.trim();
    setInput("");

    const { error } = await supabase.from("soul_chat_messages").insert({
      match_id: matchId,
      sender_id: user.id,
      content: text,
    } as any);

    if (error) {
      setInput(text);
    }
    setSending(false);
  };

  const getIcebreaker = useCallback(async () => {
    setLoadingIce(true);
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
            mode: "icebreaker",
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        setIcebreaker("Buz kırıcı soru yüklenemedi.");
        setLoadingIce(false);
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
              setIcebreaker(fullText);
            }
          } catch { /* partial */ }
        }
      }
    } catch {
      setIcebreaker("Buz kırıcı soru yüklenemedi.");
    } finally {
      setLoadingIce(false);
    }
  }, [myProfile, otherProfile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div>
          <p className="font-display text-sm text-foreground">
            Ruh Sohbeti — {otherProfile.name || "Gizemli Ruh"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {trSign(otherProfile.sun_sign)} ☉ · {trSign(otherProfile.moon_sign)} ☽
          </p>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-muted/50">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Icebreaker */}
      <div className="px-4 pt-3">
        {!icebreaker && !loadingIce && (
          <button
            onClick={getIcebreaker}
            className="flex items-center gap-2 text-xs text-primary hover:underline font-display"
          >
            <Sparkles className="h-3 w-3" /> AI Buz Kırıcı Soru Al
          </button>
        )}
        {loadingIce && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Buz kırıcı hazırlanıyor...
          </div>
        )}
        {icebreaker && (
          <div className="text-xs text-primary/80 italic bg-primary/5 rounded-lg p-3 border border-primary/20">
            💫 {icebreaker}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            Henüz mesaj yok. İlk adımı sen at... ✨
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs ${
                  isMine
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted/40 text-foreground rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t border-border/30">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Mesajını yaz..."
          className="flex-1 bg-muted/30 rounded-full px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none border border-border/30 focus:border-primary/50"
        />
        <Button
          size="sm"
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="rounded-full h-8 w-8 p-0"
        >
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  );
};

export default SoulChat;
