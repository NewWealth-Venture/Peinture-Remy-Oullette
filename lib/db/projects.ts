import { createClient } from "@/lib/supabase/server";

export type ProjectStatus = "À planifier" | "En cours" | "En attente" | "Terminé";
export type ProjectPriority = "Basse" | "Normale" | "Haute";

export type DbProject = {
  id: string;
  client_id: string | null;
  title: string;
  address: string | null;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string | null;
  end_date: string | null;
  responsable: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectInsert = {
  client_id?: string | null;
  title: string;
  address?: string | null;
  description?: string | null;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  start_date?: string | null;
  end_date?: string | null;
  responsable?: string | null;
};

export type ProjectAssignmentRow = {
  id: string;
  project_id: string;
  employee_id: string;
  assigned_at: string;
  notes: string | null;
};

export async function listProjects(): Promise<DbProject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    client_id: row.client_id ?? null,
    title: row.title,
    address: row.address ?? null,
    description: row.description ?? null,
    status: row.status,
    priority: row.priority ?? "Normale",
    start_date: row.start_date ?? null,
    end_date: row.end_date ?? null,
    responsable: row.responsable ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function listProjectsByClientId(clientId: string): Promise<DbProject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", clientId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    client_id: row.client_id ?? null,
    title: row.title,
    address: row.address ?? null,
    description: row.description ?? null,
    status: row.status,
    priority: row.priority ?? "Normale",
    start_date: row.start_date ?? null,
    end_date: row.end_date ?? null,
    responsable: row.responsable ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function getProjectById(id: string): Promise<DbProject | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  if (!data) return null;
  return {
    id: data.id,
    client_id: data.client_id ?? null,
    title: data.title,
    address: data.address ?? null,
    description: data.description ?? null,
    status: data.status,
    priority: data.priority ?? "Normale",
    start_date: data.start_date ?? null,
    end_date: data.end_date ?? null,
    responsable: data.responsable ?? null,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function createProject(p: ProjectInsert): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      client_id: p.client_id ?? null,
      title: p.title,
      address: p.address ?? null,
      description: p.description ?? null,
      status: p.status ?? "À planifier",
      priority: p.priority ?? "Normale",
      start_date: p.start_date ?? null,
      end_date: p.end_date ?? null,
      responsable: p.responsable ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateProject(id: string, p: Partial<ProjectInsert>): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update(p).eq("id", id);
  if (error) throw error;
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function listProjectAssignments(projectId: string): Promise<ProjectAssignmentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_assignments")
    .select("*")
    .eq("project_id", projectId);
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    project_id: row.project_id,
    employee_id: row.employee_id,
    assigned_at: row.assigned_at,
    notes: row.notes ?? null,
  }));
}

export async function assignEmployeeToProject(
  projectId: string,
  employeeId: string,
  notes?: string | null
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("project_assignments").insert({
    project_id: projectId,
    employee_id: employeeId,
    notes: notes ?? null,
  });
  if (error) throw error;
}

export async function unassignEmployeeFromProject(projectId: string, employeeId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_assignments")
    .delete()
    .eq("project_id", projectId)
    .eq("employee_id", employeeId);
  if (error) throw error;
}

// ——— Tâches projet ———
export type DbProjectTask = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  created_at: string;
};

export async function listProjectTasks(projectId: string): Promise<DbProjectTask[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    project_id: row.project_id,
    title: row.title,
    description: row.description ?? null,
    priority: row.priority ?? "Normale",
    status: row.status,
    created_at: row.created_at,
  }));
}

export async function listProjectTasksForProjects(projectIds: string[]): Promise<DbProjectTask[]> {
  if (projectIds.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_tasks")
    .select("*")
    .in("project_id", projectIds)
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    project_id: row.project_id,
    title: row.title,
    description: row.description ?? null,
    priority: row.priority ?? "Normale",
    status: row.status,
    created_at: row.created_at,
  }));
}

export async function addProjectTask(
  projectId: string,
  p: { title: string; description?: string | null; priority?: string; status?: string }
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_tasks")
    .insert({
      project_id: projectId,
      title: p.title,
      description: p.description ?? null,
      priority: p.priority ?? "Normale",
      status: p.status ?? "À faire",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateProjectTask(
  taskId: string,
  p: Partial<{ title: string; description: string | null; priority: string; status: string }>
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("project_tasks").update(p).eq("id", taskId);
  if (error) throw error;
}

export async function deleteProjectTask(taskId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("project_tasks").delete().eq("id", taskId);
  if (error) throw error;
}

// ——— Matériel utilisé (projet) ———
export type DbProjectMaterialUsage = {
  id: string;
  project_id: string;
  item_id: string;
  quantity: number;
  unit: string;
  note: string | null;
  used_at: string;
  created_at: string;
};

export async function listProjectMaterialUsage(projectId: string): Promise<DbProjectMaterialUsage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_material_usage")
    .select("*")
    .eq("project_id", projectId)
    .order("used_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    project_id: row.project_id,
    item_id: row.item_id,
    quantity: Number(row.quantity),
    unit: row.unit,
    note: row.note ?? null,
    used_at: row.used_at,
    created_at: row.created_at,
  }));
}

export async function addProjectMaterialUsage(
  projectId: string,
  itemId: string,
  quantity: number,
  unit: string,
  note?: string | null
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_material_usage")
    .insert({
      project_id: projectId,
      item_id: itemId,
      quantity,
      unit,
      note: note ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

/** Retourne un projet complet (app type) avec tâches, photos, matériel, avancements. */
export async function getProjectFull(id: string): Promise<import("@/types/projet").Projet | null> {
  const project = await getProjectById(id);
  if (!project) return null;
  const [tasks, materialUsage, avancements] = await Promise.all([
    listProjectTasks(id),
    listProjectMaterialUsage(id),
    import("@/lib/db/progress").then((m) => m.listDailyProgressByProject(id)),
  ]);
  const { listMediaByEntity } = await import("@/lib/db/media");
  const photos = await listMediaByEntity("project_photo", id);
  const { mapProject } = await import("@/lib/db/mappers");
  return mapProject(project, { tasks, photos, materialUsage, avancements });
}
