import { createClient } from "@/lib/supabase/server";

export type ChangePasswordResult =
  | { success: true }
  | { success: false; code: "not_authenticated" | "session_expired" | "weak_password" | "network" | "unknown"; message: string };

export async function changeCurrentUserPassword(newPassword: string): Promise<ChangePasswordResult> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return {
        success: false,
        code: "session_expired",
        message: "Votre session a expiré. Veuillez vous reconnecter.",
      };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      if (error.message?.toLowerCase().includes("password")) {
        return {
          success: false,
          code: "weak_password",
          message: "Le nouveau mot de passe est trop faible ou invalide.",
        };
      }
      if (error.message?.toLowerCase().includes("session") || error.message?.toLowerCase().includes("expired")) {
        return {
          success: false,
          code: "session_expired",
          message: "Votre session a expiré. Veuillez vous reconnecter.",
        };
      }
      return {
        success: false,
        code: "unknown",
        message: "Impossible de mettre à jour le mot de passe.",
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      code: "network",
      message: "Une erreur réseau est survenue. Veuillez réessayer.",
    };
  }
}

