import OpenAI from "openai";
import { AI_CONFIG, hasAIConfig } from "./config";
import { buildSystemMessageWithContext } from "./prompts";
import { formatPageContextForPrompt } from "./context";
import type { AssistantPageContext } from "./context";
import { ASSISTANT_TOOLS, runTool } from "./tools";
import type { ToolName } from "./tools";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export type AssistantInput = {
  messages: ChatMessage[];
  pageContext?: AssistantPageContext;
  includePageContext?: boolean;
};

export type AssistantOutput = {
  content: string;
  suggestedAction?: { type: string; label: string; payload?: unknown };
  error?: string;
}

export async function runAssistant(input: AssistantInput): Promise<AssistantOutput> {
  if (!hasAIConfig()) {
    return {
      content: "L'assistant IA n'est pas configuré (OPENAI_API_KEY manquant).",
      error: "missing_config",
    };
  }

  const openai = new OpenAI({ apiKey: AI_CONFIG.apiKey });
  const systemContent =
    input.includePageContext && input.pageContext
      ? buildSystemMessageWithContext(formatPageContextForPrompt(input.pageContext))
      : buildSystemMessageWithContext("");

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemContent },
    ...input.messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
  ];

  let round = 0;
  const maxRounds = AI_CONFIG.maxToolCalls;

  while (round < maxRounds) {
    const response = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages,
      tools: ASSISTANT_TOOLS,
      tool_choice: "auto",
    });

    const choice = response.choices[0];
    if (!choice) {
      return { content: "Aucune réponse générée.", error: "empty_choice" };
    }

    const finishReason = choice.finish_reason;
    const message = choice.message;

    if (finishReason === "stop" && message.content) {
      return { content: message.content.trim() };
    }

    if (finishReason === "tool_calls" && message.tool_calls?.length) {
      messages.push(message as OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam);
      for (const tc of message.tool_calls) {
        const fn = "function" in tc ? tc.function : null;
        if (!fn) continue;
        const name = fn.name as ToolName;
        const args = (() => {
          try {
            return JSON.parse(fn.arguments ?? "{}") as Record<string, unknown>;
          } catch {
            return {};
          }
        })();
        const result = await runTool(name, args);
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: result,
        });
      }
      round++;
      continue;
    }

    if (message.content) {
      return { content: message.content.trim() };
    }

    return { content: "Réponse incomplète.", error: "incomplete" };
  }

  return {
    content: "Nombre maximum d'appels aux outils atteint. Reformulez ou simplifiez la question.",
    error: "max_tool_calls",
  };
}
