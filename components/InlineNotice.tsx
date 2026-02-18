import { ReactNode } from "react";

interface InlineNoticeProps {
  children: ReactNode;
  className?: string;
}

export function InlineNotice({ children, className = "" }: InlineNoticeProps) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded border border-neutral-border bg-neutral-bg-subtle text-caption text-neutral-text-secondary ${className}`}
      role="status"
    >
      <span className="shrink-0 text-primary-orange font-medium">Note</span>
      <span>{children}</span>
    </div>
  );
}
