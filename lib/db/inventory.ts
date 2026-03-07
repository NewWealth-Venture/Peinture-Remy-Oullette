import { createClient } from "@/lib/supabase/server";

export type InventoryCategory = "Peinture" | "Plâtre" | "Outils" | "Protection" | "Autre";
export type InventoryUnit = "unité" | "litre" | "kg" | "boîte";
export type MovementType = "Entrée" | "Sortie" | "Transfert" | "Ajustement";
export type LocationType = "Entrepôt" | "Camion" | "Chantier";

export type DbInventoryItem = {
  id: string;
  sku: string | null;
  name: string;
  category: InventoryCategory;
  unit: InventoryUnit;
  min_stock: number | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type DbInventoryLocation = {
  id: string;
  type: LocationType;
  name: string;
  details: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type DbInventoryStock = {
  id: string;
  item_id: string;
  location_id: string;
  quantity: number;
  updated_at: string;
};

export type DbInventoryMovement = {
  id: string;
  type: MovementType;
  item_id: string;
  quantity: number;
  unit: string;
  movement_date: string;
  actor_name: string | null;
  reason: string | null;
  project_id: string | null;
  source_location_id: string | null;
  destination_location_id: string | null;
  note: string | null;
  created_at: string;
};

export async function listInventoryItems(activeOnly = false): Promise<DbInventoryItem[]> {
  const supabase = await createClient();
  let q = supabase.from("inventory_items").select("*").order("name");
  if (activeOnly) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    sku: row.sku ?? null,
    name: row.name,
    category: row.category,
    unit: row.unit,
    min_stock: row.min_stock ?? null,
    notes: row.notes ?? null,
    active: row.active ?? true,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function createInventoryItem(p: {
  name: string;
  sku?: string | null;
  category: InventoryCategory;
  unit: InventoryUnit;
  min_stock?: number | null;
  notes?: string | null;
  active?: boolean;
}): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .insert({
      name: p.name,
      sku: p.sku ?? null,
      category: p.category,
      unit: p.unit,
      min_stock: p.min_stock ?? null,
      notes: p.notes ?? null,
      active: p.active ?? true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateInventoryItem(
  id: string,
  p: Partial<{
    name: string;
    sku: string | null;
    category: InventoryCategory;
    unit: InventoryUnit;
    min_stock: number | null;
    notes: string | null;
    active: boolean;
  }>
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("inventory_items").update(p).eq("id", id);
  if (error) throw error;
}

export async function listLocations(activeOnly = false): Promise<DbInventoryLocation[]> {
  const supabase = await createClient();
  let q = supabase.from("inventory_locations").select("*").order("name");
  if (activeOnly) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    type: row.type,
    name: row.name,
    details: row.details ?? null,
    active: row.active ?? true,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function createLocation(p: {
  type: LocationType;
  name: string;
  details?: string | null;
  active?: boolean;
}): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_locations")
    .insert({
      type: p.type,
      name: p.name,
      details: p.details ?? null,
      active: p.active ?? true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function getStockByItem(itemId: string): Promise<DbInventoryStock[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_stock")
    .select("*")
    .eq("item_id", itemId);
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    item_id: row.item_id,
    location_id: row.location_id,
    quantity: Number(row.quantity),
    updated_at: row.updated_at,
  }));
}

export async function getTotalQuantityByItem(itemId: string): Promise<number> {
  const rows = await getStockByItem(itemId);
  return rows.reduce((sum, r) => sum + r.quantity, 0);
}

export async function createMovement(p: {
  type: MovementType;
  item_id: string;
  quantity: number;
  unit: string;
  movement_date: string;
  actor_name?: string | null;
  reason?: string | null;
  project_id?: string | null;
  source_location_id?: string | null;
  destination_location_id?: string | null;
  note?: string | null;
}): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_movements")
    .insert({
      type: p.type,
      item_id: p.item_id,
      quantity: p.quantity,
      unit: p.unit,
      movement_date: p.movement_date,
      actor_name: p.actor_name ?? null,
      reason: p.reason ?? null,
      project_id: p.project_id ?? null,
      source_location_id: p.source_location_id ?? null,
      destination_location_id: p.destination_location_id ?? null,
      note: p.note ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function listMovements(itemId?: string, limit = 100): Promise<DbInventoryMovement[]> {
  const supabase = await createClient();
  let q = supabase
    .from("inventory_movements")
    .select("*")
    .order("movement_date", { ascending: false })
    .limit(limit);
  if (itemId) q = q.eq("item_id", itemId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    type: row.type,
    item_id: row.item_id,
    quantity: Number(row.quantity),
    unit: row.unit,
    movement_date: row.movement_date,
    actor_name: row.actor_name ?? null,
    reason: row.reason ?? null,
    project_id: row.project_id ?? null,
    source_location_id: row.source_location_id ?? null,
    destination_location_id: row.destination_location_id ?? null,
    note: row.note ?? null,
    created_at: row.created_at,
  }));
}

export async function getLowStockItems(): Promise<DbInventoryItem[]> {
  const items = await listInventoryItems(true);
  const low: DbInventoryItem[] = [];
  for (const item of items) {
    const total = await getTotalQuantityByItem(item.id);
    if (item.min_stock != null && total < item.min_stock) low.push(item);
    else if (item.min_stock == null && total === 0) low.push(item);
  }
  return low;
}
