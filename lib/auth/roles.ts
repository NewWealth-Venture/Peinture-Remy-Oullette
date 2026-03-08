export type AppRole = "patron" | "employe";

export const ROLES: Record<AppRole, AppRole> = {
  patron: "patron",
  employe: "employe",
};

export function isPatron(role: string | null | undefined): role is "patron" {
  return role === "patron";
}

export function isEmploye(role: string | null | undefined): role is "employe" {
  return role === "employe";
}

export function isValidRole(role: string | null | undefined): role is AppRole {
  return role === "patron" || role === "employe";
}
