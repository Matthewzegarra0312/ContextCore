import type { ContextEventRow } from "@/lib/types";
import { authorColorVar, authorInitial } from "@/lib/authorColor";
import { relativeTime } from "@/lib/relativeTime";

export function EventRow({ event }: { event: ContextEventRow }) {
  const color = authorColorVar(event.author);

  return (
    <div className="flex gap-3 border-b border-[var(--border)] py-3 last:border-none">
      <span
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ background: color }}
      >
        {authorInitial(event.author)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-medium text-[var(--text-primary)]">{event.author}</span>
          <span className="text-[var(--text-muted)]">en</span>
          <span className="font-mono text-xs text-[var(--text-secondary)]">{event.module}</span>
          <span className="ml-auto text-xs text-[var(--text-muted)]">{relativeTime(event.timestamp)}</span>
        </div>
        <div className="mt-1 text-sm text-[var(--text-secondary)]">{event.intent}</div>
        {event.decisions.length > 0 && (
          <ul className="mt-1 space-y-0.5">
            {event.decisions.map((d, i) => (
              <li key={i} className="text-xs text-[var(--text-muted)]">
                <span className="font-medium">Decisión:</span> {d}
              </li>
            ))}
          </ul>
        )}
        {event.gotchas.length > 0 && (
          <ul className="mt-1 space-y-0.5">
            {event.gotchas.map((g, i) => (
              <li key={i} className="text-xs text-[var(--text-muted)]">
                <span className="font-medium">Gotcha:</span> {g}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
