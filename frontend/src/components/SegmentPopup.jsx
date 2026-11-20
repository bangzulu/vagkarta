import { useEffect, useRef } from "react";
import { conditionFor, formatKm } from "../conditions";
import WarningSign from "./WarningSign";

export default function SegmentPopup({ stretch, totalKm, onClose, scheme }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stretch, onClose]);

  if (!stretch?.info) return null;

  const { info } = stretch;
  const cond = conditionFor(stretch.color, scheme);

  const description =
    info.conditionInfo?.length > 0 ? info.conditionInfo.join(", ") : info.conditionText;
  const place = [info.roadNumber, info.locationText].filter(Boolean).join(", ");
  const warnings = info.warning ?? [];
  const measures = info.measure?.length > 0 ? info.measure.join(", ") : null;

  return (
    <div className="segment-popup" role="dialog" aria-labelledby="popup-title">
      <div className="popup-head">
        <span className="line-swatch" style={{ "--c": cond.color }} aria-hidden="true" />
        <h3 id="popup-title">{cond.label}</h3>
        <button ref={closeRef} className="popup-close" onClick={onClose} aria-label="Stäng">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {place && <p className="popup-place">{place}</p>}
      <p className="popup-km">
        Vid {formatKm(stretch.startKm, totalKm)}–{formatKm(stretch.endKm, totalKm)} km av{" "}
        {formatKm(totalKm)}
      </p>

      {description && <p className="popup-desc">{description}</p>}

      {warnings.length > 0 && (
        <ul className="popup-warnings">
          {warnings.map((w, i) => (
            <li key={i}>
              <WarningSign size={16} />
              {w}
            </li>
          ))}
        </ul>
      )}

      {measures && <p className="popup-measure">Åtgärd: {measures}</p>}

      {(info.modifiedTime || info.startTime) && (
        <dl className="popup-meta">
          {info.modifiedTime && (
            <div>
              <dt>Uppdaterat</dt>
              <dd>{info.modifiedTime}</dd>
            </div>
          )}
          {info.startTime && (
            <div>
              <dt>Gäller</dt>
              <dd>
                {info.startTime}
                {info.endTime ? ` till ${info.endTime}` : ""}
              </dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}
