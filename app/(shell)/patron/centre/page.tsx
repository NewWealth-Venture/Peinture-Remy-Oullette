import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { EmptyInline } from "@/components/EmptyInline";
import Link from "next/link";
import { listProjects } from "@/lib/db/projects";
import { listEmployees } from "@/lib/db/employees";
import { listLatestDailyProgress } from "@/lib/db/progress";
import { getLowStockItems } from "@/lib/db/inventory";
import { MapPin, Users, Banknote, TrendingUp, Package } from "lucide-react";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" });
}

export default async function PatronCentrePage() {
  const [projects, employees, progress, lowStock] = await Promise.all([
    listProjects(),
    listEmployees(true),
    listLatestDailyProgress(10),
    getLowStockItems().catch(() => []),
  ]);

  const enCours = projects.filter((p) => p.status === "En cours");

  return (
    <div className="p-6 max-w-[1180px] mx-auto">
      <PageHeader title="Centre de pilotage" subtitle="Vue synthétique chantiers, main-d'œuvre et finances." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SectionCard title="Chantiers" actions={<Link href="/accueil/chantiers" className="text-caption-xs text-primary-blue hover:underline">Voir tout</Link>}>
          {enCours.length === 0 ? (
            <EmptyInline icon={MapPin} message="Aucun chantier en cours." />
          ) : (
            <ul className="space-y-1.5">
              {enCours.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <Link href={`/patron/projets/${p.id}`} className="text-caption text-neutral-text hover:underline">
                    {p.title}
                  </Link>
                  <span className="text-caption-xs text-neutral-text-secondary ml-1">— {p.status}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
        <SectionCard title="Main-d'œuvre" actions={<Link href="/employes/liste" className="text-caption-xs text-primary-blue hover:underline">Voir tout</Link>}>
          {employees.length === 0 ? (
            <EmptyInline icon={Users} message="Aucun employé actif." />
          ) : (
            <p className="text-caption text-neutral-text">{employees.length} employé(s) actif(s)</p>
          )}
        </SectionCard>
        <SectionCard title="Finances">
          <EmptyInline icon={Banknote} message="Synthèse financière à venir." />
        </SectionCard>
      </div>
      <SectionCard title="Derniers avancements" className="mt-6" actions={<Link href="/employes/avancement" className="text-caption-xs text-primary-blue hover:underline">Voir tout</Link>}>
        {progress.length === 0 ? (
          <EmptyInline icon={TrendingUp} message="Aucun avancement enregistré. Les entrées des employés apparaîtront ici." />
        ) : (
          <ul className="space-y-3">
            {progress.map((a) => {
              const projet = projects.find((p) => p.id === a.project_id);
              return (
                <li key={a.id} className="py-2 px-3 border border-neutral-border rounded">
                  <p className="text-caption font-medium text-neutral-text">{projet?.title ?? "Projet"}</p>
                  <p className="text-caption-xs text-neutral-text-secondary">{formatDate(a.progress_date)}</p>
                  <p className="text-caption text-neutral-text mt-1">{a.summary}</p>
                  {a.progress_percent != null && <p className="text-caption-xs text-neutral-text-secondary mt-1">Progression : {a.progress_percent} %</p>}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
      {lowStock.length > 0 && (
        <SectionCard title="Alertes stock" className="mt-6" actions={<Link href="/patron/inventaire/alertes" className="text-caption-xs text-primary-blue hover:underline">Voir tout</Link>}>
          <ul className="space-y-1">
            {lowStock.slice(0, 5).map((i) => (
              <li key={i.id} className="flex items-center gap-2 text-caption text-neutral-text">
                <Package size={14} className="text-amber-600 shrink-0" />
                {i.name}
                {i.min_stock != null && <span className="text-neutral-text-secondary">(min. {i.min_stock})</span>}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
