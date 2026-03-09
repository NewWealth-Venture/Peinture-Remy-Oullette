"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  getGroupsForCategory,
  getGroupIdForPath,
  getCategoryForPath,
  getDefaultPathForCategory,
  getStoredCategory,
  setStoredCategory,
  type NavCategory,
} from "@/lib/navigation/config";
import type { Profile } from "@/lib/auth/auth";

const COMPANY_NAME = "Peinture Rémy Ouellette";

function CategorySwitch({
  activeCategory,
  onSwitch,
}: {
  activeCategory: NavCategory;
  onSwitch: (category: NavCategory) => void;
}) {
  return (
    <div
      className="flex rounded-md p-0.5 bg-neutral-bg-subtle border border-neutral-border"
      style={{ borderRadius: "6px" }}
      role="tablist"
      aria-label="Contexte de navigation"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeCategory === "employes"}
        onClick={() => onSwitch("employes")}
        className={`flex-1 min-w-0 py-2 px-3 rounded text-caption font-medium transition-colors focus-ring h-9 ${activeCategory === "employes" ? "bg-neutral-white text-neutral-text shadow-sm border border-neutral-border" : "text-neutral-text-secondary hover:text-neutral-text"}`}
        style={{ fontSize: "13px", borderRadius: "5px" }}
      >
        Employés
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeCategory === "direction"}
        onClick={() => onSwitch("direction")}
        className={`flex-1 min-w-0 py-2 px-3 rounded text-caption font-medium transition-colors focus-ring h-9 ${activeCategory === "direction" ? "bg-neutral-white text-neutral-text shadow-sm border border-neutral-border" : "text-neutral-text-secondary hover:text-neutral-text"}`}
        style={{ fontSize: "13px", borderRadius: "5px" }}
      >
        Direction
      </button>
    </div>
  );
}

export function SidebarNav({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<NavCategory>(() =>
    getCategoryForPath(pathname, getStoredCategory())
  );

  useEffect(() => {
    const stored = getStoredCategory();
    if (stored == null && profile?.role) {
      setStoredCategory(profile.role === "employe" ? "employes" : "direction");
    }
  }, [profile?.role]);

  useEffect(() => {
    setActiveCategory((prev) => getCategoryForPath(pathname, prev));
  }, [pathname]);

  const groups = useMemo(() => getGroupsForCategory(activeCategory), [activeCategory]);
  const activeGroupId = useMemo(() => getGroupIdForPath(pathname, groups), [pathname, groups]);
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(groups.map((g) => g.id)));

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (activeGroupId) next.add(activeGroupId);
      groups.forEach((g) => next.add(g.id));
      return next;
    });
  }, [activeGroupId, groups]);

  const handleCategorySwitch = (category: NavCategory) => {
    setStoredCategory(category);
    setActiveCategory(category);
    router.push(getDefaultPathForCategory(category));
  };

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
      className="hidden lg:flex w-sidebar shrink-0 flex-col min-h-screen border-r border-neutral-border bg-neutral-white"
      role="navigation"
      aria-label="Menu principal"
    >
      <div className="p-3 border-b border-neutral-border shrink-0 space-y-3">
        <Link
          href={getDefaultPathForCategory(activeCategory)}
          className="block w-full h-12 rounded-md overflow-hidden focus-ring relative"
          aria-label={`${COMPANY_NAME} - Accueil`}
        >
          <Image src="/logo.png" alt="" fill className="object-cover" sizes="260px" />
        </Link>
        <p className="text-caption font-medium text-neutral-text truncate px-0.5" style={{ fontSize: "12px" }}>
          {COMPANY_NAME}
        </p>
        <CategorySwitch activeCategory={activeCategory} onSwitch={handleCategorySwitch} />
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-0.5 px-2">
          {groups.map((group) => {
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
                      className="w-full flex items-center gap-2 h-9 px-2 rounded-md text-left text-caption font-medium text-neutral-text hover:bg-neutral-bg-subtle transition-colors focus-ring"
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
                                className={`flex items-center h-9 px-2 rounded-md text-caption transition-colors focus-ring ${isActive ? "bg-neutral-bg-active text-neutral-text font-medium" : "text-neutral-text-secondary hover:bg-neutral-bg-subtle hover:text-neutral-text"}`}
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
                    className={`flex items-center gap-2 h-9 px-2 rounded-md text-caption transition-colors focus-ring ${pathname === firstHref ? "bg-neutral-bg-active text-neutral-text font-medium" : "text-neutral-text hover:bg-neutral-bg-subtle"}`}
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
