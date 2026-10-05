import {
  useRef,
  useState,
  type ClipboardEvent,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { IconButton } from '@/components/ui';
import { Input } from '@/components/ui/form';
import { IconCheck, IconRemove } from '@/components/ui/icons';
import { IconHide, IconPreview } from '@/components/ui/icons-admin';
import { cn } from '@/lib/cn';
import { PASSWORD_RULES } from '@/lib/validation/admin-forms';

/**
 * Éléments communs aux écrans d'authentification.
 */

const ICON_TONES = {
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  warning: 'bg-gold-soft text-gold-deep',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-neutral-soft text-ink-soft',
} as const;

interface AuthHeadingProps {
  title: string;
  titleId?: string;
  icon?: ReactNode;
  iconTone?: keyof typeof ICON_TONES;
  eyebrow?: string;
  children?: ReactNode;
}

/** En-tête d'un écran : pictogramme, sur-titre, titre et explication. */
export function AuthHeading({
  title,
  titleId,
  icon,
  iconTone = 'brand',
  eyebrow,
  children,
}: AuthHeadingProps) {
  return (
    <div className="flex flex-col gap-5">
      {icon ? (
        <span
          className={cn(
            'flex size-16 items-center justify-center rounded-full [&_svg]:size-7',
            ICON_TONES[iconTone],
          )}
          aria-hidden
        >
          {icon}
        </span>
      ) : null}
      <div className="flex flex-col gap-3">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1 id={titleId} className="text-[34px] leading-[1.08] font-semibold tracking-[-0.032em]">
          {title}
        </h1>
        {children ? <div className="text-muted">{children}</div> : null}
      </div>
    </div>
  );
}

/** Champ mot de passe avec bouton « Afficher / Masquer ». */
export function PasswordInput(props: ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className={cn('pr-13', props.className)} />
      <IconButton
        label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        variant="ghost"
        className="absolute top-1/2 right-1 -translate-y-1/2"
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? <IconHide aria-hidden /> : <IconPreview aria-hidden />}
      </IconButton>
    </div>
  );
}

const STRENGTH_LABELS = ['très faible', 'faible', 'moyenne', 'bonne', 'excellente'] as const;

/** Robustesse du mot de passe : jauge et règles vérifiées en direct. */
export function PasswordChecklist({ value }: { value: string }) {
  const passed = PASSWORD_RULES.filter((rule) => rule.test(value)).length;
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-1.5" aria-hidden>
        {PASSWORD_RULES.map((rule, index) => (
          <span key={rule.id} className={cn('h-1.5 rounded-md', index < passed ? 'bg-success' : 'bg-line')} />
        ))}
      </div>
      <p className="text-[13.5px] text-muted" aria-live="polite">
        Robustesse :{' '}
        <strong className={passed >= 3 ? 'text-success' : 'text-ink'}>{STRENGTH_LABELS[passed]}</strong>
      </p>
      <ul
        aria-label="Règles du mot de passe"
        className="grid grid-cols-1 gap-x-4 gap-y-2 text-[13.5px] md:grid-cols-2"
      >
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(value);
          return (
            <li
              key={rule.id}
              className={cn('flex items-center gap-2', ok ? 'text-success-dark' : 'text-muted')}
            >
              {ok ? (
                <IconCheck className="size-4" aria-hidden />
              ) : (
                <IconRemove className="size-4" aria-hidden />
              )}
              {rule.label}
              <span className="sr-only">{ok ? ' : respectée' : ' : non respectée'}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface OneTimeCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  invalid?: boolean;
  describedBy?: string;
}

/**
 * Saisie d'un code à usage unique, un chiffre par case.
 * Le collage d'un code complet et la navigation au clavier (← → Retour arrière) sont pris en charge.
 */
export function OneTimeCodeInput({
  value,
  onChange,
  length = 6,
  invalid = false,
  describedBy,
}: OneTimeCodeInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  const focusAt = (index: number) => refs.current[Math.max(0, Math.min(length - 1, index))]?.focus();

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join('').slice(0, length));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && !digits[index]) {
      event.preventDefault();
      setDigit(index - 1, '');
      focusAt(index - 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusAt(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    focusAt(pasted.length);
  };

  return (
    <div className="grid grid-cols-6 gap-2" aria-describedby={describedBy}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          aria-label={`Chiffre ${index + 1} sur ${length}`}
          aria-invalid={invalid || undefined}
          value={digit}
          onPaste={onPaste}
          onKeyDown={(event) => onKeyDown(event, index)}
          onChange={(event) => {
            const typed = event.target.value.replace(/\D/g, '').slice(-1);
            setDigit(index, typed);
            if (typed) focusAt(index + 1);
          }}
          className={cn(
            'h-15 w-full rounded-xl border-[1.5px] border-line-strong bg-white text-center text-2xl font-semibold text-ink transition-[border-color,box-shadow] outline-none focus:border-brand focus:shadow-focus',
            invalid && 'border-danger shadow-invalid',
          )}
        />
      ))}
    </div>
  );
}
