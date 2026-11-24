// Sauvegarde de « Mon hanout » sur l'appareil, et lien avec les missions réussies.
import { EtatBoutique, boutiqueNeuve, multiplicateurMissions } from './economie/clicker';
import { MISSIONS } from './contenu/missions';
import { lireEtat } from './etat';

const CLE = 'hanout.boutique.v1';

function nombre(x: unknown, defaut = 0): number {
  return typeof x === 'number' && Number.isFinite(x) && x >= 0 ? x : defaut;
}

export function chargerBoutique(maintenant = Date.now()): EtatBoutique {
  try {
    const brut = localStorage.getItem(CLE);
    if (brut) {
      const lu = JSON.parse(brut) as Partial<EtatBoutique>;
      const niveaux: Record<string, number> = {};
      if (lu.niveaux && typeof lu.niveaux === 'object') {
        for (const [id, n] of Object.entries(lu.niveaux)) niveaux[id] = Math.floor(nombre(n));
      }
      return {
        caisse: nombre(lu.caisse),
        total: nombre(lu.total),
        clients: Math.floor(nombre(lu.clients)),
        niveaux,
        livret: nombre(lu.livret),
        // une date dans le futur (horloge changée) ne donne aucun gain d'absence
        vu: Math.min(nombre(lu.vu, maintenant), maintenant),
      };
    }
  } catch {
    // stockage indisponible ou corrompu : boutique neuve
  }
  return boutiqueNeuve(maintenant);
}

export function sauverBoutique(etat: EtatBoutique): void {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    // navigation privée : la boutique tourne sans sauvegarde
  }
}

/** Missions réussies dans l'une ou l'autre version (badge ou au moins une étoile). */
export function missionsReussies(): number {
  const e = lireEtat();
  return MISSIONS.filter((m) => e.badges.includes(m.id) || (e.etoiles[m.id] ?? 0) > 0).length;
}

export function multiplicateur(): number {
  return multiplicateurMissions(missionsReussies());
}
