interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="font-heading text-h1 text-neutral-text mb-0.5">{title}</h1>
      {subtitle != null && (
        <p className="text-body text-neutral-text-secondary" style={{ fontSize: "14px" }}>
          {subtitle}
        </p>
      )}
    </header>
  );
}
