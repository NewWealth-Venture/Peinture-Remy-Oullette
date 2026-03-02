export type CalendarEventType = "Chantier" | "Rendez-vous" | "Interne";

export type CalendarEvent = {
  id: string;
  titre: string;
  type: CalendarEventType;
  dateDebut: string;
  dateFin: string;
  projetId?: string;
  chantier?: string;
  notes?: string;
};
