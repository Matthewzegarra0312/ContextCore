"use client";

import Image from "next/image";
import { useT } from "@/lib/i18n";

const TEAM_NAME = "LEAD";
const UTP_NAME = "Universidad Tecnológica del Perú";
const UTP_URL = "https://www.utp.edu.pe";
const LEAD_COMMUNITY_URL = "https://www.leadmindset.org";

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)]
        transition-colors hover:text-[var(--series-1)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--series-1)] focus-visible:rounded-sm
      "
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="opacity-40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
      >
        <path d="M7 17 17 7" />
        <path d="M7 7h10v10" />
      </svg>
    </a>
  );
}

export function SiteFooter() {
  const t = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand + team tagline */}
          <div className="max-w-sm space-y-3">
            <div className="flex items-center gap-2">
              <Image
                src="/logo-contextcore.webp"
                alt="ContextCore"
                width={28}
                height={28}
                className="h-7 w-7 rounded-md object-contain"
              />
              <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
                ContextCore
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {t("footer.builtBy", { team: TEAM_NAME })}
            </p>
            <p className="text-sm text-[var(--text-muted)]">{t("footer.tagline")}</p>
          </div>

          {/* Affiliations */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              {t("footer.affiliationsTitle")}
            </h2>
            <ul className="space-y-2.5">
              <li className="flex items-baseline gap-1.5 text-sm text-[var(--text-muted)]">
                <span className="shrink-0">{t("footer.studentsAt")}</span>
                <ExternalLink href={UTP_URL}>{UTP_NAME}</ExternalLink>
              </li>
              <li className="flex items-baseline gap-1.5 text-sm text-[var(--text-muted)]">
                <span className="shrink-0">{t("footer.partOf")}</span>
                <ExternalLink href={LEAD_COMMUNITY_URL}>{TEAM_NAME}</ExternalLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-4 text-center text-xs text-[var(--text-muted)]">
          <span>© {year} {TEAM_NAME}</span>
          <span className="px-1.5" aria-hidden="true">·</span>
          <span>{t("footer.rights")}</span>
        </div>
      </div>
    </footer>
  );
}
