import { NextResponse } from "next/server";
import { runAssistant } from "@/lib/ai/assistant";
import type { AssistantPageContext } from "@/lib/ai/context";

export type AIAssistantRequestBody = {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  pageContext?: AssistantPageContext;
  includePageContext?: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AIAssistantRequestBody;
    const { messages, pageContext, includePageContext } = body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages requis (tableau non vide)" },
        { status: 400 }
      );
    }
    const result = await runAssistant({
      messages,
      pageContext,
      includePageContext: includePageContext ?? true,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { content: "", error: message },
      { status: 500 }
    );
  }
}
