import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, type LoaderFunctionArgs } from 'react-router';
import { accountActivityQuery, accountQuery, accountSessionsQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import { AdminPage } from '@/components/admin/AdminPage';
import { Avatar } from '@/components/admin/Avatar';
import { Seo } from '@/components/seo/Seo';
import { Button } from '@/components/ui';
import { IconSignOut } from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import { ActivityPanel } from '@/features/admin/account/ActivityPanel';
import { EmailNotificationsPanel } from '@/features/admin/account/EmailNotificationsPanel';
import { PasswordPanel } from '@/features/admin/account/PasswordPanel';
import { ProfilePanel } from '@/features/admin/account/ProfilePanel';
import { SessionsPanel } from '@/features/admin/account/SessionsPanel';
import { TwoFactorPanel } from '@/features/admin/account/TwoFactorPanel';
import { useAuth, useSession } from '@/features/auth/auth-context';
import { requireSession } from '@/features/auth/session-guards';
import { ROLE_LABELS } from '@/lib/permissions';

export function loader(args: LoaderFunctionArgs) {
  const { userId } = requireSession(args);
  return prefetch(accountQuery(userId), accountSessionsQuery(userId), accountActivityQuery(userId));
}

/** « Mon compte » : profil, sécurité et préférences de la personne connectée. */
export function Component() {
  const session = useSession();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { data: user } = useSuspenseQuery(accountQuery(session.userId));

  return (
    <AdminPage>
      <Seo title="Mon compte" description="Profil, sécurité et notifications." noIndex />
      <div className="flex items-center gap-4">
        <Avatar name={user.name} tone="dark" size="lg" />
        <div className="min-w-0">
          <h1 className="text-[24px] leading-[1.15] font-semibold tracking-[-0.028em] md:text-[28px]">
            Mon compte
          </h1>
          <p className="mt-1 text-muted">
            {user.name} · {ROLE_LABELS[user.role]} · {user.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <ProfilePanel user={user} />
          <PasswordPanel user={user} />
          <EmailNotificationsPanel user={user} />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <TwoFactorPanel user={user} />
          <SessionsPanel userId={user.id} />
          <ActivityPanel userId={user.id} />
          <Button
            variant="outline"
            shape="rounded"
            icon={<IconSignOut />}
            className="w-fit"
            onClick={() => {
              logout();
              void navigate(ROUTES.admin.login, { replace: true });
            }}
          >
            Se déconnecter
          </Button>
        </div>
      </div>
    </AdminPage>
  );
}
