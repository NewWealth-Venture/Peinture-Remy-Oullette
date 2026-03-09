"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronDown, User } from "lucide-react";
import type { Profile } from "@/lib/auth/auth";
import { createClient } from "@/lib/supabase/client";

const ROLE_LABELS: Record<string, string> = {
  patron: "Direction",
  employe: "Employé",
};

export function UserMenu({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onOutside);
    return () => document.removeEventListener("click", onOutside);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const displayName = profile.full_name?.trim() || "Utilisateur";
  const roleLabel = ROLE_LABELS[profile.role] ?? profile.role;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 min-h-[44px] min-w-[44px] px-2 py-1.5 rounded-lg text-left hover:bg-neutral-bg-subtle focus:outline-none focus:ring-2 focus:ring-primary-blue/20 border border-transparent hover:border-neutral-border"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Menu utilisateur"
      >
        <span className="hidden sm:flex flex-col items-end">
          <span className="text-caption font-medium text-neutral-text truncate max-w-[120px]" style={{ fontSize: "13px" }}>
            {displayName}
          </span>
          <span className="text-caption text-neutral-text-secondary" style={{ fontSize: "12px" }}>
            {roleLabel}
          </span>
        </span>
        <span className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full bg-primary-blue/10 text-primary-blue">
          <User size={18} strokeWidth={1.7} />
        </span>
        <ChevronDown size={16} className="text-neutral-text-secondary shrink-0" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 py-1 min-w-[180px] bg-neutral-white border border-neutral-border rounded-lg shadow-lg z-50"
          role="menu"
        >
          <div className="px-3 py-2 border-b border-neutral-border sm:hidden">
            <p className="text-caption font-medium text-neutral-text truncate">{displayName}</p>
            <p className="text-caption text-neutral-text-secondary">{roleLabel}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-caption text-neutral-text hover:bg-neutral-bg-subtle focus:outline-none focus:bg-neutral-bg-subtle min-h-[44px]"
            role="menuitem"
          >
            <LogOut size={16} strokeWidth={1.7} className="text-neutral-text-secondary shrink-0" />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
