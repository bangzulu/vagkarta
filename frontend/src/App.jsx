import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { checkRoute } from "./services/api";
import TrafficLayer from "./components/TrafficLayer";
import AddressSearch from "./components/AddressSearch";
import FitBounds from "./components/FitBounds";
import SegmentPopup from "./components/SegmentPopup";
import "./App.css";

export default function App() {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [segments, setSegments] = useState([]);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSegment, setActiveSegment] = useState(null);

  async function search() {
    if (!from || !to) {
      setError("Välj både från- och till-adress.");
      return;
    }

    setLoading(true);
    setError(null);
    setSegments([]);
    setRoute(null);
    setActiveSegment(null);

    try {
      const result = await checkRoute(from, to);
      setSegments(result.segments ?? []);
      setRoute(result.route ?? null);
    } catch (err) {
      console.error("Route check failed:", err);
      setError("Kunde inte hämta rutten. Kontrollera att backend och OSRM kör.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Hur är vägen?</h1>
          <p className="subtitle">Kolla vägförhållanden längs din rutt</p>
        </div>

        <div className="search-section">
          <AddressSearch label="Från" onSelect={setFrom} />
          <div className="route-arrow">↓</div>
          <AddressSearch label="Till" onSelect={setTo} />
        </div>

        <button
          className={`search-btn ${loading ? "loading" : ""}`}
          onClick={search}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Hämtar rutt…
            </>
          ) : (
            "Sök rutt"
          )}
        </button>

        {error && (
          <div className="error-box">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {segments.length > 0 && !loading && (
          <div className="legend">
            <p className="legend-title">Vägförhållanden</p>
            <div className="legend-item"><span className="dot green" />Normalt</div>
            <div className="legend-item"><span className="dot yellow" />Risk för besvärlig väglag</div>
            <div className="legend-item"><span className="dot red" />Besvärligt väglag</div>
            <div className="legend-item"><span className="dot blue" />Snö och isvägbana</div>
            <div className="legend-item"><span className="dot black" />Ingen data</div>
            <p className="legend-hint">Klicka på en markerad sträcka för mer info</p>
          </div>
        )}
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={[62.0, 15.0]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <TrafficLayer
            segments={segments}
            onSegmentClick={setActiveSegment}
          />
          {route && <FitBounds route={route} />}
        </MapContainer>

        {activeSegment && (
          <SegmentPopup
            segment={activeSegment}
            onClose={() => setActiveSegment(null)}
          />
        )}
      </div>
    </div>
  );
}
