import OpenAI from "openai";
import { AI_CONFIG, hasAIConfig } from "@/lib/ai/config";

const TRANSCRIPTION_MODEL = process.env.OPENAI_TRANSCRIPTION_MODEL ?? "gpt-4o-transcribe";
const TEXT_MODEL = AI_CONFIG.model;

export type TranscriptionResult = {
  text: string;
  language?: string;
  durationSeconds?: number;
};

export async function transcribeAudioFile(file: File): Promise<TranscriptionResult> {
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

export type SummaryAndReport = {
  summary: string;
  structuredReport: string;
};

const SYSTEM_PROMPT = `
Tu es un assistant opérationnel pour une entreprise de peinture et plâtre.
À partir d’une transcription vocale, tu dois produire :

1. Un résumé court et clair en français
2. Un rapport structuré orienté terrain

Le rapport doit, quand l’information existe, faire ressortir :
- chantier concerné
- travail effectué
- avancement
- problèmes / blocages
- matériel mentionné
- prochaines étapes
- points à surveiller

Règles :
- ne jamais inventer d’information absente
- si une information n’est pas mentionnée, ne pas la fabriquer
- reformuler proprement en français professionnel
- être concret, utile, lisible

Le rapport structuré doit être formaté proprement, par exemple :

## Rapport
- Contexte
- Travail effectué
- Avancement observé
- Blocages / problèmes
- Matériel mentionné
- Prochaines étapes
- Points à surveiller

Réponds en JSON strict avec la structure :
{
  "summary": "…",
  "structured_report": "…"
}
`.trim();

export async function generateVoiceSummaryAndReport(transcription: string): Promise<SummaryAndReport> {
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
        name: "voice_report_response",
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            structured_report: { type: "string" },
          },
          required: ["summary", "structured_report"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  } as any);

  const output = (response.output[0] as any)?.content?.[0]?.input_text ?? (response as any).output_text;
  let parsed: { summary: string; structured_report: string } | null = null;

  try {
    parsed = JSON.parse(output);
  } catch {
    // Fallback : essayer de trouver un bloc JSON dans le texte
    const match = output.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    }
  }

  if (!parsed || !parsed.summary || !parsed.structured_report) {
    throw new Error("Réponse IA invalide pour le résumé / rapport.");
  }

  return {
    summary: parsed.summary.trim(),
    structuredReport: parsed.structured_report.trim(),
  };
}

