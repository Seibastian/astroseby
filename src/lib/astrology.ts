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
  // Use GeoVector for ALL bodies to get GEOCENTRIC ecliptic longitude
  // (EclipticLongitude returns heliocentric which is wrong for natal charts)
  const geo = Astronomy.GeoVector(body, date, true);
  const ecl = Astronomy.Ecliptic(geo);
  return ecl.elon;
}

// ────────────────────────────────────────────────────
// Julian Date helper
// ────────────────────────────────────────────────────
function getJulianDate(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
  let yr = y, mo = m;
  if (mo <= 2) { yr -= 1; mo += 12; }
  const A = Math.floor(yr / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yr + 4716)) + Math.floor(30.6001 * (mo + 1)) + d + B - 1524.5;
}

// ────────────────────────────────────────────────────
// Obliquity of the ecliptic (accurate formula)
// ────────────────────────────────────────────────────
function getObliquity(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // IAU formula in arcseconds, converted to degrees
  const eps = 23.439291 - 0.0130042 * T - 1.64e-7 * T * T + 5.036e-7 * T * T * T;
  return eps;
}

// ────────────────────────────────────────────────────
// Proper Midheaven (MC) calculation
// ────────────────────────────────────────────────────
function calculateMC(lstDeg: number, obliquityDeg: number): number {
  const lstRad = lstDeg * Math.PI / 180;
  const oblRad = obliquityDeg * Math.PI / 180;
  // MC = atan2(sin(RAMC), cos(RAMC) * cos(obliquity))
  // RAMC = LST in degrees
  let mc = Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(oblRad)) * 180 / Math.PI;
  mc = ((mc % 360) + 360) % 360;
  return mc;
}

// ────────────────────────────────────────────────────
// Proper Ascendant calculation
// ────────────────────────────────────────────────────
function calculateAscendant(lstDeg: number, latDeg: number, obliquityDeg: number): number {
  const lstRad = lstDeg * Math.PI / 180;
  const oblRad = obliquityDeg * Math.PI / 180;
  const latRad = latDeg * Math.PI / 180;
  // Swiss Ephemeris formula: ASC = atan2(cos(ARMC), -(sin(ε)*tan(φ) + cos(ε)*sin(ARMC)))
  const y = Math.cos(lstRad);
  const x = -(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(lstRad));
  let asc = Math.atan2(y, x) * 180 / Math.PI;
  return ((asc % 360) + 360) % 360;
}

// ────────────────────────────────────────────────────
// Ecliptic longitude ↔ RA/Dec conversion
// ────────────────────────────────────────────────────
function eclipticToRA(lonDeg: number, oblDeg: number): number {
  const lonRad = lonDeg * Math.PI / 180;
  const oblRad = oblDeg * Math.PI / 180;
  let ra = Math.atan2(Math.sin(lonRad) * Math.cos(oblRad), Math.cos(lonRad)) * 180 / Math.PI;
  return ((ra % 360) + 360) % 360;
}

function eclipticToDec(lonDeg: number, oblDeg: number): number {
  const lonRad = lonDeg * Math.PI / 180;
  const oblRad = oblDeg * Math.PI / 180;
  return Math.asin(Math.sin(lonRad) * Math.sin(oblRad)) * 180 / Math.PI;
}

// ────────────────────────────────────────────────────
// Placidus House System
// ────────────────────────────────────────────────────
function calculatePlacidusHouses(
  lstDeg: number,
  latDeg: number,
  oblDeg: number,
  ascendant: number,
  mc: number
): number[] {
  const latRad = latDeg * Math.PI / 180;
  const oblRad = oblDeg * Math.PI / 180;
  const ramcRad = lstDeg * Math.PI / 180; // RAMC = LST

  const houses: number[] = new Array(12);
  houses[0] = ascendant; // 1st house cusp = ASC
  houses[9] = mc;        // 10th house cusp = MC
  houses[6] = (mc + 180) % 360; // IC (4th house cusp)
  houses[3] = (ascendant + 180) % 360; // DSC (7th house cusp)

  // Placidus intermediate cusps via iterative method
  // Houses 11, 12 (above horizon, between MC and ASC)
  // Houses 2, 3 (below horizon, between ASC and IC)

  const placidusCusp = (fraction: number, aboveHorizon: boolean): number => {
    // fraction: 1/3 or 2/3
    // Start with equal house estimate
    let lon: number;
    if (aboveHorizon) {
      // Between MC and ASC
      let diff = ascendant - mc;
      if (diff < 0) diff += 360;
      lon = (mc + diff * fraction) % 360;
    } else {
      // Between IC and DSC... actually between ASC and IC for houses 2,3
      const ic = (mc + 180) % 360;
      let diff = ic - ascendant;
      if (diff < 0) diff += 360;
      lon = (ascendant + diff * fraction) % 360;
    }

    // Iterate to find the Placidus cusp
    for (let iter = 0; iter < 50; iter++) {
      const lonRad = lon * Math.PI / 180;
      const dec = Math.asin(Math.sin(lonRad) * Math.sin(oblRad));
      const ra = Math.atan2(Math.sin(lonRad) * Math.cos(oblRad), Math.cos(lonRad));
      const raPositive = ((ra * 180 / Math.PI) % 360 + 360) % 360;

      // Diurnal semi-arc
      const tanDecTanLat = Math.tan(dec) * Math.tan(latRad);
      // Clamp to prevent NaN at extreme latitudes
      const clamped = Math.max(-1, Math.min(1, -tanDecTanLat));
      const dsa = Math.acos(clamped) * 180 / Math.PI; // in degrees

      let targetRA: number;
      if (aboveHorizon) {
        // Above horizon: fraction of diurnal semi-arc from MC
        targetRA = (lstDeg + fraction * dsa) % 360;
      } else {
        // Below horizon: interpolate between ASC (H=-DSA) and IC (H=-180°)
        // H(cusp) = -(1-fraction)*DSA - fraction*180
        // RA = RAMC - H = RAMC + (1-fraction)*DSA + fraction*180
        targetRA = (lstDeg + (1 - fraction) * dsa + fraction * 180) % 360;
      }

      // Convert target RA back to ecliptic longitude
      const targetRARad = targetRA * Math.PI / 180;
      let newLon = Math.atan2(
        Math.sin(targetRARad),
        Math.cos(targetRARad) * Math.cos(oblRad)
      ) * 180 / Math.PI;
      newLon = ((newLon % 360) + 360) % 360;

      // Check convergence
      let diff = Math.abs(newLon - lon);
      if (diff > 180) diff = 360 - diff;
      lon = newLon;
      if (diff < 0.001) break;
    }
    return lon;
  };

  // House 11: 1/3 of semi-arc above horizon (MC → ASC)
  houses[10] = placidusCusp(1 / 3, true);
  // House 12: 2/3 of semi-arc above horizon (MC → ASC)
  houses[11] = placidusCusp(2 / 3, true);
  // House 2: 1/3 of semi-arc below horizon (ASC → IC)
  houses[1] = placidusCusp(1 / 3, false);
  // House 3: 2/3 of semi-arc below horizon (ASC → IC)
  houses[2] = placidusCusp(2 / 3, false);

  // Opposite houses
  houses[4] = (houses[10] + 180) % 360; // 5th = opposite of 11th
  houses[5] = (houses[11] + 180) % 360; // 6th = opposite of 12th
  houses[7] = (houses[1] + 180) % 360;  // 8th = opposite of 2nd
  houses[8] = (houses[2] + 180) % 360;  // 9th = opposite of 3rd

  return houses;
}

// ────────────────────────────────────────────────────
// House placement
// ────────────────────────────────────────────────────
function getHouse(longitude: number, houses: number[]): number {
  const lon = ((longitude % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    const start = houses[i];
    const end = houses[(i + 1) % 12];
    if (start < end) {
      if (lon >= start && lon < end) return i + 1;
    } else {
      if (lon >= start || lon < end) return i + 1;
    }
  }
  return 1;
}

// ────────────────────────────────────────────────────
// Turkey timezone offset (handles DST history)
// ────────────────────────────────────────────────────
export function getTurkeyUTCOffset(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // After October 30, 2016: permanent UTC+3
  if (year > 2016 || (year === 2016 && (month > 10 || (month === 10 && day >= 30)))) {
    return 3;
  }

  // Before 2016: EET (UTC+2), EEST (UTC+3) with DST
  // DST was last Sunday of March to last Sunday of October
  // Approximate: April-October = +3, otherwise +2
  if (month >= 4 && month <= 10) {
    return 3; // Summer time (EEST)
  }
  if (month === 3 && day >= 25) {
    return 3; // Late March (approximate)
  }
  return 2; // Winter time (EET)
}

// ────────────────────────────────────────────────────
// General UTC offset estimation based on longitude
// (fallback when we don't know the exact timezone)
// ────────────────────────────────────────────────────
export function estimateUTCOffset(lat: number, lon: number, date: Date): number {
  // Check if it's Turkey (lat 36-42, lon 26-45)
  if (lat >= 36 && lat <= 42 && lon >= 26 && lon <= 45) {
    return getTurkeyUTCOffset(date);
  }
  // Rough estimation for other locations
  return Math.round(lon / 15);
}

// ────────────────────────────────────────────────────
// DMS formatting
// ────────────────────────────────────────────────────
function degreeToDMS(deg: number): string {
  const d = Math.floor(deg);
  const mf = (deg - d) * 60;
  const m = Math.floor(mf);
  const s = Math.round((mf - m) * 60);
  return `${d}° ${m.toString().padStart(2, "0")}' ${s.toString().padStart(2, "0")}"`;
}

// ────────────────────────────────────────────────────
// Additional celestial bodies
// ────────────────────────────────────────────────────
function calculateMeanLilith(date: Date): number {
  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525.0;
  let lilith = 181.0 + (1732559343.7306 * T / 3600.0);
  return ((lilith % 360) + 360) % 360;
}

function calculateChiron(date: Date): number {
  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525.0;
  const meanLon = 248.7 + (360.0 / 50.76) * T * 100;
  return ((meanLon % 360) + 360) % 360;
}

function calculateNorthNode(date: Date): number {
  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525.0;
  let node = 125.0446 - 1934.13618 * T + 0.0020762 * T * T;
  return ((node % 360) + 360) % 360;
}

function calculateVertex(lstDeg: number, latDeg: number, oblDeg: number): number {
  const oblRad = oblDeg * Math.PI / 180;
  const colatRad = (90 - latDeg) * Math.PI / 180;
  const lstRad = lstDeg * Math.PI / 180;
  // Vertex = ASC formula applied to colatitude
  const y = Math.cos(lstRad);
  const x = -(Math.sin(oblRad) * Math.tan(colatRad) + Math.cos(oblRad) * Math.sin(lstRad));
  let vertex = Math.atan2(y, x) * 180 / Math.PI;
  return ((vertex % 360) + 360) % 360;
}

// ────────────────────────────────────────────────────
// Exported types
// ────────────────────────────────────────────────────
export interface PlanetPosition {
  name: string;
  longitude: number;
  sign: string;
  degreeInSign: number;
  symbol: string;
  house: number;
  dms: string;
}

export interface NatalChartData {
  planets: PlanetPosition[];
  houses: number[];
  ascendant: number;
  ascendantSign: string;
  midheaven: number;
  midheavenSign: string;
}

// ────────────────────────────────────────────────────
// Main calculation entry point
// ────────────────────────────────────────────────────
export function calculateNatalChart(
  dateOfBirth: string,
  birthTime: string | null,
  lat: number,
  lon: number
): NatalChartData {
  // Build the local date
  const dob = new Date(dateOfBirth);
  let hour = 12, minute = 0;
  if (birthTime) {
    const parts = birthTime.split(":");
    hour = parseInt(parts[0], 10);
    minute = parseInt(parts[1], 10);
  }

  // Create a date object representing local birth time
  const localDate = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate(), hour, minute, 0, 0);

  // Convert local time → UTC using timezone estimation
  const utcOffset = estimateUTCOffset(lat, lon, localDate);
  const utcDate = new Date(localDate.getTime() - utcOffset * 3600000);

  // Julian Date for obliquity
  const jd = getJulianDate(utcDate);
  const obliquity = getObliquity(jd);

  // Local Sidereal Time (in degrees)
  const gast = Astronomy.SiderealTime(utcDate); // in hours
  const lstDeg = ((gast * 15) + lon + 360) % 360;

  // MC and ASC
  const mc = calculateMC(lstDeg, obliquity);
  const ascendant = calculateAscendant(lstDeg, lat, obliquity);

  // Placidus house cusps
  const houses = calculatePlacidusHouses(lstDeg, lat, obliquity, ascendant, mc);

  // Standard planets via astronomy-engine
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
    const eclLon = getEclipticLongitude(body, utcDate);
    const sign = longitudeToSign(eclLon);
    const idx = ZODIAC_SIGNS.indexOf(sign);
    const degInSign = longitudeToDegreeInSign(eclLon);
    return {
      name,
      longitude: eclLon,
      sign,
      degreeInSign: Math.round(degInSign * 100) / 100,
      symbol: SIGN_SYMBOLS[idx],
      house: getHouse(eclLon, houses),
      dms: degreeToDMS(degInSign),
    };
  });

  // Chiron
  const chironLon = calculateChiron(utcDate);
  const chironSign = longitudeToSign(chironLon);
  planets.push({
    name: "Chiron",
    longitude: chironLon,
    sign: chironSign,
    degreeInSign: Math.round(longitudeToDegreeInSign(chironLon) * 100) / 100,
    symbol: "⚷",
    house: getHouse(chironLon, houses),
    dms: degreeToDMS(longitudeToDegreeInSign(chironLon)),
  });

  // Mean Lilith (Black Moon)
  const lilithLon = calculateMeanLilith(utcDate);
  const lilithSign = longitudeToSign(lilithLon);
  planets.push({
    name: "Lilith",
    longitude: lilithLon,
    sign: lilithSign,
    degreeInSign: Math.round(longitudeToDegreeInSign(lilithLon) * 100) / 100,
    symbol: "⚸",
    house: getHouse(lilithLon, houses),
    dms: degreeToDMS(longitudeToDegreeInSign(lilithLon)),
  });

  // North Node
  const nnLon = calculateNorthNode(utcDate);
  const nnSign = longitudeToSign(nnLon);
  planets.push({
    name: "NorthNode",
    longitude: nnLon,
    sign: nnSign,
    degreeInSign: Math.round(longitudeToDegreeInSign(nnLon) * 100) / 100,
    symbol: "☊",
    house: getHouse(nnLon, houses),
    dms: degreeToDMS(longitudeToDegreeInSign(nnLon)),
  });

  // South Node
  const snLon = (nnLon + 180) % 360;
  const snSign = longitudeToSign(snLon);
  planets.push({
    name: "SouthNode",
    longitude: snLon,
    sign: snSign,
    degreeInSign: Math.round(longitudeToDegreeInSign(snLon) * 100) / 100,
    symbol: "☋",
    house: getHouse(snLon, houses),
    dms: degreeToDMS(longitudeToDegreeInSign(snLon)),
  });

  // Vertex
  const vertexLon = calculateVertex(lstDeg, lat, obliquity);
  const vertexSign = longitudeToSign(vertexLon);
  planets.push({
    name: "Vertex",
    longitude: vertexLon,
    sign: vertexSign,
    degreeInSign: Math.round(longitudeToDegreeInSign(vertexLon) * 100) / 100,
    symbol: "Vx",
    house: getHouse(vertexLon, houses),
    dms: degreeToDMS(longitudeToDegreeInSign(vertexLon)),
  });

  // MC entry
  const mcSign = longitudeToSign(mc);
  const mcIdx = ZODIAC_SIGNS.indexOf(mcSign);
  planets.push({
    name: "MC",
    longitude: mc,
    sign: mcSign,
    degreeInSign: Math.round(longitudeToDegreeInSign(mc) * 100) / 100,
    symbol: SIGN_SYMBOLS[mcIdx],
    house: 10,
    dms: degreeToDMS(longitudeToDegreeInSign(mc)),
  });

  // Ascendant entry (first in list)
  const ascendantSign = longitudeToSign(ascendant);
  const ascIdx = ZODIAC_SIGNS.indexOf(ascendantSign);
  planets.unshift({
    name: "Ascendant",
    longitude: ascendant,
    sign: ascendantSign,
    degreeInSign: Math.round(longitudeToDegreeInSign(ascendant) * 100) / 100,
    symbol: SIGN_SYMBOLS[ascIdx],
    house: 1,
    dms: degreeToDMS(longitudeToDegreeInSign(ascendant)),
  });

  return {
    planets,
    houses,
    ascendant,
    ascendantSign,
    midheaven: mc,
    midheavenSign: longitudeToSign(mc),
  };
}

export { ZODIAC_SIGNS, SIGN_SYMBOLS, degreeToDMS, longitudeToSign, longitudeToDegreeInSign, getHouse };
