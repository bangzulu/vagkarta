import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function FitBounds({ route }) {
  const map = useMap();

  useEffect(() => {
    if (!route?.geometry?.coordinates?.length) return;

    const coords = route.geometry.coordinates;

    // Find bounding box
    let minLat = Infinity, maxLat = -Infinity;
    let minLon = Infinity, maxLon = -Infinity;

    for (const [lon, lat] of coords) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
    }

    map.fitBounds(
      [
        [minLat, minLon],
        [maxLat, maxLon],
      ],
      { padding: [40, 40], maxZoom: 14 }
    );
  }, [route, map]);

  return null;
}
