import { WhatsAppLogo } from '@/components/ui';
import { useSiteSettings } from '@/features/settings/useSiteSettings';
import { trackConversion } from '@/lib/analytics';
import { whatsappHref } from '@/lib/format';

/** Message pré-rempli : le visiteur n'a plus qu'à préciser sa demande. */
const WELCOME_MESSAGE = 'Bonjour LASISTANT.PRO, je souhaite des informations sur vos services.';

/**
 * Bouton flottant WhatsApp, présent sur toutes les pages du site : il ouvre une conversation
 * avec l'agence (application WhatsApp sur téléphone, WhatsApp Web sur ordinateur).
 * Affiché lorsque l'option est activée et le numéro renseigné (Coordonnées & réglages).
 *
 * Sur mobile, il flotte au-dessus de la barre d'onglets et respecte les zones réservées
 * de l'appareil (barre de gestes, encoche) ; la mention au survol n'existe que sur ordinateur.
 */
export function WhatsAppButton() {
  const settings = useSiteSettings();
  const number = settings.whatsapp.enabled ? settings.whatsapp.number : null;
  if (!number) return null;

  return (
    <a
      href={whatsappHref(number, WELCOME_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackConversion('whatsapp')}
      aria-label="Écrire à LASISTANT.PRO sur WhatsApp (nouvelle fenêtre)"
      className="group fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(var(--mobile-nav-height)+16px)] z-[105] flex size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-[0_14px_30px_-10px_rgb(20_18_24/0.45)] ring-4 ring-white/70 transition-[transform,background-color] duration-200 hover:scale-105 hover:bg-whatsapp-dark focus-visible:scale-105 motion-reduce:transition-none md:right-6 md:bottom-[max(1.5rem,env(safe-area-inset-bottom))] md:size-15 print:hidden"
    >
      <WhatsAppLogo className="size-7 md:size-8" />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-full mr-3 hidden -translate-y-1/2 translate-x-1 rounded-full bg-night px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white opacity-0 shadow-raised transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 md:block"
      >
        Écrivez-nous sur WhatsApp
      </span>
    </a>
  );
}
