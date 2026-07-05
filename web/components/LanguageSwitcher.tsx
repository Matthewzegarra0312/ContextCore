"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { LOCALES, LOCALE_LABELS, LOCALE_FLAGS, type Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(next: Locale) {
    setLocale(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("languageSwitcher.ariaLabel")}
        title={t("languageSwitcher.label")}
        className="
          flex h-9 items-center gap-1.5 rounded-lg px-2.5
          border border-[var(--border)]
          bg-[var(--surface)]
          text-sm font-medium text-[var(--text-secondary)]
          transition-all duration-200
          hover:border-[var(--text-muted)]
          hover:text-[var(--text-primary)]
          active:scale-95
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[var(--series-1)]
          focus-visible:ring-offset-2
          focus-visible:ring-offset-[var(--page)]
        "
      >
        <span aria-hidden="true" className="text-base leading-none">
          {LOCALE_FLAGS[locale]}
        </span>
        <span className="hidden sm:inline">{locale.toUpperCase()}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("languageSwitcher.label")}
          className="
            absolute right-0 top-[calc(100%+6px)] z-30 min-w-[9.5rem]
            overflow-hidden rounded-lg border border-[var(--border)]
            bg-[var(--surface)] py-1 shadow-xl
            animate-[fade-up_0.15s_ease_both]
          "
        >
          {LOCALES.map((loc) => (
            <button
              key={loc}
              type="button"
              role="option"
              aria-selected={loc === locale}
              onClick={() => choose(loc)}
              className={`
                flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors duration-150
                ${
                  loc === locale
                    ? "bg-[color-mix(in_srgb,var(--series-1)_12%,transparent)] text-[var(--text-primary)] font-medium"
                    : "text-[var(--text-secondary)] hover:bg-[var(--page)] hover:text-[var(--text-primary)]"
                }
              `}
            >
              <span aria-hidden="true" className="text-base leading-none">
                {LOCALE_FLAGS[loc]}
              </span>
              {LOCALE_LABELS[loc]}
              {loc === locale && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="ml-auto text-[var(--series-1)]"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
