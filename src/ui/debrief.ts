// Le débrief d'Ammi Rabah, commun à toutes les missions :
// la notion est nommée, une question invite à réfléchir, puis deux questions de cours
// font gagner le badge de la mission.

import { gagnerBadge } from '../etat';
import { ammi, icone } from './dessins';
import { echapper } from './dom';

export interface QuestionCours {
  question: string;
  choix: string[];
  bonne: number;
  explication: string;
}

export interface Debrief {
  missionId: string;
  titre: string;
  explication: string; // HTML de confiance, écrit dans le code du jeu
  notions: string[];
  reflexion: string;
  questions: QuestionCours[];
}

export function htmlDebrief(d: Debrief): string {
  const questions = d.questions
    .map(
      (q, i) => `<fieldset class="quiz" data-question="${i}">
  <legend>${i + 1}. ${echapper(q.question)}</legend>
  ${q.choix.map((c, j) => `<button type="button" class="choix" data-action="repondre" data-q="${i}" data-c="${j}">${echapper(c)}</button>`).join('')}
  <p class="quiz-retour" role="status" aria-live="polite"></p>
</fieldset>`,
    )
    .join('');
  return `<section class="debrief" aria-labelledby="titre-debrief">
<div class="bulle-ammi">${ammi(44)}
  <div><p class="qui">Débrief d’Ammi Rabah</p><h2 id="titre-debrief" tabindex="-1">${echapper(d.titre)}</h2><p>${d.explication}</p>
  <p class="notions">Notions : ${d.notions.map((n) => `<b>${echapper(n)}</b>`).join(' · ')}</p></div>
</div>
<div class="reflexion"><p class="etiquette">À méditer</p><p>${echapper(d.reflexion)}</p></div>
<h3 class="titre-quiz">Deux questions pour gagner le badge</h3>
${questions}
<div class="badge-gagne" hidden role="status">${icone('etoile', '#F2B632', 36)}<div><p class="gros">Badge gagné !</p><p>Il est ajouté à ton carnet de missions.</p></div></div>
<a class="bouton principal" href="#/carnet">Retour au carnet</a>
</section>`;
}

/** Branche les réponses du quiz. À appeler après avoir inséré htmlDebrief dans la page. */
export function brancherDebrief(racine: HTMLElement, d: Debrief): void {
  const justes = new Set<number>();
  const zone = racine.querySelector<HTMLElement>('.debrief');
  if (!zone) return;
  zone.querySelectorAll<HTMLButtonElement>('[data-action="repondre"]').forEach((b) => {
    b.addEventListener('click', () => {
      const qi = Number(b.dataset.q);
      const ci = Number(b.dataset.c);
      const q = d.questions[qi];
      const bloc = zone.querySelector<HTMLElement>(`[data-question="${qi}"]`)!;
      const retour = bloc.querySelector<HTMLElement>('.quiz-retour')!;
      if (ci === q.bonne) {
        b.classList.add('juste');
        bloc.querySelectorAll<HTMLButtonElement>('.choix').forEach((x) => (x.disabled = true));
        retour.textContent = `Exact. ${q.explication}`;
        retour.className = 'quiz-retour ok';
        justes.add(qi);
      } else {
        b.classList.add('faux');
        b.disabled = true;
        retour.textContent = 'Pas tout à fait. Relis l’explication d’Ammi Rabah et essaie une autre réponse.';
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
  zone.querySelector<HTMLElement>('#titre-debrief')?.focus({ preventScroll: true });
  zone.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
