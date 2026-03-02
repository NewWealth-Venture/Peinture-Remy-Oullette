"use client";

import { useState } from "react";
import { MovementModal } from "@/components/inventory/MovementModal";
import { useInventoryStore } from "@/lib/inventory/store";
import type { InventoryItem } from "@/lib/inventory/types";
import { Plus } from "lucide-react";

export default function AlertesPage() {
  const { items, locations, lowStockItems, zeroStockItems, stockTotalByItem, recordMovement, locationsActives } = useInventoryStore();
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [prefillItemId, setPrefillItemId] = useState<string | null>(null);

  const low = lowStockItems();
  const zero = zeroStockItems();
  const actives = locationsActives();
  const hasDestination = actives.length > 0;

  const openEntry = (itemId: string) => {
    setPrefillItemId(itemId);
    setMovementModalOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {zero.length === 0 && low.length === 0 ? (
          <p className="text-caption text-neutral-text-secondary py-4">Aucune alerte. Les articles sous stock minimum ou à zéro apparaîtront ici.</p>
        ) : (
          <>
            {zero.length > 0 && (
              <div className="border border-neutral-border rounded overflow-hidden">
                <h3 className="text-section-title text-neutral-text px-4 py-2.5 border-b border-neutral-border bg-neutral-bg-subtle">Stock à zéro</h3>
                <ul className="divide-y divide-neutral-border">
                  {zero.map((item) => (
                    <li key={item.id} className="flex items-center justify-between py-2.5 px-4 hover:bg-neutral-bg-subtle">
                      <div>
                        <p className="font-medium text-neutral-text">{item.nom}</p>
                        <p className="text-caption-xs text-neutral-text-secondary">Stock actuel : 0 · Min : {item.stockMin ?? "—"}</p>
                      </div>
                      <button type="button" onClick={() => openEntry(item.id)} disabled={!hasDestination} className="h-9 px-3 text-caption font-medium text-primary-orange border border-primary-orange rounded hover:bg-primary-orange/10 focus-ring disabled:opacity-50 flex items-center gap-1.5">
                        <Plus size={16} strokeWidth={1.7} /> Créer mouvement d&apos;entrée
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {low.length > 0 && (
              <div className="border border-neutral-border rounded overflow-hidden">
                <h3 className="text-section-title text-neutral-text px-4 py-2.5 border-b border-neutral-border bg-neutral-bg-subtle">Sous stock minimum</h3>
                <ul className="divide-y divide-neutral-border">
                  {low.map((item) => (
                    <li key={item.id} className="flex items-center justify-between py-2.5 px-4 hover:bg-neutral-bg-subtle">
                      <div>
                        <p className="font-medium text-neutral-text">{item.nom}</p>
                        <p className="text-caption-xs text-neutral-text-secondary">Stock actuel : {stockTotalByItem(item.id)} · Min : {item.stockMin ?? "—"} {item.unite}</p>
                      </div>
                      <button type="button" onClick={() => openEntry(item.id)} disabled={!hasDestination} className="h-9 px-3 text-caption font-medium text-primary-orange border border-primary-orange rounded hover:bg-primary-orange/10 focus-ring disabled:opacity-50 flex items-center gap-1.5">
                        <Plus size={16} strokeWidth={1.7} /> Créer mouvement d&apos;entrée
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <MovementModal
        open={movementModalOpen}
        onClose={() => { setMovementModalOpen(false); setPrefillItemId(null); }}
        items={items}
        locations={locations}
        defaultType="Entrée"
        defaultItemId={prefillItemId ?? undefined}
        defaultLocationDestinationId={actives[0]?.id}
        parNom="Utilisateur"
        onRecord={recordMovement}
      />
    </>
  );
}
