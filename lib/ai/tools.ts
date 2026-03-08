import type { ChatCompletionTool } from "openai/resources/chat/completions";

const TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "getProjects",
      description: "Liste tous les projets/chantiers. Optionnel: filtrer par statut (À planifier, En cours, En attente, Terminé).",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["À planifier", "En cours", "En attente", "Terminé"], description: "Filtrer par statut" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getProjectById",
      description: "Détail d'un projet/chantier par ID (titre, adresse, statut, dates, responsable, description).",
      parameters: {
        type: "object",
        properties: { projectId: { type: "string", description: "UUID du projet" } },
        required: ["projectId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getProjectAssignments",
      description: "Liste des employés assignés à un projet.",
      parameters: {
        type: "object",
        properties: { projectId: { type: "string" } },
        required: ["projectId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getEmployees",
      description: "Liste des employés (actifs par défaut).",
      parameters: {
        type: "object",
        properties: { activeOnly: { type: "boolean", description: "Uniquement actifs", default: true } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getInventoryItems",
      description: "Liste des articles d'inventaire.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getLowStockItems",
      description: "Articles en stock faible ou rupture.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getInventoryMovements",
      description: "Derniers mouvements d'inventaire (entrées/sorties).",
      parameters: {
        type: "object",
        properties: { limit: { type: "number", default: 30 } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getCalendarEvents",
      description: "Événements agenda sur une période (ISO date start et end).",
      parameters: {
        type: "object",
        properties: {
          start: { type: "string", description: "Début période ISO" },
          end: { type: "string", description: "Fin période ISO" },
        },
        required: ["start", "end"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getDailyProgress",
      description: "Avancement quotidien (optionnel: par projet).",
      parameters: {
        type: "object",
        properties: {
          projectId: { type: "string" },
          limit: { type: "number", default: 20 },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getBriefs",
      description: "Liste des briefs (statut, titre, projet, date).",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getBriefById",
      description: "Détail d'un brief (instructions, zones, checklist, messages).",
      parameters: {
        type: "object",
        properties: { briefId: { type: "string" } },
        required: ["briefId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getAnnouncements",
      description: "Annonces récentes (titre, contenu, date).",
      parameters: {
        type: "object",
        properties: { limit: { type: "number", default: 10 } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getRecentPhotos",
      description: "Métadonnées des photos chantier récentes (entity_id = projet).",
      parameters: {
        type: "object",
        properties: { limit: { type: "number", default: 15 } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getDashboardSummary",
      description: "Résumé opérationnel: projets en cours, affectations, avancement récent, alertes stock, événements du jour.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getProjectTasks",
      description: "Tâches d'un projet (titre, statut, priorité).",
      parameters: {
        type: "object",
        properties: { projectId: { type: "string" } },
        required: ["projectId"],
      },
    },
  },
];

export const ASSISTANT_TOOLS = TOOLS;

export type ToolName =
  | "getProjects"
  | "getProjectById"
  | "getProjectAssignments"
  | "getEmployees"
  | "getInventoryItems"
  | "getLowStockItems"
  | "getInventoryMovements"
  | "getCalendarEvents"
  | "getDailyProgress"
  | "getBriefs"
  | "getBriefById"
  | "getAnnouncements"
  | "getRecentPhotos"
  | "getDashboardSummary"
  | "getProjectTasks";

export async function runTool(
  name: ToolName,
  args: Record<string, unknown>
): Promise<string> {
  const { listProjects, getProjectById, listProjectAssignments, listProjectTasks } = await import("@/lib/db/projects");
  const { listEmployees } = await import("@/lib/db/employees");
  const { listInventoryItems, getLowStockItems, listMovements } = await import("@/lib/db/inventory");
  const { listEventsInRange } = await import("@/lib/db/calendar");
  const { listLatestDailyProgress, listDailyProgressByProject } = await import("@/lib/db/progress");
  const { listBriefs, getBriefById, listBriefZones, listBriefChecklistItems, listBriefMessages } = await import("@/lib/db/briefs");
  const { listAnnouncements } = await import("@/lib/db/announcements");
  const { listRecentProjectPhotos } = await import("@/lib/db/media");
  const { listTimesheets } = await import("@/lib/db/timesheets");
  const { formatToolResult } = await import("@/lib/ai/formatter");

  try {
    switch (name) {
      case "getProjects": {
        const projects = await listProjects();
        const filtered = (args.status as string)
          ? projects.filter((p) => p.status === args.status)
          : projects;
        return formatToolResult("projects", filtered);
      }
      case "getProjectById": {
        const p = await getProjectById(String(args.projectId));
        return p ? formatToolResult("project", p) : "Projet non trouvé.";
      }
      case "getProjectAssignments": {
        const assignments = await listProjectAssignments(String(args.projectId));
        const employees = await listEmployees(true);
        const withNames = assignments.map((a) => ({
          ...a,
          employee_name: employees.find((e) => e.id === a.employee_id)?.full_name ?? null,
        }));
        return formatToolResult("project_assignments", withNames);
      }
      case "getProjectTasks": {
        const tasks = await listProjectTasks(String(args.projectId));
        return formatToolResult("project_tasks", tasks);
      }
      case "getEmployees": {
        const activeOnly = args.activeOnly !== false;
        const list = await listEmployees(activeOnly);
        return formatToolResult("employees", list);
      }
      case "getInventoryItems": {
        const list = await listInventoryItems(true);
        return formatToolResult("inventory_items", list);
      }
      case "getLowStockItems": {
        const list = await getLowStockItems();
        return formatToolResult("low_stock", list);
      }
      case "getInventoryMovements": {
        const limit = Number(args.limit) || 30;
        const list = await listMovements(undefined, limit);
        return formatToolResult("inventory_movements", list);
      }
      case "getCalendarEvents": {
        const start = String(args.start);
        const end = String(args.end);
        const list = await listEventsInRange(start, end);
        return formatToolResult("calendar_events", list);
      }
      case "getDailyProgress": {
        const projectId = args.projectId as string | undefined;
        const limit = Number(args.limit) || 20;
        const list = projectId
          ? await listDailyProgressByProject(projectId, limit)
          : await listLatestDailyProgress(limit);
        return formatToolResult("daily_progress", list);
      }
      case "getBriefs": {
        const list = await listBriefs();
        return formatToolResult("briefs", list);
      }
      case "getBriefById": {
        const b = await getBriefById(String(args.briefId));
        if (!b) return "Brief non trouvé.";
        const [zones, checklist, messages] = await Promise.all([
          listBriefZones(b.id),
          listBriefChecklistItems(b.id),
          listBriefMessages(b.id),
        ]);
        return formatToolResult("brief_detail", { brief: b, zones, checklist, messages });
      }
      case "getAnnouncements": {
        const limit = Number(args.limit) || 10;
        const list = await listAnnouncements(limit);
        return formatToolResult("announcements", list);
      }
      case "getRecentPhotos": {
        const limit = Number(args.limit) || 15;
        const list = await listRecentProjectPhotos(limit);
        return formatToolResult("recent_photos", list);
      }
      case "getDashboardSummary": {
        const today = new Date().toISOString().slice(0, 10);
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const weekEnd = new Date();
        const [projects, progress, lowStock, events, timesheets] = await Promise.all([
          listProjects(),
          listLatestDailyProgress(10),
          getLowStockItems(),
          listEventsInRange(today + "T00:00:00.000Z", today + "T23:59:59.999Z"),
          listTimesheets({ from: today, to: today, limit: 20 }),
        ]);
        const active = projects.filter((p) => p.status === "En cours");
        return formatToolResult("dashboard_summary", {
          activeProjectsCount: active.length,
          projects: active.slice(0, 5),
          recentProgress: progress.slice(0, 5),
          lowStockCount: lowStock.length,
          lowStockItems: lowStock.slice(0, 5),
          eventsToday: events,
          timesheetsToday: timesheets.length,
        });
      }
      default:
        return "Outil inconnu.";
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return `Erreur outil ${name}: ${msg}`;
  }
}
