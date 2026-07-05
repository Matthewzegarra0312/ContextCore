"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { en, type Dictionary } from "./en";
import { fr } from "./fr";
import { es } from "./es";
import { DEFAULT_LOCALE, type DotPaths, type Locale } from "./types";

export const DICTIONARIES: Record<Locale, Dictionary> = { en, fr, es };

const STORAGE_KEY = "contextcore-locale";

export type TranslateKey = DotPaths<Dictionary>;
export type TranslateParams = Record<string, string | number>;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslateKey, params?: TranslateParams) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getByPath(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined,
      obj
    );
}

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in params ? String(params[key]) : match
  );
}

/** Non-hook translation helper, for use in plain functions (e.g. formatters) that already know the locale. */
export function translateStatic(
  locale: Locale,
  key: TranslateKey,
  params?: TranslateParams
): string {
  const value = getByPath(DICTIONARIES[locale], key);
  if (typeof value !== "string") {
    const fallback = getByPath(DICTIONARIES.en, key);
    return typeof fallback === "string" ? interpolate(fallback, params) : key;
  }
  return interpolate(value, params);
}

function isValidLocale(value: string | null): value is Locale {
  return value === "en" || value === "fr" || value === "es";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Read persisted preference on mount (after hydration to avoid SSR mismatch).
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isValidLocale(stored)) {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    const apply = () => {
      setLocaleState(next);
      window.localStorage.setItem(STORAGE_KEY, next);
    };

    // Smooth crossfade on browsers that support the View Transitions API
    // (progressive enhancement — falls back to an instant swap elsewhere).
    const supportsViewTransitions =
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (supportsViewTransitions) {
      (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(
        apply
      );
    } else {
      apply();
    }
  }, []);

  const t = useCallback(
    (key: TranslateKey, params?: TranslateParams) => {
      const value = getByPath(DICTIONARIES[locale], key);
      if (typeof value !== "string") {
        // Fall back to English, then to the raw key, so a missing
        // translation never crashes the UI mid-hackathon-demo.
        const fallback = getByPath(DICTIONARIES.en, key);
        return typeof fallback === "string" ? interpolate(fallback, params) : key;
      }
      return interpolate(value, params);
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

export function useT() {
  return useLanguage().t;
}

export function useLocale() {
  return useLanguage().locale;
}
