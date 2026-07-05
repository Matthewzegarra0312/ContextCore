"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { TerminalAnimation } from "@/components/TerminalAnimation";
import { SiteFooter } from "@/components/SiteFooter";
import { useT } from "@/lib/i18n";

// Renders the install description, wrapping the {placeholder} tokens in
// <code> tags while keeping the surrounding sentence fully translated.
const INSTALL_CODE_TOKENS: Record<string, string> = {
  "{postCommit}": "post-commit",
  "{agentsMd}": "AGENTS.md",
  "{claudeMd}": "CLAUDE.md",
  "{cursorRules}": ".cursor/rules/",
};

function InstallDescription() {
  const t = useT();
  const raw = t("landing.installDescription");
  const parts = raw.split(/(\{postCommit\}|\{agentsMd\}|\{claudeMd\}|\{cursorRules\})/g);

  return (
    <>
      {parts.map((part, i) =>
        part in INSTALL_CODE_TOKENS ? (
          <code key={i} className="rounded bg-[var(--page)] px-1.5 py-0.5 text-xs">
            {INSTALL_CODE_TOKENS[part]}
          </code>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function LandingPage() {
  const t = useT();

  return (
    <div className="min-h-screen bg-[var(--page)]">

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--page)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-y-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            {/* Logo mark */}
            <Image
              src="/logo-contextcore.webp"
              alt="ContextCore"
              width={36}
              height={36}
              className="h-9 w-9 rounded-md object-contain"
              priority
            />
            <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
              {t("common.brand")}
            </span>
          </div>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="rounded-md px-2 py-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--series-1)]"
            >
              {t("common.dashboardLink")}
            </Link>
            <LanguageSwitcher />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section
          className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:gap-12"
          aria-label={t("landing.heroAriaLabel")}
        >
          {/* Left: copy */}
          <div className="flex-1 space-y-5 sm:space-y-6">
            <p className="text-xs font-medium text-[var(--series-1)] sm:text-sm">
              {t("landing.badge")}
            </p>

            <h1
              id="hero-heading"
              className="text-3xl font-semibold leading-tight tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl"
            >
              {t("landing.heroTitlePrefix")}{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--series-1), var(--series-2))",
                }}
              >
                {t("landing.heroTitleHighlight")}
              </span>
            </h1>

            <p className="max-w-md text-base text-[var(--text-secondary)] sm:text-lg">
              {t("landing.heroSubtitle")}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:brightness-110 hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--series-1)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)]"
                style={{ background: "var(--series-1)" }}
              >
                {t("landing.ctaDashboard")}
              </Link>
              <a
                href="https://github.com/Matthewzegarra0312/ContextCore"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-all hover:border-[var(--text-muted)] hover:shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--series-1)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("landing.ctaGithub")}
              </a>
            </div>
          </div>

          {/* Right: animated terminal */}
          <div className="w-full min-w-0 flex-none lg:w-[480px]">
            <TerminalAnimation />
          </div>
        </section>

        {/* ── Install snippet ──────────────────────────────────── */}
        <section className="mt-16 sm:mt-20" aria-label={t("landing.installLabel")}>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
            <div className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              {t("landing.installTitle")}
            </div>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-[var(--page)] p-4 text-xs text-[var(--text-primary)] sm:text-sm">
              <code className="font-mono">{`npm install -D @contextcore/cli\nnpx contextcore init`}</code>
            </pre>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              <InstallDescription />
            </p>
          </div>
        </section>

        {/* ── Features grid ────────────────────────────────────── */}
        <section
          className="mt-14 grid gap-5 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
          aria-label={t("landing.featuresLabel")}
        >
          <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <div
              className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-sm"
              style={{ background: "color-mix(in srgb, var(--series-1) 15%, transparent)" }}
              aria-hidden="true"
            >
              📐
            </div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {t("landing.feature1Title")}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {t("landing.feature1Desc")}
            </p>
          </article>

          <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <div
              className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-sm"
              style={{ background: "color-mix(in srgb, var(--series-2) 15%, transparent)" }}
              aria-hidden="true"
            >
              🔗
            </div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {t("landing.feature2Title")}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {t("landing.feature2Desc")}
            </p>
          </article>

          <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:col-span-2 lg:col-span-1">
            <div
              className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-sm"
              style={{ background: "color-mix(in srgb, var(--series-3) 15%, transparent)" }}
              aria-hidden="true"
            >
              📡
            </div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {t("landing.feature3Title")}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {t("landing.feature3Desc")}
            </p>
          </article>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
