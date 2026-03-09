import { requireRole } from "@/lib/auth/guards";
import { notFound } from "next/navigation";
import { getClientById, listClientNotes, listClientActivity } from "@/lib/db/clients";
import { listProjectsByClientId } from "@/lib/db/projects";
import { ClientDetailHeader } from "./ClientDetailHeader";
import { ClientDetailContent } from "./ClientDetailContent";

export default async function PatronClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("patron");
  const { id } = await params;
  const [client, notes, activity, projects] = await Promise.all([
    getClientById(id),
    listClientNotes(id),
    listClientActivity(id),
    listProjectsByClientId(id),
  ]);
  if (!client) notFound();
  return (
    <div className="min-w-0">
      <ClientDetailHeader client={client} />
      <ClientDetailContent client={client} notes={notes} activity={activity} projects={projects} />
    </div>
  );
}
