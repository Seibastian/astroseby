import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NatalChartData, ZODIAC_SIGNS, SIGN_SYMBOLS } from "@/lib/astrology";
import { computeAspects } from "./AnimatedNatalBackground";
import type { AspectInfo } from "./AnimatedNatalBackground";

const ASPECT_COLORS: Record<string, string> = {
  conjunction: "#fbbf24",
  sextile: "#2dd4bf",
  square: "#f87171",
  trine: "#60a5fa",
  opposition: "#fb923c",
};

interface Props {
  data: NatalChartData;
  size?: number;
}

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

const MantarSprite = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
  <motion.g
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0],
      y: [y, y - 15, y, y]
    }}
    transition={{ 
      duration: 2, 
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <circle cx={x} cy={y} r={6} fill="#8b5cf6" />
    <circle cx={x - 3} cy={y - 2} r={1.5} fill="#fff" />
    <circle cx={x + 3} cy={y - 2} r={1.5} fill="#fff" />
    <ellipse cx={x} cy={y + 4} rx={4} ry={2} fill="#6d28d9" />
  </motion.g>
);

const SparkLine = ({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) => {
  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  
  return (
    <g>
      <line
        x1={x1} y1={y1}
        x2={x2} y2={y2}
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.6"
      />
      <motion.circle
        r="3"
        fill="#fff"
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        style={{
          offsetPath: `path('M ${x1} ${y1} L ${x2} ${y2}')`,
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </g>
  );
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

  const displaySize = expanded ? size * 1.8 : size;

  return (
    <motion.div 
      className="relative cursor-pointer"
      onClick={() => setExpanded(!expanded)}
      animate={{ scale: expanded ? 1.1 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 -m-8 bg-black/80 backdrop-blur-sm rounded-full z-10"
            onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
          />
        )}
      </AnimatePresence>

      <motion.svg 
        viewBox={`0 0 ${displaySize} ${displaySize}`} 
        className="w-full max-w-[300px] mx-auto transition-all duration-500"
        style={{ 
          rotate: expanded ? "0deg" : `${rotation}deg`,
          transition: "rotate 0.5s ease"
        }}
      >
        {/* Outer rings */}
        <circle cx={displaySize/2} cy={displaySize/2} r={displaySize/2 - 8} fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
        <circle cx={displaySize/2} cy={displaySize/2} r={displaySize/2 - 36} fill="none" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1" />
        <circle cx={displaySize/2} cy={displaySize/2} r={displaySize/2 - 68} fill="none" stroke="hsl(var(--primary) / 0.15)" strokeWidth="1" />

        {/* Expanded view: Aspect lines with sparkles */}
        {expanded && aspectLines.map((asp, i) => asp && (
          <SparkLine 
            key={`${asp.p1Name}-${asp.p2Name}`}
            x1={asp.x1} y1={asp.y1}
            x2={asp.x2} y2={asp.y2}
            color={asp.color}
          />
        ))}

        {/* Expanded view: Mantars on aspect lines */}
        {expanded && aspectLines.slice(0, 5).map((asp, i) => asp && (
          <MantarSprite 
            key={`mantar-${i}`}
            x={(asp.x1 + asp.x2) / 2}
            y={(asp.y1 + asp.y2) / 2}
            delay={i * 0.3}
          />
        ))}

        {/* Zodiac signs */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const startDeg = i * 30;
          const midDeg = startDeg + 15;
          const scaledSize = displaySize / size;
          const mid = toXY(midDeg, (outerR + signR) / 2);
          const lineStart = toXY(startDeg, signR);
          const lineEnd = toXY(startDeg, outerR);
          
          return (
            <g key={sign} transform={`scale(${scaledSize})`}>
              <line
                x1={lineStart.x} y1={lineStart.y}
                x2={lineEnd.x} y2={lineEnd.y}
                stroke="hsl(var(--primary) / 0.2)"
                strokeWidth="0.5"
              />
              <text
                x={mid.x} y={mid.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-primary"
                fontSize="11"
              >
                {SIGN_SYMBOLS[i]}
              </text>
            </g>
          );
        })}

        {/* House lines */}
        {data.houses.map((cusp, i) => {
          const deg = cusp;
          const scaledSize = displaySize / size;
          const from = toXY(deg, centerR);
          const to = toXY(deg, innerR);
          const isCardinal = i === 0 || i === 3 || i === 6 || i === 9;
          
          return (
            <g key={`house-${i}`} transform={`scale(${scaledSize})`}>
              <line
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={isCardinal ? "hsl(var(--primary) / 0.5)" : "hsl(var(--muted-foreground) / 0.25)"}
                strokeWidth={isCardinal ? 1.5 : 0.5}
              />
            </g>
          );
        })}

        {/* Planet markers */}
        {planetPositions.map((planet) => (
          <g key={planet.name}>
            <motion.circle
              cx={planet.pos.x} cy={planet.pos.y} r={expanded ? 12 : 8}
              fill="hsl(var(--background) / 0.8)"
              stroke="hsl(var(--primary) / 0.5)"
              strokeWidth="0.5"
              animate={{ r: expanded ? 14 : 8 }}
              transition={{ duration: 0.3 }}
            />
            <text
              x={planet.pos.x} y={planet.pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-primary"
              fontSize={planet.isSmall ? "6" : "10"}
              fontWeight="bold"
            >
              {planet.glyph}
            </text>
          </g>
        ))}
      </motion.svg>

      {/* Click hint */}
      <motion.div 
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: expanded ? 0 : 1 }}
      >
        {expanded ? "Kapatmak için tıkla" : "Büyütmek için tıkla"}
      </motion.div>
    </motion.div>
  );
};

export default NatalChartWheel;
