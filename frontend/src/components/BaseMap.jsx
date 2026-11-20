import { Pane, TileLayer } from "react-leaflet";

const ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>';

// CARTO Positron (ljus) och Dark Matter (mörk): få detaljer, en gråskala.
// Ortnamnen ligger i ett eget lager under rutten så de aldrig täcker väglaget.
export default function BaseMap({ scheme }) {
  const style = scheme === "dark" ? "dark" : "light";
  const url = (layer) => `https://{s}.basemaps.cartocdn.com/${style}_${layer}/{z}/{x}/{y}{r}.png`;

  return (
    <>
      <TileLayer key={`${style}-base`} url={url("nolabels")} attribution={ATTRIBUTION} subdomains="abcd" maxZoom={19} />
      <Pane name="labels" style={{ zIndex: 350, pointerEvents: "none" }}>
        <TileLayer key={`${style}-labels`} url={url("only_labels")} subdomains="abcd" maxZoom={19} opacity={0.85} />
      </Pane>
    </>
  );
}
