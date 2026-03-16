-- Module comptes rendus vocaux (voice_reports)

-- ========= A) Table voice_reports =========
CREATE TABLE IF NOT EXISTS voice_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NULL REFERENCES projects(id) ON DELETE SET NULL,
  employee_id uuid NULL REFERENCES employees(id) ON DELETE SET NULL,
  created_by_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NULL,
  category text NULL CHECK (category IS NULL OR category IN (
    'Journal chantier','Avancement','Visite','Incident','Note vocale','Autre'
  )),
  audio_path text NOT NULL,
  audio_file_name text NULL,
  audio_duration_seconds integer NULL,
  transcription text NOT NULL,
  summary text NULL,
  structured_report text NULL,
  language text NULL,
  report_date date NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_voice_reports_project_id ON voice_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_voice_reports_employee_id ON voice_reports(employee_id);
CREATE INDEX IF NOT EXISTS idx_voice_reports_report_date ON voice_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_voice_reports_category ON voice_reports(category);
CREATE INDEX IF NOT EXISTS idx_voice_reports_created_at ON voice_reports(created_at DESC);

CREATE TRIGGER voice_reports_updated_at
  BEFORE UPDATE ON voice_reports
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

-- ========= B) Storage bucket voice-reports =========
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-reports', 'voice-reports', false)
ON CONFLICT (id) DO NOTHING;

-- Politiques simples : lecture/écriture pour les utilisateurs authentifiés
CREATE POLICY "auth_read_voice_reports_bucket"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'voice-reports');

CREATE POLICY "auth_insert_voice_reports_bucket"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'voice-reports');

CREATE POLICY "auth_update_voice_reports_bucket"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'voice-reports');

