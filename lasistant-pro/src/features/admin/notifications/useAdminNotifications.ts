import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { allArticlesQuery, bookingsQuery, servicesQuery } from '@/api';
import { ROUTES } from '@/config/routes';
import { SOURCE_LABELS } from '@/content/labels';
import { useSession } from '@/features/auth/auth-context';
import { useCurrentMinute, useToday } from '@/hooks/useNow';
import { isoDateOf } from '@/lib/dates';
import { formatRelative, formatShortDate } from '@/lib/format';
import { can } from '@/lib/permissions';
import { readStorage, writeStorage } from '@/lib/storage';
import { isOverdue, isUnprocessed, upcomingAppointments } from '../requests/request-stats';

/**
 * Notifications du back-office, déduites des données (aucune table dédiée en phase statique) :
 * nouvelles demandes, demandes en attente depuis plus de 24 h, prochain rendez-vous, article publié.
 * Phase 2 : alimentées par une table « notifications » et des événements en temps réel.
 */

export interface AdminNotification {
  id: string;
  kind: 'request' | 'overdue' | 'appointment' | 'article';
  title: string;
  /** Nom affiché en gras (demandeur, auteur) */
  subject: string;
  meta: string;
  to: string;
  createdAt: string;
  unread: boolean;
}

const storageKey = (userId: string) => `lp-notifications-lues-${userId}`;

export function useAdminNotifications() {
  const session = useSession();
  const now = useCurrentMinute();
  const today = useToday();
  const canSeeRequests = can(session.role, 'requests:view');
  const { data: bookings = [] } = useQuery({ ...bookingsQuery(), enabled: canSeeRequests });
  const { data: services = [] } = useQuery(servicesQuery(true));
  const { data: articles = [] } = useQuery(allArticlesQuery());
  const [lastSeenAt, setLastSeenAt] = useState(() => readStorage<string>(storageKey(session.userId), ''));

  const serviceName = (id: string | null) =>
    services.find((service) => service.id === id)?.title ?? 'Demande';
  const isUnread = (createdAt: string) => createdAt > lastSeenAt;

  const items: AdminNotification[] = [];
  for (const booking of bookings.filter(isUnprocessed).slice(0, 4)) {
    const overdue = isOverdue(booking, now);
    items.push({
      id: `${overdue ? 'retard' : 'demande'}-${booking.id}`,
      kind: overdue ? 'overdue' : 'request',
      title: overdue ? 'À traiter' : 'Nouvelle demande',
      subject: overdue ? `${booking.fullName} attend depuis plus de 24 h` : booking.fullName,
      meta: `${booking.source === 'reservation' ? serviceName(booking.serviceId) : SOURCE_LABELS[booking.source]} · ${formatRelative(booking.createdAt, new Date(now))}`,
      to: ROUTES.admin.request(booking.id),
      createdAt: booking.createdAt,
      unread: isUnread(booking.createdAt),
    });
  }
  const next = upcomingAppointments(bookings, today)[0];
  if (next?.requestedDate && next.requestedTime) {
    items.push({
      id: `rdv-${next.id}`,
      kind: 'appointment',
      title: 'Prochain rendez-vous',
      subject: `${formatShortDate(next.requestedDate)} à ${next.requestedTime} avec ${next.fullName}`,
      meta: 'Agenda',
      to: ROUTES.admin.agenda,
      createdAt: next.updatedAt,
      unread: false,
    });
  }
  const published = articles.find((article) => article.status === 'publie');
  if (published?.publishedAt) {
    items.push({
      id: `article-${published.id}`,
      kind: 'article',
      title: 'Article publié',
      subject: published.author,
      meta: `« ${published.title} » · ${formatShortDate(isoDateOf(published.publishedAt))}`,
      to: ROUTES.admin.articles,
      createdAt: published.publishedAt,
      unread: false,
    });
  }

  const markAllRead = useCallback(() => {
    const stamp = new Date().toISOString();
    writeStorage(storageKey(session.userId), stamp);
    setLastSeenAt(stamp);
  }, [session.userId]);

  return { items, unreadCount: items.filter((item) => item.unread).length, markAllRead };
}
