"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  Megaphone,
  Calculator,
  Users,
  Clock,
  UserPlus,
  FileQuestion,
  Gauge,
  FileText,
  Banknote,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };
type NavCategory = { id: string; label: string; icon: LucideIcon; items: NavItem[] };

const categories: NavCategory[] = [
  {
    id: "accueil",
    label: "Accueil",
    icon: LayoutDashboard,
    items: [
      { href: "/accueil/overview", label: "Vue d'ensemble", icon: LayoutDashboard },
      { href: "/accueil/agenda", label: "Agenda", icon: Calendar },
      { href: "/accueil/chantiers", label: "Chantiers", icon: MapPin },
      { href: "/accueil/estime", label: "Estimé", icon: Calculator },
      { href: "/accueil/annonces", label: "Annonces", icon: Megaphone },
    ],
  },
  {
    id: "employes",
    label: "Employés",
    icon: Users,
    items: [
      { href: "/employes/liste", label: "Liste", icon: Users },
      { href: "/employes/pointage", label: "Pointage", icon: Clock },
      { href: "/employes/affectations", label: "Affectations", icon: UserPlus },
      { href: "/employes/demandes", label: "Demandes", icon: FileQuestion },
    ],
  },
  {
    id: "patron",
    label: "Patron",
    icon: Gauge,
    items: [
      { href: "/patron/centre", label: "Centre", icon: Gauge },
      { href: "/patron/rapports", label: "Rapports", icon: FileText },
      { href: "/patron/finances", label: "Finances", icon: Banknote },
      { href: "/patron/parametres", label: "Paramètres", icon: Settings },
    ],
  },
];

function getActiveCategory(pathname: string): string {
  if (pathname.startsWith("/accueil")) return "accueil";
  if (pathname.startsWith("/employes")) return "employes";
  if (pathname.startsWith("/patron")) return "patron";
  return "accueil";
}

export function SidebarNav() {
  const pathname = usePathname();
  const activeCategory = getActiveCategory(pathname);
  const activeGroup = categories.find((c) => c.id === activeCategory) ?? categories[0];

  return (
    <aside
      className="flex min-h-screen shrink-0 border-r border-neutral-border bg-neutral-white"
      role="navigation"
      aria-label="Menu principal"
    >
      {/* Rail */}
      <div
        className="w-[64px] flex flex-col items-center py-3 border-r border-neutral-border bg-neutral-white"
        style={{ width: "64px" }}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={cat.items[0].href}
              className={`
                relative flex items-center justify-center w-full h-12 rounded transition-colors focus-ring
                ${isActive ? "bg-neutral-bg-subtle" : "hover:bg-neutral-bg-subtle"}
              `}
              aria-current={isActive ? "true" : undefined}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary-orange rounded-r"
                  aria-hidden
                />
              )}
              <Icon size={20} strokeWidth={1.7} className="text-neutral-text" aria-hidden />
            </Link>
          );
        })}
      </div>

      {/* Panel */}
      <div
        className="w-[240px] flex flex-col bg-neutral-white overflow-hidden"
        style={{ width: "240px" }}
      >
        <div className="p-4 border-b border-neutral-border shrink-0">
          <Link
            href="/accueil/overview"
            className="flex items-center gap-3 focus-ring rounded"
            aria-label="Accueil"
          >
            <div
              className="h-7 w-7 shrink-0 rounded-full bg-primary-blue flex items-center justify-center text-white font-heading font-semibold text-caption-xs"
              aria-hidden
            >
              PR
            </div>
            <div className="min-w-0">
              <span className="font-heading font-semibold text-primary-blue text-[14px] leading-tight block truncate">
                Peinture Rémy Ouellette
              </span>
              <span className="text-caption-xs text-neutral-text-secondary block">
                Centre de gestion
              </span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-0.5">
            {activeGroup.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-2.5 h-[34px] px-3 rounded text-body transition-colors focus-ring
                      ${isActive ? "bg-neutral-bg-active text-neutral-text" : "text-neutral-text hover:bg-neutral-bg-subtle"}
                    `}
                    style={{ fontSize: "14px" }}
                  >
                    {isActive && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-primary-orange shrink-0"
                        aria-hidden
                      />
                    )}
                    {!isActive && <span className="w-1.5 shrink-0" aria-hidden />}
                    <Icon
                      size={18}
                      strokeWidth={1.7}
                      className={`shrink-0 ${isActive ? "text-neutral-text" : "text-neutral-text-secondary"}`}
                      aria-hidden
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
