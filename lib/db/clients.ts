import { createClient } from "@/lib/supabase/server";

export type ClientSource = "internal" | "quickbooks";
export type InternalStatus = "Nouveau" | "Actif" | "À relancer" | "VIP" | "Inactif";

export type DbClient = {
  id: string;
  quickbooks_customer_id: string | null;
  source: ClientSource;
  display_name: string;
  company_name: string | null;
  given_name: string | null;
  family_name: string | null;
  primary_email: string | null;
  primary_phone: string | null;
  mobile_phone: string | null;
  website: string | null;
  billing_address_line1: string | null;
  billing_address_line2: string | null;
  billing_city: string | null;
  billing_region: string | null;
  billing_postal_code: string | null;
  billing_country: string | null;
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_region: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  balance: number | null;
  open_balance: number | null;
  currency: string | null;
  payment_terms: string | null;
  tax_identifier: string | null;
  is_active: boolean;
  quickbooks_sync_token: string | null;
  last_synced_at: string | null;
  quickbooks_raw: Record<string, unknown> | null;
  internal_status: InternalStatus | null;
  internal_tags: string[] | null;
  internal_notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientInsert = {
  source?: ClientSource;
  display_name: string;
  company_name?: string | null;
  given_name?: string | null;
  family_name?: string | null;
  primary_email?: string | null;
  primary_phone?: string | null;
  mobile_phone?: string | null;
  website?: string | null;
  billing_address_line1?: string | null;
  billing_address_line2?: string | null;
  billing_city?: string | null;
  billing_region?: string | null;
  billing_postal_code?: string | null;
  billing_country?: string | null;
  shipping_address_line1?: string | null;
  shipping_address_line2?: string | null;
  shipping_city?: string | null;
  shipping_region?: string | null;
  shipping_postal_code?: string | null;
  shipping_country?: string | null;
  balance?: number | null;
  open_balance?: number | null;
  currency?: string | null;
  payment_terms?: string | null;
  tax_identifier?: string | null;
  is_active?: boolean;
  quickbooks_customer_id?: string | null;
  quickbooks_sync_token?: string | null;
  last_synced_at?: string | null;
  quickbooks_raw?: Record<string, unknown> | null;
  internal_status?: InternalStatus | null;
  internal_tags?: string[] | null;
  internal_notes?: string | null;
  assigned_to?: string | null;
};

export type InternalClientUpdate = {
  internal_status?: InternalStatus | null;
  internal_tags?: string[] | null;
  internal_notes?: string | null;
  assigned_to?: string | null;
};

function rowToClient(row: Record<string, unknown>): DbClient {
  return {
    id: row.id as string,
    quickbooks_customer_id: (row.quickbooks_customer_id as string) ?? null,
    source: (row.source as ClientSource) ?? "internal",
    display_name: (row.display_name as string) ?? "",
    company_name: (row.company_name as string) ?? null,
    given_name: (row.given_name as string) ?? null,
    family_name: (row.family_name as string) ?? null,
    primary_email: (row.primary_email as string) ?? null,
    primary_phone: (row.primary_phone as string) ?? null,
    mobile_phone: (row.mobile_phone as string) ?? null,
    website: (row.website as string) ?? null,
    billing_address_line1: (row.billing_address_line1 as string) ?? null,
    billing_address_line2: (row.billing_address_line2 as string) ?? null,
    billing_city: (row.billing_city as string) ?? null,
    billing_region: (row.billing_region as string) ?? null,
    billing_postal_code: (row.billing_postal_code as string) ?? null,
    billing_country: (row.billing_country as string) ?? null,
    shipping_address_line1: (row.shipping_address_line1 as string) ?? null,
    shipping_address_line2: (row.shipping_address_line2 as string) ?? null,
    shipping_city: (row.shipping_city as string) ?? null,
    shipping_region: (row.shipping_region as string) ?? null,
    shipping_postal_code: (row.shipping_postal_code as string) ?? null,
    shipping_country: (row.shipping_country as string) ?? null,
    balance: row.balance != null ? Number(row.balance) : null,
    open_balance: row.open_balance != null ? Number(row.open_balance) : null,
    currency: (row.currency as string) ?? null,
    payment_terms: (row.payment_terms as string) ?? null,
    tax_identifier: (row.tax_identifier as string) ?? null,
    is_active: (row.is_active as boolean) ?? true,
    quickbooks_sync_token: (row.quickbooks_sync_token as string) ?? null,
    last_synced_at: (row.last_synced_at as string) ?? null,
    quickbooks_raw: (row.quickbooks_raw as Record<string, unknown>) ?? null,
    internal_status: (row.internal_status as InternalStatus) ?? null,
    internal_tags: (row.internal_tags as string[]) ?? null,
    internal_notes: (row.internal_notes as string) ?? null,
    assigned_to: (row.assigned_to as string) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export type ListClientsFilters = {
  source?: ClientSource | "all";
  internal_status?: InternalStatus | null;
  is_active?: boolean | null;
  has_balance?: boolean;
  has_projects?: boolean;
  has_active_projects?: boolean;
};

export type ListClientsSort = "display_name" | "last_synced_at" | "balance" | "created_at";

export async function listClients(opts?: {
  search?: string;
  filters?: ListClientsFilters;
  sort?: ListClientsSort;
  ascending?: boolean;
}): Promise<DbClient[]> {
  const supabase = await createClient();
  let q = supabase.from("clients").select("*");

  if (opts?.search?.trim()) {
    const term = opts.search.trim().toLowerCase();
    q = q.or(
      `display_name.ilike.%${term}%,company_name.ilike.%${term}%,primary_email.ilike.%${term}%,primary_phone.ilike.%${term}%,mobile_phone.ilike.%${term}%`
    );
  }

  const f = opts?.filters;
  if (f?.source && f.source !== "all") q = q.eq("source", f.source);
  if (f?.internal_status != null) q = q.eq("internal_status", f.internal_status);
  if (f?.is_active != null) q = q.eq("is_active", f.is_active);
  if (f?.has_balance === true) q = q.gt("balance", 0);
  if (f?.has_projects === true || f?.has_active_projects === true) {
    let projectQ = supabase.from("projects").select("client_id").not("client_id", "is", null);
    if (f?.has_active_projects === true) {
      projectQ = projectQ.eq("status", "En cours");
    }
    const { data: projectRows } = await projectQ;
    const clientIds = Array.from(new Set((projectRows ?? []).map((r) => r.client_id as string).filter(Boolean)));
    if (clientIds.length === 0) return [];
    q = q.in("id", clientIds);
  }

  const sort = opts?.sort ?? "display_name";
  const asc = opts?.ascending ?? true;
  q = q.order(sort, { ascending: asc, nullsFirst: false });

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(rowToClient);
}

export async function getClientById(id: string): Promise<DbClient | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  if (!data) return null;
  return rowToClient(data);
}

export async function createClientRecord(client: ClientInsert): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      source: client.source ?? "internal",
      display_name: client.display_name,
      company_name: client.company_name ?? null,
      given_name: client.given_name ?? null,
      family_name: client.family_name ?? null,
      primary_email: client.primary_email ?? null,
      primary_phone: client.primary_phone ?? null,
      mobile_phone: client.mobile_phone ?? null,
      website: client.website ?? null,
      billing_address_line1: client.billing_address_line1 ?? null,
      billing_address_line2: client.billing_address_line2 ?? null,
      billing_city: client.billing_city ?? null,
      billing_region: client.billing_region ?? null,
      billing_postal_code: client.billing_postal_code ?? null,
      billing_country: client.billing_country ?? null,
      shipping_address_line1: client.shipping_address_line1 ?? null,
      shipping_address_line2: client.shipping_address_line2 ?? null,
      shipping_city: client.shipping_city ?? null,
      shipping_region: client.shipping_region ?? null,
      shipping_postal_code: client.shipping_postal_code ?? null,
      shipping_country: client.shipping_country ?? null,
      balance: client.balance ?? null,
      open_balance: client.open_balance ?? null,
      currency: client.currency ?? null,
      payment_terms: client.payment_terms ?? null,
      tax_identifier: client.tax_identifier ?? null,
      is_active: client.is_active ?? true,
      quickbooks_customer_id: client.quickbooks_customer_id ?? null,
      quickbooks_sync_token: client.quickbooks_sync_token ?? null,
      last_synced_at: client.last_synced_at ?? null,
      quickbooks_raw: client.quickbooks_raw ?? null,
      internal_status: client.internal_status ?? null,
      internal_tags: client.internal_tags ?? null,
      internal_notes: client.internal_notes ?? null,
      assigned_to: client.assigned_to ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateInternalClientFields(id: string, update: InternalClientUpdate): Promise<void> {
  const supabase = await createClient();
  const payload: Record<string, unknown> = {};
  if (update.internal_status !== undefined) payload.internal_status = update.internal_status;
  if (update.internal_tags !== undefined) payload.internal_tags = update.internal_tags;
  if (update.internal_notes !== undefined) payload.internal_notes = update.internal_notes;
  if (update.assigned_to !== undefined) payload.assigned_to = update.assigned_to;
  if (Object.keys(payload).length === 0) return;
  const { error } = await supabase.from("clients").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteClient(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertQuickBooksClient(mapped: ClientInsert & { quickbooks_customer_id: string }): Promise<string> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("quickbooks_customer_id", mapped.quickbooks_customer_id)
    .single();
  if (existing) {
    await supabase
      .from("clients")
      .update({
        display_name: mapped.display_name,
        company_name: mapped.company_name ?? null,
        given_name: mapped.given_name ?? null,
        family_name: mapped.family_name ?? null,
        primary_email: mapped.primary_email ?? null,
        primary_phone: mapped.primary_phone ?? null,
        mobile_phone: mapped.mobile_phone ?? null,
        website: mapped.website ?? null,
        billing_address_line1: mapped.billing_address_line1 ?? null,
        billing_address_line2: mapped.billing_address_line2 ?? null,
        billing_city: mapped.billing_city ?? null,
        billing_region: mapped.billing_region ?? null,
        billing_postal_code: mapped.billing_postal_code ?? null,
        billing_country: mapped.billing_country ?? null,
        shipping_address_line1: mapped.shipping_address_line1 ?? null,
        shipping_address_line2: mapped.shipping_address_line2 ?? null,
        shipping_city: mapped.shipping_city ?? null,
        shipping_region: mapped.shipping_region ?? null,
        shipping_postal_code: mapped.shipping_postal_code ?? null,
        shipping_country: mapped.shipping_country ?? null,
        balance: mapped.balance ?? null,
        open_balance: mapped.open_balance ?? null,
        currency: mapped.currency ?? null,
        payment_terms: mapped.payment_terms ?? null,
        tax_identifier: mapped.tax_identifier ?? null,
        is_active: mapped.is_active ?? true,
        quickbooks_sync_token: mapped.quickbooks_sync_token ?? null,
        last_synced_at: mapped.last_synced_at ?? new Date().toISOString(),
        quickbooks_raw: mapped.quickbooks_raw ?? null,
        source: "quickbooks",
      })
      .eq("id", existing.id);
    return existing.id;
  }
  return createClientRecord({ ...mapped, source: "quickbooks" });
}

export async function searchClients(query: string): Promise<DbClient[]> {
  return listClients({ search: query, sort: "display_name", ascending: true });
}

/** Synchronise les clients depuis QuickBooks (appelle l’intégration). */
export async function syncQuickBooksClients(config?: { realmId: string; accessToken: string } | null): Promise<{ count: number; error?: string }> {
  const { syncQuickBooksCustomers } = await import("@/lib/integrations/quickbooks/customers");
  return syncQuickBooksCustomers(config);
}

// ——— Client notes ———
export type DbClientNote = {
  id: string;
  client_id: string;
  note: string;
  created_by: string | null;
  created_at: string;
};

export async function listClientNotes(clientId: string): Promise<DbClientNote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_notes")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    client_id: row.client_id,
    note: row.note,
    created_by: row.created_by ?? null,
    created_at: row.created_at,
  }));
}

export async function addClientNote(clientId: string, note: string, createdBy?: string | null): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_notes")
    .insert({ client_id: clientId, note, created_by: createdBy ?? null })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

// ——— Client activity ———
export type DbClientActivity = {
  id: string;
  client_id: string;
  type: string;
  label: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export async function listClientActivity(clientId: string, limit = 20): Promise<DbClientActivity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_activity")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    client_id: row.client_id,
    type: row.type,
    label: row.label,
    metadata: row.metadata ?? null,
    created_at: row.created_at,
  }));
}

export async function addClientActivity(
  clientId: string,
  type: string,
  label: string,
  metadata?: Record<string, unknown> | null
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_activity")
    .insert({ client_id: clientId, type, label, metadata: metadata ?? null })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}
