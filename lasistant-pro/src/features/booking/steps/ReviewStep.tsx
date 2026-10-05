import { Checkbox } from '@/components/ui/form';
import { IconSecure } from '@/components/ui/icons';
import { ConsentField, HoneypotField } from '@/features/requests/FormParts';
import { useBookingForm } from '../booking-form';

export interface ReviewRow {
  label: string;
  value: string;
  /** Étape à rouvrir pour modifier l'information */
  stepIndex: number;
}

interface ReviewStepProps {
  rows: ReviewRow[];
  onEdit: (stepIndex: number) => void;
}

/** Étape 5 : relecture de la demande, consentement et envoi. */
export function ReviewStep({ rows, onEdit }: ReviewStepProps) {
  const { register, formState } = useBookingForm();
  return (
    <div className="flex flex-col gap-7">
      <dl className="flex flex-col overflow-hidden rounded-box border border-line">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-line px-5 py-4 text-[15px] last:border-b-0 md:grid-cols-[200px_minmax(0,1fr)_auto]"
          >
            <dt className="text-muted">{row.label}</dt>
            <dd className="col-start-1 font-semibold break-words md:col-start-auto">{row.value}</dd>
            <button
              type="button"
              onClick={() => onEdit(row.stepIndex)}
              className="col-start-2 row-span-2 row-start-1 font-semibold text-brand hover:underline md:col-start-auto md:row-span-1 md:row-start-auto"
            >
              Modifier<span className="sr-only"> : {row.label}</span>
            </button>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-5">
        <ConsentField registration={register('consent')} error={formState.errors.consent?.message} />
        <Checkbox
          id="sendCopy"
          label="Je souhaite recevoir une copie de ma demande par e-mail."
          {...register('sendCopy')}
        />
        <HoneypotField {...register('website')} />
      </div>
      <p className="flex items-center gap-2 text-[13px] text-muted">
        <IconSecure className="size-4 shrink-0" aria-hidden />
        Formulaire protégé par une vérification anti-spam invisible.
      </p>
    </div>
  );
}
