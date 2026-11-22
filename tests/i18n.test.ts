import { describe, expect, it } from 'vitest';
import { changerLangue, changerMode, lireEtat } from '../src/etat';
import { clesManquantes, t, tListe } from '../src/i18n';
import { MISSIONS } from '../src/contenu/missions';
import { question } from '../src/ui/debrief';
import { etoilesIntro1 } from '../src/missions/intro1';
import { etoilesMicro4 } from '../src/missions/micro4';
import { etoilesStats3 } from '../src/missions/stats3';

// Petit remplaçant du DOM pour les fonctions qui touchent document.
(globalThis as any).document ??= { documentElement: {}, body: { dataset: {} } };

describe('Traductions', () => {
  it('chaque clé existe en français et en anglais', () => {
    expect(clesManquantes()).toEqual([]);
  });

  it('chaque mission a un titre et une notion dans les deux langues', () => {
    for (const l of ['fr', 'en'] as const) {
      changerLangue(l);
      for (const m of MISSIONS) {
        expect(t(`mission.${m.id}.titre`)).not.toContain('mission.');
        expect(t(`mission.${m.id}.notion`)).not.toContain('mission.');
      }
    }
  });

  it('les quiz ont 4 réponses dans chaque langue, et la bonne est retrouvée après mélange', () => {
    for (const l of ['fr', 'en'] as const) {
      changerLangue(l);
      for (const q of ['intro1.q1', 'intro1.q2', 'micro4.q1', 'micro4.q2', 'stats3.q1', 'stats3.q2']) {
        const brut = tListe(`${q}.c`);
        expect(brut).toHaveLength(4);
        const melangee = question(q);
        expect(melangee.choix[melangee.bonne]).toBe(brut[0]);
      }
    }
    changerLangue('fr');
  });

  it('remplace les variables', () => {
    changerLangue('en');
    expect(t('barre.etape', { a: 1, b: 2 })).toBe('Step 1 / 2');
    changerLangue('fr');
    expect(t('barre.etape', { a: 1, b: 2 })).toBe('Étape 1 / 2');
  });
});

describe('Version grand public : étoiles', () => {
  it('se règle sur la version choisie', () => {
    changerMode('public');
    expect(lireEtat().mode).toBe('public');
    changerMode('edu');
  });

  it('donne 1 à 3 étoiles selon la performance', () => {
    expect(etoilesIntro1(340, 340)).toBe(3);
    expect(etoilesIntro1(280, 340)).toBe(2);
    expect(etoilesIntro1(200, 340)).toBe(1);
    expect(etoilesMicro4(9.5, 10.5)).toBe(3);
    expect(etoilesMicro4(7, 10.5)).toBe(2);
    expect(etoilesMicro4(0, 10.5)).toBe(1);
    expect([1, 2, 3, 4].map(etoilesStats3)).toEqual([3, 2, 1, 1]);
  });
});
