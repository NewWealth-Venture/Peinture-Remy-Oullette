"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SectionCard } from "@/components/SectionCard";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import type { Projet, Tache, PhotoProjet } from "@/types/projet";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Package,
  ListTodo,
  TrendingUp,
  FileText,
  Users,
  AlertTriangle,
  Send,
} from "lucide-react";
import {
  addProjectTaskAction,
  updateProjectTaskAction,
  deleteProjectTaskAction,
  addProjectMaterialUsageAction,
  uploadMediaAction,
  createDailyProgressAction,
} from "@/app/actions/data";

const inputClass =
  "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" });
}
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

type CategoriePhoto = "Avant" | "Après" | "Progression";
type InventoryItem = { id: string; name: string; unit: string };
type TeamMember = { id: string; name: string };
type BriefSummary = { id: string; title: string; status: string; instructions: string; updated_at: string };
type LowStockItem = { id: string; name: string; min_stock: number | null };

type ActivityItem = {
  type: "photo" | "avancement" | "brief" | "tache";
  at: string;
  label: string;
  extra?: string;
};

export function ProjetDetailClient({
  projet,
  inventaire,
  briefs,
  team,
  lowStockItems,
}: {
  projet: Projet;
  inventaire: InventoryItem[];
  briefs: BriefSummary[];
  team: TeamMember[];
  lowStockItems: LowStockItem[];
}) {
  const router = useRouter();
  const id = projet.id;
  const taches = projet.taches ?? [];
  const photos = projet.photos ?? [];
  const avancements = projet.avancements ?? [];
  const usages = projet.materielUtilise ?? [];

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Tache | null>(null);
  const [photoTab, setPhotoTab] = useState<CategoriePhoto>("Progression");
  const [photoPreview, setPhotoPreview] = useState<PhotoProjet | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [usageMaterielId, setUsageMaterielId] = useState("");
  const [usageQuantite, setUsageQuantite] = useState("");
  const [usageNote, setUsageNote] = useState("");
  const [progressPct, setProgressPct] = useState("");
  const [progressResume, setProgressResume] = useState("");
  const [progressBlocages, setProgressBlocages] = useState("");

  const [tacheTitre, setTacheTitre] = useState("");
  const [tacheDesc, setTacheDesc] = useState("");
  const [tachePriorite, setTachePriorite] = useState<Tache["priorite"]>("Normale");
  const [tacheStatut, setTacheStatut] = useState<Tache["statut"]>("À faire");

  const photosByCat = useMemo(() => {
    const avant = photos.filter((p) => p.categorie === "Avant" || (p.description?.toLowerCase().includes("avant")));
    const apres = photos.filter((p) => p.categorie === "Après" || (p.description?.toLowerCase().includes("après")));
    const progression = photos.filter((p) => p.categorie === "Progression" && !p.description?.toLowerCase().includes("avant") && !p.description?.toLowerCase().includes("après"));
    return {
      Avant: avant,
      Après: apres,
      Progression: progression.length > 0 ? progression : photos,
    };
  }, [photos]);

  const activity = useMemo((): ActivityItem[] => {
    const items: ActivityItem[] = [];
    photos.forEach((p) => items.push({ type: "photo", at: p.date, label: "Photo ajoutée", extra: p.description ?? undefined }));
    avancements.forEach((a) => items.push({ type: "avancement", at: a.date, label: a.resume.slice(0, 60) + (a.resume.length > 60 ? "…" : ""), extra: a.progressionPourcent != null ? `${a.progressionPourcent}%` : undefined }));
    briefs.forEach((b) => items.push({ type: "brief", at: b.updated_at ?? "", label: b.title, extra: b.status }));
    taches.forEach((t) => items.push({ type: "tache", at: t.creeLe, label: t.titre, extra: t.statut }));
    items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return items.slice(0, 25);
  }, [photos, avancements, briefs, taches]);

  const lastProgressPct = avancements[0]?.progressionPourcent ?? null;
  const alertsBlockers = avancements.filter((a) => a.blocages?.trim()).slice(0, 3);
  const alertsLate = taches.filter((t) => t.statut === "Bloqué" || t.statut === "À faire").slice(0, 2);

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
      const r = await updateProjectTaskAction(editingTask.id, { title: tacheTitre.trim(), description: tacheDesc.trim() || null, priority: tachePriorite, status: tacheStatut });
      if (r.success) router.refresh();
    } else {
      const r = await addProjectTaskAction(id, { title: tacheTitre.trim(), description: tacheDesc.trim() || null, priority: tachePriorite, status: tacheStatut });
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

  const addProgressSubmit = async () => {
    if (!progressResume.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    const pct = progressPct ? parseInt(progressPct, 10) : undefined;
    const r = await createDailyProgressAction({
      project_id: id,
      progress_date: today,
      progress_percent: pct != null && !isNaN(pct) ? pct : null,
      summary: progressResume.trim(),
      blockers: progressBlocages.trim() || null,
    });
    if (r.success) {
      setProgressModalOpen(false);
      setProgressPct("");
      setProgressResume("");
      setProgressBlocages("");
      router.refresh();
    }
  };

  return (
    <div className="p-6 max-w-[1280px] mx-auto">
      {/* HEADER */}
      <header className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/patron/projets" className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-subtle focus-ring shrink-0" aria-label="Retour">
            <ArrowLeft size={20} strokeWidth={1.7} />
          </Link>
          <div className="min-w-0">
            <h1 className="font-heading text-h2 text-neutral-text truncate">{projet.titre}</h1>
            <p className="text-caption text-neutral-text-secondary mt-0.5">{projet.adresse ?? "Sans adresse"}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-caption" style={{ fontSize: "12px" }}>
              <span className="font-medium text-neutral-text">{projet.statut}</span>
              {lastProgressPct != null && <span>{lastProgressPct} %</span>}
              <span className="text-neutral-text-secondary">{formatDate(projet.dateDebut)} → {formatDate(projet.dateFin)}</span>
              {projet.responsable && <span className="text-neutral-text-secondary">Responsable : {projet.responsable}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={openNewTask} className="h-8 px-3 rounded border border-neutral-border bg-neutral-white text-caption font-medium text-neutral-text hover:bg-neutral-bg-subtle focus-ring flex items-center gap-1.5">
            <ListTodo size={16} /> Tâche
          </button>
          <label className="h-8 px-3 rounded border border-neutral-border bg-neutral-white text-caption font-medium text-neutral-text hover:bg-neutral-bg-subtle focus-ring flex items-center gap-1.5 cursor-pointer">
            <ImageIcon size={16} /> Photo
            <input type="file" accept="image/*" onChange={onPhotoFileSelect} disabled={photoUploading} className="hidden" />
          </label>
          <button type="button" onClick={() => setProgressModalOpen(true)} className="h-8 px-3 rounded border border-neutral-border bg-neutral-white text-caption font-medium text-neutral-text hover:bg-neutral-bg-subtle focus-ring flex items-center gap-1.5">
            <TrendingUp size={16} /> Avancement
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* COLONNE GAUCHE 70% */}
        <div className="space-y-4 min-w-0">
          {/* 1) Activité récente */}
          <SectionCard title="Activité récente">
            <div className="py-1">
              {activity.length === 0 ? (
                <p className="text-caption text-neutral-text-secondary py-2">Aucune activité récente.</p>
              ) : (
                <ul className="space-y-1">
                  {activity.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 py-1.5 border-b border-neutral-border last:border-0 text-caption" style={{ fontSize: "12px" }}>
                      <span className="shrink-0 mt-0.5">
                        {a.type === "photo" && <ImageIcon size={14} className="text-neutral-text-secondary" />}
                        {a.type === "avancement" && <TrendingUp size={14} className="text-neutral-text-secondary" />}
                        {a.type === "brief" && <Send size={14} className="text-neutral-text-secondary" />}
                        {a.type === "tache" && <ListTodo size={14} className="text-neutral-text-secondary" />}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{a.label}</span>
                      {a.extra && <span className="text-neutral-text-secondary shrink-0">{a.extra}</span>}
                      <span className="text-neutral-text-secondary shrink-0">{formatDateTime(a.at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </SectionCard>

          {/* 2) Tâches chantier */}
          <SectionCard
            title="Tâches chantier"
            actions={
              <button type="button" onClick={openNewTask} className="text-caption font-medium text-primary-orange hover:underline focus-ring">
                Ajouter
              </button>
            }
          >
            {taches.length === 0 ? (
              <p className="text-caption text-neutral-text-secondary py-2">Aucune tâche.</p>
            ) : (
              <ul className="space-y-1">
                {taches.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-1.5 px-2 rounded border border-neutral-border hover:bg-neutral-bg-subtle">
                    <button type="button" onClick={() => openEditTask(t)} className="text-left flex-1 min-w-0 focus-ring rounded">
                      <span className="font-medium text-neutral-text text-caption block truncate">{t.titre}</span>
                      <span className="text-caption-xs text-neutral-text-secondary">{t.statut} · {t.priorite}</span>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => openEditTask(t)} className="p-1.5 rounded text-neutral-text-secondary hover:bg-neutral-bg-active focus-ring" aria-label="Modifier">
                        <Pencil size={14} strokeWidth={1.7} />
                      </button>
                      <button type="button" onClick={() => removeTask(t.id)} className="p-1.5 rounded text-neutral-text-secondary hover:bg-red-50 hover:text-red-600 focus-ring" aria-label="Supprimer">
                        <Trash2 size={14} strokeWidth={1.7} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* 3) Instructions / briefs */}
          <SectionCard title="Instructions / briefs">
            {briefs.length === 0 ? (
              <p className="text-caption text-neutral-text-secondary py-2">Aucun brief pour ce chantier.</p>
            ) : (
              <ul className="space-y-2">
                {briefs.map((b) => (
                  <li key={b.id} className="rounded border border-neutral-border p-2">
                    <p className="font-medium text-neutral-text text-caption">{b.title}</p>
                    <p className="text-caption-xs text-neutral-text-secondary mt-0.5 line-clamp-2">{b.instructions}</p>
                    <span className="text-caption-xs text-neutral-text-secondary">{b.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* 4) Avancement quotidien */}
          <SectionCard title="Avancement quotidien">
            {avancements.length === 0 ? (
              <p className="text-caption text-neutral-text-secondary py-2">Aucun avancement enregistré.</p>
            ) : (
              <ul className="space-y-2">
                {avancements.slice(0, 8).map((a) => (
                  <li key={a.id} className="py-1.5 px-2 rounded border border-neutral-border">
                    <div className="flex items-center justify-between text-caption">
                      <span className="font-medium">{a.progressionPourcent != null ? `${a.progressionPourcent} %` : "—"}</span>
                      <span className="text-neutral-text-secondary">{formatDate(a.date)}</span>
                    </div>
                    <p className="text-caption-xs text-neutral-text mt-0.5 line-clamp-2">{a.resume}</p>
                    {a.blocages && <p className="text-caption-xs text-amber-700 mt-0.5">Blocage : {a.blocages}</p>}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        {/* COLONNE DROITE 30% */}
        <div className="space-y-4">
          {/* 1) Photos chantier */}
          <SectionCard title="Photos chantier">
            <div className="flex border-b border-neutral-border mb-2">
              {(["Avant", "Après", "Progression"] as const).map((cat) => (
                <button key={cat} type="button" onClick={() => setPhotoTab(cat)} className={`px-3 py-2 text-caption border-b-2 -mb-px focus-ring ${photoTab === cat ? "border-primary-blue text-primary-blue" : "border-transparent text-neutral-text-secondary"}`} style={{ fontSize: "12px" }}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="mb-2">
              <label className="text-caption-xs text-neutral-text-secondary cursor-pointer">
                Ajouter une photo
                <input type="file" accept="image/*" onChange={onPhotoFileSelect} disabled={photoUploading} className="hidden" />
              </label>
              {photoUploading && <span className="text-caption-xs text-neutral-text-secondary ml-2">Envoi…</span>}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(photosByCat[photoTab] ?? []).length === 0 ? (
                <p className="col-span-3 text-caption-xs text-neutral-text-secondary py-2">Aucune photo.</p>
              ) : (
                (photosByCat[photoTab] ?? []).map((ph) => (
                  <button key={ph.id} type="button" onClick={() => setPhotoPreview(ph)} className="aspect-square rounded border border-neutral-border overflow-hidden bg-neutral-bg-subtle focus-ring">
                    {ph.url ? <img src={ph.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-neutral-text-secondary" /></div>}
                  </button>
                ))
              )}
            </div>
          </SectionCard>

          {/* 2) Équipe assignée */}
          <SectionCard title="Équipe assignée">
            {team.length === 0 ? (
              <p className="text-caption text-neutral-text-secondary py-2">Aucun employé assigné.</p>
            ) : (
              <ul className="space-y-1">
                {team.map((m) => (
                  <li key={m.id} className="flex items-center gap-2 py-1 text-caption">
                    <Users size={14} className="text-neutral-text-secondary shrink-0" />
                    <span>{m.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* 3) Matériel utilisé */}
          <SectionCard
            title="Matériel utilisé"
            actions={
              <button type="button" onClick={() => setUsageModalOpen(true)} className="text-caption font-medium text-primary-orange hover:underline focus-ring">
                Ajouter
              </button>
            }
          >
            {usages.length === 0 ? (
              <p className="text-caption text-neutral-text-secondary py-2">Aucun matériel.</p>
            ) : (
              <ul className="space-y-1">
                {usages.map((u) => {
                  const mat = inventaire.find((i) => i.id === u.materielId);
                  return (
                    <li key={u.id} className="flex justify-between text-caption py-0.5" style={{ fontSize: "12px" }}>
                      <span className="truncate">{mat?.name ?? u.materielId}</span>
                      <span className="text-neutral-text-secondary shrink-0">{u.quantite} {mat?.unit ?? ""}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          {/* 4) Alertes */}
          <SectionCard title="Alertes">
            {alertsBlockers.length === 0 && alertsLate.length === 0 && lowStockItems.length === 0 ? (
              <p className="text-caption text-neutral-text-secondary py-2">Aucune alerte.</p>
            ) : (
              <ul className="space-y-1.5 text-caption" style={{ fontSize: "12px" }}>
                {alertsBlockers.map((a) => (
                  <li key={a.id} className="flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>Blocage : {a.blocages?.slice(0, 50)}{(a.blocages?.length ?? 0) > 50 ? "…" : ""}</span>
                  </li>
                ))}
                {alertsLate.map((t) => (
                  <li key={t.id} className="flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>Tâche {t.statut} : {t.titre}</span>
                  </li>
                ))}
                {lowStockItems.slice(0, 2).map((i) => (
                  <li key={i.id} className="flex items-start gap-2">
                    <Package size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>Stock faible : {i.name}{i.min_stock != null ? ` (min. ${i.min_stock})` : ""}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Modals */}
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
            <button type="button" onClick={saveTask} className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring">Enregistrer</button>
          </div>
        </div>
      </Modal>

      <Modal open={progressModalOpen} onClose={() => setProgressModalOpen(false)} title="Ajouter un avancement" maxWidth="sm">
        <div className="p-4 space-y-4">
          <Field label="Progression % (optionnel)">
            <input type="number" min={0} max={100} className={inputClass} value={progressPct} onChange={(e) => setProgressPct(e.target.value)} placeholder="Ex. 75" />
          </Field>
          <Field label="Résumé" required>
            <textarea className={inputClass + " min-h-[80px] resize-y py-2"} value={progressResume} onChange={(e) => setProgressResume(e.target.value)} placeholder="Résumé du jour..." />
          </Field>
          <Field label="Blocages (optionnel)">
            <input type="text" className={inputClass} value={progressBlocages} onChange={(e) => setProgressBlocages(e.target.value)} placeholder="Blocages ou points d'attention" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setProgressModalOpen(false)} className="h-9 px-3.5 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded focus-ring">Annuler</button>
            <button type="button" onClick={addProgressSubmit} disabled={!progressResume.trim()} className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded focus-ring disabled:opacity-50">Enregistrer</button>
          </div>
        </div>
      </Modal>

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

      {photoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setPhotoPreview(null)}>
          <div className="max-w-2xl max-h-[90vh] overflow-auto bg-neutral-white rounded border border-neutral-border p-4" onClick={(e) => e.stopPropagation()}>
            {photoPreview.url && <img src={photoPreview.url} alt="" className="w-full h-auto max-h-[70vh] object-contain" />}
            {photoPreview.description && <p className="text-caption text-neutral-text mt-2">{photoPreview.description}</p>}
            <button type="button" onClick={() => setPhotoPreview(null)} className="mt-3 h-9 px-3 text-caption font-medium bg-neutral-bg-subtle border border-neutral-border rounded focus-ring">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}
