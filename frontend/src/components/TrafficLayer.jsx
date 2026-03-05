import { Polyline } from "react-leaflet";

const COLOR_MAP = {
  red:    "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green:  "#22c55e",
  black:  "#34373c",
};

export default function TrafficLayer({ segments, onSegmentClick }) {
  if (!Array.isArray(segments) || segments.length === 0) return null;

  return (
    <>
      {segments.map((segment) => {
        if (!segment?.coordinates) return null;

        const latLngs = segment.coordinates.map(([lon, lat]) => [lat, lon]);
        const color = COLOR_MAP[segment.color] ?? COLOR_MAP.green;
        const isClickable = segment.color !== "green" && segment.info;

        return (
          <Polyline
            key={segment.id}
            positions={latLngs}
            pathOptions={{
              color,
              weight: isClickable ? 7 : 5,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }}
            eventHandlers={
              isClickable
                ? {
                    click: () => onSegmentClick(segment),
                    mouseover: (e) => e.target.setStyle({ weight: 10, opacity: 1 }),
                    mouseout:  (e) => e.target.setStyle({ weight: 7, opacity: 0.9 }),
                  }
                : {}
            }
          />
        );
      })}
    </>
  );
}
