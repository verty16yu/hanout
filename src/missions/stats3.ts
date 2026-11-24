// Mission Stats 3 « À quelle heure ouvrir ? » : classes, histogramme, classe modale.
import { trouverMission } from '../contenu/missions';
import {
  FREQUENTATION, HEURES_OUVERTURE, HORAIRES, Horaire, classeModale, clientsServis, effectifTotal, frequence, meilleurHoraire,
} from '../economie/histogramme';
import { lireEtat } from '../etat';
import { chrono, suivre } from '../analyse';
import { t, tListe } from '../i18n';
import { barreMission } from '../ui/barre';
import { FinDeMission, brancherFin, htmlFin, partieEnCours, question } from '../ui/debrief';
import { ammi } from '../ui/dessins';
import { afficher } from '../ui/dom';

/** Étoiles (grand public) : trouver le meilleur horaire du premier coup vaut 3 étoiles. */
export function etoilesStats3(essais: number): number {
  return essais <= 1 ? 3 : essais === 2 ? 2 : 1;
}

export function missionStats3(racine: HTMLElement): void {
  const mission = trouverMission('stats-3')!;
  const total = effectifTotal();
  const modale = classeModale();
  const max = modale.effectif;
  const meilleur = meilleurHoraire();
  let classeChoisie: number | null = null;
  let horaire: Horaire | null = null;
  let essais = 0;
  let finAffichee = false;
  let duree = chrono();

  function histogramme(): string {
    return `<div class="histo" role="group" aria-label="${t('stats3.histo')}">
${FREQUENTATION.map((c) => {
  const couvert = horaire ? horaire.heures.includes(c.debut) : false;
  const cls = ['barre-h', couvert ? 'couvert' : '', classeChoisie === c.debut ? 'choisie' : '', classeChoisie !== null && c === modale ? 'modale' : ''].join(' ');
  return `<button type="button" class="${cls}" data-h="${c.debut}" aria-label="${t('stats3.barre', { a: c.debut, b: c.fin, n: c.effectif })}" ${classeChoisie !== null ? 'disabled' : ''}>
  <span class="n">${c.effectif}</span><span class="b" style="--r:${(c.effectif / max).toFixed(3)}"></span><span class="h">${c.debut}</span></button>`;
}).join('')}
</div><p class="petit legende">${t('stats3.legende', { n: total })}</p>`;
  }

  function rendre(garderPosition = false): void {
    const etape = classeChoisie === null ? 1 : 2;
    const bonne = classeChoisie === modale.debut;
    const edu = lireEtat().mode === 'edu';
    afficher(
      racine,
      `<main class="ecran mission">
${barreMission(mission, t('barre.etape', { a: etape, b: 2 }))}
<div class="mise-en-page">
  <div class="col-gauche">
    <div class="bulle-ammi">${ammi(40)}<p>${etape === 1 ? t(edu ? 'stats3.etape1' : 'stats3.etape1.public') : t('stats3.etape2', { n: HEURES_OUVERTURE })}</p></div>
    <section class="carte carte-histo">${histogramme()}</section>
  </div>
  <div class="col-droite">
  ${
    classeChoisie !== null
      ? `<p class="issue ${bonne ? 'ok' : 'ko'}" role="status">${t(bonne ? 'stats3.bon1' : 'stats3.faux1', { a: modale.debut, b: modale.fin, n: modale.effectif })}</p>
    <div class="choix-horaires" role="radiogroup" aria-label="${t('stats3.horaires')}">
      ${HORAIRES.map(
        (h) => `<button type="button" role="radio" class="horaire${horaire?.id === h.id ? ' pris' : ''}" aria-checked="${horaire?.id === h.id}" data-horaire="${h.id}">
        <b>${t(`horaire.${h.id}`)}</b><span>${horaire ? t('stats3.servis', { n: clientsServis(h), total }) : t('stats3.heures', { n: HEURES_OUVERTURE })}</span></button>`,
      ).join('')}
    </div>
    ${
      horaire
        ? horaire.id === meilleur.id
          ? `<p class="issue ok" role="status">${t('stats3.bon2', { n: clientsServis(horaire), total })}</p>
             ${finAffichee ? '' : `<button type="button" class="bouton principal grand" data-action="fin">${t(edu ? 'stats3.voirDebrief' : 'stats3.voirConseil')}</button>`}`
          : `<p class="issue ko" role="status">${t('stats3.faux2', { n: clientsServis(horaire), total })}</p>`
        : ''
    }`
      : ''
  }
    <div id="zone-fin"></div>
  </div>
</div>
</main>`,
      { garderPosition },
    );
    racine.querySelectorAll<HTMLButtonElement>('.barre-h').forEach((b) =>
      b.addEventListener('click', () => {
        classeChoisie = Number(b.dataset.h);
        suivre('stats3_classe', { heure: classeChoisie, juste: classeChoisie === modale.debut, partie: partieEnCours(mission.id) });
        rendre(true);
      }),
    );
    racine.querySelectorAll<HTMLButtonElement>('[data-horaire]').forEach((b) =>
      b.addEventListener('click', () => {
        const choix = HORAIRES.find((h) => h.id === b.dataset.horaire) ?? null;
        if (choix && choix.id !== horaire?.id && !finAffichee) {
          essais += 1;
          suivre('stats3_horaire', { horaire: choix.id, essai: essais, servis: clientsServis(choix), juste: choix.id === meilleur.id, partie: partieEnCours(mission.id) });
        }
        horaire = choix;
        rendre(true);
        racine.querySelector<HTMLElement>(`[data-horaire="${b.dataset.horaire}"]`)?.focus({ preventScroll: true });
      }),
    );
    racine.querySelector('[data-action="fin"]')?.addEventListener('click', montrerFin);
    if (finAffichee) montrerFin();
  }

  function montrerFin(): void {
    finAffichee = true;
    racine.querySelector('[data-action="fin"]')?.remove();
    const fin: FinDeMission = {
      missionId: mission.id,
      titre: t('stats3.debrief.titre'),
      explication: t('stats3.debrief.texte', { a: modale.debut, b: modale.fin, n: modale.effectif, total, pc: frequence(modale) }),
      conseil: t('stats3.conseil', { a: modale.debut, b: modale.fin, n: modale.effectif }),
      notions: tListe('stats3.notions'),
      reflexion: t('stats3.reflexion'),
      questions: [question('stats3.q1'), question('stats3.q2')],
      etoiles: etoilesStats3(essais),
      duree: duree(),
    };
    const zone = racine.querySelector<HTMLElement>('#zone-fin');
    if (!zone || zone.childElementCount > 0) return;
    zone.innerHTML = htmlFin(fin);
    brancherFin(racine, fin, () => {
      classeChoisie = null;
      horaire = null;
      essais = 0;
      finAffichee = false;
      duree = chrono();
      rendre();
    });
  }

  rendre();
}
