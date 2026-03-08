export const AI_CONFIG = {
  model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY ?? "",
  maxToolCalls: Number(process.env.AI_MAX_TOOL_CALLS ?? "8"),
} as const;

export function hasAIConfig(): boolean {
  return Boolean(AI_CONFIG.apiKey);
}
