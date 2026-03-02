"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/patron/inventaire/catalogue", label: "Catalogue" },
  { href: "/patron/inventaire/mouvements", label: "Mouvements" },
  { href: "/patron/inventaire/emplacements", label: "Emplacements" },
  { href: "/patron/inventaire/alertes", label: "Alertes" },
] as const;

export function InventoryTabs() {
  const pathname = usePathname();

  return (
    <div className="flex border-b border-neutral-border mb-4">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2.5 text-caption font-medium border-b-2 -mb-px transition-colors focus-ring ${
              isActive ? "border-primary-blue text-primary-blue" : "border-transparent text-neutral-text-secondary hover:text-neutral-text"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
