"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { AssistantTriggerButton } from "@/components/assistant/AssistantTriggerButton";
import { UserMenu } from "@/components/layout/UserMenu";
import type { Profile } from "@/lib/auth/auth";
import { getCategoryForPath, getDefaultPathForCategory, getStoredCategory } from "@/lib/navigation/config";

const pageLabelMap: Record<string, string> = {
  "/accueil/overview": "Vue d'ensemble",
  "/accueil/agenda": "Planification",
  "/accueil/chantiers": "Projets",
  "/accueil/estime": "Estimés",
  "/accueil/annonces": "Annonces",
  "/employes/liste": "Employés",
  "/employes/pointage": "Pointage",
  "/employes/affectations": "Affectations",
  "/employes/avancement": "Avancement quotidien",
  "/employes/materiel": "Matériel utilisé",
  "/employes/demandes": "Demandes",
  "/patron/centre": "Dashboard direction",
  "/patron/rapports": "Rapports",
  "/patron/projets": "Chantiers",
  "/patron/inventaire": "Inventaire",
  "/patron/affectations": "Brief & instructions",
  "/patron/finances": "Finances",
  "/patron/parametres": "Paramètres",
  "/patron/projets/nouveau": "Nouveau chantier",
  "/patron/clients": "Clients",
  "/patron/clients/nouveau": "Nouveau client",
  "/patron/employes": "Employés",
  "/patron/employes/nouveau": "Nouveau employé",
  "/profil": "Mon profil",
};

function getPageLabel(pathname: string): string {
  if (pageLabelMap[pathname]) return pageLabelMap[pathname];
  const sorted = Object.keys(pageLabelMap).sort((a, b) => b.length - a.length);
  const match = sorted.find((path) => pathname.startsWith(path + "/"));
  if (match) {
    if (pathname.startsWith("/patron/projets/") && pathname !== "/patron/projets" && pathname !== "/patron/projets/nouveau")
      return "Détail chantier";
    if (pathname.startsWith("/patron/inventaire/")) return pageLabelMap["/patron/inventaire"] || "Inventaire";
    if (pathname.startsWith("/patron/clients/") && pathname !== "/patron/clients" && pathname !== "/patron/clients/nouveau")
      return "Fiche client";
    if (pathname.startsWith("/patron/employes/") && pathname !== "/patron/employes" && pathname !== "/patron/employes/nouveau")
      return "Dossier employé";
  }
  return "Vue d'ensemble";
}

function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
}
function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date);
}

export function Topbar({ onOpenMenu, profile }: { onOpenMenu?: () => void; profile: Profile }) {
  const pathname = usePathname();
  const category = getCategoryForPath(pathname, getStoredCategory());
  const sectionLabel = category === "employes" ? "Employés" : "Direction";
  const sectionHref = getDefaultPathForCategory(category);
  const page = getPageLabel(pathname);

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
        <Link href={sectionHref} className="text-neutral-text-secondary hover:text-neutral-text focus-ring rounded truncate max-w-[120px] sm:max-w-none">
          {sectionLabel}
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
        <UserMenu profile={profile} />
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
