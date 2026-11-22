// Monnaies et villes de départ.
// Les prix du jeu sont écrits en « unités de base » (l'équivalent d'un euro).
// Chaque pays applique un coefficient pour afficher des prix crédibles localement.
// Ces coefficients sont des valeurs de jeu, pas des taux de change officiels.

export interface Monnaie {
  code: string;
  symbole: string;
  coefficient: number;
  decimales: number;
}

export interface Ville {
  id: string;
  nom: string;
  region: string;
  pays: string;
  monnaie: Monnaie;
}

export const MONNAIES: Record<string, Monnaie> = {
  EUR: { code: 'EUR', symbole: '€', coefficient: 1, decimales: 2 },
  DZD: { code: 'DZD', symbole: 'DA', coefficient: 200, decimales: 0 },
  MAD: { code: 'MAD', symbole: 'DH', coefficient: 10, decimales: 2 },
  TND: { code: 'TND', symbole: 'DT', coefficient: 3, decimales: 2 },
};

export const VILLES: Ville[] = [
  { id: 'alger', nom: 'Alger', region: 'Alger', pays: 'DZ', monnaie: MONNAIES.DZD },
  { id: 'oran', nom: 'Oran', region: 'Oran', pays: 'DZ', monnaie: MONNAIES.DZD },
  { id: 'constantine', nom: 'Constantine', region: 'Constantine', pays: 'DZ', monnaie: MONNAIES.DZD },
  { id: 'nanterre', nom: 'Nanterre', region: 'Hauts-de-Seine (92)', pays: 'FR', monnaie: MONNAIES.EUR },
  { id: 'paris', nom: 'Paris', region: 'Île-de-France', pays: 'FR', monnaie: MONNAIES.EUR },
  { id: 'marseille', nom: 'Marseille', region: 'Bouches-du-Rhône', pays: 'FR', monnaie: MONNAIES.EUR },
  { id: 'casablanca', nom: 'Casablanca', region: 'Casablanca-Settat', pays: 'MA', monnaie: MONNAIES.MAD },
  { id: 'tunis', nom: 'Tunis', region: 'Tunis', pays: 'TN', monnaie: MONNAIES.TND },
];

// Propose une ville d'après le fuseau horaire du téléphone (aucune géolocalisation).
const FUSEAUX: Record<string, string> = {
  'Africa/Algiers': 'alger',
  'Europe/Paris': 'nanterre',
  'Africa/Casablanca': 'casablanca',
  'Africa/Tunis': 'tunis',
};

export function villeParDefaut(fuseau?: string): Ville {
  let tz = fuseau;
  if (!tz) {
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      tz = '';
    }
  }
  const id = FUSEAUX[tz ?? ''] ?? 'alger';
  return trouverVille(id);
}

export function trouverVille(id: string): Ville {
  return VILLES.find((v) => v.id === id) ?? VILLES[0];
}

/** Formate un montant exprimé en unités de base dans la monnaie de la ville et la langue du joueur. */
export function formaterPrix(unites: number, monnaie: Monnaie, langue: 'fr' | 'en' = 'fr'): string {
  const valeur = unites * monnaie.coefficient;
  const arrondi = monnaie.decimales === 0 ? Math.round(valeur) : valeur;
  const texte = arrondi
    .toLocaleString(langue === 'en' ? 'en-GB' : 'fr-FR', {
      minimumFractionDigits: monnaie.decimales,
      maximumFractionDigits: monnaie.decimales,
    })
    // toLocaleString utilise des espaces fines insécables : on les remplace pour l'affichage.
    .replace(/[\u202f\u00a0]/g, ' ');
  if (langue === 'en' && monnaie.code === 'EUR') return `€${texte}`;
  return `${texte} ${monnaie.symbole}`;
}
