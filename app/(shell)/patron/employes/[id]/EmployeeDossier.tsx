"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs } from "@/components/ui/Tabs";
import { SectionCard } from "@/components/SectionCard";
import { getEmployeePhotoUrl, getEmployeeDocumentUrl } from "@/lib/storage/employee";
import type {
  DbEmployee,
  DbEmployeeDocument,
  DbEmployeeTraining,
  DbEmployeeNote,
  DbEmployeeCertification,
  DbEmployeeCompensation,
  DbEmployeeAvailability,
} from "@/lib/db/employees";
import type { DbTimesheet } from "@/lib/db/timesheets";
import { Pencil, StickyNote, FilePlus, GraduationCap, DollarSign } from "lucide-react";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" });
}

function initials(e: DbEmployee): string {
  if (e.first_name && e.last_name) return `${e.first_name[0]}${e.last_name[0]}`.toUpperCase();
  const parts = e.full_name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
}

const WEEKDAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

type Props = {
  employee: DbEmployee;
  documents: DbEmployeeDocument[];
  trainings: DbEmployeeTraining[];
  notes: DbEmployeeNote[];
  certifications: DbEmployeeCertification[];
  compensationHistory: DbEmployeeCompensation[];
  assignments: { id: string; project_id: string; assigned_at: string; projects: { id: string; title: string; status: string } | null }[];
  briefs: { id: string; title: string; status: string; projects: { id: string; title: string } | null }[];
  availability: DbEmployeeAvailability[];
  timesheets: DbTimesheet[];
};

export function EmployeeDossier(props: Props) {
  const { employee, documents, trainings, notes, certifications, compensationHistory, assignments, briefs, availability, timesheets } = props;
  const [activeTab, setActiveTab] = useState("apercu");
  const photoUrl = getEmployeePhotoUrl(employee.photo_url);

  const tabs = [
    { id: "apercu", label: "Aperçu", content: <TabApercu employee={employee} assignments={assignments} briefs={briefs} availability={availability} /> },
    { id: "rh", label: "RH", content: <TabRH employee={employee} compensationHistory={compensationHistory} /> },
    { id: "formations", label: "Formations", content: <TabFormations trainings={trainings} /> },
    { id: "documents", label: "Documents", content: <TabDocuments documents={documents} /> },
    { id: "affectations", label: "Affectations & activité", content: <TabAffectations assignments={assignments} briefs={briefs} /> },
    { id: "pointage", label: "Pointage", content: <TabPointage timesheets={timesheets} /> },
    { id: "notes", label: "Notes", content: <TabNotes notes={notes} employeeId={employee.id} /> },
  ];

  return (
    <div className="min-w-0">
      <header className="border-b border-neutral-border pb-4 mb-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-bg-subtle flex items-center justify-center text-2xl font-medium text-neutral-text-secondary shrink-0">
            {photoUrl ? <img src={photoUrl} alt="" className="object-cover w-full h-full" /> : initials(employee)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-h1 text-neutral-text mb-0.5">{employee.full_name}</h1>
            <p className="text-body text-neutral-text-secondary">{employee.role_title ?? employee.role ?? "—"}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex px-2 py-0.5 rounded text-caption-xs font-medium bg-neutral-bg-subtle text-neutral-text" style={{ borderRadius: "4px" }}>
                {employee.employment_status ?? (employee.active ? "Actif" : "Inactif")}
              </span>
              {employee.employment_type && (
                <span className="inline-flex px-2 py-0.5 rounded text-caption-xs font-medium bg-neutral-bg-subtle text-neutral-text" style={{ borderRadius: "4px" }}>
                  {employee.employment_type}
                </span>
              )}
              {employee.hire_date && (
                <span className="text-caption text-neutral-text-secondary">Embauché le {formatDate(employee.hire_date)}</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="inline-flex items-center gap-1.5 h-9 px-3 text-caption font-medium border border-neutral-border rounded bg-neutral-white text-neutral-text hover:bg-neutral-bg-subtle focus-ring" style={{ borderRadius: "6px" }}>
              <Pencil size={16} /> Modifier
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 h-9 px-3 text-caption font-medium border border-neutral-border rounded bg-neutral-white text-neutral-text hover:bg-neutral-bg-subtle focus-ring" style={{ borderRadius: "6px" }}>
              <StickyNote size={16} /> Ajouter note
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 h-9 px-3 text-caption font-medium border border-neutral-border rounded bg-neutral-white text-neutral-text hover:bg-neutral-bg-subtle focus-ring" style={{ borderRadius: "6px" }}>
              <FilePlus size={16} /> Document
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 h-9 px-3 text-caption font-medium border border-neutral-border rounded bg-neutral-white text-neutral-text hover:bg-neutral-bg-subtle focus-ring" style={{ borderRadius: "6px" }}>
              <GraduationCap size={16} /> Formation
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 h-9 px-3 text-caption font-medium border border-neutral-border rounded bg-neutral-white text-neutral-text hover:bg-neutral-bg-subtle focus-ring" style={{ borderRadius: "6px" }}>
              <DollarSign size={16} /> Ajustement salarial
            </button>
          </div>
        </div>
      </header>
      <Tabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} />
    </div>
  );
}

function TabApercu({
  employee,
  assignments,
  briefs,
  availability,
}: {
  employee: DbEmployee;
  assignments: Props["assignments"];
  briefs: Props["briefs"];
  availability: DbEmployeeAvailability[];
}) {
  const address = [employee.address_line1, employee.address_line2, [employee.city, employee.region].filter(Boolean).join(", "), employee.postal_code, employee.country].filter(Boolean).join(", ");
  return (
    <div className="space-y-4">
      <SectionCard title="Coordonnées">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-caption">
          {employee.email && (<><dt className="text-neutral-text-secondary">Courriel</dt><dd><a href={`mailto:${employee.email}`} className="text-primary-blue hover:underline">{employee.email}</a></dd></>)}
          {employee.phone && (<><dt className="text-neutral-text-secondary">Téléphone</dt><dd>{employee.phone}</dd></>)}
          {employee.emergency_contact_name && (<><dt className="text-neutral-text-secondary">Contact urgence</dt><dd>{employee.emergency_contact_name} {employee.emergency_contact_phone && `— ${employee.emergency_contact_phone}`}</dd></>)}
          {address && (<><dt className="text-neutral-text-secondary">Adresse</dt><dd>{address}</dd></>)}
        </dl>
      </SectionCard>
      <SectionCard title="Disponibilité">
        {availability.length === 0 ? (
          <p className="text-caption text-neutral-text-secondary">{employee.availability_notes || "Aucune plage définie."}</p>
        ) : (
          <ul className="space-y-1 text-caption">
            {availability.map((a) => (
              <li key={a.id}>
                {WEEKDAYS[a.weekday]} : {a.is_available ? (a.start_time && a.end_time ? `${a.start_time} – ${a.end_time}` : "Disponible") : "Indisponible"}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
      <SectionCard title="Projets assignés">
        {assignments.length === 0 ? <p className="text-caption text-neutral-text-secondary">Aucun projet.</p> : (
          <ul className="space-y-1">
            {assignments.map((a) => (
              <li key={a.id}>
                <Link href={`/patron/projets/${a.project_id}`} className="text-caption text-primary-blue hover:underline">{a.projects?.title ?? a.project_id}</Link>
                <span className="text-caption-xs text-neutral-text-secondary ml-2">{a.projects?.status}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
      <SectionCard title="Briefs actifs">
        {briefs.length === 0 ? <p className="text-caption text-neutral-text-secondary">Aucun brief.</p> : (
          <ul className="space-y-1">
            {briefs.slice(0, 5).map((b) => (
              <li key={b.id} className="text-caption text-neutral-text">{b.title} — {b.status}</li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function TabRH({ employee, compensationHistory }: { employee: DbEmployee; compensationHistory: DbEmployeeCompensation[] }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Emploi">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-caption">
          <dt className="text-neutral-text-secondary">Type</dt><dd>{employee.employment_type ?? "—"}</dd>
          <dt className="text-neutral-text-secondary">Statut</dt><dd>{employee.employment_status ?? "—"}</dd>
          <dt className="text-neutral-text-secondary">Date d'embauche</dt><dd>{formatDate(employee.hire_date)}</dd>
          <dt className="text-neutral-text-secondary">Date de fin</dt><dd>{formatDate(employee.termination_date)}</dd>
        </dl>
      </SectionCard>
      <SectionCard title="Rémunération">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-caption">
          <dt className="text-neutral-text-secondary">Taux horaire</dt><dd>{employee.hourly_rate != null ? `${Number(employee.hourly_rate).toFixed(2)} $` : "—"}</dd>
          <dt className="text-neutral-text-secondary">Salaire fixe</dt><dd>{employee.salary_amount != null ? `${Number(employee.salary_amount).toFixed(0)} $` : "—"}</dd>
          <dt className="text-neutral-text-secondary">Fréquence paie</dt><dd>{employee.pay_frequency ?? "—"}</dd>
        </dl>
      </SectionCard>
      <SectionCard title="Historique compensation">
        {compensationHistory.length === 0 ? <p className="text-caption text-neutral-text-secondary">Aucun historique.</p> : (
          <ul className="space-y-2 text-caption">
            {compensationHistory.map((c) => (
              <li key={c.id} className="flex justify-between"><span>{c.compensation_type} — {formatDate(c.effective_date)}</span><span className="tabular-nums">{Number(c.amount).toFixed(2)} $</span></li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function TabFormations({ trainings }: { trainings: DbEmployeeTraining[] }) {
  return (
    <SectionCard title="Formations">
      {trainings.length === 0 ? <p className="text-caption text-neutral-text-secondary">Aucune formation.</p> : (
        <ul className="space-y-3">
          {trainings.map((t) => (
            <li key={t.id} className="border-b border-neutral-border pb-2 last:border-0">
              <div className="flex justify-between items-start">
                <span className="font-medium text-neutral-text">{t.training_name}</span>
                <span className={`text-caption-xs px-2 py-0.5 rounded ${t.status === "Expirée" ? "bg-red-100 text-red-800" : t.status === "Complétée" ? "bg-green-100 text-green-800" : "bg-neutral-bg-subtle text-neutral-text"}`}>{t.status}</span>
              </div>
              <p className="text-caption text-neutral-text-secondary mt-0.5">{t.provider ?? "—"} · Complétée le {formatDate(t.completed_at)} · Expire le {formatDate(t.expires_at)}</p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function TabDocuments({ documents }: { documents: DbEmployeeDocument[] }) {
  return (
    <SectionCard title="Documents">
      {documents.length === 0 ? <p className="text-caption text-neutral-text-secondary">Aucun document.</p> : (
        <ul className="space-y-2">
          {documents.map((d) => (
            <li key={d.id} className="flex justify-between items-center text-caption">
              <span>{d.title} <span className="text-neutral-text-secondary">({d.document_type})</span></span>
              <a href={getEmployeeDocumentUrl(d.file_path)} target="_blank" rel="noopener noreferrer" className="text-primary-blue hover:underline">Télécharger</a>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function TabAffectations({ assignments, briefs }: { assignments: Props["assignments"]; briefs: Props["briefs"] }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Projets assignés">
        {assignments.length === 0 ? <p className="text-caption text-neutral-text-secondary">Aucun projet.</p> : (
          <ul className="space-y-1">
            {assignments.map((a) => (
              <li key={a.id}><Link href={`/patron/projets/${a.project_id}`} className="text-primary-blue hover:underline">{a.projects?.title ?? a.project_id}</Link> — {a.projects?.status}</li>
            ))}
          </ul>
        )}
      </SectionCard>
      <SectionCard title="Briefs">
        {briefs.length === 0 ? <p className="text-caption text-neutral-text-secondary">Aucun brief.</p> : (
          <ul className="space-y-1 text-caption">{briefs.map((b) => <li key={b.id}>{b.title} — {b.status}</li>)}</ul>
        )}
      </SectionCard>
    </div>
  );
}

function TabPointage({ timesheets }: { timesheets: DbTimesheet[] }) {
  const total = timesheets.reduce((s, t) => s + t.hours, 0);
  return (
    <SectionCard title="Pointage">
      <p className="text-caption text-neutral-text-secondary mb-3">Total : <strong className="text-neutral-text">{total.toFixed(1)} h</strong></p>
      {timesheets.length === 0 ? <p className="text-caption text-neutral-text-secondary">Aucune entrée.</p> : (
        <ul className="space-y-1 text-caption">
          {timesheets.slice(0, 20).map((t) => (
            <li key={t.id} className="flex justify-between"><span>{formatDate(t.work_date)}</span><span className="tabular-nums">{t.hours} h</span></li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function TabNotes({ notes, employeeId }: { notes: DbEmployeeNote[]; employeeId: string }) {
  return (
    <SectionCard title="Notes">
      {notes.length === 0 ? <p className="text-caption text-neutral-text-secondary">Aucune note.</p> : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="border-l-2 border-neutral-border pl-3 py-1 text-caption">
              <span className="text-neutral-text-secondary text-caption-xs">{n.note_type} · {formatDate(n.created_at)}</span>
              <p className="text-neutral-text mt-0.5">{n.note}</p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
