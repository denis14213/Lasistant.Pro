import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { bookingsQuery, bookingsRepository, getErrorMessage, queryKeys, servicesQuery } from '@/api';
import { AdminPage, AdminPageHeader, Panel, PanelFooter } from '@/components/admin/AdminPage';
import { AdminTable } from '@/components/admin/AdminTable';
import { FilterTabs } from '@/components/admin/FilterTabs';
import { Avatar } from '@/components/admin/Avatar';
import { Seo } from '@/components/seo/Seo';
import { ActionMenu, Button, EmptyState, IconLink } from '@/components/ui';
import { Select } from '@/components/ui/form';
import { IconAdd, IconChevronLeft, IconChevronRight, IconSearch } from '@/components/ui/icons';
import {
  IconAssigned,
  IconCopy,
  IconDownload,
  IconFilter,
  IconInbox,
  IconPreview,
} from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_ORDER, PROFILE_LABELS, SOURCE_LABELS } from '@/content/labels';
import { NewRequestDialog } from '@/features/admin/requests/NewRequestDialog';
import {
  DEFAULT_FILTERS,
  filterRequests,
  readFilters,
  requestsToRows,
  writeFilters,
  type RequestFilters,
} from '@/features/admin/requests/request-filters';
import { StatusBadge } from '@/features/admin/requests/RequestParts';
import { requestTopic } from '@/features/admin/requests/request-topic';
import { useRequestActions } from '@/features/admin/requests/useRequestActions';
import { useSession } from '@/features/auth/auth-context';
import { useToast } from '@/features/toasts/toast-context';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useCurrentMinute } from '@/hooks/useNow';
import { downloadText, toCsv } from '@/lib/download';
import { formatDateTime, formatShortDate } from '@/lib/format';
import { can } from '@/lib/permissions';
import { toISODate } from '@/lib/dates';
import { pluralize } from '@/lib/text';
import type { ApplicantProfile, BookingSource, BookingStatus } from '@/types';

const PAGE_SIZE = 10;

/** Liste des demandes et réservations (cahier des charges § 8.3). */
export function Component() {
  const session = useSession();
  const now = useCurrentMinute();
  const navigate = useNavigate();
  const toast = useToast();
  const copy = useCopyToClipboard();
  const queryClient = useQueryClient();
  const canManage = can(session.role, 'requests:manage');
  const { data: bookings } = useSuspenseQuery(bookingsQuery());
  const { data: services } = useSuspenseQuery(servicesQuery(true));
  const { updateStatus, assign, actor } = useRequestActions();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const [query, setQuery] = useState(filters.query);
  const [syncedQuery, setSyncedQuery] = useState(filters.query);
  const [showMoreFilters, setShowMoreFilters] = useState(
    filters.source !== 'toutes' || filters.assignee !== 'tous',
  );
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [bulkStatus, setBulkStatus] = useState<BookingStatus>('en_cours');
  const [creating, setCreating] = useState(false);

  // La recherche lancée depuis la barre supérieure met à jour le champ.
  if (filters.query !== syncedQuery) {
    setSyncedQuery(filters.query);
    setQuery(filters.query);
  }

  const update = (changes: Partial<RequestFilters>, keepPage = false) => {
    const next = writeFilters({ ...filters, ...changes });
    if (keepPage && page > 1) next.set('page', String(page));
    setSearchParams(next, { replace: true });
    setSelected(new Set());
  };

  const context = { now, userId: session.userId, services };
  const filtered = filterRequests(bookings, filters, context);
  const visible =
    filters.status === 'toutes' ? filtered : filtered.filter((booking) => booking.status === filters.status);
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const allSelected = rows.length > 0 && rows.every((booking) => selected.has(booking.id));

  const tabs = [
    { value: 'toutes' as const, label: 'Toutes', count: filtered.length },
    ...BOOKING_STATUS_ORDER.map((status) => ({
      value: status,
      label: BOOKING_STATUS_LABELS[status],
      count: filtered.filter((booking) => booking.status === status).length,
    })),
  ];

  const goToPage = (next: number) => {
    const params = writeFilters(filters);
    if (next > 1) params.set('page', String(next));
    setSearchParams(params, { replace: true });
  };

  const exportCsv = (ids?: Set<string>) => {
    const list = ids ? visible.filter((booking) => ids.has(booking.id)) : visible;
    downloadText(
      `demandes-lasistant-${toISODate(new Date(now))}.csv`,
      `﻿${toCsv(requestsToRows(list, services))}`,
      'text/csv',
    );
    toast.success(`${pluralize(list.length, 'demande exportée', 'demandes exportées')}.`);
  };

  const bulkUpdate = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: BookingStatus }) => {
      for (const id of ids) await bookingsRepository.updateStatus(id, status, session.name);
      return ids.length;
    },
    onSuccess: (count, { status }) => {
      toast.success(`${pluralize(count, 'demande')} : ${BOOKING_STATUS_LABELS[status]}.`);
      setSelected(new Set());
      return queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <AdminPage>
      <Seo title="Demandes" description="Demandes et réservations reçues via le site." noIndex />
      <AdminPageHeader
        title="Demandes & réservations"
        description="Recherchez, filtrez et traitez les demandes reçues via le site."
        actions={
          <>
            <Button
              variant="outline"
              shape="rounded"
              icon={<IconDownload />}
              onClick={() => exportCsv()}
              disabled={visible.length === 0}
            >
              Exporter (CSV)
            </Button>
            {canManage ? (
              <Button shape="rounded" icon={<IconAdd />} onClick={() => setCreating(true)}>
                Saisir une demande
              </Button>
            ) : null}
          </>
        }
      />

      <Panel labelledBy="liste-demandes">
        <h2 id="liste-demandes" className="sr-only">
          Liste des demandes
        </h2>
        <FilterTabs
          label="Filtrer par statut"
          tabs={tabs}
          value={filters.status}
          onChange={(status) => update({ status })}
        />

        <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-4 py-3.5">
          <form
            role="search"
            className="w-full max-w-[320px]"
            onSubmit={(event) => {
              event.preventDefault();
              update({ query: query.trim() });
            }}
          >
            <label className="flex h-[38px] items-center gap-2.5 rounded-[10px] bg-cloud px-3.5 text-muted focus-within:bg-white focus-within:shadow-focus focus-within:ring-1 focus-within:ring-brand">
              <IconSearch className="size-4 shrink-0" aria-hidden />
              <span className="sr-only">Rechercher une demande</span>
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSyncedQuery(event.target.value.trim());
                  update({ query: event.target.value.trim() });
                }}
                placeholder="Nom, e-mail, n° de demande…"
                className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-placeholder md:text-sm"
              />
            </label>
          </form>
          <FilterSelect
            label="Filtrer par service"
            value={filters.serviceId}
            onChange={(serviceId) => update({ serviceId })}
          >
            <option value="tous">Tous les services</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Filtrer par profil"
            value={filters.profile}
            onChange={(profile) => update({ profile: profile as ApplicantProfile | 'tous' })}
          >
            <option value="tous">Tous les profils</option>
            {(Object.keys(PROFILE_LABELS) as ApplicantProfile[]).map((profile) => (
              <option key={profile} value={profile}>
                {PROFILE_LABELS[profile]}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Période"
            value={filters.period}
            onChange={(period) => update({ period: period as RequestFilters['period'] })}
          >
            <option value="tout">Toutes les dates</option>
            <option value="30">30 derniers jours</option>
            <option value="7">7 derniers jours</option>
            <option value="mois">Ce mois-ci</option>
          </FilterSelect>
          <Button
            variant="outline"
            shape="rounded"
            size="sm"
            className="ml-auto"
            icon={<IconFilter />}
            aria-expanded={showMoreFilters}
            onClick={() => setShowMoreFilters((value) => !value)}
          >
            {showMoreFilters ? 'Moins de filtres' : 'Plus de filtres'}
          </Button>
          {showMoreFilters ? (
            <div className="flex w-full flex-wrap items-center gap-2.5">
              <FilterSelect
                label="Origine de la demande"
                value={filters.source}
                onChange={(source) => update({ source: source as BookingSource | 'toutes' })}
              >
                <option value="toutes">Toutes les origines</option>
                {(Object.keys(SOURCE_LABELS) as BookingSource[]).map((source) => (
                  <option key={source} value={source}>
                    {SOURCE_LABELS[source]}
                  </option>
                ))}
              </FilterSelect>
              <FilterSelect
                label="Assignation"
                value={filters.assignee}
                onChange={(assignee) => update({ assignee: assignee as RequestFilters['assignee'] })}
              >
                <option value="tous">Toutes les assignations</option>
                <option value="moi">Assignées à moi</option>
                <option value="aucun">Non assignées</option>
              </FilterSelect>
              <button
                type="button"
                className="text-[13.5px] font-semibold text-brand hover:underline"
                onClick={() => {
                  setQuery('');
                  setSearchParams(writeFilters(DEFAULT_FILTERS), { replace: true });
                }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : null}
        </div>

        {canManage && selected.size > 0 ? (
          <div
            role="region"
            aria-label="Actions sur la sélection"
            className="flex flex-wrap items-center gap-2.5 border-b border-line bg-brand-wash px-4 py-3"
          >
            <strong className="text-sm font-semibold">
              {pluralize(selected.size, 'demande sélectionnée', 'demandes sélectionnées')}
            </strong>
            <FilterSelect
              label="Nouveau statut"
              value={bulkStatus}
              onChange={(status) => setBulkStatus(status as BookingStatus)}
            >
              {BOOKING_STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {BOOKING_STATUS_LABELS[status]}
                </option>
              ))}
            </FilterSelect>
            <Button
              size="sm"
              shape="rounded"
              loading={bulkUpdate.isPending}
              onClick={() => bulkUpdate.mutate({ ids: [...selected], status: bulkStatus })}
            >
              Appliquer
            </Button>
            <Button
              size="sm"
              shape="rounded"
              variant="outline"
              icon={<IconDownload />}
              onClick={() => exportCsv(selected)}
            >
              Exporter la sélection
            </Button>
            <button
              type="button"
              className="ml-auto text-[13.5px] font-semibold text-brand hover:underline"
              onClick={() => setSelected(new Set())}
            >
              Tout désélectionner
            </button>
          </div>
        ) : null}

        {rows.length === 0 ? (
          <EmptyState
            icon={<IconInbox />}
            tone="brand"
            title={
              bookings.length === 0
                ? 'Aucune demande pour le moment'
                : 'Aucune demande ne correspond à ces filtres'
            }
            description={
              bookings.length === 0
                ? 'Les demandes envoyées depuis le site apparaîtront ici.'
                : 'Essayez un autre statut ou élargissez la période.'
            }
          />
        ) : (
          <AdminTable minWidth={980} caption="Demandes et réservations">
            <thead>
              <tr>
                <th scope="col" className="w-10">
                  {canManage ? (
                    <input
                      type="checkbox"
                      aria-label="Sélectionner toutes les demandes de la page"
                      checked={allSelected}
                      onChange={() =>
                        setSelected((current) => {
                          const next = new Set(current);
                          for (const booking of rows) {
                            if (allSelected) next.delete(booking.id);
                            else next.add(booking.id);
                          }
                          return next;
                        })
                      }
                      className="size-4 accent-brand"
                    />
                  ) : (
                    <span className="sr-only">Sélection</span>
                  )}
                </th>
                <th scope="col">Référence</th>
                <th scope="col">Demandeur</th>
                <th scope="col">Service</th>
                <th scope="col">Profil</th>
                <th scope="col">Date souhaitée</th>
                <th scope="col">Reçue le</th>
                <th scope="col">Statut</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((booking) => (
                <tr key={booking.id} className={selected.has(booking.id) ? 'bg-brand-wash' : undefined}>
                  <td>
                    {canManage ? (
                      <input
                        type="checkbox"
                        aria-label={`Sélectionner ${booking.reference}`}
                        checked={selected.has(booking.id)}
                        onChange={() => toggle(booking.id)}
                        className="size-4 accent-brand"
                      />
                    ) : null}
                  </td>
                  <td className="font-mono text-[12.5px] tracking-[0.02em] whitespace-nowrap text-ink-soft">
                    {booking.reference}
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={booking.fullName} />
                      <div className="min-w-0">
                        <strong className="block font-semibold">{booking.fullName}</strong>
                        <span className="text-[12.5px] text-muted">
                          {booking.email}
                          {booking.country ? ` · ${booking.country}` : ''}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{requestTopic(booking, services)}</td>
                  <td>{booking.profile ? PROFILE_LABELS[booking.profile] : '—'}</td>
                  <td className="whitespace-nowrap">
                    {booking.requestedDate
                      ? `${formatShortDate(booking.requestedDate).replace(/ \d{4}$/, '')} · ${booking.requestedTime}`
                      : '—'}
                  </td>
                  <td className="whitespace-nowrap text-muted">{formatDateTime(booking.createdAt)}</td>
                  <td>
                    <StatusBadge status={booking.status} />
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-0.5">
                      <IconLink
                        to={ROUTES.admin.request(booking.id)}
                        label={`Ouvrir ${booking.reference}`}
                        variant="ghost"
                        size="sm"
                      >
                        <IconPreview aria-hidden />
                      </IconLink>
                      <ActionMenu
                        label={`Plus d’actions pour ${booking.reference}`}
                        items={[
                          {
                            id: 'ouvrir',
                            label: 'Ouvrir la demande',
                            icon: <IconPreview />,
                            onSelect: () => navigate(ROUTES.admin.request(booking.id)),
                          },
                          ...(canManage
                            ? [
                                {
                                  id: 'en-cours',
                                  label: 'Passer en cours',
                                  icon: <IconChevronRight />,
                                  disabled: booking.status === 'en_cours',
                                  onSelect: () => updateStatus.mutate({ id: booking.id, status: 'en_cours' }),
                                },
                                {
                                  id: 'assigner',
                                  label: 'M’assigner la demande',
                                  icon: <IconAssigned />,
                                  disabled: booking.assigneeId === actor.id,
                                  onSelect: () => assign.mutate({ id: booking.id, assignee: actor }),
                                },
                              ]
                            : []),
                          {
                            id: 'copier',
                            label: 'Copier l’adresse e-mail',
                            icon: <IconCopy />,
                            onSelect: () =>
                              void copy(booking.email).then((ok) =>
                                ok
                                  ? toast.success('Adresse e-mail copiée.')
                                  : toast.error('Impossible de copier l’adresse.'),
                              ),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        )}

        <PanelFooter>
          <span>
            {pluralize(rows.length, 'demande affichée', 'demandes affichées')} sur {visible.length}
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              shape="rounded"
              size="sm"
              icon={<IconChevronLeft />}
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              shape="rounded"
              size="sm"
              trailingIcon={<IconChevronRight />}
              disabled={currentPage >= pageCount}
              onClick={() => goToPage(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </PanelFooter>
      </Panel>

      {canManage ? (
        <NewRequestDialog
          open={creating}
          onClose={() => setCreating(false)}
          onCreated={(id) => navigate(ROUTES.admin.request(id))}
        />
      ) : null}
    </AdminPage>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

function FilterSelect({ label, value, onChange, children }: FilterSelectProps) {
  return (
    // Le menu prend la largeur de sa plus longue option, sans jamais dépasser de l'écran.
    <div className="max-w-full min-w-0">
      <Select
        aria-label={label}
        density="compact"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[38px] w-auto max-w-full text-base md:text-sm"
      >
        {children}
      </Select>
    </div>
  );
}
