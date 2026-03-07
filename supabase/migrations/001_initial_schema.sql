-- Peinture Rémy Ouellette — Schéma initial
-- Exécuter dans l’ordre dans le SQL Editor Supabase (ou via CLI)

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigger updated_at générique
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========== A) ENTREPRISE / CONFIG ==========
CREATE TABLE company_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name text,
  company_logo_url text,
  access_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

INSERT INTO company_settings (company_name) VALUES ('PEINTURE RÉMY OUELLETTE');

-- ========== B) EMPLOYÉS ==========
CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name text NOT NULL,
  role text,
  phone text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_employees_active ON employees(active);

-- ========== C) PROJETS ==========
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  address text,
  description text,
  status text NOT NULL CHECK (status IN ('À planifier','En cours','En attente','Terminé')),
  priority text NOT NULL DEFAULT 'Normale' CHECK (priority IN ('Basse','Normale','Haute')),
  start_date date,
  end_date date,
  responsable text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

-- ========== D) ASSIGNATIONS PROJET / EMPLOYÉ ==========
CREATE TABLE project_assignments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  UNIQUE(project_id, employee_id)
);

CREATE INDEX idx_project_assignments_project ON project_assignments(project_id);
CREATE INDEX idx_project_assignments_employee ON project_assignments(employee_id);

-- Tâches par projet (chantier)
CREATE TABLE project_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  priority text NOT NULL DEFAULT 'Normale' CHECK (priority IN ('Basse','Normale','Haute')),
  status text NOT NULL DEFAULT 'À faire' CHECK (status IN ('À faire','En cours','Bloqué','Terminé')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_tasks_project ON project_tasks(project_id);

-- ========== E) BRIEFS ==========
CREATE TABLE briefs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  priority text NOT NULL DEFAULT 'Normale' CHECK (priority IN ('Basse','Normale','Haute')),
  status text NOT NULL DEFAULT 'Brouillon' CHECK (status IN ('Brouillon','Envoyé','En cours','Terminé')),
  instructions text NOT NULL,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_briefs_project ON briefs(project_id);
CREATE INDEX idx_briefs_status ON briefs(status);

CREATE TABLE brief_assignments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brief_id uuid NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE(brief_id, employee_id)
);

CREATE TABLE brief_zones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brief_id uuid NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
  title text NOT NULL,
  details text,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE brief_checklist_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brief_id uuid NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
  label text NOT NULL,
  required boolean NOT NULL DEFAULT false,
  done boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE brief_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brief_id uuid NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
  author_type text NOT NULL CHECK (author_type IN ('Patron','Employé')),
  author_name text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_brief_messages_brief ON brief_messages(brief_id);

-- ========== F) MÉDIAS ==========
CREATE TABLE media_files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('Photo','Vidéo','Document')),
  bucket_path text NOT NULL,
  file_name text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_entity ON media_files(entity_type, entity_id);

-- Storage buckets : créer manuellement dans Dashboard Storage ou via API
-- project-media, brief-media, progress-media, inventory-media

-- ========== G) INVENTAIRE ==========
CREATE TABLE inventory_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku text,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Peinture','Plâtre','Outils','Protection','Autre')),
  unit text NOT NULL CHECK (unit IN ('unité','litre','kg','boîte')),
  min_stock numeric,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE inventory_locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL CHECK (type IN ('Entrepôt','Camion','Chantier')),
  name text NOT NULL,
  details text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE inventory_stock (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES inventory_locations(id) ON DELETE CASCADE,
  quantity numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(item_id, location_id)
);

CREATE INDEX idx_inventory_stock_item ON inventory_stock(item_id);
CREATE INDEX idx_inventory_stock_location ON inventory_stock(location_id);

CREATE TABLE inventory_movements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL CHECK (type IN ('Entrée','Sortie','Transfert','Ajustement')),
  item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity numeric NOT NULL,
  unit text NOT NULL,
  movement_date timestamptz NOT NULL,
  actor_name text,
  reason text,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  source_location_id uuid REFERENCES inventory_locations(id) ON DELETE SET NULL,
  destination_location_id uuid REFERENCES inventory_locations(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_movements_item ON inventory_movements(item_id);
CREATE INDEX idx_inventory_movements_date ON inventory_movements(movement_date);

-- Matériel utilisé par projet (lien projet / inventaire, sans mouvement stock)
CREATE TABLE project_material_usage (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity numeric NOT NULL,
  unit text NOT NULL,
  note text,
  used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_project_material_usage_project ON project_material_usage(project_id);
ALTER TABLE project_material_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_project_material_usage" ON project_material_usage FOR ALL USING (true) WITH CHECK (true);

-- Trigger : mettre à jour inventory_stock après un mouvement
CREATE OR REPLACE FUNCTION apply_inventory_movement()
RETURNS TRIGGER AS $$
DECLARE
  src_qty numeric;
  dst_qty numeric;
BEGIN
  IF NEW.type = 'Entrée' AND NEW.destination_location_id IS NOT NULL THEN
    INSERT INTO inventory_stock (item_id, location_id, quantity, updated_at)
    VALUES (NEW.item_id, NEW.destination_location_id, NEW.quantity, now())
    ON CONFLICT (item_id, location_id) DO UPDATE
    SET quantity = inventory_stock.quantity + NEW.quantity, updated_at = now();
  ELSIF NEW.type = 'Sortie' AND NEW.source_location_id IS NOT NULL THEN
    UPDATE inventory_stock
    SET quantity = greatest(0, quantity - NEW.quantity), updated_at = now()
    WHERE item_id = NEW.item_id AND location_id = NEW.source_location_id;
  ELSIF NEW.type = 'Transfert' AND NEW.source_location_id IS NOT NULL AND NEW.destination_location_id IS NOT NULL THEN
    UPDATE inventory_stock SET quantity = greatest(0, quantity - NEW.quantity), updated_at = now()
    WHERE item_id = NEW.item_id AND location_id = NEW.source_location_id;
    INSERT INTO inventory_stock (item_id, location_id, quantity, updated_at)
    VALUES (NEW.item_id, NEW.destination_location_id, NEW.quantity, now())
    ON CONFLICT (item_id, location_id) DO UPDATE
    SET quantity = inventory_stock.quantity + NEW.quantity, updated_at = now();
  ELSIF NEW.type = 'Ajustement' AND NEW.source_location_id IS NOT NULL THEN
    INSERT INTO inventory_stock (item_id, location_id, quantity, updated_at)
    VALUES (NEW.item_id, NEW.source_location_id, NEW.quantity, now())
    ON CONFLICT (item_id, location_id) DO UPDATE
    SET quantity = NEW.quantity, updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_movement_apply
  AFTER INSERT ON inventory_movements
  FOR EACH ROW EXECUTE PROCEDURE apply_inventory_movement();

-- ========== H) AGENDA ==========
CREATE TABLE calendar_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('Chantier','Rendez-vous','Interne')),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_calendar_events_dates ON calendar_events(starts_at, ends_at);

CREATE TRIGGER calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ========== I) AVANCEMENT QUOTIDIEN ==========
CREATE TABLE daily_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  progress_date date NOT NULL,
  progress_percent numeric,
  summary text NOT NULL,
  blockers text,
  created_by_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_daily_progress_project ON daily_progress(project_id);
CREATE INDEX idx_daily_progress_date ON daily_progress(progress_date);

CREATE TRIGGER daily_progress_updated_at
  BEFORE UPDATE ON daily_progress
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ========== J) ANNONCES ==========
CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ========== POINTAGE ==========
CREATE TABLE timesheets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  employee_name text,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  work_date date NOT NULL,
  hours numeric NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_timesheets_employee ON timesheets(employee_id);
CREATE INDEX idx_timesheets_date ON timesheets(work_date);

-- ========== DEMANDES ==========
CREATE TABLE requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_name text,
  request_type text,
  message text,
  status text NOT NULL DEFAULT 'En attente' CHECK (status IN ('En attente','Approuvée','Refusée')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ========== TRIGGERS updated_at ==========
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER briefs_updated_at BEFORE UPDATE ON briefs FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER inventory_locations_updated_at BEFORE UPDATE ON inventory_locations FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER inventory_stock_updated_at BEFORE UPDATE ON inventory_stock FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ========== RLS (prêt pour auth plus tard) ==========
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_project_tasks" ON project_tasks FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Politiques permissives tant qu’il n’y a pas d’auth (accès via anon ou service_role)
CREATE POLICY "allow_all_company_settings" ON company_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_project_assignments" ON project_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_briefs" ON briefs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_brief_assignments" ON brief_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_brief_zones" ON brief_zones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_brief_checklist_items" ON brief_checklist_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_brief_messages" ON brief_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_media_files" ON media_files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_inventory_items" ON inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_inventory_locations" ON inventory_locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_inventory_stock" ON inventory_stock FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_inventory_movements" ON inventory_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_calendar_events" ON calendar_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_daily_progress" ON daily_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_timesheets" ON timesheets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_requests" ON requests FOR ALL USING (true) WITH CHECK (true);
