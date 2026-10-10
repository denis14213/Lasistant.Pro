import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import { servicesQuery, takenSlotsQuery } from '@/api';
import { Button, TextAnchor } from '@/components/ui';
import { IconArrowLeft, IconArrowRight, IconCheck, IconError, IconPhone } from '@/components/ui/icons';
import { confirmationPath, ROUTES } from '@/config/routes';
import { CONTACT_PREFERENCE_LABELS, PROFILE_LABELS } from '@/content/labels';
import { PAGE_DEFAULTS } from '@/content/pages';
import { usePageContent } from '@/features/content/usePageContent';
import { OfflineSubmitHint } from '@/features/requests/FormParts';
import { createRequestInput, joinPhone, optionalText } from '@/features/requests/request-input';
import { SubmissionError } from '@/features/requests/SubmissionFeedback';
import { useRequestSubmission } from '@/features/requests/useRequestSubmission';
import { primaryPhone, useSiteSettings } from '@/features/settings/useSiteSettings';
import { useFormDraft } from '@/hooks/useFormDraft';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { formatDayDate, formatDuration, formatLongDate, phoneHref } from '@/lib/format';
import { pluralize } from '@/lib/text';
import { BOOKING_STEP_FIELDS, bookingSchema, type BookingFormValues } from '@/lib/validation/public-forms';
import { isSlotAvailable, type AvailabilityContext } from './availability';
import { BOOKING_DEFAULT_VALUES, type BookingFormInput } from './booking-form';
import { readBookingPrefill } from './booking-params';
import { BookingStepper } from './BookingStepper';
import { BookingSummary } from './BookingSummary';
import { ContactStep } from './steps/ContactStep';
import { DetailsStep } from './steps/DetailsStep';
import { ReviewStep, type ReviewRow } from './steps/ReviewStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { ServiceStep } from './steps/ServiceStep';

/** Étapes de la réservation : leur ordre est fixé par le code, leurs textes par la page « Réservation ». */
const STEP_IDS = ['service', 'schedule', 'contact', 'details', 'review'] as const;
const LAST_STEP = STEP_IDS.length - 1;
const STEP_INDEX = { service: 0, schedule: 1, contact: 2, details: 3, review: 4 } as const;
const DEFAULT_STEPS = PAGE_DEFAULTS.reservation.steps;

/** Heure de référence, lue une seule fois à l'ouverture de la réservation. */
const readCurrentTime = () => Date.now();

/**
 * Réservation en ligne en cinq étapes (cahier des charges § 6.7) :
 * chaque étape est validée avant de passer à la suivante, la saisie est conservée
 * sur l'appareil et le créneau est revérifié au moment de l'envoi.
 */
export function BookingWizard() {
  const settings = useSiteSettings();
  const content = usePageContent('reservation');
  const STEPS = STEP_IDS.map(
    (id, index) => content.steps.find((step) => step.id === id) ?? DEFAULT_STEPS[index] ?? DEFAULT_STEPS[0],
  );
  const { data: services } = useSuspenseQuery(servicesQuery());
  const { data: taken } = useSuspenseQuery(takenSlotsQuery());
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const submission = useRequestSubmission('reservation');
  const phone = primaryPhone(settings);

  const [now] = useState(readCurrentTime);
  const [stepIndex, setStepIndex] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [showStepErrors, setShowStepErrors] = useState(false);
  // Incrémenté à chaque tentative invalide : le message d'erreur reçoit alors le focus.
  const [errorFocusRequest, setErrorFocusRequest] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const moveFocusToHeading = useRef(false);
  // Pièce jointe éventuelle : le fichier n'est pas conservé dans le brouillon du formulaire.
  const attachment = useRef<File | null>(null);

  const form = useForm<BookingFormInput, unknown, BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: BOOKING_DEFAULT_VALUES,
    mode: 'onTouched',
  });
  const { handleSubmit, trigger, setValue, setError, control, formState } = form;
  const { clearDraft } = useFormDraft('reservation', form, {
    exclude: ['consent', 'website', 'attachmentName'],
  });
  const values = useWatch({ control });

  const bookableServices = useMemo(
    () => services.filter((service) => service.kind === 'page' || service.kind === 'reservation'),
    [services],
  );
  const availability = useMemo<AvailabilityContext>(
    () => ({ availability: settings.booking, taken, now }),
    [settings.booking, taken, now],
  );

  // Pré-remplissage depuis l'adresse (accueil, pages de service) : appliqué après le brouillon.
  useEffect(() => {
    const prefill = readBookingPrefill(searchParams);
    if (prefill.serviceId && bookableServices.some((service) => service.id === prefill.serviceId)) {
      setValue('serviceId', prefill.serviceId, { shouldDirty: true });
    }
    if (prefill.profile) setValue('profile', prefill.profile, { shouldDirty: true });
    if (prefill.arrivalDate) setValue('arrivalDate', prefill.arrivalDate, { shouldDirty: true });
  }, [searchParams, bookableServices, setValue]);

  // À chaque changement d'étape, le titre reçoit le focus (lecteurs d'écran, clavier).
  useEffect(() => {
    if (!moveFocusToHeading.current) return;
    moveFocusToHeading.current = false;
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [stepIndex]);

  // Le message d'erreur n'existe qu'après le rendu : le focus lui est donné ensuite.
  useEffect(() => {
    if (errorFocusRequest > 0) errorRef.current?.focus();
  }, [errorFocusRequest]);

  const goTo = (index: number) => {
    moveFocusToHeading.current = true;
    setShowStepErrors(false);
    setStepIndex(index);
    setFurthestStep((furthest) => Math.max(furthest, index));
  };

  const currentStep = STEPS[stepIndex] ?? DEFAULT_STEPS[0];
  const stepFields = BOOKING_STEP_FIELDS[currentStep.id];
  const stepErrorCount = stepFields.filter((field) => formState.errors[field]).length;

  const goNext = async () => {
    const valid = await trigger([...stepFields]);
    if (!valid) {
      setShowStepErrors(true);
      setErrorFocusRequest((count) => count + 1);
      return;
    }
    goTo(stepIndex + 1);
  };

  /** Envoi de la demande (formulaire valide). */
  const sendRequest = (data: BookingFormValues) => {
    // Le créneau a pu être réservé entre-temps : il est revérifié avant l'envoi.
    if (!isSlotAvailable(data.date, data.time, availability)) {
      setError('time', { message: 'Ce créneau n’est plus disponible. Choisissez-en un autre.' });
      goTo(STEP_INDEX.schedule);
      return;
    }
    const input = createRequestInput('reservation', {
      fullName: data.fullName,
      email: data.email,
      phone: joinPhone(data.phoneCountry, data.phoneNumber),
      serviceId: data.serviceId,
      country: optionalText(data.country),
      profile: data.profile,
      requestedDate: data.date,
      requestedTime: data.time,
      contactPreference: data.contactPreference,
      arrivalDate: optionalText(data.arrivalDate),
      stayDuration: optionalText(data.stayDuration),
      message: optionalText(data.message),
      attachmentName: optionalText(data.attachmentName),
    });
    submission.mutate(
      { input, honeypot: data.website, attachment: data.attachmentName ? attachment.current : null },
      {
        onSuccess: (booking) => {
          clearDraft();
          navigate(booking ? confirmationPath(booking) : ROUTES.bookingConfirmation);
        },
      },
    );
  };
  // Le gestionnaire est créé au moment de l'événement, jamais pendant le rendu.
  const submit = (event?: FormEvent<HTMLFormElement>) => handleSubmit(sendRequest)(event);

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    // La touche Entrée fait avancer d'une étape ; seul le dernier écran envoie la demande.
    if (stepIndex < LAST_STEP) {
      event.preventDefault();
      void goNext();
      return;
    }
    void submit(event);
  };

  /* --------------------------------------------------------- Récapitulatifs */

  const service = bookableServices.find((item) => item.id === values.serviceId);
  const duration = formatDuration(settings.booking.durationMinutes);
  const contactPreference = values.contactPreference
    ? CONTACT_PREFERENCE_LABELS[values.contactPreference]
    : '—';

  const summaryRows = [
    { label: 'Service', value: service?.title ?? '—' },
    { label: 'Durée', value: duration },
    { label: 'Date', value: values.date ? formatDayDate(values.date) : '—' },
    { label: 'Heure', value: values.time || '—' },
    { label: 'Contact', value: contactPreference },
  ];

  const reviewRows: ReviewRow[] = [
    { label: 'Service', value: service?.title ?? '—', stepIndex: STEP_INDEX.service },
    {
      label: 'Date & heure',
      value:
        values.date && values.time ? `${formatLongDate(values.date)} · ${values.time} (${duration})` : '—',
      stepIndex: STEP_INDEX.schedule,
    },
    { label: 'Contact préféré', value: contactPreference, stepIndex: STEP_INDEX.schedule },
    {
      label: 'Coordonnées',
      value: [
        values.fullName,
        values.phoneNumber && `${values.phoneCountry ?? ''} ${values.phoneNumber}`,
        values.email,
      ]
        .filter(Boolean)
        .join(' · '),
      stepIndex: STEP_INDEX.contact,
    },
    {
      label: 'Profil',
      value: values.profile ? PROFILE_LABELS[values.profile] : '—',
      stepIndex: STEP_INDEX.contact,
    },
  ];
  const details = [
    values.arrivalDate ? `Arrivée le ${formatLongDate(values.arrivalDate)}` : null,
    values.stayDuration,
    values.attachmentName ? `Document : ${values.attachmentName}` : null,
  ].filter(Boolean);
  if (details.length > 0 || values.message) {
    reviewRows.push({
      label: 'Informations complémentaires',
      value: [...details, values.message ? `« ${values.message.trim()} »` : null].filter(Boolean).join(' · '),
      stepIndex: STEP_INDEX.details,
    });
  }

  return (
    <FormProvider {...form}>
      <div className="grid grid-cols-1 items-start gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="lg:col-span-2">
          <BookingStepper steps={STEPS} current={stepIndex} furthest={furthestStep} onSelect={goTo} />
        </div>

        <section
          aria-labelledby="etape-titre"
          className="flex min-w-0 scroll-mt-28 flex-col gap-7 rounded-[20px] border border-line bg-white px-5 py-6 md:rounded-card md:p-10"
        >
          <div className="flex flex-col gap-3">
            <div className="flex justify-between gap-4 text-[13px]">
              <span className="font-semibold tracking-[0.08em] text-muted uppercase">
                Étape {stepIndex + 1} sur {STEPS.length}
              </span>
              <span className="text-muted">
                Champs obligatoires{' '}
                <span className="text-brand" aria-hidden>
                  *
                </span>
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Progression de la réservation"
              aria-valuemin={0}
              aria-valuemax={STEPS.length}
              aria-valuenow={stepIndex + 1}
              className="h-1.5 overflow-hidden rounded-md bg-line"
            >
              <span
                className="block h-full rounded-md bg-linear-to-r from-brand to-brand-bright transition-[width] duration-400"
                style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          <form noValidate onSubmit={onFormSubmit} className="flex flex-col gap-7">
            <div className="flex flex-col gap-3">
              <h2
                id="etape-titre"
                ref={headingRef}
                tabIndex={-1}
                className="text-[25px] leading-[1.1] font-semibold tracking-[-0.028em] outline-none md:text-[30px]"
              >
                {currentStep.title}
              </h2>
              <p className="text-muted">{currentStep.lead}</p>
            </div>

            <div ref={errorRef} tabIndex={-1} className="outline-none empty:hidden">
              {showStepErrors && stepErrorCount > 0 ? (
                <div
                  role="alert"
                  className="flex items-center gap-3 rounded-box border border-danger-line bg-danger-soft px-5 py-4 font-medium text-danger-dark"
                >
                  <IconError className="size-4.5 shrink-0" aria-hidden />
                  Merci de corriger {pluralize(stepErrorCount, 'champ signalé', 'champs signalés')} pour
                  continuer.
                </div>
              ) : null}
            </div>

            {currentStep.id === 'service' ? (
              <ServiceStep services={bookableServices} durationMinutes={settings.booking.durationMinutes} />
            ) : null}
            {currentStep.id === 'schedule' ? (
              <ScheduleStep availability={availability} whatsappEnabled={settings.whatsapp.enabled} />
            ) : null}
            {currentStep.id === 'contact' ? <ContactStep /> : null}
            {currentStep.id === 'details' ? (
              <DetailsStep onAttachmentChange={(file) => (attachment.current = file)} />
            ) : null}
            {currentStep.id === 'review' ? <ReviewStep rows={reviewRows} onEdit={goTo} /> : null}

            {submission.isError ? (
              <SubmissionError error={submission.error} onRetry={() => void submit()} />
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
              {stepIndex > 0 ? (
                <Button variant="outline" icon={<IconArrowLeft />} onClick={() => goTo(stepIndex - 1)}>
                  Retour
                </Button>
              ) : phone ? (
                <TextAnchor href={phoneHref(phone)} icon={<IconPhone />}>
                  Préférez-vous nous appeler ?
                </TextAnchor>
              ) : (
                <span />
              )}
              {stepIndex < LAST_STEP ? (
                <Button type="submit" trailingIcon={<IconArrowRight />}>
                  Continuer
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="lg"
                  disabled={!online}
                  loading={submission.isPending}
                  loadingLabel="Envoi en cours…"
                  trailingIcon={<IconCheck />}
                >
                  Confirmer ma demande
                </Button>
              )}
            </div>
            {stepIndex === LAST_STEP && !online ? <OfflineSubmitHint /> : null}
          </form>
        </section>

        <BookingSummary rows={summaryRows} />
      </div>
    </FormProvider>
  );
}
