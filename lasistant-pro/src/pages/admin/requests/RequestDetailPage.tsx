import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useId } from 'react';
import { Link, useParams, type LoaderFunctionArgs } from 'react-router';
import {
  bookingEventsQuery,
  bookingNotesQuery,
  bookingQuery,
  bookingsRepository,
  emailTemplatesQuery,
  servicesQuery,
  settingsQuery,
  teamQuery,
} from '@/api';
import { prefetch } from '@/app/prefetch';
import { queryClient as sharedQueryClient } from '@/app/query-client';
import { notFound, orNotFound } from '@/app/route-errors';
import { AdminPage, Panel, PanelBody, PanelHeader } from '@/components/admin/AdminPage';
import { Avatar } from '@/components/admin/Avatar';
import { KeyValueList, type KeyValueItem } from '@/components/admin/KeyValueList';
import { Seo } from '@/components/seo/Seo';
import { ActionMenu, Button, ButtonAnchor, Tag } from '@/components/ui';
import { Select } from '@/components/ui/form';
import {
  IconCheck,
  IconChevronRight,
  IconClock,
  IconEmail,
  IconPhone,
  IconSecure,
  IconSuccess,
} from '@/components/ui/icons';
import { IconBlock, IconCalendarConfirmed, IconCopy } from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import {
  BUDGET_PERIOD_LABELS,
  CONTACT_PREFERENCE_LABELS,
  HOUSING_TYPE_LABELS,
  PROFILE_LABELS,
  SOURCE_LABELS,
  SOURCE_PHRASES,
} from '@/content/labels';
import { templateValues } from '@/features/admin/emails/template-values';
import { ReplyComposer } from '@/features/admin/requests/ReplyComposer';
import { StatusBadge } from '@/features/admin/requests/RequestParts';
import { requestTopic } from '@/features/admin/requests/request-topic';
import { RequestNotes } from '@/features/admin/requests/RequestNotes';
import { RequestTimeline } from '@/features/admin/requests/RequestTimeline';
import { StatusSelector } from '@/features/admin/requests/StatusSelector';
import { useRequestActions } from '@/features/admin/requests/useRequestActions';
import { useSession } from '@/features/auth/auth-context';
import { useToast } from '@/features/toasts/toast-context';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { isoDateOf } from '@/lib/dates';
import { formatDateTime, formatDuration, formatLongDate, phoneHref, whatsappHref } from '@/lib/format';
import { can } from '@/lib/permissions';

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id;
  if (!id) notFound();
  await Promise.all([
    orNotFound(sharedQueryClient.ensureQueryData(bookingQuery(id))),
    prefetch(
      bookingEventsQuery(id),
      bookingNotesQuery(id),
      emailTemplatesQuery(),
      teamQuery(),
      servicesQuery(true),
    ),
  ]);
  return null;
}

/** Fiche d'une demande : informations, traitement, réponse, historique et notes (cahier des charges § 8.3). */
export function Component() {
  const { id = '' } = useParams();
  const session = useSession();
  const toast = useToast();
  const copy = useCopyToClipboard();
  const queryClient = useQueryClient();
  const canManage = can(session.role, 'requests:manage');
  const { data: booking } = useSuspenseQuery(bookingQuery(id));
  const { data: events } = useSuspenseQuery(bookingEventsQuery(id));
  const { data: notes } = useSuspenseQuery(bookingNotesQuery(id));
  const { data: templates } = useSuspenseQuery(emailTemplatesQuery());
  const { data: team } = useSuspenseQuery(teamQuery());
  const { data: services } = useSuspenseQuery(servicesQuery(true));
  const { data: settings } = useSuspenseQuery(settingsQuery());
  const { updateStatus, assign, addNote, logReply } = useRequestActions();
  const statusLabelId = useId();

  // Première consultation par cet utilisateur : tracée dans l'historique.
  useEffect(() => {
    void bookingsRepository
      .markViewed(id, session.name)
      .then(() => queryClient.invalidateQueries({ queryKey: bookingEventsQuery(id).queryKey }));
  }, [id, session.name, queryClient]);

  const createdTime = formatDateTime(booking.createdAt).split(' · ')[1] ?? '';
  // Réponses standards uniquement : les e-mails automatiques ont leur propre mise en page.
  const replyTemplates = templates.filter((template) => template.kind === 'manuel' && template.active);
  const values = templateValues(booking, services);
  const canConfirm = canManage && booking.status !== 'confirme' && booking.requestedDate !== null;

  const requesterItems: KeyValueItem[] = [
    { label: 'Nom complet', value: booking.fullName },
    {
      label: 'Téléphone',
      value: booking.phone ? (
        <span className="flex flex-wrap items-center gap-2.5">
          {booking.phone}
          <a
            href={phoneHref(booking.phone)}
            className="text-[13.5px] font-semibold text-brand hover:underline"
          >
            Appeler
          </a>
          <a
            href={whatsappHref(booking.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13.5px] font-semibold text-brand hover:underline"
          >
            WhatsApp
          </a>
        </span>
      ) : (
        <span className="text-muted">Non renseigné</span>
      ),
    },
    { label: 'E-mail', value: booking.email },
    {
      label: 'Pays de résidence',
      value: booking.country ?? <span className="text-muted">Non renseigné</span>,
    },
    {
      label: 'Profil',
      value: booking.profile ? (
        PROFILE_LABELS[booking.profile]
      ) : (
        <span className="text-muted">Non renseigné</span>
      ),
    },
    {
      label: 'Contact préféré',
      value: booking.contactPreference ? (
        CONTACT_PREFERENCE_LABELS[booking.contactPreference]
      ) : (
        <span className="text-muted">Non précisé</span>
      ),
    },
  ];

  const detailItems: KeyValueItem[] = [{ label: 'Service', value: requestTopic(booking, services) }];
  if (booking.subject) detailItems.push({ label: 'Objet', value: booking.subject });
  if (booking.requestedDate) {
    detailItems.push({
      label: 'Date souhaitée',
      value: `${formatLongDate(booking.requestedDate)} · ${booking.requestedTime ?? ''} (heure de Tunisie)`,
    });
  }
  if (booking.housing) {
    const { housing } = booking;
    detailItems.push(
      { label: 'Zone souhaitée', value: housing.zone },
      {
        label: 'Séjour',
        value: `Du ${formatLongDate(housing.arrivalDate)}${housing.departureDate ? ` au ${formatLongDate(housing.departureDate)}` : ''}`,
      },
      {
        label: 'Logement',
        value: `${HOUSING_TYPE_LABELS[housing.housingType]} · ${housing.persons} personne${housing.persons > 1 ? 's' : ''}`,
      },
      {
        label: 'Budget maximum',
        value:
          housing.budgetAmount !== null
            ? `${housing.budgetAmount.toLocaleString('fr-FR')} ${housing.budgetCurrency} ${BUDGET_PERIOD_LABELS[housing.budgetPeriod]}`
            : 'Non précisé',
      },
      { label: 'Besoins particuliers', value: housing.needs ?? <span className="text-muted">Aucun</span> },
    );
  } else if (booking.source === 'reservation') {
    detailItems.push(
      {
        label: 'Arrivée envisagée',
        value: booking.arrivalDate ? (
          formatLongDate(booking.arrivalDate)
        ) : (
          <span className="text-muted">Non précisée</span>
        ),
      },
      {
        label: 'Durée du séjour',
        value: booking.stayDuration ?? <span className="text-muted">Non précisée</span>,
      },
    );
  }
  if (booking.source === 'reservation') {
    detailItems.push({
      label: 'Document',
      value: booking.attachmentName ?? <span className="text-muted">Aucun document joint</span>,
    });
  }

  return (
    <AdminPage>
      <Seo title={`Demande ${booking.reference}`} description="Fiche d’une demande." noIndex />
      <div>
        <nav aria-label="Fil d’Ariane" className="mb-2.5 flex items-center gap-2 text-[13.5px] text-muted">
          <Link to={ROUTES.admin.requests} className="hover:text-ink">
            Demandes
          </Link>
          <IconChevronRight className="size-4" aria-hidden />
          <span aria-current="page">{booking.reference}</span>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="flex items-center gap-4">
            <Avatar name={booking.fullName} className="size-[52px] text-base" />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[24px] leading-[1.15] font-semibold tracking-[-0.028em] md:text-[28px]">
                  {booking.fullName}
                </h1>
                <StatusBadge status={booking.status} />
              </div>
              <p className="mt-1 text-muted">
                {booking.reference} · reçue le {formatLongDate(isoDateOf(booking.createdAt))} à {createdTime}{' '}
                via {SOURCE_PHRASES[booking.source]}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {booking.phone ? (
              <ButtonAnchor
                href={phoneHref(booking.phone)}
                variant="outline"
                shape="rounded"
                icon={<IconPhone />}
              >
                Appeler
              </ButtonAnchor>
            ) : null}
            <ButtonAnchor
              href={`mailto:${booking.email}?subject=${encodeURIComponent(`Votre demande ${booking.reference}`)}`}
              variant="outline"
              shape="rounded"
              icon={<IconEmail />}
            >
              Écrire
            </ButtonAnchor>
            {canConfirm ? (
              <Button
                shape="rounded"
                icon={<IconCalendarConfirmed />}
                loading={updateStatus.isPending}
                onClick={() => updateStatus.mutate({ id: booking.id, status: 'confirme' })}
              >
                Confirmer le rendez-vous
              </Button>
            ) : null}
            <ActionMenu
              label="Plus d’actions"
              items={[
                {
                  id: 'reference',
                  label: 'Copier la référence',
                  icon: <IconCopy />,
                  onSelect: () =>
                    void copy(booking.reference).then((ok) =>
                      ok ? toast.success('Référence copiée.') : toast.error('Copie impossible.'),
                    ),
                },
                ...(canManage
                  ? [
                      {
                        id: 'attente',
                        label: 'Mettre en attente',
                        icon: <IconClock />,
                        disabled: booking.status === 'en_attente',
                        onSelect: () => updateStatus.mutate({ id: booking.id, status: 'en_attente' }),
                      },
                      {
                        id: 'cloturer',
                        label: 'Clôturer la demande',
                        icon: <IconSuccess />,
                        disabled: booking.status === 'cloture',
                        onSelect: () => updateStatus.mutate({ id: booking.id, status: 'cloture' }),
                      },
                      {
                        id: 'annuler',
                        label: 'Annuler la demande',
                        icon: <IconBlock />,
                        tone: 'danger' as const,
                        disabled: booking.status === 'annule',
                        onSelect: () => updateStatus.mutate({ id: booking.id, status: 'annule' }),
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        </div>
      </div>

      <Panel labelledBy={statusLabelId}>
        <PanelBody className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <h2 id={statusLabelId} className="text-[15px] font-semibold">
              Statut de la demande
            </h2>
            <StatusSelector
              labelledBy={statusLabelId}
              value={booking.status}
              disabled={!canManage || updateStatus.isPending}
              onChange={(status) => updateStatus.mutate({ id: booking.id, status })}
            />
          </div>
          <div className="flex min-w-[min(240px,100%)] flex-col gap-[7px]">
            <label htmlFor="assignation" className="text-[13.5px] font-semibold">
              Assignée à
            </label>
            <Select
              id="assignation"
              density="compact"
              disabled={!canManage}
              value={booking.assigneeId ?? ''}
              onChange={(event) => {
                const member = team.find((user) => user.id === event.target.value);
                assign.mutate({
                  id: booking.id,
                  assignee: member ? { id: member.id, name: member.name } : null,
                });
              }}
            >
              <option value="">Non assignée</option>
              {team
                .filter((user) => user.active && can(user.role, 'requests:manage'))
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
            </Select>
          </div>
        </PanelBody>
      </Panel>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Panel labelledBy="demandeur">
            <PanelHeader titleId="demandeur" title="Demandeur" />
            <PanelBody>
              <KeyValueList items={requesterItems} />
            </PanelBody>
          </Panel>
          <Panel labelledBy="detail">
            <PanelHeader
              titleId="detail"
              title="Détail de la demande"
              action={
                <Tag tone="neutral">
                  {SOURCE_LABELS[booking.source]}
                  {booking.source === 'reservation'
                    ? ` · ${formatDuration(settings.booking.durationMinutes)}`
                    : ''}
                </Tag>
              }
            />
            <PanelBody className="flex flex-col gap-5">
              <KeyValueList items={detailItems} />
              <div className="flex flex-col gap-2.5">
                <p className="text-[13px] font-semibold tracking-[0.08em] text-muted uppercase">Message</p>
                <p className="rounded-xl border border-line bg-smoke p-4 text-[14.5px] whitespace-pre-line">
                  {booking.message ?? <span className="text-muted">Aucun message.</span>}
                </p>
              </div>
            </PanelBody>
          </Panel>
          {canManage ? (
            <Panel labelledBy="repondre">
              <PanelHeader
                titleId="repondre"
                title="Répondre avec un modèle"
                action={
                  can(session.role, 'email-templates:manage') ? (
                    <Link
                      to={ROUTES.admin.emails}
                      className="text-[13.5px] font-semibold text-brand hover:underline"
                    >
                      Gérer les modèles
                    </Link>
                  ) : null
                }
              />
              <PanelBody>
                <ReplyComposer
                  templates={replyTemplates}
                  recipient={booking.email}
                  values={values}
                  sending={logReply.isPending}
                  onSend={(reply) => logReply.mutate({ id: booking.id, ...reply })}
                />
              </PanelBody>
            </Panel>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Panel labelledBy="consentement">
            <PanelHeader titleId="consentement" title="Consentement & sécurité" />
            <PanelBody className="flex flex-col gap-2.5">
              <p className="flex items-center gap-2 text-[13.5px] font-medium text-success">
                <IconCheck className="size-4" aria-hidden />
                Politique de confidentialité acceptée
              </p>
              <p className="text-[13px] text-muted">
                Le {formatDateTime(booking.consentAt)} · version 1.0 de la politique
              </p>
              <p className="flex items-center gap-2 text-[13.5px] font-medium text-success">
                <IconSecure className="size-4" aria-hidden />
                Vérification anti-spam réussie
              </p>
            </PanelBody>
          </Panel>
          <Panel labelledBy="historique">
            <PanelHeader titleId="historique" title="Historique" />
            <PanelBody>
              <RequestTimeline events={events} />
            </PanelBody>
          </Panel>
          <Panel labelledBy="notes">
            <PanelHeader
              titleId="notes"
              title="Notes internes"
              description="Visibles par l’équipe uniquement"
            />
            <PanelBody>
              <RequestNotes
                notes={notes}
                canWrite={canManage}
                saving={addNote.isPending}
                onAdd={(text, done) => addNote.mutate({ id: booking.id, text }, { onSuccess: done })}
              />
            </PanelBody>
          </Panel>
        </div>
      </div>
    </AdminPage>
  );
}
