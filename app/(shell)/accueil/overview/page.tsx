import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import {
  listProjects,
  listProjectAssignments,
} from "@/lib/db/projects";
import { listEmployees } from "@/lib/db/employees";
import { listEventsInRange } from "@/lib/db/calendar";
import { getLowStockItems } from "@/lib/db/inventory";
import {
  listLatestDailyProgress,
  listDailyProgressByProject,
} from "@/lib/db/progress";
import { listRecentProjectPhotos } from "@/lib/db/media";
import { listBriefs } from "@/lib/db/briefs";
import { listTimesheets } from "@/lib/db/timesheets";
import { getMediaPublicUrl } from "@/lib/storage/upload";
import {
  Package,
  AlertTriangle,
  FileText,
  ImageIcon,
  TrendingUp,
  Send,
  Calendar,
} from "lucide-react";

const today = new Date();
const todayStr = today.toISOString().slice(0, 10);

function getWeekRange() {
  const d = new Date(today);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d);
  mon.setDate(diff);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return {
    start: mon.toISOString().slice(0, 10) + "T00:00:00.000Z",
    end: sun.toISOString().slice(0, 10) + "T23:59:59.999Z",
  };
}

export default async function AccueilOverviewPage() {
  const week = getWeekRange();
  const [
    projects,
    employees,
    eventsWeek,
    progressLatest,
    lowStock,
    recentPhotos,
    briefs,
    timesheetsToday,
  ] = await Promise.all([
    listProjects(),
    listEmployees(true),
    listEventsInRange(week.start, week.end),
    listLatestDailyProgress(15),
    getLowStockItems().catch(() => []),
    listRecentProjectPhotos(9),
    listBriefs(),
    listTimesheets({ from: todayStr, to: todayStr, limit: 20 }),
  ]);

  const activeProjects = projects.filter((p) => p.status === "En cours");
  const projectIds = activeProjects.map((p) => p.id);

  const [assignmentsByProject, progressByProject] = await Promise.all([
    Promise.all(activeProjects.map((p) => listProjectAssignments(p.id))),
    Promise.all(
      projectIds.map((id) =>
        listDailyProgressByProject(id, 1).then((r) => ({ id, pct: r[0]?.progress_percent ?? null }))
      )
    ),
  ]);

  const progressPercentMap = Object.fromEntries(
    progressByProject.map(({ id, pct }) => [id, pct])
  );

  const rows = activeProjects.slice(0, 10).map((p, i) => {
    const assignments = assignmentsByProject[i] ?? [];
    const names = assignments
      .map((a) => employees.find((e) => e.id === a.employee_id)?.full_name)
      .filter(Boolean) as string[];
    return {
      id: p.id,
      titre: p.title,
      adresse: p.address ?? "—",
      equipe: names.length ? names.join(", ") : "—",
      avancement: progressPercentMap[p.id] != null ? `${progressPercentMap[p.id]}%` : "—",
      statut: p.status,
    };
  });

  const briefsNonConfirme = briefs.filter((b) => b.status === "Brouillon");
  const progressWithBlockers = progressLatest.filter((p) => p.blockers?.trim());

  const activityItems: { type: string; label: string; at: string; id?: string; projectId?: string }[] = [];
  for (const m of recentPhotos.slice(0, 5)) {
    activityItems.push({
      type: "photo",
      label: "Photo ajoutée",
      at: m.created_at,
      id: m.id,
      projectId: m.entity_id,
    });
  }
  for (const p of progressLatest.slice(0, 5)) {
    activityItems.push({
      type: "avancement",
      label: p.summary || "Avancement soumis",
      at: p.created_at,
      id: p.id,
      projectId: p.project_id,
    });
  }
  for (const b of briefs.filter((x) => x.status === "Envoyé").slice(0, 3)) {
    activityItems.push({
      type: "brief",
      label: `Brief envoyé: ${b.title}`,
      at: b.updated_at,
      id: b.id,
    });
  }
  activityItems.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const activitySlice = activityItems.slice(0, 10);

  const projectTitles = Object.fromEntries(projects.map((p) => [p.id, p.title]));
  const employeeNames = Object.fromEntries(employees.map((e) => [e.id, e.full_name]));

  return (
    <>
      <PageHeader
        title="Centre de pilotage"
        subtitle="Chantiers actifs, équipes terrain, alertes et activité."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
        {/* 1) Chantiers actifs aujourd'hui */}
        <SectionCard
          title="Chantiers actifs"
          actions={
            <Link
              href="/accueil/chantiers"
              className="text-caption-xs text-primary-blue hover:underline"
            >
              Voir tout
            </Link>
          }
        >
          <div className="overflow-x-auto -mx-1">
            <table className="w-full border-collapse text-caption" style={{ fontSize: "12px" }}>
              <thead>
                <tr className="border-b border-neutral-border">
                  <th className="text-left py-1.5 px-2 font-medium text-neutral-text-secondary">
                    Projet
                  </th>
                  <th className="text-left py-1.5 px-2 font-medium text-neutral-text-secondary">
                    Adresse
                  </th>
                  <th className="text-left py-1.5 px-2 font-medium text-neutral-text-secondary">
                    Équipe
                  </th>
                  <th className="text-left py-1.5 px-2 font-medium text-neutral-text-secondary">
                    Avancement
                  </th>
                  <th className="text-left py-1.5 px-2 font-medium text-neutral-text-secondary">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-3 px-2 text-neutral-text-secondary text-caption">
                      Aucun chantier actif.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-neutral-border last:border-0 hover:bg-neutral-bg-subtle"
                    >
                      <td className="py-1.5 px-2">
                        <Link
                          href={`/patron/projets/${r.id}`}
                          className="font-medium text-neutral-text hover:underline"
                        >
                          {r.titre}
                        </Link>
                      </td>
                      <td className="py-1.5 px-2 text-neutral-text-secondary">{r.adresse}</td>
                      <td className="py-1.5 px-2 text-neutral-text-secondary">{r.equipe}</td>
                      <td className="py-1.5 px-2">{r.avancement}</td>
                      <td className="py-1.5 px-2">{r.statut}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* 2) Équipes sur le terrain */}
        <SectionCard
          title="Équipes sur le terrain"
          actions={
            <Link
              href="/employes/liste"
              className="text-caption-xs text-primary-blue hover:underline"
            >
              Voir tout
            </Link>
          }
        >
          <div className="overflow-x-auto -mx-1">
            <table className="w-full border-collapse text-caption" style={{ fontSize: "12px" }}>
              <thead>
                <tr className="border-b border-neutral-border">
                  <th className="text-left py-1.5 px-2 font-medium text-neutral-text-secondary">
                    Employé
                  </th>
                  <th className="text-left py-1.5 px-2 font-medium text-neutral-text-secondary">
                    Chantier
                  </th>
                  <th className="text-left py-1.5 px-2 font-medium text-neutral-text-secondary">
                    Check-in
                  </th>
                  <th className="text-left py-1.5 px-2 font-medium text-neutral-text-secondary">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {timesheetsToday.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-3 px-2 text-neutral-text-secondary text-caption">
                      Aucune entrée aujourd&apos;hui.
                    </td>
                  </tr>
                ) : (
                  timesheetsToday.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-neutral-border last:border-0 hover:bg-neutral-bg-subtle"
                    >
                      <td className="py-1.5 px-2">
                        {t.employee_name ?? (t.employee_id ? employeeNames[t.employee_id] : "—")}
                      </td>
                      <td className="py-1.5 px-2 text-neutral-text-secondary">
                        {t.project_id ? projectTitles[t.project_id] ?? t.project_id : "—"}
                      </td>
                      <td className="py-1.5 px-2 text-neutral-text-secondary">{t.work_date}</td>
                      <td className="py-1.5 px-2">{t.hours}h</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* 3) Alertes */}
        <SectionCard
          title="Alertes"
          actions={
            <Link
              href="/patron/inventaire/alertes"
              className="text-caption-xs text-primary-blue hover:underline"
            >
              Voir tout
            </Link>
          }
        >
          <ul className="space-y-1 text-caption" style={{ fontSize: "12px" }}>
            {lowStock.length === 0 && progressWithBlockers.length === 0 && briefsNonConfirme.length === 0 ? (
              <li className="text-neutral-text-secondary py-1">Aucune alerte.</li>
            ) : (
              <>
                {lowStock.slice(0, 3).map((i) => (
                  <li key={i.id} className="flex items-center gap-2 py-0.5">
                    <Package size={14} className="text-amber-600 shrink-0" />
                    <span>Stock faible: {i.name}</span>
                    {i.min_stock != null && (
                      <span className="text-neutral-text-secondary">(min. {i.min_stock})</span>
                    )}
                  </li>
                ))}
                {progressWithBlockers.slice(0, 2).map((p) => (
                  <li key={p.id} className="flex items-center gap-2 py-0.5">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                    <span>Blocage chantier: {projectTitles[p.project_id] ?? p.project_id}</span>
                  </li>
                ))}
                {briefsNonConfirme.slice(0, 2).map((b) => (
                  <li key={b.id} className="flex items-center gap-2 py-0.5">
                    <FileText size={14} className="text-amber-600 shrink-0" />
                    <span>Brief non confirmé: {b.title}</span>
                  </li>
                ))}
              </>
            )}
          </ul>
        </SectionCard>

        {/* 4) Activité récente */}
        <SectionCard
          title="Activité récente"
          actions={
            <Link href="/accueil/chantiers" className="text-caption-xs text-primary-blue hover:underline">
              Voir tout
            </Link>
          }
        >
          {activitySlice.length === 0 ? (
            <p className="text-caption text-neutral-text-secondary py-1">Aucune activité récente.</p>
          ) : (
            <ul className="space-y-1.5">
              {activitySlice.map((a, idx) => (
                <li key={`${a.type}-${a.id ?? idx}`} className="flex items-start gap-2 text-caption" style={{ fontSize: "12px" }}>
                  <span className="shrink-0 mt-0.5">
                    {a.type === "photo" && <ImageIcon size={14} className="text-neutral-text-secondary" />}
                    {a.type === "avancement" && <TrendingUp size={14} className="text-neutral-text-secondary" />}
                    {a.type === "brief" && <Send size={14} className="text-neutral-text-secondary" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{a.label}</span>
                  <span className="text-neutral-text-secondary shrink-0">
                    {new Date(a.at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* 5) Photos récentes chantier */}
        <SectionCard
          title="Photos récentes chantier"
          className="lg:col-span-2"
          actions={
            <Link href="/accueil/chantiers" className="text-caption-xs text-primary-blue hover:underline">
              Voir tout
            </Link>
          }
        >
          {recentPhotos.length === 0 ? (
            <p className="text-caption text-neutral-text-secondary py-2">Aucune photo récente.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {recentPhotos.map((m) => {
                const url = getMediaPublicUrl("project_photo", m.bucket_path);
                return (
                  <Link
                    key={m.id}
                    href={`/patron/projets/${m.entity_id}`}
                    className="aspect-video relative rounded overflow-hidden bg-neutral-bg-subtle border border-neutral-border hover:border-primary-blue/40 transition-colors"
                  >
                    <Image
                      src={url}
                      alt={m.description ?? "Photo chantier"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 200px"
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* 6) Planning semaine */}
        <SectionCard
          title="Planning semaine"
          className="lg:col-span-2"
          actions={
            <Link href="/accueil/agenda" className="text-caption-xs text-primary-blue hover:underline">
              Voir l&apos;agenda
            </Link>
          }
        >
          {eventsWeek.length === 0 ? (
            <p className="text-caption text-neutral-text-secondary py-1">Aucun événement cette semaine.</p>
          ) : (
            <ul className="space-y-1 text-caption" style={{ fontSize: "12px" }}>
              {eventsWeek.slice(0, 12).map((e) => (
                <li
                  key={e.id}
                  className="flex items-center gap-2 py-1 border-b border-neutral-border last:border-0"
                >
                  <Calendar size={14} className="text-neutral-text-secondary shrink-0" />
                  <span className="font-medium text-neutral-text truncate">{e.title}</span>
                  <span className="text-neutral-text-secondary shrink-0">
                    {new Date(e.starts_at).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}{" "}
                    {new Date(e.starts_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-neutral-text-secondary text-caption-xs">{e.event_type}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
}
