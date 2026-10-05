import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { Button } from '@/components/ui';
import {
  IconCalendar,
  IconCheck,
  IconEmail,
  IconInfo,
  IconSearch,
  IconWeightScope,
} from '@/components/ui/icons';
import { IconIdentity, IconLegal } from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/cn';
import { pluralize } from '@/lib/text';

/**
 * Éléments communs aux pages de réglages.
 */

const TABS = [
  { to: ROUTES.admin.settings, label: 'Identité & coordonnées', icon: <IconIdentity />, end: true },
  { to: ROUTES.admin.agenda, label: 'Réservation', icon: <IconCalendar /> },
  { to: ROUTES.admin.emails, label: 'E-mails', icon: <IconEmail /> },
  { to: ROUTES.admin.seo, label: 'SEO, analytics & maintenance', icon: <IconSearch /> },
  { to: ROUTES.admin.legal, label: 'Mentions légales', icon: <IconLegal /> },
];

/** Navigation entre les rubriques de réglages. */
export function SettingsTabs() {
  return (
    <nav
      aria-label="Rubriques des réglages"
      className="relative flex gap-0.5 overflow-x-auto border-b border-line"
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            cn(
              '-mb-px flex items-center gap-2 border-b-2 border-transparent px-3 py-[13px] text-sm font-medium whitespace-nowrap text-muted transition-colors hover:text-ink [&_svg]:size-4',
              isActive && 'border-brand font-semibold text-ink',
            )
          }
        >
          <IconWeightScope weight="bold">{tab.icon}</IconWeightScope>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

interface SaveBarProps {
  /** Nombre de champs modifiés */
  changes: number;
  saving: boolean;
  onCancel: () => void;
  /** Formulaire associé (bouton d'envoi) */
  formId: string;
}

/** Barre d'enregistrement collée en bas de l'écran. */
export function SaveBar({ changes, saving, onCancel, formId }: SaveBarProps) {
  return (
    <div className="sticky bottom-0 z-[15] -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white/94 px-4 py-3.5 backdrop-blur-md md:-mx-8 md:px-8">
      <span className="flex items-center gap-2 text-[15px]" aria-live="polite">
        <IconInfo className="size-4" aria-hidden />
        {changes > 0
          ? `${pluralize(changes, 'modification non enregistrée', 'modifications non enregistrées')}`
          : 'Aucune modification en attente'}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" shape="rounded" disabled={changes === 0} onClick={onCancel}>
          Annuler
        </Button>
        <Button
          type="submit"
          form={formId}
          shape="rounded"
          icon={<IconCheck />}
          loading={saving}
          disabled={changes === 0}
        >
          Enregistrer
        </Button>
      </div>
    </div>
  );
}

/** Ligne « réglage + interrupteur » (activation d'une option). */
export function ToggleRow({ title, hint, control }: { title: string; hint: ReactNode; control: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3.5">
      <div>
        <p className="text-[15px] font-semibold">{title}</p>
        <p className="text-[13.5px] text-muted">{hint}</p>
      </div>
      {control}
    </div>
  );
}
