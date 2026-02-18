import type { LucideIcon } from "lucide-react";

interface EmptyInlineProps {
  icon: LucideIcon;
  message: string;
  className?: string;
}

export function EmptyInline({ icon: Icon, message, className = "" }: EmptyInlineProps) {
  return (
    <div
      className={`flex items-center gap-2 py-2 text-caption text-neutral-text-secondary ${className}`}
      role="status"
    >
      <Icon size={16} strokeWidth={1.7} className="shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
