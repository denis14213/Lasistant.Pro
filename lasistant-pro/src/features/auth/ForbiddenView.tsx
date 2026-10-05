import { Button, ButtonLink } from '@/components/ui';
import { IconLock, IconSend } from '@/components/ui/icons';
import { IconDashboard } from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import { useToast } from '@/features/toasts/toast-context';
import { ROLE_LABELS } from '@/lib/permissions';
import { useAuth } from './auth-context';

/**
 * Écran « Accès refusé » (erreur 403) affiché à la place d'une page non autorisée.
 */
export function ForbiddenView() {
  const { session } = useAuth();
  const toast = useToast();
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-[640px] flex-col items-center gap-4 rounded-2xl border border-line bg-paper px-6 py-14 text-center md:px-10">
        <span className="flex size-[72px] items-center justify-center rounded-full bg-gold-soft text-gold-deep">
          <IconLock className="size-8" aria-hidden />
        </span>
        <p className="font-mono text-sm text-muted">Erreur 403</p>
        <h1 className="text-[34px] leading-tight font-semibold tracking-[-0.03em]">Accès refusé</h1>
        <p className="max-w-[460px] text-muted">
          Votre rôle <strong className="text-ink">{session ? ROLE_LABELS[session.role] : 'actuel'}</strong> ne
          permet pas d’accéder à cette page. Si vous pensez qu’il s’agit d’une erreur, contactez un
          administrateur.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <ButtonLink to={ROUTES.admin.dashboard} shape="rounded" icon={<IconDashboard />}>
            Retour au tableau de bord
          </ButtonLink>
          <Button
            shape="rounded"
            variant="outline"
            icon={<IconSend />}
            onClick={() => toast.success('Demande d’accès transmise à l’administrateur.')}
          >
            Demander l’accès
          </Button>
        </div>
        <p className="mt-2 text-[13.5px] text-muted">
          Le menu n’affiche que les rubriques autorisées pour votre rôle.
        </p>
      </div>
    </div>
  );
}
