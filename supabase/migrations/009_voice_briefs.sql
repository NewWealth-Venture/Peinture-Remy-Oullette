-- Module briefs vocaux (voice_briefs)

CREATE TABLE IF NOT EXISTS voice_briefs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brief_id uuid NULL REFERENCES briefs(id) ON DELETE SET NULL,
  project_id uuid NULL REFERENCES projects(id) ON DELETE SET NULL,
  created_by_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  audio_path text NOT NULL,
  audio_file_name text NULL,
  audio_duration_seconds integer NULL,
  transcription text NOT NULL,
  ai_summary text NULL,
  extracted_data jsonb NULL,
  status text NOT NULL DEFAULT 'Analyse' CHECK (status IN ('Analyse','À valider','Confirmé','Annulé')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_voice_briefs_brief_id ON voice_briefs(brief_id);
CREATE INDEX IF NOT EXISTS idx_voice_briefs_project_id ON voice_briefs(project_id);
CREATE INDEX IF NOT EXISTS idx_voice_briefs_status ON voice_briefs(status);
CREATE INDEX IF NOT EXISTS idx_voice_briefs_created_at ON voice_briefs(created_at DESC);

CREATE TRIGGER voice_briefs_updated_at
  BEFORE UPDATE ON voice_briefs
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

-- Storage bucket pour audios des briefs vocaux
INSERT INTO storage.buckets (id, name, public)
VALUES ('brief-voice-notes', 'brief-voice-notes', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "auth_read_brief_voice_notes_bucket"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'brief-voice-notes');

CREATE POLICY "auth_insert_brief_voice_notes_bucket"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'brief-voice-notes');

CREATE POLICY "auth_update_brief_voice_notes_bucket"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'brief-voice-notes');

