import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { TR, trSign } from "@/lib/i18n";

const ELEMENT_MAP: Record<string, string> = {
  Aries: "fire", Taurus: "earth", Gemini: "air", Cancer: "water",
  Leo: "fire", Virgo: "earth", Libra: "air", Scorpio: "water",
  Sagittarius: "fire", Capricorn: "earth", Aquarius: "air", Pisces: "water",
};

const ELEMENT_BG: Record<string, string> = {
  fire: "from-amber-950/60 via-orange-950/30 to-background",
  earth: "from-emerald-950/60 via-stone-950/30 to-background",
  air: "from-slate-800/60 via-sky-950/30 to-background",
  water: "from-blue-950/60 via-purple-950/30 to-background",
};

// Emoji regex
const EMOJI_RE = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu;

const COOLDOWN_MS = 30_000;

interface Props {
  chamberId: string;
  profile: any;
  onBack: () => void;
}

const ChamberChat = ({ chamberId, profile, onBack }: Props) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [lastSent, setLastSent] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const element = ELEMENT_MAP[chamberId] || "water";
  const bgClass = ELEMENT_BG[element];

  // Build cosmic handle
  const myHandle = useCallback(() => {
    const trName = trSign(profile.sun_sign);
    // Extract degree from profile name or use a default
    return `${trName}_${profile.name || "Ruh"}`;
  }, [profile]);

  // Load existing messages
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("chamber_messages")
        .select("*")
        .eq("chamber_id", chamberId)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) setMessages(data);
    };
    load();
  }, [chamberId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chamber-${chamberId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chamber_messages", filter: `chamber_id=eq.${chamberId}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [chamberId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cooldown timer
  useEffect(() => {
    if (lastSent === 0) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, COOLDOWN_MS - (Date.now() - lastSent));
      setCooldown(Math.ceil(remaining / 1000));
      if (remaining <= 0) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [lastSent]);

  const handleInput = (val: string) => {
    if (EMOJI_RE.test(val)) {
      toast("AstraCastra'da sadece kelimelerin gücü geçerlidir. Emojiler ruhun derinliğini anlatmaya yetmez.", { duration: 3000 });
      setInput(val.replace(EMOJI_RE, ""));
      return;
    }
    setInput(val);
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    if (Date.now() - lastSent < COOLDOWN_MS) {
      toast(`Lütfen ${cooldown} saniye bekle. Düşüncelerini topla...`);
      return;
    }
    if (input.length > 500) {
      toast("Mesaj 500 karakteri geçemez.");
      return;
    }

    const handle = myHandle();
    const { error } = await supabase.from("chamber_messages").insert({
      chamber_id: chamberId,
      user_id: user.id,
      sender_handle: handle,
      content: input.trim(),
    });

    if (error) {
      toast.error("Mesaj gönderilemedi");
      return;
    }

    setInput("");
    setLastSent(Date.now());
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col"
      style={{ height: "calc(100vh - 200px)" }}
    >
      {/* Header */}
      <div className={`rounded-t-2xl p-4 bg-gradient-to-b ${bgClass} border border-border/30`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="font-display text-foreground text-lg">
              {TR.signEmojis[chamberId]} {trSign(chamberId)} Salonu
            </h2>
            <p className="text-xs text-muted-foreground">Ruh ailesi sohbeti</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className={`flex-1 rounded-none bg-gradient-to-b ${bgClass} border-x border-border/30 p-4`}>
        <div className="space-y-4 min-h-full">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground italic mt-8">
              Bu salon henüz sessiz. İlk kelimeyi sen söyle...
            </p>
          )}
          {messages.map((msg) => {
            const isMe = msg.user_id === user?.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <span className="text-[10px] font-display text-primary/70 mb-0.5">
                  {msg.sender_handle}
                </span>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  isMe
                    ? "bg-primary/15 text-foreground border border-primary/20"
                    : "glass-card text-foreground"
                }`}>
                  {msg.content}
                </div>
                <span className="text-[9px] text-muted-foreground mt-0.5">
                  {new Date(msg.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className={`rounded-b-2xl p-3 bg-gradient-to-t ${bgClass} border border-border/30`}>
        {cooldown > 0 && (
          <p className="text-[10px] text-primary/70 text-center mb-1 font-display">
            Sessizlik vakti... {cooldown}s
          </p>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Kelimelerin gücüyle yaz..."
            maxLength={500}
            className="flex-1 bg-background/40 border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || cooldown > 0}
            className="p-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChamberChat;
