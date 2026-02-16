import { useEffect, useRef, useMemo } from "react";
import type { NatalChartData } from "@/lib/astrology";

interface Props {
  data: NatalChartData | null;
}

interface Aspect {
  p1: number;
  p2: number;
  type: "trine" | "sextile" | "square" | "opposition" | "conjunction";
  color: string;
  opacity: number;
}

const ASPECT_ORBS: Array<{ angle: number; orb: number; type: Aspect["type"]; color: string }> = [
  { angle: 120, orb: 8, type: "trine", color: "hsl(200 80% 60%)" },
  { angle: 60, orb: 6, type: "sextile", color: "hsl(160 70% 50%)" },
  { angle: 90, orb: 7, type: "square", color: "hsl(0 70% 55%)" },
  { angle: 180, orb: 8, type: "opposition", color: "hsl(30 80% 55%)" },
  { angle: 0, orb: 8, type: "conjunction", color: "hsl(45 90% 65%)" },
];

const AnimatedNatalBackground = ({ data }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const aspects = useMemo(() => {
    if (!data) return [];
    const result: Aspect[] = [];
    const planets = data.planets.filter(p => !["Ascendant", "MC", "Vertex"].includes(p.name));
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        let diff = Math.abs(planets[i].longitude - planets[j].longitude);
        if (diff > 180) diff = 360 - diff;
        for (const asp of ASPECT_ORBS) {
          if (Math.abs(diff - asp.angle) <= asp.orb) {
            result.push({ p1: i, p2: j, type: asp.type, color: asp.color, opacity: 1 - Math.abs(diff - asp.angle) / asp.orb });
            break;
          }
        }
      }
    }
    return result;
  }, [data]);

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

    const planets = data.planets.filter(p => !["Ascendant", "MC", "Vertex"].includes(p.name));
    const rotation = 180 - data.ascendant;

    const animate = () => {
      const w = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      const h = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.4;
      const time = Date.now() / 1000;

      // Parallax offset
      const px = (mouseRef.current.x - 0.5) * 15;
      const py = (mouseRef.current.y - 0.5) * 15;

      ctx.save();
      ctx.translate(px, py);

      // Draw house wheel (very faint)
      ctx.strokeStyle = "hsla(270, 40%, 40%, 0.08)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      // House lines
      for (let i = 0; i < 12; i++) {
        const cusp = data.houses[i] + rotation;
        const rad = ((cusp - 90) * Math.PI) / 180;
        ctx.strokeStyle = "hsla(270, 40%, 40%, 0.06)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.3 * Math.cos(rad), cy + r * 0.3 * Math.sin(rad));
        ctx.lineTo(cx + r * Math.cos(rad), cy + r * Math.sin(rad));
        ctx.stroke();
      }

      // Planet positions
      const planetPositions: Array<{ x: number; y: number }> = [];
      for (const planet of planets) {
        const deg = planet.longitude + rotation;
        const pulse = 1 + Math.sin(time * 0.5 + planet.longitude * 0.1) * 0.03;
        const pr = r * 0.75 * pulse;
        const rad = ((deg - 90) * Math.PI) / 180;
        const x = cx + pr * Math.cos(rad);
        const y = cy + pr * Math.sin(rad);
        planetPositions.push({ x, y });

        // Planet dot
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(270, 60%, 70%, 0.6)";
        ctx.fill();

        // Glow
        const grd = ctx.createRadialGradient(x, y, 0, x, y, 8);
        grd.addColorStop(0, "hsla(270, 60%, 70%, 0.2)");
        grd.addColorStop(1, "hsla(270, 60%, 70%, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Aspect lines (breathing)
      for (const asp of aspects) {
        const p1 = planetPositions[asp.p1];
        const p2 = planetPositions[asp.p2];
        if (!p1 || !p2) continue;

        const breathe = 0.3 + Math.sin(time * 0.8 + asp.p1 * 0.5) * 0.2;
        ctx.strokeStyle = asp.color.replace(")", ` / ${asp.opacity * breathe})`);
        ctx.lineWidth = asp.type === "conjunction" ? 0 : 0.6;

        if (asp.type === "conjunction") {
          // Golden aura for conjunctions
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 14);
          grd.addColorStop(0, `hsla(45, 90%, 65%, ${asp.opacity * breathe * 0.4})`);
          grd.addColorStop(1, "hsla(45, 90%, 65%, 0)");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(mx, my, 14, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      ctx.restore();

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [data, aspects]);

  if (!data) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default AnimatedNatalBackground;
