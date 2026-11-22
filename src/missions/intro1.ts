// Mission Intro 1 « Le premier jour » : rareté, choix, coût d'opportunité.
import { trouverMission } from '../contenu/missions';
import {
  BUDGET_PREMIER_JOUR, PRODUITS, beneficeTotal, coutOpportunite, coutTotal, demandesNonServies, meilleurPanier, peutAjouter,
} from '../economie/premierJour';
import { t, tListe } from '../i18n';
import { barreMission } from '../ui/barre';
import { FinDeMission, brancherFin, htmlFin, question } from '../ui/debrief';
import { ammi } from '../ui/dessins';
import { afficher } from '../ui/dom';
import { prix } from '../ui/format';

/** Étoiles (grand public) : part du meilleur bénéfice possible. */
export function etoilesIntro1(gain: number, meilleur: number): number {
  const r = meilleur > 0 ? gain / meilleur : 0;
  return r >= 0.95 ? 3 : r >= 0.8 ? 2 : 1;
}

export function missionIntro1(racine: HTMLElement): void {
  const mission = trouverMission('intro-1')!;
  let choisis: string[] = [];

  function rendreChoix(garderPosition = false): void {
    const depense = coutTotal(choisis);
    const reste = BUDGET_PREMIER_JOUR - depense;
    const pourcent = Math.round((depense / BUDGET_PREMIER_JOUR) * 100);
    afficher(
      racine,
      `<main class="ecran mission">
${barreMission(mission, t('barre.etape', { a: 1, b: 2 }))}
<div class="mise-en-page">
  <div class="col-gauche">
    <div class="bulle-ammi">${ammi(40)}<p>${t('intro1.consigne', { budget: prix(BUDGET_PREMIER_JOUR) })}</p></div>
    <div class="budget" aria-live="polite">
      <div class="budget-ligne"><span>${t('intro1.depense')}</span><b>${prix(depense)} / ${prix(BUDGET_PREMIER_JOUR)}</b></div>
      <div class="jauge" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pourcent}" aria-label="${t('intro1.depense')}"><span style="width:${pourcent}%"></span></div>
      <p class="petit">${t('intro1.reste', { reste: prix(reste) })}</p>
    </div>
    <button type="button" class="bouton principal grand seulement-large" data-action="ouvrir" ${choisis.length === 0 ? 'disabled' : ''}>${t('intro1.ouvrir')}</button>
  </div>
  <div class="col-droite">
    <div class="grille-produits">
      ${PRODUITS.map((p) => {
        const pris = choisis.includes(p.id);
        const possible = peutAjouter(choisis, p.id);
        return `<button type="button" class="produit${pris ? ' pris' : ''}" data-id="${p.id}" aria-pressed="${pris}" ${!possible ? 'disabled' : ''}>
  <span class="nom">${t(`produit.${p.id}`)}</span>
  <span class="ligne">${t('intro1.stock', { x: prix(p.cout) })}</span>
  <span class="ligne gain">${t('intro1.benefice', { x: prix(p.benefice) })}</span>
  <span class="etat">${pris ? t('intro1.pris') : possible ? t('intro1.ajouter') : t('intro1.insuffisant')}</span>
</button>`;
      }).join('')}
    </div>
    <button type="button" class="bouton principal grand seulement-etroit" data-action="ouvrir" ${choisis.length === 0 ? 'disabled' : ''}>${t('intro1.ouvrir')}</button>
  </div>
</div>
</main>`,
      { garderPosition },
    );
    racine.querySelectorAll<HTMLButtonElement>('.produit').forEach((b) =>
      b.addEventListener('click', () => {
        const id = b.dataset.id!;
        choisis = choisis.includes(id) ? choisis.filter((x) => x !== id) : [...choisis, id];
        rendreChoix(true);
        racine.querySelector<HTMLElement>(`[data-id="${id}"]`)?.focus({ preventScroll: true });
      }),
    );
    racine.querySelectorAll('[data-action="ouvrir"]').forEach((b) => b.addEventListener('click', rendreResultat));
  }

  function rendreResultat(): void {
    const gain = beneficeTotal(choisis);
    const meilleur = meilleurPanier();
    const co = coutOpportunite(choisis);
    const manques = demandesNonServies(choisis);
    const fin: FinDeMission = {
      missionId: mission.id,
      titre: t('intro1.debrief.titre'),
      explication: t('intro1.debrief.texte', {
        budget: prix(BUDGET_PREMIER_JOUR),
        renonce: co ? t(`produit.${co.produit.id}.renonce`) : '—',
        valeur: co ? prix(co.valeur) : '—',
        meilleur: prix(meilleur.benefice),
        gain: prix(gain),
      }),
      conseil: t('intro1.conseil', { meilleur: prix(meilleur.benefice), gain: prix(gain) }),
      notions: tListe('intro1.notions'),
      reflexion: t('intro1.reflexion'),
      questions: [question('intro1.q1'), question('intro1.q2')],
      etoiles: etoilesIntro1(gain, meilleur.benefice),
    };
    afficher(
      racine,
      `<main class="ecran mission">
${barreMission(mission, t('barre.etape', { a: 2, b: 2 }))}
<div class="mise-en-page">
  <div class="col-gauche">
    <section class="resultat" aria-labelledby="titre-resultat">
      <p class="petit">${t('intro1.semaine')}</p>
      <h2 id="titre-resultat" class="gros-chiffre">+${prix(gain)}</h2>
      <p>${t('intro1.resume', { n: choisis.length })}</p>
    </section>
    ${
      manques.length
        ? `<section class="fil" aria-label="${t('intro1.fil')}"><p class="fil-titre"><span class="direct" aria-hidden="true"></span>${t('intro1.fil')}</p>
      <ul>${manques.map((x) => `<li>${t(x.pluriel ? 'intro1.manquePluriel' : 'intro1.manque', { qui: t(`perso.${x.personnage}`), quoi: t(`produit.${x.produit}.partitif`) })}</li>`).join('')}</ul></section>`
        : ''
    }
  </div>
  <div class="col-droite">${htmlFin(fin)}</div>
</div>
</main>`,
    );
    brancherFin(racine, fin, () => {
      choisis = [];
      rendreChoix();
    });
  }

  rendreChoix();
}
