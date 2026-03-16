import { createBrief, BriefInsert, addBriefChecklistItem, addBriefZone, assignEmployeeToBrief } from "@/lib/db/briefs";
import { linkVoiceBriefToBrief } from "@/lib/db/voice-briefs";

export type VoiceBriefConfirmPayload = {
  voiceBriefId: string;
  brief: {
    title: string;
    projectId: string | null;
    priority: "Basse" | "Normale" | "Haute";
    dueDate: string | null;
    instructions: string;
    zones: { title: string; details?: string | null }[];
    checklist: { label: string; required?: boolean }[];
    employeeIds: string[];
    status: "Brouillon" | "Envoyé";
  };
};

export async function confirmVoiceBriefFromPayload(payload: VoiceBriefConfirmPayload, userId: string) {
  const { voiceBriefId, brief } = payload;

  const briefInsert: BriefInsert = {
    title: brief.title,
    project_id: brief.projectId,
    priority: brief.priority,
    status: brief.status,
    instructions: brief.instructions,
    due_date: brief.dueDate,
  };

  const briefId = await createBrief(briefInsert);

  for (const z of brief.zones) {
    await addBriefZone(briefId, z.title, z.details ?? null, 0);
  }

  let order = 0;
  for (const item of brief.checklist) {
    await addBriefChecklistItem(briefId, item.label, item.required ?? false, order++);
  }

  for (const employeeId of brief.employeeIds) {
    await assignEmployeeToBrief(briefId, employeeId);
  }

  await linkVoiceBriefToBrief(voiceBriefId, briefId);

  return {
    briefId,
  };
}

