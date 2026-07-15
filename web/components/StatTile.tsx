import { useEffect, useRef, useState } from "react";

interface StatTileProps {
  label: string;
  value: string;
  icon: string;
  accent?: string;
  numeric?: boolean;
}

function useCountUp(target: number, enabled: boolean, duration = 700) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    if (!enabled) return;
    const start = performance.now();
    function step(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, enabled, duration]);
  return val;
}

export function StatTile({
  label,
  value,
  icon,
  accent = "var(--series-1)",
  numeric = false,
}: StatTileProps) {
  const numericValue = numeric ? parseInt(value, 10) : 0;
  const animated = useCountUp(numericValue, numeric && !isNaN(numericValue));
  const displayValue = numeric && !isNaN(numericValue) ? String(animated) : value;

  return (
    <div
      className="
        group relative min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]
        cursor-default
        sm:p-4
      "
      style={{ boxShadow: `inset 0 0 0 1px ${accent}1a` }}
    >
      {/* Glow blob */}
      <div
        className="pointer-events-none absolute -right-3 -top-3 h-14 w-14 rounded-full opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-15"
        style={{ background: accent }}
        aria-hidden="true"
      />

      {/* Icon */}
      <div
        className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg text-sm"
        style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)` }}
        aria-hidden="true"
      >
        {icon}
      </div>

      <div className="truncate text-xs text-[var(--text-muted)]">{label}</div>
      {/* suppressHydrationWarning: para el stat de "última actividad" el valor es
          un tiempo relativo (Date.now()), que legítimamente difiere entre el
          render del servidor y la hidratación del cliente — ver React #418/#425. */}
      <div
        className="mt-0.5 truncate text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ color: accent }}
        suppressHydrationWarning
      >
        {displayValue}
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-full"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
        aria-hidden="true"
      />
    </div>
  );
}
