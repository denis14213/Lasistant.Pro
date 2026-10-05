# LASISTANT.PRO — site vitrine et back-office

Site de LASISTANT.PRO, service social d’assistance en Tunisie : **assistance médicale**, **logement et hébergement**, **accompagnement des malades**. Le projet réunit :

- le **site public** : accueil, services, réservation en ligne en 5 étapes, Espace infos (articles), FAQ, contact, pages légales, gestion des cookies, plan du site, pages d’erreur, maintenance et hors connexion, avec un bouton flottant WhatsApp pour joindre l’agence ;
- le **back-office** : tableau de bord, demandes et réservations, agenda et disponibilités, services, articles, médiathèque, coordonnées et réglages, SEO, mentions légales, modèles d’e-mails, utilisateurs et rôles, « Mon compte ».

> **Phase actuelle : 100 % statique.** Les données sont simulées dans le navigateur (stockage local) derrière une couche d’accès unique. Le branchement de la base de données (Supabase, phase 2) ne touche que cette couche : voir [docs/supabase-phase-2.md](docs/supabase-phase-2.md).

## Démarrage rapide

Prérequis : **Node.js 20.19 ou plus récent** (recommandé : Node 22 ou 24).

```bash
npm install
cp .env.example .env.local   # facultatif : les valeurs par défaut conviennent en local
npm run dev                  # http://localhost:5173
```

### Comptes de démonstration (back-office : `/admin`)

| Rôle           | Adresse                    | Accès                                        |
| -------------- | -------------------------- | -------------------------------------------- |
| Administrateur | `admin@lasistant.pro`      | Tout, y compris réglages, e-mails et comptes |
| Éditeur        | `contenus@lasistant.pro`   | Services, articles, médiathèque              |
| Opérateur      | `operateur1@lasistant.pro` | Demandes, agenda                             |

Mot de passe commun : `Lasistant2026!` · code de double authentification : `123456`.

Les données de démonstration peuvent être réinitialisées depuis la barre supérieure du back-office (« Données de démonstration »).

## Scripts

| Commande            | Rôle                                                                     |
| ------------------- | ------------------------------------------------------------------------ |
| `npm run dev`       | Serveur de développement avec rechargement à chaud                       |
| `npm run build`     | Plan du site (`public/sitemap.xml`), vérification TypeScript, production |
| `npm run preview`   | Sert le dossier `dist` pour tester la version de production              |
| `npm run sitemap`   | Régénère `public/sitemap.xml` à partir des contenus                      |
| `npm run typecheck` | Vérification des types                                                   |
| `npm run lint`      | ESLint (TypeScript, règles des hooks et du compilateur React)            |
| `npm run test`      | Tests Vitest (règles métier, formulaires, navigation, e-mails)           |
| `npm run format`    | Mise en forme Prettier (classes Tailwind triées)                         |
| `npm run check`     | Types + lint + tests : à lancer avant chaque livraison                   |

## Technologies

- **React 19** + **TypeScript** strict, **Vite 8**
- **React Router 7** en mode « données » : chaque page est chargée à la demande et précharge ses données
- **TanStack Query 5** : cache des données, états de chargement et d’erreur
- **React Hook Form** + **Zod** : formulaires et validation (messages en français)
- **Tailwind CSS 4** : jetons du système de design dans `src/styles/index.css`
- **Phosphor Icons** (`@phosphor-icons/react`, licence MIT) derrière un système d’icônes maison : voir [docs/icones.md](docs/icones.md)
- **Vitest** + **Testing Library**, **ESLint**, **Prettier**

## Structure du projet

```text
src/
├── app/            Démarrage : fournisseurs, routeur, routes publiques et back-office, erreurs de navigation
├── pages/          Une page par route (public/, admin/, system/) : assemble les fonctionnalités
├── features/       Fonctionnalités métier : réservation, demandes, authentification, cookies, back-office…
├── components/     Composants réutilisables : ui/ (système de design), layout/, marketing/, content/, admin/
├── emails/         Gabarits des e-mails (React, styles en ligne), registre, rendu HTML, mise en forme
├── api/            Accès aux données : dépôts, requêtes TanStack, base simulée (mock/)
├── content/        Textes et contenus du site, données de démonstration (demo/)
├── config/         Routes, navigation, variables d’environnement
├── lib/            Outils sans React : dates, formatage, Markdown, droits, validation (Zod)
├── hooks/          Hooks génériques (horloge, réseau, brouillons de formulaires…)
├── types/          Types métier partagés
├── styles/         Feuille de style unique : jetons, base, utilitaires
├── assets/         Logo et photos optimisées (WebP, plusieurs tailles)
└── test/           Préparation des tests, rendus et données de test
```

Règle de dépendance : `pages → features → components → lib`, et **seule la couche `api` connaît la source des données**. Les composants importent leurs données depuis `@/api`, jamais depuis `api/mock`.

## Architecture en bref

- **Données** — `api/repositories/*` exposent des fonctions asynchrones (`list`, `update`…) ; `api/queries.ts` décrit chaque lecture une seule fois (clé + fonction) ; les chargeurs de routes appellent `prefetch()` puis les composants lisent le cache avec `useSuspenseQuery`. Les écritures simulent la latence réseau et échouent hors connexion, comme le fera la vraie API.
- **Navigation** — `config/routes.ts` centralise toutes les adresses (aucun lien en dur). Les routes du back-office déclarent la permission requise (`handle.permission`) ; le gabarit affiche « Accès refusé » si le rôle ne l’a pas. La source unique des droits est `lib/permissions.ts`.
- **Formulaires** — schémas Zod dans `lib/validation/`, résumé des erreurs relié aux champs, brouillons conservés, champ piège anti-spam, consentement explicite, limitation des envois.
- **E-mails** — chaque modèle (`emails/templates/`) reprend une maquette ; le texte (objet, titre, message) est modifiable dans le back-office avec des variables (`[prénom]`, `[référence]`…). L’aperçu rend le vrai HTML dans un cadre isolé (ordinateur ou mobile).
- **Responsive** — vérifié de 280 px (Galaxy Z Fold replié) à 1366 px (iPad Pro), téléphones à l’horizontale compris ; règles à respecter dans [docs/architecture.md](docs/architecture.md).
- **Accessibilité** — lien d’évitement, focus déplacé à chaque page, vrais boutons radio, messages d’erreur annoncés, fenêtres `<dialog>` natives ; couleurs et tailles de cible choisies pour la lisibilité (objectif : WCAG 2.2 niveau AA).
- **Sécurité** — aucun HTML saisi n’est interprété (Markdown maison), liens filtrés, redirections limitées au back-office, verrouillage après 5 échecs, double authentification, déconnexion après inactivité. En phase 2, les mêmes règles sont appliquées côté serveur (politiques Supabase).

Détails : [docs/architecture.md](docs/architecture.md).

## Variables d’environnement

| Variable                 | Rôle                                                       |
| ------------------------ | ---------------------------------------------------------- |
| `VITE_SITE_URL`          | Adresse publique (URL canoniques, partage, plan du site)   |
| `VITE_DATA_SOURCE`       | `mock` (phase statique) ou `supabase` (phase 2)            |
| `VITE_MOCK_LATENCY_MS`   | Latence simulée des écritures en mode `mock`               |
| `VITE_SUPABASE_URL`      | Phase 2 : adresse du projet Supabase                       |
| `VITE_SUPABASE_ANON_KEY` | Phase 2 : clé publique « anon » (jamais la clé de service) |

Toute variable `VITE_*` est visible dans le navigateur : **aucun secret** ne doit y figurer.

## Déploiement

`npm run build` produit un site statique dans `dist/`, déployable sur tout hébergeur de fichiers statiques (Netlify, Vercel, Cloudflare Pages, serveur Nginx…). Deux réglages sont indispensables :

1. **Application à page unique** : toute adresse inconnue doit renvoyer `index.html` (réécriture « SPA »), sinon un rechargement sur `/services/logement-hebergement` donnerait une erreur 404 de l’hébergeur.
2. **Cache** : les fichiers de `dist/assets/` portent une empreinte dans leur nom et peuvent être mis en cache un an ; `index.html` ne doit pas être mis en cache.

En-têtes recommandés : `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.

## Avant la mise en ligne

Plusieurs informations sont signalées « à valider » (en doré sur le site) : mentions légales, durées de conservation, modalités de certains services… La liste complète, à faire valider par LASISTANT.PRO, est dans [docs/contenus-a-valider.md](docs/contenus-a-valider.md).

## Conventions

- Code et noms techniques en anglais, **commentaires et textes en français**.
- Typographie française : espaces insécables avant `? ! : ;`, guillemets « », apostrophe typographique ’.
- Couleurs, rayons et ombres uniquement via les jetons Tailwind du système de design (pas de couleur en dur), sauf dans les e-mails (styles en ligne obligatoires, palette dans `emails/email-theme.ts`).
- Un fichier de composant n’exporte que des composants (rechargement à chaud) ; les fonctions partagées vivent dans des modules `.ts`.
