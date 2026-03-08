"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { EmptyInline } from "@/components/EmptyInline";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { Table } from "@/components/ui/Table";
import { useFilteredProjects, getProchaineEtape, getAvancementPourcent, type ProjectsFilters } from "@/lib/projects/store";
import type { Projet, StatutProjet, PrioriteProjet } from "@/types/projet";
import type { Employe } from "@/types/employe";
import type { AvancementJour } from "@/types/projet";
import {
  MapPin,
  Plus,
  Search,
  MoreVertical,
  ExternalLink,
  Pencil,
  Calendar,
  LayoutGrid,
  List,
  ClipboardList,
  Image,
  Activity,
} from "lucide-react";
import { createProjectAction, updateProjectAction } from "@/app/actions/data";

const STATUTS: StatutProjet[] = ["À planifier", "En cours", "En attente", "Terminé"];
const PRIORITES: PrioriteProjet[] = ["Basse", "Normale", "Haute"];

const inputClass =
  "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString("fr-CA", { dateStyle: "short", timeStyle: "short" });
}

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

type NewChantierPayload = {
  titre: string;
  adresse?: string;
  description?: string;
  statut: StatutProjet;
  dateDebut?: string;
  dateFin?: string;
  priorite: PrioriteProjet;
  responsable?: string;
};

function NewChantierModal({
  open,
  onClose,
  onCreate,
  employes,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (p: NewChantierPayload) => Promise<string | null>;
  employes: { id: string; nom: string }[];
}) {
  const [titre, setTitre] = useState("");
  const [adresse, setAdresse] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState<StatutProjet>("À planifier");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [responsable, setResponsable] = useState("");
  const [priorite, setPriorite] = useState<PrioriteProjet>("Normale");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!titre.trim()) {
      setError("Le nom du chantier est requis.");
      return;
    }
    setSaving(true);
    const id = await onCreate({
      titre: titre.trim(),
      adresse: adresse.trim() || undefined,
      description: description.trim() || undefined,
      statut,
      dateDebut: dateDebut || undefined,
      dateFin: dateFin || undefined,
      priorite,
      responsable: responsable || undefined,
    });
    setSaving(false);
    if (id != null) {
      setTitre("");
      setAdresse("");
      setDescription("");
      setStatut("À planifier");
      setDateDebut("");
      setDateFin("");
      setResponsable("");
      setPriorite("Normale");
      onClose();
    }
  };

  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Nouveau chantier" maxWidth="lg">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && <p className="text-caption text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
        <Field label="Nom du chantier" required>
          <input type="text" className={inputClass} value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex. Peinture résidence Dupont" />
        </Field>
        <Field label="Adresse">
          <input type="text" className={inputClass} value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Adresse du chantier" />
        </Field>
        <Field label="Description">
          <textarea className={inputClass + " min-h-[80px] resize-y py-2"} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description..." />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Statut">
            <select className={inputClass} value={statut} onChange={(e) => setStatut(e.target.value as StatutProjet)}>
              {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Priorité">
            <select className={inputClass} value={priorite} onChange={(e) => setPriorite(e.target.value as PrioriteProjet)}>
              {PRIORITES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date de début">
            <input type="date" className={inputClass} value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
          </Field>
          <Field label="Date de fin">
            <input type="date" className={inputClass} value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
          </Field>
        </div>
        <Field label="Responsable">
          {employes.length > 0 ? (
            <select className={inputClass} value={responsable} onChange={(e) => setResponsable(e.target.value)}>
              <option value="">—</option>
              {employes.map((e) => <option key={e.id} value={e.nom}>{e.nom}</option>)}
            </select>
          ) : (
            <input type="text" className={inputClass} value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder="Nom du responsable" />
          )}
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-9 px-3.5 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded hover:bg-neutral-bg-active focus-ring">Annuler</button>
          <button type="submit" disabled={saving} className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring disabled:opacity-50">Créer</button>
        </div>
      </form>
    </Modal>
  );
}

function DetailPanel({
  project,
  onOpenEdit,
  onAddAvancement,
  onAddTache,
  onAddPhoto,
  avancements,
}: {
  project: Projet | null;
  onOpenEdit: () => void;
  onAddAvancement: () => void;
  onAddTache: () => void;
  onAddPhoto: () => void;
  avancements: { date: string; resume: string }[];
}) {
  if (!project) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center border-l border-neutral-border bg-neutral-bg-subtle/30">
        <MapPin size={32} className="text-neutral-text-secondary mb-3" strokeWidth={1.7} />
        <p className="text-caption font-medium text-neutral-text">Sélectionnez un chantier</p>
        <p className="text-caption-xs text-neutral-text-secondary mt-1">Cliquez sur un chantier dans la liste pour afficher son détail.</p>
      </div>
    );
  }

  const taches = project.taches ?? [];
  const photos = project.photos ?? [];
  const avancementPct = getAvancementPourcent(project);

  return (
    <div className="h-full flex flex-col border-l border-neutral-border bg-neutral-white overflow-hidden">
      <div className="shrink-0 px-4 py-3 border-b border-neutral-border">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-heading font-medium text-neutral-text truncate">{project.titre}</h3>
            <span className="inline-flex px-2 py-0.5 rounded text-caption-xs font-medium bg-neutral-bg-subtle text-neutral-text mt-1">{project.statut}</span>
            {project.adresse && <p className="text-caption-xs text-neutral-text-secondary mt-1 truncate">{project.adresse}</p>}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Link href={`/patron/projets/${project.id}`} className="h-8 px-2.5 text-caption font-medium text-primary-orange border border-primary-orange rounded hover:bg-primary-orange/10 focus-ring flex items-center gap-1">
              <ExternalLink size={14} strokeWidth={1.7} /> Ouvrir
            </Link>
            <button type="button" onClick={onOpenEdit} className="h-8 px-2.5 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded hover:bg-neutral-bg-active focus-ring flex items-center gap-1">
              <Pencil size={14} strokeWidth={1.7} /> Modifier
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <section>
          <h4 className="text-section-title text-neutral-text mb-2">Résumé</h4>
          <ul className="text-caption text-neutral-text-secondary space-y-1">
            <li>Dates : {project.dateDebut || project.dateFin ? `${formatDate(project.dateDebut)} → ${formatDate(project.dateFin)}` : "Non planifié"}</li>
            <li>Responsable : {project.responsable ?? "—"}</li>
            <li>Priorité : {project.priorite ?? "Normale"}</li>
          </ul>
        </section>
        <section>
          <h4 className="text-section-title text-neutral-text mb-2">Avancement</h4>
          <p className="text-caption-xs text-neutral-text-secondary">Dernière mise à jour : {project.derniereMaj ? formatDateTime(project.derniereMaj) : "Aucune mise à jour"}</p>
          <button type="button" onClick={onAddAvancement} className="mt-2 h-8 px-2.5 text-caption font-medium text-primary-orange border border-primary-orange rounded hover:bg-primary-orange/10 focus-ring">
            Ajouter une mise à jour
          </button>
        </section>
        <section>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-section-title text-neutral-text">Tâches</h4>
            <button type="button" onClick={onAddTache} className="text-caption font-medium text-primary-orange hover:underline focus-ring">Créer une tâche</button>
          </div>
          {taches.length === 0 ? (
            <EmptyInline icon={ClipboardList} message="Aucune tâche." />
          ) : (
            <ul className="space-y-1.5">
              {taches.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center gap-2 py-1.5 px-2 border border-neutral-border rounded text-caption">
                  <span className="inline-flex px-1.5 py-0.5 rounded text-caption-xs bg-neutral-bg-subtle">{t.statut}</span>
                  <span className="truncate text-neutral-text">{t.titre}</span>
                </li>
              ))}
              {taches.length > 5 && <p className="text-caption-xs text-neutral-text-secondary">+{taches.length - 5} autres</p>}
            </ul>
          )}
        </section>
        <section>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-section-title text-neutral-text">Photos</h4>
            <button type="button" onClick={onAddPhoto} className="text-caption font-medium text-primary-orange hover:underline focus-ring">Ajouter une photo</button>
          </div>
          {photos.length === 0 ? (
            <EmptyInline icon={Image} message="Aucune photo." />
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {photos.slice(0, 6).map((ph) => (
                <div key={ph.id} className="aspect-square rounded border border-neutral-border bg-neutral-bg-subtle overflow-hidden">
                  {ph.url ? <img src={ph.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image size={20} className="text-neutral-text-secondary" /></div>}
                </div>
              ))}
            </div>
          )}
        </section>
        <section>
          <h4 className="text-section-title text-neutral-text mb-2">Activité</h4>
          {avancements.length === 0 ? (
            <EmptyInline icon={Activity} message="Aucune activité." />
          ) : (
            <ul className="space-y-2">
              {avancements.slice(0, 5).map((a, i) => (
                <li key={i} className="py-1.5 px-2 border-l-2 border-primary-orange/30 pl-3 text-caption">
                  <p className="text-neutral-text">{a.resume}</p>
                  <p className="text-caption-xs text-neutral-text-secondary">{formatDate(a.date)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export type ChantiersContentProps = {
  initialProjects: Projet[];
  initialEmployees: Employe[];
  initialProgress: AvancementJour[];
};

export function ChantiersContent({ initialProjects, initialEmployees, initialProgress }: ChantiersContentProps) {
  const router = useRouter();
  const projets = initialProjects;
  const [selectedId, setSelectedProjectId] = useState<string | null>(null);

  const search = useState("");
  const filtreStatut = useState<StatutProjet | "">("");
  const filtrePriorite = useState<PrioriteProjet | "">("");
  const view = useState<"table" | "kanban" | "calendrier">("table");
  const modalNewOpen = useState(false);
  const calendarMonth = useState(() => new Date());

  const [searchVal, setSearch] = search;
  const [filtreStatutVal, setFiltreStatut] = filtreStatut;
  const [filtrePrioriteVal, setFiltrePriorite] = filtrePriorite;
  const [viewVal, setView] = view;
  const [modalNewOpenVal, setModalNewOpen] = modalNewOpen;
  const [calendarMonthVal, setCalendarMonth] = calendarMonth;

  const filters: ProjectsFilters = { search: searchVal, statut: filtreStatutVal || undefined, priorite: filtrePrioriteVal || undefined };
  const filtered = useFilteredProjects(projets, filters);

  const selectedProject = selectedId ? projets.find((p) => p.id === selectedId) ?? null : null;
  const avancementsForSelected = selectedId ? initialProgress.filter((a) => a.projetId === selectedId).sort((a, b) => b.date.localeCompare(a.date)) : [];

  const handleCreate = async (p: NewChantierPayload): Promise<string | null> => {
    const result = await createProjectAction({
      title: p.titre,
      address: p.adresse ?? null,
      description: p.description ?? null,
      status: p.statut,
      priority: p.priorite,
      start_date: p.dateDebut ?? null,
      end_date: p.dateFin ?? null,
      responsable: p.responsable ?? null,
    });
    if (!result.success) {
      return null;
    }
    router.refresh();
    if (result.id) setSelectedProjectId(result.id);
    return result.id ?? null;
  };

  const calendarEvents = useMemo(() => {
    const y = calendarMonthVal.getFullYear();
    const m = calendarMonthVal.getMonth();
    return projets.filter((p) => {
      if (!p.dateDebut) return false;
      const d = new Date(p.dateDebut);
      return d.getFullYear() === y && d.getMonth() === m;
    });
  }, [projets, calendarMonthVal]);

  const firstDay = new Date(calendarMonthVal.getFullYear(), calendarMonthVal.getMonth(), 1);
  const lastDay = new Date(calendarMonthVal.getFullYear(), calendarMonthVal.getMonth() + 1, 0);
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = lastDay.getDate();

  return (
    <div className="px-6 py-6 max-w-[1180px] mx-auto">
      <PageHeader title="Chantiers" subtitle="Pilotage des projets, tâches, photos et avancement." />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary pointer-events-none" />
          <input type="search" className={inputClass + " pl-9"} value={searchVal} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un chantier..." />
        </div>
        <select className={inputClass + " w-auto min-w-[120px]"} value={filtreStatutVal} onChange={(e) => setFiltreStatut(e.target.value as StatutProjet | "")}>
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={inputClass + " w-auto min-w-[100px]"} value={filtrePrioriteVal} onChange={(e) => setFiltrePriorite(e.target.value as PrioriteProjet | "")}>
          <option value="">Priorité</option>
          {PRIORITES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button type="button" onClick={() => setModalNewOpen(true)} className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring flex items-center gap-1.5">
          <Plus size={18} strokeWidth={1.7} /> Nouveau chantier
        </button>
      </div>

      <div className="flex border-b border-neutral-border mb-3">
        {(["table", "kanban", "calendrier"] as const).map((v) => (
          <button key={v} type="button" onClick={() => setView(v)} className={`px-4 py-2.5 text-caption font-medium border-b-2 -mb-px focus-ring ${viewVal === v ? "border-primary-blue text-primary-blue" : "border-transparent text-neutral-text-secondary hover:text-neutral-text"}`}>
            {v === "table" && <List size={16} className="inline-block mr-1.5 align-middle" strokeWidth={1.7} />}
            {v === "kanban" && <LayoutGrid size={16} className="inline-block mr-1.5 align-middle" strokeWidth={1.7} />}
            {v === "calendrier" && <Calendar size={16} className="inline-block mr-1.5 align-middle" strokeWidth={1.7} />}
            {v === "table" ? "Table" : v === "kanban" ? "Kanban" : "Calendrier"}
          </button>
        ))}
      </div>

      <div className="flex gap-0 min-h-[480px]" style={{ maxHeight: "calc(100vh - 280px)" }}>
        <div className="w-[65%] flex flex-col min-w-0 border border-neutral-border rounded-l overflow-hidden bg-neutral-white">
          {filtered.length === 0 ? (
            <div className="flex-1 flex items-center gap-4 p-6">
              <MapPin size={24} className="text-neutral-text-secondary shrink-0" strokeWidth={1.7} />
              <div>
                <p className="font-medium text-neutral-text">Aucun chantier</p>
                <p className="text-caption text-neutral-text-secondary">Créez un chantier pour commencer.</p>
                <button type="button" onClick={() => setModalNewOpen(true)} className="mt-2 h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring">
                  Créer un chantier
                </button>
              </div>
            </div>
          ) : viewVal === "table" ? (
            <div className="overflow-auto flex-1">
              <Table
                columns={[
                  { key: "chantier", label: "Chantier" },
                  { key: "statut", label: "Statut" },
                  { key: "avancement", label: "Avancement" },
                  { key: "etape", label: "Prochaine étape" },
                  { key: "maj", label: "Mise à jour" },
                  { key: "actions", label: "", className: "w-[40px]" },
                ]}
              >
                {filtered.map((p) => {
                  const avancement = getAvancementPourcent(p);
                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-neutral-border hover:bg-neutral-bg-subtle cursor-pointer ${selectedId === p.id ? "bg-primary-blue/5" : ""}`}
                      onClick={() => setSelectedProjectId(p.id)}
                    >
                      <td className="py-2.5 px-4">
                        <p className="font-medium text-neutral-text">{p.titre}</p>
                        {p.adresse && <p className="text-caption-xs text-neutral-text-secondary truncate max-w-[200px]">{p.adresse}</p>}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-caption-xs font-medium bg-neutral-bg-subtle text-neutral-text">{p.statut}</span>
                      </td>
                      <td className="py-2.5 px-4 text-caption">{avancement != null ? `${avancement} %` : "—"}</td>
                      <td className="py-2.5 px-4 text-caption text-neutral-text-secondary truncate max-w-[140px]">{getProchaineEtape(p)}</td>
                      <td className="py-2.5 px-4 text-caption text-neutral-text-secondary">{formatDate(p.derniereMaj)}</td>
                      <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="p-2 rounded hover:bg-neutral-bg-active focus-ring" aria-label="Actions"><MoreVertical size={16} strokeWidth={1.7} /></button>
                      </td>
                    </tr>
                  );
                })}
              </Table>
            </div>
          ) : viewVal === "kanban" ? (
            <div className="overflow-auto flex-1 p-3">
              <div className="flex gap-3 min-w-max">
                {STATUTS.map((statut) => {
                  const colProjects = filtered.filter((p) => p.statut === statut);
                  return (
                    <div key={statut} className="w-[220px] shrink-0 flex flex-col rounded border border-neutral-border bg-neutral-bg-subtle/50">
                      <div className="px-3 py-2 border-b border-neutral-border">
                        <h4 className="text-section-title text-neutral-text">{statut}</h4>
                        <span className="text-caption-xs text-neutral-text-secondary">{colProjects.length}</span>
                      </div>
                      <div className="p-2 flex-1 space-y-2 min-h-[200px]">
                        {colProjects.length === 0 ? (
                          <p className="text-caption-xs text-neutral-text-secondary py-4 text-center">Aucun</p>
                        ) : (
                          colProjects.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setSelectedProjectId(p.id)}
                              className={`w-full text-left p-2.5 rounded border border-neutral-border bg-neutral-white hover:bg-neutral-bg-subtle focus-ring ${selectedId === p.id ? "ring-2 ring-primary-blue/20" : ""}`}
                            >
                              <p className="font-medium text-neutral-text text-caption truncate">{p.titre}</p>
                              {p.adresse && <p className="text-caption-xs text-neutral-text-secondary truncate mt-0.5">{p.adresse}</p>}
                              <p className="text-caption-xs text-neutral-text-secondary mt-1">{getProchaineEtape(p)}</p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="overflow-auto flex-1 p-4">
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1))} className="p-2 rounded hover:bg-neutral-bg-subtle focus-ring">←</button>
                <span className="text-caption font-medium">{MONTHS[calendarMonthVal.getMonth()]} {calendarMonthVal.getFullYear()}</span>
                <button type="button" onClick={() => setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1))} className="p-2 rounded hover:bg-neutral-bg-subtle focus-ring">→</button>
              </div>
              <div className="grid grid-cols-7 border border-neutral-border rounded text-caption">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
                  <div key={d} className="py-2 text-center font-medium text-neutral-text-secondary border-b border-r border-neutral-border last:border-r-0 bg-neutral-bg-subtle">
                    {d}
                  </div>
                ))}
                {Array.from({ length: startPad }, (_, i) => (
                  <div key={`pad-${i}`} className="min-h-[60px] border-r border-b border-neutral-border last:border-r-0 bg-neutral-bg-subtle/50" />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dayDate = new Date(calendarMonthVal.getFullYear(), calendarMonthVal.getMonth(), day);
                  const dayStr = dayDate.toISOString().slice(0, 10);
                  const dayEvents = calendarEvents.filter((p) => p.dateDebut?.slice(0, 10) === dayStr);
                  return (
                    <div key={day} className="min-h-[60px] p-1 border-r border-b border-neutral-border last:border-r-0">
                      <span className="text-caption-xs text-neutral-text-secondary">{day}</span>
                      {dayEvents.length === 0 ? (
                        <p className="text-caption-xs text-neutral-text-secondary mt-1">—</p>
                      ) : (
                        <ul className="mt-1 space-y-0.5">
                          {dayEvents.slice(0, 2).map((p) => (
                            <li key={p.id}>
                              <button type="button" onClick={() => setSelectedProjectId(p.id)} className="text-left text-caption-xs text-primary-blue hover:underline truncate block w-full">
                                {p.titre}
                              </button>
                            </li>
                          ))}
                          {dayEvents.length > 2 && <span className="text-caption-xs text-neutral-text-secondary">+{dayEvents.length - 2}</span>}
                        </ul>
                      )}
                    </div>
                  );
                })}
                {Array.from({ length: (7 - ((startPad + daysInMonth) % 7)) % 7 }, (_, i) => (
                  <div key={`end-${i}`} className="min-h-[60px] border-r border-b border-neutral-border last:border-r-0 bg-neutral-bg-subtle/30" />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="w-[35%] min-w-0 flex flex-col bg-neutral-white" style={{ minHeight: "400px" }}>
          <DetailPanel
            project={selectedProject}
            onOpenEdit={() => selectedProject && (window.location.href = `/patron/projets/${selectedProject.id}`)}
            onAddAvancement={() => selectedProject && (window.location.href = `/employes/avancement`)}
            onAddTache={() => selectedProject && (window.location.href = `/patron/projets/${selectedProject.id}`)}
            onAddPhoto={() => selectedProject && (window.location.href = `/patron/projets/${selectedProject.id}`)}
            avancements={avancementsForSelected.map((a) => ({ date: a.date, resume: a.resume }))}
          />
        </div>
      </div>

      <NewChantierModal
        open={modalNewOpenVal}
        onClose={() => setModalNewOpen(false)}
        onCreate={handleCreate}
        employes={initialEmployees.map((e) => ({ id: e.id, nom: e.nom }))}
      />
    </div>
  );
}
