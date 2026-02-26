export type CalendarEventType = "Chantier" | "Rendez-vous" | "Interne";

export type CalendarEvent = {
  id: string;
  titre: string;
  type: CalendarEventType;
  dateDebut: string;
  dateFin: string;
  chantier?: string;
  notes?: string;
};
