import type { Icon as PhosphorGlyph, IconProps as PhosphorIconProps } from '@phosphor-icons/react';
import { createContext, useContext, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Système d'icônes du site (docs/icones.md).
 *
 * Bibliothèque unique : Phosphor Icons (licence MIT). Ses terminaisons arrondies prolongent les
 * boutons « pill » et les grands rayons du site, et ses graisses (regular, bold, duotone, fill)
 * permettent une vraie hiérarchie sans mélanger plusieurs familles.
 *
 * Chaque icône est nommée d'après sa FONCTION (IconDelete, IconArrival…) et non d'après son
 * dessin : le choix du dessin se fait une seule fois, pour tout le site, dans icons.tsx (site public
 * et éléments partagés) et icons-admin.tsx (back-office). Aucun autre fichier n'importe la
 * bibliothèque directement (règle ESLint « no-restricted-imports »).
 *
 * Règles appliquées automatiquement :
 * - décoratives par défaut (aria-hidden) ; avec un aria-label, l'icône devient une image nommée ;
 * - taille fixée par les classes (size-4, [&_svg]:size-4…), 1em sinon ; jamais tassée dans un flex ;
 * - graisse optique : « bold » jusqu'à 20 px (trait de 1,3 à 1,9 px, accordé aux libellés semi-gras),
 *   « regular » à partir de 24 px ; « duotone » pour les icônes d'identité, « fill » pour les états actifs.
 * - échelle : 14, 16, 18 px pour l'interface, 24, 28, 32 px et plus pour les icônes d'identité et d'état.
 */

/** Graisses retenues par le système : « thin » et « light » ne sont jamais utilisées (et retirées du
 * paquet de production, voir vite.config.ts). */
export type IconWeight = 'regular' | 'bold' | 'duotone' | 'fill';

/** Propriétés communes : la taille passe par les classes, la couleur par « currentColor ». */
export type IconProps = Omit<PhosphorIconProps, 'size' | 'color' | 'alt' | 'weight'> & {
  weight?: IconWeight;
};

/** Composant d'icône du système (utilisable dans les registres et les tables de correspondance). */
export type AppIcon = (props: IconProps) => ReactElement;

/** Graisse imposée par un composant parent (bouton, étiquette…) à toutes ses icônes. */
const IconWeightContext = createContext<IconWeight | undefined>(undefined);

interface IconWeightScopeProps {
  weight: IconWeight;
  children: ReactNode;
}

/**
 * Fixe la graisse des icônes d'un sous-arbre. Le composant qui dimensionne ses icônes
 * (« [&_svg]:size-4 ») décide aussi de leur graisse : « bold » jusqu'à 20 px.
 */
export function IconWeightScope({ weight, children }: IconWeightScopeProps) {
  return <IconWeightContext value={weight}>{children}</IconWeightContext>;
}

/**
 * Tailles de 20 px et moins (ou relatives au texte, jusqu'à 1,29 em) : le dessin « bold » y garde
 * un trait lisible (≈ 1,5 px).
 */
const SMALL_SIZE = /(?:^|\s)size-(?:2\.5|3|3\.5|4|4\.5|5|\[1(?:\.[0-2]\d*)?em\])(?:\s|$)/;

/**
 * Crée une icône du système à partir d’un dessin Phosphor (réservé aux modules d’icônes).
 * Sans effet de bord : une icône jamais utilisée est retirée du paquet de production.
 */
/* #__NO_SIDE_EFFECTS__ */
export function defineIcon(Glyph: PhosphorGlyph, name: string): AppIcon {
  function SystemIcon({ weight, className, ...props }: IconProps) {
    const scoped = useContext(IconWeightContext);
    const resolved = weight ?? scoped ?? (className && SMALL_SIZE.test(className) ? 'bold' : 'regular');
    const labelled = props['aria-label'] !== undefined;
    return (
      <Glyph
        size="1em"
        aria-hidden={labelled ? undefined : true}
        role={labelled ? 'img' : undefined}
        focusable="false"
        data-icon={name}
        data-weight={resolved}
        className={cn('shrink-0', className)}
        weight={resolved}
        {...props}
      />
    );
  }
  SystemIcon.displayName = `Icon(${name})`;
  return SystemIcon;
}
