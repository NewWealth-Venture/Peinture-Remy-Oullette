export type RoleEmploye = "Peintre" | "Plâtrier" | "Chef d'équipe" | "Apprenti" | "Autre";

export type Employe = {
  id: string;
  nom: string;
  role?: RoleEmploye;
  telephone?: string;
  actif: boolean;
};
