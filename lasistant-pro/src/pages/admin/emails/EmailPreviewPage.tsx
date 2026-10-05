import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams, type LoaderFunctionArgs } from 'react-router';
import { emailTemplateQuery, servicesQuery, settingsQuery } from '@/api';
import { prefetch } from '@/app/prefetch';
import { queryClient } from '@/app/query-client';
import { notFound, orNotFound } from '@/app/route-errors';
import { AdminPage, AdminPageHeader, Panel, PanelBody } from '@/components/admin/AdminPage';
import { Seo } from '@/components/seo/Seo';
import { ButtonLink, TextLink } from '@/components/ui';
import { IconArrowLeft } from '@/components/ui/icons';
import { IconEdit } from '@/components/ui/icons-admin';
import { ROUTES } from '@/config/routes';
import { EmailPreview } from '@/features/admin/emails/EmailPreview';
import { templateMeta } from '@/features/admin/emails/template-meta';
import type { EmailTemplateKey } from '@/types';

export async function loader({ params }: LoaderFunctionArgs) {
  const key = params.key as EmailTemplateKey | undefined;
  if (!key) notFound();
  await Promise.all([
    orNotFound(queryClient.ensureQueryData(emailTemplateQuery(key))),
    prefetch(settingsQuery(), servicesQuery(true)),
  ]);
  return null;
}

/** Aperçu en pleine page de la version enregistrée d'un modèle d'e-mail. */
export function Component() {
  const { key = '' } = useParams();
  const { data: template } = useSuspenseQuery(emailTemplateQuery(key as EmailTemplateKey));
  const editPath = `${ROUTES.admin.emails}?modele=${template.key}`;

  return (
    <AdminPage className="max-w-[1100px]">
      <Seo title={`Aperçu : ${template.name}`} description="Aperçu d’un modèle d’e-mail." noIndex />
      <AdminPageHeader
        before={
          <TextLink to={editPath} icon={<IconArrowLeft />} className="text-sm">
            Modèles d’e-mails
          </TextLink>
        }
        title={template.name}
        description={templateMeta(template.key).description}
        actions={
          <ButtonLink to={editPath} variant="outline" shape="rounded" icon={<IconEdit />}>
            Modifier le modèle
          </ButtonLink>
        }
      />
      <Panel>
        <PanelBody>
          <EmailPreview content={template} name={template.name} />
        </PanelBody>
      </Panel>
    </AdminPage>
  );
}
