// Point d'entrée : un petit routeur par ancre (#/...), compatible avec GitHub Pages.
import './style.css';
import { trouverMission } from './contenu/missions';
import { ecranAccueil } from './ecrans/accueil';
import { ecranCarnet } from './ecrans/carnet';
import { lireEtat } from './etat';
import { t } from './i18n';
import { missionIntro1 } from './missions/intro1';
import { missionMicro4 } from './missions/micro4';
import { missionStats3 } from './missions/stats3';

const MISSIONS_JOUABLES: Record<string, (racine: HTMLElement) => void> = {
  'intro-1': missionIntro1,
  'micro-4': missionMicro4,
  'stats-3': missionStats3,
};

function router(): void {
  const racine = document.getElementById('app');
  if (!racine) return;
  const e = lireEtat();
  document.documentElement.lang = e.langue;
  document.title = `Hanout — ${t('app.slogan')}`;
  document.body.dataset.mode = e.mode;
  const chemin = location.hash.replace(/^#/, '') || '/';
  const [, page, id] = chemin.split('/');
  if (page === 'carnet') return ecranCarnet(racine);
  if (page === 'mission' && id && MISSIONS_JOUABLES[id] && trouverMission(id)) return MISSIONS_JOUABLES[id](racine);
  ecranAccueil(racine);
}

window.addEventListener('hashchange', router);
router();
