# Configuration Supabase — Peinture Rémy Ouellette

## Variables d'environnement

Créer un fichier `.env.local` à la racine (voir `.env.example`) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # optionnel, pour opérations admin
APP_ACCESS_CODE=ton_code_secret     # code d'accès temporaire (sans login)
```

- **APP_ACCESS_CODE** : si défini, l’app redirige vers `/acces` tant que l’utilisateur n’a pas saisi le bon code. Laisser vide pour désactiver la porte d’accès.

## Migrations SQL

1. Ouvrir le **SQL Editor** du projet Supabase.
2. Exécuter dans l’ordre :
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_storage_buckets.sql`

Si la création des buckets via SQL échoue, créer manuellement dans **Storage** les buckets :  
`project-media`, `brief-media`, `progress-media`, `inventory-media` (accès public en lecture si besoin).

## RLS

Les politiques actuelles autorisent tout (mode sans auth). Lors de l’ajout de l’auth utilisateur, remplacer ces politiques par des règles basées sur `auth.uid()`.
