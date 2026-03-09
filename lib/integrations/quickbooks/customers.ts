import { fetchQuickBooksCustomers } from "./client";
import { mapQuickBooksCustomerToClient } from "./mapper";
import type { QuickBooksCustomer } from "./mapper";
import { upsertQuickBooksClient } from "@/lib/db/clients";

/**
 * Synchronise les clients QuickBooks vers la table clients.
 * Utilise mapQuickBooksCustomerToClient puis upsertQuickBooksClient.
 * Retourne le nombre de clients traités (pour affichage UI).
 */
export async function syncQuickBooksCustomers(config?: { realmId: string; accessToken: string } | null): Promise<{ count: number; error?: string }> {
  const raw = await fetchQuickBooksCustomers(config);
  if (!Array.isArray(raw)) {
    return { count: 0, error: "Réponse QuickBooks invalide" };
  }
  let count = 0;
  for (const item of raw) {
    try {
      const mapped = mapQuickBooksCustomerToClient(item as QuickBooksCustomer);
      await upsertQuickBooksClient(mapped);
      count++;
    } catch (_e) {
      // continuer avec les autres
    }
  }
  return { count };
}
