import { conditionFor, formatKm } from "../conditions";

// Rutten uträtad till en linje från start till mål, och varningarna i ordning längs den.
export default function RouteSummary({ segments, stretches, activeStretch, onSelect }) {
  const total = segments.at(-1)?.endKm ?? 0;
  const covered = segments
    .filter((s) => s.color !== "black")
    .reduce((sum, s) => sum + s.lengthKm, 0);
  const coverage = total > 0 ? Math.round((covered / total) * 100) : 0;

  return (
    <section className="route-summary" aria-labelledby="route-summary-title">
      <div className="summary-head">
        <h2 id="route-summary-title">Längs vägen</h2>
        <span className="summary-total">{formatKm(total)} km</span>
      </div>

      <div
        className="strip"
        role="img"
        aria-label={`Rutten från start till mål, ${formatKm(total)} km, färgad efter väglag`}
      >
        {segments.map((s) => (
          <span
            key={s.id}
            className="strip-part"
            style={{ flexGrow: s.lengthKm, background: conditionFor(s.color).color }}
          />
        ))}
      </div>
      <div className="strip-ends" aria-hidden="true">
        <span>Start</span>
        <span>Mål</span>
      </div>

      <p className="coverage">
        {coverage === 0
          ? "Trafikverket har inga väglagsuppgifter för den här sträckan just nu."
          : `Trafikverket har uppgifter för ${coverage} % av sträckan.`}
      </p>

      {stretches.length > 0 ? (
        <ol className="stretches">
          {stretches.map((st) => {
            const cond = conditionFor(st.color);
            const place = [st.info?.roadNumber, st.info?.locationText]
              .filter(Boolean)
              .join(", ");
            const active = activeStretch?.id === st.id;
            return (
              <li key={st.id}>
                <button
                  type="button"
                  className={`stretch${active ? " is-active" : ""}`}
                  style={{ "--c": cond.color }}
                  aria-pressed={active}
                  onClick={() => onSelect(active ? null : st)}
                >
                  <span className="stretch-km">
                    {formatKm(st.startKm, total)}–{formatKm(st.endKm, total)} km
                  </span>
                  <span className="stretch-mark" aria-hidden="true" />
                  <span className="stretch-text">
                    <span className="stretch-label">{cond.label}</span>
                    {place && <span className="stretch-place">{place}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      ) : (
        coverage > 0 && <p className="all-clear">Inga varningar längs rutten just nu.</p>
      )}
    </section>
  );
}
