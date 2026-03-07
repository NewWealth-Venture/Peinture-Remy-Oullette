"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

export default function AccesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/acces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Code incorrect.");
        return;
      }
      router.push(from);
      router.refresh();
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg-subtle px-4">
      <div className="w-full max-w-sm bg-neutral-white border border-neutral-border rounded-lg shadow-sm p-6">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary-blue/10 flex items-center justify-center">
            <Lock className="text-primary-blue" size={24} strokeWidth={1.7} />
          </div>
        </div>
        <h1 className="text-center font-heading font-semibold text-neutral-text text-lg mb-1">
          Accès privé
        </h1>
        <p className="text-center text-caption text-neutral-text-secondary mb-6">
          Entrez le code d&apos;accès pour continuer.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            autoComplete="current-password"
            className="w-full h-10 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none"
            placeholder="Code d'accès"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {error && (
            <p className="text-caption text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring disabled:opacity-50"
          >
            {loading ? "Vérification…" : "Accéder"}
          </button>
        </form>
      </div>
    </div>
  );
}
