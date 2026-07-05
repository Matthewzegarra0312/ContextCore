import type { ContextEventRow } from "@/lib/types";
import { authorColorVar, authorInitial } from "@/lib/authorColor";
import { relativeTime } from "@/lib/relativeTime";
import { useLocale } from "@/lib/i18n";

export function ActivityCard({ event, index = 0 }: { event: ContextEventRow; index?: number }) {
  const locale = useLocale();
  const color = authorColorVar(event.author);
  const isRecent = Date.now() - new Date(event.timestamp).getTime() < 5 * 60_000;

  return (
    <div
      className="
        group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4
        transition-all duration-200
        hover:scale-[1.02] hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)]
        card-enter
      "
      style={{
        borderLeft: `3px solid ${color}`,
        animationDelay: `${index * 80}ms`,
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Subtle gradient glow from author color */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl"
        style={{
          background: `radial-gradient(circle at 0% 0%, ${color}12 0%, transparent 60%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-center gap-2">
        {/* Presence indicator */}
        <span className="relative flex h-2 w-2 shrink-0">
          {isRecent && (
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ background: color }}
            />
          )}
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ background: color }}
          />
        </span>

        {/* Avatar */}
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
          style={{ background: color }}
        >
          {authorInitial(event.author)}
        </span>

        <div className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {event.author}
          </span>
        </div>

        <span className="shrink-0 text-xs text-[var(--text-muted)]">
          {relativeTime(event.timestamp, locale)}
        </span>
      </div>

      {/* Module badge */}
      <div className="relative mt-2.5">
        <span
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-medium"
          style={{
            background: `color-mix(in srgb, ${color} 12%, transparent)`,
            color: color,
            border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
          }}
        >
          📁 {event.module}
        </span>
      </div>

      {/* Intent */}
      <p className="relative mt-2 text-sm leading-snug text-[var(--text-secondary)] line-clamp-2">
        {event.intent}
      </p>
    </div>
  );
}
