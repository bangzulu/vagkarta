import { useEffect } from "react";
import { useMap } from "react-leaflet";

// Zoomar till en vald sträcka när den väljs i listan.
export default function FocusSegment({ stretch, segments }) {
  const map = useMap();

  useEffect(() => {
    if (!stretch) return;
    const coords = segments
      .filter((s) => stretch.segmentIds.includes(s.id))
      .flatMap((s) => s.coordinates);
    if (!coords.length) return;

    const lats = coords.map(([, lat]) => lat);
    const lons = coords.map(([lon]) => lon);
    map.flyToBounds(
      [
        [Math.min(...lats), Math.min(...lons)],
        [Math.max(...lats), Math.max(...lons)],
      ],
      {
        padding: [80, 80],
        maxZoom: 13,
        duration: 0.6,
        animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      }
    );
  }, [stretch, segments, map]);

  return null;
}
