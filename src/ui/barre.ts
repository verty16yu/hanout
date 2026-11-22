import { MODULES, Mission, nomModule, titreMission } from '../contenu/missions';
import { lireEtat } from '../etat';
import { t } from '../i18n';
import { icone } from './dessins';
import { echapper } from './dom';

/** Barre du haut d'une mission : retour, module (et chapitre en version éducative), titre, étape. */
export function barreMission(m: Mission, etape: string): string {
  const mod = MODULES[m.module];
  const edu = lireEtat().mode === 'edu';
  const puce = edu ? `${nomModule(m.module)} · ${t('barre.mission', { n: m.numero })} · ${m.chapitre}` : nomModule(m.module);
  return `<header class="barre">
  <a class="retour" href="#/carnet" aria-label="${echapper(t('barre.retourCarnet'))}">${icone('retour')}</a>
  <div class="titres">
    <span class="puce" style="background:${mod.fond};color:${mod.couleur}">${echapper(puce)}</span>
    <h1 tabindex="-1" data-focus>${echapper(titreMission(m))}</h1>
  </div>
  <span class="etape">${echapper(etape)}</span>
</header>`;
}
