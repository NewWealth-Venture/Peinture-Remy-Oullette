"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Field } from "@/components/ui/Field";
import { createEmployeeAction } from "@/app/actions/data";
import type { EmploymentType, EmploymentStatus } from "@/lib/db/employees";
import { ArrowLeft } from "lucide-react";

const inputClass =
  "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

const EMPLOYMENT_TYPES: EmploymentType[] = ["Temps plein", "Temps partiel", "Contractuel", "Saisonnier", "Apprenti"];
const EMPLOYMENT_STATUSES: EmploymentStatus[] = ["Actif", "En congé", "Suspendu", "Inactif"];

export default function NouveauEmployePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType | "">("Temps plein");
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>("Actif");
  const [hireDate, setHireDate] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const displayName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") || "Sans nom";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || displayName === "Sans nom") {
      setError("Le nom est requis.");
      return;
    }
    setSaving(true);
    const r = await createEmployeeAction({
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      full_name: displayName,
      email: email.trim() || null,
      phone: phone.trim() || null,
      role_title: roleTitle.trim() || null,
      employment_type: employmentType || null,
      employment_status: employmentStatus,
      hire_date: hireDate || null,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
      salary_amount: salaryAmount ? parseFloat(salaryAmount) : null,
      active: employmentStatus === "Actif",
    });
    setSaving(false);
    if (r.success && r.id) {
      router.push(`/patron/employes/${r.id}`);
    } else if (!r.success) {
      setError(r.error);
    }
  };

  return (
    <div className="min-w-0">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/patron/employes" className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-subtle focus-ring" aria-label="Retour">
          <ArrowLeft size={20} strokeWidth={1.7} />
        </Link>
        <PageHeader title="Ajouter un employé" subtitle="Créer un dossier employé." />
      </div>
      <form onSubmit={handleSubmit} className="bg-neutral-white border border-neutral-border rounded-lg p-6 max-w-lg">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prénom">
              <input type="text" className={inputClass} value={firstName} onChange={(e) => { setFirstName(e.target.value); setError(""); }} placeholder="Prénom" />
            </Field>
            <Field label="Nom" required error={error}>
              <input type="text" className={inputClass} value={lastName} onChange={(e) => { setLastName(e.target.value); setError(""); }} placeholder="Nom de famille" />
            </Field>
          </div>
          <Field label="Courriel">
            <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="courriel@exemple.com" />
          </Field>
          <Field label="Téléphone">
            <input type="tel" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(514) 555-1234" />
          </Field>
          <Field label="Poste / Rôle">
            <input type="text" className={inputClass} value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="Ex. Peintre" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type d'emploi">
              <select className={inputClass} value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType | "")}>
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Statut">
              <select className={inputClass} value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}>
                {EMPLOYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Date d'embauche">
            <input type="date" className={inputClass} value={hireDate} onChange={(e) => setHireDate(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Taux horaire ($)">
              <input type="number" step="0.01" min="0" className={inputClass} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Salaire fixe ($)">
              <input type="number" step="0.01" min="0" className={inputClass} value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} placeholder="0.00" />
            </Field>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="h-9 px-4 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring disabled:opacity-60" style={{ borderRadius: "6px" }}>
              {saving ? "Création…" : "Créer l'employé"}
            </button>
            <Link href="/patron/employes" className="h-9 px-4 flex items-center text-caption font-medium border border-neutral-border rounded bg-neutral-white text-neutral-text hover:bg-neutral-bg-subtle focus-ring" style={{ borderRadius: "6px" }}>
              Annuler
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
