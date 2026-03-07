import type { Projet, Tache, PhotoProjet, MaterielUsage, AvancementJour } from "@/types/projet";
import type { Employe } from "@/types/employe";
import type { DbProject, DbProjectTask, DbProjectMaterialUsage } from "./projects";
import type { DbEmployee } from "./employees";
import type { DbDailyProgress } from "./progress";
import type { DbMediaFile } from "./media";
import { getMediaPublicUrl } from "@/lib/storage/upload";

export function mapProject(
  row: DbProject,
  opts?: {
    tasks?: DbProjectTask[];
    photos?: DbMediaFile[];
    materialUsage?: DbProjectMaterialUsage[];
    avancements?: DbDailyProgress[];
  }
): Projet {
  const taches: Tache[] = (opts?.tasks ?? []).map((t) => ({
    id: t.id,
    titre: t.title,
    description: t.description ?? undefined,
    priorite: t.priority as Tache["priorite"],
    statut: t.status as Tache["statut"],
    creeLe: t.created_at,
  }));
  const photos: PhotoProjet[] = (opts?.photos ?? []).map((p) => ({
    id: p.id,
    categorie: "Progression" as const,
    url: getMediaPublicUrl("project_photo", p.bucket_path),
    description: p.description ?? undefined,
    date: p.created_at,
  }));
  const materielUtilise: MaterielUsage[] = (opts?.materialUsage ?? []).map((u) => ({
    id: u.id,
    projetId: row.id,
    materielId: u.item_id,
    quantite: u.quantity,
    note: u.note ?? undefined,
    date: u.used_at,
  }));
  const avancements: AvancementJour[] = (opts?.avancements ?? []).map((a) => ({
    id: a.id,
    projetId: row.id,
    date: a.progress_date,
    progressionPourcent: a.progress_percent ?? undefined,
    resume: a.summary,
    blocages: a.blockers ?? undefined,
    creePar: a.created_by_name ?? undefined,
  }));
  return {
    id: row.id,
    titre: row.title,
    adresse: row.address ?? undefined,
    statut: row.status as Projet["statut"],
    description: row.description ?? undefined,
    dateDebut: row.start_date ?? undefined,
    dateFin: row.end_date ?? undefined,
    priorite: (row.priority as Projet["priorite"]) ?? "Normale",
    responsable: row.responsable ?? undefined,
    taches,
    photos,
    materielUtilise,
    avancements,
    derniereMaj: row.updated_at,
  };
}

export function mapEmployee(row: DbEmployee): Employe {
  return {
    id: row.id,
    nom: row.full_name,
    role: (row.role as Employe["role"]) ?? undefined,
    telephone: row.phone ?? undefined,
    actif: row.active,
  };
}
