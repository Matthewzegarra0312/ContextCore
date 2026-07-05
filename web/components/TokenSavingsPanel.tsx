"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MODEL_PRICING,
  mockTokenSessions,
  buildDayBuckets,
  calcSessionCost,
  type DayBucket,
} from "@/lib/mockTokenSavings";
import { useLocale, useT } from "@/lib/i18n";

// ─── Countup hook ─────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900, decimals = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const from = 0;

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (target - from) * eased;
      setValue(parseFloat(current.toFixed(decimals)));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, decimals]);

  return value;
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtUSD(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${(n * 100).toFixed(1)}¢`;
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart({
  buckets,
  maxTokens,
}: {
  buckets: DayBucket[];
  maxTokens: number;
}) {
  const t = useT();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="relative mt-2">
      {/* Y-axis labels */}
      <div className="flex flex-col justify-between absolute left-0 top-0 h-[120px] sm:h-[140px] text-[10px] text-[var(--text-muted)] pointer-events-none select-none">
        <span>{fmtK(maxTokens)}</span>
        <span>{fmtK(maxTokens / 2)}</span>
        <span>0</span>
      </div>

      {/* Chart column (bars area + labels row) */}
      <div className="ml-7 sm:ml-8">
        {/* Bars area — fixed height; bar heights are percentages so they
            can never exceed this box or spill into the legend above. */}
        <div className="relative flex items-end gap-1 h-[120px] sm:gap-2 sm:h-[140px]">
          {/* Gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-full border-t border-dashed"
                style={{ borderColor: "var(--gridline)" }}
              />
            ))}
          </div>

          {buckets.map((bucket, i) => {
            const savedPct =
              maxTokens > 0 ? (bucket.totalSaved / maxTokens) * 100 : 0;
            const usedPct =
              maxTokens > 0 ? (bucket.totalUsed / maxTokens) * 100 : 0;
            const isEmpty = bucket.sessions === 0;

            return (
              <div
                key={bucket.dateKey}
                className="relative flex h-full flex-1 items-end group cursor-pointer"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onTouchStart={() => setHovered(i)}
              >
                {/* Tooltip */}
                {hovered === i && !isEmpty && (
                  <div
                    className="absolute bottom-full mb-2 z-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 shadow-xl text-[11px] whitespace-nowrap pointer-events-none"
                    style={{
                      left: i === 0 ? "0%" : i === buckets.length - 1 ? "auto" : "50%",
                      right: i === buckets.length - 1 ? "0%" : "auto",
                      transform: i === 0 || i === buckets.length - 1 ? "none" : "translateX(-50%)",
                    }}
                  >
                    <div className="font-semibold text-[var(--text-primary)] mb-1">
                      {bucket.label} · {bucket.sessions}{" "}
                      {bucket.sessions !== 1
                        ? t("tokenSavings.tooltipSessionPlural")
                        : t("tokenSavings.tooltipSessionSingular")}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-sm bg-[#4ade80]" />
                      <span className="text-[var(--text-secondary)]">{t("tokenSavings.tooltipSaved")}</span>
                      <span className="font-medium text-[#4ade80]">
                        {fmtK(bucket.totalSaved)} {t("tokenSavings.tooltipTokensUnit")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-sm bg-[var(--text-muted)]" />
                      <span className="text-[var(--text-secondary)]">{t("tokenSavings.tooltipUsed")}</span>
                      <span className="font-medium text-[var(--text-primary)]">
                        {fmtK(bucket.totalUsed)} {t("tokenSavings.tooltipTokensUnit")}
                      </span>
                    </div>
                    <div className="mt-1 border-t border-[var(--border)] pt-1 font-semibold text-[#4ade80]">
                      💰 {fmtUSD(bucket.costSavedUSD)} {t("tokenSavings.tooltipSavedAmount")}
                    </div>
                  </div>
                )}

                {/* Stacked bar */}
                {!isEmpty ? (
                  <div className="flex h-full w-full flex-col justify-end">
                    {/* Saved portion (green gradient, top) */}
                    <div
                      className="w-full rounded-t-sm bar-grow"
                      style={{
                        height: `${savedPct}%`,
                        background:
                          "linear-gradient(180deg, #4ade80 0%, #3b82f6 100%)",
                        transition: "height 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                        animationDelay: `${i * 60}ms`,
                      }}
                    />
                    {/* Used portion (muted, bottom) */}
                    <div
                      className="w-full"
                      style={{
                        height: `${usedPct}%`,
                        background: "var(--gridline)",
                        transition: "height 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-full rounded-sm"
                    style={{ height: "4px", background: "var(--gridline)" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Day labels — separate row so they never add height to the bars. */}
        <div className="mt-1.5 flex gap-1 sm:gap-2">
          {buckets.map((bucket) => (
            <span
              key={bucket.dateKey}
              className="flex-1 text-center text-[9px] text-[var(--text-muted)] select-none sm:text-[10px]"
            >
              {bucket.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Metric hero card ─────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  icon: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg sm:p-4"
      style={{ boxShadow: `inset 0 0 0 1px ${accent}18` }}
    >
      {/* Gradient glow top-right */}
      <div
        className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-10 blur-xl"
        style={{ background: accent }}
        aria-hidden="true"
      />
      <div className="relative">
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] sm:gap-2 sm:text-xs">
          <span className="text-base" aria-hidden="true">{icon}</span>
          <span className="truncate">{label}</span>
        </div>
        <div
          className="mt-1 text-xl font-bold tracking-tight sm:text-2xl"
          style={{ color: accent }}
        >
          {value}
        </div>
        {sub && (
          <div className="mt-0.5 truncate text-[10px] text-[var(--text-muted)] sm:text-[11px]">{sub}</div>
        )}
      </div>
    </div>
  );
}

// ─── Model selector ───────────────────────────────────────────────────────────

function ModelSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-[var(--text-muted)]">{t("tokenSavings.model")}</span>
      <div className="flex flex-wrap overflow-hidden rounded-lg border border-[var(--border)]">
        {Object.entries(MODEL_PRICING).map(([key, m]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--series-1)] sm:px-3 sm:text-xs ${
              key === value
                ? "text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--surface)]"
            }`}
            style={
              key === value
                ? { background: m.color }
                : {}
            }
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Pricing breakdown table ──────────────────────────────────────────────────

function PricingTable({
  modelKey,
  totalWithout,
  totalWith,
  totalSavedUSD,
}: {
  modelKey: string;
  totalWithout: number;
  totalWith: number;
  totalSavedUSD: number;
}) {
  const t = useT();
  const pricing = MODEL_PRICING[modelKey];
  const projMonthly = (totalSavedUSD / 7) * 30;

  const rows = [
    {
      label: t("tokenSavings.pricingWithout"),
      tokens: totalWithout,
      cost: totalWith + totalSavedUSD, // reverting to no-context cost
      color: "#ef4444",
    },
    {
      label: t("tokenSavings.pricingWith"),
      tokens: totalWith,
      cost: totalWith * pricing.inputPer1M / 1_000_000,
      color: "#4ade80",
    },
  ];

  return (
    <div className="mt-4 rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-1 bg-[var(--surface)] px-3 py-2.5 border-b border-[var(--border)] sm:px-4">
        <span className="text-xs font-semibold text-[var(--text-primary)]">
          {t("tokenSavings.pricingBreakdown")} {pricing.label}
        </span>
        <span className="text-[10px] text-[var(--text-muted)]">
          ${pricing.inputPer1M}/1M in · ${pricing.outputPer1M}/1M out
        </span>
      </div>

      <div className="divide-y divide-[var(--border)] bg-[var(--surface)]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm sm:px-4"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ background: row.color }}
              />
              <span className="truncate text-[var(--text-secondary)]">{row.label}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-xs sm:gap-6">
              <span className="text-[var(--text-muted)] font-mono">
                {fmtK(row.tokens)}
              </span>
              <span
                className="font-semibold font-mono w-14 text-right sm:w-16"
                style={{ color: row.color }}
              >
                {fmtUSD(row.cost)}
              </span>
            </div>
          </div>
        ))}

        {/* Savings row */}
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm bg-[color-mix(in_srgb,#4ade80_6%,transparent)] sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[#4ade80] font-semibold">{t("tokenSavings.pricingSavings")}</span>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-xs sm:gap-6">
            <span className="text-[#4ade80] font-mono">
              {fmtK(totalWithout - totalWith)}
            </span>
            <span className="font-bold font-mono text-[#4ade80] w-14 text-right sm:w-16">
              {fmtUSD(totalSavedUSD)}
            </span>
          </div>
        </div>

        {/* Monthly projection */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[var(--surface)] text-[11px] text-[var(--text-muted)] sm:px-4">
          <span className="truncate">{t("tokenSavings.pricingProjection")}</span>
          <span className="shrink-0 font-semibold text-[var(--text-primary)]">
            {fmtUSD(projMonthly)} {t("tokenSavings.perMonth")}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TokenSavingsPanel() {
  const t = useT();
  const locale = useLocale();
  const [modelKey, setModelKey] = useState<string>("claude-sonnet-4");

  const sessions = mockTokenSessions;

  // Aggregate totals
  const { totalSaved, totalUsed, totalWithout, totalSavedUSD, totalSessions, pctReduction } =
    useMemo(() => {
      let tSaved = 0,
        tUsed = 0,
        tWithout = 0,
        tSavedUSD = 0;
      for (const s of sessions) {
        const costs = calcSessionCost(s, modelKey);
        tSaved += s.tokensSaved;
        tUsed += s.tokensWithContext;
        tWithout += s.tokensWithoutContext;
        tSavedUSD += costs.saved;
      }
      const pct = tWithout > 0 ? Math.round((tSaved / tWithout) * 100) : 0;
      return {
        totalSaved: tSaved,
        totalUsed: tUsed,
        totalWithout: tWithout,
        totalSavedUSD: tSavedUSD,
        totalSessions: sessions.length,
        pctReduction: pct,
      };
    }, [sessions, modelKey]);

  // Day buckets for chart
  const buckets = useMemo(
    () => buildDayBuckets(sessions, modelKey, 7, locale),
    [sessions, modelKey, locale]
  );

  const maxTokens = useMemo(() => {
    const mx = Math.max(
      ...buckets.map((b) => b.totalSaved + b.totalUsed)
    );
    return mx > 0 ? Math.ceil(mx / 10000) * 10000 : 100_000;
  }, [buckets]);

  // Countup values
  const savedCount = useCountUp(totalSaved, 1000);
  const usdCount = useCountUp(totalSavedUSD, 1200, 2);
  const pctCount = useCountUp(pctReduction, 800);

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {t("tokenSavings.header")}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            {t("tokenSavings.subtitle", { count: totalSessions })}
          </p>
        </div>
        <ModelSelector value={modelKey} onChange={setModelKey} />
      </div>

      {/* Hero metrics */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <MetricCard
          icon="🔢"
          label={t("tokenSavings.metricTokensSaved")}
          value={fmtK(savedCount)}
          sub={t("tokenSavings.metricTokensSavedSub")}
          accent="#4ade80"
        />
        <MetricCard
          icon="💰"
          label={t("tokenSavings.metricCostSaved")}
          value={fmtUSD(usdCount)}
          sub={t("tokenSavings.metricCostSavedSub")}
          accent="#f59e0b"
        />
        <MetricCard
          icon="📉"
          label={t("tokenSavings.metricReduction")}
          value={`${pctCount}%`}
          sub={t("tokenSavings.metricReductionSub")}
          accent="#3b82f6"
        />
        <MetricCard
          icon="⚡"
          label={t("tokenSavings.metricSessions")}
          value={String(totalSessions)}
          sub={t("tokenSavings.metricSessionsSub")}
          accent="#a855f7"
        />
      </div>

      {/* Bar chart */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            {t("tokenSavings.chartTitle")}
          </span>
          <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-3 rounded-sm bg-gradient-to-r from-[#4ade80] to-[#3b82f6]" />
              {t("tokenSavings.chartSaved")}
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-3 rounded-sm"
                style={{ background: "var(--gridline)" }}
              />
              {t("tokenSavings.chartUsed")}
            </span>
          </div>
        </div>
        <BarChart buckets={buckets} maxTokens={maxTokens} />
      </div>

      {/* Pricing table */}
      <PricingTable
        modelKey={modelKey}
        totalWithout={totalWithout}
        totalWith={totalUsed}
        totalSavedUSD={totalSavedUSD}
      />
    </div>
  );
}
