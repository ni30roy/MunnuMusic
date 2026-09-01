"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Disc3 } from "lucide-react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="app-backdrop flex min-h-screen items-center justify-center px-4">
      <form
        action={action}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col items-center gap-3 pb-1 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] shadow-[0_0_24px_var(--accent-glow)]">
            <Disc3 className="h-6 w-6 text-[var(--accent-contrast)]" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-[var(--text-muted)]">Log in to Munnu Music</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-medium text-[var(--text-muted)]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent)]/60"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-medium text-[var(--text-muted)]">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent)]/60"
          />
        </div>

        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] py-2.5 font-semibold text-[var(--accent-contrast)] transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Logging in..." : "Log in"}
        </button>

        <p className="text-center text-sm text-[var(--text-muted)]">
          No account?{" "}
          <Link href="/signup" className="font-medium text-[var(--text)] underline underline-offset-2">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
