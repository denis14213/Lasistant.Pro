import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { servicesQuery } from '@/api';
import { Button, Dialog } from '@/components/ui';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { IconAdd } from '@/components/ui/icons';
import { SOURCE_LABELS } from '@/content/labels';
import { createRequestInput, optionalText } from '@/features/requests/request-input';
import { manualRequestSchema, type ManualRequestValues } from '@/lib/validation/admin-forms';
import type { BookingSource } from '@/types';
import { useRequestActions } from './useRequestActions';

const DEFAULT_VALUES: ManualRequestValues = {
  fullName: '',
  email: '',
  phone: '',
  source: 'reservation',
  serviceId: '',
  message: '',
  date: '',
  time: '',
};

interface NewRequestDialogProps {
  open: boolean;
  onClose: () => void;
  /** Ouvre la demande créée */
  onCreated: (id: string) => void;
  /** Rendez-vous déjà convenu : date et heure saisies, statut « Confirmé » */
  appointment?: boolean;
}

/** Saisie d'une demande reçue hors du site (téléphone, e-mail, visite). */
export function NewRequestDialog({ open, onClose, onCreated, appointment = false }: NewRequestDialogProps) {
  const { data: services } = useSuspenseQuery(servicesQuery(true));
  const { createFromTeam } = useRequestActions();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ManualRequestValues>({
    resolver: zodResolver(manualRequestSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const close = () => {
    reset(DEFAULT_VALUES);
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    // Un rendez-vous exige une date et une heure.
    if (appointment && !values.date) {
      setError('date', { message: 'Choisissez la date du rendez-vous.' });
      return;
    }
    if (appointment && !values.time) {
      setError('time', { message: 'Indiquez l’heure du rendez-vous.' });
      return;
    }
    const input = createRequestInput(values.source, {
      fullName: values.fullName,
      email: values.email,
      phone: optionalText(values.phone),
      serviceId: values.serviceId || null,
      message: optionalText(values.message),
      requestedDate: optionalText(values.date),
      requestedTime: optionalText(values.time),
    });
    createFromTeam.mutate(
      { input, status: appointment ? 'confirme' : 'nouveau' },
      {
        onSuccess: (booking) => {
          close();
          onCreated(booking.id);
        },
      },
    );
  });

  return (
    <Dialog
      open={open}
      onClose={close}
      size="md"
      title={appointment ? 'Ajouter un rendez-vous' : 'Saisir une demande'}
      description={
        appointment
          ? 'Pour un rendez-vous convenu par téléphone ou par e-mail : il apparaît dans l’agenda avec le statut « Confirmé ».'
          : 'Pour une demande reçue par téléphone, par e-mail ou lors d’une visite. Elle rejoint la liste avec le statut « Nouveau ».'
      }
      footer={
        <>
          <Button variant="outline" shape="rounded" onClick={close}>
            Annuler
          </Button>
          <Button
            shape="rounded"
            icon={<IconAdd />}
            loading={createFromTeam.isPending}
            onClick={() => void onSubmit()}
          >
            {appointment ? 'Enregistrer le rendez-vous' : 'Enregistrer la demande'}
          </Button>
        </>
      }
    >
      <form noValidate onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Nom complet"
          id="fullName"
          required
          error={errors.fullName?.message}
          density="compact"
          className="md:col-span-2"
        >
          <Input density="compact" autoComplete="off" {...register('fullName')} />
        </Field>
        <Field label="E-mail" id="email" required error={errors.email?.message} density="compact">
          <Input type="email" density="compact" {...register('email')} />
        </Field>
        <Field label="Téléphone" id="phone" optional error={errors.phone?.message} density="compact">
          <Input type="tel" density="compact" placeholder="+216 …" {...register('phone')} />
        </Field>
        <Field label="Type de demande" id="source" density="compact">
          <Select density="compact" {...register('source')}>
            {(Object.keys(SOURCE_LABELS) as BookingSource[]).map((source) => (
              <option key={source} value={source}>
                {SOURCE_LABELS[source]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Service" id="serviceId" density="compact">
          <Select density="compact" {...register('serviceId')}>
            <option value="">Non précisé</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </Select>
        </Field>
        {appointment ? (
          <>
            <Field
              label="Date du rendez-vous"
              id="date"
              required
              error={errors.date?.message}
              density="compact"
            >
              <Input type="date" density="compact" {...register('date')} />
            </Field>
            <Field
              label="Heure (heure de Tunisie)"
              id="time"
              required
              error={errors.time?.message}
              density="compact"
            >
              <Input type="time" density="compact" step={900} {...register('time')} />
            </Field>
          </>
        ) : null}
        <Field
          label="Message ou résumé de l’échange"
          id="message"
          optional
          error={errors.message?.message}
          density="compact"
          className="md:col-span-2"
        >
          <Textarea density="compact" rows={4} {...register('message')} />
        </Field>
        {/* Permet l'envoi par la touche Entrée */}
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Dialog>
  );
}
