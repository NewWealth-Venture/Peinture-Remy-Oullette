"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { getSidebarGroupsForRole, getGroupIdForPath, type NavRole } from "@/lib/nav-config";

const DEFAULT_OPEN = new Set(["dashboard", "chantiers", "equipe", "materiel", "communication"]);

export function MobileNavDrawer({ open, onClose, role = "patron" }: { open: boolean; onClose: () => void; role?: NavRole }) {
  const pathname = usePathname();
  const groups = useMemo(() => getSidebarGroupsForRole(role), [role]);
  const activeGroupId = useMemo(() => getGroupIdForPath(pathname, groups), [pathname, groups]);
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(DEFAULT_OPEN));

  useEffect(() => {
    if (!open) return;
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (activeGroupId) next.add(activeGroupId);
      return next;
    });
  }, [open, activeGroupId]);

  useEffect(() => {
    if (open) {
      const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", onEsc);
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", onEsc);
        document.body.style.overflow = "";
      };
    }
  }, [open, onClose]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" aria-hidden onClick={onClose} />
      <aside
        className="fixed top-0 left-0 z-50 w-[min(320px,85vw)] max-w-full h-full flex flex-col bg-neutral-white border-r border-neutral-border shadow-lg lg:hidden"
        role="dialog"
        aria-label="Menu navigation"
      >
        <div className="flex items-center justify-between p-3 border-b border-neutral-border shrink-0">
          <Link href="/accueil/overview" onClick={onClose} className="block h-12 w-32 relative rounded overflow-hidden focus-ring">
            <Image src="/logo.png" alt="Peinture Rémy Ouellette" fill className="object-contain object-left" sizes="128px" />
          </Link>
          <button type="button" onClick={onClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded text-neutral-text hover:bg-neutral-bg-subtle focus-ring" aria-label="Fermer le menu">
            <X size={22} strokeWidth={1.7} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="space-y-0.5">
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
                        className="w-full flex items-center gap-3 min-h-[44px] px-3 rounded-md text-left text-caption font-medium text-neutral-text hover:bg-neutral-bg-subtle transition-colors focus-ring"
                        style={{ fontSize: "14px" }}
                      >
                        {isOpen ? <ChevronDown size={18} className="shrink-0 text-neutral-text-secondary" /> : <ChevronRight size={18} className="shrink-0 text-neutral-text-secondary" />}
                        <Icon size={20} strokeWidth={1.7} className="shrink-0 text-neutral-text-secondary" />
                        <span className="truncate">{group.label}</span>
                      </button>
                      {isOpen && (
                        <ul className="ml-4 mt-0.5 mb-2 space-y-0.5 border-l border-neutral-border pl-3">
                          {group.items.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  onClick={onClose}
                                  className={`flex items-center min-h-[44px] px-3 rounded-md text-caption transition-colors focus-ring ${isActive ? "bg-neutral-bg-active text-neutral-text font-medium" : "text-neutral-text-secondary hover:bg-neutral-bg-subtle hover:text-neutral-text"}`}
                                  style={{ fontSize: "14px" }}
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
                      onClick={onClose}
                      className={`flex items-center gap-3 min-h-[44px] px-3 rounded-md text-caption transition-colors focus-ring ${pathname === firstHref ? "bg-neutral-bg-active text-neutral-text font-medium" : "text-neutral-text hover:bg-neutral-bg-subtle"}`}
                      style={{ fontSize: "14px" }}
                    >
                      <Icon size={20} strokeWidth={1.7} className="shrink-0 text-neutral-text-secondary" />
                      <span className="truncate">{group.items[0].label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
