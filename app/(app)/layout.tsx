import Sidebar from "@/components/Sidebar";
import PlayerBar from "@/components/Player/PlayerBar";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-neutral-950 pb-24 text-white">
        {children}
      </main>
      <PlayerBar />
    </div>
  );
}
