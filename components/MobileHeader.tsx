import { LogOut, Disc3 } from "lucide-react";
import { logout } from "@/app/actions/auth";
import JamControl from "@/components/Jam/JamControl";

export default function MobileHeader() {
  return (
    <header className="glass sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] px-4 py-3 md:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)]">
          <Disc3 className="h-4 w-4 text-[var(--accent-contrast)]" strokeWidth={2.2} />
        </div>
        <span className="text-base font-bold tracking-tight">Munnu Music</span>
      </div>

      <div className="flex items-center gap-1">
        <JamControl iconOnly />
        <form action={logout}>
          <button
            type="submit"
            aria-label="Log out"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-faint)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]"
          >
            <LogOut size={18} strokeWidth={2} />
          </button>
        </form>
      </div>
    </header>
  );
}
