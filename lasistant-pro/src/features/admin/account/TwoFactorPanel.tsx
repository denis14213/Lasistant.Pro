import { Panel, PanelBody, PanelHeader } from '@/components/admin/AdminPage';
import { Badge, IconBox } from '@/components/ui';
import { IconEmail } from '@/components/ui/icons';
import type { AdminUser } from '@/types';

/**
 * Double authentification : un code à 6 chiffres est envoyé par e-mail à chaque connexion.
 * Elle est obligatoire pour tous les comptes (appliquée par la base) : rien à configurer.
 */
export function TwoFactorPanel({ user }: { user: AdminUser }) {
  return (
    <Panel labelledBy="titre-2fa-compte">
      <PanelHeader
        titleId="titre-2fa-compte"
        title="Double authentification"
        action={<Badge tone="success">Activée</Badge>}
      />
      <PanelBody className="flex items-start gap-3.5">
        <IconBox tone="brand" size="sm">
          <IconEmail />
        </IconBox>
        <p className="text-[14.5px] text-muted">
          À chaque connexion, après votre mot de passe, un code à 6 chiffres valable 10 minutes est envoyé à{' '}
          <strong className="text-ink">{user.email}</strong>. Gardez l’accès à cette boîte e-mail : pour
          changer d’adresse, modifiez votre profil.
        </p>
      </PanelBody>
    </Panel>
  );
}
