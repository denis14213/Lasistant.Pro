/**
 * Détection des fautes de frappe dans les adresses e-mail (« gmial.com » → « gmail.com »).
 * Aide le visiteur sans jamais bloquer l'envoi : il reste libre de garder son adresse.
 */

const COMMON_DOMAINS = [
  'gmail.com',
  'hotmail.com',
  'hotmail.fr',
  'outlook.com',
  'outlook.fr',
  'live.fr',
  'yahoo.com',
  'yahoo.fr',
  'icloud.com',
  'orange.fr',
  'laposte.net',
  'free.fr',
  'topnet.tn',
  'gnet.tn',
];

/** Distance de Levenshtein (nombre minimal de modifications entre deux chaînes). */
function distance(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0] ?? 0;
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const temp = previous[j] ?? 0;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      previous[j] = Math.min((previous[j] ?? 0) + 1, (previous[j - 1] ?? 0) + 1, diagonal + cost);
      diagonal = temp;
    }
  }
  return previous[b.length] ?? 0;
}

/** Propose une adresse corrigée si le domaine ressemble fortement à un domaine courant. */
export function suggestEmailCorrection(email: string): string | null {
  const [local, domain] = email.trim().toLowerCase().split('@');
  if (!local || !domain || COMMON_DOMAINS.includes(domain)) return null;
  let best: { domain: string; score: number } | null = null;
  for (const candidate of COMMON_DOMAINS) {
    const score = distance(domain, candidate);
    if (score > 0 && score <= 2 && (!best || score < best.score)) best = { domain: candidate, score };
  }
  return best ? `${local}@${best.domain}` : null;
}
