import { requireRole } from "@/lib/auth/guards";
import { PageHeader } from "@/components/PageHeader";
import { listClients, type ListClientsFilters, type ListClientsSort } from "@/lib/db/clients";
import { ClientsToolbar } from "./ClientsToolbar";
import { ClientsTable } from "./ClientsTable";
import { EmptyState } from "@/components/EmptyState";
import { Users, Download, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";

type SearchParams = Promise<{
  search?: string;
  source?: string;
  status?: string;
  active?: string;
  sort?: string;
  asc?: string;
}>;

export default async function PatronClientsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireRole("patron");
  const params = await searchParams;

  const filters: ListClientsFilters = {};
  if (params.source === "quickbooks" || params.source === "internal") filters.source = params.source;
  if (params.status) filters.internal_status = params.status as ListClientsFilters["internal_status"];
  if (params.active === "1") filters.is_active = true;
  if (params.active === "0") filters.is_active = false;

  const sort = (params.sort as ListClientsSort) || "display_name";
  const ascending = params.asc !== "0";

  const clients = await listClients({
    search: params.search?.trim() || undefined,
    filters: Object.keys(filters).length ? filters : undefined,
    sort,
    ascending,
  });

  return (
    <div className="min-w-0">
      <PageHeader
        title="Clients"
        subtitle="Clients synchronisés depuis QuickBooks et suivi interne."
      />
      <ClientsToolbar currentParams={params} />
      {clients.length === 0 ? (
        <div className="border border-neutral-border rounded-lg bg-neutral-bg-subtle/30 py-10">
          <EmptyState
            icon={Users}
            title="Aucun client"
            description="Importez vos clients depuis QuickBooks ou ajoutez un client manuellement."
            cta={
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="inline-flex items-center gap-1.5 h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring">
                  <Download size={16} strokeWidth={1.7} /> Importer depuis QuickBooks
                </span>
                <Link
                  href="/patron/clients/nouveau"
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 text-caption font-medium border border-neutral-border rounded bg-neutral-white text-neutral-text hover:bg-neutral-bg-subtle focus-ring"
                >
                  <Plus size={16} strokeWidth={1.7} /> Nouveau client
                </Link>
              </div>
            }
          />
        </div>
      ) : (
        <ClientsTable clients={clients} />
      )}
    </div>
  );
}
