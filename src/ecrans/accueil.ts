import { VILLES } from '../economie/monnaie';
import { changerVille, lireEtat, ville } from '../etat';
import { icone } from '../ui/dessins';
import { afficher, echapper } from '../ui/dom';
import { SCENE_QUARTIER } from '../ui/sceneQuartier';

export function ecranAccueil(racine: HTMLElement): void {
  const v = ville();
  const nbBadges = lireEtat().badges.length;
  afficher(
    racine,
    `<main class="ecran accueil">
  <header class="logo">
    <h1 tabindex="-1" data-focus>Hanout</h1>
    <p class="logo-ar" lang="ar" dir="rtl">حانوت</p>
    <p class="slogan">Du quartier au monde</p>
  </header>
  <div class="cadre-scene">${SCENE_QUARTIER}</div>
  <div class="carte ville">
    ${icone('lieu', '#1E6FA8', 26)}
    <label for="choix-ville"><span class="petit">Ta ville de départ</span>
      <select id="choix-ville">
        ${VILLES.map((x) => `<option value="${x.id}"${x.id === v.id ? ' selected' : ''}>${echapper(x.nom)}${x.region !== x.nom ? ` · ${echapper(x.region)}` : ''}</option>`).join('')}
      </select>
    </label>
  </div>
  <a class="bouton principal grand" href="#/carnet">${nbBadges > 0 ? 'Continuer' : 'Ouvrir ma boutique'}</a>
  <p class="note">Prototype de la version éducative · 3 missions jouables · L1 SEGC</p>
</main>`,
  );
  racine.querySelector<HTMLSelectElement>('#choix-ville')?.addEventListener('change', (e) => {
    changerVille((e.target as HTMLSelectElement).value);
  });
}
