import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { NatalChartData } from "@/lib/astrology";
import { computeAspects, ASPECT_LABELS, type AspectInfo } from "./AnimatedNatalBackground";
import { trPlanet } from "@/lib/i18n";
import { MessageCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  data: NatalChartData | null;
}

const ASPECT_COLORS: Record<string, string> = {
  trine: "text-blue-400",
  sextile: "text-teal-400",
  square: "text-red-400",
  opposition: "text-orange-400",
  conjunction: "text-amber-400",
};

const ASPECT_BG: Record<string, string> = {
  trine: "bg-blue-400/10 border-blue-400/20",
  sextile: "bg-teal-400/10 border-teal-400/20",
  square: "bg-red-400/10 border-red-400/20",
  opposition: "bg-orange-400/10 border-orange-400/20",
  conjunction: "bg-amber-400/10 border-amber-400/20",
};

const ASPECT_ICONS: Record<string, string> = {
  trine: "△",
  sextile: "⬡",
  square: "□",
  opposition: "☍",
  conjunction: "☌",
};

const ASPECT_ANGLES: Record<string, number> = {
  conjunction: 0,
  trine: 120,
  sextile: 60,
  square: 90,
  opposition: 180,
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
  Chiron: "⚷", Lilith: "⚸", NorthNode: "☊", SouthNode: "☋",
  Ascendant: "AC", MC: "MC",
};

async function fetchAIAnalysis(
  p1Name: string, p1Sign: string, p1House: number,
  p2Name: string, p2Sign: string, p2House: number,
  aspectType: string, orb: number
) {
  const { data, error } = await supabase.functions.invoke("aspect-interpreter", {
    body: {
      p1Name,
      p1Sign,
      p1House,
      p2Name,
      p2Sign,
      p2House,
      aspectType,
      orb,
      transits: []
    }
  });
  
  if (error) throw error;
  return data?.analysis || "Analiz yüklenirken bir hata oluştu.";
}

function AspectVisual({ p1Angle, p2Angle, type }: { p1Angle: number; p2Angle: number; type: string }) {
  const size = 120;
  const center = size / 2;
  const radius = 40;
  
  const getPoint = (angle: number) => ({
    x: center + radius * Math.cos((angle - 90) * Math.PI / 180),
    y: center + radius * Math.sin((angle - 90) * Math.PI / 180),
  });
  
  const p1 = getPoint(p1Angle);
  const p2 = getPoint(p2Angle);
  
  const midAngle = ((p1Angle + p2Angle) / 2 + 360) % 360;
  const labelPoint = getPoint(midAngle);
  
  const aspectColors: Record<string, string> = {
    trine: "#60a5fa",
    sextile: "#2dd4bf",
    square: "#f87171",
    opposition: "#fb923c",
    conjunction: "#fbbf24",
  };
  
  const color = aspectColors[type] || "#a78bfa";
  
  return (
    <div className="relative mx-auto w-32 h-32">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
        <circle cx={center} cy={center} r={radius + 4} fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
        <circle cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth="2" strokeDasharray="8 4" strokeOpacity="0.5">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="30s" repeatCount="indefinite" />
        </circle>
        <circle cx={center} cy={center} r={radius - 8} fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.2" />
        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 3">
          <animate attributeName="stroke-dashoffset" values="0;-18" dur="1s" repeatCount="indefinite" />
        </line>
        <circle cx={p1.x} cy={p1.y} r="8" fill={color}>
          <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx={p1.x} cy={p1.y} r="14" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
        <circle cx={p2.x} cy={p2.y} r="8" fill={color}>
          <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" begin="0.5s" />
          <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx={p2.x} cy={p2.y} r="14" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
        <text x={labelPoint.x} y={labelPoint.y} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold" fill={color} className="drop-shadow-lg">
          {ASPECT_ANGLES[type] || "?"}°
        </text>
      </svg>
      <div className="absolute inset-0 rounded-full opacity-20 blur-xl" style={{ backgroundColor: color }} />
    </div>
  );
}

const AspectFeed = ({ data }: Props) => {
  const navigate = useNavigate();
  const aspects = useMemo(() => {
    if (!data) return [];
    return computeAspects(data).sort((a, b) => a.orb - b.orb).slice(0, 8);
  }, [data]);

  const [selectedAspect, setSelectedAspect] = useState<AspectInfo | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAspectClick = async (asp: AspectInfo) => {
    setSelectedAspect(asp);
    setLoading(true);
    setAiAnalysis("");
    
    try {
      const p1 = data?.planets.find(p => p.name === asp.p1Name);
      const p2 = data?.planets.find(p => p.name === asp.p2Name);
      
      if (p1 && p2) {
        const analysis = await fetchAIAnalysis(
          asp.p1Name, p1.sign, p1.house,
          asp.p2Name, p2.sign, p2.house,
          asp.type, asp.orb
        );
        setAiAnalysis(analysis);
      }
    } catch (error) {
      console.error("AI analysis error:", error);
      setAiAnalysis("Şu anda analiz yapamıyorum. Lütfen tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  const handleMantarChat = (asp: AspectInfo) => {
    const p1 = trPlanet(asp.p1Name);
    const p2 = trPlanet(asp.p2Name);
    const type = ASPECT_LABELS[asp.type];
    const message = `Doğum haritamda ${p1} ve ${p2} arasında ${type} açısı var (${asp.orb}°). Bu açı hakkında daha detaylı bilgi verir misin?`;
    navigate(`/mentor?message=${encodeURIComponent(message)}`);
  };

  if (aspects.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-display text-sm text-foreground flex items-center gap-2">
        <span className="text-primary">⟡</span> Aktif Aspektler
      </h3>
      <div className="grid grid-cols-1 gap-1.5">
        <AnimatePresence>
          {aspects.map((asp, i) => (
            <motion.div
              key={`${asp.p1Name}-${asp.p2Name}-${asp.type}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleAspectClick(asp)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all hover:scale-[1.01] ${ASPECT_BG[asp.type]}`}
            >
              <span className={`text-base font-bold ${ASPECT_COLORS[asp.type]}`}>
                {ASPECT_ICONS[asp.type]}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-foreground font-medium">
                  {trPlanet(asp.p1Name)}
                </span>
                <span className="text-muted-foreground mx-1">↔</span>
                <span className="text-foreground font-medium">
                  {trPlanet(asp.p2Name)}
                </span>
              </div>
              <span className={`shrink-0 font-display text-[10px] ${ASPECT_COLORS[asp.type]}`}>
                {ASPECT_LABELS[asp.type]}
              </span>
              <span className="text-muted-foreground text-[10px] shrink-0">
                {asp.orb}°
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Aspect Detail Modal */}
      <AnimatePresence>
        {selectedAspect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedAspect(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm p-4 rounded-2xl glass-card max-h-[80vh] overflow-y-auto"
            >
              {/* Visual */}
              <AspectVisual 
                p1Angle={data?.planets.find(p => p.name === selectedAspect?.p1Name)?.longitude || 0}
                p2Angle={data?.planets.find(p => p.name === selectedAspect?.p2Name)?.longitude || 0}
                type={selectedAspect?.type || "conjunction"}
              />
              
              <div className="flex items-center gap-2 mb-3 mt-2">
                <span className={`text-xl ${ASPECT_COLORS[selectedAspect?.type || "conjunction"]}`}>
                  {ASPECT_ICONS[selectedAspect?.type || "conjunction"]}
                </span>
                <div>
                  <h4 className="font-display text-sm text-foreground">
                    {trPlanet(selectedAspect?.p1Name || "")} ↔ {trPlanet(selectedAspect?.p2Name || "")}
                  </h4>
                  <p className={`text-xs ${ASPECT_COLORS[selectedAspect?.type || "conjunction"]}`}>
                    {ASPECT_LABELS[selectedAspect?.type || "conjunction"]} · {selectedAspect?.orb}°
                  </p>
                </div>
              </div>
              
              {/* AI Analysis */}
              <div className="space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-6 gap-2">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    <span className="text-xs text-muted-foreground">MANTAR analiz ediyor...</span>
                  </div>
                ) : aiAnalysis ? (
                  <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {aiAnalysis}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    Analiz yükleniyor...
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => selectedAspect && handleMantarChat(selectedAspect)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  MANTAR'a Sor
                </button>
                <button
                  onClick={() => setSelectedAspect(null)}
                  className="flex-1 py-2 px-3 rounded-lg bg-muted/30 text-muted-foreground text-xs font-medium hover:bg-muted/50 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AspectFeed;
