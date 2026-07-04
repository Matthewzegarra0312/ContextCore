import type { ContextEventRow } from "@/lib/types";
import { authorColorVar, authorInitial } from "@/lib/authorColor";
import { relativeTime } from "@/lib/relativeTime";

export function ActivityCard({ event }: { event: ContextEventRow }) {
  const color = authorColorVar(event.author);
  const isRecent = Date.now() - new Date(event.timestamp).getTime() < 5 * 60_000;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {isRecent && (
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ background: color }}
            />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color }} />
        </span>
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ background: color }}
        >
          {authorInitial(event.author)}
        </span>
        <span className="text-sm font-medium text-[var(--text-primary)]">{event.author}</span>
        <span className="ml-auto text-xs text-[var(--text-muted)]">{relativeTime(event.timestamp)}</span>
      </div>
      <div className="mt-2 text-xs text-[var(--text-muted)]">{event.module}</div>
      <div className="mt-1 text-sm text-[var(--text-secondary)]">{event.intent}</div>
    </div>
  );
}
