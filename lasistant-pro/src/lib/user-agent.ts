import type { AccountSession } from '@/types';

/**
 * Description lisible de l'appareil à partir de l'agent utilisateur du navigateur
 * (« Sessions actives » de « Mon compte »). Volontairement simple : seul l'affichage en dépend.
 */
export function describeUserAgent(userAgent: string): Pick<AccountSession, 'device' | 'browser'> {
  const device = /iPad|Tablet/i.test(userAgent)
    ? 'tablette'
    : /Mobi|Android|iPhone/i.test(userAgent)
      ? 'telephone'
      : 'ordinateur';
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /OPR\//.test(userAgent)
      ? 'Opera'
      : /Firefox\//.test(userAgent)
        ? 'Firefox'
        : /Chrome\//.test(userAgent)
          ? 'Chrome'
          : /Safari\//.test(userAgent)
            ? 'Safari'
            : 'Navigateur';
  return { device, browser };
}

export const DEVICE_LABELS: Record<AccountSession['device'], string> = {
  ordinateur: 'Ordinateur',
  telephone: 'Téléphone',
  tablette: 'Tablette',
};
