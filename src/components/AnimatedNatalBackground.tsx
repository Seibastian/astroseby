import { useEffect, useRef, useMemo } from "react";
import type { NatalChartData } from "@/lib/astrology";
import { trPlanet } from "@/lib/i18n";

interface Props {
  data: NatalChartData;
  size?: number;
}

export interface AspectInfo {
  p1Name: string;
  p2Name: string;
  type: "trine" | "sextile" | "square" | "opposition" | "conjunction";
  orb: number;
  exactAngle: number;
}

interface InternalAspect extends AspectInfo {
  p1Idx: number;
  p2Idx: number;
  color: string;
  opacity: number;
}

const ASPECT_DEFS: Array<{ angle: number; orb: number; type: AspectInfo["type"]; color: string }> = [
  { angle: 120, orb: 8, type: "trine", color: "hsl(200 80% 60%)" },
  { angle: 60, orb: 6, type: "sextile", color: "hsl(170 70% 55%)" },
  { angle: 90, orb: 7, type: "square", color: "hsl(0 70% 55%)" },
  { angle: 180, orb: 8, type: "opposition", color: "hsl(30 80% 55%)" },
  { angle: 0, orb: 8, type: "conjunction", color: "hsl(45 90% 65%)" },
];

export const ASPECT_LABELS: Record<string, string> = {
  trine: "Üçgen",
  sextile: "Altıgen",
  square: "Kare",
  opposition: "Karşıt",
  conjunction: "Kavuşum",
};

export function computeAspects(data: NatalChartData): AspectInfo[] {
  const planets = data.planets.filter(p => !["Ascendant", "MC", "Vertex"].includes(p.name));
  const result: AspectInfo[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let diff = Math.abs(planets[i].longitude - planets[j].longitude);
      if (diff > 180) diff = 360 - diff;
      for (const asp of ASPECT_DEFS) {
        const orbDiff = Math.abs(diff - asp.angle);
        if (orbDiff <= asp.orb) {
          result.push({
            p1Name: planets[i].name, p2Name: planets[j].name,
            type: asp.type, orb: Math.round(orbDiff * 10) / 10,
            exactAngle: diff,
          });
          break;
        }
      }
    }
  }
  return result;
}

const AnimatedNatalOverlay = ({ data, size = 280 }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const highlightRef = useRef(0);

  const { aspects, planets } = useMemo(() => {
    const p = data.planets.filter(p => !["Ascendant", "MC", "Vertex"].includes(p.name));
    const result: InternalAspect[] = [];
    for (let i = 0; i < p.length; i++) {
      for (let j = i + 1; j < p.length; j++) {
        let diff = Math.abs(p[i].longitude - p[j].longitude);
        if (diff > 180) diff = 360 - diff;
        for (const asp of ASPECT_DEFS) {
          const orbDiff = Math.abs(diff - asp.angle);
          if (orbDiff <= asp.orb) {
            result.push({
              p1Idx: i, p2Idx: j,
              p1Name: p[i].name, p2Name: p[j].name,
              type: asp.type, color: asp.color,
              opacity: 1 - orbDiff / asp.orb,
              orb: orbDiff, exactAngle: diff,
            });
            break;
          }
        }
      }
    }
    return { aspects: result, planets: p };
  }, [data]);

  // Cycle highlighted aspect
  useEffect(() => {
    if (aspects.length === 0) return;
    highlightRef.current = 0;
    const interval = setInterval(() => {
      highlightRef.current = (highlightRef.current + 1) % aspects.length;
    }, 3500);
    return () => clearInterval(interval);
  }, [aspects]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rotation = 180 - data.ascendant;

    const animate = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width = size * dpr;
      const h = canvas.height = size * dpr;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      // Match NatalChartWheel's planetR positioning
      const outerR = size / 2 - 8;
      const signR = outerR - 28;
      const innerR = signR - 4;
      const planetR = (innerR - 24) * dpr;
      const time = Date.now() / 1000;

      // Planet positions matching the SVG wheel
      const planetPositions: Array<{ x: number; y: number }> = [];
      for (const planet of planets) {
        const deg = planet.longitude + rotation;
        const rad = ((deg - 90) * Math.PI) / 180;
        const x = cx + planetR * Math.cos(rad);
        const y = cy + planetR * Math.sin(rad);
        planetPositions.push({ x, y });
      }

      // Draw aspect lines
      const highlighted = highlightRef.current;
      for (let ai = 0; ai < aspects.length; ai++) {
        const asp = aspects[ai];
        const p1 = planetPositions[asp.p1Idx];
        const p2 = planetPositions[asp.p2Idx];
        if (!p1 || !p2) continue;

        const isHighlighted = ai === highlighted;
        const breathe = 0.25 + Math.sin(time * 0.7 + ai * 0.4) * 0.15;
        const alpha = isHighlighted
          ? Math.min(asp.opacity * 0.85, 0.75)
          : asp.opacity * breathe * 0.5;

        if (asp.type === "conjunction") {
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 14 * dpr);
          grd.addColorStop(0, `hsla(45, 90%, 65%, ${alpha * 0.5})`);
          grd.addColorStop(1, "hsla(45, 90%, 65%, 0)");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(mx, my, 14 * dpr, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = asp.color.replace(")", ` / ${alpha})`);
          ctx.lineWidth = isHighlighted ? 1.5 * dpr : 0.5 * dpr;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Label on highlighted
          if (isHighlighted) {
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2;
            const label = `${trPlanet(asp.p1Name)} ↔ ${trPlanet(asp.p2Name)}`;
            const typeLabel = ASPECT_LABELS[asp.type] || asp.type;
            const fontSize = 5 * dpr;

            ctx.font = `${fontSize}px 'Raleway', sans-serif`;
            const textW = Math.max(ctx.measureText(label).width, ctx.measureText(typeLabel).width);
            const pillW = textW + 10 * dpr;
            const pillH = fontSize * 3;
            const pillR = pillH / 2;

            ctx.fillStyle = "hsla(260, 40%, 8%, 0.9)";
            ctx.beginPath();
            ctx.roundRect(mx - pillW / 2, my - pillH / 2, pillW, pillH, pillR);
            ctx.fill();

            ctx.strokeStyle = asp.color.replace(")", " / 0.5)");
            ctx.lineWidth = 0.5 * dpr;
            ctx.beginPath();
            ctx.roundRect(mx - pillW / 2, my - pillH / 2, pillW, pillH, pillR);
            ctx.stroke();

            ctx.fillStyle = asp.color.replace(")", " / 0.9)");
            ctx.textAlign = "center";
            ctx.fillText(typeLabel, mx, my - fontSize * 0.2);
            ctx.fillStyle = "hsla(40, 30%, 85%, 0.75)";
            ctx.font = `${fontSize * 0.8}px 'Raleway', sans-serif`;
            ctx.fillText(label, mx, my + fontSize * 0.75);
          }
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [data, aspects, planets, size]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: size, height: size }}
    />
  );
};

export default AnimatedNatalOverlay;
