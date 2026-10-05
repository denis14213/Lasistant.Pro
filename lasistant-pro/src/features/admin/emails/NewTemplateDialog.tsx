import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { emailTemplatesRepository, getErrorMessage, queryKeys } from '@/api';
import { Button, Dialog, IconBox } from '@/components/ui';
import { Field, Input } from '@/components/ui/form';
import { IconEmail } from '@/components/ui/icons';
import { useSession } from '@/features/auth/auth-context';
import { useToast } from '@/features/toasts/toast-context';
import { newEmailTemplateSchema, type NewEmailTemplateValues } from '@/lib/validation/admin-forms';
import type { EmailTemplate } from '@/types';

interface NewTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  /** Appelé avec le modèle créé (ouverture dans l'éditeur) */
  onCreated: (template: EmailTemplate) => void;
}

/** Création d'une réponse standard : seul le nom est demandé, le texte se rédige ensuite. */
export function NewTemplateDialog({ open, onClose, onCreated }: NewTemplateDialogProps) {
  const session = useSession();
  const toast = useToast();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewEmailTemplateValues>({
    resolver: zodResolver(newEmailTemplateSchema),
    defaultValues: { name: '' },
  });

  const create = useMutation({
    mutationFn: (values: NewEmailTemplateValues) =>
      emailTemplatesRepository.create(values.name.trim(), session.name),
    onSuccess: async (template) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.emailTemplates });
      toast.success(`Modèle « ${template.name} » créé : rédigez maintenant son message.`);
      reset();
      onCreated(template);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const close = () => {
    reset();
    onClose();
  };
  const submit = handleSubmit((values) => create.mutate(values));

  return (
    <Dialog
      open={open}
      onClose={close}
      size="sm"
      media={
        <IconBox tone="success" size="sm">
          <IconEmail />
        </IconBox>
      }
      title="Nouveau modèle"
      description="Une réponse standard est proposée dans la fiche de chaque demande. Le texte reste modifiable avant l’envoi."
      footer={
        <>
          <Button variant="outline" shape="rounded" onClick={close}>
            Annuler
          </Button>
          <Button shape="rounded" loading={create.isPending} onClick={() => void submit()}>
            Créer le modèle
          </Button>
        </>
      }
    >
      <form noValidate onSubmit={submit}>
        <Field
          label="Nom du modèle"
          id="nouveau-modele-nom"
          error={errors.name?.message}
          hint="Par exemple : « Documents à préparer »."
          density="compact"
        >
          <Input density="compact" autoComplete="off" {...register('name')} />
        </Field>
      </form>
    </Dialog>
  );
}
