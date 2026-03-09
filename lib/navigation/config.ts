import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Calendar,
  Package,
  Users,
  Settings,
} from "lucide-react";

export type NavCategory = "employes" | "direction";

export type NavItem = { href: string; label: string };
export type NavGroup = { id: string; label: string; icon: LucideIcon; items: NavItem[] };

/** Navigation Employés : terrain, opérations. */
export const employeeNavigation: NavGroup[] = [
  {
    id: "terrain",
    label: "Terrain",
    icon: LayoutDashboard,
    items: [
      { href: "/accueil/overview", label: "Dashboard employé" },
      { href: "/accueil/agenda", label: "Agenda" },
      { href: "/employes/affectations", label: "Affectations / Brief & instructions" },
      { href: "/employes/avancement", label: "Avancement quotidien" },
    ],
  },
  {
    id: "operations",
    label: "Opérations",
    icon: Package,
    items: [
      { href: "/employes/materiel", label: "Matériel utilisé" },
      { href: "/accueil/annonces", label: "Annonces" },
      { href: "/employes/pointage", label: "Pointage" },
      { href: "/employes/demandes", label: "Demandes" },
    ],
  },
];

/** Navigation Direction : pilotage, ressources, administration. */
export const directionNavigation: NavGroup[] = [
  {
    id: "pilotage",
    label: "Pilotage",
    icon: LayoutDashboard,
    items: [
      { href: "/patron/centre", label: "Dashboard direction" },
      { href: "/accueil/agenda", label: "Agenda" },
      { href: "/patron/projets", label: "Chantiers / Projets" },
      { href: "/accueil/estime", label: "Estimés" },
      { href: "/patron/rapports", label: "Rapports" },
    ],
  },
  {
    id: "ressources",
    label: "Ressources",
    icon: Users,
    items: [
      { href: "/employes/liste", label: "Employés" },
      { href: "/patron/inventaire", label: "Inventaire" },
      { href: "/accueil/annonces", label: "Communication / Annonces" },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    icon: Settings,
    items: [
      { href: "/patron/finances", label: "Finances" },
      { href: "/patron/parametres", label: "Paramètres" },
    ],
  },
];

const PATHS_DIRECTION_ONLY = ["/patron/centre", "/patron/rapports", "/patron/projets", "/patron/finances", "/patron/parametres", "/patron/affectations", "/accueil/estime", "/employes/liste"];
const PATHS_EMPLOYES_ONLY = ["/employes/affectations", "/employes/avancement", "/employes/materiel", "/employes/pointage", "/employes/demandes"];

/** Détermine la catégorie à partir du pathname. Pour les pages partagées (agenda, annonces), utilise storedCategory si fourni. */
export function getCategoryForPath(pathname: string, storedCategory?: NavCategory | null): NavCategory {
  const inDirection = PATHS_DIRECTION_ONLY.some((p) => pathname === p || pathname.startsWith(p + "/")) || pathname.startsWith("/patron/");
  if (inDirection) return "direction";
  const inEmployes = PATHS_EMPLOYES_ONLY.some((p) => pathname === p || pathname.startsWith(p + "/")) || pathname.startsWith("/employes/");
  if (inEmployes) return "employes";
  if (pathname === "/accueil/overview") return "employes";
  if (pathname === "/accueil/chantiers") return "direction";
  if (pathname === "/accueil/agenda" || pathname === "/accueil/annonces") return storedCategory ?? "employes";
  return storedCategory ?? "employes";
}

/** Première page valide pour une catégorie (redirection au switch). */
export function getDefaultPathForCategory(category: NavCategory): string {
  if (category === "employes") return "/accueil/overview";
  return "/patron/centre";
}

/** Groupes de la catégorie active. */
export function getGroupsForCategory(category: NavCategory): NavGroup[] {
  return category === "employes" ? employeeNavigation : directionNavigation;
}

/** Id du groupe contenant ce path (pour ouvrir l’accordéon). */
export function getGroupIdForPath(pathname: string, groups: NavGroup[]): string | null {
  for (const g of groups) {
    if (g.items.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"))) return g.id;
  }
  return null;
}

const STORAGE_KEY = "nav-category";

export function getStoredCategory(): NavCategory | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(STORAGE_KEY);
  if (v === "employes" || v === "direction") return v;
  return null;
}

export function setStoredCategory(category: NavCategory): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, category);
}
