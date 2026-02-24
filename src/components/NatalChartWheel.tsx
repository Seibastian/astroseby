import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NatalChartData, ZODIAC_SIGNS, SIGN_SYMBOLS } from "@/lib/astrology";
import { computeAspects } from "./AnimatedNatalBackground";

interface Props {
  data: NatalChartData;
  size?: number;
}

const PLANET_GLYPHS: Record<string, string> = {
  Ascendant: "AC", MC: "MC", Sun: "☉", Moon: "☽", Mercury: "☿",
  Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄", Uranus: "♅",
  Neptune: "♆", Pluto: "♇", Chiron: "⚷", Lilith: "⚸", NorthNode: "☊", SouthNode: "☋", Vertex: "Vx",
};

const ASPECT_COLORS: Record<string, string> = {
  conjunction: "#fbbf24", sextile: "#2dd4bf", square: "#f87171", trine: "#60a5fa", opposition: "#fb923c",
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

  const aspects = useMemo(() => computeAspects(data).filter(a => a.orb < 10), [data]);

  const planetPositions = useMemo(() => 
    data.planets.filter(p => PLANET_GLYPHS[p.name]).map(p => ({
      name: p.name,
      pos: toXY(p.longitude + rotation, planetR),
      glyph: PLANET_GLYPHS[p.name],
      isSmall: ["Ascendant", "MC", "Vertex"].includes(p.name)
    })), [data, rotation, planetR]);

  const aspectLines = useMemo(() => aspects.map(asp => {
    const p1 = planetPositions.find(p => p.name === asp.p1Name);
    const p2 = planetPositions.find(p => p.name === asp.p2Name);
    if (!p1 || !p2) return null;
    return { ...asp, from: p1.pos, to: p2.pos, color: ASPECT_COLORS[asp.type] || "#fbbf24" };
  }).filter(Boolean), [aspects, planetPositions]);

  const houseCenters = useMemo(() => 
    data.houses.map((cusp, i) => {
      const nextCusp = data.houses[(i + 1) % 12];
      let span = nextCusp - cusp;
      if (span < 0) span += 360;
      return toXY(cusp + span / 2, (centerR + innerR) / 2);
    }), [data, centerR, innerR]);

  return (
    <div className="relative flex justify-center">
      <div className="relative">
        <motion.div 
          className="cursor-pointer"
          onClick={() => setExpanded(true)}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px]">
            <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
            <circle cx={cx} cy={cy} r={signR} fill="none" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1" />
            
            {ZODIAC_SIGNS.map((sign, i) => {
              const startDeg = i * 30 + rotation;
              const midDeg = startDeg + 15;
              const mid = toXY(midDeg, (outerR + signR) / 2);
              return <text key={sign} x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="central" className="fill-primary" fontSize="11">{SIGN_SYMBOLS[i]}</text>;
            })}

            {data.houses.map((cusp, i) => {
              const deg = cusp + rotation;
              const isCardinal = i === 0 || i === 3 || i === 6 || i === 9;
              return <line key={i} x1={toXY(deg, centerR).x} y1={toXY(deg, centerR).y} x2={toXY(deg, innerR).x} y2={toXY(deg, innerR).y} stroke={isCardinal ? "hsl(var(--primary) / 0.5)" : "hsl(var(--muted-foreground) / 0.25)"} strokeWidth={isCardinal ? 1.5 : 0.5} />;
            })}

            {planetPositions.map((p) => (
              <g key={p.name}>
                <circle cx={p.pos.x} cy={p.pos.y} r={7} fill="hsl(var(--background) / 0.8)" stroke="hsl(var(--primary) / 0.5)" strokeWidth="0.5" />
                <text x={p.pos.x} y={p.pos.y} textAnchor="middle" dominantBaseline="central" className="fill-primary" fontSize={p.isSmall ? "5" : "8"} fontWeight="bold">{p.glyph}</text>
              </g>
            ))}
          </svg>
        </motion.div>

        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
          Büyütmek için tıkla
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-[400px] aspect-square"
              onClick={(e) => e.stopPropagation()}
            >
              <svg viewBox="0 0 400 400" className="w-full h-full">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="glass">
                    <feGaussianBlur stdDeviation="1" result="blur"/>
                    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                  </filter>
                </defs>
                
                {/* Background circle */}
                <circle cx="200" cy="200" r="190" fill="rgba(20, 20, 30, 0.9)" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" />
                <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1" />
                <circle cx="200" cy="200" r="130" fill="none" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="1" />

                {/* Zodiac */}
                {ZODIAC_SIGNS.map((sign, i) => {
                  const midDeg = i * 30 + 15;
                  const pos = toXY(midDeg, 175);
                  const scale = 400 / size;
                  return <text key={sign} x={pos.x * scale} y={pos.y * scale} textAnchor="middle" dominantBaseline="central" className="fill-purple-300" fontSize="16" fontWeight="bold">{SIGN_SYMBOLS[i]}</text>;
                })}

                {/* Aspect lines with glass effect */}
                {aspectLines.map((asp, i) => asp && (
                  <g key={i}>
                    <line
                      x1={asp.from.x * (400/size)} y1={asp.from.y * (400/size)}
                      x2={asp.to.x * (400/size)} y2={asp.to.y * (400/size)}
                      stroke={asp.color}
                      strokeWidth="3"
                      strokeOpacity="0.6"
                      filter="url(#glass)"
                    />
                    {/* Sparkle particles on lines */}
                    {[0.25, 0.5, 0.75].map((t, j) => {
                      const sparkX = (asp.from.x + (asp.to.x - asp.from.x) * t) * (400/size);
                      const sparkY = (asp.from.y + (asp.to.y - asp.from.y) * t) * (400/size);
                      return (
                        <motion.circle
                          key={j}
                          cx={sparkX}
                          cy={sparkY}
                          r="2"
                          fill="#fff"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 + j * 0.2 }}
                        />
                      );
                    })}
                  </g>
                ))}

                {/* Mantars jumping on houses */}
                {houseCenters.map((pos, i) => {
                  const scale = 400 / size;
                  return (
                    <motion.g key={`mantar-${i}`}>
                      <motion.circle
                        cx={pos.x * scale}
                        cy={pos.y * scale}
                        r="8"
                        fill="#8b5cf6"
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: [0, 1, 0],
                          cy: [pos.y * scale, pos.y * scale - 20, pos.y * scale]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                      />
                      <motion.circle
                        cx={pos.x * scale - 2}
                        cy={pos.y * scale - 2}
                        r="1.5"
                        fill="#fff"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                      />
                    </motion.g>
                  );
                })}

                {/* Houses */}
                {data.houses.map((cusp, i) => {
                  const deg = cusp;
                  const isCardinal = i === 0 || i === 3 || i === 6 || i === 9;
                  return (
                    <line
                      key={i}
                      x1={toXY(deg, 80).x * (400/size)}
                      y1={toXY(deg, 80).y * (400/size)}
                      x2={toXY(deg, 130).x * (400/size)}
                      y2={toXY(deg, 130).y * (400/size)}
                      stroke={isCardinal ? "rgba(139, 92, 246, 0.6)" : "rgba(255, 255, 255, 0.2)"}
                      strokeWidth={isCardinal ? 1.5 : 0.5}
                    />
                  );
                })}

                {/* Planets */}
                {planetPositions.map((p) => {
                  const scale = 400 / size;
                  return (
                    <g key={p.name}>
                      <circle cx={p.pos.x * scale} cy={p.pos.y * scale} r="14" fill="rgba(10, 10, 20, 0.9)" stroke="rgba(139, 92, 246, 0.8)" strokeWidth="2" />
                      <text x={p.pos.x * scale} y={p.pos.y * scale} textAnchor="middle" dominantBaseline="central" className="fill-white" fontSize="12" fontWeight="bold">{p.glyph}</text>
                    </g>
                  );
                })}
              </svg>

              <motion.button
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center"
                onClick={() => setExpanded(false)}
                whileHover={{ scale: 1.1 }}
              >
                ✕
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NatalChartWheel;
