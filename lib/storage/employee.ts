import { createClient } from "@/lib/supabase/server";
import type { DocumentType } from "@/lib/db/employees";

const PHOTOS_BUCKET = "employee-photos";
const DOCUMENTS_BUCKET = "employee-documents";

function getPublicUrl(bucket: string, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

/** Upload la photo employé, met à jour employees.photo_url, retourne l’URL publique. */
export async function uploadEmployeePhoto(employeeId: string, file: File): Promise<{ url: string; path: string }> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${employeeId}/photo.${ext}`;
  const { error: uploadError } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: true,
  });
  if (uploadError) throw uploadError;
  const url = getPublicUrl(PHOTOS_BUCKET, path);
  await supabase.from("employees").update({ photo_url: url }).eq("id", employeeId);
  return { url, path };
}

/** Upload un document employé vers Storage et crée la ligne employee_documents. Retourne l’id du document et l’URL. */
export async function uploadEmployeeDocument(
  employeeId: string,
  file: File,
  params: { document_type: DocumentType; title: string; expires_at?: string | null; notes?: string | null }
): Promise<{ documentId: string; url: string; path: string }> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "bin";
  const path = `${employeeId}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw uploadError;
  const url = getPublicUrl(DOCUMENTS_BUCKET, path);
  const { addEmployeeDocument } = await import("@/lib/db/employees");
  const documentId = await addEmployeeDocument({
    employee_id: employeeId,
    document_type: params.document_type,
    title: params.title,
    file_path: path,
    file_name: file.name,
    notes: params.notes ?? null,
    expires_at: params.expires_at ?? null,
  });
  return { documentId, url, path };
}

export { getEmployeePhotoUrl, getEmployeeDocumentUrl } from "./employee-urls";
