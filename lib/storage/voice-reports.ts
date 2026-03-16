import { createClient } from "@/lib/supabase/server";

const VOICE_REPORTS_BUCKET = "voice-reports";

const SUPPORTED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/wav",
  "audio/webm",
  "audio/ogg",
  "audio/flac",
] as const;

export type SupportedAudioMimeType = (typeof SUPPORTED_AUDIO_TYPES)[number];

export const MAX_AUDIO_BYTES = 50 * 1024 * 1024; // 50 MB

export function isSupportedAudioFile(file: File): boolean {
  if (!file.type) return false;
  return SUPPORTED_AUDIO_TYPES.includes(file.type as SupportedAudioMimeType);
}

export function getVoiceRecordingUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/${VOICE_REPORTS_BUCKET}/${encodeURIComponent(path)}`;
}

export type UploadVoiceRecordingResult = {
  bucketPath: string;
};

export async function uploadVoiceRecording(params: {
  file: File;
  createdByUserId: string;
  projectId?: string | null;
}): Promise<UploadVoiceRecordingResult> {
  const { file, createdByUserId, projectId } = params;

  if (file.size === 0) {
    throw new Error("Le fichier audio est vide.");
  }
  if (file.size > MAX_AUDIO_BYTES) {
    throw new Error("Le fichier audio est trop volumineux (maximum 50 Mo).");
  }
  if (!isSupportedAudioFile(file)) {
    throw new Error("Format audio non supporté. Formats acceptés : mp3, mp4, m4a, wav, webm, ogg, flac.");
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "audio";
  const safeExt = ext.toLowerCase();
  const projectSegment = projectId ? `${projectId}/` : "";
  const path = `${projectSegment}${createdByUserId}/${crypto.randomUUID()}.${safeExt}`;

  const { error } = await supabase.storage.from(VOICE_REPORTS_BUCKET).upload(path, file, {
    contentType: file.type || "audio/mpeg",
    upsert: false,
  });

  if (error) {
    throw new Error(`Échec de l'envoi audio : ${error.message}`);
  }

  return { bucketPath: path };
}

