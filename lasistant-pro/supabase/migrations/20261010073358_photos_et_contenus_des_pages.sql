-- =============================================================================
-- LASISTANT.PRO · Photos de l'équipe et contenus des pages
--
-- Fichier généré par « npm run db:pages-sql » à partir de src/content : ne pas modifier à la main.
-- Idempotent : une page déjà enregistrée depuis le back-office n'est jamais écrasée, et une
-- photo n'est remplacée que si elle est encore l'une des anciennes photos d'illustration.
-- Les photos des appartements ne sont pas concernées.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Contenus d'origine des pages (16 pages)
-- -----------------------------------------------------------------------------
insert into public.page_contents (key, content, updated_by)
select page.key, page.content, 'LASISTANT.PRO'
from jsonb_each($seed${
  "accueil": {
    "seo": {
      "title": "Soutien médical et hébergement en Tunisie",
      "description": "LASISTANT.PRO accompagne patients, familles, étudiants et personnes âgées : assistance médicale, logement et accompagnement en Tunisie."
    },
    "hero": {
      "eyebrow": "Service social d’assistance · Tunisie",
      "title": {
        "start": "Soutien médical & hébergement",
        "accent": "en Tunisie"
      },
      "lead": "LASISTANT.PRO accompagne ses clients dans leurs démarches d’assistance, de séjour et de logement en Tunisie, avec une approche humaine et personnalisée.",
      "primaryCta": {
        "label": "Demander un accompagnement",
        "to": "/reservation"
      },
      "secondaryCta": {
        "label": "Réserver un échange",
        "to": "/reservation"
      },
      "audienceLabel": "Nous accompagnons",
      "audiences": [
        "Patients internationaux",
        "Familles & proches",
        "Étudiants",
        "Personnes âgées"
      ],
      "image": "teamMeeting",
      "insetImage": "livingRoom",
      "insetCaption": "Un logement adapté à votre séjour et à votre budget",
      "bookingCard": {
        "tag": "Réservation en ligne",
        "title": "Assistant social & service de logement",
        "mode": "Par e-mail ou par téléphone",
        "cta": "Réserver"
      }
    },
    "services": {
      "eyebrow": "Nos services",
      "title": {
        "start": "Trois expertises,",
        "accent": "un même engagement",
        "end": "à vos côtés"
      },
      "lead": "De l’étude de votre dossier à votre installation, nous coordonnons chaque étape de votre séjour avec vous.",
      "linkLabel": "Voir tous nos services"
    },
    "engagement": {
      "eyebrow": "Notre engagement",
      "statement": {
        "start": "Faciliter vos démarches, anticiper vos besoins et veiller à votre",
        "accent": "confort",
        "end": "comme à votre sécurité."
      },
      "text": "Lasistant.Pro a pour but de vous accompagner dans vos démarches et de cerner vos besoins, avec une qualité de service adaptée à chaque personne accompagnée.",
      "image": "doctorConsultation",
      "badgeTitle": "Notre mission",
      "badgeText": "Assurer le bien-être et le confort de nos clients.",
      "linkLabel": "Découvrir notre approche"
    },
    "field": {
      "eyebrow": "Sur le terrain",
      "title": {
        "start": "À vos côtés,",
        "accent": "à chaque étape",
        "end": "du séjour"
      },
      "lead": "De l’aéroport jusqu’au cabinet du médecin, notre équipe est présente auprès de chaque personne accompagnée. Quelques moments de nos accompagnements :",
      "items": [
        {
          "image": "airportWelcome",
          "title": "Accueil à l’aéroport",
          "text": "Nous vous attendons à votre arrivée et vous accompagnons jusqu’à votre logement."
        },
        {
          "image": "welcomeKit",
          "title": "Un kit de bienvenue",
          "text": "Remis à votre arrivée, aux couleurs de LASISTANT.PRO."
        },
        {
          "image": "eyeExamFollowUp",
          "title": "Jusqu’en consultation",
          "text": "Nous vous accompagnons aux rendez-vous chez les médecins vers lesquels vous êtes orienté(e)."
        },
        {
          "image": "careSession",
          "title": "Des soins organisés",
          "text": "Nous organisons vos rendez-vous de soins et restons disponibles pendant leur déroulement."
        },
        {
          "image": "teamVehicle",
          "title": "Des déplacements accompagnés",
          "text": "Un véhicule identifié LASISTANT.PRO vous conduit à vos rendez-vous."
        }
      ]
    },
    "trust": {
      "eyebrow": "Pourquoi nous faire confiance",
      "title": {
        "start": "Une équipe",
        "accent": "réelle et identifiable",
        "end": ", engagée à vos côtés"
      },
      "lead": "Confier son séjour, sa santé ou celle d’un proche demande de la confiance. Voici ce que nous garantissons à chaque personne accompagnée.",
      "items": [
        {
          "title": "Une présence physique",
          "text": "Aéroport, consultations, hospitalisation : un membre de l’équipe est à vos côtés, pas seulement au téléphone."
        },
        {
          "title": "Une équipe identifiable",
          "text": "Badge, véhicule et kit de bienvenue aux couleurs de LASISTANT.PRO : vous savez toujours qui vous accompagne."
        },
        {
          "title": "Des médecins habilités",
          "text": "Nous vous orientons vers des médecins habilités à vous examiner. Nous ne réalisons nous-mêmes aucun acte médical."
        },
        {
          "title": "Un interlocuteur dédié",
          "text": "Une personne de l’équipe suit votre demande, de la première prise de contact à la fin du séjour."
        },
        {
          "title": "Tout est clair dès le départ",
          "text": "Ce qui est inclus dans l’accompagnement, et ce qui ne l’est pas, est précisé avant tout engagement."
        },
        {
          "title": "Vos données protégées",
          "text": "Vos informations restent confidentielles et ne servent qu’à traiter votre demande."
        }
      ],
      "linkLabel": "Découvrir l’équipe et nos engagements"
    },
    "journey": {
      "eyebrow": "Votre parcours",
      "title": {
        "start": "Un accompagnement clair,",
        "accent": "étape par étape"
      },
      "lead": "De votre première demande au suivi de votre séjour, vous savez à chaque instant où en est votre dossier.",
      "ctaText": "Prêt(e) à commencer ? La première étape ne prend que quelques minutes.",
      "primaryCta": {
        "label": "Démarrer ma demande",
        "to": "/reservation"
      },
      "secondaryCta": {
        "label": "Réserver un échange de 1 h",
        "to": "/reservation"
      }
    },
    "audiences": {
      "eyebrow": "Pour qui ?",
      "title": {
        "start": "Un accompagnement adapté",
        "accent": "à chaque situation"
      },
      "lead": "Patient, proche, étudiant ou partenaire : chaque profil a ses besoins. Nous partons des vôtres.",
      "image": "familyConsultation"
    },
    "values": {
      "eyebrow": "Nos valeurs",
      "title": "Ce qui guide chacune de nos interventions"
    },
    "news": {
      "eyebrow": "Espace infos",
      "title": {
        "start": "Découvrez nos",
        "accent": "dernières actualités"
      },
      "linkLabel": "Toutes les publications"
    },
    "contact": {
      "eyebrow": "Contact",
      "title": {
        "start": "Parlons de",
        "accent": "votre besoin"
      },
      "lead": "Décrivez votre situation en quelques lignes. Nous revenons vers vous par e-mail ou par téléphone pour en discuter et vous orienter.",
      "formTitle": "Demande rapide"
    }
  },
  "a-propos": {
    "seo": {
      "title": "À propos",
      "description": "LASISTANT.PRO, société de service social spécialisée dans l’assistance médicale et l’hébergement en Tunisie : mission, valeurs et approche."
    },
    "hero": {
      "eyebrow": "À propos",
      "title": {
        "start": "Une société de service social,",
        "accent": "au service des personnes"
      },
      "lead": "LASISTANT.PRO est une société de service social spécialisée dans l’assistance médicale et l’hébergement en Tunisie. Notre but : vous accompagner dans vos démarches et cerner vos besoins.",
      "image": "teamMeeting",
      "floatTitle": "Basés en Tunisie"
    },
    "mission": {
      "eyebrow": "Notre mission",
      "statement": {
        "start": "Assurer le",
        "accent": "bien-être et le confort",
        "end": "de nos clients, avec une qualité adaptée aux besoins de chaque personne accompagnée."
      }
    },
    "story": {
      "eyebrow": "Notre histoire",
      "title": {
        "start": "D’où nous venons,",
        "accent": "ce qui nous anime"
      },
      "text": "Lasistant.Pro intervient dans le domaine de l’assistance médicale et de l’hébergement, pour faciliter le séjour de patients, d’étudiants et de personnes âgées en Tunisie.",
      "placeholderTitle": "Historique de l’organisation",
      "placeholderText": "À compléter par le propriétaire : date de création, fondateurs, étapes clés et repères validés."
    },
    "approach": {
      "eyebrow": "Notre approche",
      "title": {
        "start": "Un accompagnement",
        "accent": "vraiment personnalisé"
      },
      "items": [
        {
          "title": "Cerner vos besoins",
          "text": "Chaque demande commence par une écoute attentive de votre situation, de vos dates et de vos contraintes."
        },
        {
          "title": "Vous accompagner dans vos démarches",
          "text": "Dossier, orientation, logement, déplacements : nous avançons avec vous, étape par étape."
        },
        {
          "title": "Un soutien plus personnel",
          "text": "N’hésitez pas à nous solliciter : notre présence est là pour vous offrir un soutien plus personnel."
        }
      ]
    },
    "identity": {
      "eyebrow": "Une équipe identifiable",
      "title": {
        "start": "Reconnaissables",
        "accent": "au premier regard"
      },
      "text": "Nos accompagnateurs portent le badge LASISTANT.PRO, vos déplacements se font dans un véhicule identifié et un kit de bienvenue vous est remis à votre arrivée. À tout moment, vous savez qui vous accompagne.",
      "items": [
        {
          "image": "brandKit",
          "title": "Aux couleurs de l’agence",
          "text": "Sac, gourdes, stylos et carnet : « Je suis assisté par Lasistant.Pro »."
        },
        {
          "image": "welcomeKit",
          "title": "Un accueil préparé",
          "text": "Votre kit de bienvenue vous attend à votre arrivée."
        },
        {
          "image": "teamVehicleDoor",
          "title": "Un véhicule identifié",
          "text": "Pour vos trajets entre l’aéroport, votre logement et vos rendez-vous."
        }
      ]
    },
    "values": {
      "eyebrow": "Nos valeurs",
      "title": "Ce qui guide chacune de nos interventions"
    },
    "zone": {
      "eyebrow": "Zone d’intervention",
      "title": {
        "start": "Nous intervenons",
        "accent": "en Tunisie"
      },
      "text": "Pour les personnes qui y séjournent dans le cadre d’un traitement, de leurs études ou d’un accompagnement.",
      "pending": "liste des villes et zones couvertes à confirmer avant publication",
      "linkLabel": "Vérifier si nous intervenons dans votre zone"
    },
    "team": {
      "eyebrow": "L’équipe",
      "title": {
        "start": "Les personnes",
        "accent": "à vos côtés"
      },
      "pendingLabel": "Photos et noms à fournir",
      "members": [
        {
          "name": null,
          "role": "assistant(e) social(e)"
        },
        {
          "name": null,
          "role": "chargé(e) logement"
        },
        {
          "name": null,
          "role": "accompagnateur(trice)"
        },
        {
          "name": null,
          "role": null
        }
      ]
    }
  },
  "services": {
    "seo": {
      "title": "Nos services",
      "description": "Assistance médicale, logement et accompagnement des malades : LASISTANT.PRO coordonne vos démarches en Tunisie."
    },
    "hero": {
      "eyebrow": "Nos services",
      "title": {
        "start": "Des services pensés pour",
        "accent": "chaque étape",
        "end": "de votre séjour"
      },
      "lead": "Assistance médicale, logement et accompagnement : LASISTANT.PRO coordonne vos démarches en Tunisie avec une approche humaine et personnalisée."
    },
    "finder": {
      "eyebrow": "Trouver le bon service",
      "title": "Quelle est votre situation ?",
      "options": [
        {
          "label": "Je prépare un traitement en Tunisie",
          "hint": "Assistance médicale",
          "to": "/services/assistance-medicale",
          "icon": "medical",
          "tone": "brand"
        },
        {
          "label": "Je cherche un logement, patient ou étudiant",
          "hint": "Logement & hébergement",
          "to": "/services/logement-hebergement",
          "icon": "housing",
          "tone": "success"
        },
        {
          "label": "J’accompagne un proche âgé ou malade",
          "hint": "Accompagnement des malades",
          "to": "/services/accompagnement-des-malades",
          "icon": "care",
          "tone": "gold"
        },
        {
          "label": "Je suis un professionnel ou un partenaire",
          "hint": "Prendre contact",
          "to": "/contact",
          "icon": "partner",
          "tone": "neutral"
        }
      ]
    },
    "rowImages": {
      "assistance-medicale": "familyConsultation",
      "logement-hebergement": "brightApartment",
      "accompagnement-des-malades": "airportWelcome"
    },
    "help": {
      "title": "Vous ne savez pas quel service choisir ?",
      "text": "Réservez un échange de 1 h avec notre assistant social : nous faisons le point ensemble, par e-mail ou par téléphone, et nous vous orientons.",
      "cta": {
        "label": "Réserver un échange",
        "to": "/reservation"
      }
    }
  },
  "assistance-medicale": {
    "seo": {
      "title": "Assistance médicale en Tunisie",
      "description": "Étude préalable de votre dossier et orientation vers un médecin habilité en Tunisie. Un accompagnement humain et personnalisé."
    },
    "hero": {
      "eyebrow": "Assistance médicale · Soins personnalisés",
      "title": {
        "start": "Un accompagnement",
        "accent": "attentif",
        "end": "pour poursuivre votre traitement en Tunisie"
      },
      "lead": "Nous étudions votre dossier en amont, facilitons l’orientation vers un médecin habilité à vous examiner sur place et vous accompagnons dans chacune de vos démarches.",
      "note": "Un service d’accompagnement : nous ne réalisons ni diagnostic ni acte médical.",
      "image": "familyConsultation",
      "floatTitle": "Premier échange de 1 h",
      "floatText": "Par e-mail ou par téléphone"
    },
    "role": {
      "title": "Important : notre rôle",
      "text": "LASISTANT.PRO est un service d’accompagnement et de coordination. Nous ne remplaçons pas un professionnel de santé et ne formulons aucun diagnostic ni promesse de résultat. Seul le médecin qui vous examine est habilité à se prononcer sur votre situation."
    },
    "features": {
      "eyebrow": "Ce que nous faisons",
      "title": {
        "start": "Un relais",
        "accent": "humain et organisé",
        "end": "entre vous et votre séjour"
      },
      "lead": "Nous prenons en charge l’organisation pour que vous puissiez vous concentrer sur l’essentiel.",
      "items": [
        {
          "title": "Étude préalable du dossier",
          "text": "Nous prenons connaissance de votre demande et de votre situation avant votre venue.",
          "icon": "fileReview"
        },
        {
          "title": "Orientation vers un médecin habilité",
          "text": "Votre dossier est orienté vers un médecin habilité à vous examiner une fois en Tunisie.",
          "icon": "orientation"
        },
        {
          "title": "Organisation du séjour",
          "text": "Logement, accueil, déplacements : nous coordonnons avec vous les aspects pratiques.",
          "icon": "stay"
        },
        {
          "title": "Assistance à domicile",
          "text": "Un suivi personnalisé, confortable et sécurisant, avec une approche chaleureuse.",
          "icon": "housing",
          "pending": "Périmètre à confirmer"
        }
      ]
    },
    "field": {
      "eyebrow": "Sur le terrain",
      "title": {
        "start": "Nous vous accompagnons",
        "accent": "jusqu’en consultation"
      },
      "lead": "Une fois en Tunisie, un membre de l’équipe vous accompagne aux rendez-vous chez les médecins vers lesquels vous êtes orienté(e).",
      "items": [
        {
          "image": "eyeExam",
          "title": "Examens et rendez-vous",
          "text": "Nous organisons vos rendez-vous et vous y accompagnons."
        },
        {
          "image": "doctorConsultation",
          "title": "Des échanges facilités",
          "text": "Nous vous aidons à préparer vos questions et à exposer votre situation."
        },
        {
          "image": "eyeExamFollowUp",
          "title": "Un suivi dans la durée",
          "text": "Nous restons présents pour les rendez-vous de suivi pendant votre séjour."
        }
      ]
    },
    "preparation": {
      "eyebrow": "Avant votre arrivée",
      "title": {
        "start": "Votre parcours de",
        "accent": "préparation"
      },
      "lead": "Quatre étapes claires pour arriver en Tunisie l’esprit tranquille, en sachant qui vous accompagne.",
      "steps": [
        {
          "title": "Premier échange",
          "text": "Un rendez-vous de 1 h, par e-mail ou par téléphone, pour comprendre votre besoin et répondre à vos questions."
        },
        {
          "title": "Étude préalable du dossier",
          "text": "Nous examinons votre demande et identifions les démarches à prévoir avant votre arrivée."
        },
        {
          "title": "Orientation",
          "text": "Nous facilitons l’orientation vers un médecin habilité à vous examiner une fois en Tunisie."
        },
        {
          "title": "Arrivée & accompagnement",
          "text": "Accueil, installation et présence attentive pendant votre séjour, selon vos besoins."
        }
      ],
      "checklistTitle": "Préparer votre premier échange",
      "checklistIntro": "Pour gagner du temps, gardez ces informations à portée de main :",
      "checklist": [
        "Vos dates de séjour envisagées",
        "Le profil de la personne concernée",
        "Vos besoins de logement et d’accompagnement",
        "Vos questions pratiques"
      ],
      "privacyNote": "N’envoyez pas de documents médicaux via les formulaires du site. Si nécessaire, nous vous indiquerons un moyen d’envoi sécurisé."
    },
    "homeCare": {
      "eyebrow": "Assistance à domicile",
      "title": {
        "start": "Un suivi personnalisé,",
        "accent": "chez vous"
      },
      "text": "Notre équipe fournit une assistance complète et personnalisée à domicile, avec un suivi attentif et une prise en charge chaleureuse.",
      "image": "careSession",
      "qualities": [
        "Confort",
        "Sécurité",
        "Prise en charge professionnelle",
        "Approche chaleureuse"
      ],
      "pending": "Modalités et zones d’intervention à confirmer par LASISTANT.PRO"
    },
    "related": [
      {
        "tag": "Logement",
        "title": "Un logement adapté pendant votre traitement",
        "text": "Pour vous et la personne qui vous accompagne.",
        "image": "bedroom",
        "to": "/services/logement-hebergement"
      },
      {
        "tag": "Accompagnement",
        "title": "Une présence attentive pendant le séjour",
        "text": "Accueil, déplacements, démarches : nous restons à vos côtés.",
        "image": "hospitalVisit",
        "to": "/services/accompagnement-des-malades"
      }
    ],
    "relatedTitle": "Services complémentaires",
    "faqTitle": "Vos questions sur l’assistance médicale",
    "faqCategory": "assistance-medicale"
  },
  "logement": {
    "seo": {
      "title": "Logement et hébergement en Tunisie",
      "description": "Patient ou étudiant, pour un court ou un long séjour : nous recherchons un logement adapté à vos dates et à votre budget en Tunisie."
    },
    "hero": {
      "eyebrow": "Logement · Professionnalisme et dévouement",
      "title": {
        "start": "Un logement adapté à votre séjour,",
        "accent": "trouvé avec vous"
      },
      "lead": "Patient ou étudiant, pour un court ou un long séjour : nous recherchons des solutions adaptées aux disponibilités et à votre budget, en lien avec agences, responsables et propriétaires.",
      "image": "livingRoom",
      "floatTitle": "Séjour court ou long",
      "floatText": "Selon vos dates et votre budget"
    },
    "profiles": {
      "eyebrow": "Pour qui ?",
      "title": {
        "start": "Deux profils,",
        "accent": "un même soin",
        "end": "du détail"
      },
      "items": [
        {
          "tag": "Patients",
          "title": "Vous êtes patient(e)",
          "text": "Un logement confortable et pratique pendant votre traitement, pour vous et, si besoin, la personne qui vous accompagne.",
          "points": [
            "Séjour de courte ou de longue durée",
            "Les commodités nécessaires à votre confort",
            "Coordination avec votre accompagnement"
          ],
          "image": "bedroom"
        },
        {
          "tag": "Étudiants & parents",
          "title": "Vous êtes étudiant(e) ou parent",
          "text": "Nous soulageons les parents qui souhaitent trouver rapidement un logement ou une chambre en colocation pour leur futur diplômé.",
          "points": [
            "Chambre, studio ou colocation",
            "Un budget maîtrisé",
            "Une recherche accompagnée, de A à Z"
          ],
          "image": "studyDesk"
        }
      ]
    },
    "solutions": {
      "eyebrow": "Les solutions recherchées",
      "title": {
        "start": "Des logements",
        "accent": "attractifs",
        "end": ", adaptés à vos besoins"
      },
      "lead": "Selon les offres disponibles, nous privilégions des solutions attractives, moins coûteuses et dotées des commodités nécessaires.",
      "items": [
        {
          "title": "Appartement",
          "text": "Pour un séjour en famille ou avec un accompagnant.",
          "icon": "apartment"
        },
        {
          "title": "Studio",
          "text": "Une solution indépendante et pratique.",
          "icon": "studio"
        },
        {
          "title": "Chambre",
          "text": "Pour un séjour court ou un budget serré.",
          "icon": "room"
        },
        {
          "title": "Colocation",
          "text": "Idéale pour les étudiants qui arrivent en Tunisie.",
          "icon": "family"
        }
      ],
      "criteriaLabel": "Nous tenons compte de :",
      "criteria": [
        "Vos dates",
        "Votre budget",
        "Le nombre de personnes",
        "Les commodités",
        "Vos besoins particuliers"
      ]
    },
    "method": {
      "eyebrow": "Notre méthode",
      "title": {
        "start": "Trois étapes jusqu’à",
        "accent": "votre installation"
      },
      "steps": [
        {
          "title": "Vous précisez vos critères",
          "text": "Zone, dates, budget, type de logement, nombre de personnes et besoins particuliers."
        },
        {
          "title": "Nous sollicitons notre réseau",
          "text": "Agences immobilières, responsables et propriétaires, selon les disponibilités."
        },
        {
          "title": "Nous vous accompagnons",
          "text": "Présentation des solutions retenues, puis accompagnement jusqu’à votre installation."
        }
      ]
    },
    "form": {
      "eyebrow": "Formulaire de recherche",
      "title": {
        "start": "Décrivez",
        "accent": "votre recherche"
      },
      "lead": "Plus vos critères sont précis, plus notre recherche sera ciblée. Nous revenons vers vous par e-mail ou par téléphone.",
      "promises": [
        "Sans engagement",
        "Recherche selon les offres disponibles",
        "Un interlocuteur pour toutes vos questions"
      ]
    }
  },
  "accompagnement": {
    "seo": {
      "title": "Accompagnement des malades en Tunisie",
      "description": "Accueil à l’aéroport et présence attentive pendant le séjour, avec une attention particulière portée aux personnes âgées."
    },
    "hero": {
      "eyebrow": "Accompagnement · Soutien et bienveillance",
      "title": {
        "start": "Une présence attentive,",
        "accent": "de l’accueil",
        "end": "à la fin du séjour"
      },
      "lead": "Au-delà de l’accueil à l’aéroport, nous accompagnons les personnes pendant leur séjour, avec une attention particulière portée aux personnes âgées.",
      "image": "hospitalVisit",
      "floatTitle": "Dès votre arrivée",
      "floatText": "Accueil à l’aéroport et installation"
    },
    "pillars": {
      "eyebrow": "Notre engagement",
      "title": {
        "start": "Quatre attentions,",
        "accent": "à chaque instant"
      },
      "items": [
        {
          "title": "Confort",
          "text": "Un rythme respecté et un cadre agréable, pour un séjour sans fatigue inutile."
        },
        {
          "title": "Sécurité",
          "text": "Des déplacements et des démarches préparés, pour avancer en confiance."
        },
        {
          "title": "Bien-être",
          "text": "Une attention portée à l’humeur, aux besoins et aux envies de chacun."
        },
        {
          "title": "Présence humaine",
          "text": "Une présence attentive et des services personnalisés, tout au long du séjour."
        }
      ]
    },
    "field": {
      "eyebrow": "Sur le terrain",
      "title": {
        "start": "Dès votre arrivée,",
        "accent": "nous sommes là"
      },
      "lead": "Accueil à l’aéroport, kit de bienvenue, trajets vers le logement et les rendez-vous : chaque moment du séjour est préparé avec vous.",
      "items": [
        {
          "image": "airportWelcome",
          "title": "Accueil à l’aéroport",
          "text": "Nous vous attendons à la sortie et vous aidons avec vos bagages."
        },
        {
          "image": "welcomeKit",
          "title": "Installation",
          "text": "Un kit de bienvenue vous est remis à votre arrivée au logement."
        },
        {
          "image": "teamVehicleDoor",
          "title": "Trajets accompagnés",
          "text": "Un véhicule identifié pour vos déplacements et vos rendez-vous."
        }
      ]
    },
    "seniors": {
      "eyebrow": "Personnes âgées",
      "title": {
        "start": "Une attention",
        "accent": "particulière",
        "end": "pour nos aînés"
      },
      "text": "Rythme, mobilité, besoin d’être rassuré : nous adaptons notre accompagnement à chaque personne, pour qu’elle vive son séjour en toute sérénité.",
      "points": [
        {
          "label": "Accueil et aide à l’installation"
        },
        {
          "label": "Accompagnement lors des déplacements et des démarches"
        },
        {
          "label": "Présence attentive et services personnalisés"
        },
        {
          "label": "Lien avec les proches",
          "pending": "à confirmer"
        }
      ],
      "image": "eyeExamFollowUp"
    },
    "scope": {
      "eyebrow": "En toute transparence",
      "title": {
        "start": "Ce qui est inclus,",
        "accent": "et ce qui ne l’est pas"
      },
      "pendingLabel": "Contenu à valider par LASISTANT.PRO",
      "included": [
        "Accueil à l’arrivée, à l’aéroport",
        "Accompagnement pendant le séjour",
        "Aide aux déplacements et aux démarches",
        "Attention au confort, à la sécurité et au bien-être",
        "Suivi personnalisé"
      ],
      "excluded": [
        {
          "label": "Actes médicaux et soins infirmiers"
        },
        {
          "label": "Diagnostic ou avis médical"
        },
        {
          "label": "Frais médicaux, d’hébergement et de transport",
          "pending": "à préciser"
        },
        {
          "label": "",
          "pending": "Autre élément à préciser"
        }
      ]
    },
    "steps": {
      "eyebrow": "Déroulement",
      "title": "Comment se passe l’accompagnement ?",
      "items": [
        {
          "title": "Échange préalable",
          "text": "Nous faisons connaissance et définissons ensemble les besoins de la personne accompagnée."
        },
        {
          "title": "Préparation de l’arrivée",
          "text": "Horaires, logement, déplacements : tout est organisé en amont."
        },
        {
          "title": "Accueil & installation",
          "text": "Nous accueillons la personne à l’aéroport et l’aidons à s’installer."
        },
        {
          "title": "Présence pendant le séjour",
          "text": "Nous restons présents et disponibles jusqu’à la fin du séjour."
        }
      ]
    }
  },
  "reservation": {
    "seo": {
      "title": "Réservation en ligne",
      "description": "Réservez un échange de 1 h avec l’équipe LASISTANT.PRO, par e-mail ou par téléphone."
    },
    "hero": {
      "eyebrow": "Réservation en ligne",
      "title": {
        "start": "Réservez votre",
        "accent": "échange de 1 h"
      },
      "lead": "Choisissez votre service et votre créneau : notre équipe vous recontacte par e-mail ou par téléphone pour confirmer votre rendez-vous.",
      "pills": [
        "Environ 3 minutes",
        "Données protégées"
      ]
    },
    "steps": [
      {
        "id": "service",
        "label": "Service",
        "title": "Quel service vous intéresse ?",
        "lead": "Chaque demande commence par un échange de 1 h avec notre équipe."
      },
      {
        "id": "schedule",
        "label": "Date & heure",
        "title": "Choisissez une date et une heure",
        "lead": "Heure de Tunisie (UTC+1). Les créneaux sont indicatifs et confirmés par notre équipe."
      },
      {
        "id": "contact",
        "label": "Vos coordonnées",
        "title": "Vos coordonnées",
        "lead": "Elles nous permettent de vous recontacter pour confirmer le rendez-vous."
      },
      {
        "id": "details",
        "label": "Informations complémentaires",
        "title": "Informations complémentaires",
        "lead": "Facultatif, mais utile pour préparer au mieux notre échange."
      },
      {
        "id": "review",
        "label": "Validation",
        "title": "Vérifiez et confirmez",
        "lead": "Relisez votre demande avant de l’envoyer."
      }
    ],
    "summary": {
      "title": "Votre demande",
      "subtitle": "Échange avec un conseiller",
      "note": "Le rendez-vous est confirmé par notre équipe après examen de votre demande."
    },
    "privacyHint": "Merci de ne pas indiquer d’informations médicales détaillées.",
    "attachmentHint": "PDF, JPG ou PNG · 5 Mo maximum. Pour tout document médical, nous vous indiquerons un moyen d’envoi sécurisé."
  },
  "confirmation": {
    "seo": {
      "title": "Demande envoyée",
      "description": "Votre demande a bien été enregistrée."
    },
    "eyebrow": "Demande envoyée",
    "title": {
      "start": "Merci, votre demande est",
      "accent": "bien enregistrée"
    },
    "lead": "Un e-mail de confirmation vient de vous être envoyé. Notre équipe revient vers vous par téléphone ou par e-mail pour confirmer votre rendez-vous.",
    "nextSteps": [
      {
        "title": "Nous examinons votre demande",
        "text": "Votre demande est enregistrée et transmise à notre équipe."
      },
      {
        "title": "Nous confirmons le créneau",
        "text": "Un conseiller vous contacte par téléphone ou par e-mail."
      },
      {
        "title": "Nous préparons la suite",
        "text": "Ensemble, nous organisons votre accompagnement."
      }
    ],
    "readMore": {
      "eyebrow": "En attendant notre appel",
      "title": "À lire pour préparer votre séjour"
    }
  },
  "contact": {
    "seo": {
      "title": "Contact",
      "description": "Contactez LASISTANT.PRO par téléphone, par e-mail ou via le formulaire : assistance médicale, logement et accompagnement en Tunisie."
    },
    "hero": {
      "eyebrow": "Contact",
      "title": {
        "start": "Parlons de",
        "accent": "votre projet",
        "end": "de séjour"
      },
      "lead": "Une question, un besoin d’accompagnement ou un projet de partenariat ? Notre équipe vous répond par téléphone, par e-mail ou via le formulaire."
    },
    "formTitle": "Envoyez-nous un message",
    "map": {
      "pendingText": "Carte et itinéraire affichés une fois l’adresse complète validée.",
      "consentText": "La carte interactive s’affiche si vous acceptez les contenus tiers."
    },
    "partners": {
      "title": "Professionnels & partenaires",
      "text": "Agence immobilière, propriétaire, responsable de résidence ou professionnel : contactez-nous pour collaborer ou nous orienter des personnes à accompagner.",
      "cta": "Proposer un partenariat"
    }
  },
  "espace-infos": {
    "seo": {
      "title": "Espace infos : conseils pratiques et actualités",
      "description": "Publications utiles, conseils pratiques, actualités et informations liées aux services de LASISTANT.PRO."
    },
    "hero": {
      "eyebrow": "Espace infos",
      "title": {
        "start": "Conseils pratiques &",
        "accent": "actualités"
      },
      "lead": "Publications utiles, conseils pratiques, actualités et informations liées à nos services."
    },
    "pageSize": 6,
    "help": {
      "title": "Votre question n’est pas traitée ici ?",
      "text": "Consultez notre FAQ ou posez-nous directement votre question."
    },
    "article": {
      "inlineCta": {
        "title": "Besoin d’aide pour préparer votre séjour ?",
        "text": "Réservez un échange de 1 h, par e-mail ou par téléphone.",
        "label": "Demander un accompagnement"
      },
      "aside": {
        "title": "Un accompagnement personnalisé pour votre séjour",
        "text": "Étude du dossier, orientation, logement, accueil.",
        "label": "Réserver un échange"
      },
      "disclaimer": "Cet article est fourni à titre informatif. Il ne remplace pas un avis médical.",
      "related": {
        "eyebrow": "À lire aussi",
        "title": "Articles liés",
        "linkLabel": "Tout l’Espace infos"
      }
    }
  },
  "faq": {
    "seo": {
      "title": "Questions fréquentes",
      "description": "Assistance médicale, logement, accompagnement, réservation : les réponses aux questions fréquentes."
    },
    "hero": {
      "eyebrow": "FAQ",
      "title": {
        "start": "Les réponses à",
        "accent": "vos questions"
      },
      "lead": "Assistance médicale, logement, accompagnement, réservation : retrouvez l’essentiel avant de nous contacter."
    },
    "allLabel": "Toutes les questions",
    "help": {
      "title": "Vous ne trouvez pas votre réponse ?",
      "text": "Notre équipe vous répond par téléphone ou par e-mail."
    }
  },
  "cookies": {
    "seo": {
      "title": "Gestion des cookies",
      "description": "Choisissez à tout moment les cookies que vous acceptez sur le site LASISTANT.PRO."
    },
    "hero": {
      "eyebrow": "Confidentialité",
      "title": {
        "start": "Gestion des",
        "accent": "cookies"
      },
      "lead": "Choisissez à tout moment les cookies que vous acceptez. Vos choix s’appliquent à ce navigateur et à cet appareil."
    },
    "faq": [
      {
        "id": "definition",
        "question": "Qu’est-ce qu’un cookie ?",
        "answer": "Un cookie est un petit fichier déposé sur votre appareil lorsque vous consultez un site. Il permet par exemple de mémoriser vos choix ou de mesurer la fréquentation."
      },
      {
        "id": "modifier",
        "question": "Comment modifier mes choix plus tard ?",
        "answer": "À tout moment, depuis cette page ou grâce au bouton « Cookies » affiché en bas de l’écran. Vos nouveaux choix s’appliquent immédiatement."
      },
      {
        "id": "refus",
        "question": "Que se passe-t-il si je refuse tous les cookies ?",
        "answer": "Le site reste entièrement utilisable. Seuls la carte interactive et les boutons de partage sont remplacés par des liens simples, et aucune statistique n’est collectée."
      }
    ]
  },
  "plan-du-site": {
    "seo": {
      "title": "Plan du site",
      "description": "Toutes les pages du site LASISTANT.PRO."
    },
    "hero": {
      "eyebrow": "Navigation",
      "title": "Plan du site",
      "lead": "Toutes les pages de LASISTANT.PRO, en un coup d’œil."
    },
    "technical": {
      "title": "Plan pour les moteurs de recherche",
      "text": "Un fichier sitemap.xml est généré à chaque publication et déclaré dans robots.txt."
    }
  },
  "mentions-legales": {
    "eyebrow": "Informations légales",
    "title": "Mentions légales",
    "lead": "Dernière mise à jour : [[date à préciser]]",
    "notice": {
      "title": "À compléter avant publication",
      "text": "Les champs surlignés doivent être renseignés avec les données légales officielles de l’entreprise."
    },
    "sections": [
      {
        "id": "editeur",
        "title": "Éditeur du site",
        "blocks": [
          {
            "type": "publisher"
          }
        ]
      },
      {
        "id": "hebergement",
        "title": "Hébergement",
        "blocks": [
          {
            "type": "markdown",
            "text": "Le site est hébergé par [[nom de l’hébergeur]], [[adresse et coordonnées]]."
          }
        ]
      },
      {
        "id": "propriete",
        "title": "Propriété intellectuelle",
        "blocks": [
          {
            "type": "markdown",
            "text": "L’ensemble des contenus de ce site (textes, logo, éléments graphiques, structure) est la propriété de LASISTANT.PRO, sauf mention contraire. Toute reproduction, représentation ou adaptation, totale ou partielle, sans autorisation écrite préalable est interdite."
          }
        ]
      },
      {
        "id": "credits",
        "title": "Crédits photographiques",
        "blocks": [
          {
            "type": "markdown",
            "text": "Photographies des accompagnements, de l’équipe et des objets de l’agence : LASISTANT.PRO. Photographies des logements : Unsplash (licence Unsplash)."
          }
        ]
      },
      {
        "id": "responsabilite",
        "title": "Responsabilité",
        "blocks": [
          {
            "type": "markdown",
            "text": "Les informations publiées sur ce site sont fournies à titre indicatif et peuvent évoluer. LASISTANT.PRO est un service d’accompagnement : **les contenus du site ne constituent pas un avis médical** et ne remplacent pas la consultation d’un professionnel de santé."
          }
        ]
      },
      {
        "id": "liens",
        "title": "Liens externes",
        "blocks": [
          {
            "type": "markdown",
            "text": "Le site peut contenir des liens vers des sites tiers, notamment Facebook. LASISTANT.PRO n’exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu."
          }
        ]
      },
      {
        "id": "donnees",
        "title": "Données personnelles",
        "blocks": [
          {
            "type": "markdown",
            "text": "Le traitement des données collectées via les formulaires du site est détaillé dans notre [politique de confidentialité](/politique-de-confidentialite)."
          }
        ]
      },
      {
        "id": "contact",
        "title": "Contact",
        "blocks": [
          {
            "type": "markdown",
            "text": "Pour toute question relative au site : [imassist.service@hotmail.com](mailto:imassist.service@hotmail.com) ou [+216 54 479 391](tel:+21654479391)."
          }
        ]
      }
    ]
  },
  "confidentialite": {
    "eyebrow": "Données personnelles",
    "title": "Politique de",
    "titleAccent": "confidentialité",
    "lead": "Comment LASISTANT.PRO collecte, utilise et protège vos données personnelles. Dernière mise à jour : [[date à préciser]]",
    "notice": {
      "title": "Document à valider",
      "text": "Cette politique doit être validée par un conseil juridique avant publication, notamment la base légale et les durées de conservation."
    },
    "sections": [
      {
        "id": "responsable",
        "title": "Responsable du traitement",
        "blocks": [
          {
            "type": "markdown",
            "text": "Le responsable du traitement est **LASISTANT.PRO**, [[dénomination et forme juridique]], Avenue Habib Thamer, [[code postal, ville]], Tunisie. Contact : [imassist.service@hotmail.com](mailto:imassist.service@hotmail.com)."
          }
        ]
      },
      {
        "id": "donnees",
        "title": "Données collectées",
        "blocks": [
          {
            "type": "markdown",
            "text": "Nous collectons uniquement les données nécessaires au traitement de votre demande :"
          },
          {
            "type": "table",
            "head": [
              "Formulaire",
              "Données",
              "Usage"
            ],
            "rows": [
              [
                "**Réservation**",
                "Nom, téléphone, e-mail, service, profil, pays, date et heure souhaitées, message, consentement",
                "Organiser le rendez-vous"
              ],
              [
                "**Recherche de logement**",
                "Zone, dates, budget, type de logement, nombre de personnes, besoins, coordonnées",
                "Rechercher un logement adapté"
              ],
              [
                "**Contact**",
                "Nom, e-mail, téléphone, profil, message",
                "Répondre à votre message"
              ],
              [
                "**Navigation**",
                "Cookies essentiels ; mesure d’audience après consentement",
                "Fonctionnement et amélioration du site"
              ]
            ]
          },
          {
            "type": "markdown",
            "text": "**Nous ne collectons pas d’informations médicales détaillées** via les formulaires du site. Si des documents médicaux sont nécessaires au traitement d’une demande, un moyen d’envoi sécurisé vous est proposé."
          }
        ]
      },
      {
        "id": "finalites",
        "title": "Finalités et base légale",
        "blocks": [
          {
            "type": "list",
            "items": [
              "Traiter vos demandes de rendez-vous, de logement et d’accompagnement ;",
              "vous recontacter par téléphone ou par e-mail ;",
              "assurer la sécurité et le bon fonctionnement du site."
            ]
          },
          {
            "type": "markdown",
            "text": "Base légale : votre consentement et les mesures préalables à la fourniture du service que vous demandez. [[à valider]]"
          }
        ]
      },
      {
        "id": "conservation",
        "title": "Durées de conservation",
        "blocks": [
          {
            "type": "table",
            "head": [
              "Données",
              "Durée"
            ],
            "rows": [
              [
                "Demandes et réservations",
                "[[à définir]]"
              ],
              [
                "Messages de contact",
                "[[à définir]]"
              ],
              [
                "Journaux techniques (sans données sensibles)",
                "[[à définir]]"
              ]
            ]
          }
        ]
      },
      {
        "id": "destinataires",
        "title": "Destinataires",
        "blocks": [
          {
            "type": "markdown",
            "text": "Vos données sont accessibles uniquement aux membres habilités de l’équipe LASISTANT.PRO, selon leur rôle, et à nos prestataires techniques (hébergement, envoi d’e-mails) dans la limite de leurs missions. Elles ne sont jamais vendues."
          }
        ]
      },
      {
        "id": "securite",
        "title": "Sécurité",
        "blocks": [
          {
            "type": "markdown",
            "text": "Le site est servi en HTTPS. L’accès au back-office est protégé par authentification et par rôles (administrateur, éditeur, opérateur). Les fichiers sensibles sont stockés de manière privée et la base de données est sauvegardée régulièrement."
          }
        ]
      },
      {
        "id": "droits",
        "title": "Vos droits",
        "blocks": [
          {
            "type": "markdown",
            "text": "Conformément à la loi organique n° 2004-63 du 27 juillet 2004 relative à la protection des données à caractère personnel, vous disposez d’un droit d’accès, de rectification et d’opposition. Vous pouvez exercer ces droits en écrivant à [imassist.service@hotmail.com](mailto:imassist.service@hotmail.com). Vous pouvez également saisir l’Instance nationale de protection des données personnelles (INPDP)."
          },
          {
            "type": "markdown",
            "text": "Si vous résidez dans l’Union européenne, vous bénéficiez en outre des droits prévus par le RGPD. [[applicabilité à valider]]"
          }
        ]
      },
      {
        "id": "cookies",
        "title": "Cookies",
        "blocks": [
          {
            "type": "markdown",
            "text": "Les cookies non essentiels ne sont déposés qu’après votre consentement. Vous pouvez modifier votre choix à tout moment."
          },
          {
            "type": "cookie-table"
          },
          {
            "type": "cookie-settings"
          }
        ]
      }
    ]
  },
  "identite": {
    "values": [
      {
        "id": "ecoute",
        "title": "Écoute",
        "text": "Nous prenons le temps de comprendre votre situation et vos attentes."
      },
      {
        "id": "securite",
        "title": "Sécurité",
        "text": "Chaque étape est préparée pour que vous avanciez en confiance."
      },
      {
        "id": "confort",
        "title": "Confort",
        "text": "Nous veillons à votre bien-être, à votre arrivée comme pendant le séjour."
      },
      {
        "id": "personnalise",
        "title": "Accompagnement personnalisé",
        "text": "Un suivi adapté à votre profil, à votre rythme et à votre budget."
      }
    ],
    "journey": [
      {
        "id": "demande",
        "title": "Demande",
        "text": "Vous décrivez votre besoin en ligne, par téléphone ou par e-mail."
      },
      {
        "id": "qualification",
        "title": "Qualification",
        "text": "Nous échangeons avec vous pour cerner votre situation, vos dates et votre budget."
      },
      {
        "id": "preparation",
        "title": "Préparation",
        "text": "Étude du dossier, orientation, recherche de logement : nous organisons chaque démarche."
      },
      {
        "id": "accueil",
        "title": "Accueil & accompagnement",
        "text": "Nous vous accueillons à votre arrivée et restons présents pendant le séjour."
      },
      {
        "id": "suivi",
        "title": "Suivi",
        "text": "Nous restons à votre écoute pour ajuster l’accompagnement si nécessaire."
      }
    ],
    "audiences": [
      {
        "id": "patients",
        "title": "Patients internationaux",
        "need": "Préparer votre séjour, être orienté et accompagné en Tunisie.",
        "icon": "arrival",
        "cta": {
          "label": "Demander un accompagnement",
          "to": "/services/assistance-medicale"
        }
      },
      {
        "id": "familles",
        "title": "Familles & proches",
        "need": "Sécuriser l’organisation du séjour ou du logement d’un proche.",
        "icon": "family",
        "cta": {
          "label": "Parler à un conseiller",
          "to": "/contact"
        }
      },
      {
        "id": "etudiants",
        "title": "Étudiants",
        "need": "Trouver un logement ou une chambre, pour une courte ou une longue durée.",
        "icon": "student",
        "cta": {
          "label": "Demander un logement",
          "to": "/services/logement-hebergement"
        }
      },
      {
        "id": "personnes-agees",
        "title": "Personnes âgées",
        "need": "Être accompagné(e) dans vos déplacements et vos démarches.",
        "icon": "care",
        "cta": {
          "label": "Demander un accompagnement",
          "to": "/services/accompagnement-des-malades"
        }
      },
      {
        "id": "partenaires",
        "title": "Professionnels & partenaires",
        "need": "Collaborer avec nous ou nous orienter des personnes à accompagner.",
        "icon": "partner",
        "cta": {
          "label": "Prendre contact",
          "to": "/contact"
        }
      }
    ],
    "mission": "Assurer le bien-être et le confort de nos clients, avec une qualité adaptée aux besoins de chaque personne accompagnée.",
    "supportQuote": "N’hésitez pas à nous solliciter : notre objectif et notre présence sont là pour vous offrir un soutien plus personnel.",
    "signature": "L’équipe LASISTANT.PRO",
    "medicalDisclaimer": "Nos services d’accompagnement ne remplacent pas un avis médical.",
    "closingCta": {
      "title": {
        "start": "Prêt(e) à préparer",
        "accent": "votre séjour",
        "end": "?"
      },
      "text": "Réservez un échange de 1 h avec notre équipe, par e-mail ou par téléphone.",
      "primaryLabel": "Demander un accompagnement"
    }
  }
}$seed$::jsonb) as page (key, content)
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- Services : photos de l'équipe à la place des anciennes photos d'illustration
-- -----------------------------------------------------------------------------
update public.services as service
set image = seed.image, image_alt = seed.image_alt
from jsonb_to_recordset($seed$[
  {
    "id": "assistance-medicale",
    "image": "eyeExam",
    "image_alt": "Une patiente accompagnée par LASISTANT.PRO pendant un examen ophtalmologique"
  },
  {
    "id": "logement-hebergement",
    "image": "apartment",
    "image_alt": "Appartement meublé et lumineux"
  },
  {
    "id": "accompagnement-des-malades",
    "image": "hospitalVisit",
    "image_alt": "Un accompagnateur LASISTANT.PRO au chevet d’une patiente hospitalisée"
  },
  {
    "id": "echange-global",
    "image": "teamMeeting",
    "image_alt": "Un membre de l’équipe LASISTANT.PRO échange avec une cliente"
  }
]$seed$::jsonb) as seed (id text, image text, image_alt text)
where service.id = seed.id
  and service.image = any (array['consultation', 'medicalTeam', 'seniorCare', 'gardenWalk', 'supportiveHands', 'student', 'airportTraveler', 'airplaneWing', 'meeting', 'documents']::text[]);

-- -----------------------------------------------------------------------------
-- Articles : photos de couverture
-- -----------------------------------------------------------------------------
update public.articles as article
set cover_image = seed.cover_image, cover_alt = seed.cover_alt
from jsonb_to_recordset($seed$[
  {
    "id": "art-dossier-sejour-medical",
    "cover_image": "doctorConsultation",
    "cover_alt": "Une patiente expose sa situation à un médecin lors d’une consultation"
  },
  {
    "id": "art-logement-etudiant",
    "cover_image": "studyDesk",
    "cover_alt": "Bureau d’étudiant avec carnet et café"
  },
  {
    "id": "art-arriver-en-tunisie",
    "cover_image": "airportWelcome",
    "cover_alt": "Arrivée de clientes accompagnées par LASISTANT.PRO dans le hall de l’aéroport"
  },
  {
    "id": "art-proche-age",
    "cover_image": "eyeExamFollowUp",
    "cover_alt": "Un patient examiné par un ophtalmologue lors d’un rendez-vous organisé par LASISTANT.PRO"
  },
  {
    "id": "art-court-long-sejour",
    "cover_image": "bedroom",
    "cover_alt": "Chambre lumineuse et confortable"
  },
  {
    "id": "art-etude-prealable",
    "cover_image": "familyConsultation",
    "cover_alt": "Une patiente et sa proche échangent avec un médecin pendant une consultation"
  },
  {
    "id": "art-confort-domicile",
    "cover_image": "careSession",
    "cover_alt": "Un soignant prend en charge un patient lors d’un rendez-vous médical"
  },
  {
    "id": "art-premier-echange",
    "cover_image": "teamMeeting",
    "cover_alt": "Un membre de l’équipe LASISTANT.PRO échange avec une cliente"
  }
]$seed$::jsonb) as seed (id text, cover_image text, cover_alt text)
where article.id = seed.id
  and article.cover_image = any (array['consultation', 'medicalTeam', 'seniorCare', 'gardenWalk', 'supportiveHands', 'student', 'airportTraveler', 'airplaneWing', 'meeting', 'documents']::text[]);

-- -----------------------------------------------------------------------------
-- Médiathèque : photos de l'équipe (les anciennes photos d'illustration sont retirées par la
-- migration suivante, « retrait_anciennes_photos »)
-- -----------------------------------------------------------------------------
insert into public.media (
  file_name, kind, image, title, alt_text, size_bytes, width, height,
  uploaded_by, used_on, is_private, rights_confirmed
)
select
  seed.file_name, seed.kind, seed.image, seed.title, seed.alt_text, seed.size_bytes, seed.width, seed.height,
  seed.uploaded_by, seed.used_on, seed.is_private, seed.rights_confirmed
from jsonb_populate_recordset(null::public.media, $seed$[
  {
    "file_name": "team-meeting.webp",
    "kind": "image",
    "image": "teamMeeting",
    "title": "Échange avec une cliente",
    "alt_text": "Un membre de l’équipe LASISTANT.PRO, badge au logo de l’agence, échange avec une cliente",
    "size_bytes": 63140,
    "width": 1400,
    "height": 998,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [
      "Accueil (héros)",
      "Échange découverte"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "file_name": "airport-welcome.webp",
    "kind": "image",
    "image": "airportWelcome",
    "title": "Accueil à l’aéroport",
    "alt_text": "Arrivée de clientes accompagnées par LASISTANT.PRO dans le hall de l’aéroport",
    "size_bytes": 51286,
    "width": 1159,
    "height": 869,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [
      "Accueil (sur le terrain)",
      "Accompagnement",
      "Nos services"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "file_name": "eye-exam.webp",
    "kind": "image",
    "image": "eyeExam",
    "title": "Examen ophtalmologique",
    "alt_text": "Une patiente accompagnée par LASISTANT.PRO pendant un examen ophtalmologique",
    "size_bytes": 42772,
    "width": 720,
    "height": 900,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [
      "Accueil (services)",
      "Assistance médicale"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "file_name": "eye-exam-follow-up.webp",
    "kind": "image",
    "image": "eyeExamFollowUp",
    "title": "Rendez-vous de suivi",
    "alt_text": "Un patient examiné par un ophtalmologue lors d’un rendez-vous organisé par LASISTANT.PRO",
    "size_bytes": 32346,
    "width": 720,
    "height": 900,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [
      "Accompagnement (personnes âgées)"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "file_name": "doctor-consultation.webp",
    "kind": "image",
    "image": "doctorConsultation",
    "title": "Consultation médicale",
    "alt_text": "Une patiente expose sa situation à un médecin lors d’une consultation",
    "size_bytes": 67292,
    "width": 1168,
    "height": 1460,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [
      "Accueil (engagement)"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "file_name": "family-consultation.webp",
    "kind": "image",
    "image": "familyConsultation",
    "title": "Consultation en famille",
    "alt_text": "Une patiente et sa proche échangent avec un médecin pendant une consultation",
    "size_bytes": 35700,
    "width": 720,
    "height": 900,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [
      "Accueil (publics)",
      "Assistance médicale",
      "Nos services"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "file_name": "care-session.webp",
    "kind": "image",
    "image": "careSession",
    "title": "Séance de soins",
    "alt_text": "Un soignant prend en charge un patient lors d’un rendez-vous médical",
    "size_bytes": 15032,
    "width": 720,
    "height": 720,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [
      "Assistance médicale (à domicile)"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "file_name": "hospital-visit.webp",
    "kind": "image",
    "image": "hospitalVisit",
    "title": "Visite à l’hôpital",
    "alt_text": "Un accompagnateur LASISTANT.PRO au chevet d’une patiente hospitalisée",
    "size_bytes": 51580,
    "width": 1200,
    "height": 1440,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [
      "Accueil (services)",
      "Accompagnement"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "file_name": "welcome-kit.webp",
    "kind": "image",
    "image": "welcomeKit",
    "title": "Kit de bienvenue",
    "alt_text": "Kit de bienvenue LASISTANT.PRO posé dans le hall de l’hôtel, à côté d’une valise",
    "size_bytes": 33364,
    "width": 720,
    "height": 900,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [
      "Accueil (sur le terrain)",
      "À propos"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "file_name": "team-vehicle.webp",
    "kind": "image",
    "image": "teamVehicle",
    "title": "Véhicule LASISTANT.PRO",
    "alt_text": "Véhicule identifié au logo de LASISTANT.PRO pour les déplacements des clients",
    "size_bytes": 54092,
    "width": 1400,
    "height": 574,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [
      "Accueil (sur le terrain)"
    ],
    "is_private": false,
    "rights_confirmed": false
  },
  {
    "file_name": "team-vehicle-door.webp",
    "kind": "image",
    "image": "teamVehicleDoor",
    "title": "Portière du véhicule LASISTANT.PRO",
    "alt_text": "Portière du véhicule LASISTANT.PRO, aux couleurs de l’agence",
    "size_bytes": 37824,
    "width": 700,
    "height": 640,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [
      "À propos",
      "Accompagnement"
    ],
    "is_private": false,
    "rights_confirmed": true
  },
  {
    "file_name": "brand-kit.webp",
    "kind": "image",
    "image": "brandKit",
    "title": "Objets aux couleurs de l’agence",
    "alt_text": "Sac, gourdes, stylos et carnet aux couleurs de LASISTANT.PRO",
    "size_bytes": 25280,
    "width": 720,
    "height": 900,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [
      "À propos"
    ],
    "is_private": false,
    "rights_confirmed": true
  },
  {
    "file_name": "living-room.webp",
    "kind": "image",
    "image": "livingRoom",
    "title": "Salon d’un logement meublé",
    "alt_text": "Salon lumineux d’un logement meublé",
    "size_bytes": 98096,
    "width": 1400,
    "height": 934,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [
      "Accueil (héros)",
      "Logement"
    ],
    "is_private": false,
    "rights_confirmed": true
  },
  {
    "file_name": "apartment.webp",
    "kind": "image",
    "image": "apartment",
    "title": "Appartement meublé",
    "alt_text": "Appartement meublé et lumineux",
    "size_bytes": 88704,
    "width": 1400,
    "height": 934,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [
      "Accueil (services)"
    ],
    "is_private": false,
    "rights_confirmed": true
  },
  {
    "file_name": "bedroom.webp",
    "kind": "image",
    "image": "bedroom",
    "title": "Chambre lumineuse",
    "alt_text": "Chambre confortable et lumineuse",
    "size_bytes": 160556,
    "width": 1400,
    "height": 948,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [
      "Logement",
      "Assistance médicale"
    ],
    "is_private": false,
    "rights_confirmed": true
  },
  {
    "file_name": "bright-apartment.webp",
    "kind": "image",
    "image": "brightApartment",
    "title": "Salon lumineux",
    "alt_text": "Salon d’appartement lumineux avec des plantes",
    "size_bytes": 121366,
    "width": 1400,
    "height": 1042,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [
      "Nos services"
    ],
    "is_private": false,
    "rights_confirmed": true
  },
  {
    "file_name": "study-desk.webp",
    "kind": "image",
    "image": "studyDesk",
    "title": "Bureau d’étudiant",
    "alt_text": "Bureau d’étudiant avec carnet, ordinateur et café",
    "size_bytes": 73984,
    "width": 1400,
    "height": 933,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [
      "Logement",
      "Espace infos"
    ],
    "is_private": false,
    "rights_confirmed": true
  },
  {
    "file_name": "house-keys.webp",
    "kind": "image",
    "image": "houseKeys",
    "title": "Clés d’un logement",
    "alt_text": "Clés posées devant une maquette de maison",
    "size_bytes": 43216,
    "width": 1400,
    "height": 1051,
    "uploaded_by": "LASISTANT.PRO",
    "used_on": [],
    "is_private": false,
    "rights_confirmed": true
  }
]$seed$::jsonb) as seed
where not exists (
  select 1 from public.media as existing
  where existing.storage_path is null and existing.image = seed.image
);

-- Titres courts des photos fournies avec le site : seul un titre automatique d'origine (début
-- exact, mot pour mot, du texte alternatif) est remplacé ; un titre saisi est conservé.
update public.media as item
set title = seed.title
from jsonb_to_recordset($seed$[
  {
    "image": "teamMeeting",
    "title": "Échange avec une cliente"
  },
  {
    "image": "airportWelcome",
    "title": "Accueil à l’aéroport"
  },
  {
    "image": "eyeExam",
    "title": "Examen ophtalmologique"
  },
  {
    "image": "eyeExamFollowUp",
    "title": "Rendez-vous de suivi"
  },
  {
    "image": "doctorConsultation",
    "title": "Consultation médicale"
  },
  {
    "image": "familyConsultation",
    "title": "Consultation en famille"
  },
  {
    "image": "careSession",
    "title": "Séance de soins"
  },
  {
    "image": "hospitalVisit",
    "title": "Visite à l’hôpital"
  },
  {
    "image": "welcomeKit",
    "title": "Kit de bienvenue"
  },
  {
    "image": "teamVehicle",
    "title": "Véhicule LASISTANT.PRO"
  },
  {
    "image": "teamVehicleDoor",
    "title": "Portière du véhicule LASISTANT.PRO"
  },
  {
    "image": "brandKit",
    "title": "Objets aux couleurs de l’agence"
  },
  {
    "image": "livingRoom",
    "title": "Salon d’un logement meublé"
  },
  {
    "image": "apartment",
    "title": "Appartement meublé"
  },
  {
    "image": "bedroom",
    "title": "Chambre lumineuse"
  },
  {
    "image": "brightApartment",
    "title": "Salon lumineux"
  },
  {
    "image": "studyDesk",
    "title": "Bureau d’étudiant"
  },
  {
    "image": "houseKeys",
    "title": "Clés d’un logement"
  }
]$seed$::jsonb) as seed (image text, title text)
where item.storage_path is null
  and item.image = seed.image
  and starts_with(item.alt_text || ' ', item.title || ' ');
