// Progression et réglages du joueur, sauvegardés sur l'appareil (localStorage).
// Le jeu fonctionne aussi si la sauvegarde est impossible : il garde l'état en mémoire.

import { Ville, villeParDefaut, trouverVille } from './economie/monnaie';

export type Mode = 'edu' | 'public';

export interface EtatJoueur {
  villeId: string;
  langue: 'fr' | 'en';
  mode: Mode;
  /** Version éducative : missions dont le badge est gagné. */
  badges: string[];
  /** Version grand public : meilleur nombre d'étoiles (1 à 3) par mission. */
  etoiles: Record<string, number>;
  /** Accord pour la mesure d'audience anonyme : null tant que le joueur n'a pas répondu. */
  consentement: 'oui' | 'non' | null;
}

const CLE = 'hanout.etat.v1';

function langueParDefaut(): 'fr' | 'en' {
  try {
    return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
}

function neuf(): EtatJoueur {
  return { villeId: villeParDefaut().id, langue: langueParDefaut(), mode: 'edu', badges: [], etoiles: {}, consentement: null };
}

function charger(): EtatJoueur {
  const base = neuf();
  try {
    const brut = localStorage.getItem(CLE);
    if (brut) {
      const lu = JSON.parse(brut) as Partial<EtatJoueur>;
      return {
        villeId: lu.villeId ?? base.villeId,
        langue: lu.langue === 'en' || lu.langue === 'fr' ? lu.langue : base.langue,
        mode: lu.mode === 'public' ? 'public' : 'edu',
        badges: Array.isArray(lu.badges) ? lu.badges : [],
        etoiles: lu.etoiles && typeof lu.etoiles === 'object' ? lu.etoiles : {},
        consentement: lu.consentement === 'oui' || lu.consentement === 'non' ? lu.consentement : null,
      };
    }
  } catch {
    // stockage indisponible ou corrompu : on repart d'un état neuf
  }
  return base;
}

let etat: EtatJoueur = charger();

function sauver(): void {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    // navigation privée ou stockage plein : la partie continue sans sauvegarde
  }
}

function modifier(changement: Partial<EtatJoueur>): void {
  etat = { ...etat, ...changement };
  sauver();
}

export function lireEtat(): Readonly<EtatJoueur> {
  return etat;
}

export function ville(): Ville {
  return trouverVille(etat.villeId);
}

export function changerVille(id: string): void {
  modifier({ villeId: trouverVille(id).id });
}

export function changerLangue(langue: 'fr' | 'en'): void {
  modifier({ langue });
  document.documentElement.lang = langue;
}

export function changerMode(mode: Mode): void {
  modifier({ mode });
}

export function gagnerBadge(missionId: string): void {
  if (!etat.badges.includes(missionId)) modifier({ badges: [...etat.badges, missionId] });
}

export function aLeBadge(missionId: string): boolean {
  return etat.badges.includes(missionId);
}

export function enregistrerEtoiles(missionId: string, n: number): void {
  const actuel = etat.etoiles[missionId] ?? 0;
  if (n > actuel) modifier({ etoiles: { ...etat.etoiles, [missionId]: n } });
}

export function etoiles(missionId: string): number {
  return etat.etoiles[missionId] ?? 0;
}

/** Mission terminée dans la version en cours (badge en éducatif, au moins une étoile en grand public). */
export function missionReussie(missionId: string): boolean {
  return etat.mode === 'edu' ? aLeBadge(missionId) : etoiles(missionId) > 0;
}

export function changerConsentement(valeur: 'oui' | 'non'): void {
  modifier({ consentement: valeur });
}
