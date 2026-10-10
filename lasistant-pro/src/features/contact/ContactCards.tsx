import type { ReactNode } from 'react';
import { FeatureIcon, TextAnchor, ToValidate } from '@/components/ui';
import { IconFacebook } from '@/components/ui/icons';
import { activeEntries, facebookHref, useSiteSettings } from '@/features/settings/useSiteSettings';
import { phoneHref } from '@/lib/format';
import type { IconName } from '@/types';

/** Coordonnées de la page Contact, lues dans les réglages du site. */
export function ContactCards() {
  const settings = useSiteSettings();
  const { address } = settings;
  const cityLine = [address.postalCode, address.city].filter(Boolean).join(' ');

  return (
    <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      <ContactCard icon="phone" label="Téléphone">
        {activeEntries(settings.phones).map((phone) => (
          <a
            key={phone.id}
            href={phoneHref(phone.value)}
            className="flex flex-wrap items-baseline gap-x-2 font-semibold hover:text-brand"
          >
            <span className="whitespace-nowrap">{phone.value}</span>
            {phone.label ? <span className="text-[13px] font-normal text-muted">{phone.label}</span> : null}
          </a>
        ))}
      </ContactCard>
      <ContactCard icon="email" label="E-mail">
        {activeEntries(settings.emails).map((email) => (
          <a
            key={email.id}
            href={`mailto:${email.value}`}
            className="font-semibold break-all hover:text-brand"
          >
            {email.value}
          </a>
        ))}
      </ContactCard>
      <ContactCard icon="address" label="Adresse">
        <p className="font-semibold">
          {address.street}
          {address.validated && cityLine ? `, ${cityLine}` : ''}, {address.country}
        </p>
        {address.validated ? null : (
          <ToValidate className="w-fit text-[12.5px]">Code postal et ville à valider</ToValidate>
        )}
      </ContactCard>
      <ContactCard icon="clock" label="Horaires">
        {settings.openingHours ? (
          <p className="font-semibold">{settings.openingHours}</p>
        ) : (
          <ToValidate className="w-fit text-[12.5px]">Horaires d’ouverture à confirmer</ToValidate>
        )}
        <TextAnchor
          href={facebookHref(settings)}
          target="_blank"
          rel="noopener noreferrer"
          icon={<IconFacebook />}
          className="text-[15px]"
        >
          Facebook · {settings.facebook.label}
          <span className="sr-only"> (nouvelle fenêtre)</span>
        </TextAnchor>
      </ContactCard>
    </ul>
  );
}

interface ContactCardProps {
  icon: IconName;
  label: string;
  children: ReactNode;
}

/** Carte de coordonnées : une icône seule, dans la teinte de la marque, indique le canal. */
function ContactCard({ icon, label, children }: ContactCardProps) {
  return (
    <li className="flex flex-col gap-3 rounded-box border border-line bg-paper p-6">
      <FeatureIcon icon={icon} size="md" />
      <p className="mt-1.5 text-[13px] font-semibold tracking-[0.1em] text-muted uppercase">{label}</p>
      {children}
    </li>
  );
}
