import OpenAI from "openai";
import { AI_CONFIG, hasAIConfig } from "@/lib/ai/config";
import { listProjects } from "@/lib/db/projects";
import { listEmployees } from "@/lib/db/employees";

const TRANSCRIPTION_MODEL = process.env.OPENAI_TRANSCRIPTION_MODEL ?? "gpt-4o-transcribe";
const TEXT_MODEL = AI_CONFIG.model;

export type BriefExtraction = {
  titre: string | null;
  resume: string | null;
  instructions: string | null;
  priority: "Basse" | "Normale" | "Haute" | null;
  dueDate: string | null;
  projectNameDetected: string | null;
  projectId: string | null;
  employeeMentions: string[];
  employeeMatches: { name: string; employeeId: string | null; confidence: number; ambiguous: boolean }[];
  zones: string[];
  materials: string[];
  checklist: string[];
  warnings: string[];
};

export type TranscriptionForBrief = {
  text: string;
  language?: string;
  durationSeconds?: number;
};

export async function transcribeBriefAudio(file: File): Promise<TranscriptionForBrief> {
  if (!hasAIConfig()) {
    throw new Error("L'IA n'est pas configurée (clé OpenAI manquante).");
  }

  const openai = new OpenAI({ apiKey: AI_CONFIG.apiKey });

  const response = await openai.audio.transcriptions.create({
    file,
    model: TRANSCRIPTION_MODEL,
    language: "fr",
    response_format: "json",
  } as any);

  const anyRes: any = response;
  const text: string = anyRes.text ?? "";
  const language: string | undefined = anyRes.language;
  const durationSeconds: number | undefined = anyRes.duration ? Number(anyRes.duration) : undefined;

  if (!text.trim()) {
    throw new Error("La transcription retournée par l'IA est vide.");
  }

  return { text, language, durationSeconds };
}

const SYSTEM_PROMPT = `
Tu es un assistant opérationnel pour une entreprise de peinture et plâtre.
À partir d’une transcription vocale d’un patron ou gestionnaire, tu dois transformer le message en brief opérationnel structuré.

Tu dois extraire uniquement les informations réellement mentionnées ou fortement implicites.
N’invente jamais un employé, un chantier, une date ou un matériel absent.
Quand une information semble probable mais incertaine, place-la dans un champ warnings / à confirmer.

Tu dois retourner une structure exploitable contenant :
- titre du brief
- résumé opérationnel
- instructions détaillées
- priorité
- date / échéance si mentionnée
- chantier détecté (nom libre, pas l'id)
- employés mentionnés (noms libres)
- zones concernées
- matériel mentionné
- checklist proposée
- points d’attention / risques
- ambiguïtés / warnings

Respecte strictement le schéma JSON fourni.
`.trim();

export async function extractBriefFromTranscript(transcription: string): Promise<BriefExtraction> {
  if (!hasAIConfig()) {
    throw new Error("L'IA n'est pas configurée (clé OpenAI manquante).");
  }

  const openai = new OpenAI({ apiKey: AI_CONFIG.apiKey });

  const response = await openai.responses.create({
    model: TEXT_MODEL,
    input: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `Transcription à analyser (en français) :\n\n${transcription}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "brief_voice_extraction",
        schema: {
          type: "object",
          properties: {
            titre: { type: ["string", "null"] },
            resume: { type: ["string", "null"] },
            instructions: { type: ["string", "null"] },
            priority: { type: ["string", "null"], enum: ["Basse", "Normale", "Haute", null] },
            dueDate: { type: ["string", "null"], description: "Date au format ISO YYYY-MM-DD si détectée, sinon null" },
            projectNameDetected: { type: ["string", "null"] },
            employeeMentions: { type: "array", items: { type: "string" } },
            zones: { type: "array", items: { type: "string" } },
            materials: { type: "array", items: { type: "string" } },
            checklist: { type: "array", items: { type: "string" } },
            warnings: { type: "array", items: { type: "string" } },
          },
          required: ["titre", "resume", "instructions", "priority", "dueDate", "projectNameDetected", "employeeMentions", "zones", "materials", "checklist", "warnings"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  } as any);

  const output = (response.output[0] as any)?.content?.[0]?.input_text ?? (response as any).output_text;
  let parsed: any;
  try {
    parsed = JSON.parse(output);
  } catch {
    const match = output.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Réponse IA invalide pour l'extraction de brief.");
    parsed = JSON.parse(match[0]);
  }

  const extraction: BriefExtraction = {
    titre: parsed.titre ?? null,
    resume: parsed.resume ?? null,
    instructions: parsed.instructions ?? null,
    priority: parsed.priority ?? null,
    dueDate: parsed.dueDate ?? null,
    projectNameDetected: parsed.projectNameDetected ?? null,
    projectId: null,
    employeeMentions: Array.isArray(parsed.employeeMentions) ? parsed.employeeMentions : [],
    employeeMatches: [],
    zones: Array.isArray(parsed.zones) ? parsed.zones : [],
    materials: Array.isArray(parsed.materials) ? parsed.materials : [],
    checklist: Array.isArray(parsed.checklist) ? parsed.checklist : [],
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
  };

  return extraction;
}

export async function matchTranscriptEntities(extraction: BriefExtraction): Promise<BriefExtraction> {
  const [projects, employees] = await Promise.all([
    listProjects(),
    listEmployees(true),
  ]);

  const warnings = [...extraction.warnings];
  let projectId: string | null = null;

  if (extraction.projectNameDetected) {
    const name = extraction.projectNameDetected.toLowerCase();
    const candidates = projects.filter((p) => p.title.toLowerCase().includes(name));
    if (candidates.length === 1) {
      projectId = candidates[0].id;
    } else if (candidates.length > 1) {
      warnings.push(`Plusieurs chantiers correspondent au nom "${extraction.projectNameDetected}". À confirmer.`);
    } else {
      warnings.push(`Aucun chantier trouvé pour "${extraction.projectNameDetected}".`);
    }
  }

  const employeeMatches: BriefExtraction["employeeMatches"] = [];

  for (const mention of extraction.employeeMentions) {
    const term = mention.toLowerCase();
    const matches = employees.filter((e) =>
      e.full_name.toLowerCase().includes(term) ||
      (e.first_name && e.first_name.toLowerCase().includes(term)) ||
      (e.last_name && e.last_name.toLowerCase().includes(term))
    );
    if (matches.length === 1) {
      employeeMatches.push({
        name: mention,
        employeeId: matches[0].id,
        confidence: 0.9,
        ambiguous: false,
      });
    } else if (matches.length > 1) {
      employeeMatches.push({
        name: mention,
        employeeId: null,
        confidence: 0.5,
        ambiguous: true,
      });
      warnings.push(`Le nom "${mention}" correspond à plusieurs employés. À confirmer dans l'interface.`);
    } else {
      employeeMatches.push({
        name: mention,
        employeeId: null,
        confidence: 0.1,
        ambiguous: true,
      });
      warnings.push(`Aucun employé trouvé pour "${mention}".`);
    }
  }

  return {
    ...extraction,
    projectId,
    employeeMatches,
    warnings,
  };
}

