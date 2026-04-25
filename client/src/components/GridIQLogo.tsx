interface GridIQLogoProps {
  size?: number;
  className?: string;
}

/**
 * GridIQ Logo — A football field/analytics hybrid mark.
 * Three rising bars on a dark shield, connected by a rising trend line
 * with a golden dot accent on top. Reads as: data + football.
 */
export default function GridIQLogo({ size = 40, className = "" }: GridIQLogoProps) {
  return (
    <svg
      aria-label="GridIQ"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield / badge shape */}
      <path
        d="M24 3L5 10v16c0 10.5 8.5 17.5 19 19 10.5-1.5 19-8.5 19-19V10L24 3z"
        fill="#0F2A1E"
        stroke="#10B981"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Subtle inner field lines */}
      <line x1="14" y1="40" x2="14" y2="18" stroke="#10B981" strokeWidth="0.4" strokeOpacity="0.25" />
      <line x1="24" y1="43" x2="24" y2="14" stroke="#10B981" strokeWidth="0.4" strokeOpacity="0.25" />
      <line x1="34" y1="40" x2="34" y2="18" stroke="#10B981" strokeWidth="0.4" strokeOpacity="0.25" />

      {/* Bar chart — three rising bars */}
      <rect x="11" y="27" width="6" height="12" rx="1.5" fill="#10B981" opacity="0.7" />
      <rect x="21" y="21" width="6" height="18" rx="1.5" fill="#10B981" opacity="0.85" />
      <rect x="31" y="14" width="6" height="25" rx="1.5" fill="#10B981" />

      {/* Trend line connecting tops of bars */}
      <polyline
        points="14,26 24,20 37,13"
        stroke="#FBBF24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Gold dots on trend line */}
      <circle cx="14" cy="26" r="2.2" fill="#FBBF24" />
      <circle cx="24" cy="20" r="2.2" fill="#FBBF24" />
      <circle cx="37" cy="13" r="2.8" fill="#FBBF24" />

      {/* Glint on the top dot */}
      <circle cx="38.2" cy="11.8" r="1" fill="white" opacity="0.7" />
    </svg>
  );
}
