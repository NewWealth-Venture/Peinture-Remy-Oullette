import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { listAnnouncements } from "@/lib/db/announcements";
import { AnnoncesClient } from "./AnnoncesClient";

export default async function AccueilAnnoncesPage() {
  const announcements = await listAnnouncements(50);

  return (
    <div className="p-6">
      <PageHeader title="Annonces" subtitle="Notes internes et communication." />
      <AnnoncesClient initialAnnouncements={announcements} />
    </div>
  );
}
