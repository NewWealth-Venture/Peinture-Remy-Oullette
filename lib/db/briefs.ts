import { createClient } from "@/lib/supabase/server";

export type BriefStatus = "Brouillon" | "Envoyé" | "En cours" | "Terminé";
export type BriefPriority = "Basse" | "Normale" | "Haute";

export type DbBrief = {
  id: string;
  title: string;
  project_id: string | null;
  priority: BriefPriority;
  status: BriefStatus;
  instructions: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type DbBriefZone = {
  id: string;
  brief_id: string;
  title: string;
  details: string | null;
  sort_order: number;
};

export type DbBriefChecklistItem = {
  id: string;
  brief_id: string;
  label: string;
  required: boolean;
  done: boolean;
  sort_order: number;
};

export type DbBriefMessage = {
  id: string;
  brief_id: string;
  author_type: "Patron" | "Employé";
  author_name: string | null;
  message: string;
  created_at: string;
};

export type BriefInsert = {
  title: string;
  project_id?: string | null;
  priority?: BriefPriority;
  status?: BriefStatus;
  instructions: string;
  due_date?: string | null;
};

export async function listBriefs(): Promise<DbBrief[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("briefs")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    title: row.title,
    project_id: row.project_id ?? null,
    priority: row.priority ?? "Normale",
    status: row.status,
    instructions: row.instructions,
    due_date: row.due_date ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function getBriefById(id: string): Promise<DbBrief | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("briefs").select("*").eq("id", id).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    project_id: data.project_id ?? null,
    priority: data.priority ?? "Normale",
    status: data.status,
    instructions: data.instructions,
    due_date: data.due_date ?? null,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function createBrief(p: BriefInsert): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("briefs")
    .insert({
      title: p.title,
      project_id: p.project_id ?? null,
      priority: p.priority ?? "Normale",
      status: p.status ?? "Brouillon",
      instructions: p.instructions,
      due_date: p.due_date ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateBrief(id: string, p: Partial<BriefInsert>): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("briefs").update(p).eq("id", id);
  if (error) throw error;
}

export async function deleteBrief(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("briefs").delete().eq("id", id);
  if (error) throw error;
}

export async function listBriefZones(briefId: string): Promise<DbBriefZone[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brief_zones")
    .select("*")
    .eq("brief_id", briefId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    brief_id: row.brief_id,
    title: row.title,
    details: row.details ?? null,
    sort_order: row.sort_order ?? 0,
  }));
}

export async function addBriefZone(briefId: string, title: string, details?: string | null, sortOrder = 0): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brief_zones")
    .insert({ brief_id: briefId, title, details: details ?? null, sort_order: sortOrder })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function listBriefChecklistItems(briefId: string): Promise<DbBriefChecklistItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brief_checklist_items")
    .select("*")
    .eq("brief_id", briefId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    brief_id: row.brief_id,
    label: row.label,
    required: row.required ?? false,
    done: row.done ?? false,
    sort_order: row.sort_order ?? 0,
  }));
}

export async function addBriefChecklistItem(
  briefId: string,
  label: string,
  required = false,
  sortOrder = 0
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brief_checklist_items")
    .insert({ brief_id: briefId, label, required, sort_order: sortOrder })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function toggleChecklistItem(briefId: string, itemId: string): Promise<void> {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("brief_checklist_items")
    .select("done")
    .eq("id", itemId)
    .eq("brief_id", briefId)
    .single();
  if (!row) return;
  const { error } = await supabase
    .from("brief_checklist_items")
    .update({ done: !row.done })
    .eq("id", itemId);
  if (error) throw error;
}

export async function listBriefMessages(briefId: string): Promise<DbBriefMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brief_messages")
    .select("*")
    .eq("brief_id", briefId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    brief_id: row.brief_id,
    author_type: row.author_type,
    author_name: row.author_name ?? null,
    message: row.message,
    created_at: row.created_at,
  }));
}

export async function addBriefMessage(
  briefId: string,
  authorType: "Patron" | "Employé",
  message: string,
  authorName?: string | null
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brief_messages")
    .insert({
      brief_id: briefId,
      author_type: authorType,
      author_name: authorName ?? null,
      message,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function listBriefAssignments(briefId: string): Promise<{ employee_id: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brief_assignments")
    .select("employee_id")
    .eq("brief_id", briefId);
  if (error) throw error;
  return (data ?? []).map(row => ({ employee_id: row.employee_id }));
}

export async function assignEmployeeToBrief(briefId: string, employeeId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("brief_assignments").insert({ brief_id: briefId, employee_id: employeeId });
  if (error) throw error;
}

export async function unassignEmployeeFromBrief(briefId: string, employeeId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("brief_assignments")
    .delete()
    .eq("brief_id", briefId)
    .eq("employee_id", employeeId);
  if (error) throw error;
}
