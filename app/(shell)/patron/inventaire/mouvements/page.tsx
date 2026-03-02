"use client";

import { useState, useMemo, useEffect } from "react";
import { MovementModal } from "@/components/inventory/MovementModal";
import { MovementTable } from "@/components/inventory/MovementTable";
import { useInventoryStore } from "@/lib/inventory/store";
import { useProjets } from "@/lib/store";
import type { MovementType } from "@/lib/inventory/types";
import { Plus, Search } from "lucide-react";

const TYPES: MovementType[] = ["Entrée", "Sortie", "Transfert", "Ajustement"];
const PERIODS = [ { value: "7", label: "7 jours" }, { value: "30", label: "30 jours" }, { value: "90", label: "90 jours" } ];

const inputClass = "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

export default function MouvementsPage() {
  const { items, locations, getById: getItem, getLocation, movements, recordMovement } = useInventoryStore();
  const { projets, getById: getProjet } = useProjets();
  const [modalOpen, setModalOpen] = useState(false);
  const [filtreType, setFiltreType] = useState<MovementType | "">("");
  const [filtrePeriod, setFiltrePeriod] = useState("30");
  const [filtreItemId, setFiltreItemId] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const parNom = "Utilisateur";

  const filtered = useMemo(() => {
    let list = movements;
    if (filtreType) list = list.filter((m) => m.type === filtreType);
    if (filtreItemId) list = list.filter((m) => m.itemId === filtreItemId);
    if (filtrePeriod) {
      const days = parseInt(filtrePeriod, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString();
      list = list.filter((m) => m.date >= cutoffStr);
    }
    return list;
  }, [movements, filtreType, filtreItemId, filtrePeriod]);

  const handleRecord = (mov: Parameters<typeof recordMovement>[0]) => {
    const result = recordMovement(mov);
    if (result.success) setToast({ message: "Mouvement enregistré.", type: "success" });
    return result;
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary pointer-events-none" />
          <select className={inputClass + " pl-9"} value={filtreItemId} onChange={(e) => setFiltreItemId(e.target.value)}>
            <option value="">Tous les articles</option>
            {items.filter((i) => i.actif).map((i) => <option key={i.id} value={i.id}>{i.nom}</option>)}
          </select>
        </div>
        <select className={inputClass + " w-auto min-w-[120px]"} value={filtreType} onChange={(e) => setFiltreType(e.target.value as MovementType | "")}>
          <option value="">Tous types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className={inputClass + " w-auto min-w-[120px]"} value={filtrePeriod} onChange={(e) => setFiltrePeriod(e.target.value)}>
          {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <button type="button" onClick={() => setModalOpen(true)} className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring flex items-center gap-1.5">
          <Plus size={18} strokeWidth={1.7} /> Nouveau mouvement
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-caption text-neutral-text-secondary py-4">Aucune entrée. <button type="button" onClick={() => setModalOpen(true)} className="text-primary-orange font-medium hover:underline focus-ring">Nouveau mouvement</button></p>
      ) : (
        <MovementTable movements={filtered} getItem={getItem} getLocation={getLocation} getProjet={getProjet} />
      )}

      <MovementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        items={items}
        locations={locations}
        projets={projets}
        parNom={parNom}
        onRecord={handleRecord}
        onSuccess={() => setToast({ message: "Mouvement enregistré.", type: "success" })}
      />

      {toast && (
        <div className={`fixed bottom-4 right-4 z-[100] px-4 py-3 border rounded shadow-sm text-caption font-medium ${toast.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`} role="alert">
          {toast.message}
        </div>
      )}
    </>
  );
}
