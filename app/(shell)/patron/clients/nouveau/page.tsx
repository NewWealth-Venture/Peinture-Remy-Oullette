"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Field } from "@/components/ui/Field";
import { createClientAction } from "@/app/actions/data";
import { ArrowLeft } from "lucide-react";

const inputClass =
  "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

export default function NouveauClientPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Le nom affiché est requis.");
      return;
    }
    setSaving(true);
    const result = await createClientAction({
      source: "internal",
      display_name: displayName.trim(),
      company_name: companyName.trim() || null,
      primary_email: primaryEmail.trim() || null,
      primary_phone: primaryPhone.trim() || null,
    });
    setSaving(false);
    if (result.success && result.id) {
      router.push(`/patron/clients/${result.id}`);
    } else if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-w-0">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/patron/clients"
          className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-subtle focus-ring"
          aria-label="Retour"
        >
          <ArrowLeft size={20} strokeWidth={1.7} />
        </Link>
        <PageHeader title="Nouveau client" subtitle="Créer un client interne (hors QuickBooks)." />
      </div>

      <form onSubmit={handleSubmit} className="bg-neutral-white border border-neutral-border rounded-lg p-6 max-w-lg">
        <div className="flex flex-col gap-4">
          <Field label="Nom affiché" required error={error}>
            <input
              type="text"
              className={inputClass}
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setError(""); }}
              placeholder="Ex. Jean Dupont"
            />
          </Field>
          <Field label="Entreprise">
            <input
              type="text"
              className={inputClass}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex. Entreprise Dupont inc."
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputClass}
              value={primaryEmail}
              onChange={(e) => setPrimaryEmail(e.target.value)}
              placeholder="contact@exemple.com"
            />
          </Field>
          <Field label="Téléphone">
            <input
              type="tel"
              className={inputClass}
              value={primaryPhone}
              onChange={(e) => setPrimaryPhone(e.target.value)}
              placeholder="(514) 555-1234"
            />
          </Field>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-4 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring disabled:opacity-60"
              style={{ borderRadius: "6px" }}
            >
              {saving ? "Création…" : "Créer le client"}
            </button>
            <Link
              href="/patron/clients"
              className="h-9 px-4 flex items-center text-caption font-medium border border-neutral-border rounded bg-neutral-white text-neutral-text hover:bg-neutral-bg-subtle focus-ring"
              style={{ borderRadius: "6px" }}
            >
              Annuler
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
