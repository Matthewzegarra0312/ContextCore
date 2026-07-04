"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";
import { mockEvents } from "@/lib/mockEvents";
import type { ContextEventRow } from "@/lib/types";
import { relativeTime } from "@/lib/relativeTime";
import { StatTile } from "@/components/StatTile";
import { LiveDot } from "@/components/LiveDot";
import { ActivityCard } from "@/components/ActivityCard";
import { EventRow } from "@/components/EventRow";

const EVENT_LIMIT = 200;

export default function DashboardPage() {
  const [events, setEvents] = useState<ContextEventRow[]>(mockEvents);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return; // sin credenciales: se queda con mockEvents

    let active = true;

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
          setEvents((prev) => [payload.new as ContextEventRow, ...prev].slice(0, EVENT_LIMIT));
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setConnected(true);
      });

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const latestByAuthor = useMemo(() => {
    const map = new Map<string, ContextEventRow>();
    for (const event of events) {
      const current = map.get(event.author);
      if (!current || new Date(event.timestamp) > new Date(current.timestamp)) {
        map.set(event.author, event);
      }
    }
    return [...map.values()].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [events]);

  const modulesTouched = useMemo(() => new Set(events.map((e) => e.module)).size, [events]);
  const lastActivity = events[0] ? relativeTime(events[0].timestamp) : "—";

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            ← ContextCore
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">Dashboard del equipo</h1>
        </div>
        <LiveDot connected={connected} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Devs activos" value={String(latestByAuthor.length)} />
        <StatTile label="Eventos totales" value={String(events.length)} />
        <StatTile label="Módulos tocados" value={String(modulesTouched)} />
        <StatTile label="Última actividad" value={lastActivity} />
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Trabajo en curso del equipo
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {latestByAuthor.map((event) => (
            <ActivityCard key={event.author} event={event} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Timeline de eventos
        </h2>
        <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4">
          {events.map((event, i) => (
            <EventRow key={event.id ?? `${event.author}-${event.timestamp}-${i}`} event={event} />
          ))}
        </div>
      </section>
    </main>
  );
}
