import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useSearchParams, type LoaderFunctionArgs } from 'react-router';
import { bookingConfirmationQuery, categoriesQuery, publishedArticlesQuery, servicesQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import { Seo } from '@/components/seo/Seo';
import {
  AccentTitle,
  Button,
  ButtonLink,
  Callout,
  Card,
  Container,
  Eyebrow,
  IconButton,
  Lead,
  Section,
  SectionHeader,
  TextLink,
} from '@/components/ui';
import { IconArrowLeft, IconCalendarAdd, IconCheck, IconConversation, IconDocument, IconPrint } from '@/components/ui/icons';
import { CONFIRMATION_PARAMS, ROUTES } from '@/config/routes';
import { CONTACT_PREFERENCE_LABELS, HOUSING_TYPE_LABELS, SOURCE_LABELS } from '@/content/labels';
import { ArticleCard } from '@/features/articles/ArticleCard';
import { useCategoryLookup } from '@/features/articles/useCategoryLookup';
import { usePageContent } from '@/features/content/usePageContent';
import { primaryEmail, primaryPhone, useSiteSettings } from '@/features/settings/useSiteSettings';
import { cn } from '@/lib/cn';
import { buildIcsEvent, downloadText } from '@/lib/download';
import { formatDuration, formatLongDate, phoneHref } from '@/lib/format';
import type { BookingConfirmation, Service } from '@/types';

/** Référence et clé secrète de la demande, lues dans l'adresse de la page. */
function confirmationParams(params: URLSearchParams) {
  const reference = params.get(CONFIRMATION_PARAMS.reference);
  const key = params.get(CONFIRMATION_PARAMS.key);
  return reference && key ? { reference, key } : null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const demande = confirmationParams(new URL(request.url).searchParams);
  await prefetch(
    servicesQuery(),
    publishedArticlesQuery(),
    categoriesQuery(true),
    ...(demande ? [bookingConfirmationQuery(demande.reference, demande.key)] : []),
  );
  return null;
}

/** Lignes du récapitulatif selon le type de demande. */
function recapRows(booking: BookingConfirmation, service: Service | undefined, durationMinutes: number) {
  if (booking.source === 'logement' && booking.housing) {
    const { housing } = booking;
    return [
      { label: 'Demande', value: SOURCE_LABELS[booking.source] },
      { label: 'Zone souhaitée', value: housing.zone },
      { label: 'Arrivée', value: formatLongDate(housing.arrivalDate) },
      {
        label: 'Logement',
        value: `${HOUSING_TYPE_LABELS[housing.housingType]} · ${housing.persons} personne${housing.persons > 1 ? 's' : ''}`,
      },
    ];
  }
  return [
    { label: 'Service', value: service?.title ?? SOURCE_LABELS[booking.source] },
    {
      label: 'Date souhaitée',
      value:
        booking.requestedDate && booking.requestedTime
          ? `${formatLongDate(booking.requestedDate)} · ${booking.requestedTime}`
          : 'À convenir avec notre équipe',
    },
    { label: 'Durée', value: `${formatDuration(durationMinutes)} · heure de Tunisie (UTC+1)` },
    {
      label: 'Contact préféré',
      value: booking.contactPreference ? `Par ${CONTACT_PREFERENCE_LABELS[booking.contactPreference].toLowerCase()}` : '—',
    },
  ];
}

/** Confirmation d'envoi d'une demande (réservation ou recherche de logement). */
export function Component() {
  const content = usePageContent('confirmation');
  const [searchParams] = useSearchParams();
  const demande = confirmationParams(searchParams);
  const settings = useSiteSettings();
  const phone = primaryPhone(settings);
  const email = primaryEmail(settings);
  const { data: services } = useSuspenseQuery(servicesQuery());
  const { data: articles } = useSuspenseQuery(publishedArticlesQuery());
  const categoryOf = useCategoryLookup();
  const { data: booking } = useQuery({
    ...bookingConfirmationQuery(demande?.reference ?? '', demande?.key ?? ''),
    enabled: demande !== null,
  });

  const service = services.find((item) => item.id === booking?.serviceId);
  const rows = booking ? recapRows(booking, service, settings.booking.durationMinutes) : [];
  const canAddToCalendar = Boolean(booking?.requestedDate && booking.requestedTime);

  const addToCalendar = () => {
    if (!booking?.requestedDate || !booking.requestedTime) return;
    const ics = buildIcsEvent({
      uid: booking.reference,
      title: `Échange LASISTANT.PRO · ${service?.title ?? 'Rendez-vous'}`,
      description: `Demande ${booking.reference}. Créneau à confirmer par l’équipe LASISTANT.PRO.`,
      date: booking.requestedDate,
      time: booking.requestedTime,
      durationMinutes: settings.booking.durationMinutes,
    });
    downloadText(`rendez-vous-${booking.reference}.ics`, ics, 'text/calendar');
  };

  return (
    <>
      <Seo title={content.seo.title} description={content.seo.description} noIndex />
      <Section className="pt-14 md:pt-24" aria-labelledby="titre-page">
        <Container>
          <div className="mx-auto flex max-w-[760px] flex-col items-center gap-6.5 text-center">
            <span
              className="flex size-[88px] items-center justify-center rounded-full bg-success-soft text-success shadow-[0_0_0_12px_rgb(43_178_76/0.08)]"
              aria-hidden
            >
              <IconCheck className="size-10" />
            </span>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h1 id="titre-page" className="text-[clamp(2.25rem,4vw,3.625rem)] max-[359px]:text-[min(2.25rem,9.3vw)] leading-[1.03] font-semibold tracking-[-0.036em]">
              <AccentTitle value={content.title} />
            </h1>
            <Lead className="max-w-[620px]">{content.lead}</Lead>
            {booking ? (
              <p className="inline-flex items-center gap-3 rounded-full border border-line bg-white px-4.5 py-2.5 text-[15px]">
                <IconDocument className="size-4" aria-hidden />
                N° de demande <strong className="font-mono tracking-[0.04em]">{booking.reference}</strong>
              </p>
            ) : null}
          </div>

          {booking ? (
            <Card className="mx-auto mt-14 max-w-[880px] overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-5 md:px-7">
                <h2 className="text-[19px] leading-[1.3] font-semibold tracking-[-0.01em]">Récapitulatif de votre demande</h2>
                <div className="flex items-center gap-2 print:hidden">
                  {canAddToCalendar ? (
                    <Button variant="outline" size="sm" icon={<IconCalendarAdd />} onClick={addToCalendar}>
                      Ajouter à mon agenda
                    </Button>
                  ) : null}
                  <IconButton label="Imprimer le récapitulatif" onClick={() => window.print()}>
                    <IconPrint aria-hidden />
                  </IconButton>
                </div>
              </div>
              <dl className="grid grid-cols-1 md:grid-cols-2">
                {rows.map((row, index) => (
                  <div
                    key={row.label}
                    className={cn(
                      'border-b border-line px-5 py-5 last:border-b-0 md:px-7',
                      // Grille de deux colonnes : la dernière ligne n'a pas de filet inférieur.
                      index >= rows.length - 2 && 'md:border-b-0',
                      index % 2 === 0 && 'md:border-r',
                    )}
                  >
                    <dt className="text-[13px] font-semibold tracking-[0.1em] text-muted uppercase">{row.label}</dt>
                    <dd className="mt-1.5 text-[17px] font-semibold">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          ) : null}

          <div className="mx-auto mt-16 flex max-w-[880px] flex-col gap-7">
            <h2 className="text-h3 font-semibold">Et maintenant ?</h2>
            <ol className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {content.nextSteps.map((step, index) => (
                <li key={step.title} className="flex flex-col gap-4 rounded-card border border-line bg-paper p-6.5">
                  <span className="accent text-[44px] leading-none text-brand" aria-hidden>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-lg leading-[1.2] font-semibold tracking-[-0.02em]">{step.title}</h3>
                  <p className="text-[15.5px] text-muted">{step.text}</p>
                </li>
              ))}
            </ol>
            <Callout tone="privacy" icon={<IconConversation />} title="Une modification ou une question ?" className="md:items-center">
              <p>
                {phone ? (
                  <>
                    Appelez le{' '}
                    <a href={phoneHref(phone)} className="font-semibold text-ink">
                      {phone}
                    </a>
                  </>
                ) : null}
                {phone && email ? ' ou écrivez à ' : null}
                {email ? (
                  <a href={`mailto:${email}`} className="font-semibold break-all text-ink">
                    {email}
                  </a>
                ) : null}{' '}
                en indiquant votre numéro de demande.
              </p>
            </Callout>
            <div className="mt-2 flex flex-wrap justify-center gap-3 print:hidden">
              <ButtonLink to={ROUTES.home} variant="dark" icon={<IconArrowLeft />}>
                Retour à l’accueil
              </ButtonLink>
              <ButtonLink to={ROUTES.articles} variant="outline">
                Lire nos conseils pratiques
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      {articles.length > 0 ? (
        <Section tone="paper" bordered className="print:hidden" aria-labelledby="a-lire">
          <Container>
            <SectionHeader
              eyebrow={content.readMore.eyebrow}
              titleId="a-lire"
              title={content.readMore.title}
              titleClassName="text-[clamp(1.875rem,2.8vw,2.375rem)] max-[359px]:text-[min(1.875rem,9.3vw)]"
              aside={
                <TextLink to={ROUTES.articles} arrow>
                  Tout l’Espace infos
                </TextLink>
              }
            />
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {articles.slice(0, 3).map((article) => (
                <ArticleCard key={article.id} article={article} category={categoryOf(article.categoryId)} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
