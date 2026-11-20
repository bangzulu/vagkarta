import { useMemo, useState, useCallback } from "react";
import { MapContainer } from "react-leaflet";
import { checkRoute } from "./services/api";
import TrafficLayer from "./components/TrafficLayer";
import AddressSearch from "./components/AddressSearch";
import FitBounds from "./components/FitBounds";
import FocusSegment from "./components/FocusSegment";
import SegmentPopup from "./components/SegmentPopup";
import RouteSummary from "./components/RouteSummary";
import WarningSign from "./components/WarningSign";
import BaseMap from "./components/BaseMap";
import useColorScheme from "./useColorScheme";
import { LEGEND_ORDER, conditionFor, withDistances, warningStretches } from "./conditions";
import "./App.css";

function Legend({ scheme }) {
  return (
    <div className="legend">
      <h2 className="legend-title">Teckenförklaring</h2>
      <ul>
        {LEGEND_ORDER.map((key) => (
          <li key={key}>
            <span className="line-swatch" style={{ "--c": conditionFor(key, scheme).color }} />
            {conditionFor(key).label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  const scheme = useColorScheme();
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [rawSegments, setRawSegments] = useState([]);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeStretch, setActiveStretch] = useState(null);

  const segments = useMemo(() => withDistances(rawSegments), [rawSegments]);
  const stretches = useMemo(() => warningStretches(segments), [segments]);
  const totalKm = segments.at(-1)?.endKm ?? 0;

  async function search(e) {
    e.preventDefault();
    if (!from || !to) {
      setError("Välj både start och mål i förslagslistan.");
      return;
    }

    setLoading(true);
    setError(null);
    setRawSegments([]);
    setRoute(null);
    setActiveStretch(null);

    try {
      const result = await checkRoute(from, to);
      setRawSegments(result.segments ?? []);
      setRoute(result.route ?? null);
    } catch (err) {
      console.error("Route check failed:", err);
      setError("Rutten gick inte att hämta. Kontrollera att backend kör och försök igen.");
    } finally {
      setLoading(false);
    }
  }

  const selectFromMap = useCallback(
    (segment) => setActiveStretch(stretches.find((st) => st.segmentIds.includes(segment.id)) ?? null),
    [stretches]
  );
  const closePopup = useCallback(() => setActiveStretch(null), []);

  const hasRoute = segments.length > 0 && !loading;

  return (
    <div className="app">
      <header className="mobile-header">
        <h1>Hur är vägen?</h1>
      </header>

      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Hur är vägen?</h1>
          <p className="subtitle">Väglaget längs din rutt, direkt från Trafikverket.</p>
        </div>

        <form className="search-section" onSubmit={search}>
          <div className="stops">
            <AddressSearch label="Från" placeholder="Var startar du?" marker="start" onSelect={setFrom} />
            <AddressSearch label="Till" placeholder="Vart ska du?" marker="end" onSelect={setTo} />
          </div>

          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Hämtar väglag…
              </>
            ) : (
              "Visa väglaget"
            )}
          </button>
        </form>

        {error && (
          <p className="error" role="alert">
            <WarningSign size={18} />
            {error}
          </p>
        )}

        {hasRoute && (
          <RouteSummary
            segments={segments}
            stretches={stretches}
            activeStretch={activeStretch}
            onSelect={setActiveStretch}
            scheme={scheme}
          />
        )}

        <div className="desktop-legend">
          <Legend scheme={scheme} />
        </div>

        <footer className="sidebar-footer">
          <p>
            Data från <a href="https://data.trafikverket.se/documentation/datacache/data-model" target="_blank" rel="noreferrer">Trafikverkets öppna API</a>.
            Koden finns på <a href="https://github.com/bangzulu/vagkarta" target="_blank" rel="noreferrer">GitHub</a>.
          </p>
          <p className="signoff">Kör lugnt. /Oskar Z</p>
        </footer>
      </aside>

      <main className="map-wrapper">
        <MapContainer center={[62.0, 15.0]} zoom={5} style={{ height: "100%", width: "100%" }}>
          <BaseMap />
          <TrafficLayer
            segments={segments}
            activeIds={activeStretch?.segmentIds}
            onSegmentClick={selectFromMap}
            scheme={scheme}
          />
          {route && <FitBounds route={route} />}
          <FocusSegment stretch={activeStretch} segments={segments} />
        </MapContainer>

        {hasRoute && (
          <div className="map-legend">
            <Legend scheme={scheme} />
          </div>
        )}

        {activeStretch && (
          <SegmentPopup stretch={activeStretch} totalKm={totalKm} onClose={closePopup} scheme={scheme} />
        )}
      </main>
    </div>
  );
}
