// @vitest-environment jsdom
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ROUTES } from '@/config/routes';
import { DEMO_PASSWORD, DEMO_TWO_FACTOR_CODE } from '@/content/demo/team';
import { renderApp } from '@/test/render';

describe('navigation de l’application', () => {
  it('affiche la page d’accueil', async () => {
    renderApp(ROUTES.home);
    expect(
      await screen.findByRole('heading', { level: 1, name: /Soutien médical & hébergement en Tunisie/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Aller au contenu/ })).toBeInTheDocument();
  });

  it('affiche la page « introuvable » pour une adresse inconnue', async () => {
    renderApp('/adresse-inexistante');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Cette page est introuvable' }),
    ).toBeInTheDocument();
  });

  it('protège le back-office puis ouvre la page demandée après la connexion', async () => {
    const user = userEvent.setup();
    const { router } = renderApp(ROUTES.admin.requests);

    // Sans session, retour à la connexion avec la page à rouvrir ensuite.
    expect(await screen.findByRole('heading', { name: 'Connexion' })).toBeInTheDocument();
    expect(router.state.location.search).toBe('?redirection=%2Fadmin%2Fdemandes');

    await user.type(screen.getByLabelText('Adresse e-mail'), 'operateur1@lasistant.pro');
    await user.type(screen.getByLabelText('Mot de passe'), DEMO_PASSWORD);
    await user.click(screen.getByRole('button', { name: /Se connecter/ }));

    expect(await screen.findByRole('heading', { name: 'Vérification en deux étapes' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Chiffre 1 sur 6'), DEMO_TWO_FACTOR_CODE);
    await user.click(screen.getByRole('button', { name: /Vérifier/ }));

    await waitFor(() => expect(router.state.location.pathname).toBe(ROUTES.admin.requests));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Demandes & réservations' }),
    ).toBeInTheDocument();
  });

  it('refuse une page non autorisée pour le rôle connecté', async () => {
    const user = userEvent.setup();
    renderApp(ROUTES.admin.users);
    await user.type(await screen.findByLabelText('Adresse e-mail'), 'contenus@lasistant.pro');
    await user.type(screen.getByLabelText('Mot de passe'), DEMO_PASSWORD);
    await user.click(screen.getByRole('button', { name: /Se connecter/ }));
    await user.type(await screen.findByLabelText('Chiffre 1 sur 6'), DEMO_TWO_FACTOR_CODE);
    await user.click(screen.getByRole('button', { name: /Vérifier/ }));

    expect(await screen.findByRole('heading', { name: 'Accès refusé' })).toBeInTheDocument();
  });
});
