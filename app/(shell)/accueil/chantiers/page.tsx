"use client";

import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { TableShell } from "@/components/TableShell";
import { EmptyState } from "@/components/EmptyState";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Filter,
} from "lucide-react";

type StatutChantier =
  | "a_venir"
  | "en_cours"
  | "en_attente"
  | "termine"
  | "suspendu";

interface Chantier {
  id: string;
  nom: string;
  adresse: string;
  client: string;
  telephone: string;
  statut: StatutChantier;
  chefEquipe: string;
  dateDebut: string;
  dateFinPrevue: string;
  derniereMaj: string;
  notes: string;
}

const STATUT_LABELS: Record<StatutChantier, string> = {
  a_venir: "À venir",
  en_cours: "En cours",
  en_attente: "En attente",
  termine: "Terminé",
  suspendu: "Suspendu",
};

const STATUT_STYLE: Record<StatutChantier, string> = {
  a_venir: "bg-blue-100 text-blue-800",
  en_cours: "bg-green-100 text-green-800",
  en_attente: "bg-amber-100 text-amber-800",
  termine: "bg-neutral-bg-subtle text-neutral-text-secondary",
  suspendu: "bg-red-100 text-red-800",
};

const STORAGE_KEY = "chantiers-data";

function loadChantiers(): Chantier[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveChantiers(list: Chantier[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const columns = [
  "Nom chantier",
  "Adresse",
  "Client",
  "Statut",
  "Chef d'équipe",
  "Dernière mise à jour",
  "Actions",
];

const inputClass =
  "w-full rounded border border-neutral-border bg-neutral-white px-3 py-2 text-body text-neutral-text focus:border-primary-blue focus:outline-none focus:ring-1 focus:ring-primary-blue";
const labelClass = "block text-caption text-neutral-text-secondary mb-1";

interface ChantierModalProps {
  open: boolean;
  onClose: () => void;
  chantier: Chantier | null;
  onSave: (c: Omit<Chantier, "id" | "derniereMaj">) => void;
  onDelete?: () => void;
}

function ChantierModal({
  open,
  onClose,
  chantier,
  onSave,
  onDelete,
}: ChantierModalProps) {
  const isEdit = Boolean(chantier?.id);
  const [nom, setNom] = useState("");
  const [adresse, setAdresse] = useState("");
  const [client, setClient] = useState("");
  const [telephone, setTelephone] = useState("");
  const [statut, setStatut] = useState<StatutChantier>("a_venir");
  const [chefEquipe, setChefEquipe] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFinPrevue, setDateFinPrevue] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (chantier) {
      setNom(chantier.nom);
      setAdresse(chantier.adresse);
      setClient(chantier.client);
      setTelephone(chantier.telephone);
      setStatut(chantier.statut);
      setChefEquipe(chantier.chefEquipe);
      setDateDebut(chantier.dateDebut ? chantier.dateDebut.slice(0, 10) : "");
      setDateFinPrevue(
        chantier.dateFinPrevue ? chantier.dateFinPrevue.slice(0, 10) : ""
      );
      setNotes(chantier.notes);
    } else {
      setNom("");
      setAdresse("");
      setClient("");
      setTelephone("");
      setStatut("a_venir");
      setChefEquipe("");
      setDateDebut("");
      setDateFinPrevue("");
      setNotes("");
    }
    setErrors({});
  }, [open, chantier]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!nom.trim()) e.nom = "Le nom du chantier est requis.";
    if (!adresse.trim()) e.adresse = "L'adresse est requise.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const now = new Date().toISOString();
    onSave({
      nom: nom.trim(),
      adresse: adresse.trim(),
      client: client.trim(),
      telephone: telephone.trim(),
      statut,
      chefEquipe: chefEquipe.trim(),
      dateDebut: dateDebut || "",
      dateFinPrevue: dateFinPrevue || "",
      notes: notes.trim(),
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-neutral-white border border-neutral-border rounded shadow-sm w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-border shrink-0">
          <h2 className="text-section-title text-neutral-text font-heading">
            {isEdit ? "Modifier le chantier" : "Nouveau chantier"}
          </h2>
          <div className="flex items-center gap-2">
            {onDelete && isEdit && (
              <button
                type="button"
                onClick={onDelete}
                className="p-2 text-neutral-text-secondary hover:text-red-600 hover:bg-neutral-bg-active rounded focus-ring"
                aria-label="Supprimer"
              >
                <Trash2 size={18} strokeWidth={1.7} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-text-secondary hover:bg-neutral-bg-active rounded focus-ring"
              aria-label="Fermer"
            >
              <X size={18} strokeWidth={1.7} />
            </button>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-4 flex flex-col gap-4 overflow-y-auto"
        >
          <div>
            <label className={labelClass}>Nom du chantier *</label>
            <input
              type="text"
              className={inputClass}
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Peinture résidence Dupont"
            />
            {errors.nom && (
              <p className="text-caption-xs text-red-600 mt-0.5">{errors.nom}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Adresse *</label>
            <input
              type="text"
              className={inputClass}
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Adresse complète du chantier"
            />
            {errors.adresse && (
              <p className="text-caption-xs text-red-600 mt-0.5">
                {errors.adresse}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Client</label>
              <input
                type="text"
                className={inputClass}
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Nom du client"
              />
            </div>
            <div>
              <label className={labelClass}>Téléphone</label>
              <input
                type="tel"
                className={inputClass}
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="(514) 000-0000"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Statut</label>
            <select
              className={inputClass}
              value={statut}
              onChange={(e) => setStatut(e.target.value as StatutChantier)}
            >
              {(Object.keys(STATUT_LABELS) as StatutChantier[]).map((s) => (
                <option key={s} value={s}>
                  {STATUT_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Chef d&apos;équipe</label>
            <input
              type="text"
              className={inputClass}
              value={chefEquipe}
              onChange={(e) => setChefEquipe(e.target.value)}
              placeholder="Nom du chef d'équipe"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date de début</label>
              <input
                type="date"
                className={inputClass}
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Date de fin prévue</label>
              <input
                type="date"
                className={inputClass}
                value={dateFinPrevue}
                onChange={(e) => setDateFinPrevue(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              className={inputClass + " min-h-[80px] resize-y"}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes internes..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3.5 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded hover:bg-neutral-bg-active focus-ring"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange border border-primary-orange rounded hover:opacity-90 focus-ring"
            >
              {isEdit ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AccueilChantiersPage() {
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Chantier | null>(null);
  const [filtreStatut, setFiltreStatut] = useState<StatutChantier | "">("");
  const [recherche, setRecherche] = useState("");

  useEffect(() => {
    setChantiers(loadChantiers());
  }, []);

  const filtered = useMemo(() => {
    let list = chantiers;
    if (filtreStatut) {
      list = list.filter((c) => c.statut === filtreStatut);
    }
    if (recherche.trim()) {
      const q = recherche.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.nom.toLowerCase().includes(q) ||
          c.adresse.toLowerCase().includes(q) ||
          c.client.toLowerCase().includes(q) ||
          c.chefEquipe.toLowerCase().includes(q)
      );
    }
    return list.sort(
      (a, b) =>
        new Date(b.derniereMaj).getTime() - new Date(a.derniereMaj).getTime()
    );
  }, [chantiers, filtreStatut, recherche]);

  const handleSave = (data: Omit<Chantier, "id" | "derniereMaj">) => {
    const now = new Date().toISOString();
    if (editing) {
      setChantiers((prev) => {
        const next = prev.map((c) =>
          c.id === editing.id
            ? { ...c, ...data, derniereMaj: now }
            : c
        );
        saveChantiers(next);
        return next;
      });
    } else {
      const nouveau: Chantier = {
        id: crypto.randomUUID(),
        ...data,
        derniereMaj: now,
      };
      setChantiers((prev) => {
        const next = [nouveau, ...prev];
        saveChantiers(next);
        return next;
      });
    }
    setEditing(null);
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!editing) return;
    if (typeof window !== "undefined" && !window.confirm("Supprimer ce chantier ?")) return;
    setChantiers((prev) => {
      const next = prev.filter((c) => c.id !== editing.id);
      saveChantiers(next);
      return next;
    });
    setEditing(null);
    setModalOpen(false);
  };

  const handleDeleteById = (id: string) => {
    if (typeof window !== "undefined" && !window.confirm("Supprimer ce chantier ?")) return;
    setChantiers((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveChantiers(next);
      return next;
    });
  };

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (c: Chantier) => {
    setEditing(c);
    setModalOpen(true);
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Chantiers"
        subtitle="Gérez vos chantiers : ajout, suivi et mise à jour."
      />

      <SectionCard
        title="Liste des chantiers"
        description="Recherche et filtre par statut"
        actions={
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-1.5 h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring"
          >
            <Plus size={18} /> Nouveau chantier
          </button>
        }
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary pointer-events-none"
            />
            <input
              type="search"
              placeholder="Rechercher (nom, adresse, client, chef)..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className={inputClass + " pl-9"}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-neutral-text-secondary shrink-0" />
            <select
              value={filtreStatut}
              onChange={(e) =>
                setFiltreStatut((e.target.value || "") as StatutChantier | "")
              }
              className={inputClass + " w-auto min-w-[140px]"}
            >
              <option value="">Tous les statuts</option>
              {(Object.keys(STATUT_LABELS) as StatutChantier[]).map((s) => (
                <option key={s} value={s}>
                  {STATUT_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={chantiers.length === 0 ? "Aucun chantier" : "Aucun résultat"}
            description={
              chantiers.length === 0
                ? "Ajoutez un chantier pour commencer le suivi."
                : "Modifiez la recherche ou le filtre pour voir d'autres chantiers."
            }
            cta={
              chantiers.length === 0 ? (
                <button
                  type="button"
                  onClick={openNew}
                  className="flex items-center gap-1.5 h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring"
                >
                  <Plus size={18} /> Ajouter un chantier
                </button>
              ) : undefined
            }
          />
        ) : (
          <TableShell columns={columns}>
            {filtered.map((c) => (
              <tr
                key={c.id}
                className="border-b border-neutral-border hover:bg-neutral-bg-subtle transition-colors"
              >
                <td className="py-3 px-4 font-medium text-neutral-text">
                  {c.nom || "—"}
                </td>
                <td className="py-3 px-4 text-caption text-neutral-text-secondary">
                  {c.adresse || "—"}
                </td>
                <td className="py-3 px-4 text-caption text-neutral-text-secondary">
                  {c.client || "—"}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={
                      "inline-flex px-2 py-0.5 rounded text-caption-xs font-medium " +
                      STATUT_STYLE[c.statut]
                    }
                  >
                    {STATUT_LABELS[c.statut]}
                  </span>
                </td>
                <td className="py-3 px-4 text-caption text-neutral-text-secondary">
                  {c.chefEquipe || "—"}
                </td>
                <td className="py-3 px-4 text-caption text-neutral-text-secondary">
                  {formatDate(c.derniereMaj)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-border hover:text-neutral-text focus-ring"
                      aria-label="Modifier"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteById(c.id)}
                      className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-border hover:text-red-600 focus-ring"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </TableShell>
        )}
      </SectionCard>

      <ChantierModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        chantier={editing}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
      />
    </div>
  );
}
