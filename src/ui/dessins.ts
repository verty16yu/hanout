// Personnages et icônes dessinés en SVG (aucune image à télécharger).
import type { Visage } from '../economie/comptoir';

/** Ammi Rabah, l'ancien épicier du quartier qui sert de mentor. */
export function ammi(taille = 44): string {
  return `<svg class="avatar" viewBox="0 0 44 44" width="${taille}" height="${taille}" aria-hidden="true">
<circle cx="22" cy="22" r="22" fill="#F3DFC2"/><circle cx="22" cy="25" r="12" fill="#C68A5E"/>
<rect x="13" y="8" width="18" height="9" rx="3" fill="#B83E32"/>
<circle cx="18" cy="23" r="1.4" fill="#2B2A33"/><circle cx="26" cy="23" r="1.4" fill="#2B2A33"/>
<path d="M15 29 Q22 25 29 29 Q22 32 15 29 Z" fill="#fff"/></svg>`;
}

const BOUCHES: Record<Visage, string> = {
  neutre: 'M84 118 Q100 122 116 118',
  content: 'M80 114 Q100 134 120 114',
  fache: 'M84 124 Q100 112 116 124',
};
const SOURCILS: Record<Visage, string> = {
  neutre: 'M72 78 L90 76 M110 76 L128 78',
  content: 'M72 74 Q81 70 90 74 M110 74 Q119 70 128 74',
  fache: 'M72 72 L90 80 M110 80 L128 72',
};

/** Un client au comptoir, dont l'expression change selon sa réaction. */
export function clientAuComptoir(o: { nom: string; couleurHaut: string; teint: string; visage: Visage }): string {
  return `<svg class="client" viewBox="0 0 200 230" role="img" aria-label="${o.nom}, au comptoir, ${o.visage === 'content' ? 'content' : o.visage === 'fache' ? 'mécontent' : 'qui réfléchit'}">
<rect x="48" y="150" width="104" height="90" rx="40" fill="${o.couleurHaut}"/><rect x="88" y="140" width="24" height="20" fill="${o.teint}" opacity=".85"/>
<path d="M80 150 L100 176 L120 150" fill="#fff"/>
<g class="respire">
<circle cx="100" cy="92" r="48" fill="${o.teint}"/>
<path d="M54 82 Q58 36 100 36 Q144 36 146 82 Q132 58 100 60 Q70 58 54 82 Z" fill="#2B2A33"/>
<ellipse cx="52" cy="96" rx="7" ry="11" fill="${o.teint}"/><ellipse cx="148" cy="96" rx="7" ry="11" fill="${o.teint}"/>
<path d="${SOURCILS[o.visage]}" stroke="#2B2A33" stroke-width="5" stroke-linecap="round" fill="none"/>
<g class="cligne"><ellipse cx="82" cy="94" rx="5" ry="6" fill="#2B2A33"/><ellipse cx="118" cy="94" rx="5" ry="6" fill="#2B2A33"/></g>
<path d="${BOUCHES[o.visage]}" stroke="#2B2A33" stroke-width="4" stroke-linecap="round" fill="none"/>
</g></svg>`;
}

/** Les étagères du hanout, en fond de la scène du comptoir. */
export function etageres(): string {
  const couleurs = ['#C8793A', '#3FA67A', '#F2B632', '#B83E32', '#1E6FA8', '#7B5EA7'];
  let bocaux = '';
  [40, 108, 176].forEach((y, r) => {
    bocaux += `<rect x="0" y="${y + 44}" width="390" height="8" fill="#B98552"/>`;
    for (let i = 0; i < 12; i++) {
      const c = couleurs[(i + r * 2) % 6];
      const x = 10 + i * 32;
      const forme = (i + r) % 3;
      if (forme === 0) bocaux += `<rect x="${x}" y="${y + 14}" width="22" height="30" rx="4" fill="${c}" opacity=".85"/><rect x="${x + 3}" y="${y + 22}" width="16" height="10" rx="2" fill="#fff" opacity=".8"/>`;
      else if (forme === 1) bocaux += `<rect x="${x + 2}" y="${y + 18}" width="18" height="26" rx="8" fill="${c}" opacity=".75"/><rect x="${x + 4}" y="${y + 12}" width="14" height="7" rx="2" fill="#8F5222"/>`;
      else bocaux += `<rect x="${x}" y="${y + 24}" width="24" height="20" rx="3" fill="${c}" opacity=".65"/>`;
    }
  });
  return `<svg class="etageres" viewBox="0 0 390 250" preserveAspectRatio="xMidYMin slice" aria-hidden="true"><rect width="390" height="250" fill="#F1E6D0"/>${bocaux}</svg>`;
}

export function icone(nom: 'retour' | 'coche' | 'cadenas' | 'etoile' | 'coeur' | 'lieu' | 'trophee', couleur = 'currentColor', taille = 22): string {
  const traits: Record<string, string> = {
    retour: '<path d="M15 18l-6-6 6-6"/>',
    coche: '<path d="M5 12l5 5 9-10"/>',
    cadenas: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    lieu: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    trophee: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  };
  if (nom === 'etoile') {
    return `<svg viewBox="0 0 24 24" width="${taille}" height="${taille}" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="${couleur}"/></svg>`;
  }
  if (nom === 'coeur') {
    return `<svg viewBox="0 0 24 24" width="${taille}" height="${taille}" aria-hidden="true"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" fill="${couleur}"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" width="${taille}" height="${taille}" fill="none" stroke="${couleur}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${traits[nom]}</svg>`;
}
