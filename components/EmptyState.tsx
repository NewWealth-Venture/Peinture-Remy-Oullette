import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  cta?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-8 px-4 ${className}`}
      role="status"
      aria-label={title}
    >
      <Icon
        className="text-neutral-text-secondary mb-3"
        size={24}
        strokeWidth={1.5}
        aria-hidden
      />
      <p className="font-heading font-semibold text-[15px] text-neutral-text mb-1">
        {title}
      </p>
      <p className="text-caption text-neutral-text-secondary max-w-sm mb-4">
        {description}
      </p>
      {cta}
    </div>
  );
}
