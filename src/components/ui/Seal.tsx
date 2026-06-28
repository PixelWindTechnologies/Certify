interface SealProps {
  status: "VALID" | "REVOKED";
  size?: number;
}

export function Seal({ status, size = 96 }: SealProps) {
  const valid = status === "VALID";
  const ring = valid ? "#1C7C54" : "#B3261E";
  const inner = valid ? "#E4F3EC" : "#FBEAE9";

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="56" fill={inner} stroke={ring} strokeWidth="2" />
      <circle
        cx="60"
        cy="60"
        r="46"
        fill="none"
        stroke={ring}
        strokeWidth="1"
        strokeDasharray="2 4"
      />
      {/* scalloped seal edge */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const x = 60 + Math.cos(angle) * 56;
        const y = 60 + Math.sin(angle) * 56;
        return <circle key={i} cx={x} cy={y} r="2.4" fill={ring} opacity="0.55" />;
      })}
      {valid ? (
        <path
          d="M42 61.5 L54 73 L80 47"
          stroke={ring}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ) : (
        <g stroke={ring} strokeWidth="6" strokeLinecap="round">
          <path d="M46 46 L74 74" />
          <path d="M74 46 L46 74" />
        </g>
      )}
    </svg>
  );
}
