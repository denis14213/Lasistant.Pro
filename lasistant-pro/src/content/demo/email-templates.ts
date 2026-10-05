import { isoDaysAgo } from '@/lib/dates';
import type { EmailTemplate, SystemEmailTemplateKey } from '@/types';

/**
 * Modèles d'e-mails (automatiques et réponses standards).
 *
 * - `heading` et `body` sont les textes modifiables depuis le back-office ;
 *   la mise en page (récapitulatif, boutons, pied de page) dépend du modèle.
 * - Les variables s'écrivent entre crochets et sont remplacées à l'envoi.
 * - Mise en forme légère : `**gras**`, `_italique_`, `[lien](https://…)`, listes « - »,
 *   bouton `::bouton [Libellé](https://…)` et mention `[[à valider]]`.
 */
export function createEmailTemplatesSeed(now = new Date()): EmailTemplate[] {
  const base = {
    senderName: 'LASISTANT.PRO',
    replyTo: 'imassist.service@hotmail.com',
    active: true,
    updatedAt: isoDaysAgo(6, '11:00', now),
  };
  const team = { ...base, senderName: 'Back-office LASISTANT.PRO' };
  return [
    {
      ...base,
      id: 'tpl-1',
      key: 'confirmation-demandeur',
      name: 'Confirmation au demandeur',
      trigger: 'Après chaque demande',
      kind: 'automatique',
      audience: 'demandeur',
      subject: 'Votre demande [référence] est bien enregistrée',
      heading: 'Merci [prénom], nous avons bien reçu votre demande.',
      body: 'Un membre de notre équipe vous contacte rapidement par téléphone ou par e-mail pour confirmer votre rendez-vous. Voici le récapitulatif de votre demande.',
    },
    {
      ...base,
      senderName: 'Site LASISTANT.PRO',
      id: 'tpl-2',
      key: 'notification-equipe',
      name: 'Notification à l’équipe',
      trigger: 'Nouvelle demande reçue',
      kind: 'automatique',
      audience: 'equipe',
      subject: '[Nouvelle demande] [référence] · [service] · [nom]',
      heading: '[nom] · [service]',
      body: 'Reçue le [reçue_le] via [origine].',
    },
    {
      ...base,
      id: 'tpl-3',
      key: 'rendez-vous-confirme',
      name: 'Rendez-vous confirmé',
      trigger: 'Statut « Confirmé »',
      kind: 'automatique',
      audience: 'demandeur',
      subject: 'Votre rendez-vous du [date] est confirmé',
      heading: 'C’est noté, [prénom] : à [jour] !',
      body: 'Votre échange avec notre équipe est confirmé. Nous vous contacterons [contact_préféré] aux coordonnées indiquées dans votre demande.',
    },
    {
      ...team,
      id: 'tpl-4',
      key: 'reinitialisation-mot-de-passe',
      name: 'Réinitialisation du mot de passe',
      trigger: 'Équipe',
      kind: 'automatique',
      audience: 'equipe',
      subject: 'Réinitialisation de votre mot de passe',
      heading: 'Choisissez un nouveau mot de passe',
      body: 'Une demande de réinitialisation a été faite pour votre compte. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable 30 minutes [[durée à valider]] et ne peut être utilisé qu’une seule fois.',
    },
    {
      ...team,
      id: 'tpl-5',
      key: 'invitation-utilisateur',
      name: 'Invitation d’un utilisateur',
      trigger: 'Équipe',
      kind: 'automatique',
      audience: 'equipe',
      subject: 'Vous êtes invité(e) à rejoindre le back-office LASISTANT.PRO',
      heading: 'Bienvenue dans l’équipe',
      body: '**[invitant]** vous invite à rejoindre le back-office de LASISTANT.PRO avec le rôle suivant :',
    },
    {
      ...base,
      id: 'tpl-6',
      key: 'proposition-creneau',
      name: 'Proposition de créneau',
      trigger: 'Envoi manuel',
      kind: 'manuel',
      audience: 'demandeur',
      subject: 'Proposition de rendez-vous pour votre demande [référence]',
      heading: '',
      body: `Bonjour [prénom],

Merci pour votre demande d’accompagnement (réf. [référence]). Nous vous proposons un premier échange de 1 h le [date] à [heure] (heure de Tunisie), [contact_préféré].

Merci de nous confirmer ce créneau en répondant à ce message.

L’équipe LASISTANT.PRO`,
    },
    {
      ...base,
      id: 'tpl-7',
      key: 'informations-complementaires',
      name: 'Informations complémentaires',
      trigger: 'Envoi manuel',
      kind: 'manuel',
      audience: 'demandeur',
      subject: 'Votre demande [référence] : quelques précisions',
      heading: '',
      body: `Bonjour [prénom],

Pour avancer sur votre demande ([référence]), nous avons besoin de quelques précisions :
- vos dates de séjour envisagées ;
- le nombre de personnes concernées.

Pour protéger vos données, ne nous transmettez pas d’informations médicales détaillées par e-mail.

L’équipe LASISTANT.PRO`,
    },
  ];
}

/** Version d'origine d'un modèle fourni avec le site (bouton « Rétablir le modèle par défaut »). */
export function defaultEmailTemplate(key: SystemEmailTemplateKey): EmailTemplate | undefined {
  return createEmailTemplatesSeed().find((template) => template.key === key);
}
