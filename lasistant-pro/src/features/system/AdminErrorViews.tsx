import type { ReactNode } from 'react';
import { Button, ButtonLink } from '@/components/ui';
import { IconOffline, IconRetry, IconServerError } from '@/components/ui/icons';
import { IconDashboard, IconInbox, IconNotFound } from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/cn';

/**
 * Écrans d'erreur du back-office, affichés dans le gabarit (le menu reste disponible).
 * Même présentation que l'écran « Accès refusé ».
 */

interface StatusCardProps {
  icon: ReactNode;
  iconTone: string;
  code: string;
  title: string;
  children: ReactNode;
  actions: ReactNode;
}

function StatusCard({ icon, iconTone, code, title, children, actions }: StatusCardProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-[640px] flex-col items-center gap-4 rounded-2xl border border-line bg-paper px-6 py-14 text-center md:px-10">
        <span
          className={cn('flex size-[72px] items-center justify-center rounded-full [&_svg]:size-8', iconTone)}
          aria-hidden
        >
          {icon}
        </span>
        <p className="font-mono text-sm text-muted">{code}</p>
        <h1 className="text-[34px] leading-tight font-semibold tracking-[-0.03em]">{title}</h1>
        <div className="max-w-[460px] text-muted">{children}</div>
        <div className="mt-2 flex flex-wrap justify-center gap-2">{actions}</div>
      </div>
    </div>
  );
}

/** Page ou élément introuvable (erreur 404). */
export function AdminNotFoundView() {
  return (
    <StatusCard
      icon={<IconNotFound />}
      iconTone="bg-brand-soft text-brand"
      code="Erreur 404"
      title="Page introuvable"
      actions={
        <>
          <ButtonLink to={ROUTES.admin.dashboard} shape="rounded" icon={<IconDashboard />}>
            Retour au tableau de bord
          </ButtonLink>
          <ButtonLink to={ROUTES.admin.requests} variant="outline" shape="rounded" icon={<IconInbox />}>
            Voir les demandes
          </ButtonLink>
        </>
      }
    >
      <p>
        Cette page n’existe pas ou l’élément demandé a été supprimé. Vérifiez l’adresse ou repartez du tableau
        de bord.
      </p>
    </StatusCard>
  );
}

/** Chargement impossible : réseau coupé ou problème technique. */
export function AdminErrorView({ offline, onRetry }: { offline: boolean; onRetry: () => void }) {
  return (
    <StatusCard
      icon={offline ? <IconOffline /> : <IconServerError />}
      iconTone={offline ? 'bg-gold-soft text-gold-deep' : 'bg-danger-soft text-danger'}
      code={offline ? 'Hors connexion' : 'Erreur technique'}
      title={offline ? 'Connexion perdue' : 'Cette page ne peut pas s’afficher'}
      actions={
        <>
          <Button shape="rounded" icon={<IconRetry />} onClick={onRetry}>
            Réessayer
          </Button>
          <ButtonLink to={ROUTES.admin.dashboard} variant="outline" shape="rounded" icon={<IconDashboard />}>
            Tableau de bord
          </ButtonLink>
        </>
      }
    >
      <p>
        {offline
          ? 'Vérifiez votre connexion internet : la page se chargera dès le retour du réseau. Aucune modification enregistrée n’est perdue.'
          : 'Un problème technique empêche le chargement des données. Réessayez dans un instant ; si le problème persiste, prévenez un administrateur.'}
      </p>
    </StatusCard>
  );
}
