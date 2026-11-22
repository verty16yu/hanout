// Mission Intro 1 « Le premier jour » : rareté, choix, coût d'opportunité.
import { trouverMission } from '../contenu/missions';
import { formaterPrix } from '../economie/monnaie';
import {
  BUDGET_PREMIER_JOUR, PRODUITS, beneficeTotal, coutOpportunite, coutTotal, demandesNonServies, meilleurPanier, peutAjouter,
} from '../economie/premierJour';
import { ville } from '../etat';
import { barreMission } from '../ui/barre';
import { brancherDebrief, htmlDebrief } from '../ui/debrief';
import { ammi } from '../ui/dessins';
import { afficher, echapper } from '../ui/dom';

export function missionIntro1(racine: HTMLElement): void {
  const mission = trouverMission('intro-1')!;
  const monnaie = ville().monnaie;
  const prix = (u: number) => formaterPrix(u, monnaie);
  let choisis: string[] = [];

  function rendreChoix(garderPosition = false): void {
    const depense = coutTotal(choisis);
    const reste = BUDGET_PREMIER_JOUR - depense;
    const pourcent = Math.round((depense / BUDGET_PREMIER_JOUR) * 100);
    afficher(
      racine,
      `<main class="ecran mission">
${barreMission(mission, 'Étape 1 / 2')}
<div class="contenu">
  <div class="bulle-ammi">${ammi(40)}<p>C’est ton premier jour au hanout ! Tu as <b>${prix(BUDGET_PREMIER_JOUR)}</b> pour remplir tes rayons cette semaine. Choisis bien : tu ne pourras pas tout prendre.</p></div>
  <div class="budget" aria-live="polite">
    <div class="budget-ligne"><span>Budget dépensé</span><b>${prix(depense)} / ${prix(BUDGET_PREMIER_JOUR)}</b></div>
    <div class="jauge" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pourcent}" aria-label="Budget dépensé"><span style="width:${pourcent}%"></span></div>
    <p class="petit">Il te reste ${prix(reste)}.</p>
  </div>
  <div class="grille-produits">
    ${PRODUITS.map((p) => {
      const pris = choisis.includes(p.id);
      const possible = peutAjouter(choisis, p.id);
      return `<button type="button" class="produit${pris ? ' pris' : ''}" data-action="produit" data-id="${p.id}" aria-pressed="${pris}" ${!possible ? 'disabled' : ''}>
  <span class="nom">${echapper(p.nom)}</span>
  <span class="ligne">Stock : <b>${prix(p.cout)}</b></span>
  <span class="ligne gain">Bénéfice prévu : <b>${prix(p.benefice)}</b></span>
  <span class="etat">${pris ? '✓ Dans tes rayons' : possible ? 'Ajouter' : 'Budget insuffisant'}</span>
</button>`;
    }).join('')}
  </div>
  <button type="button" class="bouton principal grand" data-action="ouvrir" ${choisis.length === 0 ? 'disabled' : ''}>Ouvrir la semaine</button>
</div>
</main>`,
      { garderPosition },
    );
    racine.querySelectorAll<HTMLButtonElement>('[data-action="produit"]').forEach((b) =>
      b.addEventListener('click', () => {
        const id = b.dataset.id!;
        choisis = choisis.includes(id) ? choisis.filter((x) => x !== id) : [...choisis, id];
        rendreChoix(true);
        racine.querySelector<HTMLElement>(`[data-id="${id}"]`)?.focus({ preventScroll: true });
      }),
    );
    racine.querySelector('[data-action="ouvrir"]')?.addEventListener('click', rendreResultat);
  }

  function rendreResultat(): void {
    const gain = beneficeTotal(choisis);
    const meilleur = meilleurPanier();
    const co = coutOpportunite(choisis);
    const clientsDecus = demandesNonServies(choisis);
    const debrief = {
      missionId: mission.id,
      titre: 'Choisir, c’est renoncer',
      explication: `Tes ${prix(BUDGET_PREMIER_JOUR)} sont limités, mais les envies de tes clients ne s’arrêtent jamais : c’est la <b>rareté</b>, le cœur du problème économique. Tu as donc dû <b>choisir</b>.${co ? ` En prenant ces produits, tu as renoncé notamment <b>${echapper(co.produit.contracte)}</b>, qui t’aurait rapporté ${prix(co.valeur)} : c’est ton <b>coût d’opportunité</b>, la valeur de la meilleure option abandonnée.` : ''} Le meilleur panier possible rapportait ${prix(meilleur.benefice)} ; tu as fait ${prix(gain)}.`,
      notions: ['Rareté', 'Choix', 'Coût d’opportunité'],
      reflexion: 'Si ton budget doublait, la rareté disparaîtrait-elle pour autant ? Pense au jour où le quartier grandit et où les clients réclament de nouveaux produits.',
      questions: [
        {
          question: 'D’où vient le problème économique ?',
          choix: ['Des ressources limitées face à des besoins illimités', 'Du manque de magasins dans le quartier', 'Des prix trop élevés fixés par les commerçants', 'Du fait que les clients ne savent pas ce qu’ils veulent'],
          bonne: 0,
          explication: 'La rareté oblige à choisir : c’est le problème économique fondamental.',
        },
        {
          question: 'Quelles sont les questions fondamentales de l’économie ?',
          choix: ['Quoi produire, comment produire, pour qui produire', 'Où vendre, quand vendre, à quel prix', 'Combien gagner, combien dépenser, combien épargner', 'Qui commande, qui obéit, qui paie'],
          bonne: 0,
          explication: 'Toute société, comme ton hanout, doit y répondre parce que les ressources sont rares.',
        },
      ],
    };
    afficher(
      racine,
      `<main class="ecran mission">
${barreMission(mission, 'Étape 2 / 2')}
<div class="contenu">
  <section class="resultat" aria-labelledby="titre-resultat">
    <p class="petit">Ta première semaine</p>
    <h2 id="titre-resultat" class="gros-chiffre">+${prix(gain)}</h2>
    <p>de bénéfice, avec ${choisis.length} produit${choisis.length > 1 ? 's' : ''} en rayon.</p>
  </section>
  ${clientsDecus.length ? `<section class="fil" aria-label="Dans le quartier cette semaine"><p class="fil-titre"><span class="direct" aria-hidden="true"></span>Dans le quartier cette semaine</p>
    <ul>${clientsDecus.map((x) => `<li><b>${echapper(x.client)}</b> ${echapper(x.phrase)}</li>`).join('')}</ul></section>` : ''}
  ${htmlDebrief(debrief)}
</div>
</main>`,
    );
    brancherDebrief(racine, debrief);
  }

  rendreChoix();
}
