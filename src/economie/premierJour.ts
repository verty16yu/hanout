// Mission Intro 1 « Le premier jour » — Introduction à l'économie, chapitre 2 :
// le problème économique (rareté, choix, coût d'opportunité).
// Le joueur a un budget limité et ne peut pas stocker tous les produits.

export interface Produit {
  id: string;
  nom: string;
  /** Coût du stock pour la semaine, en unités de base. */
  cout: number;
  /** Bénéfice attendu sur la semaine, en unités de base. */
  benefice: number;
  /** Le client qui viendra le demander s'il manque. */
  demandePar: string;
  /** Formes du nom pour les phrases : « du café », « au café ». */
  partitif: string;
  contracte: string;
  clientsPluriel?: boolean;
}

export const BUDGET_PREMIER_JOUR = 500;

export const PRODUITS: Produit[] = [
  { id: 'pain', nom: 'Pain', cout: 90, benefice: 70, demandePar: 'Karim', partitif: 'du pain', contracte: 'au pain' },
  { id: 'lait', nom: 'Lait', cout: 120, benefice: 80, demandePar: 'Mme Benali', partitif: 'du lait', contracte: 'au lait' },
  { id: 'cafe', nom: 'Café', cout: 110, benefice: 85, demandePar: 'Ammi Saïd', partitif: 'du café', contracte: 'au café' },
  { id: 'semoule', nom: 'Semoule', cout: 150, benefice: 60, demandePar: 'Mme Benali', partitif: 'de la semoule', contracte: 'à la semoule' },
  { id: 'huile', nom: 'Huile', cout: 140, benefice: 65, demandePar: 'Yacine', partitif: 'de l’huile', contracte: 'à l’huile' },
  { id: 'jus', nom: 'Jus', cout: 100, benefice: 55, demandePar: 'les enfants de l’école', partitif: 'du jus', contracte: 'au jus', clientsPluriel: true },
  { id: 'bonbons', nom: 'Bonbons', cout: 60, benefice: 50, demandePar: 'les enfants de l’école', partitif: 'des bonbons', contracte: 'aux bonbons', clientsPluriel: true },
];

export function trouverProduit(id: string): Produit {
  const p = PRODUITS.find((x) => x.id === id);
  if (!p) throw new Error(`Produit inconnu : ${id}`);
  return p;
}

export function coutTotal(ids: readonly string[]): number {
  return ids.reduce((s, id) => s + trouverProduit(id).cout, 0);
}

export function beneficeTotal(ids: readonly string[]): number {
  return ids.reduce((s, id) => s + trouverProduit(id).benefice, 0);
}

export function peutAjouter(ids: readonly string[], id: string, budget = BUDGET_PREMIER_JOUR): boolean {
  if (ids.includes(id)) return true;
  return coutTotal(ids) + trouverProduit(id).cout <= budget;
}

/** Le meilleur panier possible pour ce budget (recherche exhaustive : 2^7 combinaisons). */
export function meilleurPanier(budget = BUDGET_PREMIER_JOUR, produits: Produit[] = PRODUITS): { ids: string[]; benefice: number } {
  let meilleur = { ids: [] as string[], benefice: 0 };
  const n = produits.length;
  for (let masque = 0; masque < 1 << n; masque++) {
    const ids = produits.filter((_, i) => masque & (1 << i)).map((p) => p.id);
    if (coutTotal(ids) > budget) continue;
    const b = beneficeTotal(ids);
    if (b > meilleur.benefice) meilleur = { ids, benefice: b };
  }
  return meilleur;
}

/**
 * Coût d'opportunité du choix : la valeur de la meilleure option abandonnée,
 * ici le bénéfice du meilleur produit que le joueur n'a pas pris.
 */
export function coutOpportunite(ids: readonly string[]): { produit: Produit; valeur: number } | null {
  const laisses = PRODUITS.filter((p) => !ids.includes(p.id));
  if (laisses.length === 0) return null;
  const meilleur = laisses.reduce((a, b) => (b.benefice > a.benefice ? b : a));
  return { produit: meilleur, valeur: meilleur.benefice };
}

/** Les clients qui repartent les mains vides, un par produit manquant. */
export function demandesNonServies(ids: readonly string[]): { client: string; produit: string; phrase: string }[] {
  return PRODUITS.filter((p) => !ids.includes(p.id)).map((p) => ({
    client: p.demandePar,
    produit: p.nom,
    phrase: `${p.clientsPluriel ? 'voulaient' : 'voulait'} ${p.partitif}, mais tu n’en avais pas.`,
  }));
}
