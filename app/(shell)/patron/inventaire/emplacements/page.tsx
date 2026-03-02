"use client";

import { useState } from "react";
import { Table } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { MovementModal } from "@/components/inventory/MovementModal";
import { useInventoryStore } from "@/lib/inventory/store";
import type { Location, LocationType } from "@/lib/inventory/types";
import { Plus, Pencil, Power, ArrowRightLeft } from "lucide-react";

const TYPES: LocationType[] = ["Entrepôt", "Camion", "Chantier"];

const inputClass = "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

export default function EmplacementsPage() {
  const { items, locations, addLocation, updateLocation, getStockByLocation, getById: getItem, recordMovement } = useInventoryStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editLoc, setEditLoc] = useState<Location | null>(null);
  const [detailLocId, setDetailLocId] = useState<string | null>(null);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [type, setType] = useState<LocationType>("Entrepôt");
  const [details, setDetails] = useState("");

  const openNew = () => {
    setEditLoc(null);
    setNom("");
    setType("Entrepôt");
    setDetails("");
    setModalOpen(true);
  };

  const openEdit = (loc: Location) => {
    setEditLoc(loc);
    setNom(loc.nom);
    setType(loc.type);
    setDetails(loc.details ?? "");
    setModalOpen(true);
  };

  const saveLoc = () => {
    if (!nom.trim()) return;
    if (editLoc) updateLocation(editLoc.id, { nom: nom.trim(), type, details: details.trim() || undefined });
    else addLocation({ nom: nom.trim(), type, details: details.trim() || undefined, actif: true });
    setModalOpen(false);
  };

  const toggleActif = (loc: Location) => {
    updateLocation(loc.id, { actif: !loc.actif });
  };

  const detailLoc = detailLocId ? locations.find((l) => l.id === detailLocId) : null;
  const stockAtDetail = detailLocId ? getStockByLocation(detailLocId) : [];

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4">
        <button type="button" onClick={openNew} className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring flex items-center gap-1.5">
          <Plus size={18} strokeWidth={1.7} /> Ajouter un emplacement
        </button>
      </div>

      {locations.length === 0 ? (
        <p className="text-caption text-neutral-text-secondary py-4">Aucune entrée. <button type="button" onClick={openNew} className="text-primary-orange font-medium hover:underline focus-ring">Ajouter un emplacement</button></p>
      ) : (
        <>
          <div className="border border-neutral-border rounded overflow-hidden mb-6">
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
                    <button type="button" onClick={() => setDetailLocId(loc.id)} className="font-medium text-neutral-text hover:underline focus-ring text-left">
                      {loc.nom}
                    </button>
                  </td>
                  <td className="py-2.5 px-4 text-caption text-neutral-text-secondary">{loc.type}</td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-caption-xs font-medium ${loc.actif ? "bg-green-50 text-green-700" : "bg-neutral-bg-subtle text-neutral-text-secondary"}`}>
                      {loc.actif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => openEdit(loc)} className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-active focus-ring" aria-label="Modifier"><Pencil size={16} strokeWidth={1.7} /></button>
                      <button type="button" onClick={() => toggleActif(loc)} className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-active focus-ring" aria-label={loc.actif ? "Désactiver" : "Activer"}><Power size={16} strokeWidth={1.7} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </div>

          {detailLoc && (
            <div className="border border-neutral-border rounded p-4">
              <h3 className="text-section-title text-neutral-text mb-3">Stock présent · {detailLoc.nom}</h3>
              {stockAtDetail.length === 0 ? (
                <p className="text-caption text-neutral-text-secondary py-2">Aucun stock dans cet emplacement.</p>
              ) : (
                <table className="w-full text-caption border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-border">
                      <th className="text-left py-2 font-medium text-neutral-text-secondary">Article</th>
                      <th className="text-right py-2 font-medium text-neutral-text-secondary">Quantité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockAtDetail.map((s) => {
                      const item = getItem(s.itemId);
                      return (
                        <tr key={s.id} className="border-b border-neutral-border">
                          <td className="py-2">{item?.nom ?? s.itemId}</td>
                          <td className="py-2 text-right">{s.quantite} {item?.unite ?? ""}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              <button type="button" onClick={() => { setMovementModalOpen(true); }} className="mt-3 h-9 px-3.5 text-caption font-medium text-primary-orange border border-primary-orange rounded hover:bg-primary-orange/10 focus-ring flex items-center gap-1.5">
                <ArrowRightLeft size={18} strokeWidth={1.7} /> Transférer
              </button>
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editLoc ? "Modifier l'emplacement" : "Ajouter un emplacement"} maxWidth="sm">
        <div className="p-4 space-y-4">
          <Field label="Nom" required><input type="text" className={inputClass} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom de l'emplacement" /></Field>
          <Field label="Type">
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as LocationType)}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Détails (optionnel)"><input type="text" className={inputClass} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Détails..." /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="h-9 px-3.5 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded focus-ring">Annuler</button>
            <button type="button" onClick={saveLoc} className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded focus-ring">Enregistrer</button>
          </div>
        </div>
      </Modal>

      <MovementModal
        open={movementModalOpen}
        onClose={() => setMovementModalOpen(false)}
        items={items}
        locations={locations}
        defaultType="Transfert"
        defaultLocationSourceId={detailLocId ?? undefined}
        parNom="Utilisateur"
        onRecord={recordMovement}
      />
    </>
  );
}
