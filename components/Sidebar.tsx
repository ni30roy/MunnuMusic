"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, UploadCloud, LogOut, Disc3 } from "lucide-react";
import { logout } from "@/app/actions/auth";
import JamControl from "@/components/Jam/JamControl";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Your Library", icon: Library },
  { href: "/upload", label: "Upload", icon: UploadCloud },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col justify-between border-r border-[var(--border)] bg-[var(--bg-elevated)]/80 p-5 md:flex">
      <div>
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] shadow-[0_0_20px_var(--accent-glow)]">
            <Disc3 className="h-5 w-5 text-[var(--accent-contrast)]" strokeWidth={2.2} />
          </div>
          <span className="text-lg font-bold tracking-tight">Munnu Music</span>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--surface)] text-[var(--text)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface)]/60 hover:text-[var(--text)]"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] transition-colors ${
                    isActive ? "text-[var(--accent)]" : "group-hover:text-[var(--text)]"
                  }`}
                  strokeWidth={2}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-1">
        <JamControl />
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-faint)] transition-colors hover:bg-[var(--surface)]/60 hover:text-[var(--text)]"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
