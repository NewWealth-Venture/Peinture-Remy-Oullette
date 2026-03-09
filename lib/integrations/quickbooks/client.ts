/**
 * Client API QuickBooks (OAuth2 / app only).
 * À brancher quand l’intégration OAuth sera en place.
 * Pour l’instant : stub pour que syncQuickBooksClients puisse exister.
 */

const QB_BASE = "https://quickbooks.api.intuit.com/v3";

export type QuickBooksConfig = {
  realmId: string;
  accessToken: string;
};

/**
 * Récupère la liste des clients (Customers) depuis QuickBooks.
 * Retourne un tableau vide si la config n’est pas disponible ou en cas d’erreur.
 */
export async function fetchQuickBooksCustomers(_config?: QuickBooksConfig | null): Promise<unknown[]> {
  // TODO: implémenter l’appel réel quand OAuth QuickBooks sera configuré.
  // Exemple: GET {{QB_BASE}}/company/{{realmId}}/query?query=select * from Customer
  if (!_config?.realmId || !_config?.accessToken) {
    return [];
  }
  return [];
}
