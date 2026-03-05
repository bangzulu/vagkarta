const COLOR_META = {
  red:    { dot: "#ef4444", label: "Mycket besvärligt", bg: "#2a1215", border: "#7f1d1d" },
  orange: { dot: "#f97316", label: "Besvärligt",        bg: "#2a1a0e", border: "#7c2d12" },
  yellow: { dot: "#eab308", label: "Något besvärligt",  bg: "#2a2008", border: "#78350f" },
  green:  { dot: "#22c55e", label: "Normalt",           bg: "#0f2a18", border: "#14532d" },
};

export default function SegmentPopup({ segment, onClose }) {
  if (!segment?.info) return null;

  const { info, color } = segment;
  const meta = COLOR_META[color] ?? COLOR_META.green;

  // Bästa tillgängliga beskrivning
  const description =
    info.conditionInfo?.length > 0
      ? info.conditionInfo.join(", ")
      : info.conditionText;

  const warnings = info.warning?.length > 0 ? info.warning : [];
  const measures = info.measure?.length > 0 ? info.measure.join(" / ") : null;

  return (
    <div style={{
      position: "absolute",
      bottom: 24,
      left: "50%",
      transform: "translateX(-50%)",
      width: "min(440px, calc(100vw - 48px))",
      background: "#161b27",
      border: `1px solid ${meta.border}`,
      borderRadius: 12,
      padding: "16px 18px",
      zIndex: 1000,
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      cursor: "default",
    }}>

      {/* Header: färgprick + status + stäng */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 14, height: 14, borderRadius: "50%",
            background: meta.dot, flexShrink: 0, display: "inline-block",
          }} />
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e8edf5" }}>
            {meta.label}
          </span>
        </div>
        <button onClick={onClose} style={{
          background: "none", border: "none", color: "#6b7a99",
          fontSize: "1.1rem", cursor: "pointer", lineHeight: 1, padding: "0 2px",
        }}>✕</button>
      </div>

      {/* Vägnummer + sträcka */}
      {(info.roadNumber || info.locationText) && (
        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#e8edf5", marginBottom: 8 }}>
          {[info.roadNumber, info.locationText].filter(Boolean).join(" – ")}
        </div>
      )}

      {/* Väglagsbeskrivning */}
      {description && (
        <div style={{
          fontSize: "0.85rem", color: "#c0c8d8",
          marginBottom: 10, lineHeight: 1.5,
        }}>
          {description}
        </div>
      )}

      {/* Varningar som pills */}
      {warnings.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {warnings.map((w, i) => (
            <span key={i} style={{
              background: meta.bg,
              border: `1px solid ${meta.border}`,
              borderRadius: 6,
              padding: "3px 10px",
              fontSize: "0.78rem",
              color: "#e8edf5",
              fontWeight: 600,
            }}>
              {w}
            </span>
          ))}
        </div>
      )}

      {/* Åtgärd */}
      {measures && (
        <div style={{
          background: "#1e2535",
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: "0.82rem",
          color: "#e8edf5",
          marginBottom: 12,
          fontWeight: 500,
        }}>
          {measures}
        </div>
      )}

      {/* Meta-rad: uppdaterat + giltighetstid */}
      <div style={{
        borderTop: "1px solid #252d3d",
        paddingTop: 10,
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        rowGap: 4,
        columnGap: 12,
        fontSize: "0.78rem",
      }}>
        {info.modifiedTime && (
          <>
            <span style={{ fontWeight: 600, color: "#8b9ab8" }}>Uppdaterat</span>
            <span style={{ color: "#c0c8d8" }}>{info.modifiedTime}</span>
          </>
        )}
        {info.startTime && (
          <>
            <span style={{ fontWeight: 600, color: "#8b9ab8" }}>Gäller</span>
            <span style={{ color: "#c0c8d8" }}>
              {info.startTime}{info.endTime ? ` – ${info.endTime}` : ""}
            </span>
          </>
        )}
      </div>

    </div>
  );
}
