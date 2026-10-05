import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import type { z } from 'zod';
import { servicesQuery } from '@/api';
import { Button } from '@/components/ui';
import { Field, FormErrorSummary, Input, Select, Textarea } from '@/components/ui/form';
import { IconArrowRight } from '@/components/ui/icons';
import { useFormDraft } from '@/hooks/useFormDraft';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { quickRequestSchema, type QuickRequestValues } from '@/lib/validation/public-forms';
import {
  ConsentField,
  EmailSuggestion,
  HoneypotField,
  OfflineSubmitHint,
  RequiredFieldsNote,
  SecureNote,
} from './FormParts';
import { createRequestInput, optionalText, UNDECIDED_SERVICE } from './request-input';
import { SubmissionError, SubmissionSuccess } from './SubmissionFeedback';
import { useRequestSubmission } from './useRequestSubmission';

type QuickRequestInput = z.input<typeof quickRequestSchema>;

const DEFAULT_VALUES: QuickRequestInput = {
  fullName: '',
  phone: '',
  email: '',
  serviceId: '',
  message: '',
  consent: false,
  website: '',
};

const FIELD_LABELS = {
  fullName: 'Nom complet',
  phone: 'Téléphone',
  email: 'E-mail',
  serviceId: 'Service souhaité',
  message: 'Votre message',
  consent: 'Consentement',
} as const;

/**
 * Demande rapide de la page d'accueil : quelques champs, réponse par e-mail ou téléphone.
 * Le formulaire est remplacé par un message de succès après l'envoi.
 */
export function QuickRequestForm({ titleId }: { titleId: string }) {
  const { data: services } = useSuspenseQuery(servicesQuery());
  const online = useOnlineStatus();
  const submission = useRequestSubmission('demande_rapide');

  const form = useForm<QuickRequestInput, unknown, QuickRequestValues>({
    resolver: zodResolver(quickRequestSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
  });
  const { register, handleSubmit, formState, setValue, control, reset } = form;
  const { errors, submitCount } = formState;
  const email = useWatch({ control, name: 'email' });
  const { clearDraft } = useFormDraft('demande-rapide', form, { exclude: ['consent', 'website'] });

  const onSubmit = handleSubmit((values) => {
    const input = createRequestInput('demande_rapide', {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      serviceId: values.serviceId === UNDECIDED_SERVICE ? null : values.serviceId,
      message: optionalText(values.message),
    });
    submission.mutate({ input, honeypot: values.website }, { onSuccess: clearDraft });
  });

  if (submission.isSuccess) {
    return (
      <SubmissionSuccess
        title="Demande envoyée"
        text="Merci, nous avons bien reçu votre demande. Nous revenons vers vous par e-mail ou par téléphone."
        reference={submission.data?.reference ?? null}
        resetLabel="Envoyer une autre demande"
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
        <h3 id={titleId} className="text-[22px] leading-[1.3] font-semibold tracking-[-0.02em]">
          Demande rapide
        </h3>
        <RequiredFieldsNote />
      </div>

      <FormErrorSummary errors={errors} labels={FIELD_LABELS} submitCount={submitCount} />

      <Field label="Nom complet" id="fullName" required error={errors.fullName?.message}>
        <Input autoComplete="name" placeholder="Prénom et nom" {...register('fullName')} />
      </Field>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Téléphone" id="phone" required error={errors.phone?.message}>
          <Input type="tel" autoComplete="tel" inputMode="tel" placeholder="+216 …" {...register('phone')} />
        </Field>
        <Field label="E-mail" id="email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="nom@exemple.com" {...register('email')} />
          <EmailSuggestion
            email={email}
            onApply={(value) => setValue('email', value, { shouldValidate: true })}
          />
        </Field>
      </div>
      <Field label="Service souhaité" id="serviceId" required error={errors.serviceId?.message}>
        <Select {...register('serviceId')}>
          <option value="">Choisir un service</option>
          {services
            .filter((service) => service.kind === 'page')
            .map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          <option value={UNDECIDED_SERVICE}>Je ne sais pas encore</option>
        </Select>
      </Field>
      <Field
        label="Votre message"
        id="message"
        optional
        error={errors.message?.message}
        hint="Merci de ne pas transmettre d’informations médicales détaillées via ce formulaire."
      >
        <Textarea rows={3} placeholder="Vos dates, votre besoin, vos questions…" {...register('message')} />
      </Field>
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
        Envoyer ma demande
      </Button>
      {online ? <SecureNote /> : <OfflineSubmitHint />}
    </form>
  );
}
