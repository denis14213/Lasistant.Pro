import { Controller } from 'react-hook-form';
import { Field, RadioCards } from '@/components/ui/form';
import { IconClock, IconConversation } from '@/components/ui/icons';
import { formatDuration } from '@/lib/format';
import type { Service } from '@/types';
import { useBookingForm } from '../booking-form';

interface ServiceStepProps {
  services: Service[];
  durationMinutes: number;
}

/** Étape 1 : choix du service (chaque demande commence par un échange). */
export function ServiceStep({ services, durationMinutes }: ServiceStepProps) {
  const { control, formState } = useBookingForm();
  return (
    <Field
      label="Service demandé"
      kind="group"
      srOnlyLabel
      required
      error={formState.errors.serviceId?.message}
    >
      <Controller
        control={control}
        name="serviceId"
        render={({ field }) => (
          <RadioCards
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            options={services.map((service) => ({
              value: service.id,
              title: service.title,
              description: service.summary,
              meta: (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <IconClock aria-hidden />
                    {formatDuration(durationMinutes)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <IconConversation aria-hidden />
                    E-mail ou téléphone
                  </span>
                </>
              ),
            }))}
          />
        )}
      />
    </Field>
  );
}
