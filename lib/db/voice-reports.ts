import { createClient } from "@/lib/supabase/server";

export type VoiceReportCategory =
  | "Journal chantier"
  | "Avancement"
  | "Visite"
  | "Incident"
  | "Note vocale"
  | "Autre";

export type DbVoiceReport = {
  id: string;
  project_id: string | null;
  employee_id: string | null;
  created_by_user_id: string | null;
  title: string | null;
  category: VoiceReportCategory | null;
  audio_path: string;
  audio_file_name: string | null;
  audio_duration_seconds: number | null;
  transcription: string;
  summary: string | null;
  structured_report: string | null;
  language: string | null;
  report_date: string | null;
  created_at: string;
  updated_at: string;
  project_title?: string | null;
  employee_name?: string | null;
};

type ListVoiceReportsFilters = {
  projectId?: string;
  employeeId?: string;
  category?: VoiceReportCategory;
  fromDate?: string;
  toDate?: string;
  search?: string;
  limit?: number;
};

export async function listVoiceReports(filters: ListVoiceReportsFilters = {}): Promise<DbVoiceReport[]> {
  const supabase = await createClient();
  let query = supabase
    .from("voice_reports")
    .select(
      `
        *,
        projects!voice_reports_project_id_fkey ( title ),
        employees!voice_reports_employee_id_fkey ( full_name )
      `
    )
    .order("created_at", { ascending: false });

  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  if (filters.employeeId) query = query.eq("employee_id", filters.employeeId);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.fromDate) query = query.gte("report_date", filters.fromDate);
  if (filters.toDate) query = query.lte("report_date", filters.toDate);
  if (filters.search?.trim()) {
    const term = filters.search.trim();
    query = query.or(
      `title.ilike.%${term}%,summary.ilike.%${term}%,structured_report.ilike.%${term}%,transcription.ilike.%${term}%`
    );
  }
  if (filters.limit && filters.limit > 0) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    project_id: row.project_id ?? null,
    employee_id: row.employee_id ?? null,
    created_by_user_id: row.created_by_user_id ?? null,
    title: row.title ?? null,
    category: (row.category as VoiceReportCategory) ?? null,
    audio_path: row.audio_path,
    audio_file_name: row.audio_file_name ?? null,
    audio_duration_seconds: row.audio_duration_seconds ?? null,
    transcription: row.transcription,
    summary: row.summary ?? null,
    structured_report: row.structured_report ?? null,
    language: row.language ?? null,
    report_date: row.report_date ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    project_title: row.projects?.title ?? null,
    employee_name: row.employees?.full_name ?? null,
  }));
}

export async function getVoiceReportById(id: string): Promise<DbVoiceReport | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("voice_reports")
    .select(
      `
        *,
        projects!voice_reports_project_id_fkey ( title ),
        employees!voice_reports_employee_id_fkey ( full_name )
      `
    )
    .eq("id", id)
    .single();

  if (error) {
    if ((error as any).code === "PGRST116") return null;
    throw error;
  }
  if (!data) return null;

  return {
    id: data.id,
    project_id: data.project_id ?? null,
    employee_id: data.employee_id ?? null,
    created_by_user_id: data.created_by_user_id ?? null,
    title: data.title ?? null,
    category: (data.category as VoiceReportCategory) ?? null,
    audio_path: data.audio_path,
    audio_file_name: data.audio_file_name ?? null,
    audio_duration_seconds: data.audio_duration_seconds ?? null,
    transcription: data.transcription,
    summary: data.summary ?? null,
    structured_report: data.structured_report ?? null,
    language: data.language ?? null,
    report_date: data.report_date ?? null,
    created_at: data.created_at,
    updated_at: data.updated_at,
    project_title: (data as any).projects?.title ?? null,
    employee_name: (data as any).employees?.full_name ?? null,
  };
}

export type CreateVoiceReportParams = {
  project_id?: string | null;
  employee_id?: string | null;
  created_by_user_id: string | null;
  title?: string | null;
  category?: VoiceReportCategory | null;
  audio_path: string;
  audio_file_name?: string | null;
  audio_duration_seconds?: number | null;
  transcription: string;
  summary?: string | null;
  structured_report?: string | null;
  language?: string | null;
  report_date?: string | null;
};

export async function createVoiceReport(params: CreateVoiceReportParams): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("voice_reports")
    .insert({
      project_id: params.project_id ?? null,
      employee_id: params.employee_id ?? null,
      created_by_user_id: params.created_by_user_id,
      title: params.title ?? null,
      category: params.category ?? null,
      audio_path: params.audio_path,
      audio_file_name: params.audio_file_name ?? null,
      audio_duration_seconds: params.audio_duration_seconds ?? null,
      transcription: params.transcription,
      summary: params.summary ?? null,
      structured_report: params.structured_report ?? null,
      language: params.language ?? null,
      report_date: params.report_date ?? null,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function deleteVoiceReport(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("voice_reports").delete().eq("id", id);
  if (error) throw error;
}

export async function linkVoiceReportToProject(id: string, projectId: string | null): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("voice_reports").update({ project_id: projectId }).eq("id", id);
  if (error) throw error;
}

export async function linkVoiceReportToEmployee(id: string, employeeId: string | null): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("voice_reports").update({ employee_id: employeeId }).eq("id", id);
  if (error) throw error;
}

