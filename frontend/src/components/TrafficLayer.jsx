import { Fragment } from "react";
import { Polyline } from "react-leaflet";
import { conditionFor } from "../conditions";

// Ritar rutten som en väg på en karta: mörk kantlinje under, väglagsfärg ovanpå.
export default function TrafficLayer({ segments, activeIds = [], onSegmentClick, scheme }) {
  if (!Array.isArray(segments) || segments.length === 0) return null;

  return (
    <>
      {segments.map((segment) => {
        if (!segment?.coordinates) return null;

        const latLngs = segment.coordinates.map(([lon, lat]) => [lat, lon]);
        const { color, warning } = conditionFor(segment.color, scheme);
        const clickable = warning && segment.info;
        const active = activeIds.includes(segment.id);
        const weight = active ? 9 : clickable ? 6 : 4;

        const handlers = clickable
          ? {
              click: () => onSegmentClick(segment),
              mouseover: (e) => e.target.setStyle({ weight: weight + 2 }),
              mouseout: (e) => e.target.setStyle({ weight }),
            }
          : {};

        return (
          <Fragment key={segment.id}>
            <Polyline
              positions={latLngs}
              interactive={false}
              pathOptions={{
                color: scheme === "dark" ? "#000000" : "#2A2D30",
                weight: weight + 3,
                opacity: scheme === "dark" ? 0.8 : active ? 0.9 : 0.55,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <Polyline
              positions={latLngs}
              pathOptions={{
                color,
                weight,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
                className: clickable ? "route-line is-clickable" : "route-line",
              }}
              eventHandlers={handlers}
            />
          </Fragment>
        );
      })}
    </>
  );
}
