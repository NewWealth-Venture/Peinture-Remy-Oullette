-- Évite la récursion RLS sur profiles : la policy "patrons_read_all_profiles"
-- ne doit pas faire un SELECT sur profiles dans USING (cause 500 / infinite recursion).
-- On utilise une fonction SECURITY DEFINER qui lit le rôle sans déclencher RLS.

CREATE OR REPLACE FUNCTION public.get_my_profile_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() AND active = true LIMIT 1;
$$;

DROP POLICY IF EXISTS "patrons_read_all_profiles" ON public.profiles;

CREATE POLICY "patrons_read_all_profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_profile_role() = 'patron');
