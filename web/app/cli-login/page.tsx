"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useT } from "@/lib/i18n";

type Status = "loading" | "ready" | "authorizing" | "done" | "error";

function CliLoginContent() {
  const t = useT();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setErrorMsg(t("auth.cliInvalid"));
      setStatus("error");
    } else {
      setStatus("ready");
    }
  }, [code, t]);

  async function handleAuthorize() {
    if (!code) return;
    setStatus("authorizing");
    try {
      const res = await fetch("/api/cli/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("auth.cliInvalid"));
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("auth.cliInvalid"));
      setStatus("error");
    }
  }

  // Mismo código corto que el CLI imprime en la terminal — el usuario lo
  // compara antes de autorizar, para no aprobar un login que no inició él.
  const shortCode = code ? code.replace(/-/g, "").slice(0, 8).toUpperCase() : "";

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
              {status === "done" ? t("auth.cliSuccessTitle") : t("auth.cliTitle")}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {status === "done" ? t("auth.cliSuccessSubtitle") : t("auth.cliSubtitle")}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          {status === "error" ? (
            <p className="text-center text-sm text-[var(--series-6)]">{errorMsg}</p>
          ) : status === "done" ? (
            <div className="text-center text-3xl" aria-hidden="true">
              ✅
            </div>
          ) : (
            <>
              {shortCode && (
                <div className="mb-5 text-center">
                  <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                    {t("auth.cliCodeLabel")}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-semibold tracking-[0.3em] text-[var(--text-primary)]">
                    {shortCode}
                  </p>
                </div>
              )}
              <button
                onClick={handleAuthorize}
                disabled={status !== "ready"}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:brightness-110 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: "var(--series-1)" }}
              >
                {status === "authorizing" ? t("auth.cliAuthorizing") : t("auth.cliAuthorize")}
              </button>
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

export default function CliLoginPage() {
  return (
    <Suspense fallback={null}>
      <CliLoginContent />
    </Suspense>
  );
}
