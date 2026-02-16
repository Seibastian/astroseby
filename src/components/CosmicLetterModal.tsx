import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useTypewriter } from "@/hooks/useTypewriter";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  profile: any;
  natalSummary: string;
}

const LetterContent = ({ content }: { content: string }) => {
  const { displayed } = useTypewriter(content, 18);
  return (
    <div className="prose prose-sm prose-invert max-w-none font-body leading-relaxed">
      <ReactMarkdown>{displayed}</ReactMarkdown>
    </div>
  );
};

const CosmicLetterModal = ({ open, onClose, profile, natalSummary }: Props) => {
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateLetter = async () => {
    setLoading(true);
    setLetter("");
    let text = "";

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
            natal_summary: natalSummary,
            profile: {
              name: profile?.name,
              nickname: profile?.nickname,
              gender: profile?.gender,
              profession: profile?.profession,
              relationship_status: profile?.relationship_status,
              sun_sign: profile?.sun_sign,
              moon_sign: profile?.moon_sign,
              rising_sign: profile?.rising_sign,
            },
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Mektup oluşturulamadı");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
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
              text += c;
              setLetter(text);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
      setGenerated(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (!generated && !loading) {
      generateLetter();
    }
  };

  // Auto-generate when opened
  if (open && !generated && !loading && !letter) {
    handleOpen();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl"
            style={{
              background: "linear-gradient(145deg, hsl(35 30% 12%), hsl(30 25% 8%))",
              border: "1px solid hsl(35 40% 25% / 0.5)",
              boxShadow: "0 0 40px hsl(35 40% 15% / 0.3), inset 0 1px 0 hsl(35 50% 30% / 0.2)",
            }}
          >
            {/* Paper texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] rounded-2xl" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
            }} />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors z-10"
            >
              <X className="h-5 w-5 text-amber-200/60" />
            </button>

            <div className="p-6 pt-8 relative">
              {/* Wax seal decoration */}
              <div className="flex justify-center mb-6">
                <div className="h-12 w-12 rounded-full flex items-center justify-center"
                  style={{
                    background: "radial-gradient(circle, hsl(340 50% 35%), hsl(340 60% 25%))",
                    boxShadow: "0 2px 8px hsl(340 50% 20% / 0.5)",
                  }}
                >
                  <span className="text-lg">✦</span>
                </div>
              </div>

              {loading && !letter && (
                <div className="flex flex-col items-center gap-3 py-12">
                  <Loader2 className="h-6 w-6 animate-spin" style={{ color: "hsl(35 50% 60%)" }} />
                  <p className="text-sm" style={{ color: "hsl(35 30% 55%)" }}>Mektubun hazırlanıyor...</p>
                </div>
              )}

              {letter && <LetterContent content={letter} />}

              {generated && !loading && (
                <div className="mt-6 pt-4 border-t" style={{ borderColor: "hsl(35 30% 20% / 0.4)" }}>
                  <button
                    onClick={() => { setGenerated(false); setLetter(""); generateLetter(); }}
                    className="text-xs hover:underline"
                    style={{ color: "hsl(35 40% 55%)" }}
                  >
                    Yeni mektup oluştur
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CosmicLetterModal;
