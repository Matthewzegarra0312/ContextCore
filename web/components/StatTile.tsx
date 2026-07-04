export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="text-sm text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-[var(--text-primary)]">{value}</div>
    </div>
  );
}
