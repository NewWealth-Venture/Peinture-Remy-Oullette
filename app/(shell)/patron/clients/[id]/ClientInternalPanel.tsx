"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/SectionCard";
import type { DbClient, DbClientNote } from "@/lib/db/clients";
import { updateClientInternalAction, addClientNoteAction } from "@/app/actions/data";
import { StickyNote, User, Tag, RefreshCw } from "lucide-react";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" });
}

const STATUS_OPTIONS = ["Nouveau", "Actif", "À relancer", "VIP", "Inactif"] as const;

export function ClientInternalPanel({ client, notes }: { client: DbClient; notes: DbClientNote[] }) {
  const router = useRouter();
  const [internalNotes, setInternalNotes] = useState(client.internal_notes ?? "");
  const [internalStatus, setInternalStatus] = useState(client.internal_status ?? "");
  const [assignedTo, setAssignedTo] = useState(client.assigned_to ?? "");
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);

  const saveInternal = async () => {
    setSaving(true);
    const r = await updateClientInternalAction(client.id, {
      internal_notes: internalNotes || null,
      internal_status: (internalStatus || null) as DbClient["internal_status"],
      assigned_to: assignedTo || null,
    });
    setSaving(false);
    if (r.success) router.refresh();
  };

  const addNote = async () => {
    const text = newNote.trim();
    if (!text) return;
    setSaving(true);
    const r = await addClientNoteAction(client.id, text);
    setSaving(false);
    if (r.success) {
      setNewNote("");
      router.refresh();
    }
  };

  return (
    <>
      <SectionCard title="Notes internes" description="Non synchronisées avec QuickBooks">
        <div className="space-y-3">
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            onBlur={saveInternal}
            placeholder="Notes internes…"
            rows={4}
            className="w-full px-3 py-2 border border-neutral-border rounded text-caption text-neutral-text bg-neutral-white focus:ring-2 focus:ring-primary-blue/20 focus:border-transparent"
            style={{ borderRadius: "6px" }}
          />
          <div className="border-t border-neutral-border pt-3">
            <p className="text-caption-xs text-neutral-text-secondary mb-2">Ajouter une note</p>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Nouvelle note…"
              rows={2}
              className="w-full px-3 py-2 border border-neutral-border rounded text-caption text-neutral-text bg-neutral-bg-subtle focus:ring-2 focus:ring-primary-blue/20 mb-2"
              style={{ borderRadius: "6px" }}
            />
            <button
              type="button"
              onClick={addNote}
              disabled={saving || !newNote.trim()}
              className="h-9 px-3 text-caption font-medium border border-neutral-border rounded bg-neutral-white hover:bg-neutral-bg-subtle focus-ring disabled:opacity-60"
              style={{ borderRadius: "6px" }}
            >
              <StickyNote size={14} className="inline mr-1.5" /> Ajouter
            </button>
          </div>
          {notes.length > 0 && (
            <ul className="space-y-2 mt-3 border-t border-neutral-border pt-3">
              {notes.slice(0, 5).map((n) => (
                <li key={n.id} className="text-caption text-neutral-text border-l-2 border-neutral-border pl-2">
                  {n.note}
                  <span className="text-caption-xs text-neutral-text-secondary block mt-0.5">{formatDate(n.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Statut interne">
        <select
          value={internalStatus}
          onChange={(e) => {
            setInternalStatus(e.target.value);
            updateClientInternalAction(client.id, { internal_status: (e.target.value || null) as DbClient["internal_status"] }).then((r) => r.success && router.refresh());
          }}
          className="w-full h-9 px-3 border border-neutral-border rounded text-caption text-neutral-text bg-neutral-white focus:ring-2 focus:ring-primary-blue/20"
          style={{ borderRadius: "6px" }}
        >
          <option value="">—</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </SectionCard>

      <SectionCard title="Tags internes">
        <div className="flex flex-wrap gap-1.5">
          {(client.internal_tags ?? []).map((t) => (
            <span
              key={t}
              className="inline-flex px-2 py-0.5 rounded text-caption-xs font-medium bg-neutral-bg-subtle text-neutral-text"
              style={{ borderRadius: "4px" }}
            >
              {t}
            </span>
          ))}
          {(!client.internal_tags || client.internal_tags.length === 0) && (
            <span className="text-caption text-neutral-text-secondary">Aucun tag</span>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Assignation">
        <input
          type="text"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          onBlur={saveInternal}
          placeholder="Responsable du compte"
          className="w-full h-9 px-3 border border-neutral-border rounded text-caption text-neutral-text bg-neutral-white focus:ring-2 focus:ring-primary-blue/20"
          style={{ borderRadius: "6px" }}
        />
      </SectionCard>

      <SectionCard title="Synchronisation" description="Données QuickBooks">
        <dl className="space-y-1.5 text-caption">
          <div className="flex justify-between gap-2">
            <dt className="text-neutral-text-secondary">Source</dt>
            <dd className="text-neutral-text">{client.source === "quickbooks" ? "QuickBooks" : "Interne"}</dd>
          </div>
          {client.quickbooks_customer_id && (
            <div className="flex justify-between gap-2">
              <dt className="text-neutral-text-secondary">ID QuickBooks</dt>
              <dd className="text-neutral-text font-mono text-caption-xs truncate" title={client.quickbooks_customer_id}>
                {client.quickbooks_customer_id}
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-2">
            <dt className="text-neutral-text-secondary">Dernière synchro</dt>
            <dd className="text-neutral-text">{client.last_synced_at ? formatDate(client.last_synced_at) : "—"}</dd>
          </div>
        </dl>
      </SectionCard>
    </>
  );
}
