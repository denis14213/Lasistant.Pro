import { Controller } from 'react-hook-form';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { STAY_DURATIONS } from '@/content/labels';
import { usePageContent } from '@/features/content/usePageContent';
import { isoDateInDays } from '@/lib/dates';
import { AttachmentField } from '../AttachmentField';
import { useBookingForm } from '../booking-form';

/** Étape 4 : informations complémentaires, toutes facultatives. */
export function DetailsStep({ onAttachmentChange }: { onAttachmentChange: (file: File | null) => void }) {
  const { register, control, formState } = useBookingForm();
  const { errors } = formState;
  const { privacyHint, attachmentHint } = usePageContent('reservation');

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Field label="Arrivée envisagée en Tunisie" id="arrivalDate">
        <Input type="date" min={isoDateInDays(1)} {...register('arrivalDate')} />
      </Field>
      <Field label="Durée du séjour" id="stayDuration">
        <Select {...register('stayDuration')}>
          {STAY_DURATIONS.map((duration) => (
            <option key={duration} value={duration}>
              {duration}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label="Votre message"
        id="message"
        error={errors.message?.message}
        hint={privacyHint}
        className="md:col-span-2"
      >
        <Textarea
          rows={4}
          placeholder="Décrivez votre besoin : logement, accompagnement, questions pratiques…"
          {...register('message')}
        />
      </Field>
      <div className="md:col-span-2">
        <Controller
          control={control}
          name="attachmentName"
          render={({ field }) => (
            <AttachmentField
              value={field.value}
              onChange={field.onChange}
              onFileChange={onAttachmentChange}
              hint={attachmentHint}
            />
          )}
        />
      </div>
    </div>
  );
}
