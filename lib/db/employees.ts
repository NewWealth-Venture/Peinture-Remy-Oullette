import { createClient } from "@/lib/supabase/server";

export type EmploymentType = "Temps plein" | "Temps partiel" | "Contractuel" | "Saisonnier" | "Apprenti";
export type EmploymentStatus = "Actif" | "En congé" | "Suspendu" | "Inactif";
export type PayFrequency = "Horaire" | "Hebdomadaire" | "Bi-hebdomadaire" | "Mensuel";
export type DocumentType = "Contrat" | "Pièce identité" | "Permis" | "Certification" | "Formation" | "Paie" | "Autre";
export type TrainingStatus = "À faire" | "En cours" | "Complétée" | "Expirée";
export type CompensationType = "Taux horaire" | "Salaire fixe" | "Prime" | "Ajustement";
export type NoteType = "Interne" | "Performance" | "Incident" | "RH";
export type CertificationStatus = "Valide" | "Expire bientôt" | "Expirée";

export type DbEmployee = {
  id: string;
  auth_user_id: string | null;
  employee_code: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  role: string | null;
  role_title: string | null;
  department: string | null;
  employment_type: EmploymentType | null;
  employment_status: EmploymentStatus | null;
  hire_date: string | null;
  termination_date: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country: string | null;
  hourly_rate: number | null;
  salary_amount: number | null;
  pay_frequency: PayFrequency | null;
  overtime_rate: number | null;
  availability_notes: string | null;
  internal_notes: string | null;
  birth_date: string | null;
  preferred_language: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type EmployeeInsert = {
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  auth_user_id?: string | null;
  employee_code?: string | null;
  photo_url?: string | null;
  email?: string | null;
  phone?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  role?: string | null;
  role_title?: string | null;
  department?: string | null;
  employment_type?: EmploymentType | null;
  employment_status?: EmploymentStatus | null;
  hire_date?: string | null;
  termination_date?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  region?: string | null;
  postal_code?: string | null;
  country?: string | null;
  hourly_rate?: number | null;
  salary_amount?: number | null;
  pay_frequency?: PayFrequency | null;
  overtime_rate?: number | null;
  availability_notes?: string | null;
  internal_notes?: string | null;
  birth_date?: string | null;
  preferred_language?: string | null;
  active?: boolean;
};

export type DbEmployeeDocument = {
  id: string;
  employee_id: string;
  document_type: DocumentType;
  title: string;
  file_path: string;
  file_name: string | null;
  notes: string | null;
  expires_at: string | null;
  created_at: string;
};

export type DbEmployeeTraining = {
  id: string;
  employee_id: string;
  training_name: string;
  provider: string | null;
  completed_at: string | null;
  expires_at: string | null;
  status: TrainingStatus;
  certificate_document_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DbEmployeeCompensation = {
  id: string;
  employee_id: string;
  compensation_type: CompensationType;
  amount: number;
  effective_date: string;
  notes: string | null;
  created_at: string;
};

export type DbEmployeeNote = {
  id: string;
  employee_id: string;
  note: string;
  note_type: NoteType;
  created_by: string | null;
  created_at: string;
};

export type DbEmployeeAvailability = {
  id: string;
  employee_id: string;
  weekday: number;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
};

export type DbEmployeeCertification = {
  id: string;
  employee_id: string;
  certification_name: string;
  issuer: string | null;
  issued_at: string | null;
  expires_at: string | null;
  status: CertificationStatus;
  document_id: string | null;
  created_at: string;
};

function rowToEmployee(row: Record<string, unknown>): DbEmployee {
  const firstName = (row.first_name as string) ?? null;
  const lastName = (row.last_name as string) ?? null;
  const fullName = (row.full_name as string) ?? (firstName && lastName ? `${firstName} ${lastName}`.trim() : (firstName || lastName || "Sans nom"));
  return {
    id: row.id as string,
    auth_user_id: (row.auth_user_id as string) ?? null,
    employee_code: (row.employee_code as string) ?? null,
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    photo_url: (row.photo_url as string) ?? null,
    email: (row.email as string) ?? null,
    phone: (row.phone as string) ?? null,
    emergency_contact_name: (row.emergency_contact_name as string) ?? null,
    emergency_contact_phone: (row.emergency_contact_phone as string) ?? null,
    role: (row.role as string) ?? null,
    role_title: (row.role_title as string) ?? null,
    department: (row.department as string) ?? null,
    employment_type: (row.employment_type as EmploymentType) ?? null,
    employment_status: (row.employment_status as EmploymentStatus) ?? null,
    hire_date: (row.hire_date as string) ?? null,
    termination_date: (row.termination_date as string) ?? null,
    address_line1: (row.address_line1 as string) ?? null,
    address_line2: (row.address_line2 as string) ?? null,
    city: (row.city as string) ?? null,
    region: (row.region as string) ?? null,
    postal_code: (row.postal_code as string) ?? null,
    country: (row.country as string) ?? null,
    hourly_rate: row.hourly_rate != null ? Number(row.hourly_rate) : null,
    salary_amount: row.salary_amount != null ? Number(row.salary_amount) : null,
    pay_frequency: (row.pay_frequency as PayFrequency) ?? null,
    overtime_rate: row.overtime_rate != null ? Number(row.overtime_rate) : null,
    availability_notes: (row.availability_notes as string) ?? null,
    internal_notes: (row.internal_notes as string) ?? null,
    birth_date: (row.birth_date as string) ?? null,
    preferred_language: (row.preferred_language as string) ?? null,
    active: (row.active as boolean) ?? true,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export type ListEmployeesFilters = {
  employment_status?: EmploymentStatus | null;
  employment_type?: EmploymentType | null;
  role_title?: string | null;
  has_expired_certifications?: boolean;
  has_no_photo?: boolean;
};

export async function listEmployees(
  activeOnly = false,
  opts?: { search?: string; filters?: ListEmployeesFilters; sort?: "full_name" | "hire_date" | "employment_status"; ascending?: boolean }
): Promise<DbEmployee[]> {
  const supabase = await createClient();
  let q = supabase.from("employees").select("*");

  if (opts?.search?.trim()) {
    const term = opts.search.trim().toLowerCase();
    q = q.or(
      `full_name.ilike.%${term}%,first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,role_title.ilike.%${term}%`
    );
  }
  if (activeOnly) q = q.eq("active", true);
  const f = opts?.filters;
  if (f?.employment_status) q = q.eq("employment_status", f.employment_status);
  if (f?.employment_type) q = q.eq("employment_type", f.employment_type);
  if (f?.role_title) q = q.eq("role_title", f.role_title);
  if (f?.has_no_photo === true) q = q.is("photo_url", null);
  const sort = opts?.sort ?? "full_name";
  const asc = opts?.ascending ?? true;
  q = q.order(sort, { ascending: asc, nullsFirst: false });

  const { data, error } = await q;
  if (error) throw error;
  let list = (data ?? []).map((row) => rowToEmployee(row));
  if (f?.has_expired_certifications === true) {
    const { data: certs } = await supabase.from("employee_certifications").select("employee_id").eq("status", "Expirée");
    const expiredIds = new Set((certs ?? []).map((c) => c.employee_id as string));
    list = list.filter((e) => expiredIds.has(e.id));
  }
  return list;
}

export async function getEmployeeById(id: string): Promise<DbEmployee | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("employees").select("*").eq("id", id).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  if (!data) return null;
  return rowToEmployee(data);
}

export async function createEmployee(p: EmployeeInsert): Promise<string> {
  const supabase = await createClient();
  const fullName = p.full_name ?? (p.first_name && p.last_name ? `${p.first_name} ${p.last_name}`.trim() : p.first_name ?? p.last_name ?? "Sans nom");
  const { data, error } = await supabase
    .from("employees")
    .insert({
      auth_user_id: p.auth_user_id ?? null,
      employee_code: p.employee_code ?? null,
      first_name: p.first_name ?? null,
      last_name: p.last_name ?? null,
      full_name: fullName,
      photo_url: p.photo_url ?? null,
      email: p.email ?? null,
      phone: p.phone ?? null,
      emergency_contact_name: p.emergency_contact_name ?? null,
      emergency_contact_phone: p.emergency_contact_phone ?? null,
      role: p.role ?? null,
      role_title: p.role_title ?? null,
      department: p.department ?? null,
      employment_type: p.employment_type ?? null,
      employment_status: p.employment_status ?? null,
      hire_date: p.hire_date ?? null,
      termination_date: p.termination_date ?? null,
      address_line1: p.address_line1 ?? null,
      address_line2: p.address_line2 ?? null,
      city: p.city ?? null,
      region: p.region ?? null,
      postal_code: p.postal_code ?? null,
      country: p.country ?? null,
      hourly_rate: p.hourly_rate ?? null,
      salary_amount: p.salary_amount ?? null,
      pay_frequency: p.pay_frequency ?? null,
      overtime_rate: p.overtime_rate ?? null,
      availability_notes: p.availability_notes ?? null,
      internal_notes: p.internal_notes ?? null,
      birth_date: p.birth_date ?? null,
      preferred_language: p.preferred_language ?? null,
      active: p.active ?? true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateEmployee(id: string, p: Partial<EmployeeInsert>): Promise<void> {
  const supabase = await createClient();
  const payload: Record<string, unknown> = { ...p };
  if (p.first_name !== undefined || p.last_name !== undefined) {
    const current = await getEmployeeById(id);
    if (current) {
      const fn = p.first_name ?? current.first_name;
      const ln = p.last_name ?? current.last_name;
      payload.full_name = p.full_name ?? (fn && ln ? `${fn} ${ln}`.trim() : fn ?? ln ?? current.full_name);
    }
  }
  const { error } = await supabase.from("employees").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteEmployee(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) throw error;
}

// ——— Documents ———
export async function listEmployeeDocuments(employeeId: string): Promise<DbEmployeeDocument[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employee_documents")
    .select("*")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    employee_id: row.employee_id,
    document_type: row.document_type,
    title: row.title,
    file_path: row.file_path,
    file_name: row.file_name ?? null,
    notes: row.notes ?? null,
    expires_at: row.expires_at ?? null,
    created_at: row.created_at,
  }));
}

export async function addEmployeeDocument(params: {
  employee_id: string;
  document_type: DocumentType;
  title: string;
  file_path: string;
  file_name?: string | null;
  notes?: string | null;
  expires_at?: string | null;
}): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employee_documents")
    .insert(params)
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function deleteEmployeeDocument(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("employee_documents").delete().eq("id", id);
  if (error) throw error;
}

// ——— Formations ———
export async function listEmployeeTrainings(employeeId: string): Promise<DbEmployeeTraining[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employee_trainings")
    .select("*")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    employee_id: row.employee_id,
    training_name: row.training_name,
    provider: row.provider ?? null,
    completed_at: row.completed_at ?? null,
    expires_at: row.expires_at ?? null,
    status: row.status,
    certificate_document_id: row.certificate_document_id ?? null,
    notes: row.notes ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function addEmployeeTraining(params: {
  employee_id: string;
  training_name: string;
  provider?: string | null;
  completed_at?: string | null;
  expires_at?: string | null;
  status?: TrainingStatus;
  notes?: string | null;
}): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employee_trainings")
    .insert({
      employee_id: params.employee_id,
      training_name: params.training_name,
      provider: params.provider ?? null,
      completed_at: params.completed_at ?? null,
      expires_at: params.expires_at ?? null,
      status: params.status ?? "À faire",
      notes: params.notes ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateEmployeeTraining(
  id: string,
  params: Partial<{ training_name: string; provider: string | null; completed_at: string | null; expires_at: string | null; status: TrainingStatus; certificate_document_id: string | null; notes: string | null }>
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("employee_trainings").update(params).eq("id", id);
  if (error) throw error;
}

// ——— Compensation ———
export async function listCompensationHistory(employeeId: string): Promise<DbEmployeeCompensation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employee_compensation_history")
    .select("*")
    .eq("employee_id", employeeId)
    .order("effective_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    employee_id: row.employee_id,
    compensation_type: row.compensation_type,
    amount: Number(row.amount),
    effective_date: row.effective_date,
    notes: row.notes ?? null,
    created_at: row.created_at,
  }));
}

export async function addCompensationHistory(params: {
  employee_id: string;
  compensation_type: CompensationType;
  amount: number;
  effective_date: string;
  notes?: string | null;
}): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("employee_compensation_history").insert(params).select("id").single();
  if (error) throw error;
  return data.id;
}

// ——— Notes ———
export async function listEmployeeNotes(employeeId: string, noteType?: NoteType | null): Promise<DbEmployeeNote[]> {
  const supabase = await createClient();
  let q = supabase.from("employee_notes").select("*").eq("employee_id", employeeId).order("created_at", { ascending: false });
  if (noteType) q = q.eq("note_type", noteType);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    employee_id: row.employee_id,
    note: row.note,
    note_type: row.note_type,
    created_by: row.created_by ?? null,
    created_at: row.created_at,
  }));
}

export async function addEmployeeNote(params: {
  employee_id: string;
  note: string;
  note_type: NoteType;
  created_by?: string | null;
}): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("employee_notes").insert(params).select("id").single();
  if (error) throw error;
  return data.id;
}

// ——— Disponibilité ———
export async function listEmployeeAvailability(employeeId: string): Promise<DbEmployeeAvailability[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employee_availability")
    .select("*")
    .eq("employee_id", employeeId)
    .order("weekday");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    employee_id: row.employee_id,
    weekday: row.weekday,
    is_available: row.is_available ?? true,
    start_time: row.start_time ?? null,
    end_time: row.end_time ?? null,
    notes: row.notes ?? null,
  }));
}

export async function upsertEmployeeAvailability(
  employeeId: string,
  rows: { weekday: number; is_available: boolean; start_time?: string | null; end_time?: string | null; notes?: string | null }[]
): Promise<void> {
  const supabase = await createClient();
  for (const r of rows) {
    await supabase.from("employee_availability").upsert(
      { employee_id: employeeId, weekday: r.weekday, is_available: r.is_available, start_time: r.start_time ?? null, end_time: r.end_time ?? null, notes: r.notes ?? null },
      { onConflict: "employee_id,weekday" }
    );
  }
}

// ——— Certifications ———
export async function listEmployeeCertifications(employeeId: string): Promise<DbEmployeeCertification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employee_certifications")
    .select("*")
    .eq("employee_id", employeeId)
    .order("expires_at", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    employee_id: row.employee_id,
    certification_name: row.certification_name,
    issuer: row.issuer ?? null,
    issued_at: row.issued_at ?? null,
    expires_at: row.expires_at ?? null,
    status: row.status,
    document_id: row.document_id ?? null,
    created_at: row.created_at,
  }));
}

export async function addEmployeeCertification(params: {
  employee_id: string;
  certification_name: string;
  issuer?: string | null;
  issued_at?: string | null;
  expires_at?: string | null;
  status?: CertificationStatus;
  document_id?: string | null;
}): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employee_certifications")
    .insert({
      employee_id: params.employee_id,
      certification_name: params.certification_name,
      issuer: params.issuer ?? null,
      issued_at: params.issued_at ?? null,
      expires_at: params.expires_at ?? null,
      status: params.status ?? "Valide",
      document_id: params.document_id ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

// ——— Assignations projets (via projects db) ———
export async function listEmployeeAssignments(employeeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_assignments")
    .select("*, projects(id, title, status, address)")
    .eq("employee_id", employeeId)
    .order("assigned_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ——— Briefs assignés ———
export async function listEmployeeBriefs(employeeId: string) {
  const supabase = await createClient();
  const { data: assignments } = await supabase.from("brief_assignments").select("brief_id").eq("employee_id", employeeId);
  const briefIds = (assignments ?? []).map((a) => a.brief_id as string);
  if (briefIds.length === 0) return [];
  const { data, error } = await supabase.from("briefs").select("*, projects(id, title)").in("id", briefIds).order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ——— Pointage ———
export async function listEmployeeTimesheets(employeeId: string, opts?: { from?: string; to?: string; limit?: number }) {
  const { listTimesheets } = await import("@/lib/db/timesheets");
  return listTimesheets({ employee_id: employeeId, from: opts?.from, to: opts?.to, limit: opts?.limit ?? 50 });
}
