type DotPatternProps = {
  className?: string;
  opacity?: number;
};

export function DotPattern({ className = "", opacity = 0.45 }: DotPatternProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        opacity,
        backgroundImage: "radial-gradient(circle, rgba(130,145,137,0.48) 1px, transparent 1.4px)",
        backgroundSize: "18px 18px",
        maskImage: "radial-gradient(circle at 50% 42%, black 0%, rgba(0,0,0,0.68) 34%, transparent 72%)",
      }}
    />
  );
}
