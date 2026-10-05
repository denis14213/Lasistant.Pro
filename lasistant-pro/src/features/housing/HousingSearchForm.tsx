import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';
import type { z } from 'zod';
import { Button } from '@/components/ui';
import { ChoiceGroup, Counter, Field, FormErrorSummary, Input, Select, Textarea } from '@/components/ui/form';
import { IconArrowRight } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { BUDGET_PERIOD_LABELS, HOUSING_TYPE_LABELS } from '@/content/labels';
import {
  ConsentField,
  EmailSuggestion,
  FormSection,
  HoneypotField,
  OfflineSubmitHint,
  PhoneFields,
  SecureNote,
} from '@/features/requests/FormParts';
import { createRequestInput, joinPhone, optionalText } from '@/features/requests/request-input';
import { SubmissionError } from '@/features/requests/SubmissionFeedback';
import { useRequestSubmission } from '@/features/requests/useRequestSubmission';
import { useFormDraft } from '@/hooks/useFormDraft';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { isoDateInDays } from '@/lib/dates';
import { housingSearchSchema, type HousingSearchValues } from '@/lib/validation/public-forms';
import type { BudgetPeriod, HousingType } from '@/types';

type HousingSearchInput = z.input<typeof housingSearchSchema>;

const DEFAULT_VALUES: HousingSearchInput = {
  profile: 'patient',
  zone: '',
  arrivalDate: '',
  departureDate: '',
  housingType: 'indifferent',
  persons: 1,
  budgetAmount: '',
  budgetCurrency: 'TND',
  budgetPeriod: 'mois',
  needs: '',
  fullName: '',
  phoneCountry: '+216',
  phoneNumber: '',
  email: '',
  consent: false,
  website: '',
};

const PROFILE_OPTIONS = [
  { value: 'patient', label: 'Patient(e)' },
  { value: 'etudiant', label: 'Étudiant(e)' },
  { value: 'proche', label: 'Proche / parent' },
  { value: 'autre', label: 'Autre' },
] as const;

const FIELD_LABELS = {
  zone: 'Ville ou zone souhaitée',
  arrivalDate: 'Date d’arrivée',
  departureDate: 'Date de départ',
  persons: 'Nombre de personnes',
  budgetAmount: 'Budget maximum',
  needs: 'Besoins particuliers',
  fullName: 'Nom complet',
  phoneNumber: 'Téléphone',
  email: 'E-mail',
  consent: 'Consentement',
} as const;

/** Combinaisons devise / période proposées pour le budget. */
const BUDGET_OPTIONS = (['TND', 'EUR'] as const).flatMap((currency) =>
  (Object.keys(BUDGET_PERIOD_LABELS) as BudgetPeriod[]).map((period) => ({
    value: `${currency}:${period}`,
    label: `${currency} ${BUDGET_PERIOD_LABELS[period]}`,
  })),
);

/**
 * Formulaire de recherche de logement (cahier des charges § 6.4) :
 * critères du séjour puis coordonnées. La saisie est conservée sur l'appareil.
 */
export function HousingSearchForm({ titleId }: { titleId: string }) {
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const submission = useRequestSubmission('logement');

  const form = useForm<HousingSearchInput, unknown, HousingSearchValues>({
    resolver: zodResolver(housingSearchSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
  });
  const { register, handleSubmit, control, setValue, formState } = form;
  const { errors, submitCount } = formState;
  const [email, arrivalDate, budgetCurrency, budgetPeriod] = useWatch({
    control,
    name: ['email', 'arrivalDate', 'budgetCurrency', 'budgetPeriod'],
  });
  const { clearDraft } = useFormDraft('logement', form, { exclude: ['consent', 'website'] });

  const onSubmit = handleSubmit((values) => {
    const input = createRequestInput('logement', {
      fullName: values.fullName,
      email: values.email,
      phone: joinPhone(values.phoneCountry, values.phoneNumber),
      serviceId: 'logement-hebergement',
      profile: values.profile,
      arrivalDate: values.arrivalDate,
      housing: {
        zone: values.zone,
        arrivalDate: values.arrivalDate,
        departureDate: optionalText(values.departureDate),
        housingType: values.housingType,
        persons: values.persons,
        budgetAmount: values.budgetAmount === '' ? null : Number(values.budgetAmount),
        budgetCurrency: values.budgetCurrency,
        budgetPeriod: values.budgetPeriod,
        needs: optionalText(values.needs),
      },
    });
    submission.mutate(
      { input, honeypot: values.website },
      {
        onSuccess: (booking) => {
          clearDraft();
          navigate(
            `${ROUTES.bookingConfirmation}${booking ? `?ref=${encodeURIComponent(booking.reference)}` : ''}`,
          );
        },
      },
    );
  });

  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby={titleId} className="relative flex flex-col gap-5">
      <FormErrorSummary errors={errors} labels={FIELD_LABELS} submitCount={submitCount} />

      <FormSection number={1} title="Votre séjour">
        <Field label="Vous êtes" kind="group" required>
          <Controller
            control={control}
            name="profile"
            render={({ field }) => (
              <ChoiceGroup
                name={field.name}
                options={PROFILE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Field>
        <Field label="Ville ou zone souhaitée" id="zone" required error={errors.zone?.message}>
          <Input placeholder="Quartier, ville ou proximité recherchée" {...register('zone')} />
        </Field>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Date d’arrivée" id="arrivalDate" required error={errors.arrivalDate?.message}>
            <Input type="date" min={isoDateInDays(1)} {...register('arrivalDate')} />
          </Field>
          <Field
            label="Date de départ"
            id="departureDate"
            error={errors.departureDate?.message}
            hint="Ou précisez une durée dans vos besoins."
          >
            <Input type="date" min={arrivalDate || isoDateInDays(1)} {...register('departureDate')} />
          </Field>
          <Field label="Type de logement" id="housingType" required>
            <Select {...register('housingType')}>
              {(Object.keys(HOUSING_TYPE_LABELS) as HousingType[]).map((type) => (
                <option key={type} value={type}>
                  {HOUSING_TYPE_LABELS[type]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Nombre de personnes" kind="group" error={errors.persons?.message}>
            <Controller
              control={control}
              name="persons"
              render={({ field }) => (
                <Counter
                  value={field.value}
                  onChange={field.onChange}
                  min={1}
                  max={10}
                  decrementLabel="Retirer une personne"
                  incrementLabel="Ajouter une personne"
                />
              )}
            />
          </Field>
          <Field
            label="Budget maximum"
            id="budgetAmount"
            error={errors.budgetAmount?.message}
            className="md:col-span-2"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_150px] gap-2 md:grid-cols-[minmax(0,1fr)_180px]">
              <Input inputMode="numeric" placeholder="Montant" {...register('budgetAmount')} />
              <Select
                id="budgetPeriod"
                aria-label="Devise et période du budget"
                value={`${budgetCurrency}:${budgetPeriod}`}
                onChange={(event) => {
                  const [currency, period] = event.target.value.split(':') as [
                    HousingSearchInput['budgetCurrency'],
                    BudgetPeriod,
                  ];
                  setValue('budgetCurrency', currency, { shouldDirty: true });
                  setValue('budgetPeriod', period, { shouldDirty: true });
                }}
              >
                {BUDGET_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </Field>
          <Field
            label="Besoins particuliers"
            id="needs"
            optional
            error={errors.needs?.message}
            className="md:col-span-2"
          >
            <Textarea
              rows={3}
              placeholder="Accessibilité, ascenseur, proximité, équipements…"
              {...register('needs')}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection number={2} title="Vos coordonnées">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field
            label="Nom complet"
            id="fullName"
            required
            error={errors.fullName?.message}
            className="md:col-span-2"
          >
            <Input autoComplete="name" placeholder="Prénom et nom" {...register('fullName')} />
          </Field>
          <PhoneFields
            label="Téléphone avec indicatif"
            countryRegistration={register('phoneCountry')}
            numberRegistration={register('phoneNumber')}
            error={errors.phoneNumber?.message}
          />
          <Field label="E-mail" id="email" required error={errors.email?.message}>
            <Input type="email" autoComplete="email" placeholder="nom@exemple.com" {...register('email')} />
            <EmailSuggestion
              email={email}
              onApply={(value) => setValue('email', value, { shouldValidate: true })}
            />
          </Field>
        </div>
        <ConsentField registration={register('consent')} error={errors.consent?.message} />
        <HoneypotField {...register('website')} />

        {submission.isError ? (
          <SubmissionError error={submission.error} onRetry={() => void onSubmit()} />
        ) : null}

        <Button
          type="submit"
          size="lg"
          block
          disabled={!online}
          loading={submission.isPending}
          loadingLabel="Envoi en cours…"
          trailingIcon={<IconArrowRight />}
        >
          Envoyer ma recherche
        </Button>
        {online ? <SecureNote /> : <OfflineSubmitHint />}
      </FormSection>
    </form>
  );
}
