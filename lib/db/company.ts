import { createClient } from "@/lib/supabase/server";

export type DbCompanySettings = {
  id: string;
  company_name: string | null;
  company_logo_url: string | null;
  access_code: string | null;
  created_at: string;
  updated_at: string;
};

export async function getCompanySettings(): Promise<DbCompanySettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("company_settings").select("*").limit(1).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  if (!data) return null;
  return {
    id: data.id,
    company_name: data.company_name ?? null,
    company_logo_url: data.company_logo_url ?? null,
    access_code: data.access_code ?? null,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function updateCompanySettings(p: Partial<{
  company_name: string | null;
  company_logo_url: string | null;
}>): Promise<void> {
  const supabase = await createClient();
  const { data: row } = await supabase.from("company_settings").select("id").limit(1).single();
  if (!row) return;
  const { error } = await supabase.from("company_settings").update(p).eq("id", row.id);
  if (error) throw error;
}
