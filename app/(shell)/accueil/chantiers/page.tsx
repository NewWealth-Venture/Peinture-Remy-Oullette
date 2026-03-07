import { listProjects } from "@/lib/db/projects";
import { listEmployees } from "@/lib/db/employees";
import { listLatestDailyProgress } from "@/lib/db/progress";
import { listProjectTasksForProjects } from "@/lib/db/projects";
import { mapProject } from "@/lib/db/mappers";
import { mapEmployee } from "@/lib/db/mappers";
import type { Projet } from "@/types/projet";
import type { AvancementJour } from "@/types/projet";
import { ChantiersContent } from "./ChantiersContent";

export default async function ChantiersPage() {
  const [dbProjects, dbEmployees, dbProgress] = await Promise.all([
    listProjects(),
    listEmployees(true),
    listLatestDailyProgress(100),
  ]);
  const projectIds = dbProjects.map((p) => p.id);
  const tasks = projectIds.length > 0 ? await listProjectTasksForProjects(projectIds) : [];
  const tasksByProject = new Map<string, typeof tasks>();
  for (const t of tasks) {
    const list = tasksByProject.get(t.project_id) ?? [];
    list.push(t);
    tasksByProject.set(t.project_id, list);
  }
  const initialProjects: Projet[] = dbProjects.map((p) =>
    mapProject(p, {
      tasks: tasksByProject.get(p.id) ?? [],
      avancements: dbProgress.filter((a) => a.project_id === p.id),
    })
  );
  const initialEmployees = dbEmployees.map(mapEmployee);
  const initialProgress: AvancementJour[] = dbProgress.map((a) => ({
    id: a.id,
    projetId: a.project_id,
    date: a.progress_date,
    progressionPourcent: a.progress_percent ?? undefined,
    resume: a.summary,
    blocages: a.blockers ?? undefined,
    creePar: a.created_by_name ?? undefined,
  }));

  return (
    <ChantiersContent
      initialProjects={initialProjects}
      initialEmployees={initialEmployees}
      initialProgress={initialProgress}
    />
  );
}
