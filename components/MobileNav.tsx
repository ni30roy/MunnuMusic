"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, UploadCloud } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "/upload", label: "Upload", icon: UploadCloud },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-30 flex border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)] md:hidden">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium"
          >
            <Icon
              className={isActive ? "text-[var(--accent)]" : "text-[var(--text-faint)]"}
              size={22}
              strokeWidth={isActive ? 2.4 : 2}
            />
            <span className={isActive ? "text-[var(--text)]" : "text-[var(--text-faint)]"}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
