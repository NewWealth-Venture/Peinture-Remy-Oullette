import { createClient } from "@/lib/supabase/server";

export type VoiceBriefStatus = "Analyse" | "À valider" | "Confirmé" | "Annulé";

export type DbVoiceBrief = {
  id: string;
  brief_id: string | null;
  project_id: string | null;
  created_by_user_id: string | null;
  audio_path: string;
  audio_file_name: string | null;
  audio_duration_seconds: number | null;
  transcription: string;
  ai_summary: string | null;
  extracted_data: any | null;
  status: VoiceBriefStatus;
  created_at: string;
  updated_at: string;
  project_title?: string | null;
};

export type CreateVoiceBriefDraftParams = {
  project_id?: string | null;
  created_by_user_id: string | null;
  audio_path: string;
  audio_file_name?: string | null;
  audio_duration_seconds?: number | null;
  transcription: string;
  ai_summary?: string | null;
  extracted_data?: any | null;
  status?: VoiceBriefStatus;
};

export async function listVoiceBriefs(opts?: { status?: VoiceBriefStatus | "Tous" }): Promise<DbVoiceBrief[]> {
  const supabase = await createClient();
  let q = supabase
    .from("voice_briefs")
    .select(
      `
        *,
        projects!voice_briefs_project_id_fkey ( title )
      `
    )
    .order("created_at", { ascending: false });

  if (opts?.status && opts.status !== "Tous") {
    q = q.eq("status", opts.status);
  }

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    brief_id: row.brief_id ?? null,
    project_id: row.project_id ?? null,
    created_by_user_id: row.created_by_user_id ?? null,
    audio_path: row.audio_path,
    audio_file_name: row.audio_file_name ?? null,
    audio_duration_seconds: row.audio_duration_seconds ?? null,
    transcription: row.transcription,
    ai_summary: row.ai_summary ?? null,
    extracted_data: row.extracted_data ?? null,
    status: row.status as VoiceBriefStatus,
    created_at: row.created_at,
    updated_at: row.updated_at,
    project_title: row.projects?.title ?? null,
  }));
}

export async function getVoiceBriefById(id: string): Promise<DbVoiceBrief | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("voice_briefs")
    .select(
      `
        *,
        projects!voice_briefs_project_id_fkey ( title )
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
    brief_id: data.brief_id ?? null,
    project_id: data.project_id ?? null,
    created_by_user_id: data.created_by_user_id ?? null,
    audio_path: data.audio_path,
    audio_file_name: data.audio_file_name ?? null,
    audio_duration_seconds: data.audio_duration_seconds ?? null,
    transcription: data.transcription,
    ai_summary: data.ai_summary ?? null,
    extracted_data: data.extracted_data ?? null,
    status: data.status as VoiceBriefStatus,
    created_at: data.created_at,
    updated_at: data.updated_at,
    project_title: (data as any).projects?.title ?? null,
  };
}

export async function createVoiceBriefDraft(params: CreateVoiceBriefDraftParams): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("voice_briefs")
    .insert({
      project_id: params.project_id ?? null,
      created_by_user_id: params.created_by_user_id,
      audio_path: params.audio_path,
      audio_file_name: params.audio_file_name ?? null,
      audio_duration_seconds: params.audio_duration_seconds ?? null,
      transcription: params.transcription,
      ai_summary: params.ai_summary ?? null,
      extracted_data: params.extracted_data ?? null,
      status: params.status ?? "À valider",
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function setVoiceBriefStatus(id: string, status: VoiceBriefStatus): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("voice_briefs").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function linkVoiceBriefToBrief(id: string, briefId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("voice_briefs").update({ brief_id: briefId, status: "Confirmé" }).eq("id", id);
  if (error) throw error;
}

export async function updateVoiceBriefExtractedData(id: string, extracted: any): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("voice_briefs")
    .update({ extracted_data: extracted })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteVoiceBrief(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("voice_briefs").delete().eq("id", id);
  if (error) throw error;
}

