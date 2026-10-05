import { useSuspenseQuery } from '@tanstack/react-query';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { servicesQuery } from '@/api';
import { Button } from '@/components/ui';
import { IconArrowRight } from '@/components/ui/icons';
import { PROFILE_LABELS } from '@/content/labels';
import { cn } from '@/lib/cn';
import { isoDateInDays } from '@/lib/dates';
import { buildBookingSearch, BOOKING_PROFILES } from './booking-params';

/**
 * Barre « Démarrer une demande » de l'accueil : trois choix rapides qui pré-remplissent
 * la réservation en ligne (service, profil, date d'arrivée souhaitée).
 */
export function QuickStartBar() {
  const { data: services } = useSuspenseQuery(servicesQuery());
  const navigate = useNavigate();
  const pages = services.filter((service) => service.kind === 'page');
  const [serviceId, setServiceId] = useState(pages[0]?.id ?? '');
  const [profile, setProfile] = useState<(typeof BOOKING_PROFILES)[number]>('patient');
  const [arrivalDate, setArrivalDate] = useState('');

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    navigate(buildBookingSearch({ serviceId, profile, arrivalDate }));
  };

  return (
    <form
      aria-label="Démarrer une demande"
      onSubmit={onSubmit}
      className="relative z-[3] mt-6 grid grid-cols-1 items-center rounded-[24px] border border-line bg-white p-2 shadow-raised md:grid-cols-3 md:rounded-[28px] xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:rounded-full"
    >
      <BarField label="Service" first>
        {(id) => (
          <select
            id={id}
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            className={CONTROL}
          >
            {pages.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
        )}
      </BarField>
      <BarField label="Vous êtes">
        {(id) => (
          <select
            id={id}
            value={profile}
            onChange={(event) => setProfile(event.target.value as (typeof BOOKING_PROFILES)[number])}
            className={CONTROL}
          >
            {BOOKING_PROFILES.map((value) => (
              <option key={value} value={value}>
                {PROFILE_LABELS[value]}
              </option>
            ))}
          </select>
        )}
      </BarField>
      <BarField label="Arrivée souhaitée">
        {(id) => (
          <input
            id={id}
            type="date"
            min={isoDateInDays(1)}
            value={arrivalDate}
            onChange={(event) => setArrivalDate(event.target.value)}
            className={CONTROL}
          />
        )}
      </BarField>
      <Button
        type="submit"
        trailingIcon={<IconArrowRight />}
        className="mt-1.5 min-h-14 w-full md:col-span-3 md:mt-2 xl:col-span-1 xl:mt-0 xl:ml-2 xl:min-h-[62px] xl:w-auto"
      >
        Commencer ma demande
      </Button>
    </form>
  );
}

const CONTROL =
  'w-full cursor-pointer appearance-none border-0 bg-transparent p-0 text-base text-muted outline-none focus-visible:outline-none md:text-[15.5px]';

function BarField({
  label,
  first = false,
  children,
}: {
  label: string;
  first?: boolean;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div
      className={cn(
        'relative flex min-w-0 flex-col justify-center gap-[3px] rounded-2xl px-4 py-3 transition-colors hover:bg-canvas md:rounded-full md:px-7 md:py-2.5',
        'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-[-3px] has-[:focus-visible]:outline-brand-bright has-[:focus-visible]:outline-solid',
        !first &&
          "before:absolute before:bg-line before:content-[''] max-md:before:inset-x-4 max-md:before:top-0 max-md:before:h-px md:before:top-[18px] md:before:bottom-[18px] md:before:left-0 md:before:w-px",
      )}
    >
      <label
        htmlFor={id}
        className="cursor-pointer text-[11.5px] font-bold tracking-[0.1em] text-ink uppercase"
      >
        {label}
      </label>
      {children(id)}
    </div>
  );
}
