import { Controller, useWatch } from 'react-hook-form';
import { ChoiceGroup, Field, Input, Select } from '@/components/ui/form';
import { COUNTRIES, PROFILE_LABELS } from '@/content/labels';
import { EmailSuggestion, PhoneFields } from '@/features/requests/FormParts';
import { BOOKING_PROFILES } from '../booking-params';
import { useBookingForm } from '../booking-form';

const PROFILE_OPTIONS = BOOKING_PROFILES.map((profile) => ({
  value: profile,
  label: PROFILE_LABELS[profile],
}));

/** Étape 3 : coordonnées permettant de confirmer le rendez-vous. */
export function ContactStep() {
  const { register, control, setValue, formState } = useBookingForm();
  const { errors } = formState;
  const email = useWatch({ control, name: 'email' });

  return (
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
      <Field label="Pays de résidence" id="country" optional>
        <Select autoComplete="country-name" {...register('country')}>
          <option value="">Choisir un pays</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Vous êtes" kind="group" required error={errors.profile?.message}>
        <Controller
          control={control}
          name="profile"
          render={({ field }) => (
            <ChoiceGroup
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              options={PROFILE_OPTIONS}
            />
          )}
        />
      </Field>
    </div>
  );
}
