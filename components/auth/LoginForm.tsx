"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "./AuthCard";

const ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "Email ou mot de passe incorrect.",
  "Email not confirmed": "Veuillez confirmer votre adresse email.",
  "User not found": "Email ou mot de passe incorrect.",
  "Invalid email or password": "Email ou mot de passe incorrect.",
  "Too many requests": "Trop de tentatives. Réessayez plus tard.",
};

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof (error as { message: string }).message === "string") {
    const msg = (error as { message: string }).message;
    return ERROR_MESSAGES[msg] ?? msg;
  }
  return "Une erreur est survenue. Veuillez réessayer.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/accueil/overview";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error: signError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signError) {
        setError(getErrorMessage(signError));
        return;
      }
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("active")
          .eq("id", data.user.id)
          .maybeSingle();
        if (profile && profile.active === false) {
          await supabase.auth.signOut();
          setError("Ce compte est désactivé.");
          return;
        }
        if (profileError) {
          setError("Profil inaccessible. Vérifiez que la table profiles existe et que votre compte a un profil.");
          return;
        }
        router.push(from);
        router.refresh();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <h1 className="text-center font-heading font-semibold text-neutral-text text-xl mb-1">
        Connexion
      </h1>
      <p className="text-center text-caption text-neutral-text-secondary mb-6">
        Accédez au centre de gestion.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-caption font-medium text-neutral-text mb-1.5">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            className="w-full min-h-[44px] px-3 border border-neutral-border rounded-lg bg-neutral-white text-body text-neutral-text placeholder:text-neutral-text-secondary focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-caption font-medium text-neutral-text mb-1.5">
            Mot de passe
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full min-h-[44px] px-3 border border-neutral-border rounded-lg bg-neutral-white text-body text-neutral-text placeholder:text-neutral-text-secondary focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <p className="text-caption text-red-600" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] text-caption font-medium text-white bg-primary-orange rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-orange/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </AuthCard>
  );
}
