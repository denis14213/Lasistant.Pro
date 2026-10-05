// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { settingsRepository } from '@/api';
import { renderWithProviders } from '@/test/render';
import { WhatsAppButton } from './WhatsAppButton';

describe('bouton flottant WhatsApp', () => {
  it('ouvre une conversation avec l’agence, message pré-rempli', async () => {
    renderWithProviders(<WhatsAppButton />);
    const link = await screen.findByRole('link', { name: /WhatsApp/ });
    const url = new URL(link.getAttribute('href') ?? '');
    expect(url.origin + url.pathname).toBe('https://wa.me/21654479391');
    expect(url.searchParams.get('text')).toMatch(/^Bonjour LASISTANT\.PRO/);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('disparaît quand l’option est désactivée dans le back-office', async () => {
    const settings = await settingsRepository.get();
    await settingsRepository.update({ whatsapp: { ...settings.whatsapp, enabled: false } }, 'Test');
    renderWithProviders(<WhatsAppButton />);
    // Une fois les réglages chargés, le composant ne rend rien.
    await waitFor(() => expect(screen.queryByText('Chargement…')).not.toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /WhatsApp/ })).not.toBeInTheDocument();
  });
});
