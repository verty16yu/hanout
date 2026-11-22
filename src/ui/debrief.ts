// Fin de mission.
// Version éducative : débrief d'Ammi Rabah (notions, question de réflexion, quiz, badge).
// Version grand public : conseil d'Ammi Rabah, étoiles selon la performance, rejouer.

import { enregistrerEtoiles, gagnerBadge, lireEtat } from '../etat';
import { t, tListe } from '../i18n';
import { ammi, icone } from './dessins';
import { echapper } from './dom';

export interface QuestionCours {
  question: string;
  choix: string[];
  bonne: number;
  explication: string;
}

export interface FinDeMission {
  missionId: string;
  /** Titre du débrief (version éducative). */
  titre: string;
  /** Explication avec les termes du cours (HTML de confiance, écrit dans le jeu). */
  explication: string;
  /** Conseil sans jargon (HTML de confiance), pour la version grand public. */
  conseil: string;
  notions: string[];
  reflexion: string;
  questions: QuestionCours[];
  /** Étoiles obtenues (1 à 3), pour la version grand public. */
  etoiles: number;
}

function htmlEdu(d: FinDeMission): string {
  const questions = d.questions
    .map(
      (q, i) => `<fieldset class="quiz" data-question="${i}">
  <legend>${i + 1}. ${echapper(q.question)}</legend>
  ${q.choix.map((c, j) => `<button type="button" class="choix" data-q="${i}" data-c="${j}">${echapper(c)}</button>`).join('')}
  <p class="quiz-retour" role="status" aria-live="polite"></p>
</fieldset>`,
    )
    .join('');
  return `<section class="debrief" aria-labelledby="titre-debrief">
<div class="bulle-ammi">${ammi(44)}
  <div><p class="qui">${t('debrief.qui')}</p><h2 id="titre-debrief" tabindex="-1">${echapper(d.titre)}</h2><p>${d.explication}</p>
  <p class="notions">${t('debrief.notions')} ${d.notions.map((n) => `<b>${echapper(n)}</b>`).join(' · ')}</p></div>
</div>
<div class="reflexion"><p class="etiquette">${t('debrief.mediter')}</p><p>${echapper(d.reflexion)}</p></div>
<h3 class="titre-quiz">${t('debrief.quiz')}</h3>
${questions}
<div class="badge-gagne" hidden role="status">${icone('etoile', '#F2B632', 36)}<div><p class="gros">${t('debrief.badge')}</p><p>${t('debrief.badgeTexte')}</p></div></div>
<a class="bouton principal" href="#/carnet">${t('debrief.retour')}</a>
</section>`;
}

function htmlPublic(d: FinDeMission): string {
  const n = Math.max(1, Math.min(3, d.etoiles));
  const etoilesHtml = [1, 2, 3].map((i) => icone('etoile', i <= n ? '#F2B632' : '#E2D7BF', 40)).join('');
  return `<section class="debrief" aria-labelledby="titre-debrief">
<div class="score" role="status">
  <p class="etoiles" aria-hidden="true">${etoilesHtml}</p>
  <h2 id="titre-debrief" tabindex="-1">${t('debrief.etoiles', { n })}</h2>
  <p>${t(`debrief.etoilesTexte.${n}`)}</p>
</div>
<div class="bulle-ammi">${ammi(44)}<div><p class="qui">${t('debrief.quiPublic')}</p><p>${d.conseil}</p></div></div>
<div class="boutons-fin">
  <button type="button" class="bouton" data-action="rejouer">${t('debrief.rejouer')}</button>
  <a class="bouton principal" href="#/carnet">${t('debrief.retour')}</a>
</div>
</section>`;
}

export function htmlFin(d: FinDeMission): string {
  return lireEtat().mode === 'edu' ? htmlEdu(d) : htmlPublic(d);
}

/**
 * Branche la fin de mission (quiz ou bouton rejouer) après l'avoir insérée dans la page.
 * En grand public, les étoiles sont enregistrées dès l'affichage.
 */
export function brancherFin(racine: HTMLElement, d: FinDeMission, rejouer: () => void): void {
  const zone = racine.querySelector<HTMLElement>('.debrief');
  if (!zone) return;
  if (lireEtat().mode === 'public') {
    enregistrerEtoiles(d.missionId, Math.max(1, Math.min(3, d.etoiles)));
    zone.querySelector('[data-action="rejouer"]')?.addEventListener('click', rejouer);
  } else {
    const justes = new Set<number>();
    zone.querySelectorAll<HTMLButtonElement>('.choix').forEach((b) => {
      b.addEventListener('click', () => {
        const qi = Number(b.dataset.q);
        const ci = Number(b.dataset.c);
        const q = d.questions[qi];
        const bloc = zone.querySelector<HTMLElement>(`[data-question="${qi}"]`)!;
        const retour = bloc.querySelector<HTMLElement>('.quiz-retour')!;
        if (ci === q.bonne) {
          b.classList.add('juste');
          bloc.querySelectorAll<HTMLButtonElement>('.choix').forEach((x) => (x.disabled = true));
          retour.textContent = `${t('debrief.exact')} ${q.explication}`;
          retour.className = 'quiz-retour ok';
          justes.add(qi);
        } else {
          b.classList.add('faux');
          b.disabled = true;
          retour.textContent = t('debrief.rate');
          retour.className = 'quiz-retour ko';
        }
        if (justes.size === d.questions.length) {
          gagnerBadge(d.missionId);
          const badge = zone.querySelector<HTMLElement>('.badge-gagne')!;
          badge.hidden = false;
          badge.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }
  zone.querySelector<HTMLElement>('#titre-debrief')?.focus({ preventScroll: true });
  zone.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Ordre des réponses mélangé mais stable (même ordre à chaque partie, différent d'une question à l'autre). */
function ordreMelange(n: number, graine: string): number[] {
  let h = 2166136261;
  for (const c of graine) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const ordre = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const j = Math.abs(h) % (i + 1);
    [ordre[i], ordre[j]] = [ordre[j], ordre[i]];
  }
  return ordre;
}

/**
 * Question de cours à partir des clés i18n <prefixe>, <prefixe>.c (bonne réponse en premier) et <prefixe>.e.
 * Les réponses sont mélangées pour que la bonne ne soit pas toujours à la même place.
 */
export function question(prefixe: string, explication?: string): QuestionCours {
  const choix = tListe(`${prefixe}.c`);
  const ordre = ordreMelange(choix.length, prefixe);
  return { question: t(prefixe), choix: ordre.map((i) => choix[i]), bonne: ordre.indexOf(0), explication: explication ?? t(`${prefixe}.e`) };
}
