import { TileLayer } from "react-leaflet";

// OpenStreetMaps vanliga karta. Utseendet (gråskala, mörkt läge, dämpade detaljer)
// styrs med CSS-filter på .leaflet-tile-pane i App.css – ingen API-nyckel behövs.
export default function BaseMap() {
  return (
    <TileLayer
      attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      maxZoom={19}
    />
  );
}
