import { isoDaysAgo } from '@/lib/dates';
import type { Article } from '@/types';

/**
 * Articles de l'Espace infos.
 * Contenus d'exemple, rédigés sans promesse médicale : à remplacer ou valider
 * par LASISTANT.PRO avant la mise en production.
 *
 * Syntaxe du corps : voir `lib/markdown.tsx` (titres « ## », listes « - »,
 * encadrés « > », appel à l'action « ::cta », chapô « ::lede », mention « [[à valider]] »).
 */
export function createArticlesSeed(now = new Date()): Article[] {
  const author = 'L’équipe LASISTANT.PRO';
  return [
    {
      id: 'art-dossier-sejour-medical',
      slug: 'preparer-son-dossier-sejour-medical-tunisie',
      title: 'Préparer son dossier avant un séjour médical en Tunisie',
      excerpt:
        'Les documents à rassembler et les questions à anticiper avant l’étude préalable de votre dossier.',
      body: `::lede Un séjour pour poursuivre un traitement se prépare en amont. Voici les points à anticiper avant votre premier échange avec notre équipe.

## Rassembler les informations essentielles

L’étude préalable de votre dossier commence par une bonne compréhension de votre situation. Avant notre premier échange, préparez :

- vos coordonnées et celles d’une personne de confiance ;
- vos dates de séjour envisagées, même approximatives ;
- le motif général de votre venue, sans détails médicaux dans nos formulaires ;
- vos besoins en logement et en accompagnement.

> **Bon à savoir** Vos documents médicaux ne doivent pas transiter par les formulaires du site. Si l’étude de votre dossier le nécessite, nous vous indiquerons un moyen d’envoi sécurisé.

## Préparer vos documents de voyage

Vérifiez la validité de votre passeport et les formalités d’entrée applicables à votre nationalité auprès des autorités compétentes. Conservez une copie numérique de vos documents importants, accessible depuis votre téléphone.

## Anticiper votre logement

Selon la durée de votre séjour et le nombre de personnes qui vous accompagnent, le type de logement idéal varie. Nous recherchons des solutions adaptées à vos dates, à votre budget et aux offres disponibles. [Découvrir notre service logement](/services/logement-hebergement).

::cta

## Organiser votre arrivée

Le jour de votre arrivée, quelques informations simplifient l’accueil :

- vos horaires de vol et votre numéro de vol ;
- la présence éventuelle d’un accompagnant ;
- vos besoins pour le trajet jusqu’au logement ;
- les premières démarches à prévoir sur place.

## Préparer vos questions

Notez vos questions avant le premier échange de 1 h : ce temps est le vôtre. Logement, déplacements, déroulement du séjour : aucune question n’est trop simple.`,
      coverImage: 'documents',
      coverAlt: 'Documents, carnet et ordinateur portable sur un bureau',
      categoryId: 'assistance-medicale',
      status: 'publie',
      publishedAt: isoDaysAgo(8, '09:00', now),
      updatedAt: isoDaysAgo(8, '09:00', now),
      readingMinutes: 6,
      author,
      tags: ['Préparation', 'Séjour', 'Dossier'],
      featured: true,
      seo: {
        title: 'Préparer son dossier avant un séjour médical en Tunisie',
        description:
          'Documents à rassembler, voyage, logement, arrivée : les points à anticiper avant l’étude préalable de votre dossier.',
      },
      useCoverForSharing: true,
    },
    {
      id: 'art-logement-etudiant',
      slug: 'logement-etudiant-bien-preparer-sa-recherche',
      title: 'Logement étudiant : bien préparer sa recherche',
      excerpt: 'Budget, durée, commodités : nos conseils pour trouver une chambre ou une colocation adaptée.',
      body: `::lede Trouver un logement avant la rentrée demande un peu d’anticipation. Quelques repères pour cadrer votre recherche et gagner du temps.

## Définir un budget réaliste

Le loyer n’est qu’une partie du budget. Pensez aussi aux charges, à l’équipement éventuel et aux frais de transport jusqu’à votre établissement.

## Choisir entre chambre, studio et colocation

- **La chambre** convient aux budgets serrés et aux séjours courts.
- **Le studio** offre davantage d’indépendance.
- **La colocation** permet de partager les frais et de ne pas arriver seul(e).

## Penser aux commodités

Connexion Internet, proximité des transports, électroménager, sécurité de l’immeuble : listez ce qui compte vraiment pour vous et ce qui reste négociable.

> **Pour les parents** Nous savons combien il est rassurant de savoir son enfant bien installé. Nous vous tenons informés à chaque étape de la recherche.

## Anticiper les dates

Indiquez une date d’arrivée et, si possible, une durée de séjour. Plus vos critères sont précis, plus la recherche est rapide.

::cta`,
      coverImage: 'studyDesk',
      coverAlt: 'Bureau d’étudiant avec carnet et café',
      categoryId: 'logement',
      status: 'publie',
      publishedAt: isoDaysAgo(17, '10:00', now),
      updatedAt: isoDaysAgo(17, '10:00', now),
      readingMinutes: 5,
      author,
      tags: ['Étudiants', 'Logement', 'Budget'],
      featured: false,
      seo: {
        title: 'Logement étudiant en Tunisie : bien préparer sa recherche',
        description:
          'Budget, type de logement, commodités, dates : nos conseils pour trouver une chambre ou une colocation.',
      },
      useCoverForSharing: true,
    },
    {
      id: 'art-arriver-en-tunisie',
      slug: 'arriver-en-tunisie-ce-quil-faut-prevoir',
      title: 'Arriver en Tunisie : ce qu’il faut prévoir pour le jour J',
      excerpt: 'Accueil, transport, premières démarches : une liste simple pour une arrivée sereine.',
      body: `::lede Le jour de l’arrivée concentre beaucoup de petites questions. Cette liste vous aide à n’en oublier aucune.

## Avant le départ

- Transmettez-nous vos horaires et votre numéro de vol.
- Gardez vos documents de voyage à portée de main.
- Prévoyez un moyen de paiement utilisable dès l’arrivée.

## À l’arrivée

Notre accueil à l’aéroport vous évite de chercher votre chemin après le voyage. Nous convenons ensemble du point de rendez-vous et de l’heure.

> **Bon à savoir** En cas de retard de vol, prévenez-nous dès que possible : nous adaptons l’heure de l’accueil.

## Les premiers jours

Installation dans le logement, repérage des lieux utiles, premières démarches : nous restons disponibles pour vous aider à prendre vos marques.

::cta`,
      coverImage: 'airportTraveler',
      coverAlt: 'Voyageur avec sa valise dans un hall d’aéroport',
      categoryId: 'conseils-pratiques',
      status: 'publie',
      publishedAt: isoDaysAgo(24, '09:30', now),
      updatedAt: isoDaysAgo(24, '09:30', now),
      readingMinutes: 4,
      author,
      tags: ['Voyage', 'Arrivée'],
      featured: false,
      seo: {
        title: 'Arriver en Tunisie : ce qu’il faut prévoir pour le jour J',
        description:
          'Accueil à l’aéroport, transport, premières démarches : la liste pour une arrivée sereine.',
      },
      useCoverForSharing: true,
    },
    {
      id: 'art-proche-age',
      slug: 'accompagner-un-proche-age-pendant-son-sejour',
      title: 'Accompagner un proche âgé pendant son séjour',
      excerpt: 'Confort, sécurité, rythme : les points d’attention pour un séjour serein.',
      body: `::lede Un séjour loin de chez soi peut être fatigant pour une personne âgée. Quelques attentions simples font toute la différence.

## Respecter son rythme

Prévoyez des journées peu chargées, des temps de repos et des déplacements courts. Un programme léger est souvent le plus confortable.

## Préparer le logement

- Un accès facile (ascenseur, peu de marches) ;
- une chambre calme et bien éclairée ;
- les objets du quotidien à portée de main.

## Rester en lien avec la famille

Convenez à l’avance de la manière dont vous souhaitez être tenus informés pendant le séjour. [[Modalités de lien avec les proches à confirmer]]

> **Notre engagement** Une présence attentive, des services personnalisés et une attention constante au confort, à la sécurité et au bien-être.

::cta`,
      coverImage: 'seniorCare',
      coverAlt: 'Une soignante échange avec une patiente âgée',
      categoryId: 'accompagnement',
      status: 'publie',
      publishedAt: isoDaysAgo(31, '11:00', now),
      updatedAt: isoDaysAgo(31, '11:00', now),
      readingMinutes: 5,
      author,
      tags: ['Personnes âgées', 'Famille'],
      featured: false,
      seo: {
        title: 'Accompagner un proche âgé pendant son séjour en Tunisie',
        description: 'Rythme, logement, lien avec la famille : les points d’attention pour un séjour serein.',
      },
      useCoverForSharing: true,
    },
    {
      id: 'art-court-long-sejour',
      slug: 'court-ou-long-sejour-comment-choisir-son-logement',
      title: 'Court ou long séjour : comment choisir son logement ?',
      excerpt: 'Appartement, studio, chambre ou colocation : les critères qui font la différence.',
      body: `::lede La durée du séjour change beaucoup de choses : type de logement, budget, équipements. Voici comment raisonner.

## Pour un séjour court

Privilégiez un logement meublé, prêt à vivre, proche des lieux où vous devrez vous rendre. La simplicité prime sur la surface.

## Pour un séjour long

Un appartement ou une colocation offre plus d’espace et un coût mensuel souvent plus intéressant. Vérifiez les conditions de location avant de vous engager.

## Les questions à se poser

- Combien de personnes logeront sur place ?
- Quels équipements sont indispensables ?
- Quel budget maximum, et pour quelle période ?

Nous recherchons, selon les offres disponibles, des solutions attractives et dotées des commodités nécessaires.

::cta`,
      coverImage: 'bedroom',
      coverAlt: 'Chambre lumineuse et confortable',
      categoryId: 'logement',
      status: 'publie',
      publishedAt: isoDaysAgo(38, '10:15', now),
      updatedAt: isoDaysAgo(38, '10:15', now),
      readingMinutes: 5,
      author,
      tags: ['Logement', 'Séjour'],
      featured: false,
      seo: {
        title: 'Court ou long séjour : comment choisir son logement en Tunisie ?',
        description:
          'Appartement, studio, chambre ou colocation : les critères selon la durée de votre séjour.',
      },
      useCoverForSharing: true,
    },
    {
      id: 'art-etude-prealable',
      slug: 'etude-prealable-du-dossier-une-etape-cle',
      title: 'Pourquoi l’étude préalable du dossier est une étape clé',
      excerpt: 'Comprendre le rôle de cette étape et ce qu’elle vous permet d’anticiper.',
      body: `::lede Avant toute venue en Tunisie, nous prenons connaissance de votre demande. Cette étape conditionne la qualité de tout l’accompagnement.

## Ce que permet l’étude préalable

- Identifier les démarches à prévoir avant votre arrivée ;
- organiser le logement et l’accueil au bon moment ;
- faciliter l’orientation vers un médecin habilité à vous examiner sur place.

## Ce qu’elle n’est pas

L’étude préalable n’est ni une consultation ni un diagnostic. Seul le médecin qui vous examine est habilité à se prononcer sur votre situation.

> **Important** LASISTANT.PRO est un service d’accompagnement et de coordination. Nous ne remplaçons pas un professionnel de santé.

::cta`,
      coverImage: 'medicalTeam',
      coverAlt: 'Deux médecins échangent devant un écran',
      categoryId: 'assistance-medicale',
      status: 'publie',
      publishedAt: isoDaysAgo(45, '09:00', now),
      updatedAt: isoDaysAgo(45, '09:00', now),
      readingMinutes: 4,
      author,
      tags: ['Dossier', 'Orientation'],
      featured: false,
      seo: {
        title: 'Pourquoi l’étude préalable du dossier est une étape clé',
        description: 'Le rôle de l’étude préalable de votre dossier avant un séjour médical en Tunisie.',
      },
      useCoverForSharing: true,
    },
    {
      id: 'art-confort-domicile',
      slug: 'confort-et-securite-a-domicile-nos-reperes',
      title: 'Confort et sécurité à domicile : nos repères',
      excerpt: 'Les petites attentions qui rendent le quotidien plus simple pendant un séjour.',
      body: `::lede L’assistance à domicile repose sur une présence attentive et des gestes simples, pensés pour le confort de chacun.

## Un environnement rassurant

Un logement bien rangé, des passages dégagés et un éclairage suffisant limitent les risques et facilitent les déplacements.

## Un suivi personnalisé

Chaque personne a ses habitudes. Nous adaptons notre présence à son rythme, avec une approche chaleureuse. [[Modalités et zones d’intervention à confirmer]]

## Les bons réflexes

- Garder les numéros utiles à portée de main ;
- prévoir un temps d’échange régulier ;
- signaler sans attendre toute difficulté.

::cta`,
      coverImage: 'supportiveHands',
      coverAlt: 'Deux mains jointes en signe de soutien',
      categoryId: 'accompagnement',
      status: 'publie',
      publishedAt: isoDaysAgo(53, '14:00', now),
      updatedAt: isoDaysAgo(53, '14:00', now),
      readingMinutes: 3,
      author,
      tags: ['Domicile', 'Confort'],
      featured: false,
      seo: {
        title: 'Confort et sécurité à domicile : nos repères',
        description: 'Les attentions qui rendent le quotidien plus simple pendant un séjour.',
      },
      useCoverForSharing: true,
    },
    {
      id: 'art-premier-echange',
      slug: 'les-etapes-de-votre-premier-echange',
      title: 'Les étapes de votre premier échange avec notre équipe',
      excerpt:
        'Confirmation, déroulé de l’échange de 1 h et prochaines étapes : tout savoir sur votre premier contact avec notre équipe.',
      body: `::lede Vous avez fait une demande sur notre site ? Voici comment se déroule votre premier échange avec l’équipe LASISTANT.PRO.

## Avant l’échange

Après l’envoi de votre demande, vous recevez un e-mail de confirmation. Un membre de l’équipe vous contacte ensuite pour confirmer le créneau choisi.

## Pendant l’échange

Le premier échange dure environ 1 heure, par e-mail ou par téléphone. Nous faisons le point sur :

- votre situation et vos dates de séjour ;
- vos besoins de logement et d’accompagnement ;
- vos questions pratiques.

## Après l’échange

Nous vous indiquons les prochaines étapes et préparons avec vous la suite de votre accompagnement.`,
      coverImage: 'meeting',
      coverAlt: 'Deux femmes échangent autour d’une table',
      categoryId: 'conseils-pratiques',
      status: 'brouillon',
      publishedAt: null,
      updatedAt: isoDaysAgo(0, '08:10', now),
      readingMinutes: 2,
      author,
      tags: ['Réservation'],
      featured: false,
      seo: {
        title: 'Premier échange avec LASISTANT.PRO : comment ça se passe ?',
        description:
          'Confirmation, déroulé de l’échange de 1 h et prochaines étapes : tout savoir sur votre premier contact avec notre équipe.',
      },
      useCoverForSharing: false,
    },
  ];
}
