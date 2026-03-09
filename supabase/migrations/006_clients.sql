-- Module Clients — conçu pour import QuickBooks
-- Tables: clients, client_notes, client_activity
-- Relation: projects.client_id -> clients.id

CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quickbooks_customer_id text UNIQUE,
  source text NOT NULL DEFAULT 'internal' CHECK (source IN ('internal', 'quickbooks')),
  display_name text NOT NULL,
  company_name text,
  given_name text,
  family_name text,
  primary_email text,
  primary_phone text,
  mobile_phone text,
  website text,

  billing_address_line1 text,
  billing_address_line2 text,
  billing_city text,
  billing_region text,
  billing_postal_code text,
  billing_country text,

  shipping_address_line1 text,
  shipping_address_line2 text,
  shipping_city text,
  shipping_region text,
  shipping_postal_code text,
  shipping_country text,

  balance numeric,
  open_balance numeric,
  currency text,
  payment_terms text,
  tax_identifier text,
  is_active boolean NOT NULL DEFAULT true,

  quickbooks_sync_token text,
  last_synced_at timestamptz,
  quickbooks_raw jsonb,

  internal_status text CHECK (internal_status IN ('Nouveau', 'Actif', 'À relancer', 'VIP', 'Inactif')),
  internal_tags text[],
  internal_notes text,
  assigned_to text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_quickbooks_customer_id ON clients(quickbooks_customer_id) WHERE quickbooks_customer_id IS NOT NULL;
CREATE INDEX idx_clients_display_name ON clients(display_name);
CREATE INDEX idx_clients_company_name ON clients(company_name) WHERE company_name IS NOT NULL;
CREATE INDEX idx_clients_primary_email ON clients(primary_email) WHERE primary_email IS NOT NULL;
CREATE INDEX idx_clients_primary_phone ON clients(primary_phone) WHERE primary_phone IS NOT NULL;
CREATE INDEX idx_clients_source ON clients(source);
CREATE INDEX idx_clients_internal_status ON clients(internal_status) WHERE internal_status IS NOT NULL;
CREATE INDEX idx_clients_is_active ON clients(is_active);
CREATE INDEX idx_clients_last_synced_at ON clients(last_synced_at) WHERE last_synced_at IS NOT NULL;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Notes internes (non synchronisées QuickBooks)
CREATE TABLE client_notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_notes_client_id ON client_notes(client_id);

-- Activité / timeline
CREATE TABLE client_activity (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type text NOT NULL,
  label text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_activity_client_id ON client_activity(client_id);
CREATE INDEX idx_client_activity_created_at ON client_activity(client_id, created_at DESC);

-- Lier projets aux clients
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE SET NULL;
CREATE INDEX idx_projects_client_id ON projects(client_id) WHERE client_id IS NOT NULL;

-- RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_client_notes" ON client_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_client_activity" ON client_activity FOR ALL USING (true) WITH CHECK (true);
