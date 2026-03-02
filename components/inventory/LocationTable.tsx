"use client";

import { Table } from "@/components/ui/Table";
import type { Location } from "@/lib/inventory/types";

interface LocationTableProps {
  locations: Location[];
  onEdit: (loc: Location) => void;
  onToggleActif: (loc: Location) => void;
  onSelect?: (loc: Location) => void;
}

export function LocationTable({ locations, onEdit, onToggleActif, onSelect }: LocationTableProps) {
  return (
    <div className="border border-neutral-border rounded overflow-hidden">
      <Table
        columns={[
          { key: "nom", label: "Nom" },
          { key: "type", label: "Type" },
          { key: "statut", label: "Statut" },
          { key: "actions", label: "", className: "w-[100px]" },
        ]}
      >
        {locations.map((loc) => (
          <tr key={loc.id} className="border-b border-neutral-border hover:bg-neutral-bg-subtle">
            <td className="py-2.5 px-4">
              {onSelect ? (
                <button type="button" onClick={() => onSelect(loc)} className="font-medium text-neutral-text hover:underline focus-ring text-left">
                  {loc.nom}
                </button>
              ) : (
                <span className="font-medium text-neutral-text">{loc.nom}</span>
              )}
            </td>
            <td className="py-2.5 px-4 text-caption text-neutral-text-secondary">{loc.type}</td>
            <td className="py-2.5 px-4">
              <span className={`inline-flex px-2 py-0.5 rounded text-caption-xs font-medium ${loc.actif ? "bg-green-50 text-green-700" : "bg-neutral-bg-subtle text-neutral-text-secondary"}`}>
                {loc.actif ? "Actif" : "Inactif"}
              </span>
            </td>
            <td className="py-2.5 px-4">
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => onEdit(loc)} className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-active focus-ring" aria-label="Modifier">
                  Modifier
                </button>
                <button type="button" onClick={() => onToggleActif(loc)} className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-active focus-ring" aria-label={loc.actif ? "Désactiver" : "Activer"}>
                  {loc.actif ? "Désactiver" : "Activer"}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
