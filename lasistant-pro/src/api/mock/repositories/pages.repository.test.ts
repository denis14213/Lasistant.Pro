import { describe, expect, it } from 'vitest';
import { PAGE_DEFAULTS, PAGE_KEYS, type PageContents } from '@/content/pages';
import { readTable } from '../database';
import { pagesRepository } from './pages.repository';

describe('pagesRepository (base simulée)', () => {
  it('renvoie les contenus d’origine de toutes les pages tant que rien n’est enregistré', async () => {
    const contents = await pagesRepository.getAll();
    expect(Object.keys(contents).sort()).toEqual([...PAGE_KEYS].sort());
    expect(contents.accueil).toEqual(PAGE_DEFAULTS.accueil);

    const records = await pagesRepository.list();
    expect(records).toHaveLength(PAGE_KEYS.length);
    expect(records.every((record) => record.updatedAt === null && record.updatedBy === null)).toBe(true);
  });

  it('enregistre une page, la date, l’auteur et consigne la modification au journal', async () => {
    const home = PAGE_DEFAULTS.accueil;
    // Les contenus d'origine sont typés au mot près : un texte modifié se convertit explicitement.
    const edited = {
      ...home,
      hero: { ...home.hero, eyebrow: 'Nouvelle accroche' },
    } as unknown as PageContents['accueil'];
    await pagesRepository.update('accueil', edited, 'Responsable éditoriale');

    const contents = await pagesRepository.getAll();
    expect(contents.accueil.hero.eyebrow as string).toBe('Nouvelle accroche');
    // Les autres textes et les autres pages restent inchangés.
    expect(contents.accueil.hero.lead).toBe(home.hero.lead);
    expect(contents['a-propos']).toEqual(PAGE_DEFAULTS['a-propos']);

    const record = (await pagesRepository.list()).find((item) => item.key === 'accueil');
    expect(record?.updatedBy).toBe('Responsable éditoriale');
    expect(record?.updatedAt).not.toBeNull();
    expect(readTable('activity').at(-1)?.label).toBe('Contenu de la page « accueil » modifié');
  });

  it('complète une page enregistrée avant l’ajout d’une rubrique avec le contenu d’origine', async () => {
    const { trust: _trust, ...withoutTrust } = PAGE_DEFAULTS.accueil;
    await pagesRepository.update('accueil', withoutTrust as PageContents['accueil'], 'Équipe');

    const contents = await pagesRepository.getAll();
    expect(contents.accueil.trust).toEqual(PAGE_DEFAULTS.accueil.trust);
  });
});
