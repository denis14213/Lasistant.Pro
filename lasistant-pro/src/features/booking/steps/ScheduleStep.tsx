import { useId } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { ToValidate } from '@/components/ui';
import { ChoiceGroup, Field, FieldError } from '@/components/ui/form';
import { IconCalendarEmpty } from '@/components/ui/icons';
import { formatDayDate } from '@/lib/format';
import {
  firstAvailableDay,
  hasAvailableSlot,
  isSlotAvailable,
  lastBookableDay,
  slotsForDay,
  tunisToday,
  type AvailabilityContext,
} from '../availability';
import { BookingCalendar } from '../BookingCalendar';
import { useBookingForm } from '../booking-form';
import { SlotPicker } from '../SlotPicker';

interface ScheduleStepProps {
  availability: AvailabilityContext;
  whatsappEnabled: boolean;
}

/** Étape 2 : date, heure (heure de Tunisie) et moyen de contact préféré. */
export function ScheduleStep({ availability, whatsappEnabled }: ScheduleStepProps) {
  const { control, setValue, formState } = useBookingForm();
  const { errors } = formState;
  const [date, time] = useWatch({ control, name: ['date', 'time'] });
  const calendarLabelId = useId();
  const slotsLabelId = useId();
  const slotsHintId = useId();

  const today = tunisToday(availability.now);
  const firstDay = firstAvailableDay(availability);
  const slots = date ? slotsForDay(date, availability) : [];

  if (!firstDay) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-box border border-line bg-canvas px-6 py-10 text-center">
        <IconCalendarEmpty className="size-8 text-muted" aria-hidden />
        <p className="font-semibold">Aucun créneau n’est disponible pour le moment.</p>
        <p className="max-w-[440px] text-[15px] text-muted">
          Contactez-nous par téléphone ou par e-mail : nous trouverons ensemble un moment pour échanger.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <span id={calendarLabelId} className="text-[14.5px] leading-snug font-semibold">
          Date souhaitée{' '}
          <span className="text-brand" aria-hidden>
            *
          </span>
        </span>
        <BookingCalendar
          value={date}
          onChange={(day) => {
            setValue('date', day, { shouldValidate: true, shouldDirty: true });
            // L'heure déjà choisie n'est conservée que si elle reste libre ce jour-là.
            if (time && !isSlotAvailable(day, time, availability)) setValue('time', '');
          }}
          isAvailable={(day) => hasAvailableSlot(day, availability)}
          minDate={today}
          maxDate={lastBookableDay(availability)}
          today={today}
          initialDate={firstDay}
          labelledBy={calendarLabelId}
        />
        {errors.date?.message ? <FieldError>{errors.date.message}</FieldError> : null}
      </div>

      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-2">
          <span id={slotsLabelId} className="text-[14.5px] leading-snug font-semibold">
            Créneaux disponibles{date ? ` · ${formatDayDate(date)}` : ''}{' '}
            <span className="text-brand" aria-hidden>
              *
            </span>
          </span>
          {date ? (
            <SlotPicker
              name="time"
              slots={slots}
              value={time}
              onChange={(value) => setValue('time', value, { shouldValidate: true, shouldDirty: true })}
              labelledBy={slotsLabelId}
              describedBy={slotsHintId}
            />
          ) : (
            <p className="rounded-xl border border-dashed border-line-strong bg-canvas px-4 py-3.5 text-[15px] text-muted">
              Choisissez d’abord une date dans le calendrier.
            </p>
          )}
          {errors.time?.message ? <FieldError>{errors.time.message}</FieldError> : null}
          <p id={slotsHintId} className="text-[13.5px] leading-snug text-muted">
            Les créneaux barrés sont déjà réservés ou trop proches (moins de{' '}
            {availability.availability.minNoticeHours} h).
          </p>
        </div>

        <Field
          label="Comment préférez-vous être contacté(e) ?"
          kind="group"
          required
          error={errors.contactPreference?.message}
          hint={
            whatsappEnabled ? undefined : (
              <>
                WhatsApp : <ToValidate>option à activer si validée</ToValidate>
              </>
            )
          }
        >
          <Controller
            control={control}
            name="contactPreference"
            render={({ field }) => (
              <ChoiceGroup
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'telephone', label: 'Téléphone' },
                  { value: 'email', label: 'E-mail' },
                  { value: 'whatsapp', label: 'WhatsApp', disabled: !whatsappEnabled },
                ]}
              />
            )}
          />
        </Field>
      </div>
    </div>
  );
}
