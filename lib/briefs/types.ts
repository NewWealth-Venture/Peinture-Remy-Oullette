export type BriefStatus = "Brouillon" | "Envoyé" | "En cours" | "Terminé";

export type MediaPiece = {
  id: string;
  type: "Photo" | "Vidéo";
  url: string;
  nomFichier?: string;
  description?: string;
  creeLe: string;
};

export type ZoneInstruction = {
  id: string;
  titre: string;
  details?: string;
  pieces?: MediaPiece[];
};

export type ChecklistItem = {
  id: string;
  label: string;
  obligatoire?: boolean;
  fait?: boolean;
  faitLe?: string;
};

export type BriefMessage = {
  id: string;
  auteur: "Patron" | "Employé";
  nom?: string;
  texte: string;
  creeLe: string;
  pieces?: MediaPiece[];
};

export type Brief = {
  id: string;
  titre: string;
  chantierId?: string;
  priorite: "Basse" | "Normale" | "Haute";
  statut: BriefStatus;
  echeance?: string;
  assignes?: { id: string; nom: string }[];
  instructions: string;
  zones?: ZoneInstruction[];
  checklist?: ChecklistItem[];
  pieces?: MediaPiece[];
  messages?: BriefMessage[];
  creeLe: string;
  majLe: string;
};
