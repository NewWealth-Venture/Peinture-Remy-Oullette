export function formatToolResult(type: string, data: unknown): string {
  if (data == null) return "Aucune donnée.";
  if (Array.isArray(data)) {
    if (data.length === 0) return "Aucun enregistrement.";
    return JSON.stringify(data, null, 0).slice(0, 8000);
  }
  return JSON.stringify(data, null, 0).slice(0, 8000);
}
