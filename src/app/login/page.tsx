"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/builder";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Wrong password");
        setBusy(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex bg-olive text-cream items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
             style={{
               backgroundImage:
                 "radial-gradient(circle at 25% 30%, #F1E3C8 1px, transparent 1px), radial-gradient(circle at 75% 70%, #F1E3C8 1px, transparent 1px)",
               backgroundSize: "60px 60px, 80px 80px",
             }}
        />
        <div className="relative z-10 max-w-sm">
          <Image
            src="/sd-logo-filled.svg"
            alt="Stager Depot"
            width={160}
            height={100}
            priority
            className="h-16 w-auto mb-10"
          />
          <div className="text-[11px] uppercase tracking-eyebrow text-cream/60 font-semibold mb-4">
            Internal Tool
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Quote Builder
          </h1>
          <p className="text-cream/75 text-[15px] leading-relaxed">
            Build staging packages, send branded quotes, and track every deal
            in one shared workspace.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12 bg-body">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Image
              src="/sd-logo-filled.svg"
              alt="Stager Depot"
              width={80}
              height={50}
              className="h-11 w-auto"
            />
            <div className="h-7 w-px bg-line" />
            <div>
              <div className="text-[11px] uppercase tracking-eyebrow text-muted font-semibold leading-none">
                Internal
              </div>
              <div className="text-sm font-semibold mt-1.5 leading-none">
                Quote Builder
              </div>
            </div>
          </div>

          <div className="label-eyebrow mb-2">Sign in</div>
          <h2 className="h-display text-2xl mb-1">Welcome back</h2>
          <p className="text-muted text-sm mb-6">
            Enter the team password to access the builder.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="label-eyebrow mb-1.5">Password</div>
              <input
                autoFocus
                type="password"
                className="field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Shared team password"
              />
            </div>
            {error ? (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={busy || !password}
              className="btn btn-primary w-full justify-center py-2.5"
            >
              {busy ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="hint mt-6">
            Don&apos;t have the password? Ask Yosef.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
