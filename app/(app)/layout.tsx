import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import MobileNav from "@/components/MobileNav";
import PlayerBar from "@/components/Player/PlayerBar";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="app-backdrop flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto pb-40 text-[var(--text)] md:pb-28">
          {children}
        </main>
      </div>
      <PlayerBar />
      <MobileNav />
    </div>
  );
}
