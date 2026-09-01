import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import PlayerBar from "@/components/Player/PlayerBar";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="app-backdrop flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-40 text-[var(--text)] md:pb-28">
        {children}
      </main>
      <PlayerBar />
      <MobileNav />
    </div>
  );
}
