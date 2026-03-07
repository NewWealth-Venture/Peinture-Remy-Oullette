import { createClient } from "@/lib/supabase/server";

export type DbAnnouncement = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export async function listAnnouncements(limit = 50): Promise<DbAnnouncement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    title: row.title,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function createAnnouncement(title: string, content: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .insert({ title, content })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateAnnouncement(id: string, title: string, content: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("announcements").update({ title, content }).eq("id", id);
  if (error) throw error;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
}
