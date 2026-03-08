-- Peinture Rémy Ouellette — Profils utilisateurs (auth.users)
-- Chaque compte Supabase Auth est lié à un profil avec rôle (patron / employe).
-- Comptes créés manuellement dans Supabase Auth (Dashboard) : le trigger crée le profil.
-- Pour des users existants déjà en auth.users avant cette migration, insérer manuellement dans profiles.

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text NOT NULL DEFAULT 'employe' CHECK (role IN ('patron', 'employe')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_active ON public.profiles(active);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Création automatique du profil à l'insertion d'un user (comptes créés manuellement dans Auth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employe')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users (Supabase appelle ce trigger après signup; ici les comptes sont créés manuellement)
-- Si vous créez les users via Dashboard Auth, ajoutez le profil manuellement ou via un trigger.
-- Pour les users créés par l'admin dans Auth, le trigger ne s'exécute qu'à la création.
-- Donc on crée le trigger pour les cas où un user serait créé (ex. invite par email plus tard).
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RLS profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Un utilisateur peut lire son propre profil
CREATE POLICY "users_read_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Les patrons peuvent lire tous les profils (pour la gestion d'équipe)
CREATE POLICY "patrons_read_all_profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'patron' AND p.active = true
    )
  );

-- Seul le service role ou un patron peut mettre à jour un profil (admin)
-- Pour l'instant on n'expose pas d'API de mise à jour depuis l'app; l'admin édite dans Supabase.
-- Policy pour permettre à l'utilisateur de mettre à jour son propre full_name uniquement si besoin plus tard:
-- CREATE POLICY "users_update_own_profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- RLS existant sur les tables métier : garder allow_all pour l'instant ou restreindre par rôle.
-- Les policies existantes (allow_all_*) donnent l'accès à tout; on peut les remplacer plus tard par des règles basées sur (SELECT role FROM profiles WHERE id = auth.uid()).
-- Aucun changement aux autres tables dans cette migration pour ne pas casser l'existant.

COMMENT ON TABLE public.profiles IS 'Profils utilisateurs liés à auth.users; rôle patron ou employe.';
