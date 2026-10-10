import { BrandSwoosh } from '@/components/brand/BrandSwoosh';
import { LogoMark } from '@/components/brand/Logo';
import { TextAnchor } from '@/components/ui';
import { IconEmail, IconPhone } from '@/components/ui/icons';
import { usePageContent } from '@/features/content/usePageContent';
import { activeEntries, primaryEmail, useSiteSettings } from '@/features/settings/useSiteSettings';
import { phoneHref } from '@/lib/format';

interface BookingSummaryProps {
  rows: ReadonlyArray<{ label: string; value: string }>;
}

/** Récapitulatif de la demande, mis à jour à chaque choix, et contacts d'aide. */
export function BookingSummary({ rows }: BookingSummaryProps) {
  const settings = useSiteSettings();
  const email = primaryEmail(settings);
  const { summary } = usePageContent('reservation');

  return (
    <aside
      aria-label="Récapitulatif de votre demande"
      className="flex flex-col gap-4 lg:sticky lg:top-[120px]"
    >
      <div className="relative flex flex-col gap-4.5 overflow-hidden rounded-card bg-plum p-7 text-white">
        <BrandSwoosh secondBlade="green" className="absolute -right-24 -bottom-30 size-[320px] opacity-35" />
        <div className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-white p-1.5">
            <LogoMark size={32} />
          </span>
          <div>
            <p className="font-semibold">{summary.title}</p>
            <p className="text-[13px] text-on-plum">{summary.subtitle}</p>
          </div>
        </div>
        <dl aria-live="polite" className="relative flex flex-col">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex justify-between gap-4 border-b border-white/12 py-3 text-[14.5px]"
            >
              <dt className="text-on-plum">{row.label}</dt>
              <dd className="text-right font-semibold">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="relative text-[13px] text-on-plum">{summary.note}</p>
      </div>
      <div className="flex flex-col gap-3 rounded-box border border-line bg-paper p-6">
        <p className="text-[15px] font-semibold">Besoin d’aide ?</p>
        {activeEntries(settings.phones).map((phone) => (
          <TextAnchor key={phone.id} href={phoneHref(phone.value)} icon={<IconPhone />}>
            {phone.value}
          </TextAnchor>
        ))}
        {email ? (
          <TextAnchor href={`mailto:${email}`} icon={<IconEmail />} className="break-all">
            {email}
          </TextAnchor>
        ) : null}
      </div>
    </aside>
  );
}
