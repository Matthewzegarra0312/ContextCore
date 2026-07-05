"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { mockEvents } from "@/lib/mockEvents";
import type { ContextEventRow } from "@/lib/types";
import { relativeTime } from "@/lib/relativeTime";
import { StatTile } from "@/components/StatTile";
import { LiveDot } from "@/components/LiveDot";
import { ActivityCard } from "@/components/ActivityCard";
import { EventRow } from "@/components/EventRow";
import { TokenSavingsPanel } from "@/components/TokenSavingsPanel";
import { ArtifactViewer } from "@/components/ArtifactViewer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale, useT } from "@/lib/i18n";

const EVENT_LIMIT = 200;

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({
  children,
  sub,
  delay = 0,
}: {
  children: React.ReactNode;
  sub?: string;
  delay?: number;
}) {
  return (
    <div className="fade-up" style={{ animationDelay: `${delay}ms` }}>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        {children}
      </h2>
      {sub && (
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">{sub}</p>
      )}
      <div className="section-divider mt-2" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [events, setEvents] = useState<ContextEventRow[]>(mockEvents);
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) setUser(data.user ?? null);
    });

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    supabase
      .from("context_events")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(EVENT_LIMIT)
      .then(({ data }) => {
        if (active && data) setEvents(data as ContextEventRow[]);
      });

    const channel = supabase
      .channel("context_events_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "context_events" },
        (payload) => {
          setEvents((prev) =>
            [payload.new as ContextEventRow, ...prev].slice(0, EVENT_LIMIT)
          );
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setConnected(true);
      });

    return () => {
      active = false;
      authSubscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const latestByAuthor = useMemo(() => {
    const map = new Map<string, ContextEventRow>();
    for (const event of events) {
      const current = map.get(event.author);
      if (
        !current ||
        new Date(event.timestamp) > new Date(current.timestamp)
      ) {
        map.set(event.author, event);
      }
    }
    return [...map.values()].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [events]);

  const modulesTouched = useMemo(
    () => new Set(events.map((e) => e.module)).size,
    [events]
  );
  const lastActivity = events[0] ? relativeTime(events[0].timestamp, locale) : "—";

  const userLabel =
    (user?.user_metadata?.user_name as string | undefined) ||
    (user?.user_metadata?.preferred_username as string | undefined) ||
    user?.email ||
    null;
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="min-h-screen bg-[var(--page)]">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--page)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link href="/" className="flex shrink-0 items-center gap-2 group">
              <Image
                src="/logo-contextcore.webp"
                alt="ContextCore"
                width={36}
                height={36}
                className="h-9 w-9 rounded-md object-contain transition-transform duration-150 group-hover:scale-110"
                priority
              />
              <span className="hidden text-sm font-semibold tracking-tight text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text-primary)] sm:inline">
                {t("common.brand")}
              </span>
            </Link>

            <span className="hidden text-[var(--border)] select-none sm:inline" aria-hidden="true">
              /
            </span>
            <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
              {t("dashboard.breadcrumb")}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <LiveDot connected={connected} />
            </div>
            <LanguageSwitcher />
            <ThemeToggle />
            {userLabel && (
              <div className="flex items-center gap-2 border-l border-[var(--border)] pl-2 sm:pl-3">
                {avatarUrl && (
                  <Image
                    src={avatarUrl}
                    alt={userLabel}
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full"
                  />
                )}
                <span className="hidden max-w-[8rem] truncate text-xs text-[var(--text-secondary)] md:inline">
                  {userLabel}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-md px-2 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                  title={t("auth.logout")}
                >
                  {t("auth.logout")}
                </button>
              </div>
            )}
          </div>
        </div>
        {/* LiveDot on its own row for small screens, so it never gets squeezed */}
        <div className="border-t border-[var(--border)] px-4 py-1.5 sm:hidden">
          <LiveDot connected={connected} />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:space-y-10 sm:px-6 sm:py-8">

        {/* ── Stat tiles ── */}
        <section
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 fade-up"
          style={{ animationDelay: "80ms" }}
          aria-label={t("dashboard.metricsAria")}
        >
          <StatTile
            label={t("dashboard.statDevsActive")}
            value={String(latestByAuthor.length)}
            icon="👥"
            accent="var(--series-1)"
            numeric={true}
          />
          <StatTile
            label={t("dashboard.statTotalEvents")}
            value={String(events.length)}
            icon="📝"
            accent="var(--series-2)"
            numeric={true}
          />
          <StatTile
            label={t("dashboard.statModulesTouched")}
            value={String(modulesTouched)}
            icon="📦"
            accent="var(--series-3)"
            numeric={true}
          />
          <StatTile
            label={t("dashboard.statLastActivity")}
            value={lastActivity}
            icon="⏱"
            accent="var(--series-5)"
          />
        </section>

        {/* ── Token savings + Artifact viewer (2 columns on desktop) ── */}
        <section
          className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px] fade-up"
          style={{ animationDelay: "160ms" }}
          aria-label={t("dashboard.tokenArtifactsAria")}
        >
          {/* Left: Token savings */}
          <div className="min-w-0">
            <SectionHeading delay={200}>
              {t("dashboard.sectionTokenSavings")}
            </SectionHeading>
            <div className="mt-4">
              <TokenSavingsPanel />
            </div>
          </div>

          {/* Right: Artifact viewer */}
          <div className="min-w-0">
            <SectionHeading delay={240}>
              {t("dashboard.sectionArtifacts")}
            </SectionHeading>
            <div className="mt-4">
              <ArtifactViewer />
            </div>
          </div>
        </section>

        {/* ── Team activity ── */}
        <section
          className="fade-up"
          style={{ animationDelay: "280ms" }}
          aria-label={t("dashboard.teamActivityAria")}
        >
          <SectionHeading delay={280}>
            {t("dashboard.sectionTeamActivity")}
          </SectionHeading>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {latestByAuthor.map((event, i) => (
              <ActivityCard key={event.author} event={event} index={i} />
            ))}
          </div>
        </section>

        {/* ── Event timeline ── */}
        <section
          className="fade-up"
          style={{ animationDelay: "340ms" }}
          aria-label={t("dashboard.timelineAria")}
        >
          <SectionHeading delay={340}>
            {t("dashboard.sectionEventTimeline")}
          </SectionHeading>
          <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 sm:px-4">
            {events.map((event, i) => (
              <EventRow
                key={event.id ?? `${event.author}-${event.timestamp}-${i}`}
                event={event}
                index={i}
              />
            ))}
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="mt-8 border-t border-[var(--border)] py-4 text-center text-xs text-[var(--text-muted)]">
        {t("dashboard.footerText")}{" "}
        <span className="font-mono">{t("dashboard.footerTrack")}</span>
      </footer>
    </div>
  );
}
