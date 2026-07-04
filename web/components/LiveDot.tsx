export function LiveDot({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
      <span className="relative flex h-2.5 w-2.5">
        {connected && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--good)] opacity-75" />
        )}
        <span
          className="relative inline-flex h-2.5 w-2.5 rounded-full"
          style={{ background: connected ? "var(--good)" : "var(--text-muted)" }}
        />
      </span>
      {connected ? "En vivo (Supabase Realtime)" : "Datos de ejemplo (Supabase no configurado)"}
    </div>
  );
}
