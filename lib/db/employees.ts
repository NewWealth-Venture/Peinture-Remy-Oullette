import { createClient } from "@/lib/supabase/server";

export type DbEmployee = {
  id: string;
  full_name: string;
  role: string | null;
  phone: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type EmployeeInsert = {
  full_name: string;
  role?: string | null;
  phone?: string | null;
  active?: boolean;
};

export async function listEmployees(activeOnly = false): Promise<DbEmployee[]> {
  const supabase = await createClient();
  let q = supabase.from("employees").select("*").order("full_name");
  if (activeOnly) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    full_name: row.full_name,
    role: row.role ?? null,
    phone: row.phone ?? null,
    active: row.active ?? true,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function getEmployeeById(id: string): Promise<DbEmployee | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("employees").select("*").eq("id", id).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  if (!data) return null;
  return {
    id: data.id,
    full_name: data.full_name,
    role: data.role ?? null,
    phone: data.phone ?? null,
    active: data.active ?? true,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function createEmployee(p: EmployeeInsert): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .insert({
      full_name: p.full_name,
      role: p.role ?? null,
      phone: p.phone ?? null,
      active: p.active ?? true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateEmployee(id: string, p: Partial<EmployeeInsert>): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("employees").update(p).eq("id", id);
  if (error) throw error;
}

export async function deleteEmployee(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) throw error;
}
