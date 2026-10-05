import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import type { z } from 'zod';
import { Button } from '@/components/ui';
import { ChoiceGroup, Field, FormErrorSummary, Input, Select, Textarea } from '@/components/ui/form';
import { IconSend } from '@/components/ui/icons';
import { CONTACT_SUBJECT_LABELS, PROFILE_LABELS } from '@/content/labels';
import {
  ConsentField,
  EmailSuggestion,
  HoneypotField,
  OfflineSubmitHint,
  RequiredFieldsNote,
  SecureNote,
} from '@/features/requests/FormParts';
import { createRequestInput, optionalText } from '@/features/requests/request-input';
import { SubmissionError, SubmissionSuccess } from '@/features/requests/SubmissionFeedback';
import { useRequestSubmission } from '@/features/requests/useRequestSubmission';
import { useFormDraft } from '@/hooks/useFormDraft';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { contactSchema, type ContactValues } from '@/lib/validation/public-forms';
import type { ApplicantProfile } from '@/types';

type ContactInput = z.input<typeof contactSchema>;

const DEFAULT_VALUES: ContactInput = {
  subject: 'information',
  fullName: '',
  email: '',
  phone: '',
  profile: '',
  message: '',
  consent: false,
  website: '',
};

const SUBJECT_OPTIONS = (
  Object.keys(CONTACT_SUBJECT_LABELS) as Array<keyof typeof CONTACT_SUBJECT_LABELS>
).map((value) => ({ value, label: CONTACT_SUBJECT_LABELS[value] }));

const PROFILES = Object.keys(PROFILE_LABELS) as ApplicantProfile[];
const isProfile = (value: string): value is ApplicantProfile => (PROFILES as string[]).includes(value);

const FIELD_LABELS = {
  fullName: 'Nom complet',
  email: 'E-mail',
  phone: 'Téléphone',
  message: 'Message',
  consent: 'Consentement',
} as const;

/** Formulaire de contact (cahier des charges § 6.10) : remplacé par un message de succès après l'envoi. */
export function ContactForm({ titleId }: { titleId: string }) {
  const online = useOnlineStatus();
  const submission = useRequestSubmission('contact');
  const form = useForm<ContactInput, unknown, ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
  });
  const { register, control, handleSubmit, setValue, reset, formState } = form;
  const { errors, submitCount } = formState;
  const email = useWatch({ control, name: 'email' });
  const { clearDraft } = useFormDraft('contact', form, { exclude: ['consent', 'website'] });

  const onSubmit = handleSubmit((values) => {
    const input = createRequestInput('contact', {
      fullName: values.fullName,
      email: values.email,
      phone: optionalText(values.phone),
      subject: CONTACT_SUBJECT_LABELS[values.subject],
      profile: isProfile(values.profile) ? values.profile : null,
      message: values.message,
    });
    submission.mutate({ input, honeypot: values.website }, { onSuccess: clearDraft });
  });

  if (submission.isSuccess) {
    return (
      <SubmissionSuccess
        title="Message envoyé"
        text="Merci, nous avons bien reçu votre message. Nous revenons vers vous par e-mail ou par téléphone."
        reference={submission.data?.reference ?? null}
        resetLabel="Envoyer un autre message"
        onReset={() => {
          submission.reset();
          reset(DEFAULT_VALUES);
        }}
      />
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby={titleId} className="relative flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <h2 id={titleId} className="text-[26px] leading-[1.15] font-semibold tracking-[-0.02em]">
          Envoyez-nous un message
        </h2>
        <RequiredFieldsNote />
      </div>

      <FormErrorSummary errors={errors} labels={FIELD_LABELS} submitCount={submitCount} />

      <Field label="Objet de votre message" kind="group" required>
        <Controller
          control={control}
          name="subject"
          render={({ field }) => (
            <ChoiceGroup
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              options={SUBJECT_OPTIONS}
            />
          )}
        />
      </Field>
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
        <Field label="E-mail" id="email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="nom@exemple.com" {...register('email')} />
          <EmailSuggestion
            email={email}
            onApply={(value) => setValue('email', value, { shouldValidate: true })}
          />
        </Field>
        <Field label="Téléphone" id="phone" optional error={errors.phone?.message}>
          <Input type="tel" autoComplete="tel" inputMode="tel" placeholder="+216 …" {...register('phone')} />
        </Field>
        <Field label="Vous êtes" id="profile" className="md:col-span-2">
          <Select {...register('profile')}>
            <option value="">Choisir un profil</option>
            {PROFILES.map((profile) => (
              <option key={profile} value={profile}>
                {PROFILE_LABELS[profile]}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Message"
          id="message"
          required
          error={errors.message?.message}
          hint="Merci de ne pas transmettre d’informations médicales détaillées via ce formulaire."
          className="md:col-span-2"
        >
          <Textarea rows={5} placeholder="Comment pouvons-nous vous aider ?" {...register('message')} />
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
        trailingIcon={<IconSend />}
      >
        Envoyer mon message
      </Button>
      {online ? <SecureNote /> : <OfflineSubmitHint />}
    </form>
  );
}
