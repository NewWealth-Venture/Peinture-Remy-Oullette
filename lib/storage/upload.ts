import { createClient } from "@/lib/supabase/server";
import type { MediaEntityType } from "@/lib/db/media";

export const STORAGE_BUCKET_MAP: Record<MediaEntityType, string> = {
  project_photo: "project-media",
  brief_media: "brief-media",
  brief_zone_media: "brief-media",
  progress_media: "progress-media",
  inventory_movement_media: "inventory-media",
};

export function getMediaPublicUrl(entityType: MediaEntityType, bucketPath: string): string {
  const bucket = STORAGE_BUCKET_MAP[entityType];
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${bucket}/${bucketPath}`;
}

export type UploadResult = { url: string; path: string; fileId: string };

/** Upload un fichier vers le bucket approprié, crée la ligne media_files, retourne l’URL publique et l’id. */
export async function uploadMedia(
  entityType: MediaEntityType,
  entityId: string,
  file: File,
  options?: { fileName?: string; description?: string }
): Promise<UploadResult> {
  const supabase = await createClient();
  const bucket = STORAGE_BUCKET_MAP[entityType];
  const ext = file.name.split(".").pop() || "bin";
  const path = `${entityType}/${entityId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  const url = urlData.publicUrl;

  const { createMediaFile } = await import("@/lib/db/media");
  const mediaType = file.type.startsWith("video/") ? "Vidéo" : file.type.startsWith("image/") ? "Photo" : "Document";
  const fileId = await createMediaFile({
    entity_type: entityType,
    entity_id: entityId,
    media_type: mediaType,
    bucket_path: path,
    file_name: options?.fileName ?? file.name,
    description: options?.description ?? null,
  });

  return { url, path, fileId };
}
