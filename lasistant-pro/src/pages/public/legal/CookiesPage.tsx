import { useState } from 'react';
import { BrandSwoosh } from '@/components/brand/BrandSwoosh';
import { Seo } from '@/components/seo/Seo';
import { breadcrumbTrailSchema } from '@/components/seo/structured-data';
import {
  AccentTitle,
  Accordion,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Eyebrow,
  IconBox,
  Lead,
  ResponsiveTable,
  Section,
  Tag,
  TextLink,
  ToValidate,
} from '@/components/ui';
import { Switch } from '@/components/ui/form';
import { IconCheck, IconCookie } from '@/components/ui/icons';
import { ROUTES } from '@/config/routes';
import { CONSENT_CATEGORIES, COOKIE_FAQ, type ConsentCategory } from '@/content/cookies';
import { COOKIES_PAGE_CONTENT } from '@/content/pages/public';
import { useCookieConsent } from '@/features/cookies/consent-context';
import type { ConsentChoices } from '@/features/cookies/consent-storage';
import { CookieDuration } from '@/features/cookies/ConsentCategoryRow';
import { formatPublicationDate } from '@/lib/format';

const BREADCRUMBS = [{ label: 'Accueil', to: ROUTES.home }, { label: 'Gestion des cookies' }];

const TAG_TONES = { essential: 'success', analytics: 'brand', thirdParty: 'gold' } as const;

/** Page « Gestion des cookies » : choix détaillés, liste des cookies et réponses (cahier des charges § 10). */
export function Component() {
  const content = COOKIES_PAGE_CONTENT;
  const consent = useCookieConsent();
  // Les interrupteurs forment un brouillon : rien n'est appliqué avant l'enregistrement.
  const [draft, setDraft] = useState<ConsentChoices>(consent.choices);
  // Après chaque enregistrement (ici, dans la bannière ou la fenêtre), le brouillon repart du choix enregistré.
  const [syncedRecord, setSyncedRecord] = useState(consent.record);
  if (syncedRecord !== consent.record) {
    setSyncedRecord(consent.record);
    setDraft(consent.choices);
  }

  const isOn = (category: ConsentCategory) => (category.id === 'essential' ? true : draft[category.id]);

  return (
    <>
      <Seo
        title={content.seo.title}
        description={content.seo.description}
        structuredData={breadcrumbTrailSchema(BREADCRUMBS, ROUTES.cookies)}
      />
      <section aria-labelledby="titre-page" className="relative overflow-hidden pt-4 pb-12 md:pt-9 md:pb-14">
        <BrandSwoosh className="absolute -top-10 -right-24 z-0 size-[340px] md:-top-15 md:-right-35 md:size-[560px]" />
        <Container className="relative">
          <Breadcrumbs items={BREADCRUMBS} className="mb-6 md:mb-12" />
          <div className="relative z-[2] flex max-w-[900px] flex-col gap-6.5">
            <Eyebrow>{content.hero.eyebrow}</Eyebrow>
            <h1 id="titre-page" className="text-h1 font-semibold">
              <AccentTitle value={content.hero.title} />
            </h1>
            <Lead className="max-w-[680px]">{content.hero.lead}</Lead>
          </div>
        </Container>
      </section>

      <Section className="pt-0 md:pt-0" aria-label="Préférences">
        <Container className="grid grid-cols-1 items-start gap-12 md:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-7">
            {CONSENT_CATEGORIES.map((category) => (
              <Card key={category.id} className="flex items-center gap-4 p-6 md:p-8">
                <IconBox icon={category.icon} tone={category.tone} />
                <div className="min-w-0 flex-1">
                  <h2 className="text-[19px] leading-[1.3] font-semibold tracking-[-0.01em]">{category.title}</h2>
                  <p className="mt-1 text-sm text-muted">{category.description}</p>
                </div>
                {category.required ? (
                  <span className="rounded-full bg-success-soft px-3 py-1.5 text-[12.5px] font-semibold whitespace-nowrap text-success-dark">
                    Toujours actifs
                  </span>
                ) : (
                  <Switch
                    checked={isOn(category)}
                    label={category.title}
                    onCheckedChange={(checked) => setDraft((current) => ({ ...current, [category.id]: checked }))}
                  />
                )}
              </Card>
            ))}

            <div className="mt-4 flex flex-col gap-5">
              <h2 className="text-h3 font-semibold">Liste des cookies utilisés</h2>
              <ResponsiveTable
                caption="Cookies utilisés sur le site"
                head={['Nom', 'Catégorie', 'Finalité', 'Durée']}
                rows={CONSENT_CATEGORIES.flatMap((category) =>
                  category.cookies.map((cookie) => [
                    <span key="nom" className="font-mono text-[12.5px] tracking-[0.02em] text-ink-soft">
                      {cookie.pendingName ? <ToValidate>{cookie.name}</ToValidate> : cookie.name}
                    </span>,
                    <Tag key="categorie" tone={TAG_TONES[category.id]}>
                      {category.tagLabel}
                    </Tag>,
                    cookie.purpose,
                    <span key="duree" className="whitespace-nowrap">
                      <CookieDuration cookie={cookie} />
                    </span>,
                  ]),
                )}
                rowKeys={CONSENT_CATEGORIES.flatMap((category) =>
                  category.cookies.map((cookie) => `${category.id}-${cookie.name}`),
                )}
              />
            </div>

            <div className="mt-4 flex flex-col gap-5">
              <h2 className="text-h3 font-semibold">Questions fréquentes</h2>
              <Accordion
                defaultOpenId={COOKIE_FAQ[0]?.id ?? null}
                items={COOKIE_FAQ.map((item) => ({ id: item.id, title: item.question, content: <p>{item.answer}</p> }))}
              />
            </div>
          </div>

          <aside aria-label="Enregistrer mes choix" className="flex flex-col gap-5 md:sticky md:top-[120px]">
            <div className="relative flex flex-col gap-4.5 overflow-hidden rounded-card bg-plum p-7 text-white">
              <BrandSwoosh secondBlade="green" className="absolute -right-24 -bottom-30 size-[320px] opacity-35" />
              <div className="relative flex items-center gap-3">
                <IconBox tone="on-dark" size="sm">
                  <IconCookie />
                </IconBox>
                <p className="font-semibold">Vos choix actuels</p>
              </div>
              <dl aria-live="polite" className="relative flex flex-col">
                {CONSENT_CATEGORIES.map((category) => (
                  <div key={category.id} className="flex justify-between gap-4 border-b border-white/12 py-3 text-[14.5px]">
                    <dt className="text-on-plum">{category.title}</dt>
                    <dd className="font-semibold">{isOn(category) ? 'Acceptés' : 'Refusés'}</dd>
                  </div>
                ))}
              </dl>
              <Button variant="light" block icon={<IconCheck />} className="relative" onClick={() => consent.save(draft)}>
                Enregistrer mes choix
              </Button>
              <div className="relative grid grid-cols-2 gap-2">
                <Button variant="outline-light" size="sm" onClick={consent.rejectAll}>
                  Tout refuser
                </Button>
                <Button variant="outline-light" size="sm" onClick={consent.acceptAll}>
                  Tout accepter
                </Button>
              </div>
            </div>
            {consent.record ? (
              <p role="status" className="flex items-center gap-2 text-[13.5px] font-medium text-success">
                <IconCheck className="size-4" aria-hidden />
                Préférences enregistrées le {formatPublicationDate(consent.record.decidedAt)}.
              </p>
            ) : null}
            <TextLink to={ROUTES.privacy} arrow className="text-[15px]">
              Lire la politique de confidentialité
            </TextLink>
          </aside>
        </Container>
      </Section>
    </>
  );
}
