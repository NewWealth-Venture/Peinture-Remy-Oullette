"use client";

import { useState } from "react";
import { SidebarNav } from "./SidebarNav";
import { Topbar } from "./Topbar";
import { MobileNavDrawer } from "./MobileNavDrawer";
import type { Profile } from "@/lib/auth/auth";

export function AppShell({ children, profile }: { children: React.ReactNode; profile: Profile }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-neutral-white">
      <SidebarNav profile={profile} />
      <MobileNavDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} profile={profile} />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Topbar onOpenMenu={() => setMobileMenuOpen(true)} profile={profile} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
