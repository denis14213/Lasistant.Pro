-- =============================================================================
-- LASISTANT.PRO · 6/6 · Contenus initiaux
--
-- Fichier généré par « npm run db:seed-sql » à partir de src/content : ne pas modifier à la main.
-- Contenus réels du site uniquement (aucune demande ni personne fictive).
-- Idempotent : une ligne déjà présente n'est jamais écrasée.
-- =============================================================================

-- site_settings (1 ligne)
insert into public.site_settings (id, brand_name, tagline, description, phones, emails, address, opening_hours, facebook, whatsapp, booking, seo, analytics, maintenance, backups, legal, updated_at, updated_by)
select id, brand_name, tagline, description, phones, emails, address, opening_hours, facebook, whatsapp, booking, seo, analytics, maintenance, backups, legal, updated_at, updated_by
from jsonb_populate_recordset(null::public.site_settings, $seed$[
  {
    "id": 1,
    "brand_name": "LASISTANT.PRO",
    "tagline": "Soutien Médical et Hébergement",
    "description": "Service social d’assistance médicale, d’accompagnement et de recherche de logement en Tunisie, avec une approche humaine et personnalisée.",
    "phones": [
      {
        "id": "tel-principal",
        "label": "Principal",
        "value": "+216 54 479 391",
        "active": true
      },
      {
        "id": "tel-secondaire",
        "label": "Secondaire",
        "value": "+216 25 393 214",
        "active": true
      }
    ],
    "emails": [
      {
        "id": "mail-principal",
        "label": "Principal",
        "value": "imassist.service@hotmail.com",
        "active": true,
        "receivesNotifications": true
      },
      {
        "id": "mail-secondaire",
        "label": "Secondaire",
        "value": "moryendi@gmail.com",
        "active": true
      }
    ],
    "address": {
      "street": "Avenue Habib Thamer",
      "postalCode": null,
      "city": null,
      "country": "Tunisie",
      "validated": false
    },
    "opening_hours": null,
    "facebook": {
      "label": "imassist Tant",
      "url": null
    },
    "whatsapp": {
      "enabled": true,
      "number": "+216 54 479 391"
    },
    "booking": {
      "enabled": true,
      "durationMinutes": 60,
      "openDays": [
        1,
        2,
        3,
        4,
        5,
        6
      ],
      "ranges": [
        {
          "start": "09:00",
          "end": "12:00"
        },
        {
          "start": "14:00",
          "end": "17:00"
        }
      ],
      "minNoticeHours": 24,
      "horizonDays": 60,
      "closures": []
    },
    "seo": {
      "homeTitle": "LASISTANT.PRO · Soutien médical et hébergement en Tunisie",
      "titleTemplate": "%s | LASISTANT.PRO",
      "defaultDescription": "Assistance médicale, logement et accompagnement des malades en Tunisie. Un service social humain et personnalisé pour patients, familles et étudiants.",
      "shareImage": "/og-image.jpg",
      "structuredData": true,
      "robotsTxt": "User-agent: *\nDisallow: /admin\nAllow: /\n\nSitemap: https://lasistant.pro/sitemap.xml"
    },
    "analytics": {
      "enabled": false,
      "provider": null,
      "siteId": null,
      "requireConsent": true,
      "trackConversions": false
    },
    "maintenance": {
      "enabled": false,
      "message": "Le site LASISTANT.PRO est momentanément indisponible pour une opération de maintenance. Nous revenons très vite.",
      "returnAt": null
    },
    "backups": {
      "lastBackupAt": "2026-10-08T09:00:00.000Z",
      "frequency": "Quotidienne",
      "retentionDays": 30
    },
    "legal": {
      "companyName": null,
      "legalForm": null,
      "taxId": null,
      "registryNumber": null,
      "publicationDirector": null,
      "host": null,
      "lastUpdated": null
    },
    "updated_at": "2026-10-08T09:00:00.000Z",
    "updated_by": "LASISTANT.PRO"
  }
]$seed$::jsonb)
on conflict (id) do nothing;

-- services (4 lignes)
insert into public.services (id, slug, kind, title, subtitle, summary, description, highlights, details, audiences, icon, icon_tone, image, image_alt, cta_label, cta_href, active, show_in_menu, show_medical_disclaimer, sort_order, seo, updated_at, updated_by)
select id, slug, kind, title, subtitle, summary, description, highlights, details, audiences, icon, icon_tone, image, image_alt, cta_label, cta_href, active, show_in_menu, show_medical_disclaimer, sort_order, seo, updated_at, updated_by
from jsonb_populate_recordset(null::public.services, $seed$[
  {
    "id": "assistance-medicale",
    "slug": "assistance-medicale",
    "kind": "page",
    "title": "Assistance médicale",
    "subtitle": "Soins personnalisés",
    "summary": "Étude préalable de votre dossier et orientation vers un médecin habilité à vous examiner une fois en Tunisie.",
    "description": "Nous étudions en amont le dossier du patient qui souhaite poursuivre un traitement en Tunisie, puis l’orientons vers un médecin habilité à l’examiner une fois sur place. Une assistance à domicile, attentive et chaleureuse, peut compléter ce suivi.",
    "highlights": [
      "Étude préalable du dossier",
      "Orientation vers un médecin habilité",
      "Assistance à domicile, confort et sécurité"
    ],
    "details": [
      "Étude préalable de votre dossier",
      "Orientation vers un médecin habilité",
      "Coordination avec votre logement et votre accueil",
      "Suivi personnalisé à domicile"
    ],
    "audiences": [
      {
        "label": "Patients internationaux"
      },
      {
        "label": "Familles & proches"
      }
    ],
    "icon": "medical",
    "icon_tone": "brand",
    "image": "seniorCare",
    "image_alt": "Une soignante accompagne une patiente âgée",
    "cta_label": "Demander un accompagnement",
    "cta_href": "/reservation?service=assistance-medicale",
    "active": true,
    "show_in_menu": true,
    "show_medical_disclaimer": true,
    "sort_order": 1,
    "seo": {
      "title": "Assistance médicale en Tunisie",
      "description": "Étude préalable de votre dossier et orientation vers un médecin habilité en Tunisie. Un accompagnement humain et personnalisé pour votre séjour."
    },
    "updated_at": "2026-10-08T09:00:00.000Z",
    "updated_by": "LASISTANT.PRO"
  },
  {
    "id": "logement-hebergement",
    "slug": "logement-hebergement",
    "kind": "page",
    "title": "Logement & hébergement",
    "subtitle": "Professionnalisme et dévouement",
    "summary": "Recherche de solutions adaptées à votre séjour, court ou long, selon les disponibilités et votre budget.",
    "description": "Patient ou étudiant, pour un court ou un long séjour, nous recherchons différents types de logements selon les offres disponibles : des solutions attractives, adaptées à votre budget et dotées des commodités nécessaires.",
    "highlights": [
      "Pour les patients et les étudiants",
      "Séjour de courte ou de longue durée",
      "En lien avec agences, responsables et propriétaires"
    ],
    "details": [
      "Appartement, studio, chambre ou colocation",
      "Recherche selon vos dates et votre budget",
      "Mise en relation avec agences, responsables et propriétaires",
      "Accompagnement jusqu’à votre installation"
    ],
    "audiences": [
      {
        "label": "Patients"
      },
      {
        "label": "Étudiants"
      },
      {
        "label": "Parents"
      }
    ],
    "icon": "housing",
    "icon_tone": "success",
    "image": "apartment",
    "image_alt": "Appartement meublé et lumineux",
    "cta_label": "Demander un logement",
    "cta_href": "/services/logement-hebergement#recherche",
    "active": true,
    "show_in_menu": true,
    "show_medical_disclaimer": false,
    "sort_order": 2,
    "seo": {
      "title": "Logement et hébergement en Tunisie",
      "description": "Recherche de logement pour patients et étudiants en Tunisie : appartement, studio, chambre ou colocation, selon vos dates et votre budget."
    },
    "updated_at": "2026-10-08T09:00:00.000Z",
    "updated_by": "LASISTANT.PRO"
  },
  {
    "id": "accompagnement-des-malades",
    "slug": "accompagnement-des-malades",
    "kind": "page",
    "title": "Accompagnement des malades",
    "subtitle": "Soutien et bienveillance",
    "summary": "Au-delà de l’accueil à l’aéroport, une présence attentive pendant le séjour, notamment pour les personnes âgées.",
    "description": "Notre présence va au-delà de l’accueil à l’aéroport : nous accompagnons les personnes pendant leur séjour, en particulier les personnes âgées, en veillant à leur confort, à leur sécurité et à leur bien-être.",
    "highlights": [
      "Accueil à votre arrivée",
      "Attention particulière aux personnes âgées",
      "Confort, sécurité et bien-être"
    ],
    "details": [
      "Accueil à votre arrivée",
      "Présence lors des déplacements et des démarches",
      "Attention particulière aux personnes âgées",
      "Services personnalisés"
    ],
    "audiences": [
      {
        "label": "Personnes âgées"
      },
      {
        "label": "Patients"
      },
      {
        "label": "Familles"
      }
    ],
    "icon": "care",
    "icon_tone": "gold",
    "image": "gardenWalk",
    "image_alt": "Un couple âgé se promène dans un jardin",
    "cta_label": "Demander un accompagnement",
    "cta_href": "/reservation?service=accompagnement-des-malades",
    "active": true,
    "show_in_menu": true,
    "show_medical_disclaimer": true,
    "sort_order": 3,
    "seo": {
      "title": "Accompagnement des malades en Tunisie",
      "description": "Accueil à l’aéroport et présence attentive pendant le séjour, avec une attention particulière portée aux personnes âgées."
    },
    "updated_at": "2026-10-08T09:00:00.000Z",
    "updated_by": "LASISTANT.PRO"
  },
  {
    "id": "echange-global",
    "slug": "echange-global",
    "kind": "reservation",
    "title": "Assistant social & service de logement",
    "subtitle": "Échange découverte",
    "summary": "Un échange global pour faire le point sur votre situation et vos besoins.",
    "description": "Un premier échange d’une heure avec notre assistant social pour cerner vos besoins et vous orienter.",
    "highlights": [],
    "details": [],
    "audiences": [],
    "icon": "conversation",
    "icon_tone": "neutral",
    "image": "meeting",
    "image_alt": "Deux personnes échangent lors d’un rendez-vous",
    "cta_label": "Réserver un échange",
    "cta_href": "/reservation?service=echange-global",
    "active": true,
    "show_in_menu": false,
    "show_medical_disclaimer": false,
    "sort_order": 4,
    "seo": {
      "title": "Réserver un échange",
      "description": "Réservez un échange de 1 h avec notre assistant social."
    },
    "updated_at": "2026-10-08T09:00:00.000Z",
    "updated_by": "LASISTANT.PRO"
  }
]$seed$::jsonb)
on conflict (id) do nothing;

-- categories (5 lignes)
insert into public.categories (id, name, slug, description, active, sort_order, tone)
select id, name, slug, description, active, sort_order, tone
from jsonb_populate_recordset(null::public.categories, $seed$[
  {
    "id": "assistance-medicale",
    "name": "Assistance médicale",
    "slug": "assistance-medicale",
    "description": "Préparer un séjour médical et comprendre notre accompagnement.",
    "active": true,
    "sort_order": 1,
    "tone": "brand"
  },
  {
    "id": "logement",
    "name": "Logement",
    "slug": "logement",
    "description": "Conseils pour trouver un logement adapté en Tunisie.",
    "active": true,
    "sort_order": 2,
    "tone": "success"
  },
  {
    "id": "accompagnement",
    "name": "Accompagnement",
    "slug": "accompagnement",
    "description": "Accompagner un proche âgé ou malade pendant son séjour.",
    "active": true,
    "sort_order": 3,
    "tone": "neutral"
  },
  {
    "id": "conseils-pratiques",
    "name": "Conseils pratiques",
    "slug": "conseils-pratiques",
    "description": "Voyage, arrivée, démarches : l’essentiel à savoir.",
    "active": true,
    "sort_order": 4,
    "tone": "gold"
  },
  {
    "id": "actualites",
    "name": "Actualités",
    "slug": "actualites",
    "description": "Les nouvelles de LASISTANT.PRO.",
    "active": false,
    "sort_order": 5,
    "tone": "neutral"
  }
]$seed$::jsonb)
on conflict (id) do nothing;

-- articles (8 lignes)
insert into public.articles (id, slug, title, excerpt, body, cover_image, cover_alt, category_id, status, published_at, updated_at, reading_minutes, author, tags, featured, seo, use_cover_for_sharing)
select id, slug, title, excerpt, body, cover_image, cover_alt, category_id, status, published_at, updated_at, reading_minutes, author, tags, featured, seo, use_cover_for_sharing
from jsonb_populate_recordset(null::public.articles, $seed$[
  {
    "id": "art-dossier-sejour-medical",
    "slug": "preparer-son-dossier-sejour-medical-tunisie",
    "title": "Préparer son dossier avant un séjour médical en Tunisie",
    "excerpt": "Les documents à rassembler et les questions à anticiper avant l’étude préalable de votre dossier.",
    "body": "::lede Un séjour pour poursuivre un traitement se prépare en amont. Voici les points à anticiper avant votre premier échange avec notre équipe.\n\n## Rassembler les informations essentielles\n\nL’étude préalable de votre dossier commence par une bonne compréhension de votre situation. Avant notre premier échange, préparez :\n\n- vos coordonnées et celles d’une personne de confiance ;\n- vos dates de séjour envisagées, même approximatives ;\n- le motif général de votre venue, sans détails médicaux dans nos formulaires ;\n- vos besoins en logement et en accompagnement.\n\n> **Bon à savoir** Vos documents médicaux ne doivent pas transiter par les formulaires du site. Si l’étude de votre dossier le nécessite, nous vous indiquerons un moyen d’envoi sécurisé.\n\n## Préparer vos documents de voyage\n\nVérifiez la validité de votre passeport et les formalités d’entrée applicables à votre nationalité auprès des autorités compétentes. Conservez une copie numérique de vos documents importants, accessible depuis votre téléphone.\n\n## Anticiper votre logement\n\nSelon la durée de votre séjour et le nombre de personnes qui vous accompagnent, le type de logement idéal varie. Nous recherchons des solutions adaptées à vos dates, à votre budget et aux offres disponibles. [Découvrir notre service logement](/services/logement-hebergement).\n\n::cta\n\n## Organiser votre arrivée\n\nLe jour de votre arrivée, quelques informations simplifient l’accueil :\n\n- vos horaires de vol et votre numéro de vol ;\n- la présence éventuelle d’un accompagnant ;\n- vos besoins pour le trajet jusqu’au logement ;\n- les premières démarches à prévoir sur place.\n\n## Préparer vos questions\n\nNotez vos questions avant le premier échange de 1 h : ce temps est le vôtre. Logement, déplacements, déroulement du séjour : aucune question n’est trop simple.",
    "cover_image": "documents",
    "cover_alt": "Documents, carnet et ordinateur portable sur un bureau",
    "category_id": "assistance-medicale",
    "status": "publie",
    "published_at": "2026-09-30T08:00:00.000Z",
    "updated_at": "2026-09-30T08:00:00.000Z",
    "reading_minutes": 6,
    "author": "L’équipe LASISTANT.PRO",
    "tags": [
      "Préparation",
      "Séjour",
      "Dossier"
    ],
    "featured": true,
    "seo": {
      "title": "Préparer son dossier avant un séjour médical en Tunisie",
      "description": "Documents à rassembler, voyage, logement, arrivée : les points à anticiper avant l’étude préalable de votre dossier."
    },
    "use_cover_for_sharing": true
  },
  {
    "id": "art-logement-etudiant",
    "slug": "logement-etudiant-bien-preparer-sa-recherche",
    "title": "Logement étudiant : bien préparer sa recherche",
    "excerpt": "Budget, durée, commodités : nos conseils pour trouver une chambre ou une colocation adaptée.",
    "body": "::lede Trouver un logement avant la rentrée demande un peu d’anticipation. Quelques repères pour cadrer votre recherche et gagner du temps.\n\n## Définir un budget réaliste\n\nLe loyer n’est qu’une partie du budget. Pensez aussi aux charges, à l’équipement éventuel et aux frais de transport jusqu’à votre établissement.\n\n## Choisir entre chambre, studio et colocation\n\n- **La chambre** convient aux budgets serrés et aux séjours courts.\n- **Le studio** offre davantage d’indépendance.\n- **La colocation** permet de partager les frais et de ne pas arriver seul(e).\n\n## Penser aux commodités\n\nConnexion Internet, proximité des transports, électroménager, sécurité de l’immeuble : listez ce qui compte vraiment pour vous et ce qui reste négociable.\n\n> **Pour les parents** Nous savons combien il est rassurant de savoir son enfant bien installé. Nous vous tenons informés à chaque étape de la recherche.\n\n## Anticiper les dates\n\nIndiquez une date d’arrivée et, si possible, une durée de séjour. Plus vos critères sont précis, plus la recherche est rapide.\n\n::cta",
    "cover_image": "studyDesk",
    "cover_alt": "Bureau d’étudiant avec carnet et café",
    "category_id": "logement",
    "status": "publie",
    "published_at": "2026-09-21T09:00:00.000Z",
    "updated_at": "2026-09-21T09:00:00.000Z",
    "reading_minutes": 5,
    "author": "L’équipe LASISTANT.PRO",
    "tags": [
      "Étudiants",
      "Logement",
      "Budget"
    ],
    "featured": false,
    "seo": {
      "title": "Logement étudiant en Tunisie : bien préparer sa recherche",
      "description": "Budget, type de logement, commodités, dates : nos conseils pour trouver une chambre ou une colocation."
    },
    "use_cover_for_sharing": true
  },
  {
    "id": "art-arriver-en-tunisie",
    "slug": "arriver-en-tunisie-ce-quil-faut-prevoir",
    "title": "Arriver en Tunisie : ce qu’il faut prévoir pour le jour J",
    "excerpt": "Accueil, transport, premières démarches : une liste simple pour une arrivée sereine.",
    "body": "::lede Le jour de l’arrivée concentre beaucoup de petites questions. Cette liste vous aide à n’en oublier aucune.\n\n## Avant le départ\n\n- Transmettez-nous vos horaires et votre numéro de vol.\n- Gardez vos documents de voyage à portée de main.\n- Prévoyez un moyen de paiement utilisable dès l’arrivée.\n\n## À l’arrivée\n\nNotre accueil à l’aéroport vous évite de chercher votre chemin après le voyage. Nous convenons ensemble du point de rendez-vous et de l’heure.\n\n> **Bon à savoir** En cas de retard de vol, prévenez-nous dès que possible : nous adaptons l’heure de l’accueil.\n\n## Les premiers jours\n\nInstallation dans le logement, repérage des lieux utiles, premières démarches : nous restons disponibles pour vous aider à prendre vos marques.\n\n::cta",
    "cover_image": "airportTraveler",
    "cover_alt": "Voyageur avec sa valise dans un hall d’aéroport",
    "category_id": "conseils-pratiques",
    "status": "publie",
    "published_at": "2026-09-14T08:30:00.000Z",
    "updated_at": "2026-09-14T08:30:00.000Z",
    "reading_minutes": 4,
    "author": "L’équipe LASISTANT.PRO",
    "tags": [
      "Voyage",
      "Arrivée"
    ],
    "featured": false,
    "seo": {
      "title": "Arriver en Tunisie : ce qu’il faut prévoir pour le jour J",
      "description": "Accueil à l’aéroport, transport, premières démarches : la liste pour une arrivée sereine."
    },
    "use_cover_for_sharing": true
  },
  {
    "id": "art-proche-age",
    "slug": "accompagner-un-proche-age-pendant-son-sejour",
    "title": "Accompagner un proche âgé pendant son séjour",
    "excerpt": "Confort, sécurité, rythme : les points d’attention pour un séjour serein.",
    "body": "::lede Un séjour loin de chez soi peut être fatigant pour une personne âgée. Quelques attentions simples font toute la différence.\n\n## Respecter son rythme\n\nPrévoyez des journées peu chargées, des temps de repos et des déplacements courts. Un programme léger est souvent le plus confortable.\n\n## Préparer le logement\n\n- Un accès facile (ascenseur, peu de marches) ;\n- une chambre calme et bien éclairée ;\n- les objets du quotidien à portée de main.\n\n## Rester en lien avec la famille\n\nConvenez à l’avance de la manière dont vous souhaitez être tenus informés pendant le séjour. [[Modalités de lien avec les proches à confirmer]]\n\n> **Notre engagement** Une présence attentive, des services personnalisés et une attention constante au confort, à la sécurité et au bien-être.\n\n::cta",
    "cover_image": "seniorCare",
    "cover_alt": "Une soignante échange avec une patiente âgée",
    "category_id": "accompagnement",
    "status": "publie",
    "published_at": "2026-09-07T10:00:00.000Z",
    "updated_at": "2026-09-07T10:00:00.000Z",
    "reading_minutes": 5,
    "author": "L’équipe LASISTANT.PRO",
    "tags": [
      "Personnes âgées",
      "Famille"
    ],
    "featured": false,
    "seo": {
      "title": "Accompagner un proche âgé pendant son séjour en Tunisie",
      "description": "Rythme, logement, lien avec la famille : les points d’attention pour un séjour serein."
    },
    "use_cover_for_sharing": true
  },
  {
    "id": "art-court-long-sejour",
    "slug": "court-ou-long-sejour-comment-choisir-son-logement",
    "title": "Court ou long séjour : comment choisir son logement ?",
    "excerpt": "Appartement, studio, chambre ou colocation : les critères qui font la différence.",
    "body": "::lede La durée du séjour change beaucoup de choses : type de logement, budget, équipements. Voici comment raisonner.\n\n## Pour un séjour court\n\nPrivilégiez un logement meublé, prêt à vivre, proche des lieux où vous devrez vous rendre. La simplicité prime sur la surface.\n\n## Pour un séjour long\n\nUn appartement ou une colocation offre plus d’espace et un coût mensuel souvent plus intéressant. Vérifiez les conditions de location avant de vous engager.\n\n## Les questions à se poser\n\n- Combien de personnes logeront sur place ?\n- Quels équipements sont indispensables ?\n- Quel budget maximum, et pour quelle période ?\n\nNous recherchons, selon les offres disponibles, des solutions attractives et dotées des commodités nécessaires.\n\n::cta",
    "cover_image": "bedroom",
    "cover_alt": "Chambre lumineuse et confortable",
    "category_id": "logement",
    "status": "publie",
    "published_at": "2026-08-31T09:15:00.000Z",
    "updated_at": "2026-08-31T09:15:00.000Z",
    "reading_minutes": 5,
    "author": "L’équipe LASISTANT.PRO",
    "tags": [
      "Logement",
      "Séjour"
    ],
    "featured": false,
    "seo": {
      "title": "Court ou long séjour : comment choisir son logement en Tunisie ?",
      "description": "Appartement, studio, chambre ou colocation : les critères selon la durée de votre séjour."
    },
    "use_cover_for_sharing": true
  },
  {
    "id": "art-etude-prealable",
    "slug": "etude-prealable-du-dossier-une-etape-cle",
    "title": "Pourquoi l’étude préalable du dossier est une étape clé",
    "excerpt": "Comprendre le rôle de cette étape et ce qu’elle vous permet d’anticiper.",
    "body": "::lede Avant toute venue en Tunisie, nous prenons connaissance de votre demande. Cette étape conditionne la qualité de tout l’accompagnement.\n\n## Ce que permet l’étude préalable\n\n- Identifier les démarches à prévoir avant votre arrivée ;\n- organiser le logement et l’accueil au bon moment ;\n- faciliter l’orientation vers un médecin habilité à vous examiner sur place.\n\n## Ce qu’elle n’est pas\n\nL’étude préalable n’est ni une consultation ni un diagnostic. Seul le médecin qui vous examine est habilité à se prononcer sur votre situation.\n\n> **Important** LASISTANT.PRO est un service d’accompagnement et de coordination. Nous ne remplaçons pas un professionnel de santé.\n\n::cta",
    "cover_image": "medicalTeam",
    "cover_alt": "Deux médecins échangent devant un écran",
    "category_id": "assistance-medicale",
    "status": "publie",
    "published_at": "2026-08-24T08:00:00.000Z",
    "updated_at": "2026-08-24T08:00:00.000Z",
    "reading_minutes": 4,
    "author": "L’équipe LASISTANT.PRO",
    "tags": [
      "Dossier",
      "Orientation"
    ],
    "featured": false,
    "seo": {
      "title": "Pourquoi l’étude préalable du dossier est une étape clé",
      "description": "Le rôle de l’étude préalable de votre dossier avant un séjour médical en Tunisie."
    },
    "use_cover_for_sharing": true
  },
  {
    "id": "art-confort-domicile",
    "slug": "confort-et-securite-a-domicile-nos-reperes",
    "title": "Confort et sécurité à domicile : nos repères",
    "excerpt": "Les petites attentions qui rendent le quotidien plus simple pendant un séjour.",
    "body": "::lede L’assistance à domicile repose sur une présence attentive et des gestes simples, pensés pour le confort de chacun.\n\n## Un environnement rassurant\n\nUn logement bien rangé, des passages dégagés et un éclairage suffisant limitent les risques et facilitent les déplacements.\n\n## Un suivi personnalisé\n\nChaque personne a ses habitudes. Nous adaptons notre présence à son rythme, avec une approche chaleureuse. [[Modalités et zones d’intervention à confirmer]]\n\n## Les bons réflexes\n\n- Garder les numéros utiles à portée de main ;\n- prévoir un temps d’échange régulier ;\n- signaler sans attendre toute difficulté.\n\n::cta",
    "cover_image": "supportiveHands",
    "cover_alt": "Deux mains jointes en signe de soutien",
    "category_id": "accompagnement",
    "status": "publie",
    "published_at": "2026-08-16T13:00:00.000Z",
    "updated_at": "2026-08-16T13:00:00.000Z",
    "reading_minutes": 3,
    "author": "L’équipe LASISTANT.PRO",
    "tags": [
      "Domicile",
      "Confort"
    ],
    "featured": false,
    "seo": {
      "title": "Confort et sécurité à domicile : nos repères",
      "description": "Les attentions qui rendent le quotidien plus simple pendant un séjour."
    },
    "use_cover_for_sharing": true
  },
  {
    "id": "art-premier-echange",
    "slug": "les-etapes-de-votre-premier-echange",
    "title": "Les étapes de votre premier échange avec notre équipe",
    "excerpt": "Confirmation, déroulé de l’échange de 1 h et prochaines étapes : tout savoir sur votre premier contact avec notre équipe.",
    "body": "::lede Vous avez fait une demande sur notre site ? Voici comment se déroule votre premier échange avec l’équipe LASISTANT.PRO.\n\n## Avant l’échange\n\nAprès l’envoi de votre demande, vous recevez un e-mail de confirmation. Un membre de l’équipe vous contacte ensuite pour confirmer le créneau choisi.\n\n## Pendant l’échange\n\nLe premier échange dure environ 1 heure, par e-mail ou par téléphone. Nous faisons le point sur :\n\n- votre situation et vos dates de séjour ;\n- vos besoins de logement et d’accompagnement ;\n- vos questions pratiques.\n\n## Après l’échange\n\nNous vous indiquons les prochaines étapes et préparons avec vous la suite de votre accompagnement.",
    "cover_image": "meeting",
    "cover_alt": "Deux femmes échangent autour d’une table",
    "category_id": "conseils-pratiques",
    "status": "brouillon",
    "published_at": null,
    "updated_at": "2026-10-08T07:10:00.000Z",
    "reading_minutes": 2,
    "author": "L’équipe LASISTANT.PRO",
    "tags": [
      "Réservation"
    ],
    "featured": false,
    "seo": {
      "title": "Premier échange avec LASISTANT.PRO : comment ça se passe ?",
      "description": "Confirmation, déroulé de l’échange de 1 h et prochaines étapes : tout savoir sur votre premier contact avec notre équipe."
    },
    "use_cover_for_sharing": false
  }
]$seed$::jsonb)
on conflict (id) do nothing;

-- faq_categories (6 lignes)
insert into public.faq_categories (id, name, sort_order)
select id, name, sort_order
from jsonb_populate_recordset(null::public.faq_categories, $seed$[
  {
    "id": "general",
    "name": "Général",
    "sort_order": 1
  },
  {
    "id": "assistance-medicale",
    "name": "Assistance médicale",
    "sort_order": 2
  },
  {
    "id": "logement",
    "name": "Logement",
    "sort_order": 3
  },
  {
    "id": "accompagnement",
    "name": "Accompagnement",
    "sort_order": 4
  },
  {
    "id": "reservation",
    "name": "Réservation",
    "sort_order": 5
  },
  {
    "id": "donnees",
    "name": "Données personnelles",
    "sort_order": 6
  }
]$seed$::jsonb)
on conflict (id) do nothing;

-- faq_items (16 lignes)
insert into public.faq_items (id, category_id, question, answer, pending_note, sort_order)
select id, category_id, question, answer, pending_note, sort_order
from jsonb_populate_recordset(null::public.faq_items, $seed$[
  {
    "id": "faq-1",
    "category_id": "general",
    "question": "Qu’est-ce que LASISTANT.PRO ?",
    "answer": "LASISTANT.PRO est une société de service social spécialisée dans l’assistance médicale, l’accompagnement et la recherche de logement en Tunisie, avec une approche humaine et personnalisée.",
    "pending_note": null,
    "sort_order": 1
  },
  {
    "id": "faq-2",
    "category_id": "general",
    "question": "Dans quelle zone intervenez-vous ?",
    "answer": "Nous intervenons en Tunisie.",
    "pending_note": "Villes et zones couvertes à préciser",
    "sort_order": 2
  },
  {
    "id": "faq-3",
    "category_id": "general",
    "question": "Comment vous contacter ?",
    "answer": "Par téléphone au +216 54 479 391 ou au +216 25 393 214, par e-mail à imassist.service@hotmail.com ou moryendi@gmail.com, ou via notre formulaire de contact.",
    "pending_note": null,
    "sort_order": 3
  },
  {
    "id": "faq-4",
    "category_id": "assistance-medicale",
    "question": "Êtes-vous un établissement de santé ?",
    "answer": "Non. LASISTANT.PRO est un service d’accompagnement : nous facilitons vos démarches et l’orientation vers un médecin habilité, qui seul peut se prononcer sur votre situation.",
    "pending_note": null,
    "sort_order": 4
  },
  {
    "id": "faq-5",
    "category_id": "assistance-medicale",
    "question": "Comment se déroule l’étude préalable de mon dossier ?",
    "answer": "Nous prenons connaissance de votre demande et de votre situation, puis nous facilitons l’orientation vers un médecin habilité à vous examiner une fois en Tunisie.",
    "pending_note": null,
    "sort_order": 5
  },
  {
    "id": "faq-6",
    "category_id": "assistance-medicale",
    "question": "Puis-je envoyer des documents médicaux via le site ?",
    "answer": "Non. Pour protéger vos données, les formulaires du site ne sont pas prévus pour des documents médicaux. Si nécessaire, nous vous indiquerons un moyen d’envoi sécurisé.",
    "pending_note": null,
    "sort_order": 6
  },
  {
    "id": "faq-7",
    "category_id": "assistance-medicale",
    "question": "Proposez-vous une assistance à domicile ?",
    "answer": "Oui, une assistance personnalisée à domicile, avec un suivi attentif, confortable et sécurisant.",
    "pending_note": "Modalités à confirmer",
    "sort_order": 7
  },
  {
    "id": "faq-8",
    "category_id": "logement",
    "question": "Pour quelle durée pouvez-vous trouver un logement ?",
    "answer": "Pour un court comme pour un long séjour, selon les offres disponibles.",
    "pending_note": null,
    "sort_order": 8
  },
  {
    "id": "faq-9",
    "category_id": "logement",
    "question": "Quels types de logements recherchez-vous ?",
    "answer": "Appartements, studios, chambres ou colocations, selon vos besoins, votre budget et les disponibilités.",
    "pending_note": null,
    "sort_order": 9
  },
  {
    "id": "faq-10",
    "category_id": "logement",
    "question": "Avec qui travaillez-vous ?",
    "answer": "Nous travaillons en lien avec des agences immobilières, des responsables et des propriétaires.",
    "pending_note": null,
    "sort_order": 10
  },
  {
    "id": "faq-11",
    "category_id": "accompagnement",
    "question": "En quoi consiste l’accompagnement des malades ?",
    "answer": "Au-delà de l’accueil à l’aéroport, nous assurons une présence attentive pendant le séjour, avec une attention particulière portée aux personnes âgées.",
    "pending_note": null,
    "sort_order": 11
  },
  {
    "id": "faq-12",
    "category_id": "accompagnement",
    "question": "Que comprend l’accompagnement ?",
    "answer": "Accueil à l’arrivée, présence pendant le séjour, aide aux déplacements et aux démarches.",
    "pending_note": "Liste détaillée à valider",
    "sort_order": 12
  },
  {
    "id": "faq-13",
    "category_id": "reservation",
    "question": "Combien de temps dure le premier échange ?",
    "answer": "Environ 1 heure, par e-mail ou par téléphone, selon votre préférence.",
    "pending_note": null,
    "sort_order": 13
  },
  {
    "id": "faq-14",
    "category_id": "reservation",
    "question": "Puis-je modifier ou annuler ma demande ?",
    "answer": "Contactez-nous en indiquant votre numéro de demande.",
    "pending_note": "Conditions de modification et d’annulation à valider",
    "sort_order": 14
  },
  {
    "id": "faq-15",
    "category_id": "reservation",
    "question": "Quels sont vos tarifs ?",
    "answer": "Contactez-nous pour connaître les conditions applicables à votre demande.",
    "pending_note": "Tarifs à communiquer",
    "sort_order": 15
  },
  {
    "id": "faq-16",
    "category_id": "donnees",
    "question": "Comment mes données sont-elles utilisées ?",
    "answer": "Uniquement pour traiter votre demande et vous recontacter. Consultez notre politique de confidentialité pour en savoir plus.",
    "pending_note": null,
    "sort_order": 16
  }
]$seed$::jsonb)
on conflict (id) do nothing;

-- email_templates (7 lignes)
insert into public.email_templates (id, key, name, trigger, kind, audience, subject, heading, body, sender_name, reply_to, active, updated_at)
select id, key, name, trigger, kind, audience, subject, heading, body, sender_name, reply_to, active, updated_at
from jsonb_populate_recordset(null::public.email_templates, $seed$[
  {
    "id": "tpl-1",
    "key": "confirmation-demandeur",
    "name": "Confirmation au demandeur",
    "trigger": "Après chaque demande",
    "kind": "automatique",
    "audience": "demandeur",
    "subject": "Votre demande [référence] est bien enregistrée",
    "heading": "Merci [prénom], nous avons bien reçu votre demande.",
    "body": "Un membre de notre équipe vous contacte rapidement par téléphone ou par e-mail pour confirmer votre rendez-vous. Voici le récapitulatif de votre demande.",
    "sender_name": "LASISTANT.PRO",
    "reply_to": "imassist.service@hotmail.com",
    "active": true,
    "updated_at": "2026-10-08T09:00:00.000Z"
  },
  {
    "id": "tpl-2",
    "key": "notification-equipe",
    "name": "Notification à l’équipe",
    "trigger": "Nouvelle demande reçue",
    "kind": "automatique",
    "audience": "equipe",
    "subject": "[Nouvelle demande] [référence] · [service] · [nom]",
    "heading": "[nom] · [service]",
    "body": "Reçue le [reçue_le] via [origine].",
    "sender_name": "Site LASISTANT.PRO",
    "reply_to": "imassist.service@hotmail.com",
    "active": true,
    "updated_at": "2026-10-08T09:00:00.000Z"
  },
  {
    "id": "tpl-3",
    "key": "rendez-vous-confirme",
    "name": "Rendez-vous confirmé",
    "trigger": "Statut « Confirmé »",
    "kind": "automatique",
    "audience": "demandeur",
    "subject": "Votre rendez-vous du [date] est confirmé",
    "heading": "C’est noté, [prénom] : à [jour] !",
    "body": "Votre échange avec notre équipe est confirmé. Nous vous contacterons [contact_préféré] aux coordonnées indiquées dans votre demande.",
    "sender_name": "LASISTANT.PRO",
    "reply_to": "imassist.service@hotmail.com",
    "active": true,
    "updated_at": "2026-10-08T09:00:00.000Z"
  },
  {
    "id": "tpl-4",
    "key": "reinitialisation-mot-de-passe",
    "name": "Réinitialisation du mot de passe",
    "trigger": "Équipe",
    "kind": "automatique",
    "audience": "equipe",
    "subject": "Réinitialisation de votre mot de passe",
    "heading": "Choisissez un nouveau mot de passe",
    "body": "Une demande de réinitialisation a été faite pour votre compte. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable 30 minutes [[durée à valider]] et ne peut être utilisé qu’une seule fois.",
    "sender_name": "Back-office LASISTANT.PRO",
    "reply_to": "imassist.service@hotmail.com",
    "active": true,
    "updated_at": "2026-10-08T09:00:00.000Z"
  },
  {
    "id": "tpl-5",
    "key": "invitation-utilisateur",
    "name": "Invitation d’un utilisateur",
    "trigger": "Équipe",
    "kind": "automatique",
    "audience": "equipe",
    "subject": "Vous êtes invité(e) à rejoindre le back-office LASISTANT.PRO",
    "heading": "Bienvenue dans l’équipe",
    "body": "**[invitant]** vous invite à rejoindre le back-office de LASISTANT.PRO avec le rôle suivant :",
    "sender_name": "Back-office LASISTANT.PRO",
    "reply_to": "imassist.service@hotmail.com",
    "active": true,
    "updated_at": "2026-10-08T09:00:00.000Z"
  },
  {
    "id": "tpl-6",
    "key": "proposition-creneau",
    "name": "Proposition de créneau",
    "trigger": "Envoi manuel",
    "kind": "manuel",
    "audience": "demandeur",
    "subject": "Proposition de rendez-vous pour votre demande [référence]",
    "heading": "",
    "body": "Bonjour [prénom],\n\nMerci pour votre demande d’accompagnement (réf. [référence]). Nous vous proposons un premier échange de 1 h le [date] à [heure] (heure de Tunisie), [contact_préféré].\n\nMerci de nous confirmer ce créneau en répondant à ce message.\n\nL’équipe LASISTANT.PRO",
    "sender_name": "LASISTANT.PRO",
    "reply_to": "imassist.service@hotmail.com",
    "active": true,
    "updated_at": "2026-10-08T09:00:00.000Z"
  },
  {
    "id": "tpl-7",
    "key": "informations-complementaires",
    "name": "Informations complémentaires",
    "trigger": "Envoi manuel",
    "kind": "manuel",
    "audience": "demandeur",
    "subject": "Votre demande [référence] : quelques précisions",
    "heading": "",
    "body": "Bonjour [prénom],\n\nPour avancer sur votre demande ([référence]), nous avons besoin de quelques précisions :\n- vos dates de séjour envisagées ;\n- le nombre de personnes concernées.\n\nPour protéger vos données, ne nous transmettez pas d’informations médicales détaillées par e-mail.\n\nL’équipe LASISTANT.PRO",
    "sender_name": "LASISTANT.PRO",
    "reply_to": "imassist.service@hotmail.com",
    "active": true,
    "updated_at": "2026-10-08T09:00:00.000Z"
  }
]$seed$::jsonb)
on conflict (id) do nothing;

-- media (16 lignes)
insert into public.media (id, file_name, kind, image, storage_path, title, alt_text, size_bytes, width, height, uploaded_by, created_at, used_on, is_private, rights_confirmed)
select id, file_name, kind, image, storage_path, title, alt_text, size_bytes, width, height, uploaded_by, created_at, used_on, is_private, rights_confirmed
from jsonb_populate_recordset(null::public.media, $seed$[
  {
    "id": "bf68d1b0-19b1-4930-9d09-83121c10b597",
    "file_name": "consultation.webp",
    "kind": "image",
    "image": "consultation",
    "storage_path": null,
    "title": "Une conseillère échange avec",
    "alt_text": "Une conseillère échange avec une patiente lors d'un rendez-vous d'accompagnement",
    "size_bytes": 62280,
    "width": 1400,
    "height": 912,
    "uploaded_by": "LASISTANT.PRO",
    "created_at": "2026-10-07T09:00:00.000Z",
    "used_on": [
      "Accueil (héros)"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "id": "3605ab5c-79fd-4498-8476-d241d6a8dedc",
    "file_name": "medical-team.webp",
    "kind": "image",
    "image": "medicalTeam",
    "storage_path": null,
    "title": "Une médecin présente un",
    "alt_text": "Une médecin présente un dossier à un confrère devant un écran",
    "size_bytes": 66550,
    "width": 1400,
    "height": 933,
    "uploaded_by": "LASISTANT.PRO",
    "created_at": "2026-10-06T09:00:00.000Z",
    "used_on": [
      "Assistance médicale",
      "Nos services"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "id": "589378eb-b794-4513-be79-acb9081eb7f1",
    "file_name": "senior-care.webp",
    "kind": "image",
    "image": "seniorCare",
    "storage_path": null,
    "title": "Une soignante échange avec",
    "alt_text": "Une soignante échange avec une patiente âgée souriante",
    "size_bytes": 76444,
    "width": 1400,
    "height": 926,
    "uploaded_by": "LASISTANT.PRO",
    "created_at": "2026-10-05T09:00:00.000Z",
    "used_on": [
      "Accueil (services)",
      "Accompagnement"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "id": "93ae5cb5-4e6a-40d6-866b-254016b1ddaa",
    "file_name": "garden-walk.webp",
    "kind": "image",
    "image": "gardenWalk",
    "storage_path": null,
    "title": "Un couple âgé se",
    "alt_text": "Un couple âgé se promène bras dessus bras dessous dans un jardin",
    "size_bytes": 441954,
    "width": 933,
    "height": 1400,
    "uploaded_by": "LASISTANT.PRO",
    "created_at": "2026-10-04T09:00:00.000Z",
    "used_on": [
      "Accueil (services)",
      "Accompagnement"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "id": "968118bc-ffa8-48fa-ad7f-ef069e3aa63a",
    "file_name": "supportive-hands.webp",
    "kind": "image",
    "image": "supportiveHands",
    "storage_path": null,
    "title": "Deux mains jointes en",
    "alt_text": "",
    "size_bytes": 64364,
    "width": 1400,
    "height": 933,
    "uploaded_by": "LASISTANT.PRO",
    "created_at": "2026-10-03T09:00:00.000Z",
    "used_on": [],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "id": "9e210cb3-519e-40ff-b677-f686465a3184",
    "file_name": "living-room.webp",
    "kind": "image",
    "image": "livingRoom",
    "storage_path": null,
    "title": "Salon lumineux d'un logement",
    "alt_text": "Salon lumineux d'un logement meublé",
    "size_bytes": 98096,
    "width": 1400,
    "height": 934,
    "uploaded_by": "LASISTANT.PRO",
    "created_at": "2026-10-02T09:00:00.000Z",
    "used_on": [
      "Accueil (héros)",
      "Logement"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "id": "f0e07d8f-6847-48d8-861b-f3cad9cd84cd",
    "file_name": "apartment.webp",
    "kind": "image",
    "image": "apartment",
    "storage_path": null,
    "title": "Appartement meublé et lumineux",
    "alt_text": "Appartement meublé et lumineux",
    "size_bytes": 88704,
    "width": 1400,
    "height": 934,
    "uploaded_by": "LASISTANT.PRO",
    "created_at": "2026-10-01T09:00:00.000Z",
    "used_on": [
      "Accueil (services)"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "id": "dde5c5f0-f2be-49c2-ba0b-e6f851e853c0",
    "file_name": "bedroom.webp",
    "kind": "image",
    "image": "bedroom",
    "storage_path": null,
    "title": "Chambre confortable et lumineuse",
    "alt_text": "Chambre confortable et lumineuse",
    "size_bytes": 160556,
    "width": 1400,
    "height": 948,
    "uploaded_by": "LASISTANT.PRO",
    "created_at": "2026-09-30T09:00:00.000Z",
    "used_on": [],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "id": "fcb2ba94-900d-4e69-b971-e8cc8cb4ed54",
    "file_name": "bright-apartment.webp",
    "kind": "image",
    "image": "brightApartment",
    "storage_path": null,
    "title": "Salon d'appartement lumineux avec",
    "alt_text": "Salon d'appartement lumineux avec des plantes",
    "size_bytes": 121366,
    "width": 1400,
    "height": 1042,
    "uploaded_by": "LASISTANT.PRO",
    "created_at": "2026-09-29T09:00:00.000Z",
    "used_on": [],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "id": "5358851c-dd80-4c7d-a5e7-7c976660c35d",
    "file_name": "student.webp",
    "kind": "image",
    "image": "student",
    "storage_path": null,
    "title": "Une étudiante souriante devant",
    "alt_text": "Une étudiante souriante devant un bâtiment universitaire",
    "size_bytes": 83336,
    "width": 788,
    "height": 1400,
    "uploaded_by": "LASISTANT.PRO",
    "created_at": "2026-09-28T09:00:00.000Z",
    "used_on": [
      "Accueil (publics)"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "id": "541cccc8-60e6-49b8-8e98-84ea25dced68",
    "file_name": "study-desk.webp",
    "kind": "image",
    "image": "studyDesk",
    "storage_path": null,
    "title": "Bureau d'étudiant avec carnet,",
    "alt_text": "Bureau d'étudiant avec carnet, ordinateur et café",
    "size_bytes": 73984,
    "width": 1400,
    "height": 933,
    "uploaded_by": "LASISTANT.PRO",
    "created_at": "2026-09-27T09:00:00.000Z",
    "used_on": [],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "id": "5ff90fa0-5af2-49cd-912b-d7eaea57ab54",
    "file_name": "airport-traveler.webp",
    "kind": "image",
    "image": "airportTraveler",
    "storage_path": null,
    "title": "Voyageur assis avec sa",
    "alt_text": "Voyageur assis avec sa valise dans un hall d'aéroport",
    "size_bytes": 69666,
    "width": 1400,
    "height": 933,
    "uploaded_by": "LASISTANT.PRO",
    "created_at": "2026-09-26T09:00:00.000Z",
    "used_on": [],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "id": "01dbfed6-972c-4941-8c4a-41a555f3e153",
    "file_name": "airplane-wing.webp",
    "kind": "image",
    "image": "airplaneWing",
    "storage_path": null,
    "title": "Aile d'avion au-dessus des",
    "alt_text": "",
    "size_bytes": 40464,
    "width": 1400,
    "height": 930,
    "uploaded_by": "LASISTANT.PRO",
    "created_at": "2026-09-25T09:00:00.000Z",
    "used_on": [],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "id": "c2b85931-5d10-4161-bf82-fc8da54228da",
    "file_name": "meeting.webp",
    "kind": "image",
    "image": "meeting",
    "storage_path": null,
    "title": "Deux femmes échangent autour",
    "alt_text": "Deux femmes échangent autour d'une table lors d'un rendez-vous",
    "size_bytes": 75652,
    "width": 1400,
    "height": 933,
    "uploaded_by": "LASISTANT.PRO",
    "created_at": "2026-09-24T09:00:00.000Z",
    "used_on": [],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "id": "06f2df67-fbb0-4e4b-945d-e4a277ddce7d",
    "file_name": "documents.webp",
    "kind": "image",
    "image": "documents",
    "storage_path": null,
    "title": "Documents, carnet et ordinateur",
    "alt_text": "Documents, carnet et ordinateur portable sur un bureau",
    "size_bytes": 72646,
    "width": 1400,
    "height": 934,
    "uploaded_by": "LASISTANT.PRO",
    "created_at": "2026-09-23T09:00:00.000Z",
    "used_on": [
      "Espace infos"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "id": "be32955f-80ec-42d2-be06-15a0f4866cd6",
    "file_name": "house-keys.webp",
    "kind": "image",
    "image": "houseKeys",
    "storage_path": null,
    "title": "Clés posées devant une",
    "alt_text": "Clés posées devant une maquette de maison",
    "size_bytes": 43216,
    "width": 1400,
    "height": 1051,
    "uploaded_by": "LASISTANT.PRO",
    "created_at": "2026-09-22T09:00:00.000Z",
    "used_on": [],
    "is_private": false,
    "rights_confirmed": false
  }
]$seed$::jsonb)
on conflict (id) do nothing;
