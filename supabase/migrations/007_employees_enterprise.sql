-- Module Employés — système complet RH / dossier employé
-- Étend la table employees et crée les tables liées

-- ========== A) Extension table employees ==========
ALTER TABLE employees ADD COLUMN IF NOT EXISTS auth_user_id uuid NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employee_code text NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS first_name text NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS last_name text NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS photo_url text NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS email text NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact_name text NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact_phone text NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS role_title text NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS department text NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employment_type text NULL
  CHECK (employment_type IS NULL OR employment_type IN ('Temps plein','Temps partiel','Contractuel','Saisonnier','Apprenti'));
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employment_status text NULL
  CHECK (employment_status IS NULL OR employment_status IN ('Actif','En congé','Suspendu','Inactif'));
ALTER TABLE employees ADD COLUMN IF NOT EXISTS hire_date date NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS termination_date date NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS address_line1 text NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS address_line2 text NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS city text NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS region text NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS postal_code text NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS country text NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS hourly_rate numeric NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS salary_amount numeric NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS pay_frequency text NULL
  CHECK (pay_frequency IS NULL OR pay_frequency IN ('Horaire','Hebdomadaire','Bi-hebdomadaire','Mensuel'));
ALTER TABLE employees ADD COLUMN IF NOT EXISTS overtime_rate numeric NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS availability_notes text NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS internal_notes text NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS birth_date date NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS preferred_language text NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_employee_code ON employees(employee_code) WHERE employee_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_last_name ON employees(last_name) WHERE last_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_first_name ON employees(first_name) WHERE first_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_employment_status ON employees(employment_status) WHERE employment_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_employment_type ON employees(employment_type) WHERE employment_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON employees(hire_date) WHERE hire_date IS NOT NULL;

-- ========== B) Documents employé ==========
CREATE TABLE IF NOT EXISTS employee_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN (
    'Contrat','Pièce identité','Permis','Certification','Formation','Paie','Autre'
  )),
  title text NOT NULL,
  file_path text NOT NULL,
  file_name text NULL,
  notes text NULL,
  expires_at date NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_employee_documents_employee ON employee_documents(employee_id);
CREATE INDEX idx_employee_documents_type ON employee_documents(document_type);

-- ========== C) Formations ==========
CREATE TABLE IF NOT EXISTS employee_trainings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  training_name text NOT NULL,
  provider text NULL,
  completed_at date NULL,
  expires_at date NULL,
  status text NOT NULL DEFAULT 'À faire' CHECK (status IN ('À faire','En cours','Complétée','Expirée')),
  certificate_document_id uuid NULL REFERENCES employee_documents(id) ON DELETE SET NULL,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_employee_trainings_employee ON employee_trainings(employee_id);
CREATE INDEX idx_employee_trainings_status ON employee_trainings(status);

CREATE TRIGGER employee_trainings_updated_at
  BEFORE UPDATE ON employee_trainings FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ========== D) Historique compensation ==========
CREATE TABLE IF NOT EXISTS employee_compensation_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  compensation_type text NOT NULL CHECK (compensation_type IN ('Taux horaire','Salaire fixe','Prime','Ajustement')),
  amount numeric NOT NULL,
  effective_date date NOT NULL,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_employee_compensation_employee ON employee_compensation_history(employee_id);

-- ========== E) Notes employé ==========
CREATE TABLE IF NOT EXISTS employee_notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  note text NOT NULL,
  note_type text NOT NULL CHECK (note_type IN ('Interne','Performance','Incident','RH')),
  created_by text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_employee_notes_employee ON employee_notes(employee_id);

-- ========== F) Disponibilité ==========
CREATE TABLE IF NOT EXISTS employee_availability (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  weekday int NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
  is_available boolean NOT NULL DEFAULT true,
  start_time time NULL,
  end_time time NULL,
  notes text NULL,
  UNIQUE(employee_id, weekday)
);
CREATE INDEX idx_employee_availability_employee ON employee_availability(employee_id);

-- ========== G) Certifications ==========
CREATE TABLE IF NOT EXISTS employee_certifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  certification_name text NOT NULL,
  issuer text NULL,
  issued_at date NULL,
  expires_at date NULL,
  status text NOT NULL DEFAULT 'Valide' CHECK (status IN ('Valide','Expire bientôt','Expirée')),
  document_id uuid NULL REFERENCES employee_documents(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_employee_certifications_employee ON employee_certifications(employee_id);

-- ========== H) Historique statut ==========
CREATE TABLE IF NOT EXISTS employee_status_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  status text NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  changed_by text NULL,
  note text NULL
);
CREATE INDEX idx_employee_status_history_employee ON employee_status_history(employee_id);

-- ========== I) RLS ==========
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_compensation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_employee_documents" ON employee_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_employee_trainings" ON employee_trainings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_employee_compensation" ON employee_compensation_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_employee_notes" ON employee_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_employee_availability" ON employee_availability FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_employee_certifications" ON employee_certifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_employee_status_history" ON employee_status_history FOR ALL USING (true) WITH CHECK (true);

-- ========== J) Storage buckets employés ==========
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('employee-photos', 'employee-photos', true),
  ('employee-documents', 'employee-documents', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY "public_read_employee_photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'employee-photos');
CREATE POLICY "anon_upload_employee_photos" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'employee-photos');
CREATE POLICY "anon_update_employee_photos" ON storage.objects FOR UPDATE
  USING (bucket_id = 'employee-photos');

CREATE POLICY "public_read_employee_documents" ON storage.objects FOR SELECT
  USING (bucket_id = 'employee-documents');
CREATE POLICY "anon_upload_employee_documents" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'employee-documents');
CREATE POLICY "anon_update_employee_documents" ON storage.objects FOR UPDATE
  USING (bucket_id = 'employee-documents');
