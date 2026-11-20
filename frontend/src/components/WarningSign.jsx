// Liten varningstriangel i svensk vägmärkesstil: gul yta, röd kant.
export default function WarningSign({ size = 18, className = "" }) {
  return (
    <svg
      className={`warning-sign ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 22"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 2.2 L22.3 20 H1.7 Z"
        fill="#F6B40E"
        stroke="#C8102E"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <rect x="10.9" y="8" width="2.2" height="7.6" rx="0.6" fill="#1F2225" />
    </svg>
  );
}
