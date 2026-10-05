import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { servicesQuery } from '@/api';
import { Button } from '@/components/ui';
import { ChoiceGroup } from '@/components/ui/form';
import { IconInfo } from '@/components/ui/icons';
import { IconDownload } from '@/components/ui/icons-admin';
import { EmailDocument } from '@/emails/EmailDocument';
import { emailEnvelope } from '@/emails/registry';
import { renderEmailHtml } from '@/emails/render';
import type { EmailContent } from '@/emails/types';
import { useSiteSettings } from '@/features/settings/useSiteSettings';
import { cn } from '@/lib/cn';
import { downloadText } from '@/lib/download';
import { previewData } from './email-preview-data';

type Device = 'ordinateur' | 'mobile';

const DEVICES = [
  { value: 'ordinateur', label: 'Ordinateur' },
  { value: 'mobile', label: 'Mobile' },
] as const;

interface EmailPreviewProps {
  content: EmailContent;
  /** Nom du modèle (titre du cadre) */
  name: string;
}

/** Ajuste la hauteur du cadre à celle de l'e-mail : la page défile, pas le cadre. */
function fitToContent(frame: HTMLIFrameElement) {
  const body = frame.contentDocument?.body;
  if (body) frame.style.height = `${body.scrollHeight}px`;
}

/**
 * Aperçu d'un e-mail avec une demande d'exemple. L'e-mail est rendu dans un cadre isolé :
 * les styles du back-office ne s'y appliquent pas, comme dans une vraie messagerie.
 */
export function EmailPreview({ content, name }: EmailPreviewProps) {
  const settings = useSiteSettings();
  const { data: services } = useSuspenseQuery(servicesQuery(true));
  const [device, setDevice] = useState<Device>('ordinateur');
  const frameRef = useRef<HTMLIFrameElement>(null);
  // Adresse de cette installation : le logo et les liens de l'aperçu fonctionnent avant la mise en ligne.
  const siteUrl = window.location.origin;

  const { context, values } = useMemo(
    () => previewData(content.key, settings, services, siteUrl),
    [content.key, settings, services, siteUrl],
  );
  const subject = emailEnvelope(content, values, context).subject;
  const html = useMemo(
    () =>
      renderEmailHtml(
        <EmailDocument content={content} values={values} context={context} withEnvelope />,
        subject,
        { linksInNewTab: true },
      ),
    [content, values, context, subject],
  );

  // La largeur du cadre change avec l'appareil choisi et la fenêtre : la hauteur suit.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(() => fitToContent(frame));
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const download = () => {
    const email = renderEmailHtml(
      <EmailDocument content={content} values={values} context={context} />,
      subject,
    );
    downloadText(`email-${content.key}.html`, email, 'text/html');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ChoiceGroup<Device>
          name={`appareil-${content.key}`}
          size="sm"
          value={device}
          onChange={setDevice}
          options={DEVICES}
        />
        <Button variant="outline" size="sm" shape="rounded" icon={<IconDownload />} onClick={download}>
          Télécharger le HTML
        </Button>
      </div>
      <p className="flex items-start gap-2 text-[13.5px] text-muted">
        <IconInfo className="mt-0.5 size-4 shrink-0" aria-hidden />
        Aperçu avec une demande fictive. Selon la messagerie, l’affichage peut légèrement varier (polices,
        arrondis).
      </p>
      <div className="overflow-hidden rounded-xl border border-line bg-neutral-soft">
        <div
          className={cn(
            'mx-auto transition-[width] duration-300',
            device === 'mobile' ? 'w-[390px] max-w-full' : 'w-full',
          )}
        >
          <iframe
            ref={frameRef}
            title={`Aperçu de l’e-mail « ${name} »`}
            srcDoc={html}
            // Aucun script dans l'aperçu ; les liens s'ouvrent dans un nouvel onglet.
            sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            onLoad={(event) => fitToContent(event.currentTarget)}
            className="block h-[900px] w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
