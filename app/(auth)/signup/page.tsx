"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Disc3 } from "lucide-react";
import { signup } from "@/app/actions/auth";

const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent)]/60";
const labelClass = "text-xs font-medium text-[var(--text-muted)]";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="app-backdrop flex min-h-screen items-center justify-center px-4 py-10">
      <form
        action={action}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col items-center gap-3 pb-1 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] shadow-[0_0_24px_var(--accent-glow)]">
            <Disc3 className="h-6 w-6 text-[var(--accent-contrast)]" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Join Munnu Music</h1>
            <p className="text-sm text-[var(--text-muted)]">You&apos;ll need an invite code</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input id="name" name="name" required className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inviteCode" className={labelClass}>
            Invite code
          </label>
          <input id="inviteCode" name="inviteCode" required className={inputClass} />
        </div>

        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] py-2.5 font-semibold text-[var(--accent-contrast)] transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-center text-sm text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--text)] underline underline-offset-2">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
