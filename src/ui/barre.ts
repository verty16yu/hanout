import { MODULES, Mission } from '../contenu/missions';
import { icone } from './dessins';
import { echapper } from './dom';

/** Barre du haut d'une mission : retour au carnet, module, titre, étape. */
export function barreMission(m: Mission, etape: string): string {
  const mod = MODULES[m.module];
  return `<header class="barre">
  <a class="retour" href="#/carnet" aria-label="Retour au carnet de missions">${icone('retour')}</a>
  <div class="titres">
    <span class="puce" style="background:${mod.fond};color:${mod.couleur}">${echapper(mod.nom)} · mission ${m.numero} · ${m.chapitre}</span>
    <h1 tabindex="-1" data-focus>${echapper(m.titre)}</h1>
  </div>
  <span class="etape">${echapper(etape)}</span>
</header>`;
}
