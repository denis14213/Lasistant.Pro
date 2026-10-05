import type { ReactNode } from 'react';
import { InlineText } from '@/components/content/RichText';
import { TableOfContents } from '@/components/content/TableOfContents';
import { Seo } from '@/components/seo/Seo';
import { breadcrumbTrailSchema } from '@/components/seo/structured-data';
import {
  AccentTitle,
  Breadcrumbs,
  ButtonLink,
  Callout,
  Container,
  Eyebrow,
  Lead,
  ResponsiveTable,
  Section,
  Tag,
  ToValidate,
} from '@/components/ui';
import { IconPreferences } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { CONSENT_CATEGORIES } from '@/content/cookies';
import type { LegalBlock, LegalDocument } from '@/content/legal';
import { activeEntries, primaryEmail, useSiteSettings } from '@/features/settings/useSiteSettings';
import { formatPublicationDate } from '@/lib/format';
import type { SiteSettings } from '@/types';

interface LegalDocumentViewProps {
  document: LegalDocument;
  path: string;
  seo: { title: string; description: string };
}

/** Gabarit des documents légaux : sommaire, sections et tableaux. */
export function LegalDocumentView({ document, path, seo }: LegalDocumentViewProps) {
  const settings = useSiteSettings();
  const breadcrumbs = [{ label: 'Accueil', to: ROUTES.home }, { label: seo.title }];
  // La date de mise à jour renseignée dans le back-office remplace la mention « à préciser ».
  const lead = settings.legal.lastUpdated
    ? document.lead.replace('[[date à préciser]]', formatPublicationDate(settings.legal.lastUpdated))
    : document.lead;

  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        structuredData={breadcrumbTrailSchema(breadcrumbs, path)}
      />
      <section aria-labelledby="titre-page" className="pt-4 pb-12 md:pt-9 md:pb-16">
        <Container>
          <Breadcrumbs items={breadcrumbs} className="mb-6 md:mb-12" />
          <div className="flex max-w-[900px] flex-col gap-6.5">
            <Eyebrow>{document.eyebrow}</Eyebrow>
            <h1 id="titre-page" className="text-h1 font-semibold">
              {document.titleAccent ? (
                <AccentTitle value={{ start: document.title, accent: document.titleAccent }} />
              ) : (
                document.title
              )}
            </h1>
            <Lead>
              <InlineText text={lead} />
            </Lead>
          </div>
        </Container>
      </section>

      <Section className="pt-0 md:pt-0" aria-label="Contenu">
        <Container className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-22">
          <aside aria-label="Sommaire" className="hidden lg:sticky lg:top-[120px] lg:block">
            <TableOfContents
              items={document.sections.map((section) => ({ id: section.id, text: section.title }))}
            />
          </aside>
          <div className="prose-lp max-w-[780px]">
            <Callout tone="warning" title={document.notice.title}>
              <p>{document.notice.text}</p>
            </Callout>
            {document.sections.map((section) => (
              <LegalSection key={section.id} id={section.id} title={section.title}>
                {section.blocks.map((block, index) => (
                  <LegalBlockView key={index} block={block} settings={settings} />
                ))}
              </LegalSection>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <>
      <h2 id={id}>{title}</h2>
      {children}
    </>
  );
}

const pending = (value: string | null, label: string): ReactNode => value ?? <ToValidate>{label}</ToValidate>;

/** Éditeur du site, construit à partir des données légales des réglages. */
function PublisherTable({ settings }: { settings: SiteSettings }) {
  const { legal, address } = settings;
  const cityLine = [address.postalCode, address.city].filter(Boolean).join(' ');
  const rows: Array<[string, ReactNode]> = [
    [
      'Raison sociale',
      <>
        <strong>{settings.brandName}</strong> · {pending(legal.companyName, 'dénomination officielle')}
      </>,
    ],
    ['Forme juridique', pending(legal.legalForm, 'à compléter')],
    [
      'Siège social',
      <>
        {address.street},{' '}
        {address.validated && cityLine ? cityLine : <ToValidate>code postal, ville</ToValidate>},{' '}
        {address.country}
      </>,
    ],
    ['Matricule fiscal', pending(legal.taxId, 'à compléter')],
    ['Registre national des entreprises', pending(legal.registryNumber, 'à compléter')],
    [
      'Téléphone',
      activeEntries(settings.phones)
        .map((phone) => phone.value)
        .join(' · '),
    ],
    ['E-mail', primaryEmail(settings) ?? '—'],
    ['Directeur de la publication', pending(legal.publicationDirector, 'nom et fonction')],
  ];
  return <ResponsiveTable caption="Éditeur du site" rows={rows} rowKeys={rows.map(([label]) => label)} />;
}

function LegalBlockView({ block, settings }: { block: LegalBlock; settings: SiteSettings }) {
  switch (block.type) {
    case 'markdown':
      return (
        <p>
          <InlineText text={block.text} />
        </p>
      );
    case 'list':
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>
              <InlineText text={item} />
            </li>
          ))}
        </ul>
      );
    case 'table':
      return (
        <ResponsiveTable
          head={block.head}
          rows={block.rows.map((row) => row.map((cell) => <InlineText key={cell} text={cell} />))}
          rowKeys={block.rows.map((row) => row.join('|'))}
        />
      );
    case 'callout':
      return (
        <Callout tone={block.tone} title={block.title}>
          <p>{block.text}</p>
        </Callout>
      );
    case 'publisher':
      return <PublisherTable settings={settings} />;
    case 'cookie-table':
      return (
        <ResponsiveTable
          head={['Cookie', 'Finalité', 'Consentement']}
          rows={CONSENT_CATEGORIES.flatMap((category) =>
            category.cookies.map((cookie) => [
              <strong key="nom">
                {cookie.pendingName ? <ToValidate>{cookie.name}</ToValidate> : cookie.name}
              </strong>,
              cookie.purpose,
              category.required ? (
                <Tag key="tag" tone="neutral">
                  Essentiel
                </Tag>
              ) : (
                <Tag key="tag">Soumis à consentement</Tag>
              ),
            ]),
          )}
          rowKeys={CONSENT_CATEGORIES.flatMap((category) =>
            category.cookies.map((cookie) => `${category.id}-${cookie.name}`),
          )}
        />
      );
    case 'cookie-settings':
      return (
        <p>
          <ButtonLink
            to={ROUTES.cookies}
            variant="outline"
            icon={<IconPreferences />}
            className="text-ink no-underline"
          >
            Gérer mes préférences cookies
          </ButtonLink>
        </p>
      );
    default:
      return null;
  }
}
