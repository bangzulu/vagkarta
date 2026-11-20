// En enda källa för hur varje väglag ser ut och heter.
// Nycklarna matchar det backend skickar (utils/colorRoute.js).
// `dark` är ljusare toner som syns mot den mörka kartan.
export const CONDITIONS = {
  green:  { label: "Normalt",                    color: "#3C8D5A", dark: "#4FBF78", warning: false },
  yellow: { label: "Risk för besvärligt väglag", color: "#E5A100", dark: "#F5BE2A", warning: true },
  red:    { label: "Besvärligt väglag",          color: "#C8102E", dark: "#F04A5C", warning: true },
  blue:   { label: "Is- och snövägbana",         color: "#2E68B1", dark: "#5A9BEA", warning: true },
  black:  { label: "Ingen uppgift",              color: "#A7ACB1", dark: "#9AA0A6", warning: false },
};

export const LEGEND_ORDER = ["green", "yellow", "red", "blue", "black"];

export function conditionFor(key, scheme = "light") {
  const c = CONDITIONS[key] ?? CONDITIONS.black;
  return scheme === "dark" ? { ...c, color: c.dark } : c;
}

// ── Avstånd ──

function haversineKm([lon1, lat1], [lon2, lat2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function lengthKm(coords) {
  let sum = 0;
  for (let i = 1; i < coords.length; i++) sum += haversineKm(coords[i - 1], coords[i]);
  return sum;
}

// Lägger till startKm/endKm/lengthKm på varje segment.
export function withDistances(segments) {
  let acc = 0;
  return segments.map((s) => {
    const len = lengthKm(s.coordinates ?? []);
    const out = { ...s, startKm: acc, endKm: acc + len, lengthKm: len };
    acc += len;
    return out;
  });
}

// Slår ihop varningssegment som hör ihop (samma väglag och plats,
// med högst 1 km glapp) så listan inte splittras i småbitar.
export function warningStretches(segments) {
  const out = [];
  for (const s of segments) {
    if (!conditionFor(s.color).warning) continue;
    const prev = out[out.length - 1];
    const samePlace =
      prev &&
      prev.color === s.color &&
      prev.info?.roadNumber === s.info?.roadNumber &&
      prev.info?.locationText === s.info?.locationText &&
      s.startKm - prev.endKm < 1;
    if (samePlace) {
      prev.endKm = s.endKm;
      prev.segmentIds.push(s.id);
    } else {
      out.push({ ...s, segmentIds: [s.id] });
    }
  }
  return out;
}

const kmFormat = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 });
const kmFormatFine = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 1 });

export function formatKm(km, total = km) {
  return (total < 20 ? kmFormatFine : kmFormat).format(km);
}
