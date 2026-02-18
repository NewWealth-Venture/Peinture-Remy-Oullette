import type { LucideIcon } from "lucide-react";

interface EmptyCenteredProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function EmptyCentered({
  icon: Icon,
  title,
  description,
  className = "",
}: EmptyCenteredProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-10 px-4 ${className}`}
      role="status"
      aria-label={title}
    >
      <Icon
        className="text-neutral-text-secondary mb-2"
        size={20}
        strokeWidth={1.7}
        aria-hidden
      />
      <p className="font-medium text-body text-neutral-text mb-1">{title}</p>
      <p className="text-caption text-neutral-text-secondary max-w-xs">{description}</p>
    </div>
  );
}
