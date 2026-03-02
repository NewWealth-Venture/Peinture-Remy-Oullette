export type StatutProjet = "À planifier" | "En cours" | "En attente" | "Terminé";

export type PieceJointe = {
  id: string;
  type: "Photo" | "Document";
  url?: string;
  legende?: string;
};

export type Tache = {
  id: string;
  titre: string;
  description?: string;
  priorite: "Basse" | "Normale" | "Haute";
  statut: "À faire" | "En cours" | "Bloqué" | "Terminé";
  assignes?: string[];
  piecesJointes?: PieceJointe[];
  creeLe: string;
};

export type PhotoProjet = {
  id: string;
  categorie: "Avant" | "Après" | "Progression";
  url?: string;
  description?: string;
  date: string;
};

export type PrioriteProjet = "Basse" | "Normale" | "Haute";

export type Projet = {
  id: string;
  titre: string;
  adresse?: string;
  statut: StatutProjet;
  description?: string;
  dateDebut?: string;
  dateFin?: string;
  priorite?: PrioriteProjet;
  responsable?: string;
  employesAssignes?: string[];
  taches?: Tache[];
  photos?: PhotoProjet[];
  materielUtilise?: MaterielUsage[];
  avancements?: AvancementJour[];
  derniereMaj?: string;
};

export type MaterielUsage = {
  id: string;
  projetId: string;
  materielId: string;
  quantite: number;
  note?: string;
  date: string;
  employeId?: string;
};

export type AvancementJour = {
  id: string;
  projetId: string;
  date: string;
  progressionPourcent?: number;
  resume: string;
  blocages?: string;
  photos?: { id: string; url?: string; description?: string }[];
  creePar?: string;
};
