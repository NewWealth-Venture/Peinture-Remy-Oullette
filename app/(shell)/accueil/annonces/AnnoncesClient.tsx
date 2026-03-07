"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/SectionCard";
import { EmptyState } from "@/components/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { createAnnouncementAction, updateAnnouncementAction, deleteAnnouncementAction } from "@/app/actions/data";
import type { DbAnnouncement } from "@/lib/db/announcements";
import { Megaphone, Plus, Pencil, Trash2 } from "lucide-react";

const inputClass =
  "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("fr-CA", { dateStyle: "short" });
}

export function AnnoncesClient({ initialAnnouncements }: { initialAnnouncements: DbAnnouncement[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DbAnnouncement | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setTitle("");
    setContent("");
    setModalOpen(true);
  };

  const openEdit = (a: DbAnnouncement) => {
    setEditing(a);
    setTitle(a.title);
    setContent(a.content);
    setModalOpen(true);
  };

  const save = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    if (editing) {
      const r = await updateAnnouncementAction(editing.id, title.trim(), content.trim());
      if (r.success) router.refresh();
    } else {
      const r = await createAnnouncementAction(title.trim(), content.trim());
      if (r.success) router.refresh();
    }
    setSaving(false);
    setModalOpen(false);
  };

  const remove = async (id: string) => {
    if (typeof window !== "undefined" && !window.confirm("Supprimer cette annonce ?")) return;
    const r = await deleteAnnouncementAction(id);
    if (r.success) router.refresh();
  };

  return (
    <>
      <SectionCard
        title="Annonces"
        description="Notes et messages à l'équipe"
        actions={
          <button
            type="button"
            onClick={openNew}
            className="text-caption text-neutral-text-secondary px-3 py-1.5 border border-neutral-border rounded bg-neutral-bg-subtle hover:bg-neutral-bg-active focus-ring"
          >
            Nouvelle annonce
          </button>
        }
      >
        {initialAnnouncements.length === 0 ? (
          <EmptyState icon={Megaphone} title="Aucune annonce" description="Créez une annonce pour communiquer avec l'équipe." />
        ) : (
          <ul className="space-y-3">
            {initialAnnouncements.map((a) => (
              <li key={a.id} className="py-3 px-4 border border-neutral-border rounded hover:bg-neutral-bg-subtle">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-neutral-text">{a.title}</h3>
                    <p className="text-caption-xs text-neutral-text-secondary mt-0.5">{formatDate(a.created_at)}</p>
                    <p className="text-caption text-neutral-text mt-2 whitespace-pre-wrap">{a.content}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => openEdit(a)} className="p-2 rounded text-neutral-text-secondary hover:bg-neutral-bg-active focus-ring" aria-label="Modifier">
                      <Pencil size={16} strokeWidth={1.7} />
                    </button>
                    <button type="button" onClick={() => remove(a.id)} className="p-2 rounded text-neutral-text-secondary hover:bg-red-50 hover:text-red-600 focus-ring" aria-label="Supprimer">
                      <Trash2 size={16} strokeWidth={1.7} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier l'annonce" : "Nouvelle annonce"} maxWidth="md">
        <div className="p-4 space-y-4">
          <Field label="Titre" required>
            <input type="text" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" />
          </Field>
          <Field label="Contenu" required>
            <textarea className={inputClass + " min-h-[120px] resize-y py-2"} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Contenu de l'annonce..." />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="h-9 px-3.5 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded focus-ring">
              Annuler
            </button>
            <button type="button" onClick={save} disabled={saving || !title.trim() || !content.trim()} className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded focus-ring disabled:opacity-50">
              {editing ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
