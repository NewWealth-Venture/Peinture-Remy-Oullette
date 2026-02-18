import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  children,
  actions,
  className = "",
}: SectionCardProps) {
  const slug = title.replace(/\s+/g, "-").toLowerCase();
  return (
    <section
      className={`bg-neutral-white border border-neutral-border rounded overflow-hidden ${className}`}
      aria-labelledby={`section-${slug}`}
    >
      <div className="px-4 py-2.5 border-b border-neutral-border flex items-center justify-between gap-4 min-h-[44px]">
        <div className="min-w-0">
          <h2
            id={`section-${slug}`}
            className="font-heading text-section-title text-neutral-text"
          >
            {title}
          </h2>
          {description && (
            <p className="text-caption-xs text-neutral-text-secondary mt-0.5 truncate">
              {description}
            </p>
          )}
        </div>
        {actions != null && <div className="shrink-0">{actions}</div>}
      </div>
      <div className="p-4 flex flex-col gap-4 min-h-0">{children}</div>
    </section>
  );
}
