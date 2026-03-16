import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadBriefVoiceAudio } from "@/lib/storage/brief-voice";
import { createVoiceBriefDraft } from "@/lib/db/voice-briefs";
import { extractBriefFromTranscript, matchTranscriptEntities, transcribeBriefAudio } from "@/lib/ai/voice-briefs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.startsWith("multipart/form-data")) {
      return NextResponse.json({ error: "Requête invalide : form-data attendu." }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("audio") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Fichier audio manquant." }, { status: 400 });
    }

    const { bucketPath } = await uploadBriefVoiceAudio({
      file,
      createdByUserId: user.id,
    });

    const transcription = await transcribeBriefAudio(file);
    const extracted = await extractBriefFromTranscript(transcription.text);
    const withMatches = await matchTranscriptEntities(extracted);

    const aiSummary = withMatches.resume ?? null;

    const draftId = await createVoiceBriefDraft({
      project_id: withMatches.projectId,
      created_by_user_id: user.id,
      audio_path: bucketPath,
      audio_file_name: file.name,
      audio_duration_seconds: transcription.durationSeconds ?? null,
      transcription: transcription.text,
      ai_summary: aiSummary,
      extracted_data: withMatches,
      status: "À valider",
    });

    return NextResponse.json({
      id: draftId,
      draft: {
        id: draftId,
        audio_path: bucketPath,
        audio_file_name: file.name,
        audio_duration_seconds: transcription.durationSeconds ?? null,
        transcription: transcription.text,
        ai_summary: aiSummary,
        extracted_data: withMatches,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

