import type { FaqCategory, FaqItem } from '@/types';

/** Thèmes de la FAQ. */
export const FAQ_CATEGORIES: FaqCategory[] = [
  { id: 'general', name: 'Général', sortOrder: 1 },
  { id: 'assistance-medicale', name: 'Assistance médicale', sortOrder: 2 },
  { id: 'logement', name: 'Logement', sortOrder: 3 },
  { id: 'accompagnement', name: 'Accompagnement', sortOrder: 4 },
  { id: 'reservation', name: 'Réservation', sortOrder: 5 },
  { id: 'donnees', name: 'Données personnelles', sortOrder: 6 },
];

/**
 * Questions fréquentes. Les réponses reprennent strictement le fond du site actuel ;
 * les points non confirmés portent une mention « à valider ».
 */
export function createFaqSeed(): FaqItem[] {
  let order = 0;
  const item = (
    categoryId: string,
    question: string,
    answer: string,
    pendingNote: string | null = null,
  ): FaqItem => {
    order += 1;
    return { id: `faq-${order}`, categoryId, question, answer, pendingNote, sortOrder: order };
  };

  return [
    item(
      'general',
      'Qu’est-ce que LASISTANT.PRO ?',
      'LASISTANT.PRO est une société de service social spécialisée dans l’assistance médicale, l’accompagnement et la recherche de logement en Tunisie, avec une approche humaine et personnalisée.',
    ),
    item(
      'general',
      'Dans quelle zone intervenez-vous ?',
      'Nous intervenons en Tunisie.',
      'Villes et zones couvertes à préciser',
    ),
    item(
      'general',
      'Comment vous contacter ?',
      'Par téléphone au +216 54 479 391 ou au +216 25 393 214, par e-mail à imassist.service@hotmail.com ou moryendi@gmail.com, ou via notre formulaire de contact.',
    ),
    item(
      'assistance-medicale',
      'Êtes-vous un établissement de santé ?',
      'Non. LASISTANT.PRO est un service d’accompagnement : nous facilitons vos démarches et l’orientation vers un médecin habilité, qui seul peut se prononcer sur votre situation.',
    ),
    item(
      'assistance-medicale',
      'Comment se déroule l’étude préalable de mon dossier ?',
      'Nous prenons connaissance de votre demande et de votre situation, puis nous facilitons l’orientation vers un médecin habilité à vous examiner une fois en Tunisie.',
    ),
    item(
      'assistance-medicale',
      'Puis-je envoyer des documents médicaux via le site ?',
      'Non. Pour protéger vos données, les formulaires du site ne sont pas prévus pour des documents médicaux. Si nécessaire, nous vous indiquerons un moyen d’envoi sécurisé.',
    ),
    item(
      'assistance-medicale',
      'Proposez-vous une assistance à domicile ?',
      'Oui, une assistance personnalisée à domicile, avec un suivi attentif, confortable et sécurisant.',
      'Modalités à confirmer',
    ),
    item(
      'logement',
      'Pour quelle durée pouvez-vous trouver un logement ?',
      'Pour un court comme pour un long séjour, selon les offres disponibles.',
    ),
    item(
      'logement',
      'Quels types de logements recherchez-vous ?',
      'Appartements, studios, chambres ou colocations, selon vos besoins, votre budget et les disponibilités.',
    ),
    item(
      'logement',
      'Avec qui travaillez-vous ?',
      'Nous travaillons en lien avec des agences immobilières, des responsables et des propriétaires.',
    ),
    item(
      'accompagnement',
      'En quoi consiste l’accompagnement des malades ?',
      'Au-delà de l’accueil à l’aéroport, nous assurons une présence attentive pendant le séjour, avec une attention particulière portée aux personnes âgées.',
    ),
    item(
      'accompagnement',
      'Que comprend l’accompagnement ?',
      'Accueil à l’arrivée, présence pendant le séjour, aide aux déplacements et aux démarches.',
      'Liste détaillée à valider',
    ),
    item(
      'reservation',
      'Combien de temps dure le premier échange ?',
      'Environ 1 heure, par e-mail ou par téléphone, selon votre préférence.',
    ),
    item(
      'reservation',
      'Puis-je modifier ou annuler ma demande ?',
      'Contactez-nous en indiquant votre numéro de demande.',
      'Conditions de modification et d’annulation à valider',
    ),
    item(
      'reservation',
      'Quels sont vos tarifs ?',
      'Contactez-nous pour connaître les conditions applicables à votre demande.',
      'Tarifs à communiquer',
    ),
    item(
      'donnees',
      'Comment mes données sont-elles utilisées ?',
      'Uniquement pour traiter votre demande et vous recontacter. Consultez notre politique de confidentialité pour en savoir plus.',
    ),
  ];
}
