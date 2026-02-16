import { useEffect, useRef, useMemo } from "react";
import type { NatalChartData } from "@/lib/astrology";
import { trPlanet, trSign } from "@/lib/i18n";

interface Props {
  data: NatalChartData | null;
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

const ASPECT_DEFS: Array<{ angle: number; orb: number; type: AspectInfo["type"]; color: string; label: string }> = [
  { angle: 120, orb: 8, type: "trine", color: "hsl(200 80% 60%)", label: "Üçgen" },
  { angle: 60, orb: 6, type: "sextile", color: "hsl(170 70% 55%)", label: "Altıgen" },
  { angle: 90, orb: 7, type: "square", color: "hsl(0 70% 55%)", label: "Kare" },
  { angle: 180, orb: 8, type: "opposition", color: "hsl(30 80% 55%)", label: "Karşıt" },
  { angle: 0, orb: 8, type: "conjunction", color: "hsl(45 90% 65%)", label: "Kavuşum" },
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
            p1Name: planets[i].name,
            p2Name: planets[j].name,
            type: asp.type,
            orb: Math.round(orbDiff * 10) / 10,
            exactAngle: diff,
          });
          break;
        }
      }
    }
  }
  return result;
}

const AnimatedNatalBackground = ({ data }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const highlightRef = useRef(-1);

  const { aspects, planets } = useMemo(() => {
    if (!data) return { aspects: [] as InternalAspect[], planets: [] as typeof data.planets };
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

  // Cycle highlighted aspect for label display
  useEffect(() => {
    if (aspects.length === 0) return;
    highlightRef.current = 0;
    const interval = setInterval(() => {
      highlightRef.current = (highlightRef.current + 1) % aspects.length;
    }, 4000);
    return () => clearInterval(interval);
  }, [aspects]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma != null && e.beta != null) {
        mouseRef.current = {
          x: 0.5 + (e.gamma / 90) * 0.3,
          y: 0.5 + ((e.beta - 45) / 90) * 0.3,
        };
      }
    };
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("deviceorientation", handleOrientation);
    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rotation = 180 - data.ascendant;

    const animate = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width = canvas.offsetWidth * dpr;
      const h = canvas.height = canvas.offsetHeight * dpr;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.42;
      const time = Date.now() / 1000;

      // Parallax
      const px = (mouseRef.current.x - 0.5) * 20;
      const py = (mouseRef.current.y - 0.5) * 20;

      ctx.save();
      ctx.translate(px, py);

      // Outer wheel rings
      for (let i = 0; i < 3; i++) {
        const ringR = r * (1 - i * 0.15);
        const pulse = 1 + Math.sin(time * 0.3 + i) * 0.005;
        ctx.strokeStyle = `hsla(270, 40%, 50%, ${0.08 - i * 0.02})`;
        ctx.lineWidth = i === 0 ? 1 : 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Zodiac sign markers on outer ring
      for (let i = 0; i < 12; i++) {
        const deg = i * 30 + rotation;
        const rad = ((deg - 90) * Math.PI) / 180;
        const inner = r * 0.85;
        const outer = r;
        ctx.strokeStyle = "hsla(270, 40%, 50%, 0.06)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx + inner * Math.cos(rad), cy + inner * Math.sin(rad));
        ctx.lineTo(cx + outer * Math.cos(rad), cy + outer * Math.sin(rad));
        ctx.stroke();
      }

      // House lines (faint)
      for (let i = 0; i < 12; i++) {
        const cusp = data.houses[i] + rotation;
        const rad = ((cusp - 90) * Math.PI) / 180;
        const isCardinal = i === 0 || i === 3 || i === 6 || i === 9;
        ctx.strokeStyle = isCardinal
          ? "hsla(38, 80%, 55%, 0.12)"
          : "hsla(270, 40%, 50%, 0.05)";
        ctx.lineWidth = isCardinal ? 1 : 0.5;
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.25 * Math.cos(rad), cy + r * 0.25 * Math.sin(rad));
        ctx.lineTo(cx + r * 0.85 * Math.cos(rad), cy + r * 0.85 * Math.sin(rad));
        ctx.stroke();
      }

      // Planet positions with orbital pulse
      const planetPositions: Array<{ x: number; y: number; name: string }> = [];
      for (const planet of planets) {
        const deg = planet.longitude + rotation;
        const pulse = 1 + Math.sin(time * 0.6 + planet.longitude * 0.05) * 0.04;
        const pr = r * 0.7 * pulse;
        const rad = ((deg - 90) * Math.PI) / 180;
        const x = cx + pr * Math.cos(rad);
        const y = cy + pr * Math.sin(rad);
        planetPositions.push({ x, y, name: planet.name });

        // Glow ring
        const glowR = 10 + Math.sin(time * 0.8 + planet.longitude) * 2;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, glowR);
        grd.addColorStop(0, "hsla(38, 80%, 60%, 0.25)");
        grd.addColorStop(0.5, "hsla(270, 50%, 60%, 0.08)");
        grd.addColorStop(1, "hsla(270, 50%, 60%, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Planet dot
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(38, 85%, 60%, 0.8)";
        ctx.fill();

        // Planet symbol label (small)
        ctx.font = `${9 * dpr / 2}px 'Cinzel', serif`;
        ctx.fillStyle = "hsla(38, 70%, 70%, 0.5)";
        ctx.textAlign = "center";
        ctx.fillText(planet.symbol || "", x, y - 8);
      }

      // Aspect lines with breathing & labels
      const highlighted = highlightRef.current;
      for (let ai = 0; ai < aspects.length; ai++) {
        const asp = aspects[ai];
        const p1 = planetPositions[asp.p1Idx];
        const p2 = planetPositions[asp.p2Idx];
        if (!p1 || !p2) continue;

        const isHighlighted = ai === highlighted;
        const breathe = 0.2 + Math.sin(time * 0.7 + ai * 0.3) * 0.15;
        const alpha = isHighlighted
          ? Math.min(asp.opacity * 0.8, 0.7)
          : asp.opacity * breathe * 0.6;

        if (asp.type === "conjunction") {
          // Golden aura
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 16);
          grd.addColorStop(0, `hsla(45, 90%, 65%, ${alpha * 0.5})`);
          grd.addColorStop(1, "hsla(45, 90%, 65%, 0)");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(mx, my, 16, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Line
          ctx.strokeStyle = asp.color.replace(")", ` / ${alpha})`);
          ctx.lineWidth = isHighlighted ? 1.2 : 0.6;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Label on highlighted aspect
          if (isHighlighted) {
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2;
            const label = `${trPlanet(asp.p1Name)} ↔ ${trPlanet(asp.p2Name)}`;
            const typeLabel = ASPECT_LABELS[asp.type] || asp.type;
            const fontSize = Math.max(8, 10 * dpr / 2);

            // Background pill
            ctx.font = `${fontSize}px 'Raleway', sans-serif`;
            const textW = Math.max(ctx.measureText(label).width, ctx.measureText(typeLabel).width);
            const pillW = textW + 16;
            const pillH = fontSize * 2.8;

            ctx.fillStyle = "hsla(260, 40%, 8%, 0.85)";
            ctx.beginPath();
            const pillR = pillH / 2;
            ctx.roundRect(mx - pillW / 2, my - pillH / 2, pillW, pillH, pillR);
            ctx.fill();

            ctx.strokeStyle = asp.color.replace(")", " / 0.4)");
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.roundRect(mx - pillW / 2, my - pillH / 2, pillW, pillH, pillR);
            ctx.stroke();

            // Text
            ctx.fillStyle = asp.color.replace(")", " / 0.9)");
            ctx.textAlign = "center";
            ctx.fillText(typeLabel, mx, my - fontSize * 0.25);
            ctx.fillStyle = "hsla(40, 30%, 85%, 0.7)";
            ctx.font = `${fontSize * 0.85}px 'Raleway', sans-serif`;
            ctx.fillText(label, mx, my + fontSize * 0.7);
          }
        }
      }

      ctx.restore();
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [data, aspects, planets]);

  if (!data) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
};

export default AnimatedNatalBackground;
