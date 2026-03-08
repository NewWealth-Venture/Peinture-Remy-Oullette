"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { AssistantTriggerButton } from "@/components/assistant/AssistantTriggerButton";

const breadcrumbMap: Record<string, { category: string; page: string }> = {
  "/accueil/overview": { category: "Dashboard", page: "Vue d'ensemble" },
  "/accueil/agenda": { category: "Agenda", page: "Planification" },
  "/accueil/chantiers": { category: "Chantiers", page: "Projets" },
  "/accueil/estime": { category: "Chantiers", page: "Estimés" },
  "/accueil/annonces": { category: "Communication", page: "Annonces" },
  "/employes/liste": { category: "Équipe", page: "Employés" },
  "/employes/pointage": { category: "Équipe", page: "Pointage" },
  "/employes/affectations": { category: "Équipe", page: "Affectations" },
  "/employes/avancement": { category: "Équipe", page: "Avancement quotidien" },
  "/employes/materiel": { category: "Matériel", page: "Matériel utilisé" },
  "/employes/demandes": { category: "Équipe", page: "Demandes" },
  "/patron/centre": { category: "Dashboard", page: "Centre" },
  "/patron/rapports": { category: "Dashboard", page: "Rapports" },
  "/patron/projets": { category: "Chantiers", page: "Projets" },
  "/patron/inventaire": { category: "Matériel", page: "Inventaire" },
  "/patron/affectations": { category: "Communication", page: "Brief & instructions" },
  "/patron/finances": { category: "Finances", page: "Finances" },
  "/patron/parametres": { category: "Paramètres", page: "Paramètres" },
};

function getBreadcrumb(pathname: string) {
  if (breadcrumbMap[pathname]) return breadcrumbMap[pathname];
  const sorted = Object.keys(breadcrumbMap).sort((a, b) => b.length - a.length);
  const match = sorted.find((path) => pathname.startsWith(path + "/"));
  if (match) return breadcrumbMap[match];
  return { category: "Dashboard", page: "Vue d'ensemble" };
}

function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
}
function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date);
}

export function Topbar({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const pathname = usePathname();
  const { category, page } = getBreadcrumb(pathname);

  return (
    <header
      className="h-14 lg:h-[56px] shrink-0 flex items-center gap-2 sm:gap-4 lg:gap-6 px-3 sm:px-4 lg:px-6 border-b border-neutral-border bg-neutral-white min-w-0"
      role="banner"
    >
      {onOpenMenu != null && (
        <button
          type="button"
          onClick={onOpenMenu}
          className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center -ml-1 rounded text-neutral-text hover:bg-neutral-bg-subtle focus-ring"
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} strokeWidth={1.7} />
        </button>
      )}

      <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 sm:gap-2 text-caption shrink-0 min-w-0" style={{ fontSize: "13px" }}>
        <Link href="/accueil/overview" className="text-neutral-text-secondary hover:text-neutral-text focus-ring rounded truncate max-w-[120px] sm:max-w-none">
          {category}
        </Link>
        <span className="text-neutral-border shrink-0" aria-hidden>/</span>
        <span className="text-neutral-text font-medium truncate max-w-[140px] sm:max-w-[200px] lg:max-w-none">{page}</span>
      </nav>

      <div className="hidden md:flex flex-1 justify-center min-w-0 max-w-md mx-auto">
        <input
          type="search"
          disabled
          placeholder="Rechercher (bientôt)"
          aria-label="Recherche (bientôt)"
          className="w-full h-9 px-3 rounded border border-neutral-border bg-neutral-bg-subtle text-caption text-neutral-text-secondary placeholder:text-neutral-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-transparent disabled:cursor-not-allowed"
          style={{ fontSize: "13px" }}
        />
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
        <AssistantTriggerButton />
        <time
          className="text-caption text-neutral-text-secondary"
          dateTime={new Date().toISOString().slice(0, 10)}
          style={{ fontSize: "13px" }}
          title={formatDateLong(new Date())}
        >
          <span className="hidden lg:inline">{formatDateLong(new Date())}</span>
          <span className="lg:hidden">{formatDateShort(new Date())}</span>
        </time>
        <button type="button" disabled className="hidden lg:flex text-caption text-neutral-text-secondary cursor-not-allowed focus-ring rounded px-2 py-1 min-h-[44px] items-center" style={{ fontSize: "13px" }}>
          Aide
        </button>
      </div>
    </header>
  );
}
