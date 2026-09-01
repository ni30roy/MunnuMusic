"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/actions/auth";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <form
        action={action}
        className="w-full max-w-sm space-y-4 rounded-xl bg-neutral-900 p-8"
      >
        <h1 className="text-2xl font-bold text-white">Sign up</h1>

        <div className="space-y-1">
          <label htmlFor="name" className="text-sm text-neutral-400">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-md bg-neutral-800 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm text-neutral-400">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md bg-neutral-800 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm text-neutral-400">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-md bg-neutral-800 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="inviteCode" className="text-sm text-neutral-400">
            Invite code
          </label>
          <input
            id="inviteCode"
            name="inviteCode"
            required
            className="w-full rounded-md bg-neutral-800 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-green-500 py-2 font-semibold text-black disabled:opacity-60"
        >
          {pending ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-center text-sm text-neutral-400">
          Already have an account?{" "}
          <Link href="/login" className="text-white underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
