import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { NatalChartData } from "@/lib/astrology";
import { computeAspects, ASPECT_LABELS, type AspectInfo } from "./AnimatedNatalBackground";
import { trPlanet } from "@/lib/i18n";

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

const AspectFeed = ({ data }: Props) => {
  const aspects = useMemo(() => {
    if (!data) return [];
    return computeAspects(data).sort((a, b) => a.orb - b.orb).slice(0, 8);
  }, [data]);

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
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${ASPECT_BG[asp.type]}`}
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
    </div>
  );
};

export default AspectFeed;
