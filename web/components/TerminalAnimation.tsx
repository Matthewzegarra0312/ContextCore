"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";

// ─── Script definition ────────────────────────────────────────────────────────

type StepKind =
  | { type: "command"; text: string }
  | { type: "output"; text: string; color: "green" | "muted" }
  | { type: "pause"; ms: number };

const SCRIPT: StepKind[] = [
  { type: "command", text: "npm install -D @contextcore/cli" },
  { type: "pause",   ms: 400 },
  { type: "command", text: "npx contextcore init" },
  { type: "pause",   ms: 500 },
  { type: "output",  text: "✓ Stack detectado: Next.js + TypeScript", color: "green" },
  { type: "output",  text: "✓ Hook post-commit instalado",            color: "green" },
  { type: "output",  text: "✓ AGENTS.md generado",                   color: "green" },
  { type: "pause",   ms: 600 },
  { type: "command", text: 'git commit -m "feat: nueva función"' },
  { type: "pause",   ms: 500 },
  { type: "output",  text: "→ Actualizando AGENTS.md...",             color: "muted" },
  { type: "output",  text: "→ Actualizando CLAUDE.md...",             color: "muted" },
  { type: "output",  text: "→ Actualizando .cursor/rules...",         color: "muted" },
  { type: "output",  text: "✓ Contexto sincronizado",                 color: "green" },
];

// ─── Typewriter timing constants ──────────────────────────────────────────────
const CHAR_DELAY_MS    = 38;  // ms per character (typewriter speed)
const OUTPUT_DELAY_MS  = 260; // ms before output line appears
const LOOP_PAUSE_MS    = 2000; // ms before restarting the loop

// ─── Rendered line types ─────────────────────────────────────────────────────

type RenderedLine =
  | { kind: "command"; text: string; partial: boolean }
  | { kind: "output";  text: string; color: "green" | "muted" };

// ─── Component ───────────────────────────────────────────────────────────────

export function TerminalAnimation() {
  const t = useT();
  const [lines, setLines]         = useState<RenderedLine[]>([]);
  const [showCursor, setShowCursor] = useState(false);
  const bodyRef                   = useRef<HTMLDivElement>(null);
  const cancelRef                 = useRef(false); // flag to abort in-progress animation on unmount

  // Auto-scroll the terminal's own body only — never the page. Using
  // scrollTop on the container (instead of scrollIntoView) keeps the rest
  // of the landing page perfectly still while the CLI "types".
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.scrollTop = body.scrollHeight;
  }, [lines]);

  // Main animation loop
  useEffect(() => {
    cancelRef.current = false;
    let timeout: ReturnType<typeof setTimeout>;

    async function runScript() {
      if (cancelRef.current) return;

      // Clear lines and start fresh
      setLines([]);
      setShowCursor(false);

      for (const step of SCRIPT) {
        if (cancelRef.current) return;

        if (step.type === "pause") {
          await delay(step.ms);
          continue;
        }

        if (step.type === "output") {
          await delay(OUTPUT_DELAY_MS);
          if (cancelRef.current) return;
          setLines((prev) => [...prev, { kind: "output", text: step.text, color: step.color }]);
          continue;
        }

        if (step.type === "command") {
          // Push a new command line (empty, partial=true) to show cursor
          setLines((prev) => [...prev, { kind: "command", text: "", partial: true }]);
          setShowCursor(true);

          // Type character by character
          const fullText = step.text;
          for (let i = 0; i <= fullText.length; i++) {
            if (cancelRef.current) return;
            const typed = fullText.slice(0, i);
            setLines((prev) => {
              const next = [...prev];
              next[next.length - 1] = { kind: "command", text: typed, partial: true };
              return next;
            });
            if (i < fullText.length) {
              await delay(CHAR_DELAY_MS);
            }
          }

          // Mark as complete (hides inline cursor, line is done)
          setShowCursor(false);
          setLines((prev) => {
            const next = [...prev];
            next[next.length - 1] = { kind: "command", text: fullText, partial: false };
            return next;
          });
          await delay(180); // brief pause after finishing a command
        }
      }

      // End of script — pause then restart
      if (!cancelRef.current) {
        timeout = setTimeout(() => {
          if (!cancelRef.current) runScript();
        }, LOOP_PAUSE_MS);
      }
    }

    runScript();

    return () => {
      cancelRef.current = true;
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      className="
        relative w-full overflow-hidden rounded-xl
        border border-white/10
        bg-[#0e0e0e]
        shadow-[0_20px_60px_rgba(0,0,0,0.5)]
        font-mono text-[12px] leading-relaxed sm:text-[13px]
      "
      role="img"
      aria-label={t("landing.terminalAriaLabel")}
    >
      {/* ── macOS-style title bar ── */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] bg-[#1c1c1c] px-3 py-3 sm:px-4">
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#FF5F56]" aria-hidden="true" />
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#FFBD2E]" aria-hidden="true" />
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#27C93F]" aria-hidden="true" />
        <span className="ml-2 truncate text-xs text-[#666] select-none">
          contextcore — cli
        </span>
      </div>

      {/* ── Terminal body ── */}
      {/* Fixed height + internal scroll: the box never grows, so it can't
          push the rest of the page down as lines are typed/appended. */}
      <div
        ref={bodyRef}
        className="h-[200px] overflow-y-auto overflow-x-auto p-4 pb-5 sm:h-[220px] sm:p-5 sm:pb-6"
      >
        {lines.map((line, i) => (
          <div key={i} className="flex">
            {line.kind === "command" ? (
              <>
                <span className="mr-2 select-none text-[#27C93F]">$</span>
                <span className="text-[#e4e4e4]">{line.text}</span>
                {/* Inline blinking cursor on the active typing line */}
                {line.partial && showCursor && (
                  <span className="cursor-blink ml-px text-[#27C93F]">▌</span>
                )}
              </>
            ) : (
              <span
                className={
                  line.color === "green"
                    ? "text-[#27C93F]"
                    : "text-[#666]"
                }
              >
                {line.text}
              </span>
            )}
          </div>
        ))}

        {/* Idle cursor when no line is being typed (between steps) */}
        {showCursor && lines.length === 0 && (
          <div className="flex">
            <span className="mr-2 select-none text-[#27C93F]">$</span>
            <span className="cursor-blink text-[#27C93F]">▌</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
