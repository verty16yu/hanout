// « Mon hanout » : la boutique qui tourne entre les missions, façon jeu incrémental.
// On sert des clients d'un geste, on gagne de l'argent, on achète des améliorations
// qui font tourner le hanout tout seul. Chaque amélioration illustre une notion du cours.
// Module pur (aucun accès au DOM ni au stockage) : il est testé avec Vitest.
// Les montants sont en unités de base (voir monnaie.ts), convertis à l'affichage.

export type TypeAmelioration = 'clic' | 'auto';

export interface Amelioration {
  id: string;
  type: TypeAmelioration;
  /** Prix du premier exemplaire. */
  coutBase: number;
  /** Gain apporté par le premier exemplaire : par client servi (clic) ou par seconde (auto). */
  effet: number;
  /** Rendements décroissants : chaque exemplaire rapporte ce facteur fois le précédent (1 = constant). */
  decroissance: number;
}

/** Hausse du prix à chaque achat : le 2e exemplaire coûte 15 % de plus que le 1er, etc. */
export const HAUSSE_PRIX = 1.15;
/** Marge gagnée en servant un client, sans amélioration. */
export const MARGE_DE_BASE = 0.5;
/** Bonus de chaque mission réussie, sur tous les gains. */
export const BONUS_PAR_MISSION = 0.25;
/** Pendant l'absence, la boutique tourne à moitié régime, et au plus 8 heures. */
export const TAUX_ABSENCE = 0.5;
export const ABSENCE_MAX_S = 8 * 3600;

/** Livret d'épargne : 0,5 % d'intérêts par minute, composés, jusqu'à un plafond (comme un vrai livret). */
export const TAUX_LIVRET_MIN = 0.005;
export const PLAFOND_LIVRET = 1000;
/** Le livret apparaît quand la boutique a gagné ce montant. */
export const SEUIL_LIVRET = 100;

export const AMELIORATIONS: Amelioration[] = [
  { id: 'etagere', type: 'clic', coutBase: 5, effet: 0.25, decroissance: 1 },
  { id: 'cousin', type: 'auto', coutBase: 12, effet: 0.2, decroissance: 0.85 },
  { id: 'frigo', type: 'auto', coutBase: 60, effet: 1, decroissance: 1 },
  { id: 'pain', type: 'auto', coutBase: 400, effet: 5, decroissance: 1 },
  { id: 'livraison', type: 'auto', coutBase: 2500, effet: 25, decroissance: 1 },
];

export interface EtatBoutique {
  /** Argent disponible. */
  caisse: number;
  /** Tout ce que la boutique a gagné depuis l'ouverture. */
  total: number;
  /** Clients servis à la main. */
  clients: number;
  /** Nombre d'exemplaires achetés pour chaque amélioration. */
  niveaux: Record<string, number>;
  /** Argent placé sur le livret d'épargne. */
  livret: number;
  /** Dernier passage du joueur (millisecondes), pour les gains pendant l'absence. */
  vu: number;
}

export function boutiqueNeuve(maintenant: number): EtatBoutique {
  return { caisse: 0, total: 0, clients: 0, niveaux: {}, livret: 0, vu: maintenant };
}

export function trouverAmelioration(id: string): Amelioration | undefined {
  return AMELIORATIONS.find((a) => a.id === id);
}

export function niveau(etat: EtatBoutique, id: string): number {
  return etat.niveaux[id] ?? 0;
}

/** Prix du prochain exemplaire quand on en possède déjà `n`. */
export function cout(a: Amelioration, n: number): number {
  return Math.round(a.coutBase * Math.pow(HAUSSE_PRIX, n) * 100) / 100;
}

/** Gain apporté par le (n+1)-ième exemplaire : le gain marginal. */
export function gainMarginal(a: Amelioration, n: number): number {
  return a.effet * Math.pow(a.decroissance, n);
}

/** Gain total des `n` exemplaires possédés (somme des gains marginaux). */
export function gainCumule(a: Amelioration, n: number): number {
  if (n <= 0) return 0;
  if (a.decroissance === 1) return a.effet * n;
  return (a.effet * (1 - Math.pow(a.decroissance, n))) / (1 - a.decroissance);
}

/** Multiplicateur dû aux missions réussies : chaque mission ajoute 25 %. */
export function multiplicateurMissions(missionsReussies: number): number {
  return 1 + BONUS_PAR_MISSION * Math.max(0, missionsReussies);
}

export function gainParClient(etat: EtatBoutique, mult = 1): number {
  const clic = AMELIORATIONS.filter((a) => a.type === 'clic').reduce((s, a) => s + gainCumule(a, niveau(etat, a.id)), 0);
  return (MARGE_DE_BASE + clic) * mult;
}

export function revenuParSeconde(etat: EtatBoutique, mult = 1): number {
  const auto = AMELIORATIONS.filter((a) => a.type === 'auto').reduce((s, a) => s + gainCumule(a, niveau(etat, a.id)), 0);
  return auto * mult;
}

function encaisser(etat: EtatBoutique, montant: number): EtatBoutique {
  return { ...etat, caisse: etat.caisse + montant, total: etat.total + montant };
}

/** Le joueur sert un client au comptoir. */
export function servir(etat: EtatBoutique, mult = 1): EtatBoutique {
  return { ...encaisser(etat, gainParClient(etat, mult)), clients: etat.clients + 1 };
}

/** Intérêts composés gagnés par le livret en `secondes`, sans dépasser le plafond. */
export function interets(solde: number, secondes: number): number {
  if (solde <= 0 || secondes <= 0 || solde >= PLAFOND_LIVRET) return 0;
  const apres = solde * Math.pow(1 + TAUX_LIVRET_MIN, secondes / 60);
  return Math.min(PLAFOND_LIVRET, apres) - solde;
}

function faireFructifier(etat: EtatBoutique, secondes: number): EtatBoutique {
  const gain = interets(etat.livret, secondes);
  return gain > 0 ? { ...etat, livret: etat.livret + gain, total: etat.total + gain } : etat;
}

/** Le temps passe pendant que le joueur regarde la boutique. */
export function avancer(etat: EtatBoutique, secondes: number, mult = 1): EtatBoutique {
  if (secondes <= 0) return etat;
  return faireFructifier(encaisser(etat, revenuParSeconde(etat, mult) * secondes), secondes);
}

/** Place de l'argent de la caisse sur le livret (au plus ce que permet le plafond). */
export function deposer(etat: EtatBoutique, montant: number): EtatBoutique | null {
  const place = Math.min(montant, etat.caisse, PLAFOND_LIVRET - etat.livret);
  if (!(place > 1e-9)) return null;
  return { ...etat, caisse: etat.caisse - place, livret: etat.livret + place };
}

/** Reprend de l'argent du livret vers la caisse. */
export function retirer(etat: EtatBoutique, montant: number): EtatBoutique | null {
  const repris = Math.min(montant, etat.livret);
  if (!(repris > 1e-9)) return null;
  return { ...etat, caisse: etat.caisse + repris, livret: etat.livret - repris };
}

/** Achète un exemplaire de plus. Renvoie null si la caisse ne suffit pas. */
export function acheter(etat: EtatBoutique, id: string): EtatBoutique | null {
  const a = trouverAmelioration(id);
  if (!a) return null;
  const n = niveau(etat, id);
  const prix = cout(a, n);
  if (etat.caisse + 1e-9 < prix) return null;
  return { ...etat, caisse: Math.max(0, etat.caisse - prix), niveaux: { ...etat.niveaux, [id]: n + 1 } };
}

/** Gains pendant l'absence du joueur : boutique à moitié régime, livret à plein taux, 8 heures au plus. */
export function gainsAbsence(
  etat: EtatBoutique,
  maintenant: number,
  mult = 1,
): { etat: EtatBoutique; gain: number; interets: number; secondes: number } {
  const secondes = Math.min(ABSENCE_MAX_S, Math.max(0, (maintenant - etat.vu) / 1000));
  const gain = revenuParSeconde(etat, mult) * secondes * TAUX_ABSENCE;
  const avecInterets = faireFructifier(encaisser(etat, gain), secondes);
  return { etat: { ...avecInterets, vu: maintenant }, gain, interets: avecInterets.livret - etat.livret, secondes };
}

/**
 * Délai de récupération du prochain achat : le temps (en secondes) ou le nombre de clients
 * qu'il faut pour que l'amélioration rembourse son prix.
 */
export function delaiRecuperation(a: Amelioration, n: number, mult = 1): number {
  const gain = gainMarginal(a, n) * mult;
  return gain > 0 ? cout(a, n) / gain : Infinity;
}
