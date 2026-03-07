import { createClient } from "@/lib/supabase/server";

export type CalendarEventType = "Chantier" | "Rendez-vous" | "Interne";

export type DbCalendarEvent = {
  id: string;
  title: string;
  event_type: CalendarEventType;
  project_id: string | null;
  starts_at: string;
  ends_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CalendarEventInsert = {
  title: string;
  event_type: CalendarEventType;
  project_id?: string | null;
  starts_at: string;
  ends_at: string;
  notes?: string | null;
};

export async function listEventsInRange(start: string, end: string): Promise<DbCalendarEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .gte("ends_at", start)
    .lte("starts_at", end)
    .order("starts_at");
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    title: row.title,
    event_type: row.event_type,
    project_id: row.project_id ?? null,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    notes: row.notes ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function createEvent(p: CalendarEventInsert): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      title: p.title,
      event_type: p.event_type,
      project_id: p.project_id ?? null,
      starts_at: p.starts_at,
      ends_at: p.ends_at,
      notes: p.notes ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateEvent(id: string, p: Partial<CalendarEventInsert>): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("calendar_events").update(p).eq("id", id);
  if (error) throw error;
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("calendar_events").delete().eq("id", id);
  if (error) throw error;
}

export async function getEventById(id: string): Promise<DbCalendarEvent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("calendar_events").select("*").eq("id", id).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    event_type: data.event_type,
    project_id: data.project_id ?? null,
    starts_at: data.starts_at,
    ends_at: data.ends_at,
    notes: data.notes ?? null,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}
