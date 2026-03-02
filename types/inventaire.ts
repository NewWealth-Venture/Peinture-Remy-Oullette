export type CategorieMateriel = "Peinture" | "Plâtre" | "Outils" | "Protection" | "Autre";
export type UniteMateriel = "unité" | "litre" | "kg" | "boîte";

export type MaterielItem = {
  id: string;
  nom: string;
  categorie?: CategorieMateriel;
  unite?: UniteMateriel;
  stock?: number;
  stockMin?: number;
  emplacement?: string;
};
