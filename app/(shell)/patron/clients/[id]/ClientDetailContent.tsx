import { SectionCard } from "@/components/SectionCard";
import Link from "next/link";
import type { DbClient, DbClientNote, DbClientActivity } from "@/lib/db/clients";
import type { DbProject } from "@/lib/db/projects";
import { ClientInternalPanel } from "./ClientInternalPanel";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" });
}

function formatCurrency(amount: number | null | undefined, currency?: string | null): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency: currency ?? "CAD" }).format(amount);
}

function formatAddress(addr: {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  region?: string | null;
  postal_code?: string | null;
  country?: string | null;
}): string {
  const parts = [
    addr.line1,
    addr.line2,
    [addr.city, addr.region].filter(Boolean).join(", "),
    addr.postal_code,
    addr.country,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

export function ClientDetailContent({
  client,
  notes,
  activity,
  projects,
}: {
  client: DbClient;
  notes: DbClientNote[];
  activity: DbClientActivity[];
  projects: DbProject[];
}) {
  const billingAddr = {
    line1: client.billing_address_line1,
    line2: client.billing_address_line2,
    city: client.billing_city,
    region: client.billing_region,
    postal_code: client.billing_postal_code,
    country: client.billing_country,
  };
  const shippingAddr = {
    line1: client.shipping_address_line1,
    line2: client.shipping_address_line2,
    city: client.shipping_city,
    region: client.shipping_region,
    postal_code: client.shipping_postal_code,
    country: client.shipping_country,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4 min-w-0">
        <SectionCard title="Résumé client" description="Données synchronisées depuis QuickBooks">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-caption">
            <dt className="text-neutral-text-secondary">Nom complet</dt>
            <dd className="text-neutral-text">{[client.given_name, client.family_name].filter(Boolean).join(" ") || "—"}</dd>
            {client.company_name && (
              <>
                <dt className="text-neutral-text-secondary">Entreprise</dt>
                <dd className="text-neutral-text">{client.company_name}</dd>
              </>
            )}
            {client.primary_email && (
              <>
                <dt className="text-neutral-text-secondary">Email</dt>
                <dd><a href={`mailto:${client.primary_email}`} className="text-primary-blue hover:underline truncate">{client.primary_email}</a></dd>
              </>
            )}
            {(client.primary_phone || client.mobile_phone) && (
              <>
                <dt className="text-neutral-text-secondary">Téléphone</dt>
                <dd className="text-neutral-text">{client.primary_phone ?? client.mobile_phone}</dd>
              </>
            )}
            {client.website && (
              <>
                <dt className="text-neutral-text-secondary">Site web</dt>
                <dd>
                  <a href={client.website.startsWith("http") ? client.website : `https://${client.website}`} target="_blank" rel="noopener noreferrer" className="text-primary-blue hover:underline truncate">
                    {client.website}
                  </a>
                </dd>
              </>
            )}
          </dl>
        </SectionCard>

        <SectionCard title="Facturation" description="Données synchronisées depuis QuickBooks">
          <div className="space-y-3 text-caption">
            <div>
              <p className="text-neutral-text-secondary text-caption-xs font-medium mb-0.5">Adresse de facturation</p>
              <p className="text-neutral-text">{formatAddress(billingAddr)}</p>
            </div>
            <div>
              <p className="text-neutral-text-secondary text-caption-xs font-medium mb-0.5">Adresse livraison / chantier</p>
              <p className="text-neutral-text">{formatAddress(shippingAddr)}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <span className="text-neutral-text-secondary">Modalités</span>
              <span className="text-neutral-text">{client.payment_terms ?? "—"}</span>
              <span className="text-neutral-text-secondary">Devise</span>
              <span className="text-neutral-text">{client.currency ?? "—"}</span>
              {client.tax_identifier && (
                <>
                  <span className="text-neutral-text-secondary">Identifiant fiscal</span>
                  <span className="text-neutral-text">{client.tax_identifier}</span>
                </>
              )}
            </div>
            <div>
              <span className="text-neutral-text-secondary">Solde / balance</span>
              <span className="ml-2 font-medium tabular-nums">{formatCurrency(client.balance ?? client.open_balance, client.currency)}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Projets liés"
          actions={
            <Link
              href={`/patron/projets/nouveau?client_id=${client.id}`}
              className="text-caption font-medium text-primary-blue hover:underline"
            >
              Nouveau projet
            </Link>
          }
        >
          {projects.length === 0 ? (
            <p className="text-caption text-neutral-text-secondary">Aucun projet lié.</p>
          ) : (
            <ul className="space-y-1.5">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link href={`/patron/projets/${p.id}`} className="text-caption text-primary-blue hover:underline focus-ring rounded">
                    {p.title}
                  </Link>
                  <span className="text-caption-xs text-neutral-text-secondary ml-2">{p.status}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Estimés & factures" description="À venir">
          <p className="text-caption text-neutral-text-secondary">Aucun estimé ni facture pour l’instant.</p>
        </SectionCard>

        <SectionCard title="Activité récente">
          {activity.length === 0 ? (
            <p className="text-caption text-neutral-text-secondary">Aucune activité.</p>
          ) : (
            <ul className="space-y-2">
              {activity.map((a) => (
                <li key={a.id} className="flex gap-2 text-caption">
                  <span className="text-neutral-text-secondary shrink-0">{formatDate(a.created_at)}</span>
                  <span className="text-neutral-text">{a.label}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="space-y-4 lg:max-w-[320px]">
        <ClientInternalPanel client={client} notes={notes} />
      </div>
    </div>
  );
}
