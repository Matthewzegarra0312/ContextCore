export type Locale = "en" | "fr" | "es";

export const LOCALES: Locale[] = ["en", "fr", "es"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
  es: "🇪🇸",
};

export const DEFAULT_LOCALE: Locale = "en";

/** Recursively builds a union of dot-separated paths for a nested object type. */
export type DotPaths<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string
        ? K
        : `${K}.${DotPaths<T[K]>}`;
    }[keyof T & string];
