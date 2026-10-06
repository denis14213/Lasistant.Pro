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

api/          seule couche qui connaît la source des données (simulée ou Supabase)
content/      textes du site et données de démonstration
config/       routes, navigation, variables d’environnement
```

- Une couche n’importe jamais une couche située au-dessus d’elle.
- Les composants lisent les données via `@/api` (requêtes et dépôts), jamais via `api/mock`.
- Les fichiers `.tsx` n’exportent que des composants (exigence du rechargement à chaud) ; les fonctions partagées sont dans des modules `.ts` voisins (`request-topic.ts`, `session-guards.ts`, `count-dirty.ts`…).

## 2. Flux de données

```text
Route (loader) ──prefetch()──▶ TanStack Query ──queryFn──▶ dépôt (api/repositories)
                                     ▲                            │
Composant ──useSuspenseQuery()───────┘                            ▼
                                                   base simulée (api/mock/database.ts)
                                                   → Supabase en phase 2
```

1. **Lecture** — chaque requête est décrite une seule fois dans `api/queries.ts` (clé + fonction). Le chargeur de la route appelle `prefetch(...)` : la page s’affiche quand ses données sont prêtes, sans cascade de chargements. Les composants lisent ensuite le cache avec `useSuspenseQuery`.
2. **Écriture** — les composants appellent un dépôt dans une mutation (`useMutation`), puis invalident les clés concernées (`queryKeys.bookings`…). Les écritures simulées subissent une latence (états « Envoi en cours… » visibles) et échouent hors connexion.
3. **Erreurs** — les dépôts lèvent des `DataError` typées (`not_found`, `offline`, `rate_limited`, `validation`, `forbidden`, `server`) au message lisible. Une ressource absente dans un chargeur devient une vraie erreur 404 (`orNotFound`).

### Base simulée

`api/mock/database.ts` reproduit les tables du cahier des charges (réglages, services, articles, catégories, FAQ, demandes, historique, notes, utilisateurs, sessions, journal d’activité, médias, modèles d’e-mails). Elle est amorcée depuis `content/` puis conservée dans le stockage local du navigateur : une demande envoyée depuis le site apparaît réellement dans le back-office.

- `DATABASE_VERSION` : à incrémenter à chaque changement de structure (les données locales sont alors régénérées).
- `exportDatabase` / `importDatabase` : sauvegarde et restauration depuis « SEO, analytics & maintenance ».
- `resetDatabase` : bouton « Données de démonstration » du back-office et nettoyage entre les tests.

## 3. Navigation

- `config/routes.ts` est la source unique des adresses. Les adresses sont en français et stables.
- `app/router.tsx` : route racine (réglages préchargés, écran d’attente, erreur globale), puis `app/routes/public-routes.tsx` et `app/routes/admin-routes.tsx`.
- Chaque page est un module chargé à la demande qui exporte `Component` et, si besoin, `loader`. Les gabarits du back-office (`AuthLayout`, `AdminLayout`) et son affichage d’erreur le sont aussi : le site public ne télécharge pas le code du back-office.
- Erreurs : `PublicRouteError` (dans le gabarit du site), `AdminRouteError` (dans le gabarit du back-office), `RootError` (dernier recours). Un échec de chargement d’un fichier après une mise en ligne provoque un rechargement unique de la page (`main.tsx`).

## 4. Back-office : session et droits

- `features/auth/session-guards.ts` : `requireSession` protège les chargeurs (aucune donnée n’est chargée sans session), `safeRedirect` limite les redirections au back-office.
- `features/auth/auth-service.ts` : connexion simulée avec les mêmes règles que la future version (verrouillage après 5 échecs pendant 15 minutes, double authentification, lien de réinitialisation à usage unique valable 30 minutes, réponses identiques que le compte existe ou non).
- `lib/permissions.ts` : rôles (administrateur, éditeur, opérateur) et permissions. Le menu, la protection des pages (`handle.permission`) et la matrice de « Utilisateurs & rôles » lisent tous ce fichier.
- Les actions sensibles (réglages, invitations, rôles, modèles d’e-mails) sont consignées dans le journal d’activité (`api/mock/activity.ts`), visible dans « Mon compte ».

## 5. Formulaires

- Schémas Zod dans `lib/validation/` (`public-forms.ts`, `admin-forms.ts`, `common.ts`), messages en français.
- `FormErrorSummary` liste les erreurs et renvoie vers chaque champ ; `Field` relie libellé, aide et erreur au contrôle (`aria-describedby`, `aria-invalid`).
- Protection des formulaires publics : champ piège invisible, consentement obligatoire, 5 envois au plus en 10 minutes par onglet, revérification du créneau avant l’envoi d’une réservation.
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
└── render.ts           HTML autonome (aperçu, téléchargement, futur envoi serveur)
```

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

## 9. Performance

- Une page = un fichier chargé à la demande ; les données sont préchargées par le chargeur de route.
- Bibliothèques regroupées dans des fichiers stables (`react`, `router`, `query`, `forms`) : une mise à jour du site ne force pas à les retélécharger.
- Icônes : les graisses inutilisées sont retirées à la compilation et les icônes du back-office forment un fichier à part (voir [docs/icones.md](icones.md#8-performance)).
- Lectures simulées immédiates, horloges partagées (`hooks/useNow.ts`) plutôt qu’un minuteur par composant.

## 10. Tests

`npm run test` exécute :

- les règles métier dans Node (rapide) : créneaux de réservation, Markdown, mise en forme des e-mails, droits, textes, consentement aux cookies, schémas de validation, indicateurs et filtres des demandes, redirections ;
- le rendu HTML de tous les modèles d’e-mails (aucune variable oubliée, aucun lien relatif) ;
- des tests d’interface dans jsdom (en-tête `@vitest-environment jsdom`) : demande rapide (erreurs puis envoi), navigation complète (accueil, 404, connexion avec double authentification, accès refusé selon le rôle).

Chaque test repart d’une base de démonstration neuve (`src/test/setup.ts`).
