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
export function clientAuComptoir(o: { etiquette: string; couleurHaut: string; teint: string; visage: Visage }): string {
  return `<svg class="client" viewBox="0 0 200 230" role="img" aria-label="${o.etiquette}">
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

export function icone(nom: 'retour' | 'coche' | 'cadenas' | 'etoile' | 'coeur' | 'lieu' | 'trophee' | 'diplome' | 'panier' | 'maison', couleur = 'currentColor', taille = 22): string {
  const traits: Record<string, string> = {
    retour: '<path d="M15 18l-6-6 6-6"/>',
    coche: '<path d="M5 12l5 5 9-10"/>',
    cadenas: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    lieu: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    diplome: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/><path d="M22 9v6"/>',
    panier: '<path d="M3 5h2l2.2 10.2a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L20 8H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/>',
    maison: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
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

/** Le logo de Hanout (piste A) : la boutique en vue isométrique sur fond bleu. */
export function logo(taille = 64): string {
  return `<svg class="logo-icone" viewBox="0 0 120 120" width="${taille}" height="${taille}" aria-hidden="true"><rect width="120" height="120" rx="28" fill="#1E6FA8"/><polygon points="60,22 98,41 60,60 22,41" fill="#FBF8F1"/><polygon points="22,41 60,60 60,100 22,81" fill="#E6DCC6"/><polygon points="60,60 98,41 98,81 60,100" fill="#F7F3EA"/><polygon points="60,62 69.5,57.25 69.5,63.25 60,68" fill="#C8793A"/><polygon points="69.5,57.25 79,52.5 79,58.5 69.5,63.25" fill="#fff"/><polygon points="79,52.5 88.5,47.75 88.5,53.75 79,58.5" fill="#C8793A"/><polygon points="88.5,47.75 98,43 98,49 88.5,53.75" fill="#fff"/><polygon points="66,71 76,66 76,90 66,95" fill="#1E6FA8"/><polygon points="28,50 52,62 52,74 28,62" fill="#CFE3F0"/><circle cx="35" cy="58" r="2.6" fill="#C8793A"/><circle cx="41" cy="61" r="2.6" fill="#2F8A63"/><circle cx="47" cy="64" r="2.6" fill="#F2B632"/></svg>`;
}

/** La devanture de « Mon hanout ». Les améliorations achetées apparaissent sur le dessin. */
export function devanture(niveaux: Record<string, number>): string {
  const n = (id: string) => niveaux[id] ?? 0;
  const couleurs = ['#C8793A', '#3FA67A', '#F2B632', '#B83E32', '#7B5EA7', '#1E6FA8'];
  // store : bandes ocre et blanches, bord festonné
  let store = '';
  for (let i = 0; i < 12; i++) {
    const x = 36 + i * 20.7;
    const c = i % 2 ? '#fff' : '#C8793A';
    store += `<rect x="${x}" y="86" width="20.7" height="20" fill="${c}"/><circle cx="${x + 10.35}" cy="106" r="10.35" fill="${c}"/>`;
  }
  // vitrine : une rangée de bocaux par étagère achetée (4 au plus)
  const rangees = 1 + Math.min(3, n('etagere'));
  let bocaux = '';
  for (let r = 0; r < rangees; r++) {
    const y = 190 - r * 19;
    bocaux += `<rect x="52" y="${y}" width="122" height="4" fill="#B98552"/>`;
    for (let i = 0; i < 7; i++) {
      const c = couleurs[(i + r * 2) % couleurs.length];
      bocaux += `<rect x="${56 + i * 17}" y="${y - 13}" width="12" height="13" rx="3" fill="${c}" opacity=".85"/>`;
    }
  }
  // cousins derrière la vitrine : 1, puis 2 à partir de 3, puis 3 à partir de 6
  const nbCousins = n('cousin') >= 6 ? 3 : n('cousin') >= 3 ? 2 : n('cousin') >= 1 ? 1 : 0;
  let cousins = '';
  for (let i = 0; i < nbCousins; i++) {
    const x = 158 - i * 30;
    cousins += `<g class="cousin" style="animation-delay:${i * 0.4}s"><rect x="${x - 11}" y="176" width="22" height="22" rx="9" fill="${['#3FA67A', '#7B5EA7', '#B83E32'][i]}"/><circle cx="${x}" cy="166" r="10" fill="#C68A5E"/><rect x="${x - 8}" y="153" width="16" height="6" rx="2" fill="#2B2A33"/><circle cx="${x - 3}" cy="166" r="1.3" fill="#2B2A33"/><circle cx="${x + 3}" cy="166" r="1.3" fill="#2B2A33"/></g>`;
  }
  const frigo = n('frigo')
    ? `<g><rect x="2" y="138" width="38" height="78" rx="4" fill="#fff" stroke="#1E6FA8" stroke-width="3"/><rect x="2" y="138" width="38" height="14" rx="4" fill="#1E6FA8"/>${[0, 1, 2].map((r) => [0, 1, 2].map((i) => `<rect x="${8 + i * 10}" y="${158 + r * 18}" width="6" height="14" rx="2" fill="${couleurs[(i + r) % 6]}"/>`).join('')).join('')}</g>`
    : '';
  const pain = n('pain')
    ? `<g><rect x="62" y="203" width="70" height="15" rx="2" fill="#B98552"/><path d="M62 210 H132" stroke="#8F5222" stroke-width="2"/>${[0, 1, 2, 3].map((i) => `<ellipse cx="${74 + i * 15}" cy="200" rx="5" ry="15" transform="rotate(${-20 + i * 12} ${74 + i * 15} 200)" fill="#E0A458"/>`).join('')}</g>`
    : '';
  const velo = n('livraison')
    ? `<g class="velo"><circle cx="262" cy="216" r="12" fill="none" stroke="#2B2A33" stroke-width="3"/><circle cx="302" cy="216" r="12" fill="none" stroke="#2B2A33" stroke-width="3"/><path d="M262 216 L278 196 L296 196 L302 216 M278 196 L284 216 L262 216 M296 196 L300 186" stroke="#B83E32" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="250" y="186" width="24" height="12" rx="2" fill="#C8793A"/></g>`
    : '';
  return `<svg class="devanture" viewBox="0 0 320 236" aria-hidden="true">
<ellipse cx="160" cy="224" rx="160" ry="12" fill="#E6DCC6"/>
<rect x="30" y="50" width="260" height="170" fill="#F7F3EA" stroke="#E2D7BF" stroke-width="2"/>
<rect x="22" y="40" width="276" height="14" rx="3" fill="#8F5222"/>
<rect x="100" y="57" width="120" height="25" rx="6" fill="#1E6FA8"/><text x="160" y="75" text-anchor="middle" font-family="Baloo Bhaijaan 2, sans-serif" font-weight="700" font-size="16" fill="#fff">HANOUT</text>
${store}
<rect x="48" y="122" width="130" height="80" fill="#CFE3F0" stroke="#8F5222" stroke-width="4"/>
${bocaux}${cousins}
<rect x="200" y="122" width="56" height="96" rx="4" fill="#1E6FA8"/><rect x="207" y="130" width="42" height="34" rx="2" fill="#CFE3F0" opacity=".7"/><circle cx="246" cy="174" r="3" fill="#F2B632"/>
${frigo}${pain}${velo}
</svg>`;
}

/** Petite vignette de chaque amélioration de « Mon hanout ». */
export function vignetteAmelioration(id: string): string {
  const dessins: Record<string, string> = {
    etagere: '<rect x="6" y="28" width="36" height="4" fill="#B98552"/><rect x="6" y="14" width="36" height="4" fill="#B98552"/><rect x="9" y="19" width="7" height="9" rx="2" fill="#C8793A"/><rect x="19" y="19" width="7" height="9" rx="2" fill="#3FA67A"/><rect x="29" y="19" width="7" height="9" rx="2" fill="#F2B632"/><rect x="12" y="5" width="7" height="9" rx="2" fill="#B83E32"/><rect x="24" y="5" width="7" height="9" rx="2" fill="#1E6FA8"/>',
    cousin: '<rect x="13" y="26" width="22" height="18" rx="9" fill="#3FA67A"/><circle cx="24" cy="18" r="10" fill="#C68A5E"/><rect x="16" y="5" width="16" height="6" rx="2" fill="#2B2A33"/><circle cx="21" cy="18" r="1.4" fill="#2B2A33"/><circle cx="27" cy="18" r="1.4" fill="#2B2A33"/><path d="M20 22 Q24 25 28 22" stroke="#2B2A33" stroke-width="1.5" fill="none"/>',
    frigo: '<rect x="12" y="4" width="24" height="40" rx="3" fill="#fff" stroke="#1E6FA8" stroke-width="2.5"/><rect x="12" y="4" width="24" height="8" rx="3" fill="#1E6FA8"/><rect x="16" y="16" width="4" height="10" rx="1.5" fill="#B83E32"/><rect x="22" y="16" width="4" height="10" rx="1.5" fill="#F2B632"/><rect x="28" y="16" width="4" height="10" rx="1.5" fill="#3FA67A"/><rect x="16" y="30" width="4" height="10" rx="1.5" fill="#C8793A"/><rect x="22" y="30" width="4" height="10" rx="1.5" fill="#1E6FA8"/>',
    pain: '<rect x="6" y="30" width="36" height="12" rx="2" fill="#B98552"/><ellipse cx="16" cy="24" rx="4.5" ry="13" transform="rotate(-18 16 24)" fill="#E0A458"/><ellipse cx="25" cy="22" rx="4.5" ry="14" fill="#D9963F"/><ellipse cx="34" cy="24" rx="4.5" ry="13" transform="rotate(18 34 24)" fill="#E0A458"/>',
    livraison: '<circle cx="12" cy="34" r="8" fill="none" stroke="#2B2A33" stroke-width="2.5"/><circle cx="37" cy="34" r="8" fill="none" stroke="#2B2A33" stroke-width="2.5"/><path d="M12 34 L22 20 L33 20 L37 34 M22 20 L26 34 L12 34 M33 20 L35 13" stroke="#B83E32" stroke-width="2.5" fill="none" stroke-linecap="round"/><rect x="4" y="16" width="14" height="8" rx="1.5" fill="#C8793A"/>',
  };
  return `<svg class="vignette" viewBox="0 0 48 48" width="44" height="44" aria-hidden="true"><rect width="48" height="48" rx="12" fill="#F1E6D0"/>${dessins[id] ?? ''}</svg>`;
}
