import { describe, expect, it } from 'vitest';
import {
  BUDGET_PREMIER_JOUR, PRODUITS, beneficeTotal, coutOpportunite, coutTotal, demandesNonServies, meilleurPanier, peutAjouter,
} from '../src/economie/premierJour';
import { CLIENTS_COMPTOIR, PATIENCE_INITIALE, bilan, reagir, surplusConsommateur, surplusProducteur } from '../src/economie/comptoir';
import { FREQUENTATION, HORAIRES, classeModale, clientsServis, effectifTotal, frequence, meilleurHoraire } from '../src/economie/histogramme';
import { MONNAIES, formaterPrix, villeParDefaut } from '../src/economie/monnaie';

describe('Intro 1 — Le premier jour (rareté et coût d’opportunité)', () => {
  it('le budget ne permet pas de tout stocker : c’est la rareté', () => {
    expect(coutTotal(PRODUITS.map((p) => p.id))).toBeGreaterThan(BUDGET_PREMIER_JOUR);
  });

  it('refuse un produit qui ferait dépasser le budget', () => {
    expect(peutAjouter(['lait', 'semoule', 'huile'], 'cafe')).toBe(false); // 410 + 110 > 500
    expect(peutAjouter(['lait', 'semoule', 'huile'], 'bonbons')).toBe(true); // 410 + 60
  });

  it('trouve le meilleur panier possible dans le budget', () => {
    const best = meilleurPanier();
    expect(coutTotal(best.ids)).toBeLessThanOrEqual(BUDGET_PREMIER_JOUR);
    expect(best.benefice).toBe(beneficeTotal(best.ids));
    expect(best.benefice).toBe(340); // pain, lait, café, bonbons, jus : 480 de coût
  });

  it('calcule le coût d’opportunité comme la meilleure option abandonnée', () => {
    const co = coutOpportunite(['pain', 'lait', 'semoule', 'bonbons']);
    expect(co?.produit.id).toBe('cafe');
    expect(co?.valeur).toBe(85);
    expect(coutOpportunite(PRODUITS.map((p) => p.id))).toBeNull();
  });

  it('liste les clients repartis sans leur produit', () => {
    expect(demandesNonServies(['pain', 'lait', 'cafe', 'jus', 'bonbons', 'semoule'])).toMatchObject([{ client: 'Yacine', produit: 'Huile', phrase: 'voulait de l’huile, mais tu n’en avais pas.' }]);
  });
});

describe('Micro 4 — Le juste prix (surplus)', () => {
  const karim = CLIENTS_COMPTOIR[0];

  it('vend si le prix ne dépasse pas la disposition à payer', () => {
    expect(reagir(karim, 8.5, PATIENCE_INITIALE).issue).toBe('vente');
    expect(reagir(karim, 5, PATIENCE_INITIALE).visage).toBe('content');
  });

  it('hésite juste au-dessus, refuse bien au-dessus, part quand la patience est épuisée', () => {
    expect(reagir(karim, 9.5, 3)).toMatchObject({ issue: 'hesite', patienceRestante: 2 });
    expect(reagir(karim, 12, 3)).toMatchObject({ issue: 'refus', patienceRestante: 2 });
    expect(reagir(karim, 12, 1)).toMatchObject({ issue: 'depart', patienceRestante: 0 });
  });

  it('partage le gain de l’échange entre consommateur et producteur', () => {
    expect(surplusConsommateur(karim, 7)).toBeCloseTo(1.5);
    expect(surplusProducteur(karim, 7)).toBeCloseTo(3);
    const b = bilan([{ clientId: 'karim', prix: 7 }, { clientId: 'benali', prix: null }]);
    expect(b.total).toBeCloseTo(4.5); // = disposition à payer − coût, quel que soit le prix
    expect(b.lignes[1].producteur).toBe(0);
  });
});

describe('Stats 3 — À quelle heure ouvrir ? (histogramme, classe modale)', () => {
  it('compte 337 passages sur la semaine', () => {
    expect(effectifTotal()).toBe(337);
    expect(FREQUENTATION).toHaveLength(14);
  });

  it('trouve la classe modale 18 h – 19 h', () => {
    expect(classeModale()).toEqual({ debut: 18, fin: 19, effectif: 52 });
    expect(frequence(classeModale())).toBe(15);
  });

  it('le meilleur horaire de 8 heures suit les deux pics', () => {
    expect(HORAIRES.map((h) => clientsServis(h))).toEqual([178, 165, 246]);
    expect(meilleurHoraire().id).toBe('deux-pics');
  });
});

describe('Monnaie et ville de départ', () => {
  it('propose la ville selon le fuseau horaire', () => {
    expect(villeParDefaut('Africa/Algiers').id).toBe('alger');
    expect(villeParDefaut('Europe/Paris').id).toBe('nanterre');
    expect(villeParDefaut('Asia/Tokyo').id).toBe('alger');
  });

  it('affiche les prix dans la monnaie locale', () => {
    expect(formaterPrix(8.5, MONNAIES.EUR)).toBe('8,50 €');
    expect(formaterPrix(8.5, MONNAIES.DZD)).toBe('1 700 DA');
  });
});
