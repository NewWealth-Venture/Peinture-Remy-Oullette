import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

/** Redirige vers /login si non connecté ou sans profil actif. Retourne le profil. Si connecté mais pas de profil, déconnecte d'abord pour éviter une boucle de redirection. */
export async function requireProfile(): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(LOGIN_PATH);
  }
  const profile = await getCurrentProfile();
  if (profile) {
    return profile;
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(LOGIN_PATH);
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
