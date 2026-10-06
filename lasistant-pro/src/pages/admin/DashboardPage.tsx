import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { allArticlesQuery, bookingsQuery, servicesQuery } from '@/api';
import { AdminPage, AdminPageHeader, Panel, PanelBody, PanelHeader } from '@/components/admin/AdminPage';
import { AdminTable } from '@/components/admin/AdminTable';
import { KpiCard } from '@/components/admin/KpiCard';
import { Seo } from '@/components/seo/Seo';
import { Badge, ButtonLink, EmptyState, IconBox, IconLink, ResponsiveImage } from '@/components/ui';
import {
  IconAdd,
  IconArrowRight,
  IconArticles,
  IconCalendar,
  IconChevronRight,
  IconServices,
  IconUpload,
  IconWarning,
} from '@/components/ui/icons';
import { IconIdentity, IconInbox } from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import { ARTICLE_STATUS_LABELS, CONTACT_PREFERENCE_LABELS } from '@/content/labels';
import { WeeklyChart } from '@/features/admin/dashboard/WeeklyChart';
import { Requester, StatusBadge } from '@/features/admin/requests/RequestParts';
import { requestTopic } from '@/features/admin/requests/request-topic';
import {
  countByService,
  isOverdue,
  isUnprocessed,
  receivedInPreviousPeriod,
  receivedWithin,
  upcomingAppointments,
  weeklyCounts,
} from '@/features/admin/requests/request-stats';
import { useSession } from '@/features/auth/auth-context';
import { useCurrentMinute, useToday } from '@/hooks/useNow';
import {
  formatCompactDate,
  formatDateTime,
  formatLongDate,
  formatPercent,
  formatRelative,
  formatShortDate,
} from '@/lib/format';
import { fromISODate, isoDateOf } from '@/lib/dates';
import { can } from '@/lib/permissions';
import { pluralize } from '@/lib/text';
import type { IconTone } from '@/types';

const PERIOD_DAYS = 30;

/** Tableau de bord du back-office (cahier des charges § 8.2). */
export function Component() {
  const session = useSession();
  const now = useCurrentMinute();
  const today = useToday();
  const canSeeRequests = can(session.role, 'requests:view');
  const canEditArticles = can(session.role, 'articles:manage');
  const { data: services } = useSuspenseQuery(servicesQuery(true));
  const { data: articles } = useSuspenseQuery(allArticlesQuery());
  const { data: bookings = [] } = useQuery({ ...bookingsQuery(), enabled: canSeeRequests });

  const recent = receivedWithin(bookings, PERIOD_DAYS, now);
  const previous = receivedInPreviousPeriod(bookings, PERIOD_DAYS, now);
  const unprocessed = bookings.filter(isUnprocessed);
  const overdue = unprocessed.filter((booking) => isOverdue(booking, now));
  const upcoming = upcomingAppointments(bookings, today);
  const nextAppointment = upcoming[0];
  const published = articles.filter((article) => article.status === 'publie');
  const drafts = articles.filter((article) => article.status === 'brouillon');
  const difference = recent.length - previous.length;
  const firstName = session.name.split(' ')[0] ?? session.name;
  const todayLabel = formatLongDate(today);

  return (
    <AdminPage>
      <Seo title="Tableau de bord" description="Activité du site LASISTANT.PRO." noIndex />
      <AdminPageHeader
        title={`Bonjour, ${firstName}`}
        description={`${todayLabel.charAt(0).toUpperCase()}${todayLabel.slice(1)} · voici l’activité de ces ${PERIOD_DAYS} derniers jours.`}
        actions={
          <>
            {canEditArticles ? (
              <ButtonLink to={ROUTES.admin.articleNew} variant="outline" shape="rounded" icon={<IconAdd />}>
                Nouvel article
              </ButtonLink>
            ) : null}
            {canSeeRequests ? (
              <ButtonLink to={ROUTES.admin.requests} shape="rounded" icon={<IconInbox />}>
                Traiter les demandes
              </ButtonLink>
            ) : null}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {canSeeRequests ? (
          <>
            <KpiCard
              label={`Demandes reçues · ${PERIOD_DAYS} j`}
              icon={<IconInbox />}
              value={recent.length}
              detail={
                <>
                  <span
                    className={difference >= 0 ? 'font-semibold text-success' : 'font-semibold text-danger'}
                  >
                    {difference >= 0 ? `+${difference}` : difference}
                  </span>{' '}
                  par rapport aux {PERIOD_DAYS} jours précédents
                </>
              }
            />
            <KpiCard
              label="Non traitées"
              icon={<IconWarning />}
              value={unprocessed.length}
              highlight={unprocessed.length > 0}
              detail={
                overdue.length > 0
                  ? `dont ${overdue.length} reçue${overdue.length > 1 ? 's' : ''} il y a plus de 24 h`
                  : 'Aucune demande en attente depuis plus de 24 h'
              }
            />
            <KpiCard
              label="Rendez-vous à venir"
              icon={<IconCalendar />}
              value={upcoming.length}
              detail={
                nextAppointment?.requestedDate
                  ? `Prochain : ${formatCompactDate(nextAppointment.requestedDate)} à ${nextAppointment.requestedTime}`
                  : 'Aucun rendez-vous planifié'
              }
            />
          </>
        ) : null}
        <KpiCard
          label="Articles publiés"
          icon={<IconArticles />}
          value={published.length}
          detail={
            drafts.length > 0
              ? `${pluralize(drafts.length, 'brouillon')} en cours`
              : 'Aucun brouillon en cours'
          }
        />
      </div>

      {canSeeRequests ? (
        <>
          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <Panel labelledBy="graphique-semaines">
              <PanelHeader
                titleId="graphique-semaines"
                title="Demandes reçues par semaine"
                description="8 dernières semaines · semaine en cours en violet"
              />
              <PanelBody>
                <WeeklyChart weeks={weeklyCounts(bookings, 8, now)} />
              </PanelBody>
            </Panel>
            <Panel labelledBy="repartition">
              <PanelHeader
                titleId="repartition"
                title="Répartition par service"
                description={`${pluralize(recent.length, 'demande')} · ${PERIOD_DAYS} derniers jours`}
              />
              <PanelBody className="flex flex-col gap-5">
                {recent.length === 0 ? (
                  <p className="text-muted">Aucune demande sur la période.</p>
                ) : (
                  countByService(recent).map(({ serviceId, count }) => {
                    const label =
                      services.find((service) => service.id === serviceId)?.title ?? 'Autres demandes';
                    const share = count / recent.length;
                    return (
                      <div key={serviceId ?? 'autres'} className="flex flex-col gap-1.5">
                        <div className="flex justify-between gap-3 text-[13.5px]">
                          <span>{label}</span>
                          <strong className="font-semibold tabular-nums">
                            {count} · {formatPercent(share)}
                          </strong>
                        </div>
                        <div className="h-2 overflow-hidden rounded-lg bg-neutral-soft" aria-hidden>
                          <span
                            className="block h-full rounded-lg bg-brand"
                            style={{ width: `${share * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </PanelBody>
            </Panel>
          </div>

          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <Panel labelledBy="dernieres-demandes">
              <PanelHeader
                titleId="dernieres-demandes"
                title="Dernières demandes"
                action={<PanelLink to={ROUTES.admin.requests}>Toutes les demandes</PanelLink>}
              />
              {bookings.length === 0 ? (
                <EmptyState icon={<IconInbox />} title="Aucune demande pour le moment" />
              ) : (
                <AdminTable minWidth={640} caption="Dernières demandes reçues">
                  <thead>
                    <tr>
                      <th scope="col">Demandeur</th>
                      <th scope="col">Service</th>
                      <th scope="col">Reçue</th>
                      <th scope="col">Statut</th>
                      <th scope="col">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 5).map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <Requester booking={booking} />
                        </td>
                        <td>{requestTopic(booking, services)}</td>
                        <td className="whitespace-nowrap">{formatDateTime(booking.createdAt)}</td>
                        <td>
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="text-right">
                          <IconLink
                            to={ROUTES.admin.request(booking.id)}
                            label={`Ouvrir la demande de ${booking.fullName}`}
                            variant="ghost"
                            size="sm"
                          >
                            <IconChevronRight aria-hidden />
                          </IconLink>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
              )}
            </Panel>
            <Panel labelledBy="prochains-rdv">
              <PanelHeader
                titleId="prochains-rdv"
                title="Prochains rendez-vous"
                action={
                  can(session.role, 'agenda:manage') ? (
                    <PanelLink to={ROUTES.admin.agenda}>Agenda</PanelLink>
                  ) : null
                }
              />
              {upcoming.length === 0 ? (
                <p className="px-5.5 py-6 text-muted">Aucun rendez-vous à venir.</p>
              ) : (
                <ul>
                  {upcoming.slice(0, 5).map((booking) => {
                    const day = fromISODate(booking.requestedDate ?? today);
                    return (
                      <li
                        key={booking.id}
                        className="grid grid-cols-[62px_minmax(0,1fr)_auto] items-center gap-3.5 border-b border-line px-5.5 py-3.5 last:border-b-0"
                      >
                        <span className="flex h-14 flex-col items-center justify-center rounded-xl bg-cloud leading-[1.1]">
                          <small className="text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
                            {day.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}
                          </small>
                          <b className="text-[19px] tracking-[-0.02em]">{day.getDate()}</b>
                        </span>
                        <Link to={ROUTES.admin.request(booking.id)} className="min-w-0 hover:text-brand">
                          <strong className="block truncate font-semibold">{booking.fullName}</strong>
                          <span className="text-[13px] text-muted">
                            {booking.requestedTime} · {requestTopic(booking, services)}
                            {booking.contactPreference
                              ? ` · ${CONTACT_PREFERENCE_LABELS[booking.contactPreference].toLowerCase()}`
                              : ''}
                          </span>
                        </Link>
                        <StatusBadge status={booking.status} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </div>
        </>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Panel labelledBy="derniers-articles">
          <PanelHeader
            titleId="derniers-articles"
            title="Derniers articles"
            action={
              canEditArticles ? <PanelLink to={ROUTES.admin.articles}>Gérer les articles</PanelLink> : null
            }
          />
          <ul>
            {articles.slice(0, 3).map((article) => (
              <li
                key={article.id}
                className="flex items-center gap-3.5 border-b border-line px-4.5 py-3.5 last:border-b-0"
              >
                <ResponsiveImage
                  image={article.coverImage}
                  alt=""
                  sizes="64px"
                  className="h-12 w-16 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <strong className="block truncate font-semibold">{article.title}</strong>
                  <span className="text-[13px] text-muted">
                    {article.publishedAt
                      ? formatShortDate(isoDateOf(article.publishedAt))
                      : `modifié ${formatRelative(article.updatedAt, new Date(now))}`}
                  </span>
                </div>
                <Badge tone={article.status === 'publie' ? 'success' : 'neutral'}>
                  {ARTICLE_STATUS_LABELS[article.status]}
                </Badge>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel labelledBy="acces-rapides">
          <PanelHeader titleId="acces-rapides" title="Accès rapides" />
          <PanelBody className="grid grid-cols-2 gap-2.5">
            {can(session.role, 'settings:manage') ? (
              <QuickLink
                to={ROUTES.admin.settings}
                icon={<IconIdentity />}
                tone="brand"
                label="Modifier les coordonnées"
              />
            ) : null}
            {can(session.role, 'agenda:manage') ? (
              <QuickLink
                to={ROUTES.admin.agenda}
                icon={<IconCalendar />}
                tone="brand"
                label="Gérer les créneaux"
              />
            ) : null}
            {can(session.role, 'services:manage') ? (
              <QuickLink
                to={ROUTES.admin.services}
                icon={<IconServices />}
                tone="brand"
                label="Modifier un service"
              />
            ) : null}
            {can(session.role, 'media:manage') ? (
              <QuickLink
                to={ROUTES.admin.media}
                icon={<IconUpload />}
                tone="brand"
                label="Ajouter des médias"
              />
            ) : null}
            {can(session.role, 'requests:view') && !can(session.role, 'settings:manage') ? (
              <QuickLink
                to={ROUTES.admin.requests}
                icon={<IconInbox />}
                tone="brand"
                label="Voir les demandes"
              />
            ) : null}
          </PanelBody>
        </Panel>
      </div>
    </AdminPage>
  );
}

function PanelLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand hover:underline"
    >
      {children}
      <IconArrowRight className="size-4" aria-hidden />
    </Link>
  );
}

function QuickLink({
  to,
  icon,
  tone,
  label,
}: {
  to: string;
  icon: ReactNode;
  tone: IconTone;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col gap-3 rounded-box border border-line bg-paper p-4 transition-colors hover:border-line-strong"
    >
      <IconBox tone={tone} size="xs" className="size-10">
        {icon}
      </IconBox>
      <strong className="text-[14.5px] font-semibold">{label}</strong>
    </Link>
  );
}
