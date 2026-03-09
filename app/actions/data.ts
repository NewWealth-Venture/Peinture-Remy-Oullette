"use server";

import { revalidatePath } from "next/cache";
import * as projectsDb from "@/lib/db/projects";
import * as employeesDb from "@/lib/db/employees";
import * as briefsDb from "@/lib/db/briefs";
import * as inventoryDb from "@/lib/db/inventory";
import * as calendarDb from "@/lib/db/calendar";
import * as progressDb from "@/lib/db/progress";
import * as announcementsDb from "@/lib/db/announcements";
import * as timesheetsDb from "@/lib/db/timesheets";
import * as requestsDb from "@/lib/db/requests";
import * as clientsDb from "@/lib/db/clients";
import { uploadMedia } from "@/lib/storage/upload";
import type { MediaEntityType } from "@/lib/db/media";

export type ActionResult = { success: true; id?: string } | { success: false; error: string };

function wrap<T>(fn: () => Promise<T>, path?: string): Promise<ActionResult> {
  return fn()
    .then((data) => {
      if (path) revalidatePath(path);
      const result: ActionResult = { success: true as const };
      if (data != null && typeof data === "object" && "id" in data && typeof (data as { id: string }).id === "string") {
        result.id = (data as { id: string }).id;
      }
      return result;
    })
    .catch((e) => ({
      success: false as const,
      error: e?.message ?? "Erreur serveur",
    }));
}

// ——— Projects ———
export async function createProjectAction(p: projectsDb.ProjectInsert): Promise<ActionResult> {
  return wrap(() => projectsDb.createProject(p).then((id) => ({ id })), "/accueil/chantiers");
}
export async function updateProjectAction(id: string, p: Partial<projectsDb.ProjectInsert>): Promise<ActionResult> {
  return wrap(() => projectsDb.updateProject(id, p), "/accueil/chantiers");
}
export async function deleteProjectAction(id: string): Promise<ActionResult> {
  return wrap(() => projectsDb.deleteProject(id), "/accueil/chantiers");
}
export async function assignEmployeeToProjectAction(
  projectId: string,
  employeeId: string,
  notes?: string | null
): Promise<ActionResult> {
  return wrap(() => projectsDb.assignEmployeeToProject(projectId, employeeId, notes));
}
export async function unassignEmployeeFromProjectAction(projectId: string, employeeId: string): Promise<ActionResult> {
  return wrap(() => projectsDb.unassignEmployeeFromProject(projectId, employeeId));
}
export async function addProjectTaskAction(
  projectId: string,
  p: { title: string; description?: string | null; priority?: string; status?: string }
): Promise<ActionResult> {
  return wrap(() => projectsDb.addProjectTask(projectId, p));
}
export async function updateProjectTaskAction(
  taskId: string,
  p: Partial<{ title: string; description: string | null; priority: string; status: string }>
): Promise<ActionResult> {
  return wrap(() => projectsDb.updateProjectTask(taskId, p));
}
export async function deleteProjectTaskAction(taskId: string): Promise<ActionResult> {
  return wrap(() => projectsDb.deleteProjectTask(taskId));
}
export async function addProjectMaterialUsageAction(
  projectId: string,
  itemId: string,
  quantity: number,
  unit: string,
  note?: string | null
): Promise<ActionResult> {
  return wrap(() => projectsDb.addProjectMaterialUsage(projectId, itemId, quantity, unit, note));
}

// ——— Employees ———
export async function createEmployeeAction(p: employeesDb.EmployeeInsert): Promise<ActionResult> {
  return wrap(() => employeesDb.createEmployee(p), "/employes/liste");
}
export async function updateEmployeeAction(id: string, p: Partial<employeesDb.EmployeeInsert>): Promise<ActionResult> {
  return wrap(() => employeesDb.updateEmployee(id, p), "/employes/liste");
}
export async function deleteEmployeeAction(id: string): Promise<ActionResult> {
  return wrap(() => employeesDb.deleteEmployee(id), "/employes/liste");
}

// ——— Briefs ———
export async function createBriefAction(p: briefsDb.BriefInsert): Promise<ActionResult> {
  return wrap(() => briefsDb.createBrief(p));
}
export async function updateBriefAction(id: string, p: Partial<briefsDb.BriefInsert>): Promise<ActionResult> {
  return wrap(() => briefsDb.updateBrief(id, p));
}
export async function deleteBriefAction(id: string): Promise<ActionResult> {
  return wrap(() => briefsDb.deleteBrief(id));
}
export async function addBriefZoneAction(
  briefId: string,
  title: string,
  details?: string | null,
  sortOrder?: number
): Promise<ActionResult> {
  return wrap(() => briefsDb.addBriefZone(briefId, title, details, sortOrder));
}
export async function addBriefChecklistItemAction(
  briefId: string,
  label: string,
  required?: boolean,
  sortOrder?: number
): Promise<ActionResult> {
  return wrap(() => briefsDb.addBriefChecklistItem(briefId, label, required ?? false, sortOrder ?? 0));
}
export async function toggleChecklistItemAction(briefId: string, itemId: string): Promise<ActionResult> {
  return wrap(() => briefsDb.toggleChecklistItem(briefId, itemId));
}
export async function addBriefMessageAction(
  briefId: string,
  authorType: "Patron" | "Employé",
  message: string,
  authorName?: string | null
): Promise<ActionResult> {
  return wrap(() => briefsDb.addBriefMessage(briefId, authorType, message, authorName));
}
export async function assignEmployeeToBriefAction(briefId: string, employeeId: string): Promise<ActionResult> {
  return wrap(() => briefsDb.assignEmployeeToBrief(briefId, employeeId));
}
export async function unassignEmployeeFromBriefAction(briefId: string, employeeId: string): Promise<ActionResult> {
  return wrap(() => briefsDb.unassignEmployeeFromBrief(briefId, employeeId));
}

// ——— Inventory ———
export async function createInventoryItemAction(p: Parameters<typeof inventoryDb.createInventoryItem>[0]): Promise<ActionResult> {
  return wrap(() => inventoryDb.createInventoryItem(p), "/patron/inventaire/catalogue");
}
export async function updateInventoryItemAction(
  id: string,
  p: Parameters<typeof inventoryDb.updateInventoryItem>[1]
): Promise<ActionResult> {
  return wrap(() => inventoryDb.updateInventoryItem(id, p), "/patron/inventaire/catalogue");
}
export async function createLocationAction(p: Parameters<typeof inventoryDb.createLocation>[0]): Promise<ActionResult> {
  return wrap(() => inventoryDb.createLocation(p), "/patron/inventaire/emplacements");
}
export async function createMovementAction(p: Parameters<typeof inventoryDb.createMovement>[0]): Promise<ActionResult> {
  return wrap(() => inventoryDb.createMovement(p), "/patron/inventaire/mouvements");
}

// ——— Calendar ———
export async function createCalendarEventAction(p: calendarDb.CalendarEventInsert): Promise<ActionResult> {
  return wrap(() => calendarDb.createEvent(p), "/accueil/agenda");
}
export async function updateCalendarEventAction(id: string, p: Partial<calendarDb.CalendarEventInsert>): Promise<ActionResult> {
  return wrap(() => calendarDb.updateEvent(id, p), "/accueil/agenda");
}
export async function deleteCalendarEventAction(id: string): Promise<ActionResult> {
  return wrap(() => calendarDb.deleteEvent(id), "/accueil/agenda");
}

// ——— Progress ———
export async function createDailyProgressAction(p: progressDb.DailyProgressInsert): Promise<ActionResult> {
  return wrap(() => progressDb.createDailyProgress(p), "/employes/avancement");
}

// ——— Announcements ———
export async function createAnnouncementAction(title: string, content: string): Promise<ActionResult> {
  return wrap(() => announcementsDb.createAnnouncement(title, content), "/accueil/annonces");
}
export async function updateAnnouncementAction(id: string, title: string, content: string): Promise<ActionResult> {
  return wrap(() => announcementsDb.updateAnnouncement(id, title, content), "/accueil/annonces");
}
export async function deleteAnnouncementAction(id: string): Promise<ActionResult> {
  return wrap(() => announcementsDb.deleteAnnouncement(id), "/accueil/annonces");
}

// ——— Timesheets ———
export async function createTimesheetAction(p: timesheetsDb.TimesheetInsert): Promise<ActionResult> {
  return wrap(() => timesheetsDb.createTimesheet(p), "/employes/pointage");
}

// ——— Requests ———
export async function createRequestAction(p: requestsDb.RequestInsert): Promise<ActionResult> {
  return wrap(() => requestsDb.createRequest(p), "/employes/demandes");
}
export async function updateRequestStatusAction(id: string, status: requestsDb.RequestStatus): Promise<ActionResult> {
  return wrap(() => requestsDb.updateRequestStatus(id, status), "/employes/demandes");
}

// ——— Clients (champs internes + notes) ———
export async function updateClientInternalAction(
  id: string,
  update: clientsDb.InternalClientUpdate
): Promise<ActionResult> {
  return wrap(() => clientsDb.updateInternalClientFields(id, update), `/patron/clients/${id}`);
}
export async function addClientNoteAction(clientId: string, note: string): Promise<ActionResult> {
  return wrap(() => clientsDb.addClientNote(clientId, note).then((id) => ({ id })), `/patron/clients/${clientId}`);
}
export async function createClientAction(p: clientsDb.ClientInsert): Promise<ActionResult> {
  return wrap(() => clientsDb.createClientRecord(p).then((id) => ({ id })), "/patron/clients");
}

// ——— Upload (retourne url + fileId ou erreur) ———
export async function uploadMediaAction(
  entityType: MediaEntityType,
  entityId: string,
  formData: FormData
): Promise<{ success: true; url: string; fileId: string } | { success: false; error: string }> {
  const file = formData.get("file") as File | null;
  if (!file?.size) return { success: false, error: "Fichier manquant" };
  try {
    const result = await uploadMedia(entityType, entityId, file, {
      fileName: file.name,
      description: (formData.get("description") as string) || undefined,
    });
    return { success: true, url: result.url, fileId: result.fileId };
  } catch (e) {
    return { success: false, error: (e as Error)?.message ?? "Erreur upload" };
  }
}
