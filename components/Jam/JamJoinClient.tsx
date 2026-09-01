"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Disc3 } from "lucide-react";
import { joinJam } from "@/app/actions/jam";
import { useJamStore } from "@/lib/store/jamStore";

export default function JamJoinClient({ code }: { code: string }) {
  const router = useRouter();
  const setJamCode = useJamStore((s) => s.setJamCode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    joinJam(code).then((result) => {
      if (result.ok) {
        setJamCode(code);
        router.replace("/");
      } else {
        setError(result.error ?? "Could not join this jam.");
      }
    });
  }, [code, router, setJamCode]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] shadow-[0_0_24px_var(--accent-glow)]">
        <Disc3 className="h-7 w-7 animate-spin text-[var(--accent-contrast)]" strokeWidth={2.2} />
      </div>
      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Joining jam {code}...</p>
      )}
    </div>
  );
}
