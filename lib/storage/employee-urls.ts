/** Helpers d’URL pour photos et documents employés. Utilisable côté client (pas d’import serveur). */

const PHOTOS_BUCKET = "employee-photos";
const DOCUMENTS_BUCKET = "employee-documents";

export function getEmployeePhotoUrl(photoUrlOrPath: string | null): string | null {
  if (!photoUrlOrPath) return null;
  if (photoUrlOrPath.startsWith("http")) return photoUrlOrPath;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${PHOTOS_BUCKET}/${photoUrlOrPath}`;
}

export function getEmployeeDocumentUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${DOCUMENTS_BUCKET}/${path}`;
}
