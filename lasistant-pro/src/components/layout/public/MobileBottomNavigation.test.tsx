// @vitest-environment jsdom
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { MobileBottomNavigation } from './MobileBottomNavigation';

describe('barre d’onglets mobile', () => {
  it('propose les cinq onglets, la réservation au centre', () => {
    renderWithProviders(<MobileBottomNavigation />);
    const nav = screen.getByRole('navigation', { name: 'Navigation principale' });
    const links = within(nav).getAllByRole('link');
    const labels = ['Accueil', 'Services', 'Réserver', 'Espace infos', 'Contact'];
    expect(links).toHaveLength(labels.length);
    labels.forEach((name, index) => expect(links[index]).toBe(within(nav).getByRole('link', { name })));
    expect(within(nav).getByRole('link', { name: 'Réserver' })).toHaveAttribute('href', '/reservation');
  });

  it('signale l’onglet de la rubrique en cours, y compris sur ses sous-pages', () => {
    renderWithProviders(<MobileBottomNavigation />, { route: '/services/assistance-medicale' });
    const nav = screen.getByRole('navigation', { name: 'Navigation principale' });
    expect(within(nav).getByRole('link', { name: 'Services' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Accueil' })).not.toHaveAttribute('aria-current');
    // Onglet actif : dessin plein.
    const icon = within(nav).getByRole('link', { name: 'Services' }).querySelector('svg');
    expect(icon).toHaveAttribute('data-weight', 'fill');
  });
});
