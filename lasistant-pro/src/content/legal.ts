/**
 * Documents légaux : mentions légales et politique de confidentialité.
 * Les zones « [[…]] » sont des informations à fournir ou à valider (affichées en doré).
 * Ces textes doivent être validés par un conseil juridique avant publication.
 */

export type LegalBlock =
  | { type: 'markdown'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'callout'; tone: 'info' | 'warning'; title: string; text: string }
  /** Tableau « Éditeur du site » construit à partir des réglages (données légales) */
  | { type: 'publisher' }
  /** Liste des cookies, issue du catalogue des cookies */
  | { type: 'cookie-table' }
  /** Bouton d'ouverture des préférences cookies */
  | { type: 'cookie-settings' };

export interface LegalSection {
  id: string;
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  lead: string;
  notice: { title: string; text: string };
  sections: LegalSection[];
}

export const LEGAL_NOTICE: LegalDocument = {
  eyebrow: 'Informations légales',
  title: 'Mentions légales',
  lead: 'Dernière mise à jour : [[date à préciser]]',
  notice: {
    title: 'À compléter avant publication',
    text: 'Les champs surlignés doivent être renseignés avec les données légales officielles de l’entreprise.',
  },
  sections: [
    { id: 'editeur', title: 'Éditeur du site', blocks: [{ type: 'publisher' }] },
    {
      id: 'hebergement',
      title: 'Hébergement',
      blocks: [
        {
          type: 'markdown',
          text: 'Le site est hébergé par [[nom de l’hébergeur]], [[adresse et coordonnées]].',
        },
      ],
    },
    {
      id: 'propriete',
      title: 'Propriété intellectuelle',
      blocks: [
        {
          type: 'markdown',
          text: 'L’ensemble des contenus de ce site (textes, logo, éléments graphiques, structure) est la propriété de LASISTANT.PRO, sauf mention contraire. Toute reproduction, représentation ou adaptation, totale ou partielle, sans autorisation écrite préalable est interdite.',
        },
      ],
    },
    {
      id: 'credits',
      title: 'Crédits photographiques',
      blocks: [
        {
          type: 'markdown',
          text: 'Photographies des accompagnements, de l’équipe et des objets de l’agence : LASISTANT.PRO. Photographies des logements : Unsplash (licence Unsplash).',
        },
      ],
    },
    {
      id: 'responsabilite',
      title: 'Responsabilité',
      blocks: [
        {
          type: 'markdown',
          text: 'Les informations publiées sur ce site sont fournies à titre indicatif et peuvent évoluer. LASISTANT.PRO est un service d’accompagnement : **les contenus du site ne constituent pas un avis médical** et ne remplacent pas la consultation d’un professionnel de santé.',
        },
      ],
    },
    {
      id: 'liens',
      title: 'Liens externes',
      blocks: [
        {
          type: 'markdown',
          text: 'Le site peut contenir des liens vers des sites tiers, notamment Facebook. LASISTANT.PRO n’exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.',
        },
      ],
    },
    {
      id: 'donnees',
      title: 'Données personnelles',
      blocks: [
        {
          type: 'markdown',
          text: 'Le traitement des données collectées via les formulaires du site est détaillé dans notre [politique de confidentialité](/politique-de-confidentialite).',
        },
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      blocks: [
        {
          type: 'markdown',
          text: 'Pour toute question relative au site : [imassist.service@hotmail.com](mailto:imassist.service@hotmail.com) ou [+216 54 479 391](tel:+21654479391).',
        },
      ],
    },
  ],
};

export const PRIVACY_POLICY: LegalDocument = {
  eyebrow: 'Données personnelles',
  title: 'Politique de',
  titleAccent: 'confidentialité',
  lead: 'Comment LASISTANT.PRO collecte, utilise et protège vos données personnelles. Dernière mise à jour : [[date à préciser]]',
  notice: {
    title: 'Document à valider',
    text: 'Cette politique doit être validée par un conseil juridique avant publication, notamment la base légale et les durées de conservation.',
  },
  sections: [
    {
      id: 'responsable',
      title: 'Responsable du traitement',
      blocks: [
        {
          type: 'markdown',
          text: 'Le responsable du traitement est **LASISTANT.PRO**, [[dénomination et forme juridique]], Avenue Habib Thamer, [[code postal, ville]], Tunisie. Contact : [imassist.service@hotmail.com](mailto:imassist.service@hotmail.com).',
        },
      ],
    },
    {
      id: 'donnees',
      title: 'Données collectées',
      blocks: [
        {
          type: 'markdown',
          text: 'Nous collectons uniquement les données nécessaires au traitement de votre demande :',
        },
        {
          type: 'table',
          head: ['Formulaire', 'Données', 'Usage'],
          rows: [
            [
              '**Réservation**',
              'Nom, téléphone, e-mail, service, profil, pays, date et heure souhaitées, message, consentement',
              'Organiser le rendez-vous',
            ],
            [
              '**Recherche de logement**',
              'Zone, dates, budget, type de logement, nombre de personnes, besoins, coordonnées',
              'Rechercher un logement adapté',
            ],
            ['**Contact**', 'Nom, e-mail, téléphone, profil, message', 'Répondre à votre message'],
            [
              '**Navigation**',
              'Cookies essentiels ; mesure d’audience après consentement',
              'Fonctionnement et amélioration du site',
            ],
          ],
        },
        {
          type: 'markdown',
          text: '**Nous ne collectons pas d’informations médicales détaillées** via les formulaires du site. Si des documents médicaux sont nécessaires au traitement d’une demande, un moyen d’envoi sécurisé vous est proposé.',
        },
      ],
    },
    {
      id: 'finalites',
      title: 'Finalités et base légale',
      blocks: [
        {
          type: 'list',
          items: [
            'Traiter vos demandes de rendez-vous, de logement et d’accompagnement ;',
            'vous recontacter par téléphone ou par e-mail ;',
            'assurer la sécurité et le bon fonctionnement du site.',
          ],
        },
        {
          type: 'markdown',
          text: 'Base légale : votre consentement et les mesures préalables à la fourniture du service que vous demandez. [[à valider]]',
        },
      ],
    },
    {
      id: 'conservation',
      title: 'Durées de conservation',
      blocks: [
        {
          type: 'table',
          head: ['Données', 'Durée'],
          rows: [
            ['Demandes et réservations', '[[à définir]]'],
            ['Messages de contact', '[[à définir]]'],
            ['Journaux techniques (sans données sensibles)', '[[à définir]]'],
          ],
        },
      ],
    },
    {
      id: 'destinataires',
      title: 'Destinataires',
      blocks: [
        {
          type: 'markdown',
          text: 'Vos données sont accessibles uniquement aux membres habilités de l’équipe LASISTANT.PRO, selon leur rôle, et à nos prestataires techniques (hébergement, envoi d’e-mails) dans la limite de leurs missions. Elles ne sont jamais vendues.',
        },
      ],
    },
    {
      id: 'securite',
      title: 'Sécurité',
      blocks: [
        {
          type: 'markdown',
          text: 'Le site est servi en HTTPS. L’accès au back-office est protégé par authentification et par rôles (administrateur, éditeur, opérateur). Les fichiers sensibles sont stockés de manière privée et la base de données est sauvegardée régulièrement.',
        },
      ],
    },
    {
      id: 'droits',
      title: 'Vos droits',
      blocks: [
        {
          type: 'markdown',
          text: 'Conformément à la loi organique n° 2004-63 du 27 juillet 2004 relative à la protection des données à caractère personnel, vous disposez d’un droit d’accès, de rectification et d’opposition. Vous pouvez exercer ces droits en écrivant à [imassist.service@hotmail.com](mailto:imassist.service@hotmail.com). Vous pouvez également saisir l’Instance nationale de protection des données personnelles (INPDP).',
        },
        {
          type: 'markdown',
          text: 'Si vous résidez dans l’Union européenne, vous bénéficiez en outre des droits prévus par le RGPD. [[applicabilité à valider]]',
        },
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies',
      blocks: [
        {
          type: 'markdown',
          text: 'Les cookies non essentiels ne sont déposés qu’après votre consentement. Vous pouvez modifier votre choix à tout moment.',
        },
        { type: 'cookie-table' },
        { type: 'cookie-settings' },
      ],
    },
  ],
};
