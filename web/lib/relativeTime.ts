import { translateStatic, type Locale } from "@/lib/i18n";

export function relativeTime(iso: string, locale: Locale = "en"): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return translateStatic(locale, "relativeTime.justNow");
  if (minutes < 60) return translateStatic(locale, "relativeTime.minutesAgo", { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return translateStatic(locale, "relativeTime.hoursAgo", { n: hours });
  return translateStatic(locale, "relativeTime.daysAgo", { n: Math.floor(hours / 24) });
}
