"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const breadcrumbMap: Record<string, { category: string; page: string }> = {
  "/accueil/overview": { category: "Accueil", page: "Vue d'ensemble" },
  "/accueil/agenda": { category: "Accueil", page: "Agenda & planification" },
  "/accueil/chantiers": { category: "Accueil", page: "Chantiers" },
  "/accueil/annonces": { category: "Accueil", page: "Annonces" },
  "/employes/liste": { category: "Employés", page: "Liste" },
  "/employes/pointage": { category: "Employés", page: "Pointage" },
  "/employes/affectations": { category: "Employés", page: "Affectations" },
  "/employes/demandes": { category: "Employés", page: "Demandes" },
  "/patron/centre": { category: "Patron", page: "Centre" },
  "/patron/rapports": { category: "Patron", page: "Rapports" },
  "/patron/finances": { category: "Patron", page: "Finances" },
  "/patron/parametres": { category: "Patron", page: "Paramètres" },
};

function getBreadcrumb(pathname: string) {
  return breadcrumbMap[pathname] ?? { category: "Accueil", page: "Vue d'ensemble" };
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function Topbar() {
  const pathname = usePathname();
  const { category, page } = getBreadcrumb(pathname);

  return (
    <header
      className="h-[56px] shrink-0 flex items-center gap-6 px-6 border-b border-neutral-border bg-neutral-white"
      role="banner"
    >
      <nav
        aria-label="Fil d'Ariane"
        className="flex items-center gap-2 text-caption shrink-0"
        style={{ fontSize: "13px" }}
      >
        <Link
          href="/accueil/overview"
          className="text-neutral-text-secondary hover:text-neutral-text focus-ring rounded"
        >
          {category}
        </Link>
        <span className="text-neutral-border" aria-hidden>
          /
        </span>
        <span className="text-neutral-text font-medium">{page}</span>
      </nav>

      <div className="flex-1 flex justify-center min-w-0 max-w-md mx-auto">
        <input
          type="search"
          disabled
          placeholder="Rechercher (bientôt disponible)"
          aria-label="Recherche (bientôt disponible)"
          className="w-full h-9 px-3 rounded border border-neutral-border bg-neutral-bg-subtle text-caption text-neutral-text-secondary placeholder:text-neutral-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-transparent disabled:cursor-not-allowed"
          style={{ fontSize: "13px" }}
        />
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <time
          className="text-caption text-neutral-text-secondary"
          dateTime={new Date().toISOString().slice(0, 10)}
          style={{ fontSize: "13px" }}
        >
          {formatDate(new Date())}
        </time>
        <button
          type="button"
          disabled
          className="text-caption text-neutral-text-secondary cursor-not-allowed hover:no-underline focus-ring rounded px-2 py-1"
          style={{ fontSize: "13px" }}
        >
          Aide
        </button>
      </div>
    </header>
  );
}
