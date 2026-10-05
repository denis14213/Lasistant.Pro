import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { UnsavedChangesGuard } from '@/components/admin/UnsavedChangesGuard';
import { Button, IconButton, ToValidate } from '@/components/ui';
import { Field, FieldError, Input, Select, Switch } from '@/components/ui/form';
import { IconAdd, IconCalendarAdd, IconClose, IconDelete } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { formatDuration, formatShortDate } from '@/lib/format';
import { availabilitySchema, type AvailabilityValues } from '@/lib/validation/admin-forms';
import type { BookingAvailability } from '@/types';
import { useSaveSettings } from '../settings/useSaveSettings';

const WEEKDAYS = [
  { value: 1, label: 'Lun', name: 'lundi' },
  { value: 2, label: 'Mar', name: 'mardi' },
  { value: 3, label: 'Mer', name: 'mercredi' },
  { value: 4, label: 'Jeu', name: 'jeudi' },
  { value: 5, label: 'Ven', name: 'vendredi' },
  { value: 6, label: 'Sam', name: 'samedi' },
  { value: 7, label: 'Dim', name: 'dimanche' },
];

const DURATIONS = [30, 45, 60, 90];
const NOTICES = [0, 12, 24, 48, 72];
const HORIZONS = [30, 60, 90];

/**
 * Disponibilités proposées dans la réservation en ligne.
 * Les changements s'appliquent immédiatement aux créneaux proposés sur le site.
 */
export function AvailabilityForm({ availability }: { availability: BookingAvailability }) {
  const save = useSaveSettings('Disponibilités enregistrées : la réservation en ligne est à jour.');
  const [newClosure, setNewClosure] = useState('');
  const form = useForm<AvailabilityValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      enabled: availability.enabled,
      durationMinutes: availability.durationMinutes,
      openDays: availability.openDays,
      ranges: availability.ranges,
      minNoticeHours: availability.minNoticeHours,
      horizonDays: availability.horizonDays,
      closures: availability.closures,
    },
  });
  const { control, register, handleSubmit, reset, setValue, formState } = form;
  const { errors, isDirty } = formState;
  const ranges = useFieldArray({ control, name: 'ranges' });
  const closures = useWatch({ control, name: 'closures' });

  const onSubmit = handleSubmit((values) => {
    save.mutate(
      { booking: { ...availability, ...values, closures: [...values.closures].sort() } },
      { onSuccess: () => reset(values) },
    );
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4.5">
      <UnsavedChangesGuard when={isDirty} />
      <div className="flex items-center justify-between gap-3.5">
        <div>
          <p id="reservation-planifiee" className="text-[15px] font-semibold">
            Réservation planifiée
          </p>
          <p className="text-[13.5px] text-muted">Les visiteurs choisissent une date et une heure.</p>
        </div>
        <Controller
          control={control}
          name="enabled"
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} label="Réservation planifiée" />
          )}
        />
      </div>

      <Field label="Durée d’un rendez-vous" id="durationMinutes" density="compact">
        <Select density="compact" {...register('durationMinutes', { valueAsNumber: true })}>
          {DURATIONS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {formatDuration(minutes)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Jours d’ouverture" kind="group" error={errors.openDays?.message} density="compact">
        <Controller
          control={control}
          name="openDays"
          render={({ field }) => (
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((day) => {
                const checked = field.value.includes(day.value);
                return (
                  <label
                    key={day.value}
                    className={cn(
                      'inline-flex min-h-9 cursor-pointer items-center rounded-full border-[1.5px] px-3 text-[13.5px] font-medium transition-colors',
                      'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-bright has-[:focus-visible]:outline-solid',
                      checked
                        ? 'border-brand bg-brand-soft font-semibold text-brand-dark'
                        : 'border-line-strong bg-white hover:border-line-hover',
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      aria-label={day.name}
                      onChange={() =>
                        field.onChange(
                          checked
                            ? field.value.filter((value) => value !== day.value)
                            : [...field.value, day.value].sort(),
                        )
                      }
                    />
                    {day.label}
                  </label>
                );
              })}
            </div>
          )}
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[13.5px] font-semibold">Plages horaires</legend>
        {ranges.fields.map((range, index) => (
          <div key={range.id} className="flex flex-col gap-1">
            {/* Grille : les champs d'heure rétrécissent sur petit écran au lieu de déborder. */}
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-2">
              <Input
                type="time"
                density="compact"
                className="min-w-0"
                aria-label={`Début de la plage ${index + 1}`}
                {...register(`ranges.${index}.start`)}
              />
              <span className="text-muted" aria-hidden>
                →
              </span>
              <Input
                type="time"
                density="compact"
                className="min-w-0"
                aria-label={`Fin de la plage ${index + 1}`}
                {...register(`ranges.${index}.end`)}
              />
              <IconButton
                label={`Supprimer la plage ${index + 1}`}
                variant="ghost"
                size="sm"
                disabled={ranges.fields.length === 1}
                onClick={() => ranges.remove(index)}
              >
                <IconDelete aria-hidden />
              </IconButton>
            </div>
            {errors.ranges?.[index]?.end?.message ? (
              <FieldError>{errors.ranges[index]?.end?.message}</FieldError>
            ) : null}
          </div>
        ))}
        {errors.ranges?.message ? <FieldError>{errors.ranges.message}</FieldError> : null}
        <button
          type="button"
          onClick={() => ranges.append({ start: '14:00', end: '17:00' })}
          className="inline-flex w-fit items-center gap-1.5 text-[13.5px] font-semibold text-brand hover:underline"
        >
          <IconAdd className="size-4" aria-hidden />
          Ajouter une plage
        </button>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Délai minimum" id="minNoticeHours" density="compact">
          <Select density="compact" {...register('minNoticeHours', { valueAsNumber: true })}>
            {NOTICES.map((hours) => (
              <option key={hours} value={hours}>
                {hours === 0 ? 'Aucun' : `${hours} h`}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Réservable jusqu’à" id="horizonDays" density="compact">
          <Select density="compact" {...register('horizonDays', { valueAsNumber: true })}>
            {HORIZONS.map((days) => (
              <option key={days} value={days}>
                {days} jours
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[13.5px] font-semibold">Fermetures exceptionnelles</p>
        {closures.length === 0 ? (
          <p className="text-[13.5px] text-muted">
            <ToValidate>dates à définir</ToValidate>
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {closures.map((day) => (
              <li
                key={day}
                className="inline-flex items-center gap-1 rounded-full bg-neutral-soft py-1 pr-1 pl-3 text-[13px] font-medium"
              >
                {formatShortDate(day)}
                <IconButton
                  label={`Retirer la fermeture du ${formatShortDate(day)}`}
                  variant="ghost"
                  size="sm"
                  className="size-6"
                  onClick={() =>
                    setValue(
                      'closures',
                      closures.filter((value) => value !== day),
                      { shouldDirty: true },
                    )
                  }
                >
                  <IconClose aria-hidden />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <Input
            type="date"
            density="compact"
            className="min-w-0"
            aria-label="Date de fermeture"
            value={newClosure}
            onChange={(event) => setNewClosure(event.target.value)}
          />
          <Button
            variant="outline"
            size="sm"
            shape="rounded"
            icon={<IconCalendarAdd />}
            disabled={!newClosure || closures.includes(newClosure)}
            onClick={() => {
              setValue('closures', [...closures, newClosure].sort(), { shouldDirty: true });
              setNewClosure('');
            }}
          >
            Ajouter
          </Button>
        </div>
      </div>

      <Button type="submit" shape="rounded" loading={save.isPending} loadingLabel="Enregistrement…">
        Enregistrer les disponibilités
      </Button>
    </form>
  );
}
