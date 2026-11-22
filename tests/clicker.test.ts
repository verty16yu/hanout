import { describe, expect, it } from 'vitest';
import {
  ABSENCE_MAX_S,
  AMELIORATIONS,
  MARGE_DE_BASE,
  acheter,
  avancer,
  boutiqueNeuve,
  cout,
  delaiRecuperation,
  gainCumule,
  gainMarginal,
  gainParClient,
  gainsAbsence,
  multiplicateurMissions,
  revenuParSeconde,
  servir,
  trouverAmelioration,
} from '../src/economie/clicker';

const cousin = trouverAmelioration('cousin')!;
const frigo = trouverAmelioration('frigo')!;

describe('Mon hanout (jeu incrémental)', () => {
  it('servir un client rapporte la marge de base, multipliée par le bonus des missions', () => {
    const e = servir(boutiqueNeuve(0));
    expect(e.caisse).toBeCloseTo(MARGE_DE_BASE);
    expect(e.clients).toBe(1);
    expect(servir(boutiqueNeuve(0), multiplicateurMissions(2)).caisse).toBeCloseTo(MARGE_DE_BASE * 1.5);
  });

  it('le prix monte de 15 % à chaque exemplaire', () => {
    expect(cout(frigo, 0)).toBe(60);
    expect(cout(frigo, 1)).toBe(69);
    expect(cout(frigo, 2)).toBeCloseTo(79.35);
  });

  it("on ne peut pas acheter sans l'argent, et l'achat vide la caisse du bon montant", () => {
    const vide = boutiqueNeuve(0);
    expect(acheter(vide, 'etagere')).toBeNull();
    const riche = { ...vide, caisse: 10 };
    const apres = acheter(riche, 'etagere')!;
    expect(apres.caisse).toBeCloseTo(5);
    expect(apres.niveaux.etagere).toBe(1);
    expect(gainParClient(apres)).toBeCloseTo(MARGE_DE_BASE + 0.25);
    expect(acheter(riche, 'inconnue')).toBeNull();
  });

  it('les cousins ont des rendements décroissants, les frigos non', () => {
    expect(gainMarginal(cousin, 1)).toBeLessThan(gainMarginal(cousin, 0));
    expect(gainMarginal(frigo, 3)).toBe(gainMarginal(frigo, 0));
    // le gain cumulé est bien la somme des gains marginaux
    const somme = [0, 1, 2, 3].reduce((s, n) => s + gainMarginal(cousin, n), 0);
    expect(gainCumule(cousin, 4)).toBeCloseTo(somme);
  });

  it('la boutique gagne toute seule avec le temps', () => {
    const e = { ...boutiqueNeuve(0), niveaux: { frigo: 2 } };
    expect(revenuParSeconde(e)).toBeCloseTo(2);
    expect(avancer(e, 10).caisse).toBeCloseTo(20);
    expect(avancer(e, -5)).toBe(e);
  });

  it("pendant l'absence : moitié régime, 8 heures au plus", () => {
    const e = { ...boutiqueNeuve(0), niveaux: { frigo: 1 } };
    const uneMinute = gainsAbsence(e, 60_000);
    expect(uneMinute.gain).toBeCloseTo(30);
    expect(uneMinute.etat.vu).toBe(60_000);
    const troisJours = gainsAbsence(e, 3 * 24 * 3600 * 1000);
    expect(troisJours.secondes).toBe(ABSENCE_MAX_S);
    expect(gainsAbsence(boutiqueNeuve(0), 60_000).gain).toBe(0);
  });

  it('le délai de récupération est le prix divisé par le gain du prochain exemplaire', () => {
    expect(delaiRecuperation(frigo, 0)).toBeCloseTo(60);
    expect(delaiRecuperation(cousin, 2)).toBeGreaterThan(delaiRecuperation(cousin, 0));
    for (const a of AMELIORATIONS) expect(delaiRecuperation(a, 0)).toBeLessThan(200);
  });
});
