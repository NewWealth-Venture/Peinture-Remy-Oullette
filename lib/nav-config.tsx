import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Calendar,
  FolderKanban,
  Users,
  Package,
  Megaphone,
  Banknote,
  Settings,
} from "lucide-react";

export type NavItem = { href: string; label: string };
export type NavGroup = { id: string; label: string; icon: LucideIcon; items: NavItem[] };

export const SIDEBAR_GROUPS: NavGroup[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, items: [{ href: "/accueil/overview", label: "Dashboard" }] },
  { id: "agenda", label: "Agenda", icon: Calendar, items: [{ href: "/accueil/agenda", label: "Agenda" }] },
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
  { id: "finances", label: "Finances", icon: Banknote, items: [{ href: "/patron/finances", label: "Finances" }] },
  { id: "parametres", label: "Paramètres", icon: Settings, items: [{ href: "/patron/parametres", label: "Paramètres" }] },
];

export const DEFAULT_OPEN_GROUPS = new Set(["dashboard", "chantiers", "equipe", "materiel", "communication"]);

export function getGroupIdForPath(pathname: string): string | null {
  for (const g of SIDEBAR_GROUPS) {
    if (g.items.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"))) return g.id;
  }
  return null;
}
