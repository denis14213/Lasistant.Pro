# Base de données (Supabase)

Le site et le back-office lisent et écrivent toutes leurs données dans le projet Supabase **Lasistant.Pro** (`hpqdmurqidvpzrhdcglu`, région Paris `eu-west-3`, PostgreSQL 17). Ce document décrit le schéma, les règles d’accès, les routes d’API et l’exploitation.

## 1. Principes

- **La base fait foi.** Les règles qui garantissent l’intégrité sont appliquées par PostgreSQL, quel que soit le client : références des demandes, historique, auteur des actions, temps de lecture, contrôle des créneaux, limitation des envois, garde-fous sur les rôles.
- **Moindre privilège.** Tous les droits de table sont retirés, puis accordés explicitement par rôle et par colonne. La sécurité au niveau des lignes (RLS) est activée sur toutes les tables.
- **Aucun secret dans le navigateur.** Le site n’utilise que la clé publique (`sb_publishable_…`). La clé secrète n’existe que dans les Edge Functions.
- **Migrations versionnées.** Chaque changement de structure est un fichier de `supabase/migrations/`, appliqué dans l’ordre. Le nom des fichiers correspond à l’historique enregistré dans la base.

## 2. Tables

| Table                         | Contenu                                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `site_settings`               | Ligne unique : identité, coordonnées, réservation, SEO, mesure d’audience, maintenance, sauvegardes, mentions légales (rubriques en JSONB) |
| `services`                    | Services présentés sur le site et proposés à la réservation                                                                                |
| `categories`, `articles`      | Espace infos                                                                                                                               |
| `faq_categories`, `faq_items` | Questions fréquentes                                                                                                                       |
| `page_contents`               | Textes et photos de chaque page du site (un document JSONB par page), modifiables dans « Pages du site »                                   |
| `bookings`                    | Demandes : réservation, logement, demande rapide, contact                                                                                  |
| `booking_events`              | Historique de chaque demande (tenu par la base)                                                                                            |
| `internal_notes`              | Notes internes de l’équipe                                                                                                                 |
| `admin_users`                 | Membres de l’équipe (une ligne par compte Supabase Auth)                                                                                   |
| `mfa_recovery_codes`          | Ancien dispositif TOTP (codes de secours), inutilisé depuis la double authentification par e-mail                                          |
| `activity_log`                | Journal des actions sensibles                                                                                                              |
| `media`                       | Médiathèque (images publiques et documents privés)                                                                                         |
| `email_templates`             | Modèles d’e-mails et réponses standards                                                                                                    |
| `email_outbox`                | File des e-mails automatiques (confirmation, notification, rendez-vous confirmé) et suivi de leur envoi                                    |
| `submission_attempts`         | Empreintes salées des adresses IP (limitation des envois)                                                                                  |
| `booking_reference_counters`  | Compteur annuel des références `LP-AAAA-NNNN`                                                                                              |

Les types TypeScript générés sont dans `src/api/supabase/database.types.ts` ; la correspondance avec les types métier est dans `src/api/supabase/mappers.ts`.

## 3. Règles d’accès

`app_private.staff_role()` renvoie le rôle de la personne connectée, ou rien si le compte est inconnu, désactivé, ou si la session n’a pas été vérifiée par le code de connexion envoyé par e-mail (`app_private.session_verified()`, table `app_private.verified_sessions`).

| Rôle           | Lecture                                                                                  | Écriture                                                            |
| -------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Visiteur       | Réglages, services actifs, articles publiés, catégories actives, FAQ, contenus des pages | Aucune écriture directe (demandes via `submit_booking`)             |
| Opérateur      | Demandes, historique, notes, équipe, modèles                                             | Statut et assignation des demandes, notes, agenda, documents privés |
| Éditeur        | Idem + brouillons                                                                        | Services, articles, catégories, images, pages du site               |
| Administrateur | Tout                                                                                     | Tout, y compris réglages, rôles et modèles d’e-mails                |

Garde-fous : un administrateur ne peut pas retirer ses propres droits ; un opérateur ne modifie que les disponibilités de l’agenda ; le nom des modèles fournis avec le site est fixe et ils ne peuvent pas être supprimés ; seuls le statut et l’assignation d’une demande sont modifiables (pas les coordonnées du demandeur).

## 4. Routes d’API

Lecture et écriture simples : API REST (`/rest/v1/<table>`) sous le contrôle des règles RLS. Opérations à contrôler côté serveur : fonctions RPC (`/rest/v1/rpc/<nom>`).

| Route                                                    | Appelant            | Rôle                                                                                                         |
| -------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------ |
| `submit_booking`                                         | Visiteur            | Contrôle des données et du créneau, limite de 5 envois / 10 min / IP, référence, historique, e-mails en file |
| `taken_slots`                                            | Visiteur            | Créneaux pris (date et heure uniquement)                                                                     |
| `booking_confirmation`                                   | Visiteur            | Récapitulatif de confirmation : référence **et** clé secrète exigées, aucune donnée personnelle              |
| `mark_booking_viewed`                                    | Équipe              | Première consultation d’une demande                                                                          |
| `log_booking_reply`                                      | Opérateurs          | Trace d’une réponse envoyée                                                                                  |
| `move_service`                                           | Éditeurs            | Ordre d’affichage des services                                                                               |
| `record_login`                                           | Équipe              | Dernière connexion                                                                                           |
| `mark_password_changed`                                  | Équipe              | Date du dernier changement de mot de passe                                                                   |
| `regenerate_recovery_codes`                              | Équipe (aal2)       | 8 nouveaux codes de secours, affichés une seule fois                                                         |
| `outbox_claim`, `outbox_complete`, `outbox_provider_key` | Clé secrète + jeton | Réservées à l’Edge Function `envoi-emails` (voir ci-dessous)                                                 |

Erreurs métier : le code est dans `message` (`validation`, `forbidden`, `rate_limited`, `not_found`) et le texte affichable dans `detail`.

### Edge Function `equipe`

Opérations qui exigent l’API d’administration de Supabase Auth (`supabase/functions/equipe/index.ts`, JWT vérifié dans le code) :

- `inviter` (administrateurs) : crée le compte et envoie l’invitation ; sans serveur d’e-mails, renvoie un **lien d’activation** à transmettre ;
- `renvoyer-invitation` (administrateurs) ;
- `code-de-secours` : consomme un code de secours et retire la double authentification, à reconfigurer ensuite.

### Edge Function `envoi-emails` (e-mails automatiques)

Chaque événement dépose ses e-mails dans `email_outbox` : confirmation au demandeur et notification à l’équipe à chaque demande reçue, e-mail « rendez-vous confirmé » au passage d’une demande au statut « Confirmé ».

1. Un déclencheur appelle aussitôt la fonction (`pg_net`, requête envoyée après la validation de la transaction, jamais si elle est annulée).
2. La fonction réserve les e-mails en attente (`outbox_claim`, verrou par ligne : aucun double envoi), les met en page avec `gabarits.ts` (même rendu que l’aperçu du back-office, vérifié par `src/emails/server-parity.test.tsx`) et les envoie par **Resend** depuis `notifications@adbm-school.com` (domaine vérifié), réponse à l’adresse du modèle.
3. Elle rend compte de chaque envoi (`outbox_complete`) : `envoye` avec l’identifiant Resend, ou nouvelle tentative après 2, 4, 8 puis 16 minutes, `echec` au bout de 5 tentatives ou en cas de refus définitif (adresse invalide, modèle désactivé). Une tâche `pg_cron` relance les envois en attente toutes les 5 minutes.

Sécurité : la fonction ne reçoit aucun contenu, seulement un jeton aléatoire généré par la base ; les trois routes ne s’exécutent qu’avec la clé secrète **et** ce jeton ; chaque envoi porte une clé d’idempotence ; toute valeur saisie par un visiteur est échappée. Les rôles de l’API n’ont aucun accès à `pg_net`.

Coffre (Vault), jamais dans les fichiers : `envoi_emails_jeton`, `envoi_emails_url`, `resend_api_key` (clé Resend « sending access » limitée au domaine) et `site_url_public` (adresse du site utilisée pour les liens et le logo des e-mails).

```sql
-- Changement de domaine du site (passage à https://lasistant.pro)
select vault.update_secret(id, 'https://lasistant.pro') from vault.secrets where name = 'site_url_public';
-- Renouvellement de la clé Resend (créée dans Resend › API Keys, droit « Sending access »)
select vault.update_secret(id, 're_…') from vault.secrets where name = 'resend_api_key';
-- Suivi des envois
select template_key, recipient, status, attempts, last_error, sent_at from public.email_outbox order by created_at desc limit 20;
```

## 5. Stockage

| Bucket      | Accès                                                                                                                                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `medias`    | Public en lecture (images du site, WebP). Dépôt et suppression : éditeurs et administrateurs.                                                                                                                  |
| `documents` | Privé. Pièces jointes des demandes (dépôt anonyme possible dans `demandes/<uuid>/` uniquement, sans lecture) et documents sensibles. Lecture par lien temporaire de 5 minutes : opérateurs et administrateurs. |

## 6. Authentification

- Connexion par e-mail et mot de passe (Supabase Auth), session dans l’onglet ou sur l’appareil (« Rester connecté »).
- Double authentification par **code envoyé par e-mail** (Edge Function `code-connexion`, envoi par Resend depuis `securite@adbm-school.com`) : après le mot de passe, un code à 6 chiffres, valable 10 minutes et lié à la session, est envoyé à l’adresse du compte. Tant qu’il n’est pas validé, la base ne renvoie aucune donnée. Une session vérifiée le reste 30 jours au plus (déconnexion comprise).
- Code conservé sous forme d’empreinte salée (`app_private.login_codes`), 5 essais au plus. Limitations appliquées par la base (`login_code_issue`) : 1 envoi par minute, 5 par heure et par compte, 20 par heure et par adresse IP ; après 10 essais erronés en une heure, plus aucun code pendant une heure.
- Chaque compte doit donc avoir une **adresse e-mail réelle** : sans accès à cette boîte, la connexion est impossible. En dépannage, les codes envoyés apparaissent dans le tableau de bord Resend (Emails).
- Réinitialisation du mot de passe et invitations par lien e-mail : écran `/admin/reinitialiser-mot-de-passe`.
- Les inscriptions publiques n’ouvrent aucun accès : un compte sans fiche `admin_users` active n’a aucun droit.

## 7. Configuration à faire dans le tableau de bord Supabase

1. **Authentication › URL Configuration** : _Site URL_ = adresse du site en production ; _Redirect URLs_ : `https://lasistant.pro/admin/reinitialiser-mot-de-passe`, l’adresse Cloudflare de test `https://lasistant-pro.<compte>.workers.dev/admin/reinitialiser-mot-de-passe` (voir [deploiement-cloudflare.md](deploiement-cloudflare.md)), `https://lasistant.pro.adbm-it.com/admin/reinitialiser-mot-de-passe` et `http://localhost:5173/admin/reinitialiser-mot-de-passe`.
2. **Authentication › Emails › SMTP Settings** (réinitialisations du mot de passe et invitations) : _Enable custom SMTP_, hôte `smtp.resend.com`, port `465`, identifiant `resend`, mot de passe = clé Resend (droit d’envoi, domaine adbm-school.com), expéditeur `securite@adbm-school.com`, nom « LASISTANT.PRO ». Sans cela, le serveur intégré de Supabase n’envoie qu’aux membres de l’organisation Supabase ; les invitations fournissent alors un lien d’activation à copier.
3. **Authentication › Sign In / Providers** : désactiver _Allow new users to sign up_ (les comptes sont créés par invitation).
4. **E-mails automatiques** : en place (Edge Function `envoi-emails`, Resend). Rien à configurer ; voir « Edge Function envoi-emails » pour le changement de domaine et le renouvellement de la clé.
5. **Authentication › Attack Protection** : activer _Prevent use of leaked passwords_ (vérification auprès de HaveIBeenPwned), signalée par les analyseurs.

## 8. Exploitation

- **Nouvelle migration** : ajouter un fichier `supabase/migrations/<horodatage>_<nom>.sql`, l’appliquer (`supabase db push` ou outil MCP), puis régénérer les types (`supabase gen types typescript --project-id hpqdmurqidvpzrhdcglu > src/api/supabase/database.types.ts`). Les nouvelles tables doivent recevoir leurs droits et leurs règles RLS explicitement.
- **Contenus d’origine** : `npm run db:seed-sql` régénère la migration `…_contenus_initiaux.sql` depuis `src/content` (insertions idempotentes, sans données fictives).
- **Contenus des pages et photos de l’équipe** : `npm run db:pages-sql` régénère `…_photos_et_contenus_des_pages.sql` et `…_retrait_anciennes_photos.sql`. La première, sans aucune suppression : contenus d’origine de chaque page (une page déjà enregistrée n’est jamais écrasée) et remplacement des anciennes photos d’illustration par les photos de l’équipe dans les services, les articles et la médiathèque (une photo choisie depuis le back-office n’est jamais remplacée ; les photos des logements ne sont pas concernées). La seconde retire de la médiathèque les fiches des anciennes photos d’illustration ; isolée parce qu’elle supprime des lignes, elle est sans effet sur la base de production, déjà à jour, et ne sert qu’à une base recréée de zéro.
- **Contenus des pages et évolutions du site** : une page enregistrée est toujours complétée par la structure d’origine (`src/content/pages`, fusion par `lib/content-merge.ts`). Une rubrique ajoutée dans le code apparaît donc sur le site et dans l’éditeur sans migration ; une liste enregistrée (étapes, questions…) reste celle de la base.
- **Plan du site** : `npm run sitemap` (lancé avant chaque compilation) lit les services actifs et articles publiés dans la base.
- **Sauvegardes** : « SEO, analytics & maintenance › Télécharger une sauvegarde » exporte toutes les tables (JSON), contenus des pages compris. La restauration rétablit contenus, pages et réglages, sans jamais écraser les demandes reçues ; une sauvegarde plus ancienne, sans contenus de pages, reste valide.
- **Analyseurs Supabase** (_Advisors_) : les avertissements « fonction SECURITY DEFINER appelable » concernent les routes ci-dessus, volontairement exposées et protégées par un contrôle de rôle interne, ainsi que `rls_auto_enable()`, fonction de l’événement `ensure_rls` installée par Supabase (activation automatique du RLS sur les nouvelles tables), qui ne peut pas être appelée directement. Les index signalés « inutilisés » le sont tant que le site reçoit peu de trafic.
