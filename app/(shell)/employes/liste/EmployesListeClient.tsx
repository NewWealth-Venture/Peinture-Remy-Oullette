"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/SectionCard";
import { TableShell } from "@/components/TableShell";
import { EmptyState } from "@/components/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { createEmployeeAction, updateEmployeeAction, deleteEmployeeAction } from "@/app/actions/data";
import type { DbEmployee } from "@/lib/db/employees";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";

const inputClass =
  "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

export function EmployesListeClient({ initialEmployees }: { initialEmployees: DbEmployee[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DbEmployee | null>(null);
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setFullName("");
    setRole("");
    setPhone("");
    setActive(true);
    setModalOpen(true);
  };

  const openEdit = (e: DbEmployee) => {
    setEditing(e);
    setFullName(e.full_name);
    setRole(e.role ?? "");
    setPhone(e.phone ?? "");
    setActive(e.active);
    setModalOpen(true);
  };

  const save = async () => {
    if (!fullName.trim()) return;
    setSaving(true);
    if (editing) {
      const r = await updateEmployeeAction(editing.id, { full_name: fullName.trim(), role: role.trim() || null, phone: phone.trim() || null, active });
      if (r.success) router.refresh();
    } else {
      const r = await createEmployeeAction({ full_name: fullName.trim(), role: role.trim() || null, phone: phone.trim() || null, active });
      if (r.success) router.refresh();
    }
    setSaving(false);
    setModalOpen(false);
  };

  const remove = async (id: string) => {
    if (typeof window !== "undefined" && !window.confirm("Supprimer cet employé ?")) return;
    setDeletingId(id);
    const r = await deleteEmployeeAction(id);
    setDeletingId(null);
    if (r.success) router.refresh();
  };

  const columns = ["Nom", "Poste", "Téléphone", "Statut", "Actions"];

  return (
    <>
      <SectionCard
        title="Effectif"
        actions={
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-1.5 h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring"
          >
            <Plus size={18} strokeWidth={1.7} /> Nouveau
          </button>
        }
      >
        {initialEmployees.length === 0 ? (
          <EmptyState icon={Users} title="Aucun employé" description="Ajoutez un employé pour commencer." />
        ) : (
          <TableShell columns={columns}>
            {initialEmployees.map((e) => (
              <tr key={e.id} className="border-b border-neutral-border hover:bg-neutral-bg-subtle">
                <td className="py-3 px-4 font-medium text-neutral-text">{e.full_name}</td>
                <td className="py-3 px-4 text-caption text-neutral-text-secondary">{e.role ?? "—"}</td>
                <td className="py-3 px-4 text-caption text-neutral-text-secondary">{e.phone ?? "—"}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-0.5 rounded text-caption-xs font-medium ${e.active ? "bg-green-50 text-green-800" : "bg-neutral-bg-subtle text-neutral-text-secondary"}`}>
                    {e.active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => openEdit(e)} className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-active focus-ring" aria-label="Modifier">
                      <Pencil size={16} strokeWidth={1.7} />
                    </button>
                    <button type="button" onClick={() => remove(e.id)} disabled={deletingId === e.id} className="p-2 rounded text-neutral-text-secondary hover:bg-red-50 hover:text-red-600 focus-ring" aria-label="Supprimer">
                      <Trash2 size={16} strokeWidth={1.7} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </TableShell>
        )}
      </SectionCard>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier l'employé" : "Nouvel employé"} maxWidth="md">
        <div className="p-4 space-y-4">
          <Field label="Nom complet" required>
            <input type="text" className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nom complet" />
          </Field>
          <Field label="Poste / Rôle">
            <input type="text" className={inputClass} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex. Peintre, Chef d'équipe" />
          </Field>
          <Field label="Téléphone">
            <input type="text" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Téléphone" />
          </Field>
          {editing && (
            <Field label="Statut">
              <label className="flex items-center gap-2 text-caption">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                Actif
              </label>
            </Field>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="h-9 px-3.5 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded focus-ring">
              Annuler
            </button>
            <button type="button" onClick={save} disabled={saving || !fullName.trim()} className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded focus-ring disabled:opacity-50">
              {editing ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
