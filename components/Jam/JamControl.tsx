"use client";

import { useState } from "react";
import { Radio, X, Copy, Check, LogOut as LeaveIcon } from "lucide-react";
import { useJamStore } from "@/lib/store/jamStore";
import { createJam, leaveJam } from "@/app/actions/jam";

export default function JamControl({ iconOnly = false }: { iconOnly?: boolean }) {
  const jamCode = useJamStore((s) => s.jamCode);
  const setJamCode = useJamStore((s) => s.setJamCode);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleStart() {
    setBusy(true);
    const code = await createJam();
    setJamCode(code);
    setBusy(false);
  }

  async function handleLeave() {
    if (!jamCode) return;
    setBusy(true);
    await leaveJam(jamCode);
    setJamCode(null);
    setBusy(false);
    setOpen(false);
  }

  function handleCopy() {
    if (!jamCode) return;
    const link = `${window.location.origin}/jam/${jamCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Jam"
        className={
          iconOnly
            ? "flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-faint)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]"
            : `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                jamCode
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface)]/60 hover:text-[var(--text)]"
              }`
        }
      >
        <Radio size={iconOnly ? 18 : 18} strokeWidth={2} />
        {!iconOnly && (jamCode ? `Jamming · ${jamCode}` : "Jam")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">Jam</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-[var(--text-faint)] hover:text-[var(--text)]"
              >
                <X size={18} />
              </button>
            </div>

            {jamCode ? (
              <div className="space-y-4">
                <p className="text-sm text-[var(--text-muted)]">
                  Anyone with this link can join and control what plays.
                </p>
                <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
                  <span className="font-mono text-lg font-bold tracking-widest text-[var(--accent)]">
                    {jamCode}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-full bg-[var(--surface-hover)] px-3 py-1.5 text-xs font-semibold"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy link"}
                  </button>
                </div>
                <button
                  onClick={handleLeave}
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] py-2.5 text-sm font-semibold text-red-400 disabled:opacity-60"
                >
                  <LeaveIcon size={16} />
                  Leave jam
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[var(--text-muted)]">
                  Start a jam and share the link — whoever joins hears exactly what
                  you&apos;re playing, in sync.
                </p>
                <button
                  onClick={handleStart}
                  disabled={busy}
                  className="w-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] py-2.5 font-semibold text-[var(--accent-contrast)] transition-transform active:scale-[0.98] disabled:opacity-60"
                >
                  {busy ? "Starting..." : "Start a jam"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
