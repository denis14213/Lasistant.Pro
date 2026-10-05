import { useId, type ComponentProps, type ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Link } from 'react-router';
import { Checkbox, Field, Input, Select } from '@/components/ui/form';
import { IconLock, IconOffline } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { suggestEmailCorrection } from '@/lib/email-suggestion';
import { PHONE_COUNTRY_CODES } from '@/lib/validation/common';

/**
 * Éléments communs aux formulaires publics (réservation, logement, demande rapide, contact).
 */

/** Rappel des champs obligatoires, en tête de formulaire. */
export function RequiredFieldsNote() {
  return (
    <p className="text-[15px] text-muted">
      Les champs marqués d’un astérisque{' '}
      <span className="text-brand" aria-hidden>
        *
      </span>{' '}
      sont obligatoires.
    </p>
  );
}

interface ConsentFieldProps {
  registration: UseFormRegisterReturn;
  error?: string;
}

/** Consentement au traitement des données, obligatoire pour envoyer une demande. */
export function ConsentField({ registration, error }: ConsentFieldProps) {
  return (
    <Checkbox
      id={registration.name}
      error={error}
      aria-required
      label={
        <>
          J’accepte que mes données soient utilisées pour traiter ma demande, conformément à la{' '}
          <Link to={ROUTES.privacy}>politique de confidentialité</Link>.{' '}
          <span className="text-brand" aria-hidden>
            *
          </span>
        </>
      }
      {...registration}
    />
  );
}

/**
 * Champ piège invisible (protection anti-spam sans contrainte pour le visiteur) :
 * masqué visuellement et ignoré par les technologies d'assistance. Rogné sur place plutôt
 * que déplacé hors de l'écran, il ne peut pas provoquer de défilement horizontal.
 */
export function HoneypotField(props: ComponentProps<'input'>) {
  const id = useId();
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 size-px overflow-hidden opacity-0 [clip-path:inset(50%)]"
    >
      <label htmlFor={id}>Site web (laisser ce champ vide)</label>
      <input id={id} type="text" tabIndex={-1} autoComplete="off" {...props} />
    </div>
  );
}

/** Mention de sécurité sous le bouton d'envoi. */
export function SecureNote() {
  return (
    <p className="flex items-center gap-2 text-[13px] text-muted">
      <IconLock className="size-4 shrink-0" aria-hidden />
      Données chiffrées et protégées contre le spam.
    </p>
  );
}

/** Indication affichée à la place de l'envoi lorsque le réseau est coupé. */
export function OfflineSubmitHint() {
  return (
    <p role="status" className="flex items-start gap-2 text-[13.5px] leading-[1.45] text-muted">
      <IconOffline className="mt-0.5 size-4 shrink-0" aria-hidden />
      Envoi impossible hors connexion. Vos informations sont conservées : vous pourrez envoyer votre demande
      dès le retour du réseau.
    </p>
  );
}

interface PhoneFieldsProps {
  label: string;
  countryRegistration: UseFormRegisterReturn;
  numberRegistration: UseFormRegisterReturn;
  error?: string;
  density?: 'default' | 'compact';
}

/** Téléphone en deux parties : indicatif du pays et numéro local. */
export function PhoneFields({
  label,
  countryRegistration,
  numberRegistration,
  error,
  density,
}: PhoneFieldsProps) {
  return (
    <Field label={label} id={numberRegistration.name} required error={error} density={density}>
      <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-2 md:grid-cols-[124px_minmax(0,1fr)]">
        <Select
          id={countryRegistration.name}
          aria-label="Indicatif du pays"
          density={density}
          {...countryRegistration}
        >
          {PHONE_COUNTRY_CODES.map((code) => (
            <option key={code.value} value={code.value}>
              {code.label}
            </option>
          ))}
        </Select>
        <Input
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="Numéro"
          density={density}
          {...numberRegistration}
        />
      </div>
    </Field>
  );
}

interface EmailSuggestionProps {
  email: string;
  onApply: (correctedEmail: string) => void;
}

/** Suggestion de correction d'une faute de frappe courante (« gmial.com » → « gmail.com »). */
export function EmailSuggestion({ email, onApply }: EmailSuggestionProps) {
  const suggestion = suggestEmailCorrection(email);
  if (!suggestion) return null;
  return (
    <p role="status" className="text-[13.5px] text-muted">
      Vouliez-vous dire{' '}
      <button
        type="button"
        onClick={() => onApply(suggestion)}
        className="font-semibold text-brand underline-offset-2 hover:underline"
      >
        {suggestion}
      </button>{' '}
      ?
    </p>
  );
}

interface FormSectionProps {
  number: number;
  title: string;
  children: ReactNode;
}

/** Partie numérotée d'un formulaire long (« 1 · Votre séjour », « 2 · Vos coordonnées »). */
export function FormSection({ number, title, children }: FormSectionProps) {
  const titleId = useId();
  return (
    <div
      role="group"
      aria-labelledby={titleId}
      className="flex flex-col gap-5 border-t border-line pt-7 first:border-t-0 first:pt-0"
    >
      <p
        id={titleId}
        className="flex items-center gap-3 text-[13px] font-bold tracking-[0.12em] text-muted uppercase"
      >
        <span
          className="flex size-[26px] items-center justify-center rounded-full bg-ink text-xs tracking-normal text-white"
          aria-hidden
        >
          {number}
        </span>
        {title}
      </p>
      {children}
    </div>
  );
}
