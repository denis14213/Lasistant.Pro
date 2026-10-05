import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { bookingsQuery, servicesQuery, settingsQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import {
  AdminPage,
  AdminPageHeader,
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
} from '@/components/admin/AdminPage';
import { Seo } from '@/components/seo/Seo';
import { Button, Dialog, IconButton } from '@/components/ui';
import { ChoiceGroup, Field, Input } from '@/components/ui/form';
import { IconAdd, IconChevronLeft, IconChevronRight } from '@/components/ui/icons';
import { IconBlock } from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import { agendaHours, shiftAnchor, weekDays, type AgendaView } from '@/features/admin/agenda/agenda-utils';
import { MonthGridView, TimeGrid } from '@/features/admin/agenda/AgendaGrids';
import { AvailabilityForm } from '@/features/admin/agenda/AvailabilityForm';
import { NewRequestDialog } from '@/features/admin/requests/NewRequestDialog';
import { useSaveSettings } from '@/features/admin/settings/useSaveSettings';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useToday } from '@/hooks/useNow';
import { cn } from '@/lib/cn';
import { addDays, fromISODate, toISODate } from '@/lib/dates';
import { formatLongDate, formatShortDate } from '@/lib/format';

export const loader = () => prefetch(bookingsQuery(), settingsQuery(), servicesQuery(true));

const VIEW_OPTIONS = [
  { value: 'jour', label: 'Jour' },
  { value: 'semaine', label: 'Semaine' },
  { value: 'mois', label: 'Mois' },
] as const;

const monthTitle = (day: string) => {
  const label = fromISODate(day).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/** Agenda des rendez-vous et disponibilités de la réservation en ligne (cahier des charges § 8.4). */
export function Component() {
  const today = useToday();
  const navigate = useNavigate();
  const { data: bookings } = useSuspenseQuery(bookingsQuery());
  const { data: services } = useSuspenseQuery(servicesQuery(true));
  const { data: settings } = useSuspenseQuery(settingsQuery());
  const availability = settings.booking;
  const [searchParams, setSearchParams] = useSearchParams();
  // Sans choix explicite : la journée sur téléphone, la semaine ailleurs.
  const isPhone = useMediaQuery('(max-width: 767px)');
  const view =
    (['jour', 'semaine', 'mois'] as const).find((value) => value === searchParams.get('vue')) ??
    (isPhone ? 'jour' : 'semaine');
  const openDays = availability.openDays.length > 0 ? availability.openDays : [1, 2, 3, 4, 5];
  const requestedDate = searchParams.get('date');
  // Sans date demandée : la semaine en cours, ou la suivante si tous ses jours d'ouverture sont passés.
  const defaultAnchor = weekDays(today, openDays).some((day) => day >= today)
    ? today
    : toISODate(addDays(fromISODate(today), 1));
  const anchor = requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ? requestedDate : defaultAnchor;
  const [creating, setCreating] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [blockedDay, setBlockedDay] = useState('');
  const saveClosure = useSaveSettings('Journée bloquée : aucun créneau ne sera proposé ce jour-là.');

  const navigateTo = (next: { view?: AgendaView; anchor?: string }) => {
    const params = new URLSearchParams();
    params.set('vue', next.view ?? view);
    params.set('date', next.anchor ?? anchor);
    setSearchParams(params, { replace: true });
  };

  const days = view === 'jour' ? [anchor] : weekDays(anchor, openDays);
  const hours = agendaHours(availability.ranges);
  const title =
    view === 'mois'
      ? monthTitle(anchor)
      : view === 'jour'
        ? formatLongDate(anchor)
        : days.length > 0
          ? `${formatShortDate(days[0] ?? anchor).replace(/ \d{4}$/, '')} – ${formatShortDate(days.at(-1) ?? anchor)}`
          : formatShortDate(anchor);

  return (
    <AdminPage>
      <Seo title="Agenda" description="Rendez-vous et disponibilités." noIndex />
      <AdminPageHeader
        title="Agenda & disponibilités"
        description="Rendez-vous confirmés, demandes à confirmer et créneaux proposés sur le site."
        actions={
          <>
            <Button variant="outline" shape="rounded" icon={<IconBlock />} onClick={() => setBlocking(true)}>
              Bloquer une journée
            </Button>
            <Button shape="rounded" icon={<IconAdd />} onClick={() => setCreating(true)}>
              Ajouter un rendez-vous
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel labelledBy="periode-agenda">
          <PanelHeader
            titleId="periode-agenda"
            title={
              <span className="flex items-center gap-2">
                <IconButton
                  label="Période précédente"
                  size="sm"
                  onClick={() => navigateTo({ anchor: shiftAnchor(anchor, view, -1) })}
                >
                  <IconChevronLeft aria-hidden />
                </IconButton>
                <IconButton
                  label="Période suivante"
                  size="sm"
                  onClick={() => navigateTo({ anchor: shiftAnchor(anchor, view, 1) })}
                >
                  <IconChevronRight aria-hidden />
                </IconButton>
                <span className="ml-1.5 first-letter:uppercase" aria-live="polite">
                  {title}
                </span>
              </span>
            }
            action={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  shape="rounded"
                  onClick={() => navigateTo({ anchor: defaultAnchor })}
                >
                  Aujourd’hui
                </Button>
                <ChoiceGroup
                  name="vue-agenda"
                  size="sm"
                  options={VIEW_OPTIONS}
                  value={view}
                  onChange={(value) => navigateTo({ view: value })}
                />
              </div>
            }
          />
          {view === 'mois' ? (
            <MonthGridView
              anchor={anchor}
              bookings={bookings}
              services={services}
              availability={availability}
              today={today}
            />
          ) : (
            <TimeGrid
              days={days}
              hours={hours}
              bookings={bookings}
              services={services}
              availability={availability}
              today={today}
            />
          )}
          <PanelFooter>
            <div className="flex flex-wrap items-center gap-4">
              <LegendItem className="border-success-line bg-success-soft" label="Confirmé" />
              <LegendItem className="border-warning-line bg-warning-soft" label="À confirmer" />
              <LegendItem className="hatch-muted border-line-strong" label="Hors disponibilités" />
            </div>
            <span>Heure de Tunisie (UTC+1)</span>
          </PanelFooter>
        </Panel>

        <Panel labelledBy="disponibilites">
          <PanelHeader titleId="disponibilites" title="Disponibilités en ligne" />
          <PanelBody>
            <AvailabilityForm key={settings.updatedAt} availability={availability} />
          </PanelBody>
        </Panel>
      </div>

      <NewRequestDialog
        appointment
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(id) => navigate(ROUTES.admin.request(id))}
      />

      <Dialog
        open={blocking}
        onClose={() => setBlocking(false)}
        size="sm"
        title="Bloquer une journée"
        description="Aucun créneau ne sera proposé ce jour-là dans la réservation en ligne. Les rendez-vous déjà pris ne sont pas modifiés."
        footer={
          <>
            <Button variant="outline" shape="rounded" onClick={() => setBlocking(false)}>
              Annuler
            </Button>
            <Button
              shape="rounded"
              disabled={!blockedDay || availability.closures.includes(blockedDay)}
              loading={saveClosure.isPending}
              onClick={() =>
                saveClosure.mutate(
                  { booking: { ...availability, closures: [...availability.closures, blockedDay].sort() } },
                  {
                    onSuccess: () => {
                      setBlocking(false);
                      setBlockedDay('');
                    },
                  },
                )
              }
            >
              Bloquer la journée
            </Button>
          </>
        }
      >
        <Field label="Date" id="journee-bloquee" density="compact">
          <Input
            type="date"
            density="compact"
            min={today}
            value={blockedDay}
            onChange={(event) => setBlockedDay(event.target.value)}
          />
        </Field>
      </Dialog>
    </AdminPage>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('inline-block size-3 rounded border', className)} aria-hidden />
      {label}
    </span>
  );
}
