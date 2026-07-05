"use client";

import { useT } from "@/lib/i18n";

export function LiveDot({ connected }: { connected: boolean }) {
  const t = useT();

  return (
    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        {connected && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--good)] opacity-75" />
        )}
        <span
          className="relative inline-flex h-2.5 w-2.5 rounded-full"
          style={{ background: connected ? "var(--good)" : "var(--text-muted)" }}
        />
      </span>
      <span className="truncate">
        {connected ? t("liveDot.live") : t("liveDot.mock")}
      </span>
    </div>
  );
}
