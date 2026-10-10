import { BOOKING_STATUS_LABELS } from '@/content/labels';
import { addDays, isoDateInDays, isoDaysAgo, toISODate } from '@/lib/dates';
import type {
  ApplicantProfile,
  Booking,
  BookingEvent,
  BookingSource,
  BookingStatus,
  ContactPreference,
  HousingCriteria,
  InternalNote,
} from '@/types';

/**
 * Demandes de démonstration du back-office.
 * Personnes fictives. Les dates sont calculées par rapport au jour de la première
 * visite : le tableau de bord reste ainsi toujours réaliste.
 */

interface BookingSpec {
  number: number;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  source: BookingSource;
  serviceId: string | null;
  profile: ApplicantProfile;
  createdDaysAgo: number;
  createdTime: string;
  requested?: { inDays: number; time: string };
  status: BookingStatus;
  preference: ContactPreference;
  message?: string;
  housing?: Omit<HousingCriteria, 'arrivalDate'> & { arrivalInDays: number };
  subject?: string;
  assigneeId?: string;
}

const SPECS: BookingSpec[] = [
  {
    number: 148,
    fullName: 'Awa Koné',
    email: 'awa.kone@exemple.com',
    phone: '+225 01 23 45 67 89',
    country: 'Côte d’Ivoire',
    source: 'reservation',
    serviceId: 'assistance-medicale',
    profile: 'patient',
    createdDaysAgo: 0,
    createdTime: '09:42',
    requested: { inDays: 12, time: '10:00' },
    status: 'nouveau',
    preference: 'telephone',
    message:
      'Bonjour, je souhaite poursuivre un traitement en Tunisie et j’aurais besoin d’aide pour organiser mon séjour et trouver un logement pour moi et ma fille, qui m’accompagnera. Merci d’avance.',
  },
  {
    number: 147,
    fullName: 'Karim Ben Salah',
    email: 'karim.bs@exemple.com',
    phone: '+216 22 345 678',
    country: 'Tunisie',
    source: 'logement',
    serviceId: 'logement-hebergement',
    profile: 'etudiant',
    createdDaysAgo: 0,
    createdTime: '08:15',
    status: 'nouveau',
    preference: 'email',
    housing: {
      zone: 'Proximité de l’université',
      arrivalInDays: 18,
      departureDate: null,
      housingType: 'colocation',
      persons: 1,
      budgetAmount: 450,
      budgetCurrency: 'TND',
      budgetPeriod: 'mois',
      needs: 'Connexion Internet indispensable.',
    },
  },
  {
    number: 146,
    fullName: 'Fatou Ndiaye',
    email: 'f.ndiaye@exemple.com',
    phone: '+221 77 123 45 67',
    country: 'Sénégal',
    source: 'reservation',
    serviceId: 'accompagnement-des-malades',
    profile: 'proche',
    createdDaysAgo: 1,
    createdTime: '17:30',
    requested: { inDays: 7, time: '11:00' },
    status: 'nouveau',
    preference: 'whatsapp',
    message: 'Je cherche un accompagnement pour ma mère pendant son séjour.',
  },
  {
    number: 145,
    fullName: 'Jean-Marc Kouassi',
    email: 'jm.kouassi@exemple.com',
    phone: '+225 07 98 76 54 32',
    country: 'Côte d’Ivoire',
    source: 'reservation',
    serviceId: 'assistance-medicale',
    profile: 'patient',
    createdDaysAgo: 2,
    createdTime: '11:02',
    requested: { inDays: 10, time: '09:00' },
    status: 'en_cours',
    preference: 'whatsapp',
    assigneeId: 'usr-operateur-1',
  },
  {
    number: 144,
    fullName: 'Sarah Haddad',
    email: 'sarah.h@exemple.com',
    phone: '+213 550 12 34 56',
    country: 'Algérie',
    source: 'reservation',
    serviceId: 'logement-hebergement',
    profile: 'etudiant',
    createdDaysAgo: 3,
    createdTime: '14:20',
    requested: { inDays: 3, time: '14:00' },
    status: 'confirme',
    preference: 'email',
    assigneeId: 'usr-operateur-1',
  },
  {
    number: 143,
    fullName: 'Moussa Traoré',
    email: 'm.traore@exemple.com',
    phone: '+223 76 12 34 56',
    country: 'Mali',
    source: 'reservation',
    serviceId: 'echange-global',
    profile: 'patient',
    createdDaysAgo: 4,
    createdTime: '10:05',
    requested: { inDays: 4, time: '15:00' },
    status: 'confirme',
    preference: 'telephone',
    assigneeId: 'usr-admin',
  },
  {
    number: 142,
    fullName: 'Claire Martin',
    email: 'claire.m@exemple.com',
    phone: '+33 6 12 34 56 78',
    country: 'France',
    source: 'reservation',
    serviceId: 'accompagnement-des-malades',
    profile: 'proche',
    createdDaysAgo: 6,
    createdTime: '16:48',
    requested: { inDays: 1, time: '10:00' },
    status: 'confirme',
    preference: 'telephone',
    assigneeId: 'usr-operateur-1',
  },
  {
    number: 141,
    fullName: 'Amine Gharbi',
    email: 'a.gharbi@exemple.com',
    phone: '+218 91 234 5678',
    country: 'Libye',
    source: 'reservation',
    serviceId: 'assistance-medicale',
    profile: 'patient',
    createdDaysAgo: 8,
    createdTime: '09:12',
    requested: { inDays: 14, time: '10:00' },
    status: 'en_cours',
    preference: 'telephone',
    assigneeId: 'usr-operateur-2',
  },
  {
    number: 140,
    fullName: 'Grace Mbala',
    email: 'grace.mbala@exemple.com',
    phone: '+237 6 77 12 34 56',
    country: 'Cameroun',
    source: 'demande_rapide',
    serviceId: 'assistance-medicale',
    profile: 'patient',
    createdDaysAgo: 10,
    createdTime: '18:30',
    status: 'en_attente',
    preference: 'email',
    message: 'J’aimerais savoir comment se déroule l’étude préalable du dossier.',
  },
  {
    number: 139,
    fullName: 'Ines Trabelsi',
    email: 'ines.t@exemple.com',
    phone: '+216 98 765 432',
    country: 'Tunisie',
    source: 'logement',
    serviceId: 'logement-hebergement',
    profile: 'etudiant',
    createdDaysAgo: 14,
    createdTime: '12:40',
    status: 'en_attente',
    preference: 'email',
    housing: {
      zone: 'Centre-ville',
      arrivalInDays: 30,
      departureDate: null,
      housingType: 'studio',
      persons: 1,
      budgetAmount: 600,
      budgetCurrency: 'TND',
      budgetPeriod: 'mois',
      needs: null,
    },
  },
  {
    number: 138,
    fullName: 'Youssef Amrani',
    email: 'y.amrani@exemple.com',
    phone: '+212 6 61 23 45 67',
    country: 'Maroc',
    source: 'contact',
    serviceId: null,
    profile: 'professionnel',
    createdDaysAgo: 20,
    createdTime: '15:22',
    status: 'cloture',
    preference: 'email',
    subject: 'Partenariat',
    message: 'Agence immobilière, nous souhaitons vous proposer des logements meublés pour vos clients.',
  },
  {
    number: 137,
    fullName: 'Paul Essomba',
    email: 'p.essomba@exemple.com',
    phone: '+241 06 12 34 56',
    country: 'Gabon',
    source: 'reservation',
    serviceId: 'assistance-medicale',
    profile: 'proche',
    createdDaysAgo: 24,
    createdTime: '10:10',
    status: 'annule',
    preference: 'telephone',
  },
  /* Demandes plus anciennes : historique du graphique hebdomadaire */
  ...[33, 38, 41, 47, 52].map((days, index): BookingSpec => ({
    number: 136 - index,
    fullName:
      ['Nadia Belhadj', 'Omar Diallo', 'Léa Moreau', 'Samir Haddad', 'Aïcha Sow'][index] ?? 'Demandeur',
    email: `archive.${index + 1}@exemple.com`,
    phone: '+216 20 000 00' + index,
    country: 'Tunisie',
    source: index % 2 === 0 ? 'reservation' : 'logement',
    serviceId: index % 2 === 0 ? 'assistance-medicale' : 'logement-hebergement',
    profile: index % 2 === 0 ? 'patient' : 'etudiant',
    createdDaysAgo: days,
    createdTime: '11:00',
    status: 'cloture',
    preference: 'email',
  })),
];

/** Les rendez-vous de démonstration tombent toujours un jour d'ouverture (lundi à samedi). */
function openDayInDays(days: number, now: Date): string {
  let date = addDays(now, days);
  while (date.getDay() === 0) date = addDays(date, 1);
  return toISODate(date);
}

export interface BookingsSeed {
  bookings: Booking[];
  events: BookingEvent[];
  notes: InternalNote[];
}

export function createBookingsSeed(now = new Date()): BookingsSeed {
  const bookings: Booking[] = [];
  const events: BookingEvent[] = [];
  const notes: InternalNote[] = [];

  for (const spec of SPECS) {
    const createdAt = isoDaysAgo(spec.createdDaysAgo, spec.createdTime, now);
    const id = `bk-${spec.number}`;
    const year = new Date(createdAt).getFullYear();
    const housing: HousingCriteria | null = spec.housing
      ? { ...spec.housing, arrivalDate: isoDateInDays(spec.housing.arrivalInDays, now) }
      : null;

    bookings.push({
      id,
      reference: `LP-${year}-${String(spec.number).padStart(4, '0')}`,
      source: spec.source,
      serviceId: spec.serviceId,
      subject: spec.subject ?? null,
      fullName: spec.fullName,
      email: spec.email,
      phone: spec.phone,
      country: spec.country,
      profile: spec.profile,
      requestedDate: spec.requested ? openDayInDays(spec.requested.inDays, now) : null,
      requestedTime: spec.requested?.time ?? null,
      contactPreference: spec.preference,
      arrivalDate: spec.number === 148 ? isoDateInDays(40, now) : null,
      stayDuration: spec.number === 148 ? '1 à 4 semaines' : null,
      message: spec.message ?? null,
      housing,
      attachmentName: null,
      attachmentPath: null,
      confirmationKey: `cle-${spec.number}`,
      status: spec.status,
      assigneeId: spec.assigneeId ?? null,
      consentAt: createdAt,
      createdAt,
      updatedAt: createdAt,
    });

    const event = (type: BookingEvent['type'], label: string, actor: string | null = null): void => {
      events.push({ id: `${id}-ev-${events.length + 1}`, bookingId: id, type, label, actor, createdAt });
    };
    event('received', 'Demande reçue via le site');
    event('email_sent', `E-mail de confirmation envoyé à ${spec.email}`);
    event('notification_sent', 'Notification envoyée à imassist.service@hotmail.com');
    if (spec.status !== 'nouveau') {
      event('status_changed', `Statut modifié : ${BOOKING_STATUS_LABELS[spec.status]}`, 'Opérateur 1');
    }
  }

  notes.push({
    id: 'note-1',
    bookingId: 'bk-148',
    author: 'Opérateur 1',
    text: 'Rappeler en fin de matinée (décalage horaire). Vérifier les disponibilités de logement pour 2 personnes.',
    createdAt: isoDaysAgo(0, '10:12', now),
  });

  return { bookings, events, notes };
}
