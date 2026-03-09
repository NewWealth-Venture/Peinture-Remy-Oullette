"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import Link from "next/link";
import { Search, UserPlus, Download } from "lucide-react";

type Params = {
  search?: string;
  status?: string;
  type?: string;
  role?: string;
  expired_cert?: string;
  no_photo?: string;
  sort?: string;
  asc?: string;
};

export function EmployesToolbar({ currentParams }: { currentParams: Params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(currentParams.search ?? "");

  const buildUrl = useCallback(
    (updates: Partial<Params>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === undefined || v === "") p.delete(k);
        else p.set(k, v);
      });
      const q = p.toString();
      return q ? `/patron/employes?${q}` : "/patron/employes";
    },
    [searchParams]
  );

  const applySearch = () => {
    router.push(buildUrl({ ...currentParams, search: searchInput.trim() || undefined }));
  };

  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-text-secondary" aria-hidden />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            placeholder="Nom, email, téléphone, rôle…"
            className="w-full h-9 pl-9 pr-3 border border-neutral-border rounded-md bg-neutral-bg-subtle text-caption text-neutral-text placeholder:text-neutral-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
            style={{ borderRadius: "6px" }}
            aria-label="Rechercher un employé"
          />
        </div>
        <button
          type="button"
          onClick={applySearch}
          className="h-9 px-3 border border-neutral-border rounded-md text-caption font-medium text-neutral-text bg-neutral-white hover:bg-neutral-bg-subtle focus-ring"
          style={{ borderRadius: "6px" }}
        >
          Rechercher
        </button>
        <select
          value={currentParams.status ?? ""}
          onChange={(e) => router.push(buildUrl({ ...currentParams, status: e.target.value || undefined }))}
          className="h-9 px-3 border border-neutral-border rounded-md bg-neutral-bg-subtle text-caption text-neutral-text focus:ring-2 focus:ring-primary-blue/20"
          style={{ borderRadius: "6px" }}
          aria-label="Statut"
        >
          <option value="">Tous les statuts</option>
          <option value="Actif">Actif</option>
          <option value="En congé">En congé</option>
          <option value="Suspendu">Suspendu</option>
          <option value="Inactif">Inactif</option>
        </select>
        <select
          value={currentParams.type ?? ""}
          onChange={(e) => router.push(buildUrl({ ...currentParams, type: e.target.value || undefined }))}
          className="h-9 px-3 border border-neutral-border rounded-md bg-neutral-bg-subtle text-caption text-neutral-text focus:ring-2 focus:ring-primary-blue/20"
          style={{ borderRadius: "6px" }}
          aria-label="Type d'emploi"
        >
          <option value="">Tous les types</option>
          <option value="Temps plein">Temps plein</option>
          <option value="Temps partiel">Temps partiel</option>
          <option value="Contractuel">Contractuel</option>
          <option value="Saisonnier">Saisonnier</option>
          <option value="Apprenti">Apprenti</option>
        </select>
        <label className="flex items-center gap-2 text-caption text-neutral-text">
          <input
            type="checkbox"
            checked={currentParams.expired_cert === "1"}
            onChange={(e) => router.push(buildUrl({ ...currentParams, expired_cert: e.target.checked ? "1" : undefined }))}
            className="rounded border-neutral-border"
          />
          Certifs expirées
        </label>
        <label className="flex items-center gap-2 text-caption text-neutral-text">
          <input
            type="checkbox"
            checked={currentParams.no_photo === "1"}
            onChange={(e) => router.push(buildUrl({ ...currentParams, no_photo: e.target.checked ? "1" : undefined }))}
            className="rounded border-neutral-border"
          />
          Sans photo
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/patron/employes/nouveau"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring"
          style={{ borderRadius: "6px" }}
        >
          <UserPlus size={16} strokeWidth={1.7} /> Ajouter un employé
        </Link>
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 h-9 px-3.5 text-caption font-medium border border-neutral-border rounded bg-neutral-white text-neutral-text opacity-60 cursor-not-allowed"
          style={{ borderRadius: "6px" }}
          aria-label="Exporter (bientôt)"
        >
          <Download size={16} strokeWidth={1.7} /> Exporter
        </button>
      </div>
    </div>
  );
}
