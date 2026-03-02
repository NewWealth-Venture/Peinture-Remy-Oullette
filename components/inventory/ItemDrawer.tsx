"use client";

import { useEffect } from "react";
import type { InventoryItem } from "@/lib/inventory/types";
import type { StockByLocation } from "@/lib/inventory/types";
import type { InventoryMovement } from "@/lib/inventory/types";
import { StockBadge } from "./StockBadge";
import { X } from "lucide-react";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString("fr-CA", { dateStyle: "short", timeStyle: "short" });
}

interface ItemDrawerProps {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  stockByItem: StockByLocation[];
  movements: InventoryMovement[];
  getLocationName: (id: string) => string;
}

export function ItemDrawer({ open, onClose, item, stockByItem, movements, getLocationName }: ItemDrawerProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} aria-hidden />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-neutral-white border-l border-neutral-border shadow-lg flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-border shrink-0">
          <h2 className="text-section-title text-neutral-text font-heading">Fiche article</h2>
          <button type="button" onClick={onClose} className="p-2 rounded hover:bg-neutral-bg-subtle focus-ring" aria-label="Fermer">
            <X size={20} strokeWidth={1.7} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {!item ? (
            <p className="text-caption text-neutral-text-secondary">Aucun article sélectionné.</p>
          ) : (
            <>
              <div className="mb-4">
                <p className="font-medium text-neutral-text">{item.nom}</p>
                {item.sku && <p className="text-caption-xs text-neutral-text-secondary">{item.sku}</p>}
                <p className="text-caption text-neutral-text-secondary mt-1">{item.categorie} · {item.unite}</p>
                <div className="mt-2">
                  <StockBadge total={stockByItem.reduce((s, r) => s + r.quantite, 0)} stockMin={item.stockMin} unite={item.unite} />
                </div>
              </div>

              <h3 className="text-section-title text-neutral-text mb-2">Stock par emplacement</h3>
              {stockByItem.length === 0 ? (
                <p className="text-caption text-neutral-text-secondary py-2">Aucun stock enregistré.</p>
              ) : (
                <table className="w-full text-caption border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-border">
                      <th className="text-left py-2 font-medium text-neutral-text-secondary">Emplacement</th>
                      <th className="text-right py-2 font-medium text-neutral-text-secondary">Quantité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockByItem.map((s) => (
                      <tr key={s.id} className="border-b border-neutral-border">
                        <td className="py-2">{getLocationName(s.locationId)}</td>
                        <td className="py-2 text-right">{s.quantite} {item.unite}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <h3 className="text-section-title text-neutral-text mt-4 mb-2">Derniers mouvements</h3>
              {movements.length === 0 ? (
                <p className="text-caption text-neutral-text-secondary py-2">Aucun mouvement.</p>
              ) : (
                <ul className="space-y-2">
                  {movements.slice(0, 5).map((m) => (
                    <li key={m.id} className="py-2 px-3 border border-neutral-border rounded text-caption">
                      <span className="font-medium">{m.type}</span> · {m.quantite} {m.unite} · {formatDate(m.date)}
                      <p className="text-caption-xs text-neutral-text-secondary mt-0.5">Par {m.par.nom}{m.motif ? ` · ${m.motif}` : ""}</p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
