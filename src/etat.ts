// Progression du joueur, sauvegardée sur le téléphone (localStorage).
// Le jeu fonctionne aussi si la sauvegarde est impossible : il garde l'état en mémoire.

import { Ville, villeParDefaut, trouverVille } from './economie/monnaie';

export interface EtatJoueur {
  villeId: string;
  badges: string[];
}

const CLE = 'hanout.etat.v1';

function charger(): EtatJoueur {
  try {
    const brut = localStorage.getItem(CLE);
    if (brut) {
      const lu = JSON.parse(brut) as Partial<EtatJoueur>;
      return { villeId: lu.villeId ?? villeParDefaut().id, badges: Array.isArray(lu.badges) ? lu.badges : [] };
    }
  } catch {
    // stockage indisponible ou corrompu : on repart d'un état neuf
  }
  return { villeId: villeParDefaut().id, badges: [] };
}

let etat: EtatJoueur = charger();

function sauver(): void {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    // navigation privée ou stockage plein : la partie continue sans sauvegarde
  }
}

export function lireEtat(): Readonly<EtatJoueur> {
  return etat;
}

export function ville(): Ville {
  return trouverVille(etat.villeId);
}

export function changerVille(id: string): void {
  etat = { ...etat, villeId: trouverVille(id).id };
  sauver();
}

export function gagnerBadge(missionId: string): void {
  if (!etat.badges.includes(missionId)) {
    etat = { ...etat, badges: [...etat.badges, missionId] };
    sauver();
  }
}

export function aLeBadge(missionId: string): boolean {
  return etat.badges.includes(missionId);
}
