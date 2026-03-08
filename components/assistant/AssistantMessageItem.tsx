"use client";

import { AssistantCopyBlock } from "./AssistantCopyBlock";

export type AssistantMessageItemProps = {
  role: "user" | "assistant";
  content: string;
};

const COPYABLE_MARKER = "```copier\n";
const COPYABLE_END = "\n```";

export function AssistantMessageItem({ role, content }: AssistantMessageItemProps) {
  const copyableStart = content.indexOf(COPYABLE_MARKER);
  const hasCopyBlock = copyableStart !== -1;
  const beforeCopy = hasCopyBlock ? content.slice(0, copyableStart) : content;
  const copyContent = hasCopyBlock
    ? content.slice(copyableStart + COPYABLE_MARKER.length, content.indexOf(COPYABLE_END, copyableStart))
    : "";
  const afterCopy =
    hasCopyBlock && copyContent
      ? content.slice(content.indexOf(COPYABLE_END, copyableStart) + COPYABLE_END.length)
      : "";

  const isUser = role === "user";
  return (
    <div
      className={`rounded-md border px-3 py-2 text-caption ${
        isUser
          ? "ml-6 mr-2 border-neutral-border bg-neutral-bg-subtle text-neutral-text"
          : "mr-6 ml-2 border-neutral-border bg-neutral-white text-neutral-text"
      }`}
      style={{ fontSize: "13px" }}
    >
      {!hasCopyBlock && <div className="whitespace-pre-wrap leading-relaxed">{content}</div>}
      {hasCopyBlock && (
        <>
          {beforeCopy && <div className="whitespace-pre-wrap leading-relaxed mb-2">{beforeCopy}</div>}
          {copyContent && <AssistantCopyBlock text={copyContent.trim()} />}
          {afterCopy && <div className="whitespace-pre-wrap leading-relaxed mt-2">{afterCopy}</div>}
        </>
      )}
    </div>
  );
}
