// @vitest-environment jsdom
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { bookingsRepository } from '@/api';
import { renderWithProviders } from '@/test/render';
import { QuickRequestForm } from './QuickRequestForm';

describe('demande rapide', () => {
  it('signale les champs manquants sans rien envoyer', async () => {
    const user = userEvent.setup();
    const before = (await bookingsRepository.list()).length;
    renderWithProviders(<QuickRequestForm titleId="titre-demande" />);

    await user.click(await screen.findByRole('button', { name: /Envoyer ma demande/ }));

    // Le résumé des erreurs liste chaque champ à corriger.
    const summary = await screen.findByRole('alert');
    expect(within(summary).getByRole('link', { name: /Nom complet/ })).toHaveAttribute('href', '#fullName');
    expect(screen.getByLabelText(/Nom complet/)).toHaveAttribute('aria-invalid', 'true');
    expect(await bookingsRepository.list()).toHaveLength(before);
  });

  it('envoie une demande complète et affiche sa référence', async () => {
    const user = userEvent.setup();
    const before = (await bookingsRepository.list()).length;
    renderWithProviders(<QuickRequestForm titleId="titre-demande" />);

    await user.type(await screen.findByLabelText(/Nom complet/), 'Awa Koné');
    await user.type(screen.getByLabelText(/^Téléphone/), '+225 01 23 45 67 89');
    await user.type(screen.getByLabelText(/^E-mail/), 'awa.kone@exemple.com');
    await user.selectOptions(screen.getByLabelText(/Service souhaité/), 'assistance-medicale');
    await user.click(screen.getByRole('checkbox', { name: /J’accepte/ }));
    await user.click(screen.getByRole('button', { name: /Envoyer ma demande/ }));

    expect(await screen.findByRole('heading', { name: 'Demande envoyée' })).toBeInTheDocument();
    expect(screen.getByText(/^LP-\d{4}-\d{4}$/)).toBeInTheDocument();

    // La demande apparaît réellement dans le back-office (base de démonstration).
    const bookings = await bookingsRepository.list();
    expect(bookings).toHaveLength(before + 1);
    expect(bookings.find((booking) => booking.fullName === 'Awa Koné')).toMatchObject({
      source: 'demande_rapide',
      serviceId: 'assistance-medicale',
      status: 'nouveau',
    });
  });
});
