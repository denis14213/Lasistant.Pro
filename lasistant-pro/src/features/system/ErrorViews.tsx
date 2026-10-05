import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';
import { servicesQuery, settingsQuery } from '@/api';
import { BrandSwoosh } from '@/components/brand/BrandSwoosh';
import { Button, ButtonLink, Container, IconBox, Lead, Section, TextAnchor } from '@/components/ui';
import {
  IconArrowRight,
  IconEmail,
  IconHome,
  IconPhone,
  IconRetry,
  IconServerError,
} from '@/components/ui/icons';
import { ROUTES, servicePath } from '@/config/routes';
import { SYSTEM_PAGES_CONTENT } from '@/content/pages/public';
import { createSiteSettingsSeed } from '@/content/site-settings';
import { phoneHref } from '@/lib/format';
import { primaryEmail, primaryPhone } from '../settings/useSiteSettings';

/**
 * Pages d'erreur affichées dans le gabarit du site : 404 (page introuvable) et 500 (erreur technique).
 * Elles ne dépendent d'aucun chargement obligatoire : elles restent utilisables même si les
 * données du site n'ont pas pu être lues.
 */

/** Réglages en cache, ou valeurs par défaut si la lecture a échoué. */
function useSettingsOrDefaults() {
  const { data } = useQuery(settingsQuery());
  return data ?? createSiteSettingsSeed();
}

function BigCode({ code }: { code: string }) {
  return (
    <span
      className="accent text-[clamp(8.75rem,20vw,17.5rem)] leading-[0.8] tracking-[-0.04em] text-brand"
      aria-hidden
    >
      {code}
    </span>
  );
}

export function NotFoundView() {
  const content = SYSTEM_PAGES_CONTENT.notFound;
  const { data: services = [] } = useQuery(servicesQuery());
  const pages = services.filter((service) => service.kind === 'page').slice(0, 3);

  return (
    <Section className="relative overflow-hidden" aria-labelledby="titre-erreur">
      <BrandSwoosh className="absolute -top-20 -right-30 size-[560px] opacity-90 max-md:size-[320px]" />
      <Container className="relative">
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-6.5 text-center">
          <BigCode code={content.code} />
          <h1
            id="titre-erreur"
            className="text-[clamp(2.125rem,3.6vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.036em] max-[359px]:text-[min(2.125rem,9.3vw)]"
          >
            {content.title}
          </h1>
          <Lead className="max-w-[560px]">{content.lead}</Lead>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink to={ROUTES.home} size="lg" icon={<IconHome />}>
              Retour à l’accueil
            </ButtonLink>
            <ButtonLink to={ROUTES.contact} variant="outline" size="lg">
              Nous contacter
            </ButtonLink>
          </div>
        </div>
        {pages.length > 0 ? (
          <ul className="mx-auto mt-18 grid max-w-[980px] grid-cols-1 gap-6 md:grid-cols-3">
            {pages.map((service) => (
              <li key={service.id}>
                <Link
                  to={servicePath(service.slug)}
                  className="group flex items-center gap-3.5 rounded-box border border-line bg-paper p-6 transition-colors hover:border-line-strong"
                >
                  <IconBox icon={service.icon} tone={service.iconTone} size="sm" />
                  <span className="flex-1">
                    <strong className="block font-semibold">{service.title}</strong>
                    <span className="text-[15px] text-muted">{service.subtitle}</span>
                  </span>
                  <IconArrowRight
                    className="size-4.5 shrink-0 transition-transform group-hover:translate-x-[3px]"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </Section>
  );
}

/** Code d'incident communiqué au visiteur (à rappeler à l'équipe pour retrouver l'erreur). */
const createIncidentCode = () => `LP-500-${Date.now().toString(36).slice(-4).toUpperCase()}`;

export function ServerErrorView({ onRetry }: { onRetry?: () => void }) {
  const content = SYSTEM_PAGES_CONTENT.serverError;
  const settings = useSettingsOrDefaults();
  const phone = primaryPhone(settings);
  const email = primaryEmail(settings);
  const [incidentCode] = useState(createIncidentCode);

  return (
    <Section className="relative overflow-hidden" aria-labelledby="titre-erreur">
      <BrandSwoosh className="absolute -bottom-40 -left-40 size-[560px] opacity-14" />
      <Container className="relative">
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-6.5 text-center">
          <BigCode code={content.code} />
          <h1
            id="titre-erreur"
            className="text-[clamp(2.125rem,3.6vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.036em] max-[359px]:text-[min(2.125rem,9.3vw)]"
          >
            {content.title}
          </h1>
          <Lead className="max-w-[600px]">{content.lead}</Lead>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" icon={<IconRetry />} onClick={onRetry ?? (() => window.location.reload())}>
              Réessayer
            </Button>
            <ButtonLink to={ROUTES.home} variant="outline" size="lg" icon={<IconHome />}>
              Retour à l’accueil
            </ButtonLink>
          </div>
          <p className="inline-flex items-center gap-3 rounded-full border border-line bg-white px-4.5 py-2.5 text-[15px]">
            <IconServerError className="size-4" aria-hidden />
            Code incident <strong className="font-mono tracking-[0.04em]">{incidentCode}</strong>
          </p>
        </div>
        <div className="mx-auto mt-16 flex max-w-[820px] flex-wrap items-center gap-6 rounded-card border border-line bg-paper px-6 py-7 md:px-8">
          <IconBox icon="phone" className="size-14" />
          <div className="flex min-w-[260px] flex-1 flex-col gap-2">
            <h2 className="text-[19px] font-semibold tracking-[-0.01em]">{content.urgentTitle}</h2>
            <p className="text-[15px] text-muted">{content.urgentText}</p>
          </div>
          <div className="flex flex-col gap-2.5">
            {phone ? (
              <TextAnchor href={phoneHref(phone)} icon={<IconPhone />}>
                {phone}
              </TextAnchor>
            ) : null}
            {email ? (
              <TextAnchor href={`mailto:${email}`} icon={<IconEmail />} className="break-all">
                {email}
              </TextAnchor>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
