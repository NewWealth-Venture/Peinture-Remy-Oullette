import { createClient } from "@/lib/supabase/server";

const BRIEF_VOICE_BUCKET = "brief-voice-notes";

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

export type SupportedBriefAudioMimeType = (typeof SUPPORTED_AUDIO_TYPES)[number];

export const MAX_BRIEF_AUDIO_BYTES = 50 * 1024 * 1024; // 50 Mo

export function isSupportedBriefAudio(file: File): boolean {
  if (!file.type) return false;
  return SUPPORTED_AUDIO_TYPES.includes(file.type as SupportedBriefAudioMimeType);
}

export function getBriefVoiceAudioUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/${BRIEF_VOICE_BUCKET}/${encodeURIComponent(path)}`;
}

export type UploadBriefVoiceAudioResult = {
  bucketPath: string;
};

export async function uploadBriefVoiceAudio(params: {
  file: File;
  createdByUserId: string;
}): Promise<UploadBriefVoiceAudioResult> {
  const { file, createdByUserId } = params;

  if (file.size === 0) {
    throw new Error("Le fichier audio est vide.");
  }
  if (file.size > MAX_BRIEF_AUDIO_BYTES) {
    throw new Error("Le fichier audio est trop volumineux (maximum 50 Mo).");
  }
  if (!isSupportedBriefAudio(file)) {
    throw new Error("Format audio non supporté. Formats acceptés : mp3, mp4, m4a, wav, webm, ogg, flac.");
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "audio";
  const safeExt = ext.toLowerCase();
  const path = `${createdByUserId}/${crypto.randomUUID()}.${safeExt}`;

  const { error } = await supabase.storage.from(BRIEF_VOICE_BUCKET).upload(path, file, {
    contentType: file.type || "audio/mpeg",
    upsert: false,
  });

  if (error) {
    throw new Error(`Échec de l'envoi audio : ${error.message}`);
  }

  return { bucketPath: path };
}

