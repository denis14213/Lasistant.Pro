import type { ReactNode } from 'react';
import { IconEmail, IconFacebook, IconPhone, IconWeightScope } from '@/components/ui/icons';

import { activeEntries, facebookHref, useSiteSettings } from '@/features/settings/useSiteSettings';
import { phoneHref } from '@/lib/format';

/**
 * Coordonnées sur fond sombre (bloc « Parlons de votre besoin »).
 * Lues dans les réglages : une modification du back-office s'y répercute aussitôt.
 */
export function ContactChannels() {
  const settings = useSiteSettings();
  const phones = activeEntries(settings.phones);
  const emails = activeEntries(settings.emails);

  return (
    <ul className="flex flex-col">
      {phones.length > 0 ? (
        <ChannelRow icon={<IconPhone />} label="Téléphone">
          {phones.map((phone) => (
            <span key={phone.id} className="block">
              <a
                href={phoneHref(phone.value)}
                className="whitespace-nowrap transition-colors hover:text-brand-pale"
              >
                {phone.value}
              </a>
              {phone.label ? <span className="ml-2 text-[13px] opacity-70">{phone.label}</span> : null}
            </span>
          ))}
        </ChannelRow>
      ) : null}
      {emails.map((email) => (
        <ChannelRow key={email.id} icon={<IconEmail />} label="E-mail">
          <a href={`mailto:${email.value}`} className="break-all transition-colors hover:text-brand-pale">
            {email.value}
          </a>
        </ChannelRow>
      ))}
      <ChannelRow icon={<IconFacebook />} label="Facebook">
        <a
          href={facebookHref(settings)}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-brand-pale"
        >
          {settings.facebook.label}
          <span className="sr-only"> (nouvelle fenêtre)</span>
        </a>
      </ChannelRow>
    </ul>
  );
}

function ChannelRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-4 border-b border-white/12 py-[15px] text-base text-white">
      <span
        className="flex size-[42px] shrink-0 items-center justify-center rounded-full bg-white/9 [&_svg]:size-4.5"
        aria-hidden
      >
        <IconWeightScope weight="bold">{icon}</IconWeightScope>
      </span>
      <span className="min-w-0">
        <small className="block text-[12.5px] tracking-[0.02em] text-on-plum">{label}</small>
        {children}
      </span>
    </li>
  );
}
