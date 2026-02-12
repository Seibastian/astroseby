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

export interface PlanetPosition {
  name: string;
  longitude: number;
  sign: string;
  degreeInSign: number;
  symbol: string;
}

export interface NatalChartData {
  planets: PlanetPosition[];
  houses: number[];
  ascendant: number;
  ascendantSign: string;
  midheaven: number;
  midheavenSign: string;
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
    const lon = getEclipticLongitude(body, dob);
    const sign = longitudeToSign(lon);
    const idx = ZODIAC_SIGNS.indexOf(sign);
    return {
      name,
      longitude: lon,
      sign,
      degreeInSign: Math.round(longitudeToDegreeInSign(lon) * 10) / 10,
      symbol: SIGN_SYMBOLS[idx],
    };
  });

  const ascendant = calculateAscendant(dob, lat, lon);
  const ascendantSign = longitudeToSign(ascendant);
  const ascIdx = ZODIAC_SIGNS.indexOf(ascendantSign);
  planets.unshift({
    name: "Ascendant",
    longitude: ascendant,
    sign: ascendantSign,
    degreeInSign: Math.round(longitudeToDegreeInSign(ascendant) * 10) / 10,
    symbol: SIGN_SYMBOLS[ascIdx],
  });

  const midheaven = (ascendant + 270) % 360;
  const midheavenSign = longitudeToSign(midheaven);
  const houses = calculateHouses(ascendant);

  return { planets, houses, ascendant, ascendantSign, midheaven, midheavenSign };
}

export { ZODIAC_SIGNS, SIGN_SYMBOLS };
