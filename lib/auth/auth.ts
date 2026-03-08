import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string | null;
  role: "patron" | "employe";
  active: boolean;
  created_at: string;
  updated_at: string;
};

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, active, created_at, updated_at")
      .eq("id", user.id)
      .single();
    if (error || !data) return null;
    if (!data.active) return null;
    return data as Profile;
  } catch {
    return null;
  }
}

export async function getUserRole(): Promise<"patron" | "employe" | null> {
  const profile = await getCurrentProfile();
  return profile?.role ?? null;
}
