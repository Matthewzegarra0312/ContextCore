"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";

// ─── Contenido de ejemplo fiel a la salida real de compile.ts ─────────────────

const AGENTS_MD = `<!-- Generado por \`contextcore sync\` — no editar a mano. -->

## Overview

**contextcore-monorepo** — TypeScript (Next.js, Node 20+).

## Comandos

- \`pnpm run build\`: pnpm -r --filter=./packages/** build
- \`pnpm run dev\`: next dev
- \`pnpm run lint\`: next lint

## Trabajo en curso del equipo

- **daniel** en \`web/dashboard\`: Suscripción a Supabase Realtime + estado de
  conexión en vivo — fallback a datos de ejemplo si no hay credenciales.
- **ana** en \`packages/core\`: Servicio FastAPI de resumen semántico +
  integración best-effort en contextcore capture.
- **matthew** en \`packages/core, packages/cli\`: Automatización git
  (hook local + GitHub Action).

## Decisiones recientes

- Modelo claude-haiku-4-5 a propósito (barato/rápido, corre en cada commit).
- Structured outputs (json_schema) en vez de texto libre.
- CLAUDE.md es copia real de AGENTS.md, no symlink (Windows).
- Único escritor del compilado es la GitHub Action, no el hook local.

## Gotchas conocidos

- Sin el servicio corriendo, capture cae solo al fallback local sin
  romper el commit.
- Comitear dentro del post-commit crea un loop; el hook nunca comitea.
- Supabase a veces activa RLS al crear tabla desde el SQL editor.

## Boundaries

- No edites \`AGENTS.md\`, \`CLAUDE.md\` ni \`.cursor/rules/contextcore.mdc\`
  a mano — se regeneran con \`contextcore sync\`.
- No edites los \`.contextcore/*.jsonl\` a mano — append-only, un archivo
  por autor.`;

const CLAUDE_MD = `<!-- Generado por \`contextcore sync\` — no editar a mano. -->
<!-- Copia exacta de AGENTS.md para Claude Code (no es symlink en Windows) -->

## Overview

**contextcore-monorepo** — TypeScript (Next.js, Node 20+).

## Comandos

- \`pnpm run build\`: pnpm -r --filter=./packages/** build

## Trabajo en curso del equipo

- **daniel** en \`web/dashboard\`: Suscripción a Supabase Realtime
- **ana** en \`packages/core\`: FastAPI de resumen semántico
- **matthew** en \`packages/cli\`: Automatización git

## Decisiones recientes

- claude-haiku-4-5 elegido por costo/velocidad en cada commit del equipo.
- json_schema structured outputs para evitar parsing frágil de texto libre.

## Gotchas conocidos

- RLS en Supabase bloquea inserts si no hay políticas configuradas.
- post-commit → contextcore sync crea loop si el hook también hace commit.

## Boundaries

- No edites este archivo a mano — se regenera con \`contextcore sync\`.`;

const CURSOR_RULE = `---
description: Contexto vivo del equipo, generado por ContextCore
alwaysApply: true
---

<!-- Generado por \`contextcore sync\` — no editar a mano. -->

## Overview

**contextcore-monorepo** — TypeScript (Next.js, Node 20+).

## Trabajo en curso del equipo

- **daniel** en \`web/dashboard\`: Realtime + estado de conexión
- **ana** en \`packages/core\`: FastAPI resumen semántico
- **matthew** en \`packages/cli\`: Git automation (hook + Action)

## Decisiones recientes

- Model: claude-haiku-4-5 (barato, rápido, por commit)
- Output: json_schema structured (no texto libre)
- CLAUDE.md: copia real, no symlink (compat Windows)

## Gotchas

- RLS Supabase → inserts bloqueados sin políticas
- post-commit loop si el hook hace commit interno

## Boundaries

- Read-only: AGENTS.md, CLAUDE.md, .cursor/rules/contextcore.mdc
- Solo el GitHub Action escribe el archivo compilado final.`;

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Tab {
  id: string;
  label: string;
  icon: string;
  badgeKey: "tabBadgeAgents" | "tabBadgeClaude" | "tabBadgeCursor";
  content: string;
  lines: number;
  tokens: number;
}

// Filenames and generated file contents are real artifact names — kept
// as-is across locales, only the surrounding UI chrome is translated.
const TABS: Tab[] = [
  {
    id: "agents",
    label: "AGENTS.md",
    icon: "📋",
    badgeKey: "tabBadgeAgents",
    content: AGENTS_MD,
    lines: AGENTS_MD.split("\n").length,
    tokens: Math.ceil(AGENTS_MD.length / 4),
  },
  {
    id: "claude",
    label: "CLAUDE.md",
    icon: "🤖",
    badgeKey: "tabBadgeClaude",
    content: CLAUDE_MD,
    lines: CLAUDE_MD.split("\n").length,
    tokens: Math.ceil(CLAUDE_MD.length / 4),
  },
  {
    id: "cursor",
    label: ".cursor/rules",
    icon: "⚡",
    badgeKey: "tabBadgeCursor",
    content: CURSOR_RULE,
    lines: CURSOR_RULE.split("\n").length,
    tokens: Math.ceil(CURSOR_RULE.length / 4),
  },
];

// ─── Syntax highlighting minimal (markdown) ───────────────────────────────────

function highlightMarkdown(line: string, i: number): React.ReactNode {
  const trimmed = line.trimStart();

  // Frontmatter separator / comment
  if (trimmed.startsWith("---") || trimmed.startsWith("<!--")) {
    return (
      <span key={i} className="text-[#6b7280]">
        {line}
      </span>
    );
  }

  // H2 heading
  if (trimmed.startsWith("## ")) {
    return (
      <span key={i} className="font-bold text-[#60a5fa]">
        {line}
      </span>
    );
  }

  // Bold + code pattern (## section content with **author**)
  if (trimmed.includes("**")) {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <span key={j} className="font-semibold text-[#f0f0f0]">
              {part.slice(2, -2)}
            </span>
          ) : (
            <span key={j} className="text-[#a3a3a3]">
              {part}
            </span>
          )
        )}
      </span>
    );
  }

  // Inline code
  if (trimmed.includes("`")) {
    const parts = line.split(/(`[^`]+`)/g);
    return (
      <span key={i} className="text-[#a3a3a3]">
        {parts.map((part, j) =>
          part.startsWith("`") && part.endsWith("`") ? (
            <span key={j} className="text-[#4ade80] bg-[#ffffff08] rounded px-0.5">
              {part}
            </span>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
      </span>
    );
  }

  // Dash list item
  if (trimmed.startsWith("- ")) {
    return (
      <span key={i}>
        <span className="text-[#60a5fa]">
          {line.slice(0, line.indexOf("- ") + 1)}
        </span>
        <span className="text-[#e2e8f0]">{"-"}</span>
        <span className="text-[#a3a3a3]">{line.slice(line.indexOf("- ") + 2)}</span>
      </span>
    );
  }

  // alwaysApply / description frontmatter keys
  if (trimmed.match(/^(description|alwaysApply):/)) {
    const colonIdx = trimmed.indexOf(":");
    return (
      <span key={i} className="text-[#a3a3a3]">
        <span className="text-[#f472b6]">{trimmed.slice(0, colonIdx)}</span>
        <span>:</span>
        <span className="text-[#fbbf24]">{trimmed.slice(colonIdx + 1)}</span>
      </span>
    );
  }

  // Empty line
  if (!trimmed) return <span key={i}>&nbsp;</span>;

  // Default
  return (
    <span key={i} className="text-[#a3a3a3]">
      {line}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ArtifactViewer() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<string>("agents");

  const tab = TABS.find((tb) => tb.id === activeTab)!;
  const codeLines = tab.content.split("\n");

  return (
    <div
      className="flex min-w-0 flex-col rounded-xl overflow-hidden border border-white/10 bg-[#0e0e0e] shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
      style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
    >
      {/* ── Title bar ── */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] bg-[#1a1a1a] px-3 py-2.5 sm:px-4">
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#FF5F56]" aria-hidden="true" />
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#FFBD2E]" aria-hidden="true" />
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#27C93F]" aria-hidden="true" />
        <span className="ml-2 flex min-w-0 items-center gap-1.5 truncate text-xs text-[#666]">
          <span>{t("artifactViewer.chromeNamespace")}</span>
          <span className="text-[#444]">/</span>
          <span className="truncate">{t("artifactViewer.chromeLabel")}</span>
        </span>

        {/* Auto-generated badge */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#27C93F] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#27C93F]" />
          </span>
          <span className="hidden text-[10px] text-[#27C93F] sm:inline">
            {t("artifactViewer.autoGenerated")}
          </span>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex items-center border-b border-white/[0.08] bg-[#161616]">
        <div className="flex flex-1 overflow-x-auto">
          {TABS.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setActiveTab(tb.id)}
              className={`
                relative flex shrink-0 items-center gap-1.5 px-3 py-2 text-xs transition-all duration-150 sm:px-4
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#3b82f6]
                ${
                  tb.id === activeTab
                    ? "border-b-2 border-[#3b82f6] bg-[#0e0e0e] text-[#e2e8f0]"
                    : "text-[#666] hover:text-[#a3a3a3] hover:bg-[#1a1a1a]"
                }
              `}
            >
              <span aria-hidden="true">{tb.icon}</span>
              <span className="font-medium">{tb.label}</span>
              {tb.id === activeTab && (
                <span className="ml-1 hidden rounded bg-[#1e3a5f] px-1.5 py-0.5 text-[9px] text-[#60a5fa] md:inline">
                  {t(`artifactViewer.${tb.badgeKey}`)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Metadata at far right */}
        <div className="hidden shrink-0 items-center gap-3 px-4 text-[10px] text-[#444] lg:flex">
          <span>{tab.lines} {t("artifactViewer.lines")}</span>
          <span>~{tab.tokens} {t("artifactViewer.tokens")}</span>
        </div>
      </div>

      {/* ── Code body ── */}
      <div className="overflow-auto max-h-[320px] p-3 text-[11px] leading-[1.6] sm:max-h-[380px] sm:p-4 sm:text-[12px] sm:leading-[1.65]">
        <table className="w-full border-collapse">
          <tbody>
            {codeLines.map((line, i) => (
              <tr
                key={i}
                className="group hover:bg-white/[0.03] transition-colors duration-75"
              >
                {/* Line number */}
                <td
                  className="w-8 select-none pr-4 text-right text-[10px] text-[#444] group-hover:text-[#666]"
                  style={{ userSelect: "none" }}
                >
                  {i + 1}
                </td>
                {/* Code */}
                <td className="whitespace-pre-wrap break-all">
                  {highlightMarkdown(line, i)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Status bar ── */}
      <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] bg-[#1a1a1a] px-3 py-1.5 text-[10px] text-[#555] sm:px-4">
        <span className="hidden sm:inline">{t("artifactViewer.statusBar")}</span>
        <span>
          {t("artifactViewer.budget")} {tab.tokens} / 2000 {t("artifactViewer.tokens")}
          <span
            className="ml-2 inline-block h-1.5 rounded-full"
            style={{
              width: `${Math.min((tab.tokens / 2000) * 60, 60)}px`,
              background:
                tab.tokens < 1600
                  ? "linear-gradient(90deg, #27C93F, #3b82f6)"
                  : "linear-gradient(90deg, #f59e0b, #ef4444)",
              display: "inline-block",
              verticalAlign: "middle",
              marginLeft: "6px",
            }}
          />
        </span>
      </div>
    </div>
  );
}
