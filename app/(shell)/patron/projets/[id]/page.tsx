import Link from "next/link";
import { getProjectFull } from "@/lib/db/projects";
import { listInventoryItems } from "@/lib/db/inventory";
import { ProjetDetailClient } from "./ProjetDetailClient";

export default async function ProjetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [projet, items] = await Promise.all([
    getProjectFull(id),
    listInventoryItems(true),
  ]);

  if (!projet) {
    return (
      <div className="p-6 max-w-[1180px] mx-auto">
        <p className="text-caption text-neutral-text-secondary">Projet introuvable.</p>
        <Link href="/patron/projets" className="text-primary-blue hover:underline mt-2 inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const inventaire = items.map((i) => ({ id: i.id, name: i.name, unit: i.unit }));

  return <ProjetDetailClient projet={projet} inventaire={inventaire} />;
}
