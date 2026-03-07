import { PageHeader } from "@/components/PageHeader";
import { listProjects } from "@/lib/db/projects";
import { listLatestDailyProgress } from "@/lib/db/progress";
import { AvancementClient } from "./AvancementClient";

export default async function EmployesAvancementPage() {
  const [projects, progress] = await Promise.all([
    listProjects(),
    listLatestDailyProgress(200),
  ]);

  return (
    <div className="p-6 max-w-[1180px] mx-auto">
      <PageHeader title="Avancement quotidien" subtitle="Enregistrez l'avancement et les blocages par projet." />
      <AvancementClient
        projects={projects.map((p) => ({ id: p.id, title: p.title }))}
        initialProgress={progress.map((a) => ({
          id: a.id,
          project_id: a.project_id,
          progress_date: a.progress_date,
          summary: a.summary,
          progress_percent: a.progress_percent,
          blockers: a.blockers,
        }))}
      />
    </div>
  );
}
