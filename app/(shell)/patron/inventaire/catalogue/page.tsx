"use client";

import { useState, useMemo } from "react";
import { Table } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { StockBadge } from "@/components/inventory/StockBadge";
import { ItemDrawer } from "@/components/inventory/ItemDrawer";
import { useInventoryStore } from "@/lib/inventory/store";
import type { InventoryItem, InventoryItemCategory } from "@/lib/inventory/types";
import { Plus, Search, Pencil, Eye, Power } from "lucide-react";

const CATEGORIES: InventoryItemCategory[] = ["Peinture", "Plâtre", "Outils", "Protection", "Autre"];
const UNITES: InventoryItem["unite"][] = ["unité", "litre", "kg", "boîte"];

const inputClass =
  "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

export default function CataloguePage() {
  const { items, add, update, getStockByItem, stockTotalByItem, getMovementsByItem, getLocation } = useInventoryStore();
  const [search, setSearch] = useState("");
  const [filtreCat, setFiltreCat] = useState<InventoryItemCategory | "">("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [drawerItemId, setDrawerItemId] = useState<string | null>(null);

  const [nom, setNom] = useState("");
  const [sku, setSku] = useState("");
  const [categorie, setCategorie] = useState<InventoryItemCategory>("Peinture");
  const [unite, setUnite] = useState<InventoryItem["unite"]>("unité");
  const [stockMin, setStockMin] = useState("");
  const [notes, setNotes] = useState("");

  const filtered = useMemo(() => {
    let list = items;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((i) => i.nom.toLowerCase().includes(q) || (i.sku?.toLowerCase().includes(q)));
    }
    if (filtreCat) list = list.filter((i) => i.categorie === filtreCat);
    return list;
  }, [items, search, filtreCat]);

  const openNew = () => {
    setEditItem(null);
    setNom("");
    setSku("");
    setCategorie("Peinture");
    setUnite("unité");
    setStockMin("");
    setNotes("");
    setModalOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setNom(item.nom);
    setSku(item.sku ?? "");
    setCategorie(item.categorie);
    setUnite(item.unite);
    setStockMin(item.stockMin != null ? String(item.stockMin) : "");
    setNotes(item.notes ?? "");
    setModalOpen(true);
  };

  const saveItem = () => {
    if (!nom.trim()) return;
    const payload = {
      nom: nom.trim(),
      sku: sku.trim() || undefined,
      categorie,
      unite,
      stockMin: stockMin === "" ? undefined : parseInt(stockMin, 10),
      notes: notes.trim() || undefined,
      actif: editItem?.actif ?? true,
    };
    if (editItem) update(editItem.id, payload);
    else add(payload);
    setModalOpen(false);
  };

  const toggleActif = (item: InventoryItem) => {
    update(item.id, { actif: !item.actif });
  };

  const getLocationName = (id: string) => getLocation(id)?.nom ?? id;

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary pointer-events-none" />
          <input type="search" placeholder="Rechercher (nom, SKU)..." value={search} onChange={(e) => setSearch(e.target.value)} className={inputClass + " pl-9"} />
        </div>
        <select value={filtreCat} onChange={(e) => setFiltreCat(e.target.value as InventoryItemCategory | "")} className={inputClass + " w-auto min-w-[140px]"}>
          <option value="">Toutes catégories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="button" onClick={openNew} className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring flex items-center gap-1.5">
          <Plus size={18} strokeWidth={1.7} /> Ajouter un article
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-caption text-neutral-text-secondary py-4">Aucune entrée. <button type="button" onClick={openNew} className="text-primary-orange font-medium hover:underline focus-ring">Ajouter un article</button></p>
      ) : (
        <div className="border border-neutral-border rounded overflow-hidden">
          <Table
            columns={[
              { key: "article", label: "Article" },
              { key: "categorie", label: "Catégorie" },
              { key: "stock", label: "Stock total" },
              { key: "min", label: "Stock min" },
              { key: "statut", label: "Statut" },
              { key: "actions", label: "", className: "w-[44px]" },
            ]}
          >
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-neutral-border hover:bg-neutral-bg-subtle group">
                <td className="py-2.5 px-4">
                  <button type="button" onClick={() => setDrawerItemId(item.id)} className="text-left font-medium text-neutral-text hover:underline focus-ring">
                    {item.nom}
                  </button>
                  {item.sku && <p className="text-caption-xs text-neutral-text-secondary">{item.sku}</p>}
                </td>
                <td className="py-2.5 px-4 text-caption text-neutral-text-secondary">{item.categorie}</td>
                <td className="py-2.5 px-4">
                  <StockBadge total={stockTotalByItem(item.id)} stockMin={item.stockMin} unite={item.unite} />
                </td>
                <td className="py-2.5 px-4 text-caption">{item.stockMin ?? "—"}</td>
                <td className="py-2.5 px-4">
                  <span className={`inline-flex px-2 py-0.5 rounded text-caption-xs font-medium ${item.actif ? "bg-green-50 text-green-700" : "bg-neutral-bg-subtle text-neutral-text-secondary"}`}>
                    {item.actif ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="py-2.5 px-4 relative">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setDrawerItemId(item.id)} className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-active focus-ring" aria-label="Voir fiche"><Eye size={16} strokeWidth={1.7} /></button>
                    <button type="button" onClick={() => openEdit(item)} className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-active focus-ring" aria-label="Modifier"><Pencil size={16} strokeWidth={1.7} /></button>
                    <button type="button" onClick={() => toggleActif(item)} className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-active focus-ring" aria-label={item.actif ? "Désactiver" : "Activer"}><Power size={16} strokeWidth={1.7} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Modifier l'article" : "Ajouter un article"} maxWidth="md">
        <div className="p-4 space-y-4">
          <Field label="Nom" required><input type="text" className={inputClass} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom de l'article" /></Field>
          <Field label="SKU (optionnel)"><input type="text" className={inputClass} value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Référence" /></Field>
          <Field label="Catégorie">
            <select className={inputClass} value={categorie} onChange={(e) => setCategorie(e.target.value as InventoryItemCategory)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Unité">
            <select className={inputClass} value={unite} onChange={(e) => setUnite(e.target.value as InventoryItem["unite"])}>
              {UNITES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </Field>
          <Field label="Stock minimum (optionnel)"><input type="number" min={0} className={inputClass} value={stockMin} onChange={(e) => setStockMin(e.target.value)} /></Field>
          <Field label="Notes (optionnel)"><textarea className={inputClass + " min-h-[60px] resize-y py-2"} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="h-9 px-3.5 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded focus-ring">Annuler</button>
            <button type="button" onClick={saveItem} className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded focus-ring">Enregistrer</button>
          </div>
        </div>
      </Modal>

      <ItemDrawer
        open={drawerItemId !== null}
        onClose={() => setDrawerItemId(null)}
        item={drawerItemId ? items.find((i) => i.id === drawerItemId) ?? null : null}
        stockByItem={drawerItemId ? getStockByItem(drawerItemId) : []}
        movements={drawerItemId ? getMovementsByItem(drawerItemId, 5) : []}
        getLocationName={getLocationName}
      />
    </>
  );
}
