"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  FolderKanban,
  Users,
  Package,
  Megaphone,
  Banknote,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = { href: string; label: string };
type NavGroup = { id: string; label: string; icon: LucideIcon; items: NavItem[] };

const SIDEBAR_GROUPS: NavGroup[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [{ href: "/accueil/overview", label: "Dashboard" }],
  },
  {
    id: "agenda",
    label: "Agenda",
    icon: Calendar,
    items: [{ href: "/accueil/agenda", label: "Agenda" }],
  },
  {
    id: "chantiers",
    label: "Chantiers",
    icon: FolderKanban,
    items: [
      { href: "/accueil/chantiers", label: "Projets" },
      { href: "/accueil/estime", label: "Estimés" },
    ],
  },
  {
    id: "equipe",
    label: "Équipe",
    icon: Users,
    items: [
      { href: "/employes/liste", label: "Employés" },
      { href: "/employes/affectations", label: "Affectations" },
      { href: "/employes/avancement", label: "Avancement quotidien" },
    ],
  },
  {
    id: "materiel",
    label: "Matériel",
    icon: Package,
    items: [
      { href: "/patron/inventaire", label: "Inventaire" },
      { href: "/employes/materiel", label: "Matériel utilisé" },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    icon: Megaphone,
    items: [
      { href: "/patron/affectations", label: "Brief & instructions" },
      { href: "/accueil/annonces", label: "Annonces" },
    ],
  },
  {
    id: "finances",
    label: "Finances",
    icon: Banknote,
    items: [{ href: "/patron/finances", label: "Finances" }],
  },
  {
    id: "parametres",
    label: "Paramètres",
    icon: Settings,
    items: [{ href: "/patron/parametres", label: "Paramètres" }],
  },
];

const DEFAULT_OPEN_GROUPS = new Set(["dashboard", "chantiers", "equipe", "materiel", "communication"]);

function getGroupIdForPath(pathname: string): string | null {
  for (const g of SIDEBAR_GROUPS) {
    if (g.items.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"))) return g.id;
  }
  return null;
}

export function SidebarNav() {
  const pathname = usePathname();
  const activeGroupId = useMemo(() => getGroupIdForPath(pathname), [pathname]);

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(DEFAULT_OPEN_GROUPS));

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (activeGroupId) next.add(activeGroupId);
      return next;
    });
  }, [activeGroupId]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <aside
      className="w-sidebar shrink-0 flex flex-col min-h-screen border-r border-neutral-border bg-neutral-white"
      role="navigation"
      aria-label="Menu principal"
    >
      <div className="p-3 border-b border-neutral-border shrink-0">
        <Link
          href="/accueil/overview"
          className="flex items-center gap-2.5 focus-ring rounded px-2 py-1.5 -mx-0.5"
          aria-label="Accueil"
        >
          <div
            className="h-7 w-7 shrink-0 rounded-md bg-primary-blue flex items-center justify-center text-white font-heading font-semibold text-caption-xs"
            aria-hidden
          >
            PR
          </div>
          <span className="font-heading font-semibold text-primary-blue text-[13px] leading-tight truncate">
            Peinture Rémy Ouellette
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-0.5 px-2">
          {SIDEBAR_GROUPS.map((group) => {
            const isOpen = openGroups.has(group.id) || group.items.length === 1;
            const Icon = group.icon;
            const hasChildren = group.items.length > 1;
            const firstHref = group.items[0].href;

            return (
              <li key={group.id}>
                {hasChildren ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center gap-2 h-8 px-2 rounded-md text-left text-caption font-medium text-neutral-text hover:bg-neutral-bg-subtle transition-colors focus-ring"
                      style={{ fontSize: "13px" }}
                    >
                      {isOpen ? (
                        <ChevronDown size={14} className="shrink-0 text-neutral-text-secondary" />
                      ) : (
                        <ChevronRight size={14} className="shrink-0 text-neutral-text-secondary" />
                      )}
                      <Icon size={16} strokeWidth={1.7} className="shrink-0 text-neutral-text-secondary" />
                      <span className="truncate">{group.label}</span>
                    </button>
                    {isOpen && (
                      <ul className="ml-4 mt-0.5 mb-1 space-y-0.5 border-l border-neutral-border pl-3">
                        {group.items.map((item) => {
                          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className={`
                                  flex items-center h-7 px-2 rounded-md text-caption transition-colors focus-ring
                                  ${isActive ? "bg-neutral-bg-active text-neutral-text font-medium" : "text-neutral-text-secondary hover:bg-neutral-bg-subtle hover:text-neutral-text"}
                                `}
                                style={{ fontSize: "13px" }}
                              >
                                <span className="truncate">{item.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={firstHref}
                    className={`
                      flex items-center gap-2 h-8 px-2 rounded-md text-caption transition-colors focus-ring
                      ${pathname === firstHref ? "bg-neutral-bg-active text-neutral-text font-medium" : "text-neutral-text hover:bg-neutral-bg-subtle"}
                    `}
                    style={{ fontSize: "13px" }}
                  >
                    <Icon size={16} strokeWidth={1.7} className="shrink-0 text-neutral-text-secondary" />
                    <span className="truncate">{group.items[0].label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
