import { createClient } from "@/lib/supabase/server";

export type MediaEntityType =
  | "project_photo"
  | "brief_media"
  | "brief_zone_media"
  | "progress_media"
  | "inventory_movement_media";

export type MediaType = "Photo" | "Vidéo" | "Document";

export type DbMediaFile = {
  id: string;
  entity_type: MediaEntityType;
  entity_id: string;
  media_type: MediaType;
  bucket_path: string;
  file_name: string | null;
  description: string | null;
  created_at: string;
};

export async function createMediaFile(p: {
  entity_type: MediaEntityType;
  entity_id: string;
  media_type: MediaType;
  bucket_path: string;
  file_name?: string | null;
  description?: string | null;
}): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_files")
    .insert({
      entity_type: p.entity_type,
      entity_id: p.entity_id,
      media_type: p.media_type,
      bucket_path: p.bucket_path,
      file_name: p.file_name ?? null,
      description: p.description ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function listRecentProjectPhotos(limit = 12): Promise<DbMediaFile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_files")
    .select("*")
    .eq("entity_type", "project_photo")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    media_type: row.media_type,
    bucket_path: row.bucket_path,
    file_name: row.file_name ?? null,
    description: row.description ?? null,
    created_at: row.created_at,
  }));
}

export async function listMediaByEntity(entityType: MediaEntityType, entityId: string): Promise<DbMediaFile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_files")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    media_type: row.media_type,
    bucket_path: row.bucket_path,
    file_name: row.file_name ?? null,
    description: row.description ?? null,
    created_at: row.created_at,
  }));
}

export async function deleteMediaFile(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("media_files").delete().eq("id", id);
  if (error) throw error;
}
