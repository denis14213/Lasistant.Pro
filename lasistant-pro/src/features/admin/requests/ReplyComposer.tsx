import { useId, useState } from 'react';
import { Button } from '@/components/ui';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { IconSend } from '@/components/ui/icons';
import { IconCopy } from '@/components/ui/icons-admin';
import { env } from '@/config/env';
import { REQUEST_VARIABLES } from '@/emails/catalog';
import { emailBodyToText } from '@/emails/email-markup';
import { useToast } from '@/features/toasts/toast-context';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { fillTemplate } from '@/lib/text';
import type { EmailTemplate } from '@/types';

interface ReplyComposerProps {
  templates: EmailTemplate[];
  recipient: string;
  /** Valeurs des variables pour cette demande */
  values: Record<string, string>;
  onSend: (reply: { subject: string; recipient: string }) => void;
  sending: boolean;
}

/** Texte prêt à l'envoi : variables remplacées, mise en forme convertie en texte simple. */
const toText = (template: EmailTemplate, values: Record<string, string>) =>
  emailBodyToText(template.body, values, env.siteUrl);

/**
 * Réponse au demandeur à partir d'un modèle d'e-mail : les variables sont remplacées,
 * le texte reste modifiable. Phase statique : l'envoi ouvre la messagerie de l'utilisateur
 * avec le message prêt, et l'envoi est consigné dans l'historique de la demande.
 */
export function ReplyComposer({
  templates,
  recipient: defaultRecipient,
  values,
  onSend,
  sending,
}: ReplyComposerProps) {
  const toast = useToast();
  const copy = useCopyToClipboard();
  const formId = useId();
  const initial = templates.find((template) => template.key === 'proposition-creneau') ?? templates[0];
  const [templateId, setTemplateId] = useState(initial?.id ?? '');
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [subject, setSubject] = useState(initial ? fillTemplate(initial.subject, values) : '');
  const [body, setBody] = useState(initial ? toText(initial, values) : '');

  if (templates.length === 0) return <p className="text-muted">Aucun modèle de réponse actif.</p>;

  const chooseTemplate = (id: string) => {
    const template = templates.find((item) => item.id === id);
    setTemplateId(id);
    if (template) {
      setSubject(fillTemplate(template.subject, values));
      setBody(toText(template, values));
    }
  };

  const send = () => {
    const mailto = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_self');
    onSend({ subject, recipient });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <Field label="Modèle" id={`${formId}-modele`} density="compact">
          <Select
            density="compact"
            value={templateId}
            onChange={(event) => chooseTemplate(event.target.value)}
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Destinataire" id={`${formId}-destinataire`} density="compact">
          <Input
            type="email"
            density="compact"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
          />
        </Field>
      </div>
      <Field label="Objet" id={`${formId}-objet`} density="compact">
        <Input density="compact" value={subject} onChange={(event) => setSubject(event.target.value)} />
      </Field>
      <Field label="Message" id={`${formId}-message`} density="compact">
        <Textarea density="compact" rows={8} value={body} onChange={(event) => setBody(event.target.value)} />
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13.5px] text-muted">
          Variables disponibles : {REQUEST_VARIABLES.map((variable) => `[${variable}]`).join(', ')}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            shape="rounded"
            icon={<IconCopy />}
            onClick={() =>
              void copy(`${subject}\n\n${body}`).then((ok) =>
                ok ? toast.success('Message copié.') : toast.error('Impossible de copier le message.'),
              )
            }
          >
            Copier
          </Button>
          <Button
            size="sm"
            shape="rounded"
            icon={<IconSend />}
            loading={sending}
            disabled={!recipient || !body.trim()}
            onClick={send}
          >
            Envoyer l’e-mail
          </Button>
        </div>
      </div>
    </div>
  );
}
