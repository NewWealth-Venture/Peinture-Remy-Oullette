"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { changeCurrentUserPassword } from "@/lib/auth/password";

type FieldError = string | null;

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [currentError, setCurrentError] = useState<FieldError>(null);
  const [newError, setNewError] = useState<FieldError>(null);
  const [confirmError, setConfirmError] = useState<FieldError>(null);

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
    setCurrentError(null);
    setNewError(null);
    setConfirmError(null);
  };

  const validate = (): boolean => {
    let valid = true;
    setCurrentError(null);
    setNewError(null);
    setConfirmError(null);
    setError(null);

    if (!currentPassword.trim()) {
      setCurrentError("Veuillez entrer votre mot de passe actuel.");
      valid = false;
    }
    if (!newPassword.trim()) {
      setNewError("Le nouveau mot de passe est requis.");
      valid = false;
    } else if (newPassword.trim().length < 8) {
      setNewError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      valid = false;
    }
    if (!confirmPassword.trim()) {
      setConfirmError("Veuillez confirmer le nouveau mot de passe.");
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmError("La confirmation ne correspond pas au nouveau mot de passe.");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    resetMessages();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      // Supabase Auth ne permet pas de vérifier le mot de passe actuel côté client
      // sans nouvelle connexion. Ici on effectue une re-auth simple.
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
        return;
      }

      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email ?? "",
        password: currentPassword,
      });

      if (reauthError) {
        setCurrentError("Le mot de passe actuel est incorrect.");
        return;
      }

      const result = await changeCurrentUserPassword(newPassword);
      if (!result.success) {
        if (result.code === "session_expired" || result.code === "not_authenticated") {
          setError("Votre session a expiré. Veuillez vous reconnecter.");
        } else {
          setError(result.message || "Impossible de mettre à jour le mot de passe.");
        }
        return;
      }

      setSuccess("Le mot de passe a été mis à jour avec succès.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full min-h-[44px] px-3 border border-neutral-border rounded-lg bg-neutral-white text-body text-neutral-text placeholder:text-neutral-text-secondary focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

  const labelClass = "block text-caption font-medium text-neutral-text mb-1.5";

  return (
    <section aria-labelledby="security-password-section">
      <div className="border border-neutral-border rounded-xl bg-neutral-white shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-neutral-border flex items-start gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-blue/10 text-primary-blue shrink-0">
            <Lock size={18} strokeWidth={1.7} />
          </span>
          <div className="min-w-0">
            <h2 id="security-password-section" className="font-heading text-body font-semibold text-neutral-text">
              Mot de passe
            </h2>
            <p className="text-caption text-neutral-text-secondary mt-0.5">
              Mettez à jour votre mot de passe pour sécuriser votre compte.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 sm:px-5 py-4 space-y-4">
          <div>
            <label htmlFor="current-password" className={labelClass}>
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                id="current-password"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                className={`${inputClass} pr-10`}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                aria-invalid={currentError ? "true" : "false"}
                aria-describedby={currentError ? "current-password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center justify-center px-1 text-neutral-text-secondary hover:text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary-blue/20 rounded"
                aria-label={showCurrent ? "Masquer le mot de passe actuel" : "Afficher le mot de passe actuel"}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {currentError && (
              <p id="current-password-error" className="mt-1 text-caption text-red-600" role="alert">
                {currentError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="new-password" className={labelClass}>
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                className={`${inputClass} pr-10`}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-invalid={newError ? "true" : "false"}
                aria-describedby={newError ? "new-password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center justify-center px-1 text-neutral-text-secondary hover:text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary-blue/20 rounded"
                aria-label={showNew ? "Masquer le nouveau mot de passe" : "Afficher le nouveau mot de passe"}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {newError && (
              <p id="new-password-error" className="mt-1 text-caption text-red-600" role="alert">
                {newError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className={labelClass}>
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                className={`${inputClass} pr-10`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={confirmError ? "true" : "false"}
                aria-describedby={confirmError ? "confirm-password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center justify-center px-1 text-neutral-text-secondary hover:text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary-blue/20 rounded"
                aria-label={showConfirm ? "Masquer la confirmation du mot de passe" : "Afficher la confirmation du mot de passe"}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmError && (
              <p id="confirm-password-error" className="mt-1 text-caption text-red-600" role="alert">
                {confirmError}
              </p>
            )}
          </div>

          {error && !currentError && !newError && !confirmError && (
            <p className="text-caption text-red-600" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-caption text-emerald-600" role="status">
              {success}
            </p>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-lg bg-primary-orange text-caption font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-orange/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Mise à jour…" : "Mettre à jour le mot de passe"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

