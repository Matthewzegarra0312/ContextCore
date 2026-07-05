import type { ContextEventRow } from "@/lib/types";
import { authorColorVar, authorInitial } from "@/lib/authorColor";
import { relativeTime } from "@/lib/relativeTime";
import { useLocale, useT } from "@/lib/i18n";

export function EventRow({ event, index = 0 }: { event: ContextEventRow; index?: number }) {
  const t = useT();
  const locale = useLocale();
  const color = authorColorVar(event.author);

  return (
    <div
      className="group flex gap-3 border-b border-[var(--border)] py-3 last:border-none transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] px-2 -mx-2 rounded-lg"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Timeline column */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        {/* Author avatar */}
        <span
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ring-2 ring-[var(--page)]"
          style={{ background: color }}
        >
          {authorInitial(event.author)}
        </span>
        {/* Connecting line (hidden on last item via CSS) */}
        <div
          className="w-px flex-1 min-h-[12px] rounded-full opacity-30"
          style={{ background: color }}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pb-1">
        {/* Header */}
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-semibold text-[var(--text-primary)]">
            {event.author}
          </span>
          <span className="text-[var(--text-muted)] text-xs">{t("eventRow.in")}</span>
          <span
            className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium"
            style={{
              background: `color-mix(in srgb, ${color} 12%, transparent)`,
              color: color,
            }}
          >
            {event.module}
          </span>
          <span className="ml-auto text-xs text-[var(--text-muted)]">
            {relativeTime(event.timestamp, locale)}
          </span>
        </div>

        {/* Intent */}
        <div className="mt-1 text-sm text-[var(--text-secondary)]">
          {event.intent}
        </div>

        {/* Decisions */}
        {event.decisions.length > 0 && (
          <ul className="mt-1.5 space-y-1">
            {event.decisions.map((d, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-xs"
              >
                <span
                  className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px]"
                  style={{
                    background: "color-mix(in srgb, #3b82f6 15%, transparent)",
                    color: "#3b82f6",
                  }}
                  aria-label={t("eventRow.decisionAria")}
                >
                  💡
                </span>
                <span className="text-[var(--text-muted)]">
                  <span className="font-medium text-[#3b82f6]">{t("eventRow.decision")}</span>{" "}
                  {d}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Gotchas */}
        {event.gotchas.length > 0 && (
          <ul className="mt-1 space-y-1">
            {event.gotchas.map((g, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-xs"
              >
                <span
                  className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px]"
                  style={{
                    background: "color-mix(in srgb, #f59e0b 15%, transparent)",
                    color: "#f59e0b",
                  }}
                  aria-label={t("eventRow.gotchaAria")}
                >
                  ⚠️
                </span>
                <span className="text-[var(--text-muted)]">
                  <span className="font-medium text-[#f59e0b]">{t("eventRow.gotcha")}</span>{" "}
                  {g}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
