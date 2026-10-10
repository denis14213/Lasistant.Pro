import type { AccentText, FeatureItem, GalleryItem, ImageRef } from '@/types';

/** Contenu de la page « À propos » (cahier des charges § 6.6). */
export const ABOUT_CONTENT = {
  seo: {
    title: 'À propos',
    description:
      'LASISTANT.PRO, société de service social spécialisée dans l’assistance médicale et l’hébergement en Tunisie : mission, valeurs et approche.',
  },
  hero: {
    eyebrow: 'À propos',
    title: {
      start: 'Une société de service social,',
      accent: 'au service des personnes',
    } satisfies AccentText,
    lead: 'LASISTANT.PRO est une société de service social spécialisée dans l’assistance médicale et l’hébergement en Tunisie. Notre but : vous accompagner dans vos démarches et cerner vos besoins.',
    image: 'teamMeeting' satisfies ImageRef,
    floatTitle: 'Basés en Tunisie',
  },
  mission: {
    eyebrow: 'Notre mission',
    statement: {
      start: 'Assurer le',
      accent: 'bien-être et le confort',
      end: 'de nos clients, avec une qualité adaptée aux besoins de chaque personne accompagnée.',
    } satisfies AccentText,
  },
  story: {
    eyebrow: 'Notre histoire',
    title: { start: 'D’où nous venons,', accent: 'ce qui nous anime' } satisfies AccentText,
    text: 'Lasistant.Pro intervient dans le domaine de l’assistance médicale et de l’hébergement, pour faciliter le séjour de patients, d’étudiants et de personnes âgées en Tunisie.',
    placeholderTitle: 'Historique de l’organisation',
    placeholderText:
      'À compléter par le propriétaire : date de création, fondateurs, étapes clés et repères validés.',
  },
  approach: {
    eyebrow: 'Notre approche',
    title: { start: 'Un accompagnement', accent: 'vraiment personnalisé' } satisfies AccentText,
    items: [
      {
        title: 'Cerner vos besoins',
        text: 'Chaque demande commence par une écoute attentive de votre situation, de vos dates et de vos contraintes.',
      },
      {
        title: 'Vous accompagner dans vos démarches',
        text: 'Dossier, orientation, logement, déplacements : nous avançons avec vous, étape par étape.',
      },
      {
        title: 'Un soutien plus personnel',
        text: 'N’hésitez pas à nous solliciter : notre présence est là pour vous offrir un soutien plus personnel.',
      },
    ] satisfies readonly FeatureItem[],
  },
  identity: {
    eyebrow: 'Une équipe identifiable',
    title: { start: 'Reconnaissables', accent: 'au premier regard' } satisfies AccentText,
    text: 'Nos accompagnateurs portent le badge LASISTANT.PRO, vos déplacements se font dans un véhicule identifié et un kit de bienvenue vous est remis à votre arrivée. À tout moment, vous savez qui vous accompagne.',
    items: [
      {
        image: 'brandKit',
        title: 'Aux couleurs de l’agence',
        text: 'Sac, gourdes, stylos et carnet : « Je suis assisté par Lasistant.Pro ».',
      },
      {
        image: 'welcomeKit',
        title: 'Un accueil préparé',
        text: 'Votre kit de bienvenue vous attend à votre arrivée.',
      },
      {
        image: 'teamVehicleDoor',
        title: 'Un véhicule identifié',
        text: 'Pour vos trajets entre l’aéroport, votre logement et vos rendez-vous.',
      },
    ] satisfies readonly GalleryItem[],
  },
  values: {
    eyebrow: 'Nos valeurs',
    title: 'Ce qui guide chacune de nos interventions',
  },
  zone: {
    eyebrow: 'Zone d’intervention',
    title: { start: 'Nous intervenons', accent: 'en Tunisie' } satisfies AccentText,
    text: 'Pour les personnes qui y séjournent dans le cadre d’un traitement, de leurs études ou d’un accompagnement.',
    pending: 'liste des villes et zones couvertes à confirmer avant publication',
    linkLabel: 'Vérifier si nous intervenons dans votre zone',
  },
  team: {
    eyebrow: 'L’équipe',
    title: { start: 'Les personnes', accent: 'à vos côtés' } satisfies AccentText,
    pendingLabel: 'Photos et noms à fournir',
    members: [
      { name: null, role: 'assistant(e) social(e)' },
      { name: null, role: 'chargé(e) logement' },
      { name: null, role: 'accompagnateur(trice)' },
      { name: null, role: null },
    ] as Array<{ name: string | null; role: string | null }>,
  },
} as const;
