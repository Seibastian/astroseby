import * as Astronomy from "astronomy-engine";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const SIGN_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

function longitudeToSign(longitude: number): string {
  const idx = Math.floor(((longitude % 360) + 360) % 360 / 30);
  return ZODIAC_SIGNS[idx];
}

function longitudeToDegreeInSign(longitude: number): number {
  return ((longitude % 360) + 360) % 360 % 30;
}

function getEclipticLongitude(body: Astronomy.Body, date: Date): number {
  if (body === Astronomy.Body.Sun) {
    const sunPos = Astronomy.SunPosition(date);
    return sunPos.elon;
  }
  if (body === Astronomy.Body.Moon) {
    const geo = Astronomy.GeoVector(Astronomy.Body.Moon, date, true);
    const ecl = Astronomy.Ecliptic(geo);
    return ecl.elon;
  }
  return Astronomy.EclipticLongitude(body, date);
}

/**
 * Calculate Mean Lilith (Black Moon Lilith) — mean lunar apogee.
 * Uses standard formula for mean longitude of lunar apogee.
 */
function calculateMeanLilith(date: Date): number {
  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525.0;
  // Mean longitude of lunar apogee (Black Moon Lilith)
  let lilith = 181.0 + 359.9919 * T * 12.3685;
  // More precise formula
  lilith = 181.0 + (1732559343.7306 * T / 3600.0);
  return ((lilith % 360) + 360) % 360;
}

/**
 * Calculate Chiron position (approximate using orbital elements).
 */
function calculateChiron(date: Date): number {
  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525.0;
  // Chiron orbital period ~50.76 years, epoch J2000 position ~8° Sag
  const meanLon = 248.7 + (360.0 / 50.76) * T * 100;
  return ((meanLon % 360) + 360) % 360;
}

/**
 * Calculate Mean North Node (Rahu) — mean lunar node.
 */
function calculateNorthNode(date: Date): number {
  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525.0;
  // Mean longitude of ascending node
  let node = 125.0446 - 1934.13618 * T + 0.0020762 * T * T;
  return ((node % 360) + 360) % 360;
}

/**
 * Calculate Vertex — the western intersection of the ecliptic and prime vertical.
 */
function calculateVertex(date: Date, lat: number, lon: number): number {
  const gast = Astronomy.SiderealTime(date);
  const lst = ((gast * 15) + lon + 360) % 360;
  const obliquity = 23.4393 * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  const colatitude = (Math.PI / 2) - latRad;
  // Vertex is the Ascendant calculated for the colatitude
  const lstRad = lst * Math.PI / 180;
  const y = -Math.cos(lstRad);
  const x = Math.sin(lstRad) * Math.cos(obliquity) + Math.tan(colatitude) * Math.sin(obliquity);
  let vertex = Math.atan2(y, x) * 180 / Math.PI;
  return ((vertex % 360) + 360) % 360;
}

function getJulianDate(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60) / 24;
  let yr = y, mo = m;
  if (mo <= 2) { yr -= 1; mo += 12; }
  const A = Math.floor(yr / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yr + 4716)) + Math.floor(30.6001 * (mo + 1)) + d + B - 1524.5;
}

export interface PlanetPosition {
  name: string;
  longitude: number;
  sign: string;
  degreeInSign: number;
  symbol: string;
  house: number; // 1-12
  dms: string; // e.g. "10° 26' 29\""
}

export interface NatalChartData {
  planets: PlanetPosition[];
  houses: number[];
  ascendant: number;
  ascendantSign: string;
  midheaven: number;
  midheavenSign: string;
}

function degreeToDMS(deg: number): string {
  const d = Math.floor(deg);
  const mf = (deg - d) * 60;
  const m = Math.floor(mf);
  const s = Math.round((mf - m) * 60);
  return `${d}° ${m.toString().padStart(2, "0")}' ${s.toString().padStart(2, "0")}"`;
}

function calculateAscendant(date: Date, lat: number, lon: number): number {
  const gast = Astronomy.SiderealTime(date);
  const lst = ((gast * 15) + lon + 360) % 360;
  const lstRad = lst * Math.PI / 180;
  const obliquity = 23.4393 * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  const y = -Math.cos(lstRad);
  const x = Math.sin(lstRad) * Math.cos(obliquity) + Math.tan(latRad) * Math.sin(obliquity);
  let asc = Math.atan2(y, x) * 180 / Math.PI;
  return ((asc % 360) + 360) % 360;
}

function calculateHouses(ascendant: number): number[] {
  const houses: number[] = [];
  for (let i = 0; i < 12; i++) {
    houses.push((ascendant + i * 30) % 360);
  }
  return houses;
}

function getHouse(longitude: number, houses: number[]): number {
  const lon = ((longitude % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    const start = houses[i];
    const end = houses[(i + 1) % 12];
    if (start < end) {
      if (lon >= start && lon < end) return i + 1;
    } else {
      // wraps around 360
      if (lon >= start || lon < end) return i + 1;
    }
  }
  return 1;
}

export function calculateNatalChart(
  dateOfBirth: string,
  birthTime: string | null,
  lat: number,
  lon: number
): NatalChartData {
  const dob = new Date(dateOfBirth);
  let hour = 12, minute = 0;
  if (birthTime) {
    const parts = birthTime.split(":");
    hour = parseInt(parts[0], 10);
    minute = parseInt(parts[1], 10);
  }
  dob.setHours(hour, minute, 0, 0);

  const ascendant = calculateAscendant(dob, lat, lon);
  const houses = calculateHouses(ascendant);
  const midheaven = (ascendant + 270) % 360;
  const midheavenSign = longitudeToSign(midheaven);

  // Standard bodies via astronomy-engine
  const bodies: Array<{ name: string; body: Astronomy.Body }> = [
    { name: "Sun", body: Astronomy.Body.Sun },
    { name: "Moon", body: Astronomy.Body.Moon },
    { name: "Mercury", body: Astronomy.Body.Mercury },
    { name: "Venus", body: Astronomy.Body.Venus },
    { name: "Mars", body: Astronomy.Body.Mars },
    { name: "Jupiter", body: Astronomy.Body.Jupiter },
    { name: "Saturn", body: Astronomy.Body.Saturn },
    { name: "Uranus", body: Astronomy.Body.Uranus },
    { name: "Neptune", body: Astronomy.Body.Neptune },
    { name: "Pluto", body: Astronomy.Body.Pluto },
  ];

  const planets: PlanetPosition[] = bodies.map(({ name, body }) => {
    const eclLon = getEclipticLongitude(body, dob);
    const sign = longitudeToSign(eclLon);
    const idx = ZODIAC_SIGNS.indexOf(sign);
    const degInSign = longitudeToDegreeInSign(eclLon);
    return {
      name,
      longitude: eclLon,
      sign,
      degreeInSign: Math.round(degInSign * 10) / 10,
      symbol: SIGN_SYMBOLS[idx],
      house: getHouse(eclLon, houses),
      dms: degreeToDMS(degInSign),
    };
  });

  // Chiron
  const chironLon = calculateChiron(dob);
  const chironSign = longitudeToSign(chironLon);
  planets.push({
    name: "Chiron",
    longitude: chironLon,
    sign: chironSign,
    degreeInSign: Math.round(longitudeToDegreeInSign(chironLon) * 10) / 10,
    symbol: "⚷",
    house: getHouse(chironLon, houses),
    dms: degreeToDMS(longitudeToDegreeInSign(chironLon)),
  });

  // Mean Lilith (Black Moon)
  const lilithLon = calculateMeanLilith(dob);
  const lilithSign = longitudeToSign(lilithLon);
  planets.push({
    name: "Lilith",
    longitude: lilithLon,
    sign: lilithSign,
    degreeInSign: Math.round(longitudeToDegreeInSign(lilithLon) * 10) / 10,
    symbol: "⚸",
    house: getHouse(lilithLon, houses),
    dms: degreeToDMS(longitudeToDegreeInSign(lilithLon)),
  });

  // North Node
  const nnLon = calculateNorthNode(dob);
  const nnSign = longitudeToSign(nnLon);
  planets.push({
    name: "NorthNode",
    longitude: nnLon,
    sign: nnSign,
    degreeInSign: Math.round(longitudeToDegreeInSign(nnLon) * 10) / 10,
    symbol: "☊",
    house: getHouse(nnLon, houses),
    dms: degreeToDMS(longitudeToDegreeInSign(nnLon)),
  });

  // South Node (opposite of North Node)
  const snLon = (nnLon + 180) % 360;
  const snSign = longitudeToSign(snLon);
  planets.push({
    name: "SouthNode",
    longitude: snLon,
    sign: snSign,
    degreeInSign: Math.round(longitudeToDegreeInSign(snLon) * 10) / 10,
    symbol: "☋",
    house: getHouse(snLon, houses),
    dms: degreeToDMS(longitudeToDegreeInSign(snLon)),
  });

  // Vertex
  const vertexLon = calculateVertex(dob, lat, lon);
  const vertexSign = longitudeToSign(vertexLon);
  planets.push({
    name: "Vertex",
    longitude: vertexLon,
    sign: vertexSign,
    degreeInSign: Math.round(longitudeToDegreeInSign(vertexLon) * 10) / 10,
    symbol: "Vx",
    house: getHouse(vertexLon, houses),
    dms: degreeToDMS(longitudeToDegreeInSign(vertexLon)),
  });

  // Ascendant entry
  const ascendantSign = longitudeToSign(ascendant);
  const ascIdx = ZODIAC_SIGNS.indexOf(ascendantSign);
  planets.unshift({
    name: "Ascendant",
    longitude: ascendant,
    sign: ascendantSign,
    degreeInSign: Math.round(longitudeToDegreeInSign(ascendant) * 10) / 10,
    symbol: SIGN_SYMBOLS[ascIdx],
    house: 1,
    dms: degreeToDMS(longitudeToDegreeInSign(ascendant)),
  });

  return { planets, houses, ascendant, ascendantSign, midheaven, midheavenSign };
}

export { ZODIAC_SIGNS, SIGN_SYMBOLS, degreeToDMS, longitudeToSign, longitudeToDegreeInSign, getHouse };
