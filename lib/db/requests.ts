import { createClient } from "@/lib/supabase/server";

export type RequestStatus = "En attente" | "Approuvée" | "Refusée";

export type DbRequest = {
  id: string;
  employee_name: string | null;
  request_type: string | null;
  message: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
};

export type RequestInsert = {
  employee_name?: string | null;
  request_type?: string | null;
  message?: string | null;
  status?: RequestStatus;
};

export async function listRequests(limit = 100): Promise<DbRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    employee_name: row.employee_name ?? null,
    request_type: row.request_type ?? null,
    message: row.message ?? null,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function createRequest(p: RequestInsert): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requests")
    .insert({
      employee_name: p.employee_name ?? null,
      request_type: p.request_type ?? null,
      message: p.message ?? null,
      status: p.status ?? "En attente",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateRequestStatus(id: string, status: RequestStatus): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("requests").update({ status }).eq("id", id);
  if (error) throw error;
}
