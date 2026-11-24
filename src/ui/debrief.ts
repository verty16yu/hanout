// Fin de mission.
// Version éducative : débrief d'Ammi Rabah (notions, question de réflexion, quiz, badge), rejouer.
// Version grand public : conseil d'Ammi Rabah, étoiles selon la performance, rejouer.
// Dans les deux versions, une mission réussie annonce Mon hanout (son bonus de +25 %).

import { suivre } from '../analyse';
import { chargerBoutique, compteePourBonus, missionsReussies, multiplicateur } from '../boutique';
import { BONUS_PAR_MISSION, multiplicateurMissions, revenuParSeconde } from '../economie/clicker';
import { enregistrerEtoiles, gagnerBadge, lireEtat } from '../etat';
import { langue, t, tListe } from '../i18n';
import { ammi, icone, vignetteAmelioration } from './dessins';
import { echapper } from './dom';

/** Parties terminées par mission depuis l'ouverture du jeu (pour distinguer la 1re partie des suivantes). */
const partiesTerminees = new Map<string, number>();

/** Numéro de la partie en cours pour cette mission : 1 pour la première depuis l'ouverture du jeu. */
export function partieEnCours(missionId: string): number {
  return (partiesTerminees.get(missionId) ?? 0) + 1;
}

/**
 * Encart qui envoie vers Mon hanout à la fin d'une mission réussie.
 * Nouveau bonus : la mission vient de compter pour la première fois (+25 % sur les gains de la boutique).
 */
function annonceHanout(nouveauBonus: boolean, mult: number): string {
  const x = mult.toLocaleString(langue() === 'en' ? 'en-GB' : 'fr-FR', { maximumFractionDigits: 2 });
  const titre = nouveauBonus ? t('debrief.hanout.bonus', { pc: Math.round(BONUS_PAR_MISSION * 100) }) : t('debrief.hanout.rappel');
  // Sans amélioration automatique (cousin, frigo…), la boutique ne gagne rien pendant l'absence.
  const tourneSeule = revenuParSeconde(chargerBoutique()) > 0;
  const texte = nouveauBonus
    ? t('debrief.hanout.bonusTexte', { x })
    : t(tourneSeule ? 'debrief.hanout.rappelTexte' : 'debrief.hanout.rappelTexteVide');
  return `<a class="carte-hanout annonce-hanout" href="#/hanout" data-bonus="${nouveauBonus}">${vignetteAmelioration('etagere')}<span class="texte"><b>${titre}</b><span class="petit">${texte}</span></span><span class="bouton-mini">${t('debrief.hanout.bouton')}</span></a>`;
}

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
  /** Durée de la mission en secondes (mesure d'audience). */
  duree?: number;
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
<div class="place-annonce"></div>
<p class="petit rejouer-texte">${t('debrief.rejouerEdu')}</p>
<div class="boutons-fin">
  <button type="button" class="bouton" data-action="rejouer">${t('debrief.rejouer')}</button>
  <a class="bouton principal" href="#/carnet">${t('debrief.retour')}</a>
</div>
</section>`;
}

function htmlPublic(d: FinDeMission): string {
  const n = Math.max(1, Math.min(3, d.etoiles));
  const etoilesHtml = [1, 2, 3].map((i) => icone('etoile', i <= n ? '#F2B632' : '#E2D7BF', 40)).join('');
  // Les étoiles sont enregistrées juste après l'affichage (brancherFin) : on calcule le bonus à venir.
  const nouveauBonus = !compteePourBonus(d.missionId);
  const mult = multiplicateurMissions(missionsReussies() + (nouveauBonus ? 1 : 0));
  return `<section class="debrief" aria-labelledby="titre-debrief">
<div class="score" role="status">
  <p class="etoiles" aria-hidden="true">${etoilesHtml}</p>
  <h2 id="titre-debrief" tabindex="-1">${t('debrief.etoiles', { n })}</h2>
  <p>${t(`debrief.etoilesTexte.${n}`)}</p>
</div>
<div class="bulle-ammi">${ammi(44)}<div><p class="qui">${t('debrief.quiPublic')}</p><p>${d.conseil}</p></div></div>
${annonceHanout(nouveauBonus, mult)}
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
 * Branche la fin de mission (quiz, annonce de Mon hanout, bouton rejouer) après l'avoir insérée dans la page.
 * En grand public, les étoiles sont enregistrées dès l'affichage.
 */
export function brancherFin(racine: HTMLElement, d: FinDeMission, rejouer: () => void): void {
  const zone = racine.querySelector<HTMLElement>('.debrief');
  if (!zone) return;
  const n = Math.max(1, Math.min(3, d.etoiles));
  const publicMode = lireEtat().mode === 'public';
  const partie = partieEnCours(d.missionId);
  partiesTerminees.set(d.missionId, partie);
  suivre('mission_terminee', { mission: d.missionId, duree_s: d.duree ?? null, etoiles: publicMode ? n : null, partie });
  zone.addEventListener('click', (e) => {
    const lien = (e.target as HTMLElement).closest<HTMLElement>('.annonce-hanout');
    if (lien) suivre('hanout_annonce_clic', { mission: d.missionId, nouveau_bonus: lien.dataset.bonus === 'true', partie });
  });
  zone.querySelector('[data-action="rejouer"]')?.addEventListener('click', () => {
    suivre('mission_rejouee', { mission: d.missionId, etoiles: publicMode ? n : null, partie });
    rejouer();
  });
  if (publicMode) {
    enregistrerEtoiles(d.missionId, n);
  } else {
    let badgeAffiche = false;
    const justes = new Set<number>();
    const tentatives = d.questions.map(() => 0);
    zone.querySelectorAll<HTMLButtonElement>('.choix').forEach((b) => {
      b.addEventListener('click', () => {
        const qi = Number(b.dataset.q);
        const ci = Number(b.dataset.c);
        const q = d.questions[qi];
        const bloc = zone.querySelector<HTMLElement>(`[data-question="${qi}"]`)!;
        const retour = bloc.querySelector<HTMLElement>('.quiz-retour')!;
        tentatives[qi] += 1;
        suivre('quiz_reponse', { mission: d.missionId, question: qi + 1, juste: ci === q.bonne, tentative: tentatives[qi], reponse: q.choix[ci], partie });
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
        if (justes.size === d.questions.length && !badgeAffiche) {
          badgeAffiche = true;
          const nouveauBonus = !compteePourBonus(d.missionId);
          gagnerBadge(d.missionId);
          suivre('badge_gagne', { mission: d.missionId, sans_erreur: tentatives.every((x) => x === 1), partie });
          const badge = zone.querySelector<HTMLElement>('.badge-gagne')!;
          badge.hidden = false;
          const place = zone.querySelector<HTMLElement>('.place-annonce');
          if (place) place.innerHTML = annonceHanout(nouveauBonus, multiplicateur());
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
