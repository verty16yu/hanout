// Mission Stats 3 « À quelle heure ouvrir ? » : classes, histogramme, classe modale.
import { trouverMission } from '../contenu/missions';
import {
  FREQUENTATION, HEURES_OUVERTURE, HORAIRES, Horaire, classeModale, clientsServis, effectifTotal, frequence, meilleurHoraire,
} from '../economie/histogramme';
import { barreMission } from '../ui/barre';
import { brancherDebrief, htmlDebrief } from '../ui/debrief';
import { ammi } from '../ui/dessins';
import { afficher, echapper } from '../ui/dom';

export function missionStats3(racine: HTMLElement): void {
  const mission = trouverMission('stats-3')!;
  const total = effectifTotal();
  const modale = classeModale();
  const max = modale.effectif;
  let classeChoisie: number | null = null;
  let horaire: Horaire | null = null;
  let debriefAffiche = false;

  function histogramme(): string {
    return `<div class="histo" role="group" aria-label="Histogramme : clients par classe d’une heure, sur 7 jours">
${FREQUENTATION.map((c) => {
  const couvert = horaire ? horaire.heures.includes(c.debut) : false;
  const choisie = classeChoisie === c.debut;
  const cls = ['barre-h', couvert ? 'couvert' : '', choisie ? 'choisie' : '', classeChoisie !== null && c === modale ? 'modale' : ''].join(' ');
  return `<button type="button" class="${cls}" data-action="classe" data-h="${c.debut}" aria-label="De ${c.debut} h à ${c.fin} h : ${c.effectif} clients" ${classeChoisie !== null ? 'disabled' : ''}>
  <span class="n">${c.effectif}</span><span class="b" style="height:${Math.round((c.effectif / max) * 120)}px"></span><span class="h">${c.debut}</span></button>`;
}).join('')}
</div><p class="petit legende">Heure de début de chaque classe d’une heure, de 7 h à 21 h. Total : ${total} passages.</p>`;
  }

  function rendre(garderPosition = false): void {
    const etape = classeChoisie === null ? 1 : 2;
    const bonne = classeChoisie === modale.debut;
    const meilleur = meilleurHoraire();
    afficher(
      racine,
      `<main class="ecran mission">
${barreMission(mission, `Étape ${etape} / 2`)}
<div class="contenu">
  <div class="bulle-ammi">${ammi(40)}<p>${
    etape === 1
      ? 'Voici ton cahier de caisse : tous les passages de la semaine, regroupés par tranche d’une heure. D’abord, <b>touche la classe où il y a eu le plus de clients</b>.'
      : `Tu ne peux ouvrir que <b>${HEURES_OUVERTURE} heures par jour</b>. Lequel de ces horaires sert le plus de clients ?`
  }</p></div>
  <section class="carte">${histogramme()}</section>
  ${
    classeChoisie !== null
      ? `<p class="issue ${bonne ? 'ok' : 'ko'}" role="status">${
          bonne
            ? `Exact : de ${modale.debut} h à ${modale.fin} h, ${modale.effectif} clients, c’est la classe la plus fréquentée.`
            : `Pas tout à fait : la classe la plus haute est ${modale.debut} h – ${modale.fin} h, avec ${modale.effectif} clients. Elle est entourée sur le graphique.`
        }</p>
  <div class="choix-horaires" role="radiogroup" aria-label="Horaires d’ouverture">
    ${HORAIRES.map(
      (h) => `<button type="button" role="radio" class="horaire${horaire?.id === h.id ? ' pris' : ''}" aria-checked="${horaire?.id === h.id}" data-action="horaire" data-id="${h.id}">
      <b>${echapper(h.libelle)}</b><span>${horaire ? `${clientsServis(h)} clients servis sur ${total}` : `${HEURES_OUVERTURE} heures`}</span></button>`,
    ).join('')}
  </div>
  ${
    horaire
      ? horaire.id === meilleur.id
        ? `<p class="issue ok" role="status">Bien vu : ${clientsServis(horaire)} clients sur ${total}. Tu as suivi les deux pics de la journée, le pain du matin et la sortie du travail.</p>
           ${debriefAffiche ? '' : '<button type="button" class="bouton principal grand" data-action="debrief">Voir le débrief</button>'}`
        : `<p class="issue ko" role="status">${clientsServis(horaire)} clients sur ${total}. Regarde où sont les barres les plus hautes : ton horaire laisse de côté un des deux pics. Essaie un autre choix.</p>`
      : ''
  }`
      : ''
  }
  <div id="zone-debrief"></div>
</div>
</main>`,
      { garderPosition },
    );
    racine.querySelectorAll<HTMLButtonElement>('[data-action="classe"]').forEach((b) =>
      b.addEventListener('click', () => {
        classeChoisie = Number(b.dataset.h);
        rendre(true);
      }),
    );
    racine.querySelectorAll<HTMLButtonElement>('[data-action="horaire"]').forEach((b) =>
      b.addEventListener('click', () => {
        horaire = HORAIRES.find((h) => h.id === b.dataset.id) ?? null;
        rendre(true);
      }),
    );
    racine.querySelector('[data-action="debrief"]')?.addEventListener('click', montrerDebrief);
    if (debriefAffiche) montrerDebrief();
  }

  function montrerDebrief(): void {
    debriefAffiche = true;
    racine.querySelector('[data-action="debrief"]')?.remove();
    const d = {
      missionId: mission.id,
      titre: 'Lire un histogramme',
      explication: `L’heure de passage est une <b>variable continue</b> : on la regroupe en <b>classes</b> d’une heure ([7 h ; 8 h[, [8 h ; 9 h[…) et on la représente par un <b>histogramme</b>, avec des barres collées. La <b>classe modale</b> est celle qui a le plus fort effectif : [${modale.debut} h ; ${modale.fin} h[, avec ${modale.effectif} clients sur ${total}, soit ${frequence(modale)} % des passages.`,
      notions: ['Classes', 'Histogramme', 'Classe modale'],
      reflexion: 'Avec des classes de deux heures au lieu d’une, trouverais-tu la même classe modale ? Qu’est-ce qu’on perd en regroupant davantage ?',
      questions: [
        {
          question: 'Pourquoi un histogramme pour ces données ?',
          choix: ['Parce que l’heure est une variable continue regroupée en classes', 'Parce que c’est une variable qualitative', 'Parce qu’il y a plus de dix valeurs', 'Parce que les effectifs sont des nombres entiers'],
          bonne: 0,
          explication: 'Le diagramme en barres sert aux variables qualitatives ou discrètes ; l’histogramme aux variables continues en classes.',
        },
        {
          question: 'La classe modale, c’est…',
          choix: ['La classe qui a l’effectif le plus élevé', 'La classe située au milieu du tableau', 'La classe qui contient la moyenne', 'La dernière classe du tableau'],
          bonne: 0,
          explication: 'Ici, [18 h ; 19 h[ avec 52 clients.',
        },
      ],
    };
    const zone = racine.querySelector<HTMLElement>('#zone-debrief');
    if (!zone) return;
    zone.innerHTML = htmlDebrief(d);
    brancherDebrief(racine, d);
  }

  rendre();
}
