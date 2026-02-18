import { SidebarNav } from "./SidebarNav";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-neutral-white">
      <SidebarNav />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1180px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
