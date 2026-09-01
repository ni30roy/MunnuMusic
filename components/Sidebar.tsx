import Link from "next/link";
import { logout } from "@/app/actions/auth";

const links = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/library", label: "Your Library" },
  { href: "/upload", label: "Upload" },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col justify-between border-r border-neutral-800 bg-black p-4 text-white">
      <div>
        <p className="mb-6 px-2 text-xl font-bold">🎵 Munnu Music</p>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded px-2 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-900 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <form action={logout}>
        <button
          type="submit"
          className="w-full rounded px-2 py-2 text-left text-sm text-neutral-400 hover:bg-neutral-900 hover:text-white"
        >
          Log out
        </button>
      </form>
    </aside>
  );
}
