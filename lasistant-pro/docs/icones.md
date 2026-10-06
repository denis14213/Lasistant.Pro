# Système d’icônes

Les icônes font partie du système de design au même titre que les couleurs ou la typographie. Elles ne servent pas à « décorer » une section : chacune a une fonction, un dessin choisi pour cette fonction et une place dans une hiérarchie. Une interface avec moins d’icônes, mieux choisies, vaut mieux qu’une interface remplie d’icônes génériques.

## 1. Choix de la bibliothèque : Phosphor Icons

Le style du site a guidé le choix :

- typographie éditoriale (Instrument Sans, mots d’accent en Instrument Serif italique) ;
- boutons « pill », grands rayons, photos aux coins en feuille, filets fins ;
- palette chaleureuse (violet, vert, or) et un ton humain, celui d’un service d’accompagnement.

**Phosphor Icons** (`@phosphor-icons/react`, licence MIT, usage commercial autorisé) correspond à ce langage :

- ses terminaisons et jonctions arrondies prolongent les formes du site ;
- ses graisses (regular, bold, duotone, fill) permettent une hiérarchie complète **sans mélanger plusieurs familles** ;
- le dessin « duotone » (trait et aplat à 20 %) donne aux icônes d’identité une présence douce, teintée par la couleur du service ;
- la famille couvre le vocabulaire du métier : stéthoscope, main qui porte un cœur, avion à l’atterrissage, valise, dossier sous la loupe, appartement, porte, lit, étudiant, poignée de main.

Lucide (la bibliothèque précédente) est l’icône par défaut des interfaces générées par des outils comme shadcn, Lovable ou Bolt. Ses traits uniformes de 2 px donnaient au site cet air « déjà vu ». Heroicons et Tabler partagent ce registre neutre et technique ; Material Symbols évoque une application Google plutôt qu’un service éditorial.

## 2. Organisation du code

| Fichier                                      | Rôle                                                                                                       |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `components/ui/icon-factory.tsx`             | Moteur : `defineIcon`, graisse optique, accessibilité, `IconWeightScope`, types `AppIcon` et `IconWeight`. |
| `components/ui/icons.tsx`                    | Icônes du site public et icônes partagées (67).                                                            |
| `components/ui/icons-admin.tsx`              | Icônes réservées au back-office (53), chargées uniquement avec lui.                                        |
| `components/ui/icon-registry.ts`             | Noms stockés par les contenus et la base (`IconName`) → icône du système.                                  |
| `components/layout/admin/admin-nav-icons.ts` | Icônes de la navigation du back-office (`AdminIconName`).                                                  |
| `components/ui/Icon.tsx`                     | `Icon` (par nom), `IconBox` (pastille), `FeatureIcon` (icône d’identité sans pastille).                    |

Règles :

- **Les icônes sont nommées d’après leur fonction**, jamais d’après leur dessin : `IconDelete`, `IconArrival`, `IconCare`, et non `TrashIcon`, `PlaneIcon`, `HeartIcon`. Le dessin se choisit une fois, dans le module d’icônes ; le changer met à jour tout le site.
- **Les contenus stockent un nom de fonction** (`care`, `arrival`, `fileReview`), jamais un nom de dessin.
- **Aucun fichier n’importe la bibliothèque directement** : ESLint (`no-restricted-imports`) refuse `@phosphor-icons/react` et `lucide-react` en dehors des trois modules du système.

## 3. Hiérarchie

| Niveau                        | Exemples                                                       | Dessin                                                          | Taille     |
| ----------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------- | ---------- |
| Navigation                    | menu, fermer, chevrons, fil d’Ariane, pagination               | bold, discrète (couleur atténuée)                               | 14 à 18 px |
| Actions                       | envoyer, ajouter, modifier, supprimer, copier, flèche d’appel  | bold, couleur du libellé                                        | 16 à 19 px |
| États du système              | succès, information, avertissement, erreur, chargement         | bold à 16 px, regular à 24 px (encadrés) ; fill (notifications) | 16 à 24 px |
| Grands états                  | hors connexion, maintenance, session expirée, page introuvable | regular, dans un disque teinté                                  | 28 à 48 px |
| Identité (métiers, publics)   | assistance médicale, logement, accompagnement, étudiants       | duotone                                                         | 18 à 40 px |
| Rubrique active (back-office) | menu latéral                                                   | fill                                                            | 18 px      |
| Barre d’onglets (téléphone)   | Accueil, Services, Réserver, Espace infos, Contact             | regular ; fill pour l’onglet actif                              | 24 px      |

### Graisse optique

Phosphor dessine ses traits proportionnellement à la taille : un même dessin « regular » fait 1 px de trait à 16 px et 1,5 px à 24 px. Pour garder un trait constant (environ 1,3 à 1,9 px, accordé aux libellés semi-gras), **les icônes de 20 px et moins prennent le dessin « bold », celles de 24 px et plus le dessin « regular »**. C’est automatique :

- une icône dimensionnée par sa classe (`size-4`, `size-4.5`, `size-[1.1em]`) choisit sa graisse ;
- un composant qui dimensionne ses icônes (`[&_svg]:size-4`) l’impose par `IconWeightScope` : boutons, liens, étiquettes, encadrés, menus, barres d’outils ;
- une graisse explicite (`weight="duotone"`) l’emporte toujours.

Échelle : **14, 16, 18 px** pour l’interface ; **24, 28, 32 px** et plus pour l’identité et les grands états. La taille de 20 px n’est pas utilisée.

## 4. Composition

- **Pastille (`IconBox`)** : réservée aux services, avec la teinte propre à chacun (violet pour l’assistance médicale, vert pour le logement, or pour l’accompagnement), aux encarts posés sur une photo et au back-office.
- **Icône seule (`FeatureIcon`)** : caractéristiques concrètes d’une grille (types de logement, étapes du dossier), coordonnées, bandeaux d’appel. Une seule teinte par grille : celle du service présenté.
- **Pas d’icône pour une qualité abstraite** : « Écoute », « Sécurité », « Confort », « Bien-être »… sont numérotées en italique éditorial (01, 02, 03), comme les étapes des parcours (`FeatureGrid marker="number"`, `ValuesStrip`). Une icône littérale (bulle, bouclier, canapé, soleil) n’apporterait rien.
- **Pas d’icône dans les étiquettes de public ou de critère** : le libellé suffit (« Patients internationaux », « Votre budget »).
- **Une icône par bouton au plus** : flèche finale pour aller plus loin, ou icône initiale pour préciser l’action, jamais les deux.
- **Pas d’emoji ni de caractère** (✓, ★, →) à la place d’une icône d’interface.
- **Marques** : les mentions dans le texte utilisent les logos du système (`IconFacebook`, `IconWhatsApp`). Le bouton flottant WhatsApp garde le logo plein officiel (`WhatsAppLogo`), que les visiteurs reconnaissent et que la charte de WhatsApp demande de ne pas redessiner.

## 5. Accessibilité

- Une icône est **décorative par défaut** (`aria-hidden`) : le texte voisin porte le sens.
- Avec un `aria-label`, elle devient une image nommée (`role="img"`), par exemple « Oui » / « Non » dans un tableau de droits.
- Un bouton composé d’une seule icône reçoit toujours un libellé (`IconButton label="…"`).
- Les icônes héritent de la couleur du texte (`currentColor`). Sur fond sombre, les icônes d’état utilisent les teintes claires prévues (`success-light`, `danger-bright`, `brand-light`).

## 6. Ajouter une icône

1. Partir de la **fonction** et de l’intention de l’utilisateur, pas du mot affiché.
2. Comparer plusieurs dessins sur [phosphoricons.com](https://phosphoricons.com) et retenir le plus clair et le plus sobre dans le contexte réel.
3. Vérifier qu’une icône du système ne remplit pas déjà cette fonction.
4. L’ajouter dans `icons.tsx` (site public ou partagée) ou `icons-admin.tsx` (back-office seulement), dans la bonne section, avec un commentaire qui décrit sa fonction : `export const IconStay = defineIcon(SuitcaseRollingIcon, 'stay');`.
5. Si un contenu doit pouvoir la désigner, ajouter son nom de fonction à `IconName` et au registre.

## 7. Vérification

- Tests : `components/ui/icons.test.tsx` (accessibilité, graisse optique, registre complet, nom inconnu sans plantage).
- Chaque icône rendue porte `data-icon` (sa fonction) et `data-weight` (sa graisse) : dans la console du navigateur, `document.querySelectorAll('svg[data-icon]')` dresse l’inventaire d’une page.
- Avant chaque livraison, vérifier visuellement les icônes de chaque page (ordinateur et mobile) et retirer toute icône générique, répétitive ou incohérente.

## 8. Performance

- Chaque icône Phosphor embarque ses six graisses ; le site n’en utilise que quatre. Le greffon `phosphorUnusedWeights` de `vite.config.ts` retire « thin » et « light » du paquet de production, soit un tiers du poids des icônes.
- Les icônes du back-office (`icons-admin.tsx`) et ses gabarits sont chargés à la demande : le site public ne les télécharge pas.
- Mesures (octobre 2026, compression gzip) : icônes, composants et images partagés du site public ≈ 42 Ko ; icônes du back-office ≈ 22 Ko, chargées seulement dans le back-office.
- Piste suivante si le poids devient critique : déclarer pour chaque icône les seules graisses qu’elle utilise, et les filtrer à la compilation.
