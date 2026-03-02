"use client";

import { PageHeader } from "@/components/PageHeader";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";

export default function InventaireLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 max-w-[1180px] mx-auto">
      <PageHeader title="Inventaire" subtitle="Catalogue, mouvements et stock par emplacement." />
      <InventoryTabs />
      {children}
    </div>
  );
}
