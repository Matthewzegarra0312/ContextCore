"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useT } from "@/lib/i18n";

function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function LoginContent() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const authError = searchParams.get("error");

  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(authError ? t("auth.loginError") : null);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user) {
        router.replace(next);
      } else {
        setChecking(false);
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next]);

  async function handleLogin() {
    if (!supabase) return;
    setError(null);
    setPending(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo },
    });
    if (signInError) {
      setError(signInError.message);
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--page)] px-4">
      <div className="w-full max-w-sm fade-up">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Image
            src="/logo-contextcore.webp"
            alt="ContextCore"
            width={44}
            height={44}
            className="h-11 w-11 rounded-md object-contain"
            priority
          />
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              {t("auth.loginTitle")}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {t("auth.loginSubtitle")}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          {!supabase ? (
            <p className="text-center text-sm text-[var(--text-muted)]">
              {t("auth.notConfigured")}
            </p>
          ) : checking ? (
            <p className="text-center text-sm text-[var(--text-muted)]">
              {t("auth.loadingSession")}
            </p>
          ) : (
            <>
              <button
                onClick={handleLogin}
                disabled={pending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--text-primary)] px-5 py-2.5 text-sm font-medium text-[var(--page)] shadow-md transition-all hover:brightness-110 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <GithubIcon />
                {t("auth.continueWithGithub")}
              </button>
              {error && (
                <p className="mt-3 text-center text-sm text-[var(--series-6)]">{error}</p>
              )}
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            {t("auth.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
