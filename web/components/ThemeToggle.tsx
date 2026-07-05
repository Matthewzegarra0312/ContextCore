"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function ThemeToggle() {
  const t = useT();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [iconKey, setIconKey] = useState(0);

  // Avoid hydration mismatch: only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  function toggle() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    setIconKey((k) => k + 1); // remount icon to trigger CSS animation
  }

  // Render empty placeholder with same dimensions to avoid layout shift
  if (!mounted) {
    return (
      <div
        className="h-9 w-9 rounded-lg"
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? t("themeToggle.ariaToLight") : t("themeToggle.ariaToDark")}
      title={isDark ? t("themeToggle.titleLight") : t("themeToggle.titleDark")}
      className="
        flex h-9 w-9 items-center justify-center rounded-lg
        border border-[var(--border)]
        bg-[var(--surface)]
        text-[var(--text-secondary)]
        transition-all duration-200
        hover:border-[var(--text-muted)]
        hover:text-[var(--text-primary)]
        hover:scale-105
        active:scale-95
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[var(--series-1)]
        focus-visible:ring-offset-2
        focus-visible:ring-offset-[var(--page)]
      "
    >
      <span key={iconKey} className="theme-icon-enter">
        {isDark ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}
