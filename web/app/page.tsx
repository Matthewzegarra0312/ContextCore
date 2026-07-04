import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm font-medium text-[var(--series-1)]">RAISE Summit Hackathon 2026 · Paris · Track Cursor</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl">
        ContextCore
      </h1>
      <p className="mt-4 text-lg text-[var(--text-secondary)]">
        Memoria compartida y viva para los agentes de código de tu equipo — dejan de redescubrir el
        repo en cada sesión, y el equipo ve su &ldquo;cerebro común&rdquo; en un dashboard en tiempo real.
      </p>

      <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="text-xs text-[var(--text-muted)]">Empezar</div>
        <pre className="mt-2 overflow-x-auto rounded-md bg-[var(--page)] p-3 text-sm text-[var(--text-primary)]">
          <code>{"npm install -D @contextcore/cli\nnpx contextcore init"}</code>
        </pre>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Detecta el stack del repo, instala el hook <code>post-commit</code> y escribe el contexto
          inicial. Cada commit después de esto —con solo <code>npx contextcore</code>— actualiza{" "}
          <code>AGENTS.md</code>, <code>CLAUDE.md</code> y <code>.cursor/rules/</code> solo.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Un solo estándar</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            AGENTS.md y CLAUDE.md ya son el estándar. ContextCore es la automatización que los
            mantiene vivos y resumidos.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Cross-tool de verdad</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Cursor, Claude Code, Copilot, Codex — una fuente, todos los agentes empiezan ya
            informados.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Conciencia de equipo, en vivo</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            El dashboard muestra quién toca qué módulo ahora mismo, qué decisiones se tomaron y qué
            gotchas se descubrieron.
          </p>
        </div>
      </div>

      <Link
        href="/dashboard"
        className="mt-10 inline-block rounded-md px-4 py-2 text-sm font-medium text-white"
        style={{ background: "var(--series-1)" }}
      >
        Ver el dashboard →
      </Link>
    </main>
  );
}
