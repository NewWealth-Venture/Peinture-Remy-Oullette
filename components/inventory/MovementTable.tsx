"use client";

import { Table } from "@/components/ui/Table";
import type { InventoryMovement } from "@/lib/inventory/types";
import type { InventoryItem } from "@/lib/inventory/types";
import type { Location } from "@/lib/inventory/types";
import type { Projet } from "@/types/projet";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString("fr-CA", { dateStyle: "short", timeStyle: "short" });
}

interface MovementTableProps {
  movements: InventoryMovement[];
  getItem: (id: string) => InventoryItem | undefined;
  getLocation: (id: string) => Location | undefined;
  getProjet?: (id: string) => Projet | undefined;
}

export function MovementTable({ movements, getItem, getLocation, getProjet }: MovementTableProps) {
  return (
    <div className="border border-neutral-border rounded overflow-hidden">
      <Table
        columns={[
          { key: "date", label: "Date" },
          { key: "type", label: "Type" },
          { key: "article", label: "Article" },
          { key: "qte", label: "Qté" },
          { key: "devers", label: "De → Vers" },
          { key: "projet", label: "Projet" },
          { key: "par", label: "Par" },
          { key: "motif", label: "Motif" },
        ]}
      >
        {movements.map((m) => {
          const item = getItem(m.itemId);
          const src = m.locationSourceId ? getLocation(m.locationSourceId)?.nom : null;
          const dst = m.locationDestinationId ? getLocation(m.locationDestinationId)?.nom : null;
          const projet = m.projetId && getProjet ? getProjet(m.projetId) : null;
          return (
            <tr key={m.id} className="border-b border-neutral-border hover:bg-neutral-bg-subtle">
              <td className="py-2.5 px-4 text-caption">{formatDate(m.date)}</td>
              <td className="py-2.5 px-4"><span className="inline-flex px-2 py-0.5 rounded text-caption-xs font-medium bg-neutral-bg-subtle">{m.type}</span></td>
              <td className="py-2.5 px-4 font-medium text-neutral-text">{item?.nom ?? m.itemId}</td>
              <td className="py-2.5 px-4 text-caption">{m.quantite} {m.unite}</td>
              <td className="py-2.5 px-4 text-caption text-neutral-text-secondary">{src ?? "—"} → {dst ?? "—"}</td>
              <td className="py-2.5 px-4 text-caption text-neutral-text-secondary">{projet?.titre ?? "—"}</td>
              <td className="py-2.5 px-4 text-caption">{m.par.nom}</td>
              <td className="py-2.5 px-4 text-caption text-neutral-text-secondary">{m.motif ?? "—"}</td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}
