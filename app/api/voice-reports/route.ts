import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadVoiceRecording } from "@/lib/storage/voice-reports";
import {
  createVoiceReport,
  deleteVoiceReport,
  listVoiceReports,
  linkVoiceReportToEmployee,
  linkVoiceReportToProject,
  type VoiceReportCategory,
} from "@/lib/db/voice-reports";
import { transcribeAudioFile, generateVoiceSummaryAndReport } from "@/lib/ai/voice-reports";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? undefined;
  const employeeId = searchParams.get("employeeId") ?? undefined;
  const category = searchParams.get("category") as VoiceReportCategory | null;
  const fromDate = searchParams.get("fromDate") ?? undefined;
  const toDate = searchParams.get("toDate") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  try {
    const reports = await listVoiceReports({
      projectId,
      employeeId,
      category: category ?? undefined,
      fromDate,
      toDate,
      search,
      limit: 200,
    });
    return NextResponse.json({ reports });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.startsWith("multipart/form-data")) {
      return NextResponse.json(
        { error: "Requête invalide : form-data attendu." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("audio") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Fichier audio manquant." }, { status: 400 });
    }

    const projectId = (formData.get("project_id") as string | null) || null;
    const employeeId = (formData.get("employee_id") as string | null) || null;
    const title = (formData.get("title") as string | null) || null;
    const category = (formData.get("category") as VoiceReportCategory | null) || null;
    const reportDate = (formData.get("report_date") as string | null) || null;

    const { bucketPath } = await uploadVoiceRecording({
      file,
      createdByUserId: user.id,
      projectId: projectId ?? undefined,
    });

    const transcriptionResult = await transcribeAudioFile(file);
    const { summary, structuredReport } = await generateVoiceSummaryAndReport(transcriptionResult.text);

    const id = await createVoiceReport({
      project_id: projectId,
      employee_id: employeeId,
      created_by_user_id: user.id,
      title,
      category,
      audio_path: bucketPath,
      audio_file_name: file.name,
      audio_duration_seconds: transcriptionResult.durationSeconds ?? null,
      transcription: transcriptionResult.text,
      summary,
      structured_report: structuredReport,
      language: transcriptionResult.language ?? "fr",
      report_date: reportDate ?? new Date().toISOString().slice(0, 10),
    });

    const created = await listVoiceReports({}).then((rows) => rows.find((r) => r.id === id) ?? null);

    return NextResponse.json(
      {
        id,
        report: created,
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Paramètre id manquant." }, { status: 400 });
  }

  try {
    await deleteVoiceReport(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, project_id, employee_id } = body as {
      id?: string;
      project_id?: string | null;
      employee_id?: string | null;
    };

    if (!id) {
      return NextResponse.json({ error: "Champ id manquant." }, { status: 400 });
    }

    if (project_id !== undefined) {
      await linkVoiceReportToProject(id, project_id);
    }
    if (employee_id !== undefined) {
      await linkVoiceReportToEmployee(id, employee_id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

