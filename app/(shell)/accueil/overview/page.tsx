import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { EmptyInline } from "@/components/EmptyInline";
import { MapPin, Users, Bell, Megaphone, Package } from "lucide-react";
import Link from "next/link";
import { listProjects } from "@/lib/db/projects";
import { listEmployees } from "@/lib/db/employees";
import { listAnnouncements } from "@/lib/db/announcements";
import { listEventsInRange } from "@/lib/db/calendar";
import { getLowStockItems } from "@/lib/db/inventory";
import { listProjectAssignments } from "@/lib/db/projects";

const cols = ["Chantier", "Adresse", "Équipe", "Statut"];

export default async function AccueilOverviewPage() {
  const today = new Date().toISOString().slice(0, 10);
  const dayEnd = new Date(today + "T23:59:59.999Z").toISOString();
  const [projects, employees, announcements, eventsToday, progress, lowStock] = await Promise.all([
    listProjects(),
    listEmployees(true),
    listAnnouncements(5),
    listEventsInRange(today + "T00:00:00.000Z", dayEnd),
    listLatestDailyProgress(5),
    getLowStockItems().catch(() => []),
  ]);

  const projectsEnCours = projects.filter((p) => p.status === "En cours");
  const todayEvents = eventsToday.filter((e) => e.starts_at.slice(0, 10) === today);

  const rows: { titre: string; adresse: string; equipe: string; statut: string; id: string }[] = [];
  for (const p of projectsEnCours.slice(0, 10)) {
    const assignments = await listProjectAssignments(p.id);
    const names = assignments
      .map((a) => employees.find((e) => e.id === a.employee_id)?.full_name)
      .filter(Boolean) as string[];
    rows.push({
      id: p.id,
      titre: p.title,
      adresse: p.address ?? "—",
      equipe: names.length ? names.join(", ") : "—",
      statut: p.status,
    });
  }

  return (
    <>
      <PageHeader title="Vue d'ensemble" subtitle="Synthèse du jour et rappels." />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          <SectionCard
            title="Aujourd'hui"
            description="Chantiers et équipes planifiés"
            actions={
              <Link href="/accueil/chantiers" className="text-caption-xs text-primary-blue hover:underline">
                Voir tout
              </Link>
            }
          >
            <div className="overflow-x-auto -mx-1">
              <table className="w-full border-collapse text-caption" style={{ fontSize: "13px" }}>
                <thead>
                  <tr className="border-b border-neutral-border">
                    {cols.map((c) => (
                      <th key={c} className="text-left py-2 px-2 font-medium text-neutral-text-secondary">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={cols.length} className="p-0">
                        <EmptyInline icon={MapPin} message="Aucun chantier planifié aujourd'hui." />
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.id} className="border-b border-neutral-border hover:bg-neutral-bg-subtle">
                        <td className="py-2 px-2">
                          <Link href={`/patron/projets/${r.id}`} className="font-medium text-neutral-text hover:underline">
                            {r.titre}
                          </Link>
                        </td>
                        <td className="py-2 px-2 text-neutral-text-secondary">{r.adresse}</td>
                        <td className="py-2 px-2 text-neutral-text-secondary">{r.equipe}</td>
                        <td className="py-2 px-2">{r.statut}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard
            title="Équipes du jour"
            actions={
              <Link href="/employes/liste" className="text-caption-xs text-primary-blue hover:underline">
                Voir tout
              </Link>
            }
          >
            {employees.length === 0 ? (
              <EmptyInline icon={Users} message="Aucune équipe assignée pour aujourd'hui." />
            ) : (
              <ul className="space-y-1.5">
                {employees.slice(0, 5).map((e) => (
                  <li key={e.id} className="text-caption text-neutral-text">
                    {e.full_name}
                    {e.role && <span className="text-neutral-text-secondary"> · {e.role}</span>}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <SectionCard
            title="Rappels"
            actions={
              <Link href="/accueil/agenda" className="text-caption-xs text-primary-blue hover:underline">
                Voir tout
              </Link>
            }
          >
            {todayEvents.length === 0 ? (
              <EmptyInline icon={Bell} message="Aucun rappel." />
            ) : (
              <ul className="space-y-2">
                {todayEvents.map((e) => (
                  <li key={e.id} className="text-caption">
                    <span className="font-medium text-neutral-text">{e.title}</span>
                    <span className="text-neutral-text-secondary ml-1">— {e.event_type}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Annonces"
            actions={
              <Link href="/accueil/annonces" className="text-caption-xs text-primary-blue hover:underline">
                Voir tout
              </Link>
            }
          >
            {announcements.length === 0 ? (
              <EmptyInline icon={Megaphone} message="Aucune annonce." />
            ) : (
              <ul className="space-y-2">
                {announcements.map((a) => (
                  <li key={a.id}>
                    <p className="font-medium text-neutral-text text-caption">{a.title}</p>
                    <p className="text-caption-xs text-neutral-text-secondary line-clamp-2">{a.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {lowStock.length > 0 && (
            <SectionCard
              title="Alertes stock"
              actions={
                <Link href="/patron/inventaire/alertes" className="text-caption-xs text-primary-blue hover:underline">
                  Voir tout
                </Link>
              }
            >
              <ul className="space-y-1">
                {lowStock.slice(0, 5).map((i) => (
                  <li key={i.id} className="text-caption text-neutral-text flex items-center gap-2">
                    <Package size={14} className="text-amber-600 shrink-0" />
                    {i.name}
                    {i.min_stock != null && (
                      <span className="text-neutral-text-secondary">(min. {i.min_stock})</span>
                    )}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
        </div>
      </div>
    </>
  );
}
