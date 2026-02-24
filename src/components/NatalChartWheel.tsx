import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NatalChartData, ZODIAC_SIGNS, SIGN_SYMBOLS } from "@/lib/astrology";
import { computeAspects } from "./AnimatedNatalBackground";
import type { AspectInfo } from "./AnimatedNatalBackground";

interface Props {
  data: NatalChartData;
  size?: number;
}

const ASPECT_COLORS: Record<string, string> = {
  conjunction: "#fbbf24",
  sextile: "#2dd4bf",
  square: "#f87171",
  trine: "#60a5fa",
  opposition: "#fb923c",
};

const PLANET_GLYPHS: Record<string, string> = {
  Ascendant: "AC",
  MC: "MC",
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
  Chiron: "⚷",
  Lilith: "⚸",
  NorthNode: "☊",
  SouthNode: "☋",
  Vertex: "Vx",
};

const NatalChartWheel = ({ data, size = 300 }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 8;
  const signR = outerR - 28;
  const innerR = signR - 4;
  const planetR = innerR - 24;
  const centerR = planetR - 16;

  const toXY = (deg: number, r: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const rotation = 180 - data.ascendant;

  const aspects = useMemo(() => {
    return computeAspects(data).filter(a => a.orb < 10);
  }, [data]);

  const planetPositions = useMemo(() => {
    return data.planets
      .filter(p => PLANET_GLYPHS[p.name])
      .map(p => ({
        name: p.name,
        deg: p.longitude + rotation,
        pos: toXY(p.longitude + rotation, planetR),
        glyph: PLANET_GLYPHS[p.name],
        isSmall: ["Ascendant", "MC", "Vertex"].includes(p.name)
      }));
  }, [data, rotation, planetR]);

  const aspectLines = useMemo(() => {
    return aspects.map(asp => {
      const p1 = planetPositions.find(p => p.name === asp.p1Name);
      const p2 = planetPositions.find(p => p.name === asp.p2Name);
      if (!p1 || !p2) return null;
      return {
        ...asp,
        x1: p1.pos.x,
        y1: p1.pos.y,
        x2: p2.pos.x,
        y2: p2.pos.y,
        color: ASPECT_COLORS[asp.type] || "#fbbf24"
      };
    }).filter(Boolean);
  }, [aspects, planetPositions]);

  const baseSize = expanded ? size * 1.5 : size;

  return (
    <div className="relative">
      <motion.div 
        className="relative cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        animate={{ scale: expanded ? 1 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center"
              onClick={() => setExpanded(false)}
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative"
                onClick={(e) => e.stopPropagation()}
              >
                <svg 
                  viewBox={`0 0 ${baseSize} ${baseSize}`}
                  className="w-[90vw] max-w-[500px] h-auto"
                  style={{ filter: "drop-shadow(0 0 30px rgba(139, 92, 246, 0.3))" }}
                >
                  {/* Background glow */}
                  <defs>
                    <radialGradient id="chartGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(139, 92, 246, 0.1)" />
                      <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                    </radialGradient>
                  </defs>
                  <circle cx={baseSize/2} cy={baseSize/2} r={baseSize/2} fill="url(#chartGlow)" />

                  {/* Rings */}
                  <circle cx={baseSize/2} cy={baseSize/2} r={baseSize/2 - 8} fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
                  <circle cx={baseSize/2} cy={baseSize/2} r={baseSize/2 - 36} fill="none" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1" />
                  
                  {/* Aspect lines */}
                  {aspectLines.map((asp, i) => asp && (
                    <g key={`asp-${i}`}>
                      <motion.line
                        x1={asp.x1} y1={asp.y1}
                        x2={asp.x2} y2={asp.y2}
                        stroke={asp.color}
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      />
                      <motion.circle
                        r="3"
                        fill="#fff"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        style={{
                          offsetPath: `path('M ${asp.x1} ${asp.y1} L ${asp.x2} ${asp.y2}')`,
                        }}
                      />
                    </g>
                  ))}

                  {/* Zodiac signs */}
                  {ZODIAC_SIGNS.map((sign, i) => {
                    const midDeg = i * 30 + 15;
                    const mid = toXY(midDeg, (outerR + signR) / 2);
                    return (
                      <text
                        key={sign}
                        x={mid.x} y={mid.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-primary"
                        fontSize="14"
                      >
                        {SIGN_SYMBOLS[i]}
                      </text>
                    );
                  })}

                  {/* House lines */}
                  {data.houses.map((cusp, i) => {
                    const deg = cusp;
                    const from = toXY(deg, centerR);
                    const to = toXY(deg, innerR);
                    const isCardinal = i === 0 || i === 3 || i === 6 || i === 9;
                    return (
                      <line
                        key={`house-${i}`}
                        x1={from.x} y1={from.y}
                        x2={to.x} y2={to.y}
                        stroke={isCardinal ? "hsl(var(--primary) / 0.6)" : "hsl(var(--muted-foreground) / 0.3)"}
                        strokeWidth={isCardinal ? 1.5 : 0.5}
                      />
                    );
                  })}

                  {/* Planets */}
                  {planetPositions.map((planet) => (
                    <g key={planet.name}>
                      <circle
                        cx={planet.pos.x} cy={planet.pos.y} r={12}
                        fill="hsl(var(--background) / 0.9)"
                        stroke="hsl(var(--primary) / 0.8)"
                        strokeWidth="1.5"
                      />
                      <text
                        x={planet.pos.x} y={planet.pos.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-primary"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {planet.glyph}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Close hint */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                  Kapatmak için dışarıya tıkla
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main chart */}
        <svg 
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[300px] mx-auto"
        >
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={signR} fill="none" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="hsl(var(--primary) / 0.15)" strokeWidth="1" />

          {ZODIAC_SIGNS.map((sign, i) => {
            const startDeg = i * 30 + rotation;
            const midDeg = startDeg + 15;
            const mid = toXY(midDeg, (outerR + signR) / 2);
            const lineStart = toXY(startDeg, signR);
            const lineEnd = toXY(startDeg, outerR);
            return (
              <g key={sign}>
                <line x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} stroke="hsl(var(--primary) / 0.2)" strokeWidth="0.5" />
                <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="central" className="fill-primary" fontSize="11">
                  {SIGN_SYMBOLS[i]}
                </text>
              </g>
            );
          })}

          {data.houses.map((cusp, i) => {
            const deg = cusp + rotation;
            const from = toXY(deg, centerR);
            const to = toXY(deg, innerR);
            const isCardinal = i === 0 || i === 3 || i === 6 || i === 9;
            return (
              <line
                key={`house-${i}`}
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={isCardinal ? "hsl(var(--primary) / 0.5)" : "hsl(var(--muted-foreground) / 0.25)"}
                strokeWidth={isCardinal ? 1.5 : 0.5}
              />
            );
          })}

          {planetPositions.map((planet) => (
            <g key={planet.name}>
              <circle cx={planet.pos.x} cy={planet.pos.y} r={8} fill="hsl(var(--background) / 0.8)" stroke="hsl(var(--primary) / 0.5)" strokeWidth="0.5" />
              <text x={planet.pos.x} y={planet.pos.y} textAnchor="middle" dominantBaseline="central" className="fill-primary" fontSize={planet.isSmall ? "6" : "9"} fontWeight="bold">
                {planet.glyph}
              </text>
            </g>
          ))}
        </svg>
      </motion.div>

      <motion.div 
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: expanded ? 0 : 1 }}
      >
        Büyütmek için tıkla
      </motion.div>
    </div>
  );
};

export default NatalChartWheel;
