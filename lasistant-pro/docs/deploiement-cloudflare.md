# Déploiement sur Cloudflare

Le site est publié sur **Cloudflare Workers** (fichiers statiques). Aucun serveur à maintenir : Cloudflare sert le dossier `dist` produit par `npm run build`, et la base de données reste chez Supabase.

## 1. Ce qui est déjà configuré

| Fichier           | Rôle                                                                                                                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `wrangler.jsonc`  | Nom du Worker (`lasistant-pro`), dossier publié (`dist`), routes de l’application : toute adresse sans fichier reçoit `index.html` (`single-page-application`)                                                                                   |
| `worker/index.ts` | Appelé seulement quand aucun fichier ne correspond **et** que la requête n’est pas une navigation : 404 pour un fichier introuvable (jamais la page HTML à la place d’un script), `index.html` pour les robots et aperçus de liens, 405 hors GET |
| `public/_headers` | En-têtes HTTP : cache d’un an des fichiers versionnés (`/assets/*`), sécurité (`X-Frame-Options`, `HSTS`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `COOP`), back-office jamais indexé ni mis en cache                                 |
| `vite.config.ts`  | Politique de sécurité du contenu (CSP) ajoutée à `index.html` à la compilation : scripts du site uniquement, connexions limitées au projet Supabase configuré (API, stockage, temps réel)                                                        |
| `.node-version`   | Node.js 22 pour la compilation chez Cloudflare                                                                                                                                                                                                   |
| `.env.production` | Configuration publique (adresse du site, projet Supabase, clé `sb_publishable_…`) : **aucune variable à saisir chez Cloudflare**                                                                                                                 |

Les fichiers et les pages sont servis sans exécuter de code : le Worker n’intervient que dans les cas décrits ci-dessus, ce qui reste très en deçà de l’offre gratuite (100 000 requêtes par jour).

## 2. Mise en ligne automatique depuis GitHub (recommandé)

Chaque `git push` sur la branche `main` compile et publie le site.

1. Tableau de bord Cloudflare › **Workers & Pages** › **Create** › **Import a repository**, puis choisir le dépôt GitHub.
2. Réglages de compilation :
   - **Root directory** : `lasistant-pro` (le projet est dans ce sous-dossier du dépôt) ;
   - **Build command** : `npm run build` ;
   - **Deploy command** : `npx wrangler deploy` ;
   - variables : aucune.
3. Enregistrer. La première compilation dure 2 à 3 minutes ; le site est alors en ligne à l’adresse `https://lasistant-pro.<votre-compte>.workers.dev`.

`npm run build` régénère le plan du site à partir de la base Supabase : la compilation échoue (et le site en ligne reste inchangé) si la base est injoignable.

## 3. Mise en ligne depuis un poste de travail

```bash
npx wrangler login     # une seule fois : ouvre le navigateur pour autoriser Wrangler
npm run deploy         # compile puis publie
```

Avant de publier, `npm run preview:cloudflare` sert la version compilée dans le simulateur de Cloudflare (`http://localhost:8787`), avec les mêmes en-têtes et les mêmes règles d’adresses qu’en production.

## 4. Nom de domaine

1. Le domaine `lasistant.pro` doit être géré par Cloudflare (**Websites › Add a domain**, puis remplacer les serveurs DNS chez le registraire par ceux indiqués).
2. Worker `lasistant-pro` › **Settings › Domains & Routes › Add › Custom domain** : `lasistant.pro`, puis `www.lasistant.pro`.
3. **Rules › Redirect Rules** : rediriger `www.lasistant.pro/*` vers `https://lasistant.pro/${1}` (301), l’adresse canonique du site étant `https://lasistant.pro`.

Réglages de la zone à vérifier (**Speed** et **Scrape Shield**) :

- **Rocket Loader : désactivé.** Il réécrit les scripts de la page, ce que la politique de sécurité du site bloque : le site ne s’afficherait plus.
- **Email Address Obfuscation : désactivé** (inutile, les adresses sont affichées par l’application).
- **Always Use HTTPS : activé.**
- Si vous activez **Web Analytics** avec injection automatique, ajoutez `https://static.cloudflareinsights.com` à `script-src` et `https://cloudflareinsights.com` à `connect-src` dans `contentSecurityPolicy` (`vite.config.ts`), en accord avec la page Cookies du site.

## 5. Supabase : adresses autorisées

Les liens de réinitialisation du mot de passe et d’invitation ramènent sur l’adresse du site d’où la demande est partie. Dans Supabase › **Authentication › URL Configuration** :

- **Site URL** : `https://lasistant.pro` ;
- **Redirect URLs** : ajouter `https://lasistant.pro/admin/reinitialiser-mot-de-passe` et `https://lasistant-pro.<votre-compte>.workers.dev/admin/reinitialiser-mot-de-passe` (adresse de test), en plus de `http://localhost:5173/admin/reinitialiser-mot-de-passe`.

Aucun autre réglage Supabase n’est lié à l’hébergeur : l’Edge Function `equipe` accepte les appels de toute origine, munis d’un jeton de session valide.

Le jour où le site passe sur `https://lasistant.pro`, mettez à jour l’adresse utilisée dans les liens et le logo des e-mails (Supabase › SQL Editor) :

```sql
select vault.update_secret(id, 'https://lasistant.pro') from vault.secrets where name = 'site_url_public';
```

## 6. Vérifications après la mise en ligne

- Ouvrir une page profonde puis la recharger (`/services/assistance-medicale`) : elle s’affiche, sans erreur 404.
- Ouvrir `/admin`, se connecter, ouvrir « Pages du site » et « Médiathèque ».
- En-têtes : `curl -I https://lasistant.pro/` doit montrer `x-frame-options: DENY` et `strict-transport-security`. Le score peut être contrôlé sur securityheaders.com.
- Partage : coller l’adresse du site dans WhatsApp ou Facebook affiche l’image de partage (`/og-image.jpg`).

## 7. Revenir à une version précédente

Worker `lasistant-pro` › **Deployments** › choisir une version › **Rollback**, ou `npx wrangler rollback` depuis un poste de travail. La base de données n’est pas concernée : un retour arrière du site ne modifie aucune donnée.

## 8. Autres hébergeurs

`vercel.json` reste valable pour Vercel (même cache et mêmes en-têtes ; la CSP est dans `index.html`). Sur Cloudflare **Pages**, `public/_headers` est pris en compte et les routes de l’application fonctionnent ; seule la réponse 404 aux fichiers introuvables, assurée par le Worker, n’y existe pas : préférez Workers.
