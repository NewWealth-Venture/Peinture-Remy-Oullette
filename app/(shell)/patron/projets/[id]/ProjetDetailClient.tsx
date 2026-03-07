"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { EmptyInline } from "@/components/EmptyInline";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import type { Projet, Tache, PhotoProjet } from "@/types/projet";
import { ArrowLeft, Plus, Pencil, Trash2, Image, Package, ListTodo } from "lucide-react";
import {
  addProjectTaskAction,
  updateProjectTaskAction,
  deleteProjectTaskAction,
  addProjectMaterialUsageAction,
  uploadMediaAction,
} from "@/app/actions/data";

const inputClass =
  "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" });
}

type CategoriePhoto = "Avant" | "Après" | "Progression";

type InventoryItem = { id: string; name: string; unit: string };

export function ProjetDetailClient({
  projet,
  inventaire,
}: {
  projet: Projet;
  inventaire: InventoryItem[];
}) {
  const router = useRouter();
  const id = projet.id;

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Tache | null>(null);
  const [photoTab, setPhotoTab] = useState<CategoriePhoto>("Avant");
  const [photoPreview, setPhotoPreview] = useState<PhotoProjet | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [usageMaterielId, setUsageMaterielId] = useState("");
  const [usageQuantite, setUsageQuantite] = useState("");
  const [usageNote, setUsageNote] = useState("");

  const [tacheTitre, setTacheTitre] = useState("");
  const [tacheDesc, setTacheDesc] = useState("");
  const [tachePriorite, setTachePriorite] = useState<Tache["priorite"]>("Normale");
  const [tacheStatut, setTacheStatut] = useState<Tache["statut"]>("À faire");

  const taches = projet.taches ?? [];
  const photosByCat = useMemo(() => {
    const photos = projet.photos ?? [];
    return { Avant: photos.filter((p) => p.categorie === "Avant"), Après: photos.filter((p) => p.categorie === "Après"), Progression: photos.filter((p) => p.categorie === "Progression") };
  }, [projet.photos]);
  const usages = projet.materielUtilise ?? [];

  const openNewTask = () => {
    setEditingTask(null);
    setTacheTitre("");
    setTacheDesc("");
    setTachePriorite("Normale");
    setTacheStatut("À faire");
    setTaskModalOpen(true);
  };

  const openEditTask = (t: Tache) => {
    setEditingTask(t);
    setTacheTitre(t.titre);
    setTacheDesc(t.description ?? "");
    setTachePriorite(t.priorite);
    setTacheStatut(t.statut);
    setTaskModalOpen(true);
  };

  const saveTask = async () => {
    if (!tacheTitre.trim()) return;
    if (editingTask) {
      const r = await updateProjectTaskAction(editingTask.id, {
        title: tacheTitre.trim(),
        description: tacheDesc.trim() || null,
        priority: tachePriorite,
        status: tacheStatut,
      });
      if (r.success) router.refresh();
    } else {
      const r = await addProjectTaskAction(id, {
        title: tacheTitre.trim(),
        description: tacheDesc.trim() || null,
        priority: tachePriorite,
        status: tacheStatut,
      });
      if (r.success) router.refresh();
    }
    setTaskModalOpen(false);
  };

  const removeTask = async (tacheId: string) => {
    if (typeof window !== "undefined" && !window.confirm("Supprimer cette tâche ?")) return;
    const r = await deleteProjectTaskAction(tacheId);
    if (r.success) router.refresh();
  };

  const onPhotoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setPhotoUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadMediaAction("project_photo", id, formData);
    setPhotoUploading(false);
    e.target.value = "";
    if (result.success) router.refresh();
  };

  const addUsageSubmit = async () => {
    const q = parseInt(usageQuantite, 10);
    const item = inventaire.find((i) => i.id === usageMaterielId);
    if (!usageMaterielId || !item || isNaN(q) || q <= 0) return;
    const r = await addProjectMaterialUsageAction(id, usageMaterielId, q, item.unit, usageNote.trim() || null);
    if (r.success) {
      setUsageModalOpen(false);
      setUsageMaterielId("");
      setUsageQuantite("");
      setUsageNote("");
      router.refresh();
    }
  };

  return (
    <div className="p-6 max-w-[1180px] mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/patron/projets" className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-subtle focus-ring" aria-label="Retour">
          <ArrowLeft size={20} strokeWidth={1.7} />
        </Link>
        <PageHeader title={projet.titre} subtitle={projet.adresse ?? "Sans adresse"} />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <SectionCard title="Résumé">
            <div className="grid grid-cols-2 gap-3 text-caption">
              <div>
                <span className="text-neutral-text-secondary">Statut</span>
                <p className="font-medium text-neutral-text">{projet.statut}</p>
              </div>
              <div>
                <span className="text-neutral-text-secondary">Début</span>
                <p className="font-medium text-neutral-text">{formatDate(projet.dateDebut)}</p>
              </div>
              <div>
                <span className="text-neutral-text-secondary">Fin</span>
                <p className="font-medium text-neutral-text">{formatDate(projet.dateFin)}</p>
              </div>
              {projet.description && (
                <div className="col-span-2">
                  <span className="text-neutral-text-secondary">Description</span>
                  <p className="text-neutral-text mt-0.5">{projet.description}</p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Tâches du chantier"
            actions={
              <button type="button" onClick={openNewTask} className="flex items-center gap-1.5 h-9 px-3 text-caption font-medium text-primary-orange border border-primary-orange rounded hover:bg-primary-orange/10 focus-ring">
                <Plus size={18} strokeWidth={1.7} /> Nouvelle tâche
              </button>
            }
          >
            {taches.length === 0 ? (
              <EmptyInline icon={ListTodo} message="Aucune tâche. Ajoutez une tâche pour le chantier." />
            ) : (
              <ul className="space-y-2">
                {taches.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-2 px-3 border border-neutral-border rounded hover:bg-neutral-bg-subtle">
                    <button type="button" onClick={() => openEditTask(t)} className="text-left flex-1 min-w-0 focus-ring rounded">
                      <span className="font-medium text-neutral-text block truncate">{t.titre}</span>
                      <span className="text-caption-xs text-neutral-text-secondary">{t.statut} · {t.priorite}</span>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => openEditTask(t)} className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-active focus-ring" aria-label="Modifier">
                        <Pencil size={16} strokeWidth={1.7} />
                      </button>
                      <button type="button" onClick={() => removeTask(t.id)} className="p-2 rounded text-neutral-text-secondary hover:bg-red-50 hover:text-red-600 focus-ring" aria-label="Supprimer">
                        <Trash2 size={16} strokeWidth={1.7} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-4">
          <SectionCard title="Photos">
            <div className="flex border-b border-neutral-border mb-3">
              {(["Avant", "Après", "Progression"] as const).map((cat) => (
                <button key={cat} type="button" onClick={() => setPhotoTab(cat)} className={`px-4 py-2.5 text-caption font-medium border-b-2 -mb-px focus-ring ${photoTab === cat ? "border-primary-blue text-primary-blue" : "border-transparent text-neutral-text-secondary hover:text-neutral-text"}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div>
              <div className="mb-3">
                <p className="text-caption text-neutral-text-secondary mb-2">Ajouter une photo</p>
                <input type="file" accept="image/*" onChange={onPhotoFileSelect} disabled={photoUploading} className="text-caption" />
                {photoUploading && <p className="text-caption-xs text-neutral-text-secondary mt-1">Envoi en cours…</p>}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(photosByCat[photoTab] ?? []).map((ph) => (
                  <button key={ph.id} type="button" onClick={() => setPhotoPreview(ph)} className="aspect-square rounded border border-neutral-border overflow-hidden bg-neutral-bg-subtle focus-ring">
                    {ph.url ? <img src={ph.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image size={24} className="text-neutral-text-secondary" /></div>}
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Matériel utilisé"
            actions={
              <button type="button" onClick={() => setUsageModalOpen(true)} className="text-caption font-medium text-primary-orange hover:underline focus-ring">
                Ajouter usage
              </button>
            }
          >
            {usages.length === 0 ? (
              <EmptyInline icon={Package} message="Aucun matériel enregistré pour ce projet." />
            ) : (
              <ul className="space-y-1.5">
                {usages.map((u) => {
                  const mat = inventaire.find((i) => i.id === u.materielId);
                  return (
                    <li key={u.id} className="flex justify-between text-caption py-1">
                      <span className="text-neutral-text">{mat?.name ?? u.materielId}</span>
                      <span className="text-neutral-text-secondary">{u.quantite} {mat?.unit ?? ""}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>

      <Modal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} title={editingTask ? "Modifier la tâche" : "Nouvelle tâche"} maxWidth="md">
        <div className="p-4 space-y-4">
          <Field label="Titre" required>
            <input type="text" className={inputClass} value={tacheTitre} onChange={(e) => setTacheTitre(e.target.value)} placeholder="Titre de la tâche" />
          </Field>
          <Field label="Description">
            <textarea className={inputClass + " min-h-[80px] resize-y py-2"} value={tacheDesc} onChange={(e) => setTacheDesc(e.target.value)} placeholder="Description..." />
          </Field>
          <Field label="Priorité">
            <select className={inputClass} value={tachePriorite} onChange={(e) => setTachePriorite(e.target.value as Tache["priorite"])}>
              <option value="Basse">Basse</option>
              <option value="Normale">Normale</option>
              <option value="Haute">Haute</option>
            </select>
          </Field>
          <Field label="Statut">
            <select className={inputClass} value={tacheStatut} onChange={(e) => setTacheStatut(e.target.value as Tache["statut"])}>
              <option value="À faire">À faire</option>
              <option value="En cours">En cours</option>
              <option value="Bloqué">Bloqué</option>
              <option value="Terminé">Terminé</option>
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setTaskModalOpen(false)} className="h-9 px-3.5 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded hover:bg-neutral-bg-active focus-ring">Annuler</button>
            <button type="button" onClick={saveTask} className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring">{editingTask ? "Enregistrer" : "Créer"}</button>
          </div>
        </div>
      </Modal>

      {photoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setPhotoPreview(null)}>
          <div className="max-w-2xl max-h-[90vh] overflow-auto bg-neutral-white rounded border border-neutral-border p-4" onClick={(e) => e.stopPropagation()}>
            {photoPreview.url && <img src={photoPreview.url} alt="" className="w-full h-auto max-h-[70vh] object-contain" />}
            {photoPreview.description && <p className="text-caption text-neutral-text mt-2">{photoPreview.description}</p>}
            <button type="button" onClick={() => setPhotoPreview(null)} className="mt-3 h-9 px-3 text-caption font-medium bg-neutral-bg-subtle border border-neutral-border rounded focus-ring">Fermer</button>
          </div>
        </div>
      )}

      <Modal open={usageModalOpen} onClose={() => setUsageModalOpen(false)} title="Ajouter un usage" maxWidth="sm">
        <div className="p-4 space-y-4">
          <Field label="Matériel">
            <select className={inputClass} value={usageMaterielId} onChange={(e) => setUsageMaterielId(e.target.value)}>
              <option value="">Sélectionner...</option>
              {inventaire.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
              ))}
            </select>
          </Field>
          <Field label="Quantité">
            <input type="number" min={1} className={inputClass} value={usageQuantite} onChange={(e) => setUsageQuantite(e.target.value)} />
          </Field>
          <Field label="Note (optionnel)">
            <input type="text" className={inputClass} value={usageNote} onChange={(e) => setUsageNote(e.target.value)} placeholder="Note..." />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setUsageModalOpen(false)} className="h-9 px-3.5 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded focus-ring">Annuler</button>
            <button type="button" onClick={addUsageSubmit} disabled={!usageMaterielId || !usageQuantite} className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded focus-ring disabled:opacity-50">Ajouter</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
