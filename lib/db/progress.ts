import { createClient } from "@/lib/supabase/server";

export type DbDailyProgress = {
  id: string;
  project_id: string;
  progress_date: string;
  progress_percent: number | null;
  summary: string;
  blockers: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
};

export type DailyProgressInsert = {
  project_id: string;
  progress_date: string;
  progress_percent?: number | null;
  summary: string;
  blockers?: string | null;
  created_by_name?: string | null;
};

export async function listDailyProgressByProject(projectId: string, limit = 50): Promise<DbDailyProgress[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_progress")
    .select("*")
    .eq("project_id", projectId)
    .order("progress_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    project_id: row.project_id,
    progress_date: row.progress_date,
    progress_percent: row.progress_percent != null ? Number(row.progress_percent) : null,
    summary: row.summary,
    blockers: row.blockers ?? null,
    created_by_name: row.created_by_name ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function listLatestDailyProgress(limit = 10): Promise<DbDailyProgress[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_progress")
    .select("*")
    .order("progress_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    project_id: row.project_id,
    progress_date: row.progress_date,
    progress_percent: row.progress_percent != null ? Number(row.progress_percent) : null,
    summary: row.summary,
    blockers: row.blockers ?? null,
    created_by_name: row.created_by_name ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function createDailyProgress(p: DailyProgressInsert): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_progress")
    .insert({
      project_id: p.project_id,
      progress_date: p.progress_date,
      progress_percent: p.progress_percent ?? null,
      summary: p.summary,
      blockers: p.blockers ?? null,
      created_by_name: p.created_by_name ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateDailyProgress(
  id: string,
  p: Partial<Omit<DailyProgressInsert, "project_id">>
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("daily_progress").update(p).eq("id", id);
  if (error) throw error;
}

export async function deleteDailyProgress(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("daily_progress").delete().eq("id", id);
  if (error) throw error;
}
