# Architecture

Ce document complète le [README](../README.md) : il explique comment le code est organisé, pourquoi, et où intervenir pour chaque type d’évolution.

## 1. Couches et dépendances

```text
pages/        assemble une page : données de la route, mise en page, fonctionnalités
  ↓
features/     logique et composants d’une fonctionnalité (réservation, demandes, compte…)
  ↓
components/   composants génériques sans logique métier (système de design, gabarits)
  ↓
lib/, hooks/  fonctions pures et hooks génériques

api/          seule couche qui connaît la source des données (Supabase en production)
content/      contenus d’origine des pages et des contenus (copiés dans la base), données des tests
config/       routes, navigation, variables d’environnement
```

- Une couche n’importe jamais une couche située au-dessus d’elle.
- Les composants lisent les données via `@/api` (requêtes et dépôts), jamais via `api/supabase` ni `api/mock`.
- Les fichiers `.tsx` n’exportent que des composants (exigence du rechargement à chaud) ; les fonctions partagées sont dans des modules `.ts` voisins (`request-topic.ts`, `session-guards.ts`, `count-dirty.ts`…).

## 2. Flux de données

```text
Route (loader) ──prefetch()──▶ TanStack Query ──queryFn──▶ dépôt (contrat api/contracts.ts)
                                     ▲                            │
Composant ──useSuspenseQuery()───────┘                            ▼
                                        api/supabase : API REST, fonctions RPC, stockage, Auth
                                        (api/mock : base simulée, réservée aux tests)
```

1. **Lecture** — chaque requête est décrite une seule fois dans `api/queries.ts` (clé + fonction). Le chargeur de la route appelle `prefetch(...)` : la page s’affiche quand ses données sont prêtes, sans cascade de chargements. Les composants lisent ensuite le cache avec `useSuspenseQuery`.
2. **Écriture** — les composants appellent un dépôt dans une mutation (`useMutation`), puis invalident les clés concernées (`queryKeys.bookings`…). Dans le back-office, les changements des demandes faits par un collègue arrivent en temps réel (`features/admin/realtime/useLiveRequests.ts`).
3. **Erreurs** — les dépôts lèvent des `DataError` typées (`not_found`, `offline`, `rate_limited`, `validation`, `forbidden`, `server`) au message lisible. Les erreurs de la base sont traduites par `api/supabase/errors.ts`. Une ressource absente dans un chargeur devient une vraie erreur 404 (`orNotFound`).

### Ports et adaptateurs

- `api/contracts.ts` décrit chaque dépôt (réglages, services, articles, pages du site, demandes, équipe, compte, médias, modèles d’e-mails, sauvegarde) et l’authentification.
- `api/supabase/` les implémente avec la base de production ; `api/mock/` avec une base simulée dans le navigateur, utilisée par les tests automatisés.
- `api/source.ts` choisit l’implémentation. Lorsque `VITE_DATA_SOURCE=mock` (tests), Vite remplace ce module par `api/mock/source.ts` (alias dans `vite.config.ts`) : **le site publié ne contient ni la base simulée ni ses données fictives**.

La base de données elle-même (tables, règles d’accès, fonctions serveur, stockage) est décrite dans [base-de-donnees.md](base-de-donnees.md).

### Contenus des pages

Aucun texte de page n’est figé dans les composants : chaque page lit son contenu dans la base (table `page_contents`), modifiable dans « Pages du site » par les éditeurs et les administrateurs.

- `content/pages/` contient le **contenu d’origine** de chaque page (`PAGE_DEFAULTS`, 16 clés : `accueil`, `services`, `mentions-legales`, `identite` pour les contenus communs…). Il sert de structure de référence, de contenu initial de la base et de repli tant que rien n’est enregistré.
- La route racine précharge tous les contenus en une seule requête (`pageContentsQuery()`) ; un composant lit sa page avec `usePageContent('accueil')` (`features/content/usePageContent.ts`), sans nouvel appel réseau.
- `lib/content-merge.ts` complète une page enregistrée avec la structure d’origine : une rubrique ajoutée au code apparaît sans migration, une valeur de type inattendu est ignorée, une liste enregistrée est conservée.
- L’éditeur (`features/admin/pages/`) est **déduit de la structure** : un texte devient un champ, un titre `{ start, accent, end }` trois champs, une liste des éléments à ajouter, retirer et réordonner, une clé d’image un sélecteur (photos du site ou médiathèque). Ajouter un champ au contenu d’origine suffit à le rendre modifiable ; seul son libellé est à déclarer dans `content-fields.ts`.
- Restent volontairement dans le code les textes des écrans système (hors connexion, erreur, maintenance) : ils doivent s’afficher même quand la base est injoignable.

### Photos

- `assets/images/index.ts` est le registre des photos fournies avec le site (WebP, plusieurs largeurs, texte alternatif). Les contenus et la base désignent une photo par sa clé (`teamMeeting`, `livingRoom`…) ou par l’adresse d’un fichier de la médiathèque ; `lib/images.ts` résout l’une ou l’autre.
- Photos de l’équipe LASISTANT.PRO pour les accompagnements, photos des logements pour l’hébergement. `LEGACY_IMAGE_KEYS` fait correspondre les clés des anciennes photos d’illustration aux nouvelles : un contenu ancien n’affiche jamais d’image cassée.
- Une même photo peut exister en plusieurs cadrages (`teamVehicle` en bandeau, `teamVehicleDoor` en format vertical) : choisir celui qui correspond à l’emplacement. Une photo dont le sujet n’est pas au centre déclare son point d’intérêt (`focus`, valeur `object-position`) : `ResponsiveImage` le garde visible quel que soit le recadrage.

## 3. Navigation

- `config/routes.ts` est la source unique des adresses. Les adresses sont en français et stables.
- `app/router.tsx` : route racine (réglages préchargés, écran d’attente, erreur globale), puis `app/routes/public-routes.tsx` et `app/routes/admin-routes.tsx`.
- Chaque page est un module chargé à la demande qui exporte `Component` et, si besoin, `loader`. Les gabarits du back-office (`AuthLayout`, `AdminLayout`) et son affichage d’erreur le sont aussi : le site public ne télécharge pas le code du back-office.
- Erreurs : `PublicRouteError` (dans le gabarit du site), `AdminRouteError` (dans le gabarit du back-office), `RootError` (dernier recours). Un échec de chargement d’un fichier après une mise en ligne provoque un rechargement unique de la page (`main.tsx`).

## 4. Back-office : session et droits

- `features/auth/session-guards.ts` : `requireSession` protège les chargeurs (aucune donnée n’est chargée sans session), `safeRedirect` limite les redirections au back-office.
- `features/auth/auth-service.ts` : règles de connexion (verrouillage après 5 échecs pendant 15 minutes, double authentification, liens à usage unique, réponses identiques que le compte existe ou non) ; la vérification est confiée à Supabase Auth (`api/supabase/auth.ts`).
- `lib/permissions.ts` : rôles (administrateur, éditeur, opérateur) et permissions. Le menu, la protection des pages (`handle.permission`) et la matrice de « Utilisateurs & rôles » lisent tous ce fichier.
- Les règles d’accès sont appliquées **par la base** (RLS) : la protection côté navigateur n’est qu’un confort d’interface. Une session dont la double authentification n’est pas validée n’obtient aucune donnée.
- Les actions sensibles (réglages, invitations, rôles, modèles d’e-mails, publications) sont consignées par la base dans le journal d’activité (`activity_log`), visible dans « Mon compte ».

## 5. Formulaires

- Schémas Zod dans `lib/validation/` (`public-forms.ts`, `admin-forms.ts`, `common.ts`), messages en français.
- `FormErrorSummary` liste les erreurs et renvoie vers chaque champ ; `Field` relie libellé, aide et erreur au contrôle (`aria-describedby`, `aria-invalid`).
- Protection des formulaires publics : champ piège invisible, consentement obligatoire, revérification du créneau avant l’envoi d’une réservation ; côté serveur, contrôle complet des données, du créneau et limite de 5 envois par adresse IP en 10 minutes (`submit_booking`).
- `hooks/useFormDraft.ts` conserve la saisie en cours (hors consentement) en cas de fermeture accidentelle.

## 6. E-mails

```text
emails/
├── catalog.ts          clés des modèles et variables proposées (module pur)
├── email-markup.ts     mise en forme légère du texte (gras, liens, listes, boutons) + version texte
├── EmailLayout.tsx     enveloppe, carte, en-têtes « marque » et « équipe », pieds de page
├── EmailParts.tsx      blocs : boutons, récapitulatif, étapes, encadrés…
├── EmailBody.tsx       rendu du texte saisi dans le back-office
├── templates/          un gabarit par maquette (confirmation, notification, rendez-vous…)
├── registry.ts         gabarit, adresse d’envoi et destinataire de chaque modèle
├── EmailDocument.tsx   e-mail complet d’un modèle
└── render.ts           HTML autonome (aperçu, téléchargement)
```

L’envoi réel est fait par l’Edge Function `supabase/functions/envoi-emails` : son moteur de rendu (`gabarits.ts`, TypeScript pur, sans React) reproduit les gabarits de l’aperçu. `src/emails/server-parity.test.tsx` compare, pour chaque modèle et plusieurs demandes types, le texte visible, les liens et les images des deux rendus : modifier un gabarit sans reporter la modification fait échouer les tests.

- Le texte modifiable (objet, titre, message) est enregistré dans le modèle ; la mise en page (récapitulatif, boutons, pied de page) dépend du gabarit.
- Les variables sont remplacées **après** l’analyse de la mise en forme : une valeur saisie par un demandeur ne peut jamais créer de lien ni de mise en forme.
- Styles en ligne et mise en page par tableaux : rendu fiable dans les messageries. La palette est dans `emails/email-theme.ts` (les variables CSS n’existent pas dans un e-mail).
- `react-dom/server` n’est chargé que par les pages e-mails du back-office (groupe `email-renderer` dans `vite.config.ts`).

## 7. Styles et système de design

- `styles/index.css` : jetons (`@theme`), base, utilitaires. Aucune couleur en dur dans les composants.
- `components/ui/` : boutons, champs, badges, fenêtres, encadrés… réutilisés partout ; `cn()` fusionne les classes Tailwind sans conflit.
- Images : variantes WebP déclarées avec leurs dimensions (`ResponsiveImage`), sans décalage de mise en page.
- Icônes : un système unique bâti sur Phosphor Icons, nommé par fonction, avec une graisse adaptée à la taille et une hiérarchie (navigation, actions, états, identité). Règles, choix des dessins et procédure d’ajout : [docs/icones.md](icones.md).

### Responsive : règles à respecter

Le site est vérifié de 280 px (Galaxy Z Fold replié) à 1366 px (iPad Pro à l’horizontale), en passant par les Samsung Galaxy (360, 384, 412 px), les iPhone (375 à 430 px), les pliants et les tablettes. Pour qu’il le reste :

- **Grilles** : toujours une colonne de base `grid-cols-1` (soit `minmax(0, 1fr)`) avant les colonnes `md:` / `lg:`. Sans elle, la colonne implicite s’élargit jusqu’au contenu le plus large et la page déborde.
- **Flex** : un élément qui contient du texte long ou un tableau reçoit `min-w-0` ; une largeur minimale s’écrit `min-w-[min(240px,100%)]`.
- **Défilement horizontal** (tableaux, onglets) : le conteneur `overflow-x-auto` est aussi `relative`, sinon les textes réservés aux lecteurs d’écran s’en échappent et élargissent la page.
- **Tableaux de contenu** : `ResponsiveTable` (cartes sous 640 px). Les tableaux du back-office défilent dans leur panneau (`AdminTable`).
- **Boutons** : le libellé peut passer sur deux lignes ; ne pas rétablir `whitespace-nowrap` sur un libellé long.
- **Champs de saisie** : 16 px minimum sous 768 px (`text-base md:text-[…]`), sinon Safari sur iPhone zoome au focus.
- **Éléments fixes** (barre d’onglets, bouton WhatsApp, bandeau cookies) : décalés de `env(safe-area-inset-*)` pour la barre de gestes Android et l’encoche des iPhone.
- **Barre d’onglets sur téléphone** (moins de 768 px, `MobileBottomNavigation`) : Accueil, Services, Réserver (au centre, en relief), Espace infos, Contact. Sa hauteur, zone de gestes comprise, est la variable CSS `--mobile-nav-height` ; tout élément flottant se place au-dessus avec `bottom-[calc(var(--mobile-nav-height)+…)]`. Sur téléphone, l’en-tête se limite au logo et au menu, et le bouton « Cookies » laisse la place au lien « Gestion des cookies » du pied de page. Tablette et ordinateur ne changent pas.
- **Filet de sécurité** : `html { overflow-x: clip }` empêche tout défilement horizontal de la page. Il ne dispense pas de corriger la cause d’un débordement.

## 8. Référencement

- `components/seo/Seo.tsx` met à jour titre, description, URL canonique, Open Graph et indexation de chaque page ; les pages du back-office sont exclues (`noIndex`).
- Données structurées schema.org : entreprise locale, articles, FAQ, fil d’Ariane (`components/seo/structured-data.ts`).
- `public/sitemap.xml` est généré avant chaque compilation (`scripts/generate-sitemap.mjs`) ; `public/robots.txt` exclut `/admin`.
- Les robots et les aperçus de liens, qui n’annoncent pas une navigation, reçoivent la page comme un visiteur (Worker Cloudflare, voir [deploiement-cloudflare.md](deploiement-cloudflare.md)).

## 9. Sécurité du site publié

- **CSP** ajoutée à `index.html` à la compilation (`contentSecurityPolicy` dans `vite.config.ts`) : scripts du site uniquement (ni script en ligne, ni `eval` ; Zod fonctionne sans compilation, `z.config({ jitless: true })`), connexions limitées au projet Supabase configuré (HTTPS et WebSocket), aucun objet embarqué, formulaires vers le site seulement. Elle suit `VITE_SUPABASE_URL` : changer de projet ne demande aucune retouche.
- **En-têtes HTTP** (`public/_headers` sur Cloudflare, `vercel.json` sur Vercel) : affichage dans un cadre interdit, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, back-office jamais indexé ni mis en cache.
- Ajouter un service tiers (mesure d’audience, carte, vidéo) impose d’ouvrir la CSP pour son seul domaine, et de le déclarer dans la page Cookies.

## 10. Performance

- Une page = un fichier chargé à la demande ; les données sont préchargées par le chargeur de route.
- Bibliothèques regroupées dans des fichiers stables (`react`, `router`, `query`, `forms`) : une mise à jour du site ne force pas à les retélécharger.
- Icônes : les graisses inutilisées sont retirées à la compilation et les icônes du back-office forment un fichier à part (voir [docs/icones.md](icones.md#8-performance)).
- Lectures simulées immédiates, horloges partagées (`hooks/useNow.ts`) plutôt qu’un minuteur par composant.

## 11. Tests

`npm run test` exécute :

- les règles métier dans Node (rapide) : créneaux de réservation, Markdown, mise en forme des e-mails, droits, textes, consentement aux cookies, schémas de validation, indicateurs et filtres des demandes, redirections ;
- le rendu HTML de tous les modèles d’e-mails (aucune variable oubliée, aucun lien relatif) ;
- les contenus des pages (fusion avec le contenu d’origine, enregistrement, journal) et l’éditeur qui en est déduit ;
- le Worker Cloudflare (`worker/index.test.ts`) : 404 des fichiers introuvables, page servie aux robots, back-office protégé ;
- des tests d’interface dans jsdom (en-tête `@vitest-environment jsdom`) : demande rapide (erreurs puis envoi), navigation complète (accueil, 404, connexion avec double authentification, accès refusé selon le rôle).

Chaque test repart d’une base de démonstration neuve (`src/test/setup.ts`).
