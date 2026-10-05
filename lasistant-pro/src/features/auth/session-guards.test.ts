import { describe, expect, it } from 'vitest';
import { ROUTES } from '@/config/routes';
import { loginPathFor, REDIRECT_PARAM, safeRedirect } from './session-guards';

describe('redirections du back-office', () => {
  it('ramène à la page demandée après la connexion', () => {
    expect(loginPathFor('/admin/demandes?statut=nouveau')).toBe(
      `${ROUTES.admin.login}?${REDIRECT_PARAM}=%2Fadmin%2Fdemandes%3Fstatut%3Dnouveau`,
    );
  });

  it('n’autorise que des pages internes du back-office', () => {
    expect(safeRedirect('/admin/agenda')).toBe('/admin/agenda');
    expect(safeRedirect('https://site-malveillant.example/admin')).toBe(ROUTES.admin.dashboard);
    expect(safeRedirect('//site-malveillant.example')).toBe(ROUTES.admin.dashboard);
    expect(safeRedirect('/espace-infos')).toBe(ROUTES.admin.dashboard);
    expect(safeRedirect(null)).toBe(ROUTES.admin.dashboard);
  });
});
