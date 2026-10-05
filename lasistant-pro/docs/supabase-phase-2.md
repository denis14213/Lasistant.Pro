# Phase 2 — branchement de la base de données (Supabase)

Objectif : remplacer la base simulée du navigateur par Supabase (PostgreSQL, authentification, stockage de fichiers, fonctions serveur) **sans modifier les pages ni les composants**.

## Principe

Toute l’application lit et écrit via `@/api` :

- `api/repositories/*.repository.ts` : fonctions asynchrones (`list`, `getById`, `update`…) ;
- `api/queries.ts` : requêtes TanStack (clés de cache et fonctions de lecture).

En phase 2, chaque dépôt reçoit une implémentation Supabase **de même signature**. Le choix se fait dans `api/index.ts` selon `VITE_DATA_SOURCE` (`mock` ou `supabase`). La base simulée reste utile pour les tests et les démonstrations.

```text
api/
├── supabase/client.ts                    client Supabase (clé publique « anon »)
├── repositories/bookings.repository.ts   version simulée (actuelle)
└── repositories/bookings.supabase.ts     version Supabase (même interface)
```

## 1. Projet Supabase

1. Créer le projet (région européenne la plus proche de la Tunisie).
2. **Auth** : connexion par e-mail et mot de passe, inscriptions publiques **désactivées** (comptes créés par invitation), double authentification TOTP activée, modèles d’e-mails d’authentification traduits (ou envoyés par nos propres gabarits).
3. **Storage** : un bucket public `medias` (images du site) et un bucket **privé** `documents` (pièces jointes des demandes, accès par URL signée de courte durée).
4. Renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans l’hébergeur. La clé de service ne quitte jamais les fonctions serveur.

## 2. Tables

Les types de `src/types/` décrivent déjà les colonnes. Correspondance :

| Type TypeScript                | Table                                      |
| ------------------------------ | ------------------------------------------ |
| `SiteSettings`, `ContactEntry` | `site_settings` (ligne unique), `contacts` |
| `Service`                      | `services`                                 |
| `Article`, `Category`          | `articles`, `categories`                   |
| `FaqItem`                      | `faq_items`                                |
| `Booking`                      | `bookings`                                 |
| `BookingEvent`, `InternalNote` | `booking_events`, `internal_notes`         |
| `AdminUser`                    | `admin_users` (lié à `auth.users`)         |
| `MediaItem`                    | `media`                                    |
| `EmailTemplate`                | `email_templates`                          |
| `ActivityEntry`                | `activity_log`                             |

Exemple (demandes) :

```sql
create type booking_status as enum ('nouveau', 'en_cours', 'en_attente', 'confirme', 'cloture', 'annule');

create table bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,              -- « LP-2026-0148 », généré côté serveur
  source text not null check (source in ('reservation', 'logement', 'demande_rapide', 'contact')),
  service_id text references services (id),
  full_name text not null,
  email text not null,
  phone text,
  requested_date date,
  requested_time time,
  contact_preference text,
  message text,
  housing jsonb,
  attachment_path text,                        -- chemin dans le bucket privé « documents »
  status booking_status not null default 'nouveau',
  assignee_id uuid references admin_users (id),
  consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Deux réservations ne peuvent pas occuper le même créneau.
create unique index bookings_slot_unique on bookings (requested_date, requested_time)
  where requested_date is not null and status not in ('annule', 'cloture');
```

## 3. Sécurité au niveau des lignes (RLS)

Les règles de `src/lib/permissions.ts` sont reproduites côté serveur ; le navigateur n’est jamais la seule protection.

```sql
-- Rôle de la personne connectée
create function public.staff_role() returns text
language sql stable security definer set search_path = public as $$
  select role from admin_users where id = auth.uid() and active
$$;

alter table bookings enable row level security;

-- Lecture : administrateurs, éditeurs (lecture seule) et opérateurs
create policy bookings_read on bookings for select
  using (public.staff_role() in ('administrateur', 'editeur', 'operateur'));

-- Traitement : administrateurs et opérateurs
create policy bookings_update on bookings for update
  using (public.staff_role() in ('administrateur', 'operateur'));
```

- Contenus publics : lecture anonyme limitée aux services actifs, articles publiés, FAQ et coordonnées publiques.
- **Aucune insertion anonyme directe** dans `bookings` : les formulaires passent par une fonction serveur (ci-dessous).
- `documents` (bucket privé) : accès réservé aux rôles autorisés, via URL signée.

## 4. Fonctions serveur (Edge Functions)

| Fonction         | Rôle                                                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `submit-request` | Valide avec les schémas Zod partagés, contrôle anti-spam et limite d’envois, vérifie le créneau, crée la demande et son historique, envoie la confirmation et la notification |
| `send-email`     | Rend les gabarits de `src/emails` en HTML (`renderEmailHtml`) et les envoie (Brevo, Resend…) ; utilisé pour les réponses depuis la fiche d’une demande                        |
| `invite-user`    | Invite un membre de l’équipe (`auth.admin.inviteUserByEmail`, clé de service)                                                                                                 |
| `sitemap`        | Produit `sitemap.xml` à partir des services actifs et des articles publiés                                                                                                    |

## 5. Authentification

| Phase statique (`features/auth/auth-service.ts`) | Supabase                                    |
| ------------------------------------------------ | ------------------------------------------- |
| `attemptLogin`                                   | `auth.signInWithPassword`                   |
| `verifyTwoFactor`                                | `auth.mfa.challenge` puis `auth.mfa.verify` |
| `requestPasswordReset`                           | `auth.resetPasswordForEmail`                |
| `completePasswordReset`                          | `auth.updateUser({ password })`             |
| Session (`session-storage.ts`)                   | `auth.getSession` / `onAuthStateChange`     |

L’interface `AuthApi` (`features/auth/auth-context.ts`) ne change pas : seuls `auth-service.ts` et `AuthProvider.tsx` sont adaptés.

## 6. Ordre de travail conseillé

1. Créer le schéma (migrations versionnées dans `supabase/migrations/`) et les politiques RLS.
2. Importer les contenus de `src/content/` (services, articles, FAQ, réglages, modèles d’e-mails) par un script d’amorçage.
3. Implémenter les dépôts Supabase un par un, en commençant par les lectures publiques (services, articles, FAQ, réglages).
4. Brancher l’authentification, puis les écritures du back-office.
5. Déployer les fonctions serveur (`submit-request` en premier) et brancher les formulaires publics.
6. Tester avec `VITE_DATA_SOURCE=supabase` sur un environnement de préproduction, puis basculer la production.

## 7. Avant la mise en ligne

- Sauvegardes automatiques activées et testées (restauration).
- Journal des erreurs serveur, alertes sur les échecs d’envoi d’e-mails.
- Domaine d’envoi des e-mails vérifié (SPF, DKIM, DMARC) pour `notifications@lasistant.pro` et `securite@lasistant.pro`.
- Durées de conservation des demandes appliquées par une tâche planifiée (voir [contenus-a-valider.md](contenus-a-valider.md)).
