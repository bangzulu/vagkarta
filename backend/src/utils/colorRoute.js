import * as turf from "@turf/turf";

const MAX_DISTANCE_KM = 0.08;

function mapConditionCodeToColor(code) {
  const n = Number(code);
  switch (n) {
    case 4: return "blue";
    case 3: return "red";
    case 2: return "yellow";
    case 1: return "green";
    default: return "black";
  }
}

export function colorRoute(route, roadConditions = []) {
  if (!route || !route.geometry?.coordinates) return [];

  const coords = route.geometry.coordinates;
  const n = coords.length;

  const pointColors = new Array(n).fill("black");
  const pointInfo   = new Array(n).fill(null);

  for (const condition of roadConditions) {
    const geom = condition?.geometry;
    if (!geom) continue;

    const color = mapConditionCodeToColor(condition.ConditionCode);
    const info  = condition.info ?? null;

    let buffered;
    try {
      buffered = turf.buffer(
        { type: "Feature", geometry: geom, properties: {} },
        MAX_DISTANCE_KM,
        { units: "kilometers" }
      );
    } catch {
      continue;
    }

    for (let i = 0; i < n; i++) {
      if (pointColors[i] === "red") continue;
      if (pointColors[i] === "orange" && color !== "red") continue;
      if (pointColors[i] === "yellow" && color === "yellow") continue;

      try {
        if (turf.booleanPointInPolygon(turf.point(coords[i]), buffered)) {
          pointColors[i] = color;
          pointInfo[i]   = info;
        }
      } catch {
        // ignorera enskilda fel
      }
    }
  }

  const segments = [];
  let segStart = 0;
  let segColor = pointColors[0];
  let segInfo  = pointInfo[0];

  for (let i = 1; i <= n - 1; i++) {
    const last = i === n - 1;
    if (pointColors[i] !== segColor || last) {
      segments.push({
        id:          segments.length,
        color:       segColor,
        info:        segInfo,
        coordinates: coords.slice(segStart, i + 1),
      });
      segStart = i;
      segColor = pointColors[i];
      segInfo  = pointInfo[i];
    }
  }

  const nonDefault = segments.filter(s => s.color !== "black").length;
  console.log(`✅ ${segments.length} segment (${nonDefault} med trafikproblem)`);
  return segments;
}
