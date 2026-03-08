import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentProfile, type Profile } from "@/lib/auth/auth";
import type { AppRole } from "@/lib/auth/roles";

const LOGIN_PATH = "/login";
const DEFAULT_REDIRECT = "/accueil/overview";

/** Redirige vers /login si non connecté. Retourne l'utilisateur. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(LOGIN_PATH);
  }
  return user;
}

/** Redirige vers /login si non connecté ou sans profil actif. Retourne le profil. */
export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(LOGIN_PATH);
  }
  return profile;
}

/** Redirige vers l'app si déjà connecté (pour la page login). */
export async function redirectIfAuthenticated() {
  const user = await getCurrentUser();
  if (user) {
    redirect(DEFAULT_REDIRECT);
  }
}

/** Exige un rôle parmi ceux autorisés. Sinon redirige vers /accueil/overview. */
export async function requireRole(allowed: AppRole | AppRole[]): Promise<Profile> {
  const profile = await requireProfile();
  const allowedList = Array.isArray(allowed) ? allowed : [allowed];
  if (!allowedList.includes(profile.role)) {
    redirect(DEFAULT_REDIRECT);
  }
  return profile;
}
