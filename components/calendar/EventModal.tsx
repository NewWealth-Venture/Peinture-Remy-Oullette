"use client";

import { useState, useEffect } from "react";
import type { CalendarEvent, CalendarEventType } from "@/types/calendar";
import { X, Trash2 } from "lucide-react";

const TYPES: CalendarEventType[] = ["Chantier", "Rendez-vous", "Interne"];

function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

function fromISO(iso: string): Date {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? new Date() : d;
}

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  initialEvent: CalendarEvent | null;
  onSave: (data: Omit<CalendarEvent, "id"> | Partial<CalendarEvent>) => void;
  onDelete?: () => void;
}

export function EventModal({
  open,
  onClose,
  initialEvent,
  onSave,
  onDelete,
}: EventModalProps) {
  const isEdit = Boolean(initialEvent?.id);
  const [titre, setTitre] = useState("");
  const [type, setType] = useState<CalendarEventType>("Rendez-vous");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [chantier, setChantier] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (initialEvent) {
      setTitre(initialEvent.titre);
      setType(initialEvent.type);
      setDateDebut(toLocalISO(fromISO(initialEvent.dateDebut)));
      setDateFin(toLocalISO(fromISO(initialEvent.dateFin)));
      setChantier(initialEvent.chantier ?? "");
      setNotes(initialEvent.notes ?? "");
    } else {
      const now = new Date();
      const end = new Date(now);
      end.setHours(end.getHours() + 1);
      setTitre("");
      setType("Rendez-vous");
      setDateDebut(toLocalISO(now));
      setDateFin(toLocalISO(end));
      setChantier("");
      setNotes("");
    }
    setErrors({});
  }, [open, initialEvent]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!titre.trim()) e.titre = "Le titre est requis.";
    const start = new Date(dateDebut).getTime();
    const end = new Date(dateFin).getTime();
    if (isNaN(start)) e.dateDebut = "Date de début invalide.";
    if (isNaN(end)) e.dateFin = "Date de fin invalide.";
    if (!e.dateDebut && !e.dateFin && end <= start) e.dateFin = "La fin doit être après le début.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    if (isEdit && initialEvent) {
      onSave({
        titre: titre.trim(),
        type,
        dateDebut: debut.toISOString(),
        dateFin: fin.toISOString(),
        chantier: chantier.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      onSave({
        titre: titre.trim(),
        type,
        dateDebut: debut.toISOString(),
        dateFin: fin.toISOString(),
        chantier: chantier.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30" onClick={onClose}>
      <div
        className="bg-neutral-white border border-neutral-border rounded shadow-sm w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-border">
          <h2 className="text-section-title text-neutral-text">
            {isEdit ? "Modifier l'événement" : "Nouvel événement"}
          </h2>
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-2 text-neutral-text-secondary hover:text-red-600 hover:bg-neutral-bg-active rounded focus-ring"
                aria-label="Supprimer"
              >
                <Trash2 size={18} strokeWidth={1.7} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-text-secondary hover:bg-neutral-bg-active rounded focus-ring"
              aria-label="Fermer"
            >
              <X size={18} strokeWidth={1.7} />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div>
            <label htmlFor="event-titre" className="block text-caption font-medium text-neutral-text mb-1">
              Titre *
            </label>
            <input
              id="event-titre"
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none"
              placeholder="Ex. Réunion chantier X"
            />
            {errors.titre && <p className="text-caption-xs text-red-600 mt-0.5">{errors.titre}</p>}
          </div>
          <div>
            <label htmlFor="event-type" className="block text-caption font-medium text-neutral-text mb-1">
              Type
            </label>
            <select
              id="event-type"
              value={type}
              onChange={(e) => setType(e.target.value as CalendarEventType)}
              className="w-full h-9 px-3 border border-neutral-border rounded bg-neutral-bg-subtle text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="event-debut" className="block text-caption font-medium text-neutral-text mb-1">
                Début *
              </label>
              <input
                id="event-debut"
                type="datetime-local"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none"
              />
              {errors.dateDebut && <p className="text-caption-xs text-red-600 mt-0.5">{errors.dateDebut}</p>}
            </div>
            <div>
              <label htmlFor="event-fin" className="block text-caption font-medium text-neutral-text mb-1">
                Fin *
              </label>
              <input
                id="event-fin"
                type="datetime-local"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none"
              />
              {errors.dateFin && <p className="text-caption-xs text-red-600 mt-0.5">{errors.dateFin}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="event-chantier" className="block text-caption font-medium text-neutral-text mb-1">
              Chantier (optionnel)
            </label>
            <input
              id="event-chantier"
              type="text"
              value={chantier}
              onChange={(e) => setChantier(e.target.value)}
              className="w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none"
              placeholder="Nom du chantier"
            />
          </div>
          <div>
            <label htmlFor="event-notes" className="block text-caption font-medium text-neutral-text mb-1">
              Notes (optionnel)
            </label>
            <textarea
              id="event-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none resize-none"
              placeholder="Notes..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3.5 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded hover:bg-neutral-bg-active focus-ring"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange border border-primary-orange rounded hover:opacity-90 focus-ring"
            >
              {isEdit ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
