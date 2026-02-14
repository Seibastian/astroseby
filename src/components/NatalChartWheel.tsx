import { NatalChartData, ZODIAC_SIGNS, SIGN_SYMBOLS } from "@/lib/astrology";

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

const NatalChartWheel = ({ data, size = 300 }: Props) => {
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

  // Rotate so Ascendant is on the left (180°)
  const rotation = 180 - data.ascendant;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[300px] mx-auto">
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={signR} fill="none" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="hsl(var(--primary) / 0.15)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={centerR} fill="none" stroke="hsl(var(--primary) / 0.1)" strokeWidth="1" />

      {/* Zodiac sign segments */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const startDeg = i * 30 + rotation;
        const midDeg = startDeg + 15;
        const mid = toXY(midDeg, (outerR + signR) / 2);
        const lineStart = toXY(startDeg, signR);
        const lineEnd = toXY(startDeg, outerR);

        return (
          <g key={sign}>
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

      {/* Placidus house lines (unequal spacing) */}
      {data.houses.map((cusp, i) => {
        const deg = cusp + rotation;
        const from = toXY(deg, centerR);
        const to = toXY(deg, innerR);
        const isCardinal = i === 0 || i === 3 || i === 6 || i === 9;

        // Label in middle of house
        const nextCusp = data.houses[(i + 1) % 12];
        let midDeg = cusp + rotation;
        let span = nextCusp - cusp;
        if (span < 0) span += 360;
        const labelPos = toXY(midDeg + span / 2, centerR + 10);

        return (
          <g key={`house-${i}`}>
            <line
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke={isCardinal ? "hsl(var(--primary) / 0.5)" : "hsl(var(--muted-foreground) / 0.25)"}
              strokeWidth={isCardinal ? 1.5 : 0.5}
            />
            <text
              x={labelPos.x} y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted-foreground"
              fontSize="7"
            >
              {i + 1}
            </text>
          </g>
        );
      })}

      {/* Planet markers */}
      {data.planets.filter(p => PLANET_GLYPHS[p.name]).map((planet) => {
        const deg = planet.longitude + rotation;
        const pos = toXY(deg, planetR);
        const glyph = PLANET_GLYPHS[planet.name] || "?";
        const isSmall = ["Ascendant", "MC", "Vertex"].includes(planet.name);

        return (
          <g key={planet.name}>
            <circle
              cx={pos.x} cy={pos.y} r={8}
              fill="hsl(var(--background) / 0.8)"
              stroke="hsl(var(--primary) / 0.5)"
              strokeWidth="0.5"
            />
            <text
              x={pos.x} y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-primary"
              fontSize={isSmall ? "6" : "9"}
              fontWeight="bold"
            >
              {glyph}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default NatalChartWheel;
