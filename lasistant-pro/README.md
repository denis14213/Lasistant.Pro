# LASISTANT.PRO — site vitrine et back-office

Site de LASISTANT.PRO, service social d’assistance en Tunisie : **assistance médicale**, **logement et hébergement**, **accompagnement des malades**. Le projet réunit :

- le **site public** : accueil, services, réservation en ligne en 5 étapes, Espace infos (articles), FAQ, contact, pages légales, gestion des cookies, plan du site, pages d’erreur, maintenance et hors connexion, avec un bouton flottant WhatsApp pour joindre l’agence ;
- le **back-office** : tableau de bord, demandes et réservations, agenda et disponibilités, services, articles, **pages du site** (textes et photos de chaque page), médiathèque, coordonnées et réglages, SEO, mentions légales, modèles d’e-mails, utilisateurs et rôles, « Mon compte ».

> **Données dynamiques.** Tout le contenu (réglages, services, articles, FAQ, textes et photos des pages, demandes, équipe, médias, modèles d’e-mails) est lu et enregistré dans la base **Supabase** du projet, sous le contrôle de règles d’accès appliquées par la base. Schéma, règles et routes d’API : [docs/base-de-donnees.md](docs/base-de-donnees.md).

## Démarrage rapide

Prérequis : **Node.js 20.19 ou plus récent** (recommandé : Node 22 ou 24).

```bash
npm install
npm run dev                  # http://localhost:5173 (base Supabase du projet)
```

La configuration publique (adresse du projet, clé `sb_publishable_…`) est dans `.env.development` et `.env.production`. Un fichier `.env.local` (non versionné) permet de la remplacer.

> En développement, le site est branché sur **la même base que la production** : les demandes envoyées et les modifications faites dans le back-office sont réelles.

### Back-office (`/admin`)

Le premier compte administrateur est `admin@lasistant.pro` (mot de passe communiqué séparément, à changer dans « Mon compte »). Les autres membres de l’équipe sont invités depuis « Utilisateurs & rôles ». Activez la double authentification dès la première connexion.

Les tests automatisés n’utilisent jamais la base de production : ils tournent sur une base simulée en mémoire (`VITE_DATA_SOURCE=mock`, fixé par `vitest.config.ts`).

## Scripts

| Commande                     | Rôle                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`                | Serveur de développement avec rechargement à chaud                                 |
| `npm run build`              | Plan du site (`public/sitemap.xml`), vérification TypeScript, production           |
| `npm run preview`            | Sert le dossier `dist` pour tester la version de production                        |
| `npm run preview:cloudflare` | Compile puis sert le site dans le simulateur Cloudflare (en-têtes et routes réels) |
| `npm run deploy`             | Compile puis publie sur Cloudflare Workers (après `npx wrangler login`)            |
| `npm run sitemap`            | Régénère `public/sitemap.xml` à partir de la base (contenus publiés)               |
| `npm run db:seed-sql`        | Régénère la migration des contenus d’origine depuis `src/content`                  |
| `npm run db:pages-sql`       | Régénère la migration des contenus de pages et des photos de l’équipe              |
| `npm run typecheck`          | Vérification des types                                                             |
| `npm run lint`               | ESLint (TypeScript, règles des hooks et du compilateur React)                      |
| `npm run test`               | Tests Vitest (règles métier, formulaires, navigation, e-mails, Worker)             |
| `npm run format`             | Mise en forme Prettier (classes Tailwind triées)                                   |
| `npm run check`              | Types + lint + tests : à lancer avant chaque livraison                             |

## Technologies

- **React 19** + **TypeScript** strict, **Vite 8**
- **React Router 7** en mode « données » : chaque page est chargée à la demande et précharge ses données
- **TanStack Query 5** : cache des données, états de chargement et d’erreur
- **React Hook Form** + **Zod** : formulaires et validation (messages en français)
- **Supabase** : PostgreSQL (RLS), API REST et RPC, Auth, stockage, temps réel, Edge Functions
- **Tailwind CSS 4** : jetons du système de design dans `src/styles/index.css`
- **Phosphor Icons** (`@phosphor-icons/react`, licence MIT) derrière un système d’icônes maison : voir [docs/icones.md](docs/icones.md)
- **Vitest** + **Testing Library**, **ESLint**, **Prettier**

## Structure du projet

```text
supabase/
├── migrations/     Schéma, règles d’accès, routes d’API, stockage, contenus d’origine (SQL versionné)
└── functions/      Edge Functions (équipe, code de connexion par e-mail, envoi des e-mails)
worker/             Worker Cloudflare : fichiers introuvables et routes demandées sans navigation
src/
├── app/            Démarrage : fournisseurs, routeur, routes publiques et back-office, erreurs de navigation
├── pages/          Une page par route (public/, admin/, system/) : assemble les fonctionnalités
├── features/       Fonctionnalités métier : réservation, demandes, authentification, cookies, back-office…
├── components/     Composants réutilisables : ui/ (système de design), layout/, marketing/, content/, admin/
├── emails/         Gabarits des e-mails (React, styles en ligne), registre, rendu HTML, mise en forme
├── api/            Accès aux données : contrats, adaptateur Supabase, requêtes TanStack, base simulée des tests (mock/)
├── content/        Contenus d’origine des pages et des contenus (copiés dans la base), données des tests (demo/)
├── config/         Routes, navigation, variables d’environnement
├── lib/            Outils sans React : dates, formatage, Markdown, droits, validation (Zod)
├── hooks/          Hooks génériques (horloge, réseau, brouillons de formulaires…)
├── types/          Types métier partagés
├── styles/         Feuille de style unique : jetons, base, utilitaires
├── assets/         Logo et photos de l’équipe et des logements, optimisées (WebP, plusieurs tailles)
└── test/           Préparation des tests, rendus et données de test
```

Règle de dépendance : `pages → features → components → lib`, et **seule la couche `api` connaît la source des données**. Les composants importent leurs données depuis `@/api`, jamais depuis `api/supabase` ni `api/mock`.

## Architecture en bref

- **Données** — `api/contracts.ts` définit les dépôts (`list`, `update`…), implémentés par `api/supabase/` ; `api/queries.ts` décrit chaque lecture une seule fois (clé + fonction) ; les chargeurs de routes appellent `prefetch()` puis les composants lisent le cache avec `useSuspenseQuery`. Le back-office se met à jour en temps réel quand une demande arrive.
- **Navigation** — `config/routes.ts` centralise toutes les adresses (aucun lien en dur). Les routes du back-office déclarent la permission requise (`handle.permission`) ; le gabarit affiche « Accès refusé » si le rôle ne l’a pas. La source unique des droits est `lib/permissions.ts`.
- **Formulaires** — schémas Zod dans `lib/validation/`, résumé des erreurs relié aux champs, brouillons conservés, champ piège anti-spam, consentement explicite, limitation des envois.
- **E-mails** — chaque modèle (`emails/templates/`) reprend une maquette ; le texte (objet, titre, message) est modifiable dans le back-office avec des variables (`[prénom]`, `[référence]`…). L’aperçu rend le vrai HTML dans un cadre isolé (ordinateur ou mobile).
- **Responsive** — vérifié de 280 px (Galaxy Z Fold replié) à 1366 px (iPad Pro), téléphones à l’horizontale compris ; règles à respecter dans [docs/architecture.md](docs/architecture.md).
- **Accessibilité** — lien d’évitement, focus déplacé à chaque page, vrais boutons radio, messages d’erreur annoncés, fenêtres `<dialog>` natives ; couleurs et tailles de cible choisies pour la lisibilité (objectif : WCAG 2.2 niveau AA).
- **E-mails automatiques** — confirmation au demandeur, notification à l’équipe et rendez-vous confirmé, envoyés par l’Edge Function `envoi-emails` via Resend (file d’attente, nouvelles tentatives, aucun double envoi) : voir [docs/base-de-donnees.md](docs/base-de-donnees.md).
- **Sécurité** — aucun HTML saisi n’est interprété (Markdown maison), liens filtrés, redirections limitées au back-office, verrouillage après 5 échecs, double authentification par code envoyé par e-mail (Resend, envois et essais limités), déconnexion après inactivité. Les droits sont appliqués par la base (RLS) : tant que le code de la session n’a pas été validé, aucune donnée n’est renvoyée ; les envois publics sont contrôlés et limités côté serveur.

Détails : [docs/architecture.md](docs/architecture.md).

## Variables d’environnement

| Variable                        | Rôle                                                       |
| ------------------------------- | ---------------------------------------------------------- |
| `VITE_SITE_URL`                 | Adresse publique (URL canoniques, partage, plan du site)   |
| `VITE_DATA_SOURCE`              | `supabase` (par défaut) ou `mock` (base simulée des tests) |
| `VITE_SUPABASE_URL`             | Adresse du projet Supabase                                 |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clé publique `sb_publishable_…` (jamais la clé secrète)    |
| `VITE_MOCK_LATENCY_MS`          | Latence simulée des écritures en mode `mock`               |

Toute variable `VITE_*` est visible dans le navigateur : **aucun secret** ne doit y figurer.

## Déploiement

Le site est prévu pour **Cloudflare Workers** : `wrangler.jsonc`, `worker/index.ts` et `public/_headers` règlent les adresses de l’application, le cache et les en-têtes de sécurité. Mise en ligne automatique depuis GitHub, nom de domaine, réglages Supabase et vérifications : [docs/deploiement-cloudflare.md](docs/deploiement-cloudflare.md).

La politique de sécurité du contenu (CSP) est ajoutée à `index.html` à la compilation, à partir de l’adresse Supabase configurée : elle s’applique quel que soit l’hébergeur. `vercel.json` reste valable pour Vercel (dossier racine du projet : `lasistant-pro`). Sur un autre hébergeur, deux réglages sont indispensables :

1. **Application à page unique** : toute adresse inconnue doit renvoyer `index.html` (réécriture « SPA »), sinon un rechargement sur `/services/logement-hebergement` donnerait une erreur 404 de l’hébergeur. Les fichiers introuvables de `/assets/` doivent, eux, recevoir une vraie 404.
2. **Cache** : les fichiers de `dist/assets/` portent une empreinte dans leur nom et peuvent être mis en cache un an ; `index.html` ne doit pas être mis en cache.

## Avant la mise en ligne

Plusieurs informations sont signalées « à valider » (en doré sur le site) : mentions légales, durées de conservation, modalités de certains services… La liste complète, à faire valider par LASISTANT.PRO, est dans [docs/contenus-a-valider.md](docs/contenus-a-valider.md).

Les photos de l’équipe montrent des patients et des clients reconnaissables : leur accord écrit (droit à l’image) doit être recueilli avant la mise en ligne. Dans la médiathèque, ces photos portent la mention « Droits d’utilisation à confirmer avant publication » jusqu’à ce que la case « Droits d’utilisation confirmés » soit cochée.

## Conventions

- Code et noms techniques en anglais, **commentaires et textes en français**.
- Typographie française : espaces insécables avant `? ! : ;`, guillemets « », apostrophe typographique ’.
- Couleurs, rayons et ombres uniquement via les jetons Tailwind du système de design (pas de couleur en dur), sauf dans les e-mails (styles en ligne obligatoires, palette dans `emails/email-theme.ts`).
- Un fichier de composant n’exporte que des composants (rechargement à chaud) ; les fonctions partagées vivent dans des modules `.ts`.
