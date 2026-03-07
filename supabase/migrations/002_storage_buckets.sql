-- Créer les buckets Storage (Supabase Dashboard > Storage > New bucket si préféré)
-- Politiques pour permettre upload/lecture sans auth utilisateur (mode temporaire)

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('project-media', 'project-media', true),
  ('brief-media', 'brief-media', true),
  ('progress-media', 'progress-media', true),
  ('inventory-media', 'inventory-media', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Lecture publique
CREATE POLICY "public_read_project_media" ON storage.objects FOR SELECT
  USING (bucket_id = 'project-media');
CREATE POLICY "public_read_brief_media" ON storage.objects FOR SELECT
  USING (bucket_id = 'brief-media');
CREATE POLICY "public_read_progress_media" ON storage.objects FOR SELECT
  USING (bucket_id = 'progress-media');
CREATE POLICY "public_read_inventory_media" ON storage.objects FOR SELECT
  USING (bucket_id = 'inventory-media');

-- Upload autorisé (anon pour mode sans login)
CREATE POLICY "anon_upload_project_media" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-media');
CREATE POLICY "anon_upload_brief_media" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'brief-media');
CREATE POLICY "anon_upload_progress_media" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'progress-media');
CREATE POLICY "anon_upload_inventory_media" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'inventory-media');

-- Update/Delete si besoin plus tard
CREATE POLICY "anon_update_project_media" ON storage.objects FOR UPDATE
  USING (bucket_id = 'project-media');
CREATE POLICY "anon_update_brief_media" ON storage.objects FOR UPDATE
  USING (bucket_id = 'brief-media');
CREATE POLICY "anon_update_progress_media" ON storage.objects FOR UPDATE
  USING (bucket_id = 'progress-media');
CREATE POLICY "anon_update_inventory_media" ON storage.objects FOR UPDATE
  USING (bucket_id = 'inventory-media');
