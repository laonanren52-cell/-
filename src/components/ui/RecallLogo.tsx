type RecallLogoProps = {
  size?: number;
  variant?: "dark" | "light" | "soft";
  animated?: boolean;
  className?: string;
};

const colors = {
  dark: {
    ring: "#25324A",
    dot: "#25324A",
    trail: "#9AA6B8",
  },
  light: {
    ring: "#FFFFFF",
    dot: "#FFFFFF",
    trail: "rgba(255,255,255,0.72)",
  },
  soft: {
    ring: "#9AA6B8",
    dot: "#25324A",
    trail: "#A8B8AE",
  },
};

export function RecallLogo({ size = 40, variant = "dark", animated = false, className = "" }: RecallLogoProps) {
  const palette = colors[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="回溯 Logo"
      className={`${animated ? "recall-logo-animated" : ""} ${className}`}
    >
      <g className="recall-logo-ring" stroke={palette.ring} strokeWidth="4.4" strokeLinecap="round">
        <path d="M42.4 13.8A21.5 21.5 0 1 0 48.8 42" />
      </g>
      <circle className="recall-logo-core" cx="28.5" cy="32" r="6.6" fill={palette.dot} />
      <g className="recall-logo-dots" fill={palette.trail}>
        <circle cx="43.4" cy="23" r="2.8" style={{ animationDelay: "0ms" }} />
        <circle cx="48.6" cy="25.9" r="2.45" style={{ animationDelay: "120ms" }} />
        <circle cx="52.6" cy="30.2" r="2.05" style={{ animationDelay: "240ms" }} />
        <circle cx="54.7" cy="35.5" r="1.75" style={{ animationDelay: "360ms" }} />
        <circle cx="54.5" cy="41" r="1.4" style={{ animationDelay: "480ms" }} />
        <circle cx="52" cy="46" r="1.1" style={{ animationDelay: "600ms" }} />
      </g>
    </svg>
  );
}
