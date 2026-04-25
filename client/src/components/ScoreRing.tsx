interface ScoreRingProps {
  score: number; // 0-100
  size?: number;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#10B981"; // emerald
  if (score >= 65) return "#60D394"; // green
  if (score >= 50) return "#FBBF24"; // yellow
  if (score >= 35) return "#F59E0B"; // amber
  return "#F87171";                  // red
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Elite";
  if (score >= 65) return "Great";
  if (score >= 50) return "Good";
  if (score >= 35) return "Avg";
  return "Low";
}

export default function ScoreRing({ score, size = 60 }: ScoreRingProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.3
  const progress = Math.min(100, Math.max(0, score));
  const offset = circumference - (progress / 100) * circumference;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const fontSize = size < 70 ? size * 0.28 : size * 0.24;
  const labelSize = size < 70 ? size * 0.12 : size * 0.11;

  return (
    <div
      data-testid="score-ring"
      style={{ width: size, height: size }}
      className="relative shrink-0"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="hsl(222 20% 17%)"
          strokeWidth="9"
        />
        {/* Progress */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 6px ${color}88)`,
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </svg>

      {/* Center text */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ gap: 1 }}
      >
        <span
          style={{ fontSize, color, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}
        >
          {score}
        </span>
        {size >= 60 && (
          <span
            style={{ fontSize: labelSize, color: "hsl(215 12% 52%)", fontWeight: 600, letterSpacing: "0.05em", lineHeight: 1, textTransform: "uppercase" }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
