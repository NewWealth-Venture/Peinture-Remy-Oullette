import type { ClientInsert } from "@/lib/db/clients";

/**
 * Représentation typée d’un client retourné par l’API QuickBooks (Customer).
 * À adapter selon la doc QuickBooks réelle.
 */
export type QuickBooksCustomer = {
  Id: string;
  SyncToken?: string;
  DisplayName?: string;
  CompanyName?: string;
  GivenName?: string;
  FamilyName?: string;
  PrimaryEmailAddr?: { Address?: string };
  PrimaryPhone?: { FreeFormNumber?: string };
  Mobile?: { FreeFormNumber?: string };
  WebAddr?: { URI?: string };
  BillAddr?: {
    Line1?: string;
    Line2?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
    Country?: string;
  };
  ShipAddr?: {
    Line1?: string;
    Line2?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
    Country?: string;
  };
  Balance?: number;
  OpenBalance?: number;
  CurrencyRef?: { value?: string };
  SalesTermRef?: { value?: string };
  TaxIdentifier?: string;
  Active?: boolean;
  MetaData?: { LastUpdatedTime?: string };
};

/**
 * Mappe un objet Customer QuickBooks vers le format ClientInsert de notre app.
 * Les champs internes (internal_*, assigned_to) ne sont pas touchés par la synchro.
 */
export function mapQuickBooksCustomerToClient(qb: QuickBooksCustomer): ClientInsert & { quickbooks_customer_id: string } {
  const raw = qb as unknown as Record<string, unknown>;
  return {
    quickbooks_customer_id: String(qb.Id),
    source: "quickbooks",
    display_name: qb.DisplayName ?? (([qb.GivenName, qb.FamilyName].filter(Boolean).join(" ") || qb.CompanyName) ?? "Sans nom"),
    company_name: qb.CompanyName ?? null,
    given_name: qb.GivenName ?? null,
    family_name: qb.FamilyName ?? null,
    primary_email: qb.PrimaryEmailAddr?.Address ?? null,
    primary_phone: qb.PrimaryPhone?.FreeFormNumber ?? null,
    mobile_phone: qb.Mobile?.FreeFormNumber ?? null,
    website: qb.WebAddr?.URI ?? null,
    billing_address_line1: qb.BillAddr?.Line1 ?? null,
    billing_address_line2: qb.BillAddr?.Line2 ?? null,
    billing_city: qb.BillAddr?.City ?? null,
    billing_region: qb.BillAddr?.CountrySubDivisionCode ?? null,
    billing_postal_code: qb.BillAddr?.PostalCode ?? null,
    billing_country: qb.BillAddr?.Country ?? null,
    shipping_address_line1: qb.ShipAddr?.Line1 ?? null,
    shipping_address_line2: qb.ShipAddr?.Line2 ?? null,
    shipping_city: qb.ShipAddr?.City ?? null,
    shipping_region: qb.ShipAddr?.CountrySubDivisionCode ?? null,
    shipping_postal_code: qb.ShipAddr?.PostalCode ?? null,
    shipping_country: qb.ShipAddr?.Country ?? null,
    balance: qb.Balance != null ? Number(qb.Balance) : null,
    open_balance: qb.OpenBalance != null ? Number(qb.OpenBalance) : null,
    currency: qb.CurrencyRef?.value ?? null,
    payment_terms: qb.SalesTermRef?.value ?? null,
    tax_identifier: qb.TaxIdentifier ?? null,
    is_active: qb.Active ?? true,
    quickbooks_sync_token: qb.SyncToken ?? null,
    last_synced_at: new Date().toISOString(),
    quickbooks_raw: raw ? { ...raw } : null,
  };
}
