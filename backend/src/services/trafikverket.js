import axios from "axios";
import * as turf from "@turf/turf";
import { XMLParser } from "fast-xml-parser";

const API_URL = "https://api.trafikinfo.trafikverket.se/v2/data.xml";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "_",
  isArray: (name) =>
    ["RoadCondition", "Cause", "ConditionInfo", "Measure", "Warning", "CountyNo"].includes(name),
});

function buildXmlRequest(API_KEY) {
  return `
<REQUEST>
  <LOGIN authenticationkey="${API_KEY}" />
  <QUERY objecttype="RoadCondition" namespace="road.trafficinfo" schemaversion="1.3">
    <INCLUDE>Id</INCLUDE>
    <INCLUDE>ConditionCode</INCLUDE>
    <INCLUDE>ConditionText</INCLUDE>
    <INCLUDE>ConditionInfo</INCLUDE>
    <INCLUDE>RoadNumber</INCLUDE>
    <INCLUDE>LocationText</INCLUDE>
    <INCLUDE>Cause</INCLUDE>
    <INCLUDE>Measure</INCLUDE>
    <INCLUDE>Warning</INCLUDE>
    <INCLUDE>StartTime</INCLUDE>
    <INCLUDE>EndTime</INCLUDE>
    <INCLUDE>ModifiedTime</INCLUDE>
    <INCLUDE>Geometry.WGS84</INCLUDE>
  </QUERY>
</REQUEST>
`;
}

function wktToGeoJSON(wkt) {
  if (!wkt || typeof wkt !== "string") return null;
  const str = wkt.trim();
  try {
    if (str.startsWith("LINESTRING")) {
      const inner = str.replace(/^LINESTRING\s*\(/, "").replace(/\)$/, "");
      return {
        type: "LineString",
        coordinates: inner.split(",").map((pair) => {
          const [lon, lat] = pair.trim().split(/\s+/).map(Number);
          return [lon, lat];
        }),
      };
    }
    if (str.startsWith("POINT")) {
      const inner = str.replace(/^POINT\s*\(/, "").replace(/\)$/, "");
      const [lon, lat] = inner.trim().split(/\s+/).map(Number);
      return { type: "Point", coordinates: [lon, lat] };
    }
    if (str.startsWith("MULTILINESTRING")) {
      const inner = str.replace(/^MULTILINESTRING\s*\(\(/, "").replace(/\)\)$/, "");
      return {
        type: "MultiLineString",
        coordinates: inner.split("),(").map((line) =>
          line.split(",").map((pair) => {
            const [lon, lat] = pair.trim().split(/\s+/).map(Number);
            return [lon, lat];
          })
        ),
      };
    }
  } catch (err) {
    console.warn("⚠️ wktToGeoJSON misslyckades:", str.slice(0, 60), err.message);
  }
  return null;
}

function formatTime(isoString) {
  if (!isoString) return null;
  try {
    return new Date(isoString).toLocaleString("sv-SE", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  return [String(val)];
}

function normalizeCondition(raw) {
  return {
    geometry: wktToGeoJSON(raw?.Geometry?.WGS84),
    ConditionCode: raw?.ConditionCode ?? null,
    info: {
      conditionText: raw?.ConditionText ?? null,
      conditionInfo: toArray(raw?.ConditionInfo),
      roadNumber:    raw?.RoadNumber ?? null,
      locationText:  raw?.LocationText ?? null,
      cause:         toArray(raw?.Cause),
      measure:       toArray(raw?.Measure),
      warning:       toArray(raw?.Warning),
      startTime:     formatTime(raw?.StartTime),
      endTime:       formatTime(raw?.EndTime),
      modifiedTime:  formatTime(raw?.ModifiedTime),
    },
  };
}

export async function getTrafficConditions(bbox) {
  const API_KEY = process.env.TRAFIKVERKET_API_KEY;
  if (!API_KEY) throw new Error("TRAFIKVERKET_API_KEY saknas");

  let res;
  try {
    res = await axios.post(API_URL, buildXmlRequest(API_KEY), {
      headers: { "Content-Type": "text/xml" },
      responseType: "text",
    });
  } catch (err) {
    console.error("🔴 Trafikverket HTTP-fel:", err.response?.data?.slice(0, 300));
    throw err;
  }

  const parsed = xmlParser.parse(res.data);
  const raw = parsed?.RESPONSE?.RESULT?.RoadCondition;

  if (!raw) {
    console.warn("⚠️ Trafikverket: inga RoadConditions i svaret");
    return [];
  }

  const rawArray = Array.isArray(raw) ? raw : [raw];
  console.log(`📡 Trafikverket: ${rawArray.length} RoadConditions hämtade`);

  const normalized = rawArray.map(normalizeCondition).filter((r) => r.geometry !== null);
  console.log(`📐 ${normalized.length} hade giltig geometri`);

  if (!bbox) return normalized;

  const bboxPolygon = turf.bboxPolygon([bbox.minX, bbox.minY, bbox.maxX, bbox.maxY]);
  const filtered = normalized.filter((r) => {
    try {
      return turf.booleanIntersects(bboxPolygon, {
        type: "Feature", geometry: r.geometry, properties: {},
      });
    } catch {
      return false;
    }
  });

  console.log(`🗺️ ${filtered.length} inom bbox`);
  return filtered;
}
