// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { IconName } from '@/types';
import { Icon } from './Icon';
import { iconRegistry } from './icon-registry';
import { IconArrowRight, IconCheck, IconMedical, IconWeightScope } from './icons';

const svgOf = (container: HTMLElement) => container.querySelector('svg') as SVGSVGElement;

describe('système d’icônes', () => {
  it('rend une icône décorative par défaut, masquée aux lecteurs d’écran', () => {
    const { container } = render(<IconArrowRight className="size-4" />);
    const svg = svgOf(container);
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
    expect(svg).toHaveAttribute('data-icon', 'arrow-right');
  });

  it('devient une image nommée quand elle porte un libellé', () => {
    const { container } = render(<IconCheck aria-label="Oui" />);
    const svg = svgOf(container);
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', 'Oui');
    expect(svg).not.toHaveAttribute('aria-hidden');
  });

  it('choisit la graisse selon la taille : « bold » jusqu’à 20 px, « regular » au-delà', () => {
    const small = render(<IconCheck className="size-4" />);
    expect(svgOf(small.container)).toHaveAttribute('data-weight', 'bold');
    const relative = render(<IconArrowRight className="size-[1.1em]" />);
    expect(svgOf(relative.container)).toHaveAttribute('data-weight', 'bold');
    const large = render(<IconMedical className="size-8" />);
    expect(svgOf(large.container)).toHaveAttribute('data-weight', 'regular');
  });

  it('applique la graisse imposée par le composant parent, sauf graisse explicite', () => {
    const { container } = render(
      <IconWeightScope weight="duotone">
        <IconMedical className="size-4" />
        <IconCheck weight="fill" />
      </IconWeightScope>,
    );
    const [scoped, explicit] = container.querySelectorAll('svg');
    expect(scoped).toHaveAttribute('data-weight', 'duotone');
    expect(explicit).toHaveAttribute('data-weight', 'fill');
  });

  it('associe chaque nom des contenus à une icône du système', () => {
    for (const [name, component] of Object.entries(iconRegistry)) {
      const { container, unmount } = render(<Icon name={name as IconName} />);
      expect(typeof component, name).toBe('function');
      expect(svgOf(container), name).not.toBeNull();
      unmount();
    }
  });

  it('n’affiche rien pour un nom inconnu venu des données', () => {
    const { container } = render(<Icon name={'ancien-nom' as IconName} />);
    expect(container).toBeEmptyDOMElement();
  });
});
