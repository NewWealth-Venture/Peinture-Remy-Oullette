"use client";

import { useState } from "react";
import { SidebarNav } from "./SidebarNav";
import { Topbar } from "./Topbar";
import { MobileNavDrawer } from "./MobileNavDrawer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-neutral-white">
      <SidebarNav />
      <MobileNavDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Topbar onOpenMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
