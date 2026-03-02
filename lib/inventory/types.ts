export type InventoryItemCategory = "Peinture" | "Plâtre" | "Outils" | "Protection" | "Autre";
export type InventoryItemUnite = "unité" | "litre" | "kg" | "boîte";

export type InventoryItem = {
  id: string;
  sku?: string;
  nom: string;
  categorie: InventoryItemCategory;
  unite: InventoryItemUnite;
  stockMin?: number;
  notes?: string;
  actif: boolean;
  creeLe: string;
};

export type LocationType = "Entrepôt" | "Camion" | "Chantier";

export type Location = {
  id: string;
  type: LocationType;
  nom: string;
  details?: string;
  actif: boolean;
};

export type StockByLocation = {
  id: string;
  itemId: string;
  locationId: string;
  quantite: number;
  derniereMaj: string;
};

export type MovementType = "Entrée" | "Sortie" | "Transfert" | "Ajustement";

export type InventoryMovement = {
  id: string;
  type: MovementType;
  itemId: string;
  quantite: number;
  unite: InventoryItemUnite;
  date: string;
  par: { id?: string; nom: string };
  motif?: string;
  projetId?: string;
  locationSourceId?: string;
  locationDestinationId?: string;
  note?: string;
  piecesJointes?: { id: string; url?: string; description?: string }[];
};
