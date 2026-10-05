import { useEffect, useRef } from 'react';
import { getErrorMessage, isDataError } from '@/api';
import { Button, ButtonAnchor, Callout } from '@/components/ui';
import {
  IconCheck,
  IconDocument,
  IconOffline,
  IconPhone,
  IconRetry,
  IconServerError,
  IconWait,
} from '@/components/ui/icons';
import { primaryPhone, useSiteSettings } from '@/features/settings/useSiteSettings';
import { useCountdown } from '@/hooks/useNow';
import { phoneHref } from '@/lib/format';

/**
 * Retours affichés après un envoi : succès (formulaires courts) et échecs.
 * Les informations saisies ne sont jamais perdues et une alternative est toujours proposée.
 */

interface SubmissionErrorProps {
  error: unknown;
  onRetry: () => void;
}

export function SubmissionError({ error, onRetry }: SubmissionErrorProps) {
  const settings = useSiteSettings();
  const phone = primaryPhone(settings);
  const retryAt = isDataError(error, 'rate_limited') ? error.retryAt : null;
  const countdown = useCountdown(retryAt);

  if (isDataError(error, 'rate_limited')) {
    return (
      <Callout tone="warning" role="alert" icon={<IconWait />} title="Trop de tentatives">
        <p>{getErrorMessage(error)}</p>
        {countdown ? (
          <p className="mt-2 text-[15px] font-semibold text-gold-dark">
            Nouvel essai possible dans {countdown}
          </p>
        ) : (
          <p className="mt-2 text-[15px] font-semibold text-gold-dark">Vous pouvez réessayer maintenant.</p>
        )}
      </Callout>
    );
  }

  const offline = isDataError(error, 'offline');
  return (
    <Callout
      tone="danger"
      role="alert"
      icon={offline ? <IconOffline /> : <IconServerError />}
      title={offline ? 'Vous êtes hors connexion' : 'L’envoi n’a pas abouti'}
      actions={
        <>
          <Button variant="dark" size="sm" icon={<IconRetry />} onClick={onRetry}>
            Réessayer
          </Button>
          {phone ? (
            <ButtonAnchor
              href={phoneHref(phone)}
              variant="outline"
              size="sm"
              className="bg-white"
              icon={<IconPhone />}
            >
              Appeler
            </ButtonAnchor>
          ) : null}
        </>
      }
    >
      <p>{getErrorMessage(error)}</p>
    </Callout>
  );
}

interface SubmissionSuccessProps {
  title: string;
  text: string;
  reference: string | null;
  resetLabel: string;
  onReset: () => void;
}

/** Message de succès qui remplace un formulaire court (contact, demande rapide). */
export function SubmissionSuccess({ title, text, reference, resetLabel, onReset }: SubmissionSuccessProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Le focus est déplacé sur le message pour qu'il soit annoncé immédiatement.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div role="status" className="flex flex-col items-center gap-3 px-2 py-6 text-center">
      <span
        className="mb-2 flex size-[88px] items-center justify-center rounded-full bg-success-soft text-success shadow-[0_0_0_12px_rgb(43_178_76/0.08)]"
        aria-hidden
      >
        <IconCheck className="size-10" />
      </span>
      <h3 ref={headingRef} tabIndex={-1} className="text-h3 font-semibold outline-none">
        {title}
      </h3>
      <p className="text-muted">{text}</p>
      {reference ? (
        <p className="inline-flex items-center gap-3 rounded-full border border-line bg-white px-4.5 py-2.5 text-[15px]">
          <IconDocument className="size-4" aria-hidden />
          Référence <strong className="font-mono tracking-[0.04em]">{reference}</strong>
        </p>
      ) : null}
      <button type="button" onClick={onReset} className="mt-1 font-semibold text-brand hover:underline">
        {resetLabel}
      </button>
    </div>
  );
}
