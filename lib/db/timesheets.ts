import { createClient } from "@/lib/supabase/server";

export type DbTimesheet = {
  id: string;
  employee_id: string | null;
  employee_name: string | null;
  project_id: string | null;
  work_date: string;
  hours: number;
  note: string | null;
  created_at: string;
};

export type TimesheetInsert = {
  employee_id?: string | null;
  employee_name?: string | null;
  project_id?: string | null;
  work_date: string;
  hours: number;
  note?: string | null;
};

export async function listTimesheets(filters?: {
  employee_id?: string;
  project_id?: string;
  from?: string;
  to?: string;
  limit?: number;
}): Promise<DbTimesheet[]> {
  const supabase = await createClient();
  let q = supabase.from("timesheets").select("*").order("work_date", { ascending: false });
  if (filters?.employee_id) q = q.eq("employee_id", filters.employee_id);
  if (filters?.project_id) q = q.eq("project_id", filters.project_id);
  if (filters?.from) q = q.gte("work_date", filters.from);
  if (filters?.to) q = q.lte("work_date", filters.to);
  if (filters?.limit) q = q.limit(filters.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    employee_id: row.employee_id ?? null,
    employee_name: row.employee_name ?? null,
    project_id: row.project_id ?? null,
    work_date: row.work_date,
    hours: Number(row.hours),
    note: row.note ?? null,
    created_at: row.created_at,
  }));
}

export async function createTimesheet(p: TimesheetInsert): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("timesheets")
    .insert({
      employee_id: p.employee_id ?? null,
      employee_name: p.employee_name ?? null,
      project_id: p.project_id ?? null,
      work_date: p.work_date,
      hours: p.hours,
      note: p.note ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}
