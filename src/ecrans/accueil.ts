import { VILLES } from '../economie/monnaie';
import { suivre } from '../analyse';
import { Mode, changerLangue, changerMode, changerVille, lireEtat, ville } from '../etat';
import { LANGUES, Langue, t } from '../i18n';
import { icone, logo } from '../ui/dessins';
import { afficher, echapper } from '../ui/dom';
import { sceneQuartier } from '../ui/sceneQuartier';

export function ecranAccueil(racine: HTMLElement, garderPosition = false): void {
  const e = lireEtat();
  const v = ville();
  const dejaJoue = e.badges.length > 0 || Object.keys(e.etoiles).length > 0;
  const carteMode = (mode: Mode) => `<button type="button" class="carte-mode${e.mode === mode ? ' pris' : ''}" role="radio" aria-checked="${e.mode === mode}" data-mode="${mode}">
  <span class="icone-mode">${icone(mode === 'edu' ? 'diplome' : 'panier', mode === 'edu' ? '#1E6FA8' : '#8F5222', 26)}</span>
  <span class="texte-mode"><b>${t(`mode.${mode}.titre`)}</b><span class="petit">${t(`mode.${mode}.desc`)}</span></span>
</button>`;
  afficher(
    racine,
    `<main class="ecran accueil">
  <div class="accueil-visuel">
    <header class="logo">
      ${logo(76)}
      <div>
        <h1 tabindex="-1" data-focus>Hanout</h1>
        <p class="logo-ar" lang="ar" dir="rtl">حانوت</p>
      </div>
      <p class="slogan">${t('app.slogan')}</p>
    </header>
    <div class="cadre-scene">${sceneQuartier({ bulle: t('scene.bulle'), vendu: t('scene.vendu'), description: t('scene.description') })}</div>
  </div>
  <div class="accueil-reglages">
    <div class="langues" role="radiogroup" aria-label="${t('accueil.langue')}">
      ${LANGUES.map((l) => `<button type="button" role="radio" aria-checked="${e.langue === l.id}" class="langue${e.langue === l.id ? ' pris' : ''}" data-langue="${l.id}" lang="${l.id}">${l.nom}</button>`).join('')}
    </div>
    <div class="choix-mode" role="radiogroup" aria-labelledby="titre-version">
      <p id="titre-version" class="petit">${t('accueil.version')}</p>
      ${carteMode('edu')}
      ${carteMode('public')}
    </div>
    <div class="carte ville">
      ${icone('lieu', '#1E6FA8', 26)}
      <label for="choix-ville"><span class="petit">${t('accueil.ville')}</span>
        <select id="choix-ville">
          ${VILLES.map((x) => `<option value="${x.id}"${x.id === v.id ? ' selected' : ''}>${echapper(x.nom)}${x.region !== x.nom ? ` · ${echapper(x.region)}` : ''}</option>`).join('')}
        </select>
      </label>
    </div>
    <a class="bouton principal grand" href="#/carnet">${dejaJoue ? t('accueil.continuer') : t('accueil.ouvrir')}</a>
    <p class="note">${t('app.note')} · <a href="#/confidentialite">${t('conf.lien')}</a></p>
  </div>
</main>`,
    { garderPosition },
  );
  racine.querySelector<HTMLSelectElement>('#choix-ville')?.addEventListener('change', (ev) => {
    changerVille((ev.target as HTMLSelectElement).value);
    suivre('reglage_change', { reglage: 'ville', valeur: (ev.target as HTMLSelectElement).value });
  });
  racine.querySelectorAll<HTMLButtonElement>('[data-langue]').forEach((b) =>
    b.addEventListener('click', () => {
      changerLangue(b.dataset.langue as Langue);
      suivre('reglage_change', { reglage: 'langue', valeur: b.dataset.langue ?? '' });
      document.title = `Hanout — ${t('app.slogan')}`;
      ecranAccueil(racine, true);
      racine.querySelector<HTMLElement>(`[data-langue="${b.dataset.langue}"]`)?.focus({ preventScroll: true });
    }),
  );
  racine.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((b) =>
    b.addEventListener('click', () => {
      changerMode(b.dataset.mode as Mode);
      suivre('reglage_change', { reglage: 'version', valeur: b.dataset.mode ?? '' });
      document.body.dataset.mode = b.dataset.mode;
      ecranAccueil(racine, true);
      racine.querySelector<HTMLElement>(`[data-mode="${b.dataset.mode}"]`)?.focus({ preventScroll: true });
    }),
  );
}
