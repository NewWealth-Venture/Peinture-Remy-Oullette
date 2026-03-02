"use client";

interface AvatarBadgeProps {
  nom: string;
  size?: "sm" | "md";
  className?: string;
}

function initials(nom: string): string {
  const parts = nom.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (nom.slice(0, 2) || "?").toUpperCase();
}

export function AvatarBadge({ nom, size = "md", className = "" }: AvatarBadgeProps) {
  const s = size === "sm" ? "h-7 w-7 text-caption-xs" : "h-8 w-8 text-caption";
  return (
    <div
      className={`shrink-0 rounded-full bg-primary-blue flex items-center justify-center text-white font-heading font-medium ${s} ${className}`}
      title={nom}
      aria-hidden
    >
      {initials(nom)}
    </div>
  );
}
