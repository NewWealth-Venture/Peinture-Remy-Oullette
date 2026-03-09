"use client";

import Link from "next/link";
import { Table } from "@/components/ui/Table";
import type { DbClient } from "@/lib/db/clients";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" });
}

function formatCurrency(amount: number | null | undefined, currency?: string | null): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: currency ?? "CAD",
  }).format(amount);
}

const SOURCE_LABELS: Record<string, string> = {
  quickbooks: "QuickBooks",
  internal: "Interne",
};

export function ClientsTable({ clients }: { clients: DbClient[] }) {
  return (
    <div className="border border-neutral-border rounded-lg overflow-hidden" style={{ borderRadius: "6px" }}>
      <Table
        columns={[
          { key: "client", label: "Client" },
          { key: "company", label: "Entreprise" },
          { key: "contact", label: "Contact" },
          { key: "phone", label: "Téléphone" },
          { key: "balance", label: "Solde" },
          { key: "status", label: "Statut interne" },
          { key: "synced", label: "Dernière synchro" },
          { key: "source", label: "Source" },
          { key: "actions", label: "Actions", className: "w-[80px]" },
        ]}
      >
        {clients.map((c) => (
          <tr key={c.id} className="border-b border-neutral-border last:border-b-0 hover:bg-neutral-bg-subtle transition-colors">
            <td className="py-2.5 px-4">
              <Link href={`/patron/clients/${c.id}`} className="font-medium text-neutral-text hover:underline focus-ring rounded">
                {c.display_name || "—"}
              </Link>
            </td>
            <td className="py-2.5 px-4 text-caption text-neutral-text-secondary">{c.company_name ?? "—"}</td>
            <td className="py-2.5 px-4 text-caption text-neutral-text-secondary">{c.primary_email ?? "—"}</td>
            <td className="py-2.5 px-4 text-caption text-neutral-text-secondary">{c.primary_phone ?? c.mobile_phone ?? "—"}</td>
            <td className="py-2.5 px-4 text-caption tabular-nums">{formatCurrency(c.balance ?? c.open_balance, c.currency)}</td>
            <td className="py-2.5 px-4">
              {c.internal_status ? (
                <span className="inline-flex px-2 py-0.5 rounded text-caption-xs font-medium bg-neutral-bg-subtle text-neutral-text" style={{ borderRadius: "4px" }}>
                  {c.internal_status}
                </span>
              ) : (
                "—"
              )}
            </td>
            <td className="py-2.5 px-4 text-caption text-neutral-text-secondary">{formatDate(c.last_synced_at)}</td>
            <td className="py-2.5 px-4 text-caption text-neutral-text-secondary">{SOURCE_LABELS[c.source] ?? c.source}</td>
            <td className="py-2.5 px-4">
              <Link
                href={`/patron/clients/${c.id}`}
                className="text-caption text-primary-blue hover:underline focus-ring rounded"
              >
                Voir
              </Link>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
