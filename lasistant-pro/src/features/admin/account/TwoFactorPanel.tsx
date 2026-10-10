import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { accountQuery, accountRepository, demoTools, getErrorMessage, queryKeys } from '@/api';
import { Panel, PanelBody, PanelHeader } from '@/components/admin/AdminPage';
import { Badge, Button, Callout, Dialog, IconBox, Spinner } from '@/components/ui';
import { IconKey, IconSecure } from '@/components/ui/icons';
import { IconCopy, IconDownload, IconMobile, IconSecurityWarning } from '@/components/ui/icons-admin';
import { OneTimeCodeInput } from '@/features/auth/AuthParts';
import { useToast } from '@/features/toasts/toast-context';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { downloadText } from '@/lib/download';
import { formatPublicationDate } from '@/lib/format';
import { pluralize } from '@/lib/text';
import type { AdminUser, TwoFactorEnrollment } from '@/types';

/**
 * Double authentification : état, codes de secours, activation et désactivation.
 * L'application d'authentification (TOTP) est gérée par Supabase Auth : la clé secrète
 * n'est jamais conservée par le site, seul le QR code est affiché le temps de la configuration.
 */
export function TwoFactorPanel({ user }: { user: AdminUser }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<'codes' | 'disable' | 'enable' | null>(null);

  const saveUser = (saved: AdminUser) => {
    queryClient.setQueryData(accountQuery(user.id).queryKey, saved);
    return queryClient.invalidateQueries({ queryKey: queryKeys.team });
  };

  const disable = useMutation({
    mutationFn: () => accountRepository.disableTwoFactor(user.id),
    onSuccess: async (saved) => {
      setDialog(null);
      toast.success('Double authentification désactivée.');
      await saveUser(saved);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const onEnabled = async (saved: AdminUser) => {
    toast.success('Double authentification activée. Générez maintenant vos codes de secours.');
    await saveUser(saved);
    // Sans codes de secours, la perte du téléphone bloquerait l'accès au compte.
    setDialog('codes');
  };

  return (
    <Panel labelledBy="double-authentification">
      <PanelHeader
        titleId="double-authentification"
        title="Double authentification"
        action={
          user.twoFactorEnabled ? (
            <Badge tone="success">Activée</Badge>
          ) : (
            <Badge tone="warning">À activer</Badge>
          )
        }
      />
      <PanelBody className="flex flex-col gap-3.5">
        {user.twoFactorEnabled ? (
          <>
            <div className="flex items-center gap-3.5">
              <IconBox tone="success" size="sm">
                <IconMobile />
              </IconBox>
              <div>
                <p className="text-sm font-semibold">Application d’authentification</p>
                <p className="text-[13px] text-muted">
                  {user.twoFactorConfiguredAt
                    ? `Configurée le ${formatPublicationDate(user.twoFactorConfiguredAt)}`
                    : 'Configurée'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                shape="rounded"
                icon={<IconKey />}
                onClick={() => setDialog('codes')}
              >
                Codes de secours ({pluralize(user.recoveryCodesRemaining, 'restant')})
              </Button>
              <Button
                variant="outline"
                size="sm"
                shape="rounded"
                className="text-danger"
                onClick={() => setDialog('disable')}
              >
                Désactiver
              </Button>
            </div>
          </>
        ) : (
          <>
            <Callout
              tone="warning"
              icon={<IconSecurityWarning />}
              title="Compte protégé par un seul mot de passe"
            >
              <p>
                Activez la double authentification : un code à usage unique sera demandé à chaque connexion.
              </p>
            </Callout>
            <Button
              size="sm"
              shape="rounded"
              icon={<IconSecure />}
              className="w-fit"
              onClick={() => setDialog('enable')}
            >
              Activer la double authentification
            </Button>
          </>
        )}
      </PanelBody>

      <RecoveryCodesDialog
        open={dialog === 'codes'}
        onClose={() => setDialog(null)}
        user={user}
        onRegenerated={saveUser}
      />

      <Dialog
        open={dialog === 'disable'}
        onClose={() => setDialog(null)}
        role="alertdialog"
        size="sm"
        title="Désactiver la double authentification ?"
        description="Votre compte ne sera plus protégé que par votre mot de passe. Les codes de secours seront supprimés."
        footer={
          <>
            <Button variant="outline" shape="rounded" onClick={() => setDialog(null)}>
              Garder la protection
            </Button>
            <Button
              variant="danger"
              shape="rounded"
              loading={disable.isPending}
              onClick={() => disable.mutate()}
            >
              Désactiver
            </Button>
          </>
        }
      />

      <EnableTwoFactorDialog
        open={dialog === 'enable'}
        user={user}
        onClose={() => setDialog(null)}
        onEnabled={onEnabled}
      />
    </Panel>
  );
}

/** Clé de configuration lisible : groupes de 4 caractères. */
function formatSecret(secret: string): string {
  return secret
    .replace(/\s+/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function EnableTwoFactorDialog({
  open,
  user,
  onClose,
  onEnabled,
}: {
  open: boolean;
  user: AdminUser;
  onClose: () => void;
  onEnabled: (user: AdminUser) => Promise<unknown>;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<TwoFactorEnrollment | null>(null);

  const reset = () => {
    setCode('');
    setError(null);
    setEnrollment(null);
  };

  const start = useMutation({
    mutationFn: () => accountRepository.startTwoFactor(user.id),
    onSuccess: setEnrollment,
  });
  const confirm = useMutation({
    mutationFn: (factorId: string) => accountRepository.confirmTwoFactor(user.id, factorId, code),
    onSuccess: async (saved) => {
      reset();
      await onEnabled(saved);
    },
    onError: (failure) => {
      setError(getErrorMessage(failure));
      setCode('');
    },
  });

  // Une nouvelle configuration est préparée à chaque ouverture (QR code à usage unique).
  const { mutate: startEnrollment } = start;
  useEffect(() => {
    if (open) startEnrollment();
  }, [open, startEnrollment]);

  const close = () => {
    reset();
    onClose();
  };
  const submit = () => {
    if (!enrollment) return;
    if (!/^\d{6}$/.test(code)) {
      setError('Saisissez les 6 chiffres affichés par votre application.');
      return;
    }
    setError(null);
    confirm.mutate(enrollment.factorId);
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      size="md"
      title="Activer la double authentification"
      description="Scannez le QR code avec votre application d’authentification (Google Authenticator, Microsoft Authenticator…), puis saisissez le code à 6 chiffres qu’elle affiche."
      footer={
        <>
          <Button variant="outline" shape="rounded" onClick={close}>
            Annuler
          </Button>
          <Button
            shape="rounded"
            loading={confirm.isPending}
            disabled={code.length < 6 || !enrollment}
            onClick={submit}
          >
            Activer
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {start.isError ? (
          <Callout tone="danger" size="sm" role="alert">
            {getErrorMessage(start.error)}{' '}
            <button type="button" className="font-semibold underline" onClick={() => start.mutate()}>
              Réessayer
            </button>
          </Callout>
        ) : !enrollment ? (
          <Spinner label="Préparation du QR code…" className="py-6" />
        ) : (
          <div className="flex flex-wrap items-center gap-5">
            {enrollment.qrCode ? (
              <img
                src={enrollment.qrCode}
                alt="QR code à scanner avec votre application d’authentification"
                width={144}
                height={144}
                className="size-36 shrink-0 rounded-xl border border-line bg-white p-2"
              />
            ) : (
              <div className="placeholder-hatch flex size-36 shrink-0 items-center justify-center rounded-xl border border-line text-center text-[12.5px] font-semibold text-muted">
                QR code
                <br />à scanner
              </div>
            )}
            <div className="min-w-0 flex-1 text-sm">
              <p className="text-muted">Impossible de scanner ? Saisissez cette clé dans l’application :</p>
              <p className="mt-1.5 font-mono font-semibold tracking-[0.08em] break-all text-ink">
                {formatSecret(enrollment.secret)}
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <p id="code-activation-libelle" className="text-[13.5px] font-semibold">
            Code à 6 chiffres
          </p>
          <OneTimeCodeInput
            value={code}
            onChange={(value) => {
              setCode(value);
              setError(null);
            }}
            invalid={error !== null}
            describedBy={error ? 'code-activation-erreur' : undefined}
          />
          {error ? (
            <p id="code-activation-erreur" className="text-[13.5px] font-medium text-danger">
              {error}
            </p>
          ) : null}
          {demoTools ? (
            <p className="text-[13px] text-muted">
              Démonstration : saisissez le code {demoTools.credentials.twoFactorCode}.
            </p>
          ) : null}
        </div>
      </div>
    </Dialog>
  );
}

interface RecoveryCodesDialogProps {
  open: boolean;
  onClose: () => void;
  user: AdminUser;
  onRegenerated: (user: AdminUser) => Promise<unknown>;
}

/** Codes de secours : de nouveaux codes ne sont affichés qu'une fois, au moment de leur création. */
function RecoveryCodesDialog({ open, onClose, user, onRegenerated }: RecoveryCodesDialogProps) {
  const toast = useToast();
  const copy = useCopyToClipboard();
  const [codes, setCodes] = useState<string[] | null>(null);

  const regenerate = useMutation({
    mutationFn: () => accountRepository.regenerateRecoveryCodes(user.id),
    onSuccess: async (generated) => {
      setCodes(generated);
      toast.success('Nouveaux codes de secours générés. Les anciens ne fonctionnent plus.');
      await onRegenerated({ ...user, recoveryCodesRemaining: generated.length });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const close = () => {
    setCodes(null);
    onClose();
  };
  const text = codes ? `Codes de secours LASISTANT.PRO — ${user.email}\n\n${codes.join('\n')}\n` : '';

  return (
    <Dialog
      open={open}
      onClose={close}
      size="md"
      title="Codes de secours"
      description="Chaque code ne sert qu’une fois, si vous n’avez plus accès à votre application d’authentification."
      footer={
        codes ? (
          <>
            <Button
              variant="outline"
              shape="rounded"
              icon={<IconCopy />}
              onClick={() =>
                void copy(text).then((ok) =>
                  ok ? toast.success('Codes copiés.') : toast.error('Impossible de copier les codes.'),
                )
              }
            >
              Copier
            </Button>
            <Button
              variant="outline"
              shape="rounded"
              icon={<IconDownload />}
              onClick={() => downloadText('codes-de-secours-lasistant.txt', text, 'text/plain')}
            >
              Télécharger
            </Button>
            <Button shape="rounded" onClick={close}>
              J’ai noté mes codes
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" shape="rounded" onClick={close}>
              Fermer
            </Button>
            <Button
              shape="rounded"
              icon={<IconKey />}
              loading={regenerate.isPending}
              onClick={() => regenerate.mutate()}
            >
              Générer de nouveaux codes
            </Button>
          </>
        )
      }
    >
      {codes ? (
        <div className="flex flex-col gap-4">
          <ul className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-smoke p-4 font-mono text-[15px] font-semibold tracking-[0.06em]">
            {codes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
          <Callout tone="warning" title="Conservez-les en lieu sûr">
            <p>
              Ces codes ne seront plus affichés. Rangez-les dans un gestionnaire de mots de passe ou
              imprimez-les.
            </p>
          </Callout>
        </div>
      ) : (
        <p className="text-[15px]">
          Il vous reste{' '}
          <strong>{pluralize(user.recoveryCodesRemaining, 'code utilisable', 'codes utilisables')}</strong>.
          Générer de nouveaux codes rend les anciens inutilisables.
        </p>
      )}
    </Dialog>
  );
}
